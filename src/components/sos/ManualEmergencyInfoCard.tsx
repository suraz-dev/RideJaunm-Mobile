/**
 * ============================================================================
 * MANUAL EMERGENCY INFO CARD (R15)
 * ============================================================================
 *
 * Coordinates:
 * 1. Disabled manual emergency helpline directory.
 * 2. Explicit truth copy: "Emergency resources require reviewed country configuration."
 * 3. Zero phone dialing, zero Linking.openURL, zero hard-coded dial actions.
 * 4. Strict safety invariant: Uses warning/neutral tokens (never SOS Red).
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from '../primitives/Text';
import { Badge } from '../primitives/Badge';
import { useTheme } from '../../design/ThemeProvider';
import { primitive } from '../../design/tokens';

export const ManualEmergencyInfoCard: React.FC = () => {
  const { colors, mode } = useTheme();
  const isDayGlare = mode === 'dayGlare';

  return (
    <View style={styles.container}>
      <Text variant="h3" style={[styles.sectionTitle, { color: colors.text }]}>
        Manual Emergency Helplines (Disabled)
      </Text>

      <View
        style={[
          styles.card,
          {
            backgroundColor: isDayGlare ? primitive.color.snow[50] : colors.surfaceCard,
            borderColor: colors.borderSubtle,
          },
        ]}
        accessible
        accessibilityRole="summary"
        accessibilityLabel="Manual emergency resources are disabled in preview. Emergency resources require reviewed country configuration."
      >
        <View style={styles.headerRow}>
          <Badge label="DIALING DISABLED" variant="neutral" size="sm" />
        </View>

        <Text variant="bodyMedium" style={{ fontWeight: '700', color: colors.textSubtle, marginTop: primitive.spacing[2] }}>
          Emergency resources require reviewed country configuration.
        </Text>

        <Text variant="mono" style={{ color: colors.textSubtle, fontSize: 11, marginTop: 4 }}>
          Direct carrier dialing and local emergency authority dispatch are disabled in this test build to prevent accidental false alarms.
        </Text>
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
  card: {
    borderRadius: primitive.radius.lg,
    padding: primitive.spacing[4],
    borderWidth: 1,
  },
  headerRow: {
    flexDirection: 'row',
  },
});
