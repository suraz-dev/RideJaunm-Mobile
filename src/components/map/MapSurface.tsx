/**
 * ============================================================================
 * TACTICAL GEOSPATIAL MAP SURFACE COMPONENT (R7 / R8)
 * ============================================================================
 *
 * WHY THIS EXISTS:
 * Reusable visual map surface that renders deterministic topographic terrain,
 * camera telemetry, coverage boundaries, and provenance disclosures.
 *
 * It is completely decoupled from native map SDKs and accepts only typed
 * `MapRenderInput` view models and optional overlay children (routes, markers, controls).
 *
 * DESIGN TOKEN & SAFETY INVARIANTS:
 * 1. ZERO raw hex or unexplained RGBA values: all styling is derived from
 *    `useTheme()` semantic colors and `primitive.color` design tokens.
 * 2. OpenStreetMap Attribution (`© OpenStreetMap contributors`) is displayed
 *    permanently in the bottom-left corner across EVERY base state.
 * 3. Stale/Partial/Unavailable states are visually explicit and truthfully
 *    described as fixture/simulation states with no real network/download claims.
 * 4. In `dayGlare` sunlight mode, surfaces render with solid high-contrast
 *    borders and backdrops instead of washed-out translucent glass.
 */

import React, { ReactNode } from 'react';
import { View, StyleSheet, ActivityIndicator, StyleProp, ViewStyle } from 'react-native';
import Svg, { Rect, Path, Defs, Pattern, Line, Circle } from 'react-native-svg';
import { MapRenderInput } from '../../domain/map';
import { Text } from '../primitives/Text';
import { Badge } from '../primitives/Badge';
import { Button } from '../primitives/Button';
import { useTheme } from '../../design/ThemeProvider';
import { primitive } from '../../design/tokens';

export interface MapSurfaceProps {
  input: MapRenderInput;
  showTopography?: boolean;
  onRetry?: () => void;
  style?: StyleProp<ViewStyle>;
  children?: ReactNode;
}

export const MapSurface: React.FC<MapSurfaceProps> = ({
  input,
  showTopography = true,
  onRetry,
  style,
  children,
}) => {
  const { mode, colors } = useTheme();
  const { camera, baseState, networkPolicy, coverage, provenance } = input;

  const isDayGlare = mode === 'dayGlare';

  // Semantic token-based colors across 4 themes
  const gridLineColor = isDayGlare
    ? primitive.color.snow[300]
    : colors.borderSubtle;

  const contourColor = isDayGlare
    ? primitive.color.snow[600]
    : colors.interactive;

  const centerCrosshairColor = isDayGlare
    ? primitive.color.snow[900]
    : colors.interactive;

  const hatchStrokeColor = isDayGlare
    ? primitive.color.semantic.danger
    : primitive.color.semantic.warning;

  const formatCoordinate = (lat: number, lng: number) => {
    const latCard = lat >= 0 ? 'N' : 'S';
    const lngCard = lng >= 0 ? 'E' : 'W';
    return `${latCard} ${Math.abs(lat).toFixed(4)}° · ${lngCard} ${Math.abs(lng).toFixed(4)}°`;
  };

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.surface },
        style,
      ]}
      accessible
      accessibilityLabel={`Map surface: ${baseState} state, centered at ${camera.center.latitude}, ${camera.center.longitude}. ${provenance.attribution}`}
    >
      {/* 1. Tactical Topographic Vector Canvas */}
      <View style={StyleSheet.absoluteFill}>
        <Svg height="100%" width="100%">
          <Defs>
            {/* Grid Mesh Pattern */}
            <Pattern id="gridPattern" width="40" height="40" patternUnits="userSpaceOnUse">
              <Path d="M 40 0 L 0 0 0 40" fill="none" stroke={gridLineColor} strokeWidth="1" strokeOpacity={0.6} />
            </Pattern>
            {/* Hatched Pattern for Partial / Uncached Coverage Areas */}
            <Pattern id="hatchedMissingPattern" width="16" height="16" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
              <Line x1="0" y1="0" x2="0" y2="16" stroke={hatchStrokeColor} strokeWidth="2.5" strokeOpacity={0.5} />
            </Pattern>
          </Defs>

          {/* Base Grid Background */}
          <Rect width="100%" height="100%" fill="url(#gridPattern)" />

          {/* Topographic Contour Lines Simulation (Controlled by showTopography prop) */}
          {showTopography && (
            <>
              <Path
                d="M -20 180 C 80 120, 180 240, 280 160 C 340 100, 420 180, 500 140"
                fill="none"
                stroke={contourColor}
                strokeWidth="1.5"
                strokeOpacity={isDayGlare ? 0.35 : 0.25}
              />
              <Path
                d="M -20 280 C 60 220, 160 340, 260 260 C 360 180, 440 260, 520 220"
                fill="none"
                stroke={contourColor}
                strokeWidth="1.5"
                strokeOpacity={isDayGlare ? 0.35 : 0.25}
              />
              <Path
                d="M -20 380 C 90 320, 190 440, 290 360 C 370 300, 450 380, 520 340"
                fill="none"
                stroke={contourColor}
                strokeWidth="1.5"
                strokeOpacity={isDayGlare ? 0.35 : 0.25}
              />
            </>
          )}

          {/* Center Map Crosshair Marker */}
          <Circle cx="50%" cy="48%" r="4" fill={centerCrosshairColor} />
          <Line x1="50%" y1="44%" x2="50%" y2="52%" stroke={centerCrosshairColor} strokeWidth="1.5" />
          <Line x1="46%" y1="48%" x2="54%" y2="48%" stroke={centerCrosshairColor} strokeWidth="1.5" />
        </Svg>
      </View>

      {/* 2. Embedded Overlay Children (Route Polylines, Markers) */}
      {baseState !== 'error' && baseState !== 'unavailable' && children}

      {/* 3. Partial Missing-Coverage Wireframe / Hatched Region */}
      {baseState === 'partial' && (
        <View style={styles.partialOverlayContainer}>
          <Svg height="100%" width="100%">
            <Rect
              x="10%"
              y="12%"
              width="80%"
              height="35%"
              fill="url(#hatchedMissingPattern)"
              stroke={primitive.color.semantic.warning}
              strokeWidth="1.5"
              strokeDasharray="6, 4"
            />
          </Svg>
          <View style={[styles.partialNoticeBox, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}>
            <Badge label="⚠️ PARTIAL OFFLINE COVERAGE" variant="warning" size="sm" />
            <Text variant="bodySmall" style={{ color: colors.text, marginTop: primitive.spacing[1], fontWeight: '600' }}>
              {coverage?.missingAreaLabel || 'Missing high altitude sector'}
            </Text>
            <Text variant="mono" style={{ color: colors.textSubtle, fontSize: 11, marginTop: primitive.spacing[1] }}>
              Synthetic base coverage rendered · Simulated missing sector boundary
            </Text>
          </View>
        </View>
      )}

      {/* 4. Stale Cache Disclosure Banner */}
      {baseState === 'stale' && (
        <View style={[styles.staleNoticeBox, { backgroundColor: colors.surfaceElevated, borderColor: primitive.color.semantic.warning }]}>
          <View style={styles.staleHeaderRow}>
            <Badge label="⚠️ STALE MAP CACHE" variant="warning" size="sm" />
            <Text variant="mono" style={{ color: colors.textSubtle, fontSize: 11 }}>
              {provenance.sourceVersion}
            </Text>
          </View>
          <Text variant="bodySmall" style={{ color: colors.text, marginTop: primitive.spacing[1] }}>
            Simulated stale map fixture. Demonstrates expired cache presentation.
          </Text>
        </View>
      )}

      {/* 5. Loading State Spinner & Overlay */}
      {baseState === 'loading' && (
        <View style={[styles.fallbackCenterCard, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}>
          <ActivityIndicator size="small" color={colors.interactive} />
          <Text variant="mono" style={{ color: colors.text, marginTop: primitive.spacing[2], fontWeight: '700' }}>
            INITIALIZING FIXTURE MAP SURFACE...
          </Text>
          <Text variant="bodySmall" muted style={{ marginTop: primitive.spacing[1] }}>
            Loading synthetic topographic contours
          </Text>
        </View>
      )}

      {/* 6. Unavailable / Error State Fallback Panel */}
      {(baseState === 'unavailable' || baseState === 'error') && (
        <View
          style={[
            styles.fallbackCenterCard,
            {
              backgroundColor: colors.surfaceElevated,
              borderColor: baseState === 'error' ? primitive.color.semantic.danger : colors.border,
            },
          ]}
        >
          <Badge
            label={baseState === 'error' ? 'RENDER FAULT' : networkPolicy === 'cache_only' ? 'SIMULATED UNCACHED SECTOR' : 'MAP UNAVAILABLE'}
            variant={baseState === 'error' ? 'danger' : 'neutral'}
            size="md"
          />
          <Text variant="h3" style={{ color: colors.text, marginTop: primitive.spacing[2], textAlign: 'center' }}>
            {baseState === 'error'
              ? 'Simulated Render Fault'
              : 'Simulated Uncached Sector'}
          </Text>
          <Text variant="bodySmall" muted style={{ marginTop: primitive.spacing[1], textAlign: 'center', marginHorizontal: primitive.spacing[2] }}>
            {baseState === 'error'
              ? 'Demonstrates deterministic map error state for test verification.'
              : coverage?.missingAreaLabel
              ? `Demonstrates unavailable sector state for ${coverage.missingAreaLabel}.`
              : 'Demonstrates unavailable sector state with no local cache.'}
          </Text>
          {onRetry && (
            <Button
              label="RETRY FIXTURE RENDER"
              onPress={onRetry}
              variant="secondary"
              style={{ marginTop: primitive.spacing[3], minHeight: primitive.size.targetMin }}
            />
          )}
        </View>
      )}

      {/* 7. Top Telemetry Pill (Coordinates & Zoom) */}
      <View
        style={[
          styles.topTelemetryPill,
          {
            backgroundColor: colors.surfaceElevated,
            borderColor: colors.border,
          },
        ]}
      >
        <Text variant="mono" style={{ color: colors.interactive, fontSize: 11, fontWeight: '700' }}>
          {formatCoordinate(camera.center.latitude, camera.center.longitude)}
        </Text>
        <Text variant="mono" style={{ color: colors.textSubtle, fontSize: 10, marginTop: 1 }}>
          Zoom {camera.zoom.toFixed(1)} · Heading {camera.bearingDegrees}° · {networkPolicy === 'cache_only' ? 'Cache-Only Policy (Simulated)' : 'Online Policy (Simulated)'}
        </Text>
      </View>

      {/* 8. Mandatory OpenStreetMap Attribution (Always Visible Bottom-Left) */}
      <View
        style={[
          styles.attributionTag,
          {
            backgroundColor: colors.surfaceElevated,
            borderColor: colors.borderSubtle,
          },
        ]}
        accessible
        accessibilityRole="link"
        accessibilityLabel={`${provenance.attribution}. ${provenance.licence}. Version: ${provenance.sourceVersion}`}
      >
        <Text variant="mono" style={{ color: colors.textSubtle, fontSize: 9 }}>
          {provenance.attribution} · ODbL
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: 'hidden',
    position: 'relative',
  },
  topTelemetryPill: {
    position: 'absolute',
    top: primitive.spacing[3],
    alignSelf: 'center',
    paddingHorizontal: primitive.spacing[3],
    paddingVertical: primitive.spacing[1],
    borderRadius: primitive.radius.md,
    borderWidth: 1,
    alignItems: 'center',
    zIndex: 10,
  },
  staleNoticeBox: {
    position: 'absolute',
    top: 56,
    left: primitive.spacing[4],
    right: primitive.spacing[4],
    padding: primitive.spacing[3],
    borderRadius: primitive.radius.md,
    borderWidth: 1,
    zIndex: 10,
  },
  staleHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  partialOverlayContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 5,
  },
  partialNoticeBox: {
    position: 'absolute',
    top: 56,
    left: primitive.spacing[4],
    right: primitive.spacing[4],
    padding: primitive.spacing[3],
    borderRadius: primitive.radius.md,
    borderWidth: 1,
    zIndex: 10,
  },
  fallbackCenterCard: {
    position: 'absolute',
    top: '32%',
    left: primitive.spacing[5],
    right: primitive.spacing[5],
    padding: primitive.spacing[4],
    borderRadius: primitive.radius.lg,
    borderWidth: 1,
    alignItems: 'center',
    zIndex: 20,
  },
  attributionTag: {
    position: 'absolute',
    bottom: primitive.spacing[2],
    left: primitive.spacing[2],
    paddingHorizontal: primitive.spacing[2],
    paddingVertical: primitive.spacing[1],
    borderRadius: primitive.radius.xs,
    borderWidth: 0.5,
    zIndex: 10,
  },
});
