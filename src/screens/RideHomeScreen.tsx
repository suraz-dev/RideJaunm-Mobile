import React, { useState, useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { MapSurface } from '../components/map/MapSurface';
import { TelemetryHUD } from '../components/composites/TelemetryHUD';
import { RouteModeSelector, RouteMode } from '../components/composites/RouteModeSelector';
import { Badge } from '../components/primitives/Badge';
import { Button } from '../components/primitives/Button';
import { useTheme } from '../design/ThemeProvider';
import { useAppState } from '../state/AppStateContext';
import { MapRenderInput } from '../domain/map';
import { primitive } from '../design/tokens';

export const RideHomeScreen: React.FC = () => {
  const { colors } = useTheme();
  const { activeRoute, availableRoutes, setActiveRoute, connectionState } = useAppState();
  const [isNavigating, setIsNavigating] = useState(false);

  const handleSelectMode = (mode: RouteMode) => {
    const found = availableRoutes.find((r) => r.profile === mode);
    if (found) setActiveRoute(found);
  };

  const topHazard = activeRoute.hazards[0];

  // Derive MapRenderInput dynamically from active route and connection state (R7)
  const mapRenderInput: MapRenderInput = useMemo(() => {
    const isOffline = connectionState.mode === 'deadZone' || connectionState.mode === 'meshOnly';
    return {
      camera: {
        center: {
          latitude: activeRoute.origin.coordinates[1],
          longitude: activeRoute.origin.coordinates[0],
        },
        zoom: 12.5,
        bearingDegrees: connectionState.gps.headingDeg,
        pitchDegrees: isNavigating ? 35 : 0,
      },
      networkPolicy: isOffline ? 'cache_only' : 'online',
      baseState: 'fresh',
      coverage: {
        isCovered: true,
      },
      provenance: {
        source: 'OpenStreetMap Vector Contours v4.2',
        sourceVersion: 'OSM-NP-2026.08.15',
        licence: 'Open Database Licence (ODbL) 1.0',
        attribution: '© OpenStreetMap contributors',
      },
    };
  }, [activeRoute, connectionState, isNavigating]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Visual Topographic MapSurface (R7) */}
      <MapSurface input={mapRenderInput} style={styles.mapArea} />

      {/* Floating Top In-Ride Warning */}
      {topHazard && (
        <View style={styles.hazardBanner}>
          <Badge
            label={`⚠️ ${topHazard.locationName}: ${topHazard.description}`}
            variant="warning"
            size="md"
          />
        </View>
      )}

      {/* Bottom Tactical Floating Console */}
      <View style={styles.bottomConsole}>
        <TelemetryHUD
          speedKmh={isNavigating ? 68 : 0}
          altitudeMeters={connectionState.gps.altitudeMeters}
          bearingDeg={connectionState.gps.headingDeg}
          gpsStatus={connectionState.gps.lockState === 'locked' ? 'locked' : connectionState.gps.lockState === 'acquiring' ? 'acquiring' : 'lost'}
          networkStatus={connectionState.mode === 'online' ? 'online' : connectionState.mode === 'meshOnly' ? 'mesh' : 'offline'}
          style={styles.hudOverlay}
        />

        <View style={styles.routeSelectorWrapper}>
          <RouteModeSelector
            selectedMode={activeRoute.profile}
            onSelectMode={handleSelectMode}
          />
        </View>

        <View style={styles.actionRow}>
          <Button
            label={isNavigating ? 'END RIDE' : 'START RIDE (राइड सुरु)'}
            onPress={() => setIsNavigating(!isNavigating)}
            variant={isNavigating ? 'danger' : 'primary'}
            inRide
            style={styles.startBtn}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  mapArea: {
    flex: 1,
  },
  hazardBanner: {
    position: 'absolute',
    top: 56,
    paddingHorizontal: primitive.spacing[4],
    width: '100%',
    alignItems: 'center',
    zIndex: 15,
  },
  bottomConsole: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    zIndex: 20,
  },
  hudOverlay: {
    marginBottom: primitive.spacing[3],
  },
  routeSelectorWrapper: {
    marginBottom: primitive.spacing[3],
  },
  actionRow: {
    flexDirection: 'row',
  },
  startBtn: {
    flex: 1,
  },
});
