/**
 * ============================================================================
 * ACCESSIBLE WAYPOINT EDITOR COMPONENT (R10)
 * ============================================================================
 *
 * WHY THIS EXISTS:
 * Allows riders to add, remove, and reorder intermediate route stops
 * (fuel gaps, scenic viewpoints, meal hubs, and permit checkpoints)
 * with accessible touch controls.
 *
 * ACCESSIBILITY INVARIANTS:
 * 1. Reordering controls (Move Up / Move Down) have distinct accessible labels
 *    and minimum touch targets of 48 dp.
 * 2. Remove buttons have descriptive accessibility action labels.
 * 3. Pre-authored synthetic waypoint estimates only.
 */

import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { PlannerWaypoint } from '../../domain/tripPlanner';
import { Text } from '../primitives/Text';
import { Badge } from '../primitives/Badge';
import { Button } from '../primitives/Button';
import { useTheme } from '../../design/ThemeProvider';
import { primitive } from '../../design/tokens';

export interface WaypointEditorProps {
  waypoints: PlannerWaypoint[];
  suggestedWaypoints: PlannerWaypoint[];
  onAddWaypoint: (waypoint: PlannerWaypoint) => void;
  onRemoveWaypoint: (id: string) => void;
  onMoveUp: (index: number) => void;
  onMoveDown: (index: number) => void;
}

export const WaypointEditor: React.FC<WaypointEditorProps> = ({
  waypoints,
  suggestedWaypoints,
  onAddWaypoint,
  onRemoveWaypoint,
  onMoveUp,
  onMoveDown,
}) => {
  const { colors, mode } = useTheme();
  const isDayGlare = mode === 'dayGlare';

  const getCategoryIcon = (category: PlannerWaypoint['category']) => {
    switch (category) {
      case 'fuel':
        return '⛽';
      case 'food':
        return '🍲';
      case 'viewpoint':
        return '🏔️';
      case 'permit':
        return '🛂';
      case 'rest':
      default:
        return '☕';
    }
  };

  // Filter out suggestions that are already in the waypoints list
  const availableSuggestions = suggestedWaypoints.filter(
    (s) => !waypoints.some((w) => w.place.id === s.place.id)
  );

  return (
    <View style={styles.container}>
      {/* Waypoint Header */}
      <View style={styles.headerRow}>
        <Text variant="h3" style={{ color: colors.text }}>
          Route Stops & Waypoints ({waypoints.length})
        </Text>
        <Badge
          label="SYNTHETIC FIXTURE"
          variant="neutral"
          size="sm"
        />
      </View>

      {/* Empty State */}
      {waypoints.length === 0 && (
        <View style={[styles.emptyBox, { backgroundColor: colors.surfaceCard, borderColor: colors.borderSubtle }]}>
          <Text variant="bodyMedium" muted style={{ textAlign: 'center' }}>
            No intermediate stops added. Direct corridor selected.
          </Text>
        </View>
      )}

      {/* Ordered Waypoints List */}
      {waypoints.map((wp, index) => {
        const isFirst = index === 0;
        const isLast = index === waypoints.length - 1;

        return (
          <View
            key={wp.id}
            style={[
              styles.waypointRow,
              {
                backgroundColor: isDayGlare ? primitive.color.snow[0] : colors.surface,
                borderColor: colors.border,
              },
            ]}
          >
            {/* Order & Category Badge */}
            <View style={styles.waypointInfo}>
              <View style={styles.categoryBadgeRow}>
                <Badge label={`#${index + 1}`} variant="cyan" size="sm" />
                <Text style={{ marginLeft: 6, fontSize: 13 }}>
                  {getCategoryIcon(wp.category)}
                </Text>
                <Text variant="mono" style={{ color: colors.textSubtle, fontSize: 10, marginLeft: 6, textTransform: 'uppercase' }}>
                  {wp.category}
                </Text>
              </View>
              <Text variant="bodyLarge" style={{ color: colors.text, fontWeight: '700', marginTop: 2 }}>
                {wp.place.name}
              </Text>
              {wp.place.nameNepali && (
                <Text variant="bodySmall" style={{ color: colors.textSubtle }}>
                  {wp.place.nameNepali}
                </Text>
              )}
            </View>

            {/* Reorder & Remove Actions */}
            <View style={styles.actionControls}>
              {/* Move Up */}
              <TouchableOpacity
                style={[
                  styles.controlBtn,
                  {
                    backgroundColor: isFirst ? colors.surfaceCard : colors.surfaceElevated,
                    borderColor: colors.border,
                  },
                ]}
                onPress={() => onMoveUp(index)}
                disabled={isFirst}
                accessible
                accessibilityRole="button"
                accessibilityLabel={`Move stop ${wp.place.name} earlier in route order`}
              >
                <Text
                  variant="mono"
                  style={{
                    color: isFirst ? colors.textSubtle : colors.text,
                    fontSize: 12,
                    fontWeight: '700',
                  }}
                >
                  ▲
                </Text>
              </TouchableOpacity>

              {/* Move Down */}
              <TouchableOpacity
                style={[
                  styles.controlBtn,
                  {
                    backgroundColor: isLast ? colors.surfaceCard : colors.surfaceElevated,
                    borderColor: colors.border,
                  },
                ]}
                onPress={() => onMoveDown(index)}
                disabled={isLast}
                accessible
                accessibilityRole="button"
                accessibilityLabel={`Move stop ${wp.place.name} later in route order`}
              >
                <Text
                  variant="mono"
                  style={{
                    color: isLast ? colors.textSubtle : colors.text,
                    fontSize: 12,
                    fontWeight: '700',
                  }}
                >
                  ▼
                </Text>
              </TouchableOpacity>

              {/* Remove */}
              <TouchableOpacity
                style={[
                  styles.controlBtn,
                  {
                    backgroundColor: colors.surfaceElevated,
                    borderColor: primitive.color.semantic.danger,
                  },
                ]}
                onPress={() => onRemoveWaypoint(wp.id)}
                accessible
                accessibilityRole="button"
                accessibilityLabel={`Remove stop ${wp.place.name} from route`}
              >
                <Text
                  variant="mono"
                  style={{
                    color: primitive.color.semantic.danger,
                    fontSize: 13,
                    fontWeight: '900',
                  }}
                >
                  ✕
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        );
      })}

      {/* Suggested Waypoints Section */}
      {availableSuggestions.length > 0 && (
        <View style={styles.suggestionsContainer}>
          <Text variant="bodySmall" muted style={{ fontWeight: '700', letterSpacing: 0.5, marginBottom: primitive.spacing[2] }}>
            SUGGESTED NEPAL STOPS (+ ADD)
          </Text>
          <View style={styles.chipsWrap}>
            {availableSuggestions.map((suggestion) => (
              <TouchableOpacity
                key={suggestion.id}
                style={[
                  styles.suggestionChip,
                  {
                    backgroundColor: colors.surfaceElevated,
                    borderColor: colors.border,
                  },
                ]}
                onPress={() => onAddWaypoint(suggestion)}
                accessible
                accessibilityRole="button"
                accessibilityLabel={`Add suggested stop: ${suggestion.place.name}`}
              >
                <Text style={{ fontSize: 12, marginRight: 4 }}>
                  {getCategoryIcon(suggestion.category)}
                </Text>
                <Text variant="bodySmall" style={{ color: colors.text, fontWeight: '600', fontSize: 12 }}>
                  + {suggestion.place.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: primitive.spacing[4],
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: primitive.spacing[3],
  },
  emptyBox: {
    padding: primitive.spacing[4],
    borderRadius: primitive.radius.md,
    borderWidth: 1,
  },
  waypointRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: primitive.spacing[3],
    borderRadius: primitive.radius.md,
    borderWidth: 1,
    marginBottom: primitive.spacing[2],
    minHeight: primitive.size.targetMin,
  },
  waypointInfo: {
    flex: 1,
    marginRight: primitive.spacing[2],
  },
  categoryBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionControls: {
    flexDirection: 'row',
    gap: primitive.spacing[2],
  },
  controlBtn: {
    width: 48,
    height: 48,
    borderRadius: primitive.radius.md,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  suggestionsContainer: {
    marginTop: primitive.spacing[3],
  },
  chipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: primitive.spacing[2],
  },
  suggestionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: primitive.spacing[2],
    paddingHorizontal: primitive.spacing[3],
    borderRadius: primitive.radius.full,
    borderWidth: 1,
    minHeight: 48,
  },
});
