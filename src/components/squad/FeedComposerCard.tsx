/**
 * ============================================================================
 * FEED COMPOSER CARD (R13)
 * ============================================================================
 *
 * Coordinates:
 * 1. Component-local draft text editing for simulated post creation.
 * 2. "Publish Preview" action with permanent truth notice: "No post was published or queued."
 * 3. 48dp minimum touch target.
 * 4. Zero network calls, zero outbox writes, zero persistent storage mutations.
 */

import React, { useState } from 'react';
import { View, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { Text } from '../primitives/Text';
import { Badge } from '../primitives/Badge';
import { useTheme } from '../../design/ThemeProvider';
import { primitive } from '../../design/tokens';

export const FeedComposerCard: React.FC = () => {
  const { colors, mode } = useTheme();
  const isDayGlare = mode === 'dayGlare';

  const [draftText, setDraftText] = useState('');
  const [publishNotice, setPublishNotice] = useState<string | null>(null);

  const handlePublish = () => {
    setPublishNotice('No post was published or queued.');
  };

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: isDayGlare ? primitive.color.snow[0] : colors.surface,
          borderColor: colors.border,
        },
      ]}
      accessible
      accessibilityRole="summary"
      accessibilityLabel="Simulated community post composer"
    >
      <View style={styles.headerRow}>
        <Text variant="h3" style={{ color: colors.text }}>
          Post an Update (नयाँ अपडेट)
        </Text>
        <Badge label="LOCAL DRAFT" variant="neutral" size="sm" />
      </View>

      <TextInput
        style={[
          styles.textInput,
          {
            backgroundColor: isDayGlare ? primitive.color.snow[50] : colors.surfaceElevated,
            borderColor: colors.borderSubtle,
            color: colors.text,
          },
        ]}
        placeholder="Share trail conditions, road hazards, or ride reports..."
        placeholderTextColor={colors.textSubtle}
        multiline
        numberOfLines={3}
        value={draftText}
        onChangeText={setDraftText}
        accessible
        accessibilityLabel="Community post draft text input"
      />

      {publishNotice && (
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
            ℹ️ {publishNotice}
          </Text>
        </View>
      )}

      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={[
            styles.publishBtn,
            {
              backgroundColor: primitive.color.volt[400],
              borderColor: primitive.color.volt[500],
            },
          ]}
          onPress={handlePublish}
          accessible
          accessibilityRole="button"
          accessibilityLabel="Publish post preview"
        >
          <Text variant="mono" style={{ color: primitive.color.graphite[950], fontSize: 12, fontWeight: '700' }}>
            PUBLISH PREVIEW
          </Text>
        </TouchableOpacity>
      </View>

      <View style={[styles.cardFooter, { borderTopColor: colors.borderSubtle }]}>
        <Text variant="mono" style={{ color: colors.textSubtle, fontSize: 10 }}>
          ℹ️ Component-local draft · No post was published or queued
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: primitive.radius.lg,
    padding: primitive.spacing[4],
    marginBottom: primitive.spacing[4],
    borderWidth: 1,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: primitive.spacing[3],
  },
  textInput: {
    minHeight: 72,
    borderRadius: primitive.radius.md,
    padding: primitive.spacing[3],
    borderWidth: 1,
    fontSize: 14,
    textAlignVertical: 'top',
    marginBottom: primitive.spacing[3],
  },
  noticeBox: {
    padding: primitive.spacing[3],
    borderRadius: primitive.radius.md,
    borderWidth: 1,
    marginBottom: primitive.spacing[3],
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  publishBtn: {
    minHeight: 48,
    minWidth: 140,
    paddingHorizontal: primitive.spacing[4],
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
