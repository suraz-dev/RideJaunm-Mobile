/**
 * ============================================================================
 * RIDE HOME SCREEN (R7 / R8 / R9 INTEGRATION)
 * ============================================================================
 *
 * Coordinates:
 * 1. Topographic MapSurface with synthetic route and marker overlays.
 * 2. 3-Way RouteModeSelector (Straight / Curvy / Supercurvy) with Terai restriction support.
 * 3. Tactical MapControls (Compass, Pitch, Follow, Recenter, Layers, Zoom).
 * 4. Truthful TelemetryHUD supporting all 4 GPS states (Locked, Acquiring, Stale, Lost).
 * 5. Local Ride Mode lifecycle (idle ➔ active_fixture ➔ ended).
 * 6. Permanent, unobstructed OpenStreetMap attribution.
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
import { RideModeState } from '../domain/telemetryPresentation';
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

  // Local Ride Mode state (R9: idle ➔ active_fixture ➔ ended)
  const [rideMode, setRideMode] = useState<RideModeState>('idle');

  // Local fixture camera and map controls state (R8/R9)
  const [bearingDegrees, setBearingDegrees] = useState(0);
  const [pitchDegrees, setPitchDegrees] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(12.5);
  const [isFollowActive, setIsFollowActive] = useState(false);
  const [isLayersOpen, setIsLayersOpen] = useState(false);
  const [showHazardsLayer, setShowHazardsLayer] = useState(true);
  const [showTopographyLayer, setShowTopographyLayer] = useState(true);

  const isGpsLocked = connectionState.gps.lockState === 'locked';
  const isGpsStale = connectionState.gps.lockState === 'stale';

  const handleSelectMode = (mode: RouteMode) => {
    const found = availableRoutes.find((r) => r.profile === mode);
    if (found) setActiveRoute(found);
  };

  const topHazard = activeRoute.hazards[0];

  // Ride Mode lifecycle transition
  const handleToggleRideMode = () => {
    if (rideMode === 'idle') {
      setRideMode('active_fixture');
      setIsFollowActive(isGpsLocked);
    } else if (rideMode === 'active_fixture') {
      setRideMode('ended');
      setIsFollowActive(false);
    } else {
      setRideMode('idle');
    }
  };

  // Map control callbacks
  const handleResetCompass = () => setBearingDegrees(0);
  const handleTogglePitch = () => setPitchDegrees((prev) => (prev === 0 ? 60 : 0));
  const handleToggleFollow = () => {
    if (isGpsLocked) {
      setIsFollowActive((prev) => !prev);
    }
  };
  const handleRecenter = () => {
    setIsFollowActive(false);
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

  // Markers layer: Origin, Destination, Waypoint, Hazard + Rider Marker (when locked or stale)
  const visibleMarkers: MapMarker[] = useMemo(() => {
    const list: MapMarker[] = nepalMapMarkersFixture.filter((m) =>
      showHazardsLayer ? true : m.kind !== 'hazard'
    );

    // Add rider position marker ONLY when GPS is locked or stale
    if (isGpsLocked || isGpsStale) {
      list.push({
        id: 'marker-rider-self',
        kind: 'rider',
        position: { x: 38, y: 58 }, // Mid-route fixture position
        label: isGpsStale ? 'Last Known Position' : 'You (तपाईं)',
        labelNepali: isGpsStale ? 'पछिल्लो ज्ञात स्थान' : 'तपाईं',
        description: `Heading ${connectionState.gps.headingDeg}° · ${connectionState.gps.altitudeMeters}m ASL`,
        headingDeg: connectionState.gps.headingDeg,
        isStale: isGpsStale,
      });
    }

    return list;
  }, [showHazardsLayer, isGpsLocked, isGpsStale, connectionState.gps]);

  // Derive MapRenderInput dynamically from active route, connection state, and follow mode
  const mapRenderInput: MapRenderInput = useMemo(() => {
    const isOffline = connectionState.mode === 'deadZone' || connectionState.mode === 'meshOnly';
    const cameraCenter = isFollowActive
      ? {
          latitude: connectionState.gps.latitude,
          longitude: connectionState.gps.longitude,
        }
      : {
          latitude: activeRoute.origin.coordinates[1],
          longitude: activeRoute.origin.coordinates[0],
        };

    return {
      camera: {
        center: cameraCenter,
        zoom: zoomLevel,
        bearingDegrees: isFollowActive ? connectionState.gps.headingDeg : bearingDegrees,
        pitchDegrees: rideMode === 'active_fixture' ? 35 : pitchDegrees,
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
  }, [
    activeRoute,
    connectionState,
    zoomLevel,
    bearingDegrees,
    pitchDegrees,
    rideMode,
    isFollowActive,
  ]);

  // Calculate speed: available ONLY during active ride with locked GPS
  const liveSpeedKmh =
    rideMode === 'active_fixture' && isGpsLocked ? connectionState.gps.speedKmh || 68 : undefined;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Visual Topographic MapSurface with Overlays (R7/R8/R9) */}
      <MapSurface
        input={mapRenderInput}
        showTopography={showTopographyLayer}
        style={styles.mapArea}
      >
        <RouteLayer routes={visibleRoutes} />
        <MarkerLayer markers={visibleMarkers} />
      </MapSurface>

      {/* Floating Tactical Map Controls (Compass, Pitch, Follow, Recenter, Layers, Zoom) */}
      <MapControls
        bearingDegrees={bearingDegrees}
        pitchDegrees={pitchDegrees}
        isFollowActive={isFollowActive}
        isFollowDisabled={!isGpsLocked}
        onResetCompass={handleResetCompass}
        onTogglePitch={handleTogglePitch}
        onToggleFollow={handleToggleFollow}
        onRecenter={handleRecenter}
        onOpenLayers={() => setIsLayersOpen(false || true)}
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
          speedKmh={liveSpeedKmh}
          altitudeMeters={connectionState.gps.altitudeMeters}
          bearingDeg={connectionState.gps.headingDeg}
          gpsStatus={connectionState.gps.lockState}
          networkStatus={
            connectionState.mode === 'online'
              ? 'online'
              : connectionState.mode === 'meshOnly'
              ? 'mesh'
              : 'offline'
          }
          sourceLabel={
            isGpsStale
              ? 'Last Known Fix (3m ago · ±25m)'
              : isGpsLocked
              ? 'Local GPS Fix (±3.5m)'
              : undefined
          }
          observationAgeSeconds={isGpsStale ? 180 : 0}
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
            label={
              rideMode === 'active_fixture'
                ? 'END RIDE (राइड समाप्त)'
                : rideMode === 'ended'
                ? 'RIDE ENDED · RESET (सम्पन्न)'
                : 'START RIDE (राइड सुरु)'
            }
            onPress={handleToggleRideMode}
            variant={
              rideMode === 'active_fixture'
                ? 'danger'
                : rideMode === 'ended'
                ? 'secondary'
                : 'primary'
            }
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
