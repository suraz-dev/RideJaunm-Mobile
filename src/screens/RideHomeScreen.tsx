/**
 * ============================================================================
 * RIDE HOME SCREEN (R7 / R8 INTEGRATION)
 * ============================================================================
 *
 * Coordinates:
 * 1. Topographic MapSurface with synthetic route and marker overlays.
 * 2. 3-Way RouteModeSelector (Straight / Curvy / Supercurvy) with Terai restriction support.
 * 3. Tactical MapControls (Compass, Pitch, Recenter, Layers, Zoom).
 * 4. TelemetryHUD and in-ride Start/End navigation controls.
 * 5. Permanent, unobstructed OpenStreetMap attribution.
 */

import React, { useState, useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { MapSurface } from '../components/map/MapSurface';
import { RouteLayer } from '../components/map/RouteLayer';
import { MarkerLayer } from '../components/map/MarkerLayer';
import { MapControls } from '../components/map/MapControls';
import { LayersSheet } from '../components/map/LayersSheet';
import { TelemetryHUD } from '../components/composites/TelemetryHUD';
import { RouteModeSelector, RouteMode } from '../components/composites/RouteModeSelector';
import { Badge } from '../components/primitives/Badge';
import { Button } from '../components/primitives/Button';
import { useTheme } from '../design/ThemeProvider';
import { useAppState } from '../state/AppStateContext';
import { MapRenderInput } from '../domain/map';
import { RouteLayerInput, MapMarker } from '../domain/mapOverlay';
import {
  curvyRouteTraceFixture,
  supercurvyRouteTraceFixture,
  straightRouteTraceFixture,
  alternativeRouteTraceFixture,
  hazardDetourTraceFixture,
  nepalMapMarkersFixture,
} from '../fixtures/routeOverlays.fixture';
import { primitive } from '../design/tokens';

export const RideHomeScreen: React.FC = () => {
  const { colors } = useTheme();
  const { activeRoute, availableRoutes, setActiveRoute, connectionState } = useAppState();

  // Local navigation & fixture map controls state (R8)
  const [isNavigating, setIsNavigating] = useState(false);
  const [bearingDegrees, setBearingDegrees] = useState(0);
  const [pitchDegrees, setPitchDegrees] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(12.5);
  const [isLayersOpen, setIsLayersOpen] = useState(false);
  const [showHazardsLayer, setShowHazardsLayer] = useState(true);
  const [showTopographyLayer, setShowTopographyLayer] = useState(true);

  const handleSelectMode = (mode: RouteMode) => {
    const found = availableRoutes.find((r) => r.profile === mode);
    if (found) setActiveRoute(found);
  };

  const topHazard = activeRoute.hazards[0];

  // Map control callbacks
  const handleResetCompass = () => setBearingDegrees(0);
  const handleTogglePitch = () => setPitchDegrees((prev) => (prev === 0 ? 60 : 0));
  const handleRecenter = () => {
    setBearingDegrees(0);
    setPitchDegrees(0);
    setZoomLevel(12.5);
  };
  const handleZoomIn = () => setZoomLevel((prev) => Math.min(prev + 0.5, 18.0));
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(prev - 0.5, 8.0));

  // Derive active RouteLayerInput from selected RouteCandidate mode
  const activeRouteTrace: RouteLayerInput = useMemo(() => {
    switch (activeRoute.profile) {
      case 'supercurvy':
        return supercurvyRouteTraceFixture;
      case 'straight':
        return straightRouteTraceFixture;
      case 'curvy':
      default:
        return curvyRouteTraceFixture;
    }
  }, [activeRoute.profile]);

  // Combine visible route layers (selected + alternative + hazard segment if enabled)
  const visibleRoutes: RouteLayerInput[] = useMemo(() => {
    const list: RouteLayerInput[] = [
      { ...activeRouteTrace, isSelected: true },
      { ...alternativeRouteTraceFixture, isSelected: false },
    ];
    if (showHazardsLayer) {
      list.push(hazardDetourTraceFixture);
    }
    return list;
  }, [activeRouteTrace, showHazardsLayer]);

  // Filter markers based on layers toggle
  const visibleMarkers: MapMarker[] = useMemo(() => {
    if (showHazardsLayer) {
      return nepalMapMarkersFixture;
    }
    return nepalMapMarkersFixture.filter((m) => m.kind !== 'hazard');
  }, [showHazardsLayer]);

  // Derive MapRenderInput dynamically from active route and connection state
  const mapRenderInput: MapRenderInput = useMemo(() => {
    const isOffline = connectionState.mode === 'deadZone' || connectionState.mode === 'meshOnly';
    return {
      camera: {
        center: {
          latitude: activeRoute.origin.coordinates[1],
          longitude: activeRoute.origin.coordinates[0],
        },
        zoom: zoomLevel,
        bearingDegrees,
        pitchDegrees: isNavigating ? 35 : pitchDegrees,
      },
      networkPolicy: isOffline ? 'cache_only' : 'online',
      baseState: 'fresh',
      coverage: {
        isCovered: true,
      },
      provenance: {
        source: 'OpenStreetMap Vector Contours (Synthetic Fixture)',
        sourceVersion: 'OSM-NP-2026.08.15',
        licence: 'Open Database Licence (ODbL) 1.0',
        attribution: '© OpenStreetMap contributors',
      },
    };
  }, [activeRoute, connectionState, zoomLevel, bearingDegrees, pitchDegrees, isNavigating]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Visual Topographic MapSurface with Overlays (R7/R8) */}
      <MapSurface
        input={mapRenderInput}
        showTopography={showTopographyLayer}
        style={styles.mapArea}
      >
        <RouteLayer routes={visibleRoutes} />
        <MarkerLayer markers={visibleMarkers} />
      </MapSurface>

      {/* Floating Tactical Map Controls (Compass, Pitch, Recenter, Layers, Zoom) */}
      <MapControls
        bearingDegrees={bearingDegrees}
        pitchDegrees={pitchDegrees}
        onResetCompass={handleResetCompass}
        onTogglePitch={handleTogglePitch}
        onRecenter={handleRecenter}
        onOpenLayers={() => setIsLayersOpen(true)}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
      />

      {/* Layers Bottom Sheet */}
      <LayersSheet
        visible={isLayersOpen}
        onClose={() => setIsLayersOpen(false)}
        showHazards={showHazardsLayer}
        onToggleHazards={setShowHazardsLayer}
        showTopography={showTopographyLayer}
        onToggleTopography={setShowTopographyLayer}
      />

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
          bearingDeg={bearingDegrees || connectionState.gps.headingDeg}
          gpsStatus={connectionState.gps.lockState === 'locked' ? 'locked' : connectionState.gps.lockState === 'acquiring' ? 'acquiring' : 'lost'}
          networkStatus={connectionState.mode === 'online' ? 'online' : connectionState.mode === 'meshOnly' ? 'mesh' : 'offline'}
          style={styles.hudOverlay}
        />

        <View style={styles.routeSelectorWrapper}>
          <RouteModeSelector
            selectedMode={activeRoute.profile}
            onSelectMode={handleSelectMode}
            disabledModes={activeRoute.isSupercurvyRestrictedInTerai ? ['supercurvy'] : []}
            disabledReason={
              activeRoute.isSupercurvyRestrictedInTerai
                ? 'Supercurvy disabled: Terai flat corridor has no mountain bends'
                : undefined
            }
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
    left: primitive.spacing[3],
    right: 72, // Leave room for MapControls button bar on right
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
