/**
 * ============================================================================
 * TACTICAL GEOSPATIAL MAP SURFACE COMPONENT (R7)
 * ============================================================================
 *
 * WHY THIS EXISTS:
 * Reusable visual map surface that renders deterministic topographic terrain,
 * camera telemetry, coverage boundaries, and provenance disclosures.
 *
 * It is completely decoupled from native map SDKs and accepts only typed
 * `MapRenderInput` view models.
 *
 * SAFETY & ATTRIBUTION INVARIANTS:
 * 1. OpenStreetMap Attribution (`© OpenStreetMap contributors`) is displayed
 *    permanently in the bottom-left corner across EVERY base state.
 * 2. Stale/Partial/Unavailable states are visually explicit and never present
 *    missing or expired cache as fresh data.
 * 3. In `dayGlare` sunlight mode, surfaces render with solid high-contrast
 *    borders and backdrops instead of washed-out translucent glass.
 */

import React from 'react';
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
  onRetry?: () => void;
  style?: StyleProp<ViewStyle>;
}

export const MapSurface: React.FC<MapSurfaceProps> = ({ input, onRetry, style }) => {
  const { mode, colors } = useTheme();
  const { camera, baseState, networkPolicy, coverage, provenance } = input;

  const isDayGlare = mode === 'dayGlare';
  const gridLineColor = isDayGlare ? 'rgba(0, 0, 0, 0.12)' : 'rgba(255, 255, 255, 0.08)';
  const contourColor = isDayGlare ? 'rgba(0, 0, 0, 0.20)' : 'rgba(180, 255, 57, 0.15)'; // Subtle volt contour in dark
  const centerCrosshairColor = isDayGlare ? primitive.color.graphite[900] : primitive.color.volt[400];

  const formatCoordinate = (lat: number, lng: number) => {
    const latCard = lat >= 0 ? 'N' : 'S';
    const lngCard = lng >= 0 ? 'E' : 'W';
    return `${latCard} ${Math.abs(lat).toFixed(4)}° · ${lngCard} ${Math.abs(lng).toFixed(4)}°`;
  };

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: isDayGlare ? '#F0F4F2' : colors.surface },
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
              <Path d="M 40 0 L 0 0 0 40" fill="none" stroke={gridLineColor} strokeWidth="1" />
            </Pattern>
            {/* Hatched Pattern for Partial / Uncached Coverage Areas */}
            <Pattern id="hatchedMissingPattern" width="16" height="16" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
              <Line x1="0" y1="0" x2="0" y2="16" stroke={isDayGlare ? 'rgba(239, 68, 68, 0.4)' : 'rgba(255, 31, 61, 0.45)'} strokeWidth="3" />
            </Pattern>
          </Defs>

          {/* Base Grid Background */}
          <Rect width="100%" height="100%" fill="url(#gridPattern)" />

          {/* Topographic Contour Lines Simulation */}
          <Path
            d="M -20 180 C 80 120, 180 240, 280 160 C 340 100, 420 180, 500 140"
            fill="none"
            stroke={contourColor}
            strokeWidth="1.5"
          />
          <Path
            d="M -20 280 C 60 220, 160 340, 260 260 C 360 180, 440 260, 520 220"
            fill="none"
            stroke={contourColor}
            strokeWidth="1.5"
          />
          <Path
            d="M -20 380 C 90 320, 190 440, 290 360 C 370 300, 450 380, 520 340"
            fill="none"
            stroke={contourColor}
            strokeWidth="1.5"
          />

          {/* Center Map Crosshair Marker */}
          <Circle cx="50%" cy="48%" r="4" fill={centerCrosshairColor} />
          <Line x1="50%" y1="44%" x2="50%" y2="52%" stroke={centerCrosshairColor} strokeWidth="1.5" />
          <Line x1="46%" y1="48%" x2="54%" y2="48%" stroke={centerCrosshairColor} strokeWidth="1.5" />
        </Svg>
      </View>

      {/* 2. Partial Missing-Coverage Wireframe / Hatched Region */}
      {baseState === 'partial' && (
        <View style={styles.partialOverlayContainer}>
          <Svg height="100%" width="100%">
            <Rect
              x="10%"
              y="12%"
              width="80%"
              height="35%"
              fill="url(#hatchedMissingPattern)"
              stroke={isDayGlare ? primitive.color.semantic.danger : primitive.color.semantic.danger}
              strokeWidth="1.5"
              strokeDasharray="6, 4"
            />
          </Svg>
          <View style={[styles.partialNoticeBox, { backgroundColor: isDayGlare ? '#FFFFFF' : colors.surfaceElevated, borderColor: colors.border }]}>
            <Badge label="⚠️ PARTIAL OFFLINE COVERAGE" variant="warning" size="sm" />
            <Text variant="bodySmall" style={{ color: colors.text, marginTop: 4, fontWeight: '600' }}>
              {coverage?.missingAreaLabel || 'Missing high altitude sector'}
            </Text>
            <Text variant="mono" style={{ color: colors.textSubtle, fontSize: 11, marginTop: 2 }}>
              Cached valley base rendered · High pass tiles uncached
            </Text>
          </View>
        </View>
      )}

      {/* 3. Stale Cache Disclosure Banner */}
      {baseState === 'stale' && (
        <View style={[styles.staleNoticeBox, { backgroundColor: isDayGlare ? '#FFFFFF' : colors.surfaceElevated, borderColor: primitive.color.semantic.warning }]}>
          <View style={styles.staleHeaderRow}>
            <Badge label="⚠️ STALE MAP CACHE" variant="warning" size="sm" />
            <Text variant="mono" style={{ color: colors.textSubtle, fontSize: 11 }}>
              {provenance.sourceVersion}
            </Text>
          </View>
          <Text variant="bodySmall" style={{ color: colors.text, marginTop: 4 }}>
            Local vector cache expired. Road geometry may not reflect recent monsoon washouts.
          </Text>
        </View>
      )}

      {/* 4. Loading State Spinner & Overlay */}
      {baseState === 'loading' && (
        <View style={[styles.fallbackCenterCard, { backgroundColor: isDayGlare ? '#FFFFFF' : colors.surfaceElevated, borderColor: colors.border }]}>
          <ActivityIndicator size="small" color={isDayGlare ? primitive.color.graphite[900] : primitive.color.volt[400]} />
          <Text variant="mono" style={{ color: colors.text, marginTop: 8, fontWeight: '700' }}>
            INITIALIZING VECTOR TILES...
          </Text>
          <Text variant="bodySmall" muted style={{ marginTop: 2 }}>
            Loading topographic elevation contours
          </Text>
        </View>
      )}

      {/* 5. Unavailable / Error State Fallback Panel */}
      {(baseState === 'unavailable' || baseState === 'error') && (
        <View style={[styles.fallbackCenterCard, { backgroundColor: isDayGlare ? '#FFFFFF' : colors.surfaceElevated, borderColor: baseState === 'error' ? primitive.color.semantic.danger : colors.border }]}>
          <Badge
            label={baseState === 'error' ? 'RENDER FAULT' : networkPolicy === 'cache_only' ? 'OFFLINE SECTOR UNCACHED' : 'MAP UNAVAILABLE'}
            variant={baseState === 'error' ? 'danger' : 'neutral'}
            size="md"
          />
          <Text variant="h3" style={{ color: colors.text, marginTop: 8, textAlign: 'center' }}>
            {baseState === 'error'
              ? 'Unable to Render Vector Mesh'
              : 'Offline Map Not Cached for Sector'}
          </Text>
          <Text variant="bodySmall" muted style={{ marginTop: 4, textAlign: 'center', marginHorizontal: 8 }}>
            {baseState === 'error'
              ? 'Local storage IO read fault or corrupt tile headers detected.'
              : coverage?.missingAreaLabel
              ? `No cached map pack found for ${coverage.missingAreaLabel}. Connect to cellular to download.`
              : 'No offline map pack cached for this Himalayan coordinate.'}
          </Text>
          {onRetry && (
            <Button
              label="RETRY VECTOR RENDER"
              onPress={onRetry}
              variant="secondary"
              style={{ marginTop: 12, minHeight: 48 }}
            />
          )}
        </View>
      )}

      {/* 6. Top Telemetry Pill (Coordinates & Zoom) */}
      <View style={[styles.topTelemetryPill, { backgroundColor: isDayGlare ? 'rgba(255, 255, 255, 0.92)' : 'rgba(11, 15, 14, 0.85)', borderColor: colors.border }]}>
        <Text variant="mono" style={{ color: isDayGlare ? primitive.color.graphite[900] : primitive.color.volt[400], fontSize: 11, fontWeight: '700' }}>
          {formatCoordinate(camera.center.latitude, camera.center.longitude)}
        </Text>
        <Text variant="mono" style={{ color: colors.textSubtle, fontSize: 10, marginTop: 1 }}>
          Zoom {camera.zoom.toFixed(1)} · Heading {camera.bearingDegrees}° · {networkPolicy === 'cache_only' ? 'Offline Cache' : 'Online Vector'}
        </Text>
      </View>

      {/* 7. Mandatory OpenStreetMap Attribution (Always Visible Bottom-Left) */}
      <View
        style={[
          styles.attributionTag,
          {
            backgroundColor: isDayGlare ? 'rgba(255, 255, 255, 0.90)' : 'rgba(0, 0, 0, 0.75)',
            borderColor: isDayGlare ? 'rgba(0, 0, 0, 0.15)' : 'rgba(255, 255, 255, 0.12)',
          },
        ]}
        accessible
        accessibilityRole="link"
        accessibilityLabel={`${provenance.attribution}. ${provenance.licence}. Version: ${provenance.sourceVersion}`}
      >
        <Text variant="mono" style={{ color: isDayGlare ? primitive.color.graphite[800] : primitive.color.graphite[300], fontSize: 9 }}>
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
    top: 12,
    alignSelf: 'center',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: primitive.radius.md,
    borderWidth: 1,
    alignItems: 'center',
    zIndex: 10,
  },
  staleNoticeBox: {
    position: 'absolute',
    top: 56,
    left: 16,
    right: 16,
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
    left: 16,
    right: 16,
    padding: primitive.spacing[3],
    borderRadius: primitive.radius.md,
    borderWidth: 1,
    zIndex: 10,
  },
  fallbackCenterCard: {
    position: 'absolute',
    top: '32%',
    left: 20,
    right: 20,
    padding: primitive.spacing[4],
    borderRadius: primitive.radius.lg,
    borderWidth: 1,
    alignItems: 'center',
    zIndex: 20,
  },
  attributionTag: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: primitive.radius.xs,
    borderWidth: 0.5,
    zIndex: 10,
  },
});
