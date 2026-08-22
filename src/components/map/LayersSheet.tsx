/**
 * ============================================================================
 * FIXTURE MAP LAYERS SHEET (R16 REFINED)
 * ============================================================================
 *
 * Discloses available and future map overlay layers (Topography, Hazards,
 * Heli Landing Zones) with truthful fixture descriptions and vector icons.
 */

import React from 'react';
import { View, StyleSheet, Modal, TouchableOpacity, Switch } from 'react-native';
import { Text } from '../primitives/Text';
import { Badge } from '../primitives/Badge';
import { Button } from '../primitives/Button';
import { Icon } from '../primitives/Icon';
import { useTheme } from '../../design/ThemeProvider';
import { primitive } from '../../design/tokens';

export interface LayersSheetProps {
  visible: boolean;
  onClose: () => void;
  showHazards: boolean;
  onToggleHazards: (val: boolean) => void;
  showTopography: boolean;
  onToggleTopography: (val: boolean) => void;
}

export const LayersSheet: React.FC<LayersSheetProps> = ({
  visible,
  onClose,
  showHazards,
  onToggleHazards,
  showTopography,
  onToggleTopography,
}) => {
  const { colors, mode } = useTheme();
  const isDayGlare = mode === 'dayGlare';

  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableOpacity
        style={[
          styles.modalOverlay,
          { backgroundColor: isDayGlare ? 'rgba(0,0,0,0.4)' : 'rgba(0,0,0,0.7)' },
        ]}
        activeOpacity={1}
        onPress={onClose}
      >
        <View
          style={[styles.sheetContent, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}
          onStartShouldSetResponder={() => true}
        >
          {/* Sheet Header */}
          <View style={styles.headerRow}>
            <View>
              <View style={styles.titleRow}>
                <Icon name="layers" size={18} color={primitive.color.volt[400]} style={{ marginRight: 6 }} />
                <Text variant="h3" style={{ color: colors.text }}>
                  Map Layers (नक्सा तहहरू)
                </Text>
              </View>
              <Text variant="mono" style={{ color: colors.textSubtle, fontSize: 11, marginTop: 2 }}>
                Deterministic Nepal Topographic Overlays
              </Text>
            </View>
            <Badge label="PREVIEW" variant="neutral" size="sm" />
          </View>

          {/* Layer Item 1: Topographic Elevation Contours */}
          <View style={[styles.layerItem, { borderBottomColor: colors.borderSubtle }]}>
            <View style={styles.layerInfo}>
              <View style={styles.layerTitleRow}>
                <Icon name="mountain" size={16} color={primitive.color.cyan[400]} style={{ marginRight: 6 }} />
                <Text variant="bodyLarge" style={{ color: colors.text, fontWeight: '600' }}>
                  Himalayan Elevation Contours
                </Text>
              </View>
              <Text variant="bodySmall" muted style={{ marginTop: 2 }}>
                Topographic contour curves (100m interval)
              </Text>
            </View>
            <Switch
              value={showTopography}
              onValueChange={onToggleTopography}
              trackColor={{ false: colors.border, true: primitive.color.volt[500] }}
              thumbColor={primitive.color.graphite[950]}
            />
          </View>

          {/* Layer Item 2: Monsoon Hazards & Landslides */}
          <View style={[styles.layerItem, { borderBottomColor: colors.borderSubtle }]}>
            <View style={styles.layerInfo}>
              <View style={styles.layerTitleRow}>
                <Icon name="alert-triangle" size={16} color={primitive.color.route.hazard} style={{ marginRight: 6 }} />
                <Text variant="bodyLarge" style={{ color: colors.text, fontWeight: '600' }}>
                  Monsoon Hazard Markers
                </Text>
              </View>
              <Text variant="bodySmall" muted style={{ marginTop: 2 }}>
                Landslide, flood washouts & road constriction warnings
              </Text>
            </View>
            <Switch
              value={showHazards}
              onValueChange={onToggleHazards}
              trackColor={{ false: colors.border, true: primitive.color.route.hazard }}
              thumbColor={primitive.color.graphite[950]}
            />
          </View>

          {/* Layer Item 3: Heli Landing Zones (Future Feature Disclosure) */}
          <View style={[styles.layerItem, { borderBottomColor: colors.borderSubtle }]}>
            <View style={styles.layerInfo}>
              <View style={styles.layerTitleRow}>
                <Icon name="shield" size={16} color={colors.textSubtle} style={{ marginRight: 6 }} />
                <Text variant="bodyLarge" style={{ color: colors.textSubtle, fontWeight: '600' }}>
                  Emergency Heli Landing Zones (LZ)
                </Text>
              </View>
              <Text variant="mono" style={{ color: colors.textSubtle, fontSize: 11, marginTop: 2 }}>
                High altitude mountain evacuation sites
              </Text>
            </View>
            <Badge label="UNAVAILABLE" variant="neutral" size="sm" />
          </View>

          {/* Dismiss Button */}
          <Button
            label="CLOSE LAYERS (बन्द गर्नुहोस्)"
            onPress={onClose}
            variant="secondary"
            style={styles.closeBtn}
          />
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheetContent: {
    padding: primitive.spacing[5],
    borderTopLeftRadius: primitive.radius['2xl'],
    borderTopRightRadius: primitive.radius['2xl'],
    borderWidth: 1,
    borderBottomWidth: 0,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: primitive.spacing[4],
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  layerItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: primitive.spacing[3],
    borderBottomWidth: 1,
  },
  layerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  layerInfo: {
    flex: 1,
    marginRight: primitive.spacing[3],
  },
  closeBtn: {
    marginTop: primitive.spacing[4],
  },
});
