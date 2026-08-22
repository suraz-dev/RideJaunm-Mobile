/**
 * ============================================================================
 * RIDE HOME SCREEN (R16 REFINED)
 * ============================================================================
 *
 * Map-led tactical Himalayan instrument:
 * 1. Dominant Topographic MapSurface (~70% visible canvas).
 * 2. Floating vertical MapControls rail (Compass, 3D Pitch, Follow, Recenter, Layers, Zoom).
 * 3. Compact motorcycle cluster TelemetryHUD (Speed, Elevation, Compass, Fix).
 * 4. 3-Way RouteModeSelector (Straight / Curvy / Supercurvy).
 * 5. 56px in-ride tactile CTA with Volt accent.
 * 6. Non-obstructed OpenStreetMap attribution.
 */

import React, { useState, useMemo, useEffect } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { MapSurface } from '../components/map/MapSurface';
import { RouteLayer } from '../components/map/RouteLayer';
import { MarkerLayer } from '../components/map/MarkerLayer';
import { MapControls } from '../components/map/MapControls';
import { LayersSheet } from '../components/map/LayersSheet';
import { TelemetryHUD } from '../components/composites/TelemetryHUD';
import { RouteModeSelector, RouteMode } from '../components/composites/RouteModeSelector';
import { Badge } from '../components/primitives/Badge';
import { Button } from '../components/primitives/Button';
import { Icon } from '../components/primitives/Icon';
import { useTheme } from '../design/ThemeProvider';
import { useAppState } from '../state/AppStateContext';
import { MapBaseState, MapCoverage, MapRenderInput } from '../domain/map';
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

export interface RideHomeScreenProps {
  mapBaseStateOverride?: MapBaseState;
  mapCoverageOverride?: MapCoverage;
}

export const RideHomeScreen: React.FC<RideHomeScreenProps> = ({
  mapBaseStateOverride,
  mapCoverageOverride,
}) => {
  const { colors } = useTheme();
  const { activeRoute, availableRoutes, setActiveRoute, connectionState } = useAppState();

  // Local Ride Mode state (idle ➔ active_fixture ➔ ended)
  const [rideMode, setRideMode] = useState<RideModeState>('idle');

  // Local fixture camera and map controls state
  const [bearingDegrees, setBearingDegrees] = useState(0);
  const [pitchDegrees, setPitchDegrees] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(12.5);
  const [isFollowRequested, setIsFollowRequested] = useState(false);
  const [isLayersOpen, setIsLayersOpen] = useState(false);
  const [showHazardsLayer, setShowHazardsLayer] = useState(true);
  const [showTopographyLayer, setShowTopographyLayer] = useState(true);

  const isGpsLocked = connectionState.gps.lockState === 'locked';
  const isGpsStale = connectionState.gps.lockState === 'stale';

  // Follow eligibility: Disarm active follow if GPS loses lock
  const effectiveFollowActive = isFollowRequested && isGpsLocked;

  useEffect(() => {
    if (!isGpsLocked && isFollowRequested) {
      setIsFollowRequested(false);
    }
  }, [isGpsLocked, isFollowRequested]);

  const handleSelectMode = (mode: RouteMode) => {
    const found = availableRoutes.find((r) => r.profile === mode);
    if (found) setActiveRoute(found);
  };

  const topHazard = activeRoute.hazards[0];

  // Ride Mode lifecycle transition
  const handleToggleRideMode = () => {
    if (rideMode === 'idle') {
      setRideMode('active_fixture');
      setIsFollowRequested(isGpsLocked);
    } else if (rideMode === 'active_fixture') {
      setRideMode('ended');
      setIsFollowRequested(false);
    } else {
      setRideMode('idle');
    }
  };

  // Map control callbacks
  const handleResetCompass = () => setBearingDegrees(0);
  const handleTogglePitch = () => setPitchDegrees((prev) => (prev === 0 ? 60 : 0));
  const handleToggleFollow = () => {
    if (isGpsLocked) {
      setIsFollowRequested((prev) => !prev);
    }
  };
  const handleRecenter = () => {
    setIsFollowRequested(false);
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

  // Markers layer: Origin, Destination, Waypoint, Hazard + Rider Marker
  const visibleMarkers: MapMarker[] = useMemo(() => {
    const list: MapMarker[] = nepalMapMarkersFixture.filter((m) =>
      showHazardsLayer ? true : m.kind !== 'hazard'
    );

    if (isGpsLocked || isGpsStale) {
      list.push({
        id: 'marker-rider-self',
        kind: 'rider',
        position: { x: 38, y: 58 },
        label: isGpsStale ? 'Last Known Position' : 'You (तपाईं)',
        labelNepali: isGpsStale ? 'पछिल्लो ज्ञात स्थान' : 'तपाईं',
        description: `Heading ${connectionState.gps.headingDeg}° · ${connectionState.gps.altitudeMeters}m ASL`,
        headingDeg: connectionState.gps.headingDeg,
        isStale: isGpsStale,
      });
    }

    return list;
  }, [showHazardsLayer, isGpsLocked, isGpsStale, connectionState.gps]);

  const mapRenderInput: MapRenderInput = useMemo(() => {
    const isOffline = connectionState.mode === 'deadZone' || connectionState.mode === 'meshOnly';
    const cameraCenter = effectiveFollowActive
      ? {
          latitude: connectionState.gps.latitude,
          longitude: connectionState.gps.longitude,
        }
      : {
          latitude: activeRoute.origin.coordinates[1],
          longitude: activeRoute.origin.coordinates[0],
        };

    const effectiveBaseState: MapBaseState =
      mapBaseStateOverride || (connectionState.mode === 'deadZone' ? 'stale' : 'fresh');

    const effectiveCoverage: MapCoverage =
      mapCoverageOverride || { isCovered: true };

    return {
      camera: {
        center: cameraCenter,
        zoom: zoomLevel,
        bearingDegrees: effectiveFollowActive ? connectionState.gps.headingDeg : bearingDegrees,
        pitchDegrees: rideMode === 'active_fixture' ? 35 : pitchDegrees,
      },
      networkPolicy: isOffline ? 'cache_only' : 'online',
      baseState: effectiveBaseState,
      coverage: effectiveCoverage,
      provenance: {
        source: 'OpenStreetMap Vector Contours',
        sourceVersion: 'OSM-NP-2026.08',
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
    effectiveFollowActive,
    mapBaseStateOverride,
    mapCoverageOverride,
  ]);

  const liveSpeedKmh =
    rideMode === 'active_fixture' && isGpsLocked
      ? typeof connectionState.gps.speedKmh === 'number'
        ? connectionState.gps.speedKmh
        : undefined
      : undefined;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Topographic Map Surface */}
      <MapSurface
        input={mapRenderInput}
        showTopography={showTopographyLayer}
        style={styles.mapArea}
      >
        <RouteLayer routes={visibleRoutes} />
        <MarkerLayer markers={visibleMarkers} />
      </MapSurface>

      {/* Floating Tactical Map Controls */}
      <MapControls
        bearingDegrees={bearingDegrees}
        pitchDegrees={pitchDegrees}
        isFollowActive={effectiveFollowActive}
        isFollowDisabled={!isGpsLocked}
        onResetCompass={handleResetCompass}
        onTogglePitch={handleTogglePitch}
        onToggleFollow={handleToggleFollow}
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

      {/* Floating Top In-Ride Hazard Notice */}
      {topHazard && (
        <View style={styles.hazardBanner}>
          <Badge
            label={`${topHazard.locationName}: ${topHazard.description}`}
            variant="warning"
            size="md"
            icon={<Icon name="alert-triangle" size={14} color={primitive.color.semantic.warning} />}
          />
        </View>
      )}

      {/* Bottom Floating Instrument Console */}
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
            icon={
              rideMode === 'active_fixture' ? (
                <Icon name="x-circle" size={18} color="#FFFFFF" />
              ) : rideMode === 'ended' ? (
                <Icon name="refresh" size={18} color={colors.text} />
              ) : (
                <Icon name="navigation" size={18} color={primitive.color.graphite[950]} strokeWidth={2.5} />
              )
            }
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
    top: Platform.OS === 'ios' ? 56 : 40,
    left: primitive.spacing[3],
    right: 72,
    zIndex: 15,
  },
  bottomConsole: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 20 : 12,
    left: primitive.spacing[3],
    right: primitive.spacing[3],
    zIndex: 20,
  },
  hudOverlay: {
    marginBottom: primitive.spacing[2],
  },
  routeSelectorWrapper: {
    marginBottom: primitive.spacing[2],
  },
  actionRow: {
    flexDirection: 'row',
  },
  startBtn: {
    flex: 1,
  },
});
