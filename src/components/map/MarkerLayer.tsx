/**
 * ============================================================================
 * TACTICAL MAP MARKERS OVERLAY (R8)
 * ============================================================================
 *
 * WHY THIS EXISTS:
 * Renders high-contrast tactical markers for Origin, Destination, Waypoints,
 * and Hazards on the synthetic map canvas.
 *
 * SAFETY INVARIANT:
 * Hazard markers strictly use warning amber / hazard tokens (#F2603C / #FFB020)
 * and NEVER use SOS Red (#FF1F3D).
 */

import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { MapMarker } from '../../domain/mapOverlay';
import { Text } from '../primitives/Text';
import { useTheme } from '../../design/ThemeProvider';
import { primitive } from '../../design/tokens';

export interface MarkerLayerProps {
  markers: MapMarker[];
  onMarkerPress?: (marker: MapMarker) => void;
}

export const MarkerLayer: React.FC<MarkerLayerProps> = ({ markers, onMarkerPress }) => {
  const { mode, colors } = useTheme();
  const isDayGlare = mode === 'dayGlare';

  const renderMarkerIcon = (marker: MapMarker) => {
    switch (marker.kind) {
      case 'origin':
        return (
          <View style={[styles.markerPin, { backgroundColor: primitive.color.volt[400], borderColor: primitive.color.graphite[900] }]}>
            <Text variant="mono" style={styles.originIconText}>
              A
            </Text>
          </View>
        );
      case 'destination':
        return (
          <View style={[styles.markerPin, { backgroundColor: primitive.color.cyan[400], borderColor: primitive.color.graphite[900] }]}>
            <Text variant="mono" style={styles.destinationIconText}>
              B
            </Text>
          </View>
        );
      case 'waypoint':
        return (
          <View style={[styles.waypointPin, { backgroundColor: colors.surfaceElevated, borderColor: primitive.color.cyan[400] }]}>
            <View style={[styles.waypointDot, { backgroundColor: primitive.color.cyan[400] }]} />
          </View>
        );
      case 'hazard':
      default:
        return (
          // Strictly warning/danger amber, never SOS red
          <View style={[styles.hazardPin, { backgroundColor: primitive.color.route.hazard, borderColor: colors.surface }]}>
            <Text variant="mono" style={styles.hazardIconText}>
              ⚠️
            </Text>
          </View>
        );
    }
  };

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      {markers.map((marker) => (
        <TouchableOpacity
          key={marker.id}
          style={[
            styles.markerWrapper,
            {
              left: `${marker.position.x}%`,
              top: `${marker.position.y}%`,
            },
          ]}
          onPress={() => onMarkerPress && onMarkerPress(marker)}
          disabled={!onMarkerPress}
          accessible
          accessibilityRole="button"
          accessibilityLabel={`${marker.kind} marker: ${marker.label}. ${marker.description || ''}`}
        >
          {renderMarkerIcon(marker)}
          <View
            style={[
              styles.calloutLabel,
              {
                backgroundColor: isDayGlare ? primitive.color.snow[0] : colors.surfaceElevated,
                borderColor: marker.kind === 'hazard' ? primitive.color.route.hazard : colors.border,
              },
            ]}
          >
            <Text variant="mono" style={{ color: colors.text, fontSize: 10, fontWeight: '700' }}>
              {marker.label}
            </Text>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  markerWrapper: {
    position: 'absolute',
    alignItems: 'center',
    transform: [{ translateX: -16 }, { translateY: -32 }],
    zIndex: 15,
  },
  markerPin: {
    width: 24,
    height: 24,
    borderRadius: primitive.radius.full,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  waypointPin: {
    width: 18,
    height: 18,
    borderRadius: primitive.radius.xs,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    transform: [{ rotate: '45deg' }],
  },
  waypointDot: {
    width: 6,
    height: 6,
    borderRadius: primitive.radius.full,
  },
  hazardPin: {
    width: 26,
    height: 26,
    borderRadius: primitive.radius.full,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  originIconText: {
    color: primitive.color.graphite[950],
    fontSize: 12,
    fontWeight: '900',
  },
  destinationIconText: {
    color: primitive.color.graphite[950],
    fontSize: 12,
    fontWeight: '900',
  },
  hazardIconText: {
    fontSize: 13,
  },
  calloutLabel: {
    marginTop: 2,
    paddingHorizontal: primitive.spacing[2],
    paddingVertical: 1,
    borderRadius: primitive.radius.xs,
    borderWidth: 0.5,
  },
});
