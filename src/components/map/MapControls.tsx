/**
 * ============================================================================
 * TACTICAL MAP CONTROLS OVERLAY (R16 REFINED)
 * ============================================================================
 *
 * Floating tactical button rail for camera rotation, 3D pitch, rider follow,
 * recentering, map layer toggles, and zoom control.
 *
 * ACCESSIBILITY & TOUCH TARGET INVARIANTS:
 * 1. Minimum touch target of 48 dp (primitive.size.targetMin).
 * 2. Follow button is enabled ONLY when GPS is 'locked'.
 * 3. Does not obscure OpenStreetMap attribution at bottom-left.
 * 4. Crisp 2px outlined vector icons (no emojis/raw glyphs).
 */

import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text } from '../primitives/Text';
import { Icon } from '../primitives/Icon';
import { useTheme } from '../../design/ThemeProvider';
import { primitive } from '../../design/tokens';

export interface MapControlsProps {
  bearingDegrees: number;
  pitchDegrees: number;
  isFollowActive?: boolean;
  isFollowDisabled?: boolean;
  onResetCompass: () => void;
  onTogglePitch: () => void;
  onToggleFollow?: () => void;
  onRecenter: () => void;
  onOpenLayers: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
}

export const MapControls: React.FC<MapControlsProps> = ({
  bearingDegrees,
  pitchDegrees,
  isFollowActive = false,
  isFollowDisabled = false,
  onResetCompass,
  onTogglePitch,
  onToggleFollow,
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
            backgroundColor: isDayGlare ? colors.surfaceElevated : colors.surface,
            borderColor: isCompassRotated ? primitive.color.volt[400] : colors.border,
          },
        ]}
        onPress={onResetCompass}
        accessible
        accessibilityRole="button"
        accessibilityLabel={`Compass: Heading ${bearingDegrees} degrees. Tap to reset orientation to North.`}
      >
        <View style={{ transform: [{ rotate: `${-bearingDegrees}deg` }] }}>
          <Icon
            name="compass"
            size={20}
            color={isCompassRotated ? primitive.color.volt[400] : colors.text}
            strokeWidth={2}
          />
        </View>
      </TouchableOpacity>

      {/* 2. 3D / 2D Perspective Pitch Toggle */}
      <TouchableOpacity
        style={[
          styles.controlBtn,
          {
            backgroundColor: isPitchActive
              ? primitive.color.volt[400]
              : isDayGlare
              ? colors.surfaceElevated
              : colors.surface,
            borderColor: isPitchActive ? primitive.color.volt[400] : colors.border,
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
            fontSize: 11,
          }}
        >
          {isPitchActive ? '3D' : '2D'}
        </Text>
      </TouchableOpacity>

      {/* 3. Follow Rider Position Toggle (Enabled only for locked GPS) */}
      <TouchableOpacity
        style={[
          styles.controlBtn,
          {
            backgroundColor: isFollowActive
              ? primitive.color.volt[400]
              : isFollowDisabled
              ? colors.surfaceCard
              : isDayGlare
              ? colors.surfaceElevated
              : colors.surface,
            borderColor: isFollowActive ? primitive.color.volt[400] : colors.border,
          },
        ]}
        onPress={onToggleFollow}
        disabled={isFollowDisabled}
        accessible
        accessibilityRole="button"
        accessibilityState={{ disabled: isFollowDisabled, selected: isFollowActive }}
        accessibilityLabel={
          isFollowDisabled
            ? 'Follow mode disabled: GPS is not locked'
            : isFollowActive
            ? 'Follow mode active: Camera centered on rider position'
            : 'Tap to enable camera follow on rider position'
        }
      >
        <Icon
          name="navigation"
          size={18}
          color={
            isFollowDisabled
              ? colors.textSubtle
              : isFollowActive
              ? primitive.color.graphite[950]
              : primitive.color.volt[400]
          }
          strokeWidth={2.5}
        />
      </TouchableOpacity>

      {/* 4. Layers Sheet Trigger */}
      <TouchableOpacity
        style={[
          styles.controlBtn,
          {
            backgroundColor: isDayGlare ? colors.surfaceElevated : colors.surface,
            borderColor: colors.border,
          },
        ]}
        onPress={onOpenLayers}
        accessible
        accessibilityRole="button"
        accessibilityLabel="Map Layers: Tap to toggle topographic and hazard overlays."
      >
        <Icon name="layers" size={18} color={colors.text} strokeWidth={2} />
      </TouchableOpacity>

      {/* 5. Recenter to Route Origin */}
      <TouchableOpacity
        style={[
          styles.controlBtn,
          {
            backgroundColor: isDayGlare ? colors.surfaceElevated : colors.surface,
            borderColor: colors.border,
          },
        ]}
        onPress={onRecenter}
        accessible
        accessibilityRole="button"
        accessibilityLabel="Recenter map to route start coordinate."
      >
        <Icon name="locate" size={18} color={primitive.color.cyan[400]} strokeWidth={2} />
      </TouchableOpacity>

      {/* 6. Zoom In / Zoom Out Group */}
      <View
        style={[
          styles.zoomGroup,
          {
            backgroundColor: isDayGlare ? colors.surfaceElevated : colors.surface,
            borderColor: colors.border,
          },
        ]}
      >
        <TouchableOpacity
          style={styles.zoomHalfBtn}
          onPress={onZoomIn}
          accessible
          accessibilityRole="button"
          accessibilityLabel="Zoom In"
        >
          <Icon name="plus" size={18} color={colors.text} strokeWidth={2.5} />
        </TouchableOpacity>

        <View style={[styles.zoomDivider, { backgroundColor: colors.borderSubtle }]} />

        <TouchableOpacity
          style={styles.zoomHalfBtn}
          onPress={onZoomOut}
          accessible
          accessibilityRole="button"
          accessibilityLabel="Zoom Out"
        >
          <Icon name="minus" size={18} color={colors.text} strokeWidth={2.5} />
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
    shadowColor: primitive.color.graphite[950],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  zoomGroup: {
    width: primitive.size.targetMin,
    borderRadius: primitive.radius.md,
    borderWidth: 1,
    alignItems: 'center',
    overflow: 'hidden',
    shadowColor: primitive.color.graphite[950],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  zoomHalfBtn: {
    width: primitive.size.targetMin,
    height: primitive.size.targetMin,
    justifyContent: 'center',
    alignItems: 'center',
  },
  zoomDivider: {
    width: '80%',
    height: 1,
  },
});
