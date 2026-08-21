/**
 * ============================================================================
 * SOS CANCEL WINDOW MODAL (R15)
 * ============================================================================
 *
 * Coordinates:
 * 1. 10-Second simulated cancel window overlay after successful 3s hold trigger.
 * 2. Explicit safety truth copy: "SIMULATED SOS PREVIEW — no alert was sent."
 * 3. 48dp Cancel button that safely aborts without dispatching or persisting an incident.
 * 4. Deterministic component-local countdown timer.
 */

import React from 'react';
import { View, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import { Text } from '../primitives/Text';
import { Badge } from '../primitives/Badge';
import { useTheme } from '../../design/ThemeProvider';
import { primitive, safety } from '../../design/tokens';

export interface SOSCancelWindowModalProps {
  visible: boolean;
  countdown: number;
  onCancel: () => void;
}

export const SOSCancelWindowModal: React.FC<SOSCancelWindowModalProps> = ({
  visible,
  countdown,
  onCancel,
}) => {
  const { colors } = useTheme();

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View
          style={[
            styles.box,
            {
              backgroundColor: colors.surfaceElevated,
              borderColor: safety.sos.color,
            },
          ]}
          accessible
          accessibilityRole="alert"
          accessibilityLabel={`Simulated SOS cancellation window. Seconds remaining: ${countdown}. SIMULATED SOS PREVIEW — no alert was sent.`}
        >
          <Badge label="SIMULATED SOS PREVIEW" variant="danger" size="md" />

          <Text
            variant="h2"
            style={{
              color: safety.sos.color,
              marginTop: primitive.spacing[3],
              textAlign: 'center',
              fontWeight: '700',
            }}
          >
            SIMULATED SOS PREVIEW — no alert was sent.
          </Text>

          <Text variant="telemetryHero" style={{ color: safety.sos.color, marginVertical: primitive.spacing[3] }}>
            00:{countdown < 10 ? `0${countdown}` : countdown}
          </Text>

          <Text variant="bodyMedium" style={{ textAlign: 'center', color: colors.text, marginBottom: primitive.spacing[4] }}>
            Simulating 10-second deliberate cancellation window. Tap below to cancel and abort the simulated emergency packet.
          </Text>

          <TouchableOpacity
            style={[
              styles.cancelBtn,
              {
                backgroundColor: primitive.color.graphite[800],
                borderColor: colors.borderSubtle,
              },
            ]}
            onPress={onCancel}
            accessible
            accessibilityRole="button"
            accessibilityLabel="Cancel simulated SOS preview"
          >
            <Text variant="mono" style={{ color: primitive.color.snow[0], fontSize: 14, fontWeight: '700' }}>
              ✕ CANCEL SOS PREVIEW (रद्द गर्नुहोस्)
            </Text>
          </TouchableOpacity>

          <View style={[styles.footer, { borderTopColor: colors.borderSubtle }]}>
            <Text variant="mono" style={{ color: colors.textSubtle, fontSize: 10, textAlign: 'center' }}>
              ℹ️ Rehearsal grace window · No SMS, packet, or live call initiated
            </Text>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(5, 8, 7, 0.94)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: primitive.spacing[5],
  },
  box: {
    width: '100%',
    borderRadius: primitive.radius.xl,
    padding: primitive.spacing[5],
    alignItems: 'center',
    borderWidth: 2,
  },
  cancelBtn: {
    width: '100%',
    minHeight: 56,
    borderRadius: primitive.radius.md,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: primitive.spacing[3],
  },
  footer: {
    width: '100%',
    paddingTop: primitive.spacing[3],
    borderTopWidth: 0.5,
  },
});
