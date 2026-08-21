/**
 * ============================================================================
 * GARAGE VEHICLES VIEW (R14)
 * ============================================================================
 *
 * Coordinates:
 * 1. Pre-authored motorcycle fleet (Himalayan 450, KTM 390 Adventure).
 * 2. Estimated fuel level indicators and maintenance states (good, stale_unknown).
 * 3. Disabled vehicle action affordances with notice: "Preview only — nothing was saved."
 * 4. AD/BS date format selection.
 * 5. 48dp minimum touch targets across all 4 themes (Night, Day Glare, Dusk, Blackout).
 */

import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { FixtureMotorcycle, CalendarSystemPreview, AppPreviewLanguage } from '../../domain/profileSettings';
import { Text } from '../primitives/Text';
import { Badge } from '../primitives/Badge';
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
        return <Badge label="MAINTENANCE GOOD" variant="volt" size="sm" />;
      case 'due_soon':
        return <Badge label="SERVICE DUE SOON" variant="warning" size="sm" />;
      case 'stale_unknown':
        return <Badge label="MAINTENANCE UNKNOWN" variant="warning" size="sm" />;
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
          <Text variant="mono" style={{ color: primitive.color.semantic.warning, fontSize: 11, fontWeight: '700' }}>
            ℹ️ {actionNotice}
          </Text>
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
              <Text variant="bodySmall" muted>ENGINE</Text>
              <Text variant="bodyMedium" style={{ fontWeight: '700', color: colors.text }}>
                {v.displacementCc} cc
              </Text>
            </View>
            <View style={styles.specBox}>
              <Text variant="bodySmall" muted>ODOMETER</Text>
              <Text variant="bodyMedium" style={{ fontWeight: '700', color: primitive.color.cyan[400] }}>
                {v.odometerKm.toLocaleString()} km
              </Text>
            </View>
            <View style={styles.specBox}>
              <Text variant="bodySmall" muted>LAST SERVICE</Text>
              <Text variant="bodyMedium" style={{ fontWeight: '700', color: colors.text }}>
                {calendarSystem === 'BS' ? v.lastServiceDateBs : v.lastServiceDateAd}
              </Text>
            </View>
          </View>

          {/* Estimated Fuel Level Gauge */}
          <View style={styles.fuelGaugeSection}>
            <View style={styles.fuelHeaderRow}>
              <Text variant="bodySmall" muted>ESTIMATED FUEL LEVEL (SIMULATED)</Text>
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

          <Text variant="bodySmall" muted style={{ marginTop: primitive.spacing[2] }}>
            📝 {v.notes}
          </Text>

          {/* Disabled Vehicle Actions */}
          <View style={[styles.actionsRow, { borderTopColor: colors.borderSubtle }]}>
            <TouchableOpacity
              style={[styles.actionBtn, { borderColor: colors.borderSubtle }]}
              onPress={() => handleAction('Edit Specs', v.makeModel)}
              accessible
              accessibilityRole="button"
              accessibilityLabel={`Edit ${v.makeModel} specifications preview`}
            >
              <Text variant="mono" style={{ color: colors.text, fontSize: 11 }}>
                ✏️ Edit Specs
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionBtn, { borderColor: colors.borderSubtle }]}
              onPress={() => handleAction('Service Log', v.makeModel)}
              accessible
              accessibilityRole="button"
              accessibilityLabel={`View ${v.makeModel} service log preview`}
            >
              <Text variant="mono" style={{ color: colors.text, fontSize: 11 }}>
                🔧 Service Log
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionBtn, { borderColor: colors.borderSubtle }]}
              onPress={() => handleAction('Delete Vehicle', v.makeModel)}
              accessible
              accessibilityRole="button"
              accessibilityLabel={`Delete ${v.makeModel} preview`}
            >
              <Text variant="mono" style={{ color: colors.textSubtle, fontSize: 11 }}>
                🗑️ Remove
              </Text>
            </TouchableOpacity>
          </View>

          {/* Permanent Disclosure */}
          <View style={[styles.cardFooter, { borderTopColor: colors.borderSubtle }]}>
            <Text variant="mono" style={{ color: colors.textSubtle, fontSize: 10 }}>
              ℹ️ {v.syntheticDisclosure}
            </Text>
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
  fuelTrack: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  fuelFill: {
    height: '100%',
    borderRadius: 3,
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
  cardFooter: {
    marginTop: primitive.spacing[3],
    paddingTop: primitive.spacing[2],
    borderTopWidth: 0.5,
  },
});
