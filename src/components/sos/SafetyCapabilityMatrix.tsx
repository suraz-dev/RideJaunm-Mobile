/**
 * ============================================================================
 * SAFETY CAPABILITY MATRIX (R15)
 * ============================================================================
 *
 * Coordinates:
 * 1. Plain-language channel capability breakdown (GPS, BLE Mesh, Cellular, Satellite, Delivery Proof).
 * 2. Pre-authored synthetic location label and battery indicator.
 * 3. Strict safety invariant: Uses warning/neutral/volt/cyan tokens (never SOS Red).
 * 4. Full theme compliance across Night, Day Glare, Dusk, Blackout.
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { FixtureSafetyCapabilitySnapshot } from '../../domain/sosConsole';
import { Text } from '../primitives/Text';
import { Badge } from '../primitives/Badge';
import { useTheme } from '../../design/ThemeProvider';
import { primitive } from '../../design/tokens';

export interface SafetyCapabilityMatrixProps {
  snapshot: FixtureSafetyCapabilitySnapshot;
}

export const SafetyCapabilityMatrix: React.FC<SafetyCapabilityMatrixProps> = ({
  snapshot,
}) => {
  const { colors, mode } = useTheme();
  const isDayGlare = mode === 'dayGlare';

  const getEvidenceBadge = (state: string, label: string) => {
    switch (state) {
      case 'local_observation':
        return <Badge label={label} variant="volt" size="sm" />;
      case 'device_reported':
        return <Badge label={label} variant="cyan" size="sm" />;
      case 'unavailable':
      default:
        return <Badge label={label} variant="warning" size="sm" />;
    }
  };

  return (
    <View style={styles.container}>
      <Text variant="h3" style={[styles.sectionTitle, { color: colors.text }]}>
        Safety Capability Gate & Evidence
      </Text>

      {/* Overview Card: Synthetic Location & Battery */}
      <View
        style={[
          styles.overviewCard,
          {
            backgroundColor: isDayGlare ? primitive.color.snow[0] : colors.surface,
            borderColor: colors.border,
          },
        ]}
      >
        <View style={styles.overviewRow}>
          <Text variant="bodySmall" muted>
            SYNTHETIC LAST-KNOWN LOCATION
          </Text>
          <Badge
            label={snapshot.gpsFreshness === 'fresh' ? 'LOCAL FIXTURE' : 'LAST-KNOWN'}
            variant="volt"
            size="sm"
          />
        </View>
        <Text variant="mono" style={{ color: primitive.color.cyan[400], fontSize: 12, marginTop: 4 }}>
          📍 {snapshot.lastKnownLocationSynthetic}
        </Text>

        <View style={[styles.divider, { backgroundColor: colors.borderSubtle }]} />

        <View style={styles.overviewRow}>
          <Text variant="bodySmall" muted>
            DEVICE BATTERY OBSERVATION
          </Text>
          <Text variant="mono" style={{ color: snapshot.batteryHealth === 'low' ? primitive.color.semantic.warning : colors.text, fontSize: 12, fontWeight: '700' }}>
            🔋 {snapshot.batteryPercent}% ({snapshot.batteryHealth.toUpperCase()})
          </Text>
        </View>
      </View>

      {/* Channel Cascade Matrix */}
      <View
        style={[
          styles.matrixCard,
          {
            backgroundColor: isDayGlare ? primitive.color.snow[0] : colors.surfaceElevated,
            borderColor: colors.border,
          },
        ]}
        accessible
        accessibilityRole="summary"
        accessibilityLabel="Emergency safety capability gate channel matrix"
      >
        {snapshot.evidenceItems.map((item, idx) => (
          <React.Fragment key={item.id}>
            <View style={styles.channelRow}>
              <View style={styles.channelInfoCol}>
                <Text variant="bodyMedium" style={{ fontWeight: '700', color: colors.text }}>
                  {item.channelName}
                </Text>
                <Text variant="mono" style={{ color: colors.textSubtle, fontSize: 11, marginTop: 2 }}>
                  {item.detail}
                </Text>
              </View>
              {getEvidenceBadge(item.evidenceState, item.statusLabel)}
            </View>
            {idx < snapshot.evidenceItems.length - 1 && (
              <View style={[styles.divider, { backgroundColor: colors.borderSubtle }]} />
            )}
          </React.Fragment>
        ))}

        <View style={[styles.cardFooter, { borderTopColor: colors.borderSubtle }]}>
          <Text variant="mono" style={{ color: colors.textSubtle, fontSize: 10 }}>
            ℹ️ {snapshot.syntheticDisclosure}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: primitive.spacing[4],
  },
  sectionTitle: {
    marginBottom: primitive.spacing[3],
  },
  overviewCard: {
    borderRadius: primitive.radius.lg,
    padding: primitive.spacing[4],
    marginBottom: primitive.spacing[3],
    borderWidth: 1,
  },
  overviewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  matrixCard: {
    borderRadius: primitive.radius.lg,
    padding: primitive.spacing[4],
    borderWidth: 1,
  },
  channelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: primitive.spacing[2],
  },
  channelInfoCol: {
    flex: 1,
    marginRight: primitive.spacing[3],
  },
  divider: {
    height: 1,
    marginVertical: primitive.spacing[3],
  },
  cardFooter: {
    marginTop: primitive.spacing[2],
    paddingTop: primitive.spacing[2],
    borderTopWidth: 0.5,
  },
});
