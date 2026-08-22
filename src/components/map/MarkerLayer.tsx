/**
 * ============================================================================
 * FIXTURE MAP MARKER LAYER OVERLAY (R16 REFINED)
 * ============================================================================
 *
 * Renders tactical markers for:
 * 1. Origin ('origin')
 * 2. Destination ('destination')
 * 3. Intermediate Waypoints ('waypoint')
 * 4. Monsoon / Landslide Hazards ('hazard') - using vector icons
 * 5. Current Rider Position ('rider') - with GPS stale halo & heading orientation
 */

import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { MapMarker } from '../../domain/mapOverlay';
import { Text } from '../primitives/Text';
import { Icon } from '../primitives/Icon';
import { useTheme } from '../../design/ThemeProvider';
import { primitive } from '../../design/tokens';

export interface MarkerLayerProps {
  markers: MapMarker[];
  onMarkerPress?: (marker: MapMarker) => void;
}

export const MarkerLayer: React.FC<MarkerLayerProps> = ({
  markers,
  onMarkerPress,
}) => {
  const { colors, mode } = useTheme();
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
      case 'rider':
        return (
          <View style={styles.riderContainer}>
            {/* Accuracy Halo */}
            <View
              style={[
                styles.riderHalo,
                {
                  borderColor: marker.isStale ? primitive.color.semantic.warning : primitive.color.volt[400],
                  backgroundColor: marker.isStale
                    ? isDayGlare ? primitive.color.snow[300] : colors.surfaceCard
                    : isDayGlare ? primitive.color.snow[0] : colors.surfaceElevated,
                },
              ]}
            >
              {/* Directional Heading Cone / Dot */}
              <View
                style={[
                  styles.riderDot,
                  {
                    backgroundColor: marker.isStale ? primitive.color.semantic.warning : primitive.color.volt[400],
                    transform: [{ rotate: `${marker.headingDeg || 0}deg` }],
                  },
                ]}
              >
                <View style={styles.headingPointer} />
              </View>
            </View>
          </View>
        );
      case 'hazard':
      default:
        return (
          <View style={[styles.hazardPin, { backgroundColor: primitive.color.route.hazard, borderColor: colors.surface }]}>
            <Icon name="alert-triangle" size={11} color="#FFFFFF" strokeWidth={2.5} />
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
                borderColor: marker.kind === 'hazard'
                  ? primitive.color.route.hazard
                  : marker.isStale
                  ? primitive.color.semantic.warning
                  : colors.border,
              },
            ]}
          >
            <Text
              variant="mono"
              style={{
                color: marker.isStale ? primitive.color.semantic.warning : colors.text,
                fontSize: 10,
                fontWeight: '700',
              }}
            >
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
    zIndex: 10,
  },
  markerPin: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: primitive.color.graphite[950],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 4,
    elevation: 4,
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
  waypointPin: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  waypointDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  hazardPin: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: primitive.color.semantic.warning,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 4,
  },
  riderContainer: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  riderHalo: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: primitive.color.volt[400],
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 6,
    elevation: 5,
  },
  riderDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headingPointer: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 3,
    borderRightWidth: 3,
    borderBottomWidth: 6,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: primitive.color.graphite[950],
    transform: [{ translateY: -4 }],
  },
  calloutLabel: {
    marginTop: 2,
    paddingHorizontal: primitive.spacing[2],
    paddingVertical: 1,
    borderRadius: primitive.radius.sm,
    borderWidth: 1,
    shadowColor: primitive.color.graphite[950],
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
});
