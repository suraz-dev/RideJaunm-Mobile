/**
 * ============================================================================
 * SOS LIMITATION BANNER (R15)
 * ============================================================================
 *
 * Coordinates:
 * 1. Prominent limitation warning banner placed before the SOS hold trigger.
 * 2. Strict safety invariant: Uses warning/neutral tokens (never SOS Red).
 * 3. Explicit copy: "Safety preview only — this build cannot contact emergency services or your contacts."
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from '../primitives/Text';
import { Badge } from '../primitives/Badge';
import { useTheme } from '../../design/ThemeProvider';
import { primitive } from '../../design/tokens';

export const SOSLimitationBanner: React.FC = () => {
  const { colors, mode } = useTheme();
  const isDayGlare = mode === 'dayGlare';

  return (
    <View
      style={[
        styles.banner,
        {
          backgroundColor: isDayGlare ? primitive.color.snow[50] : colors.surfaceElevated,
          borderColor: primitive.color.semantic.warning,
        },
      ]}
      accessible
      accessibilityRole="alert"
      accessibilityLabel="Safety limitation: Safety preview only — this build cannot contact emergency services or your contacts."
    >
      <View style={styles.headerRow}>
        <Badge label="SAFETY PREVIEW ONLY" variant="warning" size="sm" />
      </View>
      <Text variant="bodyMedium" style={{ fontWeight: '700', color: colors.text, marginTop: 6 }}>
        Safety preview only — this build cannot contact emergency services or your contacts.
      </Text>
      <Text variant="mono" style={{ color: colors.textSubtle, fontSize: 11, marginTop: 4 }}>
        Rehearses the emergency interaction model locally. No GPS broadcast, cellular SMS, mesh packet, or emergency responder dispatch is initiated.
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  banner: {
    padding: primitive.spacing[4],
    borderRadius: primitive.radius.lg,
    borderWidth: 1.5,
    marginBottom: primitive.spacing[4],
  },
  headerRow: {
    flexDirection: 'row',
  },
});
