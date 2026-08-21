/**
 * ============================================================================
 * FIXTURE MAP LAYERS SHEET (R8)
 * ============================================================================
 *
 * WHY THIS EXISTS:
 * Discloses available and future map overlay layers (Topography, Hazards,
 * Heli Landing Zones, and Offline Cache) with truthful fixture descriptions.
 *
 * TRUTHFULNESS:
 * Does not claim real satellite telemetry, live traffic, or downloaded packs.
 */

import React from 'react';
import { View, StyleSheet, Modal, TouchableOpacity, Switch } from 'react-native';
import { Text } from '../primitives/Text';
import { Badge } from '../primitives/Badge';
import { Button } from '../primitives/Button';
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
          { backgroundColor: isDayGlare ? colors.mapGlass.borderColor : colors.mapGlass.backgroundColor },
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
              <Text variant="h3" style={{ color: colors.text }}>
                Map Layers (नक्सा तहहरू)
              </Text>
              <Text variant="mono" style={{ color: colors.textSubtle, fontSize: 11, marginTop: 2 }}>
                Deterministic Nepal Topographic Overlays
              </Text>
            </View>
            <Badge label="FIXTURE PREVIEW" variant="neutral" size="sm" />
          </View>

          {/* Layer Item 1: Topographic Elevation Contours */}
          <View style={[styles.layerItem, { borderBottomColor: colors.borderSubtle }]}>
            <View style={styles.layerInfo}>
              <Text variant="bodyLarge" style={{ color: colors.text, fontWeight: '600' }}>
                Himalayan Elevation Contours
              </Text>
              <Text variant="bodySmall" muted>
                Synthetic topographic contour curves (100m interval)
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
              <Text variant="bodyLarge" style={{ color: colors.text, fontWeight: '600' }}>
                Monsoon Hazard Markers
              </Text>
              <Text variant="bodySmall" muted>
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
              <Text variant="bodyLarge" style={{ color: colors.textSubtle, fontWeight: '600' }}>
                Emergency Heli Landing Zones (LZ)
              </Text>
              <Text variant="mono" style={{ color: colors.textSubtle, fontSize: 11 }}>
                Future layer · High altitude mountain evacuation sites
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
  layerItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: primitive.spacing[3],
    borderBottomWidth: 1,
  },
  layerInfo: {
    flex: 1,
    marginRight: primitive.spacing[3],
  },
  closeBtn: {
    marginTop: primitive.spacing[5],
    minHeight: primitive.size.targetMin,
  },
});
