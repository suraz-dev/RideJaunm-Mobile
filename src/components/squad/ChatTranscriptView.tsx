/**
 * ============================================================================
 * CHAT TRANSCRIPT VIEW (R13)
 * ============================================================================
 *
 * Coordinates:
 * 1. Pre-authored group chat transcript messages.
 * 2. Visual presentation of message states ('cached', 'local_draft', 'preview_queued', 'failed_preview').
 * 3. Distinguishes current user drafts/messages from peer squad messages.
 * 4. Permanent synthetic disclosures on transcript items.
 * 5. Full theme compliance across Night, Day Glare, Dusk, Blackout.
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { FixtureChatMessage } from '../../domain/squadCommunity';
import { Text } from '../primitives/Text';
import { Badge } from '../primitives/Badge';
import { Icon } from '../primitives/Icon';
import { useTheme } from '../../design/ThemeProvider';
import { primitive } from '../../design/tokens';

export interface ChatTranscriptViewProps {
  messages: FixtureChatMessage[];
}

export const ChatTranscriptView: React.FC<ChatTranscriptViewProps> = ({ messages }) => {
  const { colors, mode } = useTheme();
  const isDayGlare = mode === 'dayGlare';

  const getMessageStateBadge = (state: FixtureChatMessage['state']) => {
    switch (state) {
      case 'cached':
        return <Badge label="CACHED" variant="neutral" size="sm" />;
      case 'local_draft':
        return <Badge label="LOCAL DRAFT" variant="cyan" size="sm" />;
      case 'preview_queued':
        return <Badge label="QUEUED" variant="neutral" size="sm" />;
      case 'failed_preview':
        return <Badge label="TRANSFER FAILED" variant="warning" size="sm" />;
    }
  };

  return (
    <View style={styles.container}>
      {messages.map((msg) => {
        const isUser = msg.isCurrentUser;
        return (
          <View
            key={msg.id}
            style={[
              styles.messageBubbleWrapper,
              isUser ? styles.userWrapper : styles.peerWrapper,
            ]}
            accessible
            accessibilityRole="text"
            accessibilityLabel={`${msg.author} says: ${msg.body}. Status: ${msg.state}.`}
          >
            <View
              style={[
                styles.bubble,
                {
                  backgroundColor: isUser
                    ? isDayGlare
                      ? primitive.color.snow[50]
                      : colors.surfaceElevated
                    : isDayGlare
                    ? primitive.color.snow[0]
                    : colors.surface,
                  borderColor: isUser ? primitive.color.cyan[400] : colors.borderSubtle,
                  borderWidth: 1,
                },
              ]}
            >
              {/* Author Row + State Badge */}
              <View style={styles.bubbleHeader}>
                <Text variant="bodySmall" style={{ fontWeight: '700', color: colors.text }}>
                  {msg.author}
                </Text>
                {getMessageStateBadge(msg.state)}
              </View>

              {/* Message Body */}
              <Text variant="bodyMedium" style={{ color: colors.text, marginTop: 4 }}>
                {msg.body}
              </Text>

              {/* Timestamp and synthetic disclosure */}
              <View style={[styles.bubbleFooter, { borderTopColor: colors.borderSubtle }]}>
                <View style={styles.footerRow}>
                  <Icon name="info" size={9} color={colors.textSubtle} style={{ marginRight: 4 }} />
                  <Text variant="mono" style={{ color: colors.textSubtle, fontSize: 9 }}>
                    {msg.syntheticDisclosure}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: primitive.spacing[4],
  },
  messageBubbleWrapper: {
    marginBottom: primitive.spacing[3],
    flexDirection: 'row',
  },
  userWrapper: {
    justifyContent: 'flex-end',
    paddingLeft: primitive.spacing[6],
  },
  peerWrapper: {
    justifyContent: 'flex-start',
    paddingRight: primitive.spacing[6],
  },
  bubble: {
    flex: 1,
    borderRadius: primitive.radius.lg,
    padding: primitive.spacing[3],
  },
  bubbleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: primitive.spacing[1],
  },
  bubbleFooter: {
    marginTop: primitive.spacing[2],
    paddingTop: primitive.spacing[1],
    borderTopWidth: 0.5,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
