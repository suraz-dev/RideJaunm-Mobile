/**
 * ============================================================================
 * GARAGE VEHICLES VIEW (R16 REFINED)
 * ============================================================================
 *
 * Coordinates:
 * 1. Motorcycle fleet (Himalayan 450, KTM 390 Adventure) with vector icons.
 * 2. Estimated fuel level indicators and maintenance states.
 * 3. Disabled vehicle action affordances with notice: "Preview only — nothing was saved."
 * 4. AD/BS date format selection.
 */

import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { FixtureMotorcycle, CalendarSystemPreview, AppPreviewLanguage } from '../../domain/profileSettings';
import { Text } from '../primitives/Text';
import { Badge } from '../primitives/Badge';
import { Icon } from '../primitives/Icon';
import { useTheme } from '../../design/ThemeProvider';
import { primitive } from '../../design/tokens';

export interface GarageVehiclesViewProps {
  vehicles: FixtureMotorcycle[];
  calendarSystem?: CalendarSystemPreview;
  language?: AppPreviewLanguage;
}

export const GarageVehiclesView: React.FC<GarageVehiclesViewProps> = ({
  vehicles,
  calendarSystem = 'AD',
  language = 'en',
}) => {
  const { colors, mode } = useTheme();
  const isDayGlare = mode === 'dayGlare';

  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const getMaintenanceBadge = (state: FixtureMotorcycle['maintenanceState']) => {
    switch (state) {
      case 'good':
        return (
          <Badge
            label="MAINTENANCE GOOD"
            variant="volt"
            size="sm"
            icon={<Icon name="check" size={10} color={primitive.color.volt[400]} />}
          />
        );
      case 'due_soon':
        return (
          <Badge
            label="SERVICE DUE SOON"
            variant="warning"
            size="sm"
            icon={<Icon name="alert-triangle" size={10} color={primitive.color.semantic.warning} />}
          />
        );
      case 'stale_unknown':
        return (
          <Badge
            label="MAINTENANCE UNKNOWN"
            variant="warning"
            size="sm"
            icon={<Icon name="alert-triangle" size={10} color={primitive.color.semantic.warning} />}
          />
        );
    }
  };

  const handleAction = (actionName: string, vehicleName: string) => {
    setActionNotice(`Preview only — ${actionName} for ${vehicleName} was not saved.`);
  };

  return (
    <View style={styles.container}>
      <Text variant="h2" style={[styles.title, { color: colors.text }]}>
        {language === 'ne' ? 'मोटरसाइकल ग्यारेज' : language === 'hi' ? 'मोटरसाइकिल गैरेज' : 'Motorcycle Garage'} ({vehicles.length})
      </Text>

      {actionNotice && (
        <View
          style={[
            styles.noticeBox,
            {
              backgroundColor: isDayGlare ? primitive.color.snow[50] : colors.surfaceElevated,
              borderColor: primitive.color.semantic.warning,
            },
          ]}
        >
          <View style={styles.noticeRow}>
            <Icon name="info" size={12} color={primitive.color.semantic.warning} style={{ marginRight: 4 }} />
            <Text variant="mono" style={{ color: primitive.color.semantic.warning, fontSize: 11, fontWeight: '700' }}>
              {actionNotice}
            </Text>
          </View>
        </View>
      )}

      {vehicles.map((v) => (
        <View
          key={v.id}
          style={[
            styles.vehicleCard,
            {
              backgroundColor: isDayGlare ? primitive.color.snow[0] : colors.surface,
              borderColor: colors.border,
            },
          ]}
          accessible
          accessibilityRole="summary"
          accessibilityLabel={`Motorcycle: ${v.makeModel}, Plate: ${v.licensePlateSynthetic}, Maintenance: ${v.maintenanceState}`}
        >
          {/* Header */}
          <View style={styles.cardHeader}>
            <View>
              <Text variant="h3" style={{ color: colors.text }}>
                {v.makeModel}
              </Text>
              <Text variant="mono" style={{ color: primitive.color.volt[400], marginTop: 2 }}>
                {v.licensePlateSynthetic} · {v.colorName}
              </Text>
            </View>
            {getMaintenanceBadge(v.maintenanceState)}
          </View>

          {/* Specs & Metrics Grid */}
          <View style={[styles.specsRow, { borderTopColor: colors.borderSubtle }]}>
            <View style={styles.specBox}>
              <Text variant="bodySmall" muted style={{ fontWeight: '700', letterSpacing: 0.5 }}>ENGINE</Text>
              <Text variant="bodyMedium" style={{ fontWeight: '700', color: colors.text, marginTop: 2 }}>
                {v.displacementCc} cc
              </Text>
            </View>
            <View style={styles.specBox}>
              <Text variant="bodySmall" muted style={{ fontWeight: '700', letterSpacing: 0.5 }}>ODOMETER</Text>
              <Text variant="bodyMedium" style={{ fontWeight: '700', color: primitive.color.cyan[400], marginTop: 2 }}>
                {v.odometerKm.toLocaleString()} km
              </Text>
            </View>
            <View style={styles.specBox}>
              <Text variant="bodySmall" muted style={{ fontWeight: '700', letterSpacing: 0.5 }}>LAST SERVICE</Text>
              <Text variant="bodyMedium" style={{ fontWeight: '700', color: colors.text, marginTop: 2 }}>
                {calendarSystem === 'BS' ? v.lastServiceDateBs : v.lastServiceDateAd}
              </Text>
            </View>
          </View>

          {/* Estimated Fuel Level Gauge */}
          <View style={styles.fuelGaugeSection}>
            <View style={styles.fuelHeaderRow}>
              <View style={styles.fuelLabelRow}>
                <Icon name="flame" size={12} color={colors.textSubtle} style={{ marginRight: 4 }} />
                <Text variant="bodySmall" muted style={{ fontWeight: '700', letterSpacing: 0.5 }}>ESTIMATED FUEL LEVEL</Text>
              </View>
              <Text variant="mono" style={{ color: primitive.color.volt[400], fontSize: 11, fontWeight: '700' }}>
                {v.estimatedFuelLevelPercent}% (~{((v.fuelCapacityLiters * v.estimatedFuelLevelPercent) / 100).toFixed(1)} L)
              </Text>
            </View>
            <View style={[styles.fuelTrack, { backgroundColor: primitive.color.graphite[800] }]}>
              <View
                style={[
                  styles.fuelFill,
                  {
                    width: `${v.estimatedFuelLevelPercent}%`,
                    backgroundColor:
                      v.estimatedFuelLevelPercent < 25
                        ? primitive.color.semantic.warning
                        : primitive.color.volt[400],
                  },
                ]}
              />
            </View>
          </View>

          <View style={styles.notesRow}>
            <Icon name="file-text" size={12} color={colors.textSubtle} style={{ marginRight: 4, marginTop: 2 }} />
            <Text variant="bodySmall" muted style={{ flex: 1 }}>
              {v.notes}
            </Text>
          </View>

          {/* Vehicle Actions */}
          <View style={[styles.actionsRow, { borderTopColor: colors.borderSubtle }]}>
            <TouchableOpacity
              style={[styles.actionBtn, { borderColor: colors.borderSubtle }]}
              onPress={() => handleAction('Edit Specs', v.makeModel)}
              accessible
              accessibilityRole="button"
              accessibilityLabel={`Edit ${v.makeModel} specifications preview`}
            >
              <View style={styles.actionBtnRow}>
                <Icon name="edit" size={12} color={colors.text} style={{ marginRight: 4 }} />
                <Text variant="mono" style={{ color: colors.text, fontSize: 11 }}>
                  Edit
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionBtn, { borderColor: colors.borderSubtle }]}
              onPress={() => handleAction('Service Log', v.makeModel)}
              accessible
              accessibilityRole="button"
              accessibilityLabel={`View ${v.makeModel} service log preview`}
            >
              <View style={styles.actionBtnRow}>
                <Icon name="settings" size={12} color={colors.text} style={{ marginRight: 4 }} />
                <Text variant="mono" style={{ color: colors.text, fontSize: 11 }}>
                  Service
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionBtn, { borderColor: colors.borderSubtle }]}
              onPress={() => handleAction('Delete Vehicle', v.makeModel)}
              accessible
              accessibilityRole="button"
              accessibilityLabel={`Delete ${v.makeModel} preview`}
            >
              <View style={styles.actionBtnRow}>
                <Icon name="x" size={12} color={colors.textSubtle} style={{ marginRight: 4 }} />
                <Text variant="mono" style={{ color: colors.textSubtle, fontSize: 11 }}>
                  Remove
                </Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Permanent Disclosure */}
          <View style={[styles.cardFooter, { borderTopColor: colors.borderSubtle }]}>
            <View style={styles.footerRow}>
              <Icon name="info" size={10} color={colors.textSubtle} style={{ marginRight: 4 }} />
              <Text variant="mono" style={{ color: colors.textSubtle, fontSize: 10 }}>
                {v.syntheticDisclosure}
              </Text>
            </View>
          </View>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: primitive.spacing[4],
  },
  title: {
    marginBottom: primitive.spacing[3],
  },
  noticeBox: {
    padding: primitive.spacing[3],
    borderRadius: primitive.radius.md,
    borderWidth: 1,
    marginBottom: primitive.spacing[3],
  },
  noticeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  vehicleCard: {
    borderRadius: primitive.radius.lg,
    padding: primitive.spacing[4],
    marginBottom: primitive.spacing[4],
    borderWidth: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: primitive.spacing[3],
  },
  specsRow: {
    flexDirection: 'row',
    borderTopWidth: 1,
    paddingTop: primitive.spacing[3],
    marginBottom: primitive.spacing[3],
  },
  specBox: {
    flex: 1,
  },
  fuelGaugeSection: {
    marginBottom: primitive.spacing[2],
  },
  fuelHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: primitive.spacing[1],
  },
  fuelLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  fuelTrack: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  fuelFill: {
    height: '100%',
    borderRadius: 3,
  },
  notesRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: primitive.spacing[2],
  },
  actionsRow: {
    flexDirection: 'row',
    gap: primitive.spacing[2],
    marginTop: primitive.spacing[3],
    paddingTop: primitive.spacing[3],
    borderTopWidth: 1,
  },
  actionBtn: {
    flex: 1,
    minHeight: 48,
    borderRadius: primitive.radius.md,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionBtnRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardFooter: {
    marginTop: primitive.spacing[3],
    paddingTop: primitive.spacing[2],
    borderTopWidth: 0.5,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
