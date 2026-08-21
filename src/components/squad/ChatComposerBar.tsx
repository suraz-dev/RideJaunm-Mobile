/**
 * ============================================================================
 * CHAT COMPOSER BAR (R13)
 * ============================================================================
 *
 * Coordinates:
 * 1. Component-local draft message editing.
 * 2. "Send Preview" button with permanent truth disclosure:
 *    "No message was sent, queued, or delivered."
 * 3. 48dp minimum touch target.
 * 4. Zero messaging provider network calls, zero outbox writes.
 */

import React, { useState } from 'react';
import { View, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { Text } from '../primitives/Text';
import { useTheme } from '../../design/ThemeProvider';
import { primitive } from '../../design/tokens';

export const ChatComposerBar: React.FC = () => {
  const { colors, mode } = useTheme();
  const isDayGlare = mode === 'dayGlare';

  const [draftMessage, setDraftMessage] = useState('');
  const [sendNotice, setSendNotice] = useState<string | null>(null);

  const handleSend = () => {
    setSendNotice('No message was sent, queued, or delivered.');
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: isDayGlare ? primitive.color.snow[0] : colors.surface,
          borderColor: colors.border,
        },
      ]}
      accessible
      accessibilityRole="summary"
      accessibilityLabel="Simulated group chat composer"
    >
      {sendNotice && (
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
            ℹ️ {sendNotice}
          </Text>
        </View>
      )}

      <View style={styles.inputRow}>
        <TextInput
          style={[
            styles.textInput,
            {
              backgroundColor: isDayGlare ? primitive.color.snow[50] : colors.surfaceElevated,
              borderColor: colors.borderSubtle,
              color: colors.text,
            },
          ]}
          placeholder="Message Himalayan Riders KT-04..."
          placeholderTextColor={colors.textSubtle}
          value={draftMessage}
          onChangeText={setDraftMessage}
          accessible
          accessibilityLabel="Squad chat draft message text input"
        />

        <TouchableOpacity
          style={[
            styles.sendBtn,
            {
              backgroundColor: primitive.color.volt[400],
              borderColor: primitive.color.volt[500],
            },
          ]}
          onPress={handleSend}
          accessible
          accessibilityRole="button"
          accessibilityLabel="Send chat message preview"
        >
          <Text variant="mono" style={{ color: primitive.color.graphite[950], fontSize: 11, fontWeight: '700' }}>
            SEND PREVIEW
          </Text>
        </TouchableOpacity>
      </View>

      <View style={[styles.barFooter, { borderTopColor: colors.borderSubtle }]}>
        <Text variant="mono" style={{ color: colors.textSubtle, fontSize: 9 }}>
          ℹ️ Local message composer · No message was sent, queued, or delivered
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: primitive.radius.lg,
    padding: primitive.spacing[3],
    borderWidth: 1,
    marginTop: primitive.spacing[3],
    marginBottom: primitive.spacing[4],
  },
  noticeBox: {
    padding: primitive.spacing[3],
    borderRadius: primitive.radius.md,
    borderWidth: 1,
    marginBottom: primitive.spacing[2],
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: primitive.spacing[2],
  },
  textInput: {
    flex: 1,
    minHeight: 48,
    borderRadius: primitive.radius.md,
    paddingHorizontal: primitive.spacing[3],
    borderWidth: 1,
    fontSize: 13,
  },
  sendBtn: {
    minHeight: 48,
    minWidth: 110,
    paddingHorizontal: primitive.spacing[3],
    borderRadius: primitive.radius.md,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  barFooter: {
    marginTop: primitive.spacing[2],
    paddingTop: primitive.spacing[1],
    borderTopWidth: 0.5,
  },
});
