/**
 * ============================================================================
 * SAFETY CAPABILITY MATRIX (R16 REFINED)
 * ============================================================================
 *
 * Coordinates:
 * 1. Plain-language channel capability breakdown (GPS, BLE Mesh, Cellular, Satellite, Delivery Proof) with vector icons.
 * 2. Synthetic location label and battery indicator.
 * 3. Strict safety invariant: Uses warning/neutral/volt/cyan tokens (never SOS Red).
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { FixtureSafetyCapabilitySnapshot } from '../../domain/sosConsole';
import { Text } from '../primitives/Text';
import { Badge } from '../primitives/Badge';
import { Icon } from '../primitives/Icon';
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
        return (
          <Badge
            label={label}
            variant="volt"
            size="sm"
            icon={<Icon name="check" size={10} color={primitive.color.volt[400]} />}
          />
        );
      case 'device_reported':
        return (
          <Badge
            label={label}
            variant="cyan"
            size="sm"
            icon={<Icon name="radio" size={10} color={primitive.color.cyan[400]} />}
          />
        );
      case 'unavailable':
      default:
        return (
          <Badge
            label={label}
            variant="warning"
            size="sm"
            icon={<Icon name="alert-triangle" size={10} color={primitive.color.semantic.warning} />}
          />
        );
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
          <Text variant="bodySmall" muted style={{ fontWeight: '700', letterSpacing: 0.5 }}>
            SYNTHETIC LAST-KNOWN LOCATION
          </Text>
          <Badge
            label={snapshot.gpsFreshness === 'fresh' ? 'LOCAL FIXTURE' : 'LAST-KNOWN'}
            variant="volt"
            size="sm"
          />
        </View>
        <View style={styles.locationRow}>
          <Icon name="map-pin" size={13} color={primitive.color.cyan[400]} style={{ marginRight: 6 }} />
          <Text variant="mono" style={{ color: primitive.color.cyan[400], fontSize: 12 }}>
            {snapshot.lastKnownLocationSynthetic}
          </Text>
        </View>

        <View style={[styles.divider, { backgroundColor: colors.borderSubtle }]} />

        <View style={styles.overviewRow}>
          <Text variant="bodySmall" muted style={{ fontWeight: '700', letterSpacing: 0.5 }}>
            DEVICE BATTERY OBSERVATION
          </Text>
          <View style={styles.batteryRow}>
            <Icon
              name="battery"
              size={13}
              color={snapshot.batteryHealth === 'low' ? primitive.color.semantic.warning : colors.text}
              style={{ marginRight: 4 }}
            />
            <Text
              variant="mono"
              style={{
                color: snapshot.batteryHealth === 'low' ? primitive.color.semantic.warning : colors.text,
                fontSize: 12,
                fontWeight: '700',
              }}
            >
              {snapshot.batteryPercent}% ({snapshot.batteryHealth.toUpperCase()})
            </Text>
          </View>
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
          <View style={styles.footerRow}>
            <Icon name="info" size={10} color={colors.textSubtle} style={{ marginRight: 4 }} />
            <Text variant="mono" style={{ color: colors.textSubtle, fontSize: 10 }}>
              {snapshot.syntheticDisclosure}
            </Text>
          </View>
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
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  batteryRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  divider: {
    height: 1,
    marginVertical: primitive.spacing[3],
  },
  matrixCard: {
    borderRadius: primitive.radius.lg,
    padding: primitive.spacing[4],
    borderWidth: 1,
  },
  channelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: primitive.spacing[2],
  },
  channelInfoCol: {
    flex: 1,
    marginRight: primitive.spacing[2],
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
