/**
 * ============================================================================
 * COMMUNITY FEED POST CARD (R13)
 * ============================================================================
 *
 * Coordinates:
 * 1. Pre-authored community feed posts with author, timestamp, and body text.
 * 2. Static route summary badge for trail condition posts.
 * 3. Media placeholder simulation with low-data mode suppression.
 * 4. Component-local interactive previews (like, comment, share) with permanent truth copy.
 * 5. 48dp minimum touch targets across all 4 themes (Night, Day Glare, Dusk, Blackout).
 */

import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { FixtureCommunityPost } from '../../domain/squadCommunity';
import { Text } from '../primitives/Text';
import { Badge } from '../primitives/Badge';
import { useTheme } from '../../design/ThemeProvider';
import { primitive } from '../../design/tokens';

export interface FeedPostCardProps {
  post: FixtureCommunityPost;
  isLowDataMode?: boolean;
}

export const FeedPostCard: React.FC<FeedPostCardProps> = ({
  post,
  isLowDataMode = false,
}) => {
  const { colors, mode } = useTheme();
  const isDayGlare = mode === 'dayGlare';

  const [interactionNotice, setInteractionNotice] = useState<string | null>(null);

  const getPostStateBadge = (state: FixtureCommunityPost['state']) => {
    switch (state) {
      case 'cached':
        return <Badge label="CACHED POST" variant="neutral" size="sm" />;
      case 'media_unavailable':
        return <Badge label="MEDIA UNAVAILABLE" variant="warning" size="sm" />;
      case 'local_draft':
        return <Badge label="LOCAL DRAFT" variant="cyan" size="sm" />;
      case 'hidden_preview':
        return <Badge label="HIDDEN PREVIEW" variant="neutral" size="sm" />;
    }
  };

  const handleAction = (actionName: string) => {
    setInteractionNotice(`${actionName} preview only · No outbox write or network sync`);
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
      accessibilityLabel={`Community post by ${post.author}. Status: ${post.state}. Content: ${post.body}`}
    >
      {/* Header Row: Author + Status Badge */}
      <View style={styles.headerRow}>
        <View style={styles.authorRow}>
          <View
            style={[
              styles.avatarCircle,
              {
                backgroundColor: isDayGlare ? primitive.color.snow[300] : colors.surfaceElevated,
                borderColor: colors.borderSubtle,
              },
            ]}
          >
            <Text variant="mono" style={{ color: colors.text, fontSize: 11, fontWeight: '700' }}>
              {post.avatarFallback}
            </Text>
          </View>
          <View style={styles.authorTextCol}>
            <Text variant="bodyMedium" style={{ fontWeight: '700', color: colors.text }}>
              {post.author}
            </Text>
            {post.authorNepali && (
              <Text variant="bodySmall" style={{ color: colors.textSubtle, fontSize: 11 }}>
                {post.authorNepali}
              </Text>
            )}
          </View>
        </View>
        {getPostStateBadge(post.state)}
      </View>

      {/* Post Body */}
      <Text variant="bodyMedium" style={[styles.bodyText, { color: colors.text }]}>
        {post.body}
      </Text>
      {post.bodyNepali && (
        <Text variant="bodySmall" style={{ color: colors.textSubtle, marginTop: 4 }}>
          {post.bodyNepali}
        </Text>
      )}

      {/* Optional Route Summary Badge */}
      {post.routeSummary && (
        <View
          style={[
            styles.routeBadgeBox,
            {
              backgroundColor: isDayGlare ? primitive.color.snow[50] : colors.surfaceElevated,
              borderColor: primitive.color.volt[500],
            },
          ]}
        >
          <Text variant="mono" style={{ color: primitive.color.volt[400], fontSize: 11, fontWeight: '700' }}>
            🗺️ {post.routeSummary}
          </Text>
        </View>
      )}

      {/* Media Placeholder Section */}
      {isLowDataMode ? (
        <View
          style={[
            styles.mediaPlaceholderBox,
            {
              backgroundColor: isDayGlare ? primitive.color.snow[50] : colors.surfaceCard,
              borderColor: colors.borderSubtle,
            },
          ]}
        >
          <Text variant="mono" style={{ color: colors.textSubtle, fontSize: 11, textAlign: 'center' }}>
            📡 Low-data fixture preview — no media loaded.
          </Text>
        </View>
      ) : post.state === 'media_unavailable' ? (
        <View
          style={[
            styles.mediaPlaceholderBox,
            {
              backgroundColor: isDayGlare ? primitive.color.snow[50] : colors.surfaceCard,
              borderColor: colors.borderSubtle,
            },
          ]}
        >
          <Text variant="mono" style={{ color: colors.textSubtle, fontSize: 11, textAlign: 'center' }}>
            ⚠️ Media unavailable in offline mode.
          </Text>
        </View>
      ) : post.mediaKind ? (
        <View
          style={[
            styles.mediaPlaceholderBox,
            {
              backgroundColor: isDayGlare ? primitive.color.snow[50] : colors.surfaceCard,
              borderColor: colors.borderSubtle,
            },
          ]}
        >
          <Text variant="mono" style={{ color: primitive.color.cyan[400], fontSize: 12, fontWeight: '700' }}>
            📷 {post.mediaCaption || 'Simulated Image Placeholder'}
          </Text>
          <Text variant="mono" style={{ color: colors.textSubtle, fontSize: 10, marginTop: 4 }}>
            Simulated visual placeholder · No remote image asset loaded
          </Text>
        </View>
      ) : null}

      {/* Interaction Notice */}
      {interactionNotice && (
        <View
          style={[
            styles.noticeBox,
            {
              backgroundColor: isDayGlare ? primitive.color.snow[50] : colors.surfaceElevated,
              borderColor: primitive.color.cyan[400],
            },
          ]}
        >
          <Text variant="mono" style={{ color: primitive.color.cyan[400], fontSize: 11, fontWeight: '700' }}>
            ℹ️ {interactionNotice}
          </Text>
        </View>
      )}

      {/* Action Bar (48dp Touch Targets) */}
      <View style={[styles.actionsRow, { borderTopColor: colors.borderSubtle }]}>
        <TouchableOpacity
          style={[styles.actionBtn, { borderColor: colors.borderSubtle }]}
          onPress={() => handleAction('Like')}
          accessible
          accessibilityRole="button"
          accessibilityLabel={`Like post by ${post.author}`}
        >
          <Text variant="mono" style={{ color: colors.text, fontSize: 12 }}>
            👍 Like ({post.likesCount})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionBtn, { borderColor: colors.borderSubtle }]}
          onPress={() => handleAction('Comment')}
          accessible
          accessibilityRole="button"
          accessibilityLabel={`Comment on post by ${post.author}`}
        >
          <Text variant="mono" style={{ color: colors.text, fontSize: 12 }}>
            💬 Comment ({post.commentsCount})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionBtn, { borderColor: colors.borderSubtle }]}
          onPress={() => handleAction('Share')}
          accessible
          accessibilityRole="button"
          accessibilityLabel={`Share post by ${post.author}`}
        >
          <Text variant="mono" style={{ color: colors.textSubtle, fontSize: 12 }}>
            🔗 Share
          </Text>
        </TouchableOpacity>
      </View>

      {/* Permanent Truth Disclosure */}
      <View style={[styles.cardFooter, { borderTopColor: colors.borderSubtle }]}>
        <Text variant="mono" style={{ color: colors.textSubtle, fontSize: 10 }}>
          ℹ️ {post.syntheticDisclosure}
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
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: primitive.spacing[3],
  },
  authorTextCol: {
    justifyContent: 'center',
  },
  bodyText: {
    lineHeight: 20,
  },
  routeBadgeBox: {
    padding: primitive.spacing[2],
    borderRadius: primitive.radius.md,
    borderWidth: 1,
    marginTop: primitive.spacing[3],
  },
  mediaPlaceholderBox: {
    padding: primitive.spacing[4],
    borderRadius: primitive.radius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: primitive.spacing[3],
  },
  noticeBox: {
    padding: primitive.spacing[3],
    borderRadius: primitive.radius.md,
    borderWidth: 1,
    marginTop: primitive.spacing[3],
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
