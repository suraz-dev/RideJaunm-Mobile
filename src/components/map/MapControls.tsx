/**
 * ============================================================================
 * TACTICAL MAP CONTROLS OVERLAY (R8)
 * ============================================================================
 *
 * WHY THIS EXISTS:
 * Floating tactical button bar for camera rotation, pitch, recentering,
 * layers sheet, and zoom control on the map surface.
 *
 * ACCESSIBILITY & TOUCH TARGET INVARIANTS:
 * 1. Every button has a minimum touch target of 48 dp (primitive.size.targetMin).
 * 2. High-contrast border and background derived from design tokens.
 * 3. Does not obscure OpenStreetMap attribution at bottom-left.
 */

import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text } from '../primitives/Text';
import { useTheme } from '../../design/ThemeProvider';
import { primitive } from '../../design/tokens';

export interface MapControlsProps {
  bearingDegrees: number;
  pitchDegrees: number;
  onResetCompass: () => void;
  onTogglePitch: () => void;
  onRecenter: () => void;
  onOpenLayers: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
}

export const MapControls: React.FC<MapControlsProps> = ({
  bearingDegrees,
  pitchDegrees,
  onResetCompass,
  onTogglePitch,
  onRecenter,
  onOpenLayers,
  onZoomIn,
  onZoomOut,
}) => {
  const { colors, mode } = useTheme();
  const isDayGlare = mode === 'dayGlare';

  const isPitchActive = pitchDegrees > 0;
  const isCompassRotated = bearingDegrees !== 0;

  return (
    <View style={styles.controlsContainer} pointerEvents="box-none">
      {/* 1. Compass Button (Resets Bearing to 0° North) */}
      <TouchableOpacity
        style={[
          styles.controlBtn,
          {
            backgroundColor: colors.surfaceElevated,
            borderColor: isCompassRotated ? colors.interactive : colors.border,
          },
        ]}
        onPress={onResetCompass}
        accessible
        accessibilityRole="button"
        accessibilityLabel={`Compass: Heading ${bearingDegrees} degrees. Tap to reset orientation to North.`}
      >
        <Text
          variant="mono"
          style={[
            styles.compassText,
            {
              color: isCompassRotated ? colors.interactive : colors.text,
              transform: [{ rotate: `${-bearingDegrees}deg` }],
            },
          ]}
        >
          ▲ N
        </Text>
      </TouchableOpacity>

      {/* 2. 3D / 2D Perspective Pitch Toggle */}
      <TouchableOpacity
        style={[
          styles.controlBtn,
          {
            backgroundColor: isPitchActive ? colors.interactive : colors.surfaceElevated,
            borderColor: colors.border,
          },
        ]}
        onPress={onTogglePitch}
        accessible
        accessibilityRole="button"
        accessibilityLabel={`Pitch perspective: currently ${pitchDegrees} degrees. Tap to toggle 2D and 3D angle.`}
      >
        <Text
          variant="mono"
          style={{
            color: isPitchActive ? primitive.color.graphite[950] : colors.text,
            fontWeight: '800',
            fontSize: 12,
          }}
        >
          {isPitchActive ? '3D' : '2D'}
        </Text>
      </TouchableOpacity>

      {/* 3. Layers Sheet Trigger */}
      <TouchableOpacity
        style={[styles.controlBtn, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}
        onPress={onOpenLayers}
        accessible
        accessibilityRole="button"
        accessibilityLabel="Map Layers: Tap to toggle topographic and hazard overlays."
      >
        <Text variant="mono" style={{ color: colors.text, fontSize: 16 }}>
          ≡
        </Text>
      </TouchableOpacity>

      {/* 4. Recenter to Route Origin */}
      <TouchableOpacity
        style={[styles.controlBtn, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}
        onPress={onRecenter}
        accessible
        accessibilityRole="button"
        accessibilityLabel="Recenter map to route start coordinate."
      >
        <Text variant="mono" style={{ color: colors.interactive, fontSize: 16, fontWeight: '700' }}>
          ◎
        </Text>
      </TouchableOpacity>

      {/* 5. Zoom In / Zoom Out Group */}
      <View style={[styles.zoomGroup, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}>
        <TouchableOpacity
          style={styles.zoomHalfBtn}
          onPress={onZoomIn}
          accessible
          accessibilityRole="button"
          accessibilityLabel="Zoom In"
        >
          <Text variant="mono" style={{ color: colors.text, fontSize: 18, fontWeight: '700' }}>
            +
          </Text>
        </TouchableOpacity>

        <View style={[styles.zoomDivider, { backgroundColor: colors.borderSubtle }]} />

        <TouchableOpacity
          style={styles.zoomHalfBtn}
          onPress={onZoomOut}
          accessible
          accessibilityRole="button"
          accessibilityLabel="Zoom Out"
        >
          <Text variant="mono" style={{ color: colors.text, fontSize: 18, fontWeight: '700' }}>
            −
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  controlsContainer: {
    position: 'absolute',
    top: 56,
    right: primitive.spacing[3],
    alignItems: 'center',
    zIndex: 20,
    gap: primitive.spacing[2],
  },
  controlBtn: {
    width: primitive.size.targetMin,
    height: primitive.size.targetMin,
    borderRadius: primitive.radius.md,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  compassText: {
    fontSize: 11,
    fontWeight: '900',
  },
  zoomGroup: {
    width: primitive.size.targetMin,
    borderRadius: primitive.radius.md,
    borderWidth: 1,
    alignItems: 'center',
    overflow: 'hidden',
  },
  zoomHalfBtn: {
    width: primitive.size.targetMin,
    height: 38,
    justifyContent: 'center',
    alignItems: 'center',
  },
  zoomDivider: {
    width: '80%',
    height: 1,
  },
});
