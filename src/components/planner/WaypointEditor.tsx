/**
 * ============================================================================
 * ACCESSIBLE WAYPOINT EDITOR COMPONENT (R16 REFINED)
 * ============================================================================
 *
 * Allows riders to add, remove, and reorder intermediate route stops
 * with accessible touch controls, vector icons, and destructive action confirmation.
 */

import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { PlannerWaypoint } from '../../domain/tripPlanner';
import { Text } from '../primitives/Text';
import { Badge } from '../primitives/Badge';
import { Button } from '../primitives/Button';
import { Icon, IconName } from '../primitives/Icon';
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

  const [pendingRemoveId, setPendingRemoveId] = useState<string | null>(null);

  const getCategoryIconName = (category: PlannerWaypoint['category']): IconName => {
    switch (category) {
      case 'fuel':
        return 'flame';
      case 'food':
        return 'clock';
      case 'viewpoint':
        return 'mountain';
      case 'permit':
        return 'shield-check';
      case 'rest':
      default:
        return 'clock';
    }
  };

  const handleConfirmRemove = (id: string) => {
    onRemoveWaypoint(id);
    setPendingRemoveId(null);
  };

  const handleCancelRemove = () => {
    setPendingRemoveId(null);
  };

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
          label="PREVIEW"
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
        const isPendingDelete = pendingRemoveId === wp.id;

        return (
          <View
            key={wp.id}
            style={[
              styles.waypointRow,
              {
                backgroundColor: isDayGlare ? primitive.color.snow[0] : colors.surface,
                borderColor: isPendingDelete ? primitive.color.semantic.danger : colors.border,
              },
            ]}
          >
            {isPendingDelete ? (
              /* Confirmation view for removal */
              <View style={styles.confirmContainer}>
                <Text variant="bodyMedium" style={{ color: colors.text, fontWeight: '700' }}>
                  Remove stop {wp.place.name}?
                </Text>
                <View style={styles.confirmActionRow}>
                  <Button
                    label="YES, REMOVE"
                    onPress={() => handleConfirmRemove(wp.id)}
                    variant="danger"
                    style={{ minHeight: 48, marginRight: primitive.spacing[2], flex: 1 }}
                  />
                  <Button
                    label="CANCEL"
                    onPress={handleCancelRemove}
                    variant="secondary"
                    style={{ minHeight: 48, flex: 1 }}
                  />
                </View>
              </View>
            ) : (
              /* Standard Waypoint Row */
              <>
                <View style={styles.waypointInfo}>
                  <View style={styles.categoryBadgeRow}>
                    <Badge label={`#${index + 1}`} variant="cyan" size="sm" />
                    <View style={styles.categoryIconWrap}>
                      <Icon name={getCategoryIconName(wp.category)} size={13} color={colors.textSubtle} />
                      <Text variant="mono" style={{ color: colors.textSubtle, fontSize: 10, marginLeft: 4, textTransform: 'uppercase' }}>
                        {wp.category}
                      </Text>
                    </View>
                  </View>
                  <Text variant="bodyLarge" style={{ color: colors.text, fontWeight: '700', marginTop: 2 }}>
                    {wp.place.name}
                  </Text>
                  {wp.place.nameNepali && (
                    <Text variant="bodySmall" style={{ color: colors.textSubtle, fontFamily: 'Mukta_500Medium' }}>
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
                    <Icon
                      name="chevron-up"
                      size={16}
                      color={isFirst ? colors.textSubtle : colors.text}
                      strokeWidth={2.5}
                    />
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
                    <Icon
                      name="chevron-down"
                      size={16}
                      color={isLast ? colors.textSubtle : colors.text}
                      strokeWidth={2.5}
                    />
                  </TouchableOpacity>

                  {/* Remove - Triggers confirmation */}
                  <TouchableOpacity
                    style={[
                      styles.controlBtn,
                      {
                        backgroundColor: colors.surfaceElevated,
                        borderColor: primitive.color.semantic.danger,
                      },
                    ]}
                    onPress={() => setPendingRemoveId(wp.id)}
                    accessible
                    accessibilityRole="button"
                    accessibilityLabel={`Remove stop ${wp.place.name} from route`}
                  >
                    <Icon
                      name="x"
                      size={16}
                      color={primitive.color.semantic.danger}
                      strokeWidth={2.5}
                    />
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        );
      })}

      {/* Suggested Waypoints Section */}
      {availableSuggestions.length > 0 && (
        <View style={styles.suggestionsContainer}>
          <Text variant="bodySmall" muted style={{ fontWeight: '700', letterSpacing: 0.5, marginBottom: primitive.spacing[2] }}>
            SUGGESTED STOPS (+ ADD)
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
                <Icon name={getCategoryIconName(suggestion.category)} size={12} color={colors.textSubtle} style={{ marginRight: 4 }} />
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
  confirmContainer: {
    flex: 1,
    paddingVertical: primitive.spacing[1],
  },
  confirmActionRow: {
    flexDirection: 'row',
    marginTop: primitive.spacing[2],
  },
  waypointInfo: {
    flex: 1,
    marginRight: primitive.spacing[2],
  },
  categoryBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryIconWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 6,
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
