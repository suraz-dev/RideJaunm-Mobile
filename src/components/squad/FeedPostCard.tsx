/**
 * ============================================================================
 * COMMUNITY FEED POST CARD (R16 REFINED)
 * ============================================================================
 *
 * Coordinates:
 * 1. Community feed posts with author, timestamp, and body text.
 * 2. Route summary badge for trail condition posts with vector icons.
 * 3. Media placeholder simulation with low-data mode suppression.
 * 4. Component-local interactive previews (like, comment, share) with vector icons.
 */

import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { FixtureCommunityPost } from '../../domain/squadCommunity';
import { Text } from '../primitives/Text';
import { Badge } from '../primitives/Badge';
import { Icon } from '../primitives/Icon';
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
        return <Badge label="CACHED" variant="neutral" size="sm" />;
      case 'media_unavailable':
        return <Badge label="MEDIA UNAVAILABLE" variant="warning" size="sm" />;
      case 'local_draft':
        return <Badge label="LOCAL DRAFT" variant="cyan" size="sm" />;
      case 'hidden_preview':
        return <Badge label="HIDDEN PREVIEW" variant="neutral" size="sm" />;
    }
  };

  const handleAction = (actionName: string) => {
    setInteractionNotice(`${actionName} preview only · No network sync`);
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
              <Text variant="bodySmall" style={{ color: colors.textSubtle, fontSize: 11, fontFamily: 'Mukta_500Medium' }}>
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
        <Text variant="bodySmall" style={{ color: colors.textSubtle, marginTop: 4, fontFamily: 'Mukta_500Medium' }}>
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
          <View style={styles.routeBadgeRow}>
            <Icon name="route" size={13} color={primitive.color.volt[400]} style={{ marginRight: 6 }} />
            <Text variant="mono" style={{ color: primitive.color.volt[400], fontSize: 11, fontWeight: '700' }}>
              {post.routeSummary}
            </Text>
          </View>
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
          <View style={styles.mediaNoteRow}>
            <Icon name="wifi-off" size={13} color={colors.textSubtle} style={{ marginRight: 6 }} />
            <Text variant="mono" style={{ color: colors.textSubtle, fontSize: 11 }}>
              Low-data mode — media omitted
            </Text>
          </View>
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
          <View style={styles.mediaNoteRow}>
            <Icon name="alert-triangle" size={13} color={colors.textSubtle} style={{ marginRight: 6 }} />
            <Text variant="mono" style={{ color: colors.textSubtle, fontSize: 11 }}>
              Media unavailable in offline mode
            </Text>
          </View>
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
          <View style={styles.mediaNoteRow}>
            <Icon name="file-text" size={14} color={primitive.color.cyan[400]} style={{ marginRight: 6 }} />
            <Text variant="mono" style={{ color: primitive.color.cyan[400], fontSize: 12, fontWeight: '700' }}>
              {post.mediaCaption || 'Simulated Image Preview'}
            </Text>
          </View>
          <Text variant="mono" style={{ color: colors.textSubtle, fontSize: 10, marginTop: 4 }}>
            Visual preview · No remote image asset loaded
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
          <View style={styles.noticeRow}>
            <Icon name="info" size={12} color={primitive.color.cyan[400]} style={{ marginRight: 4 }} />
            <Text variant="mono" style={{ color: primitive.color.cyan[400], fontSize: 11, fontWeight: '700' }}>
              {interactionNotice}
            </Text>
          </View>
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
          <View style={styles.btnContentRow}>
            <Icon name="heart" size={13} color={colors.text} style={{ marginRight: 4 }} />
            <Text variant="mono" style={{ color: colors.text, fontSize: 12 }}>
              Like ({post.likesCount})
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionBtn, { borderColor: colors.borderSubtle }]}
          onPress={() => handleAction('Comment')}
          accessible
          accessibilityRole="button"
          accessibilityLabel={`Comment on post by ${post.author}`}
        >
          <View style={styles.btnContentRow}>
            <Icon name="message" size={13} color={colors.text} style={{ marginRight: 4 }} />
            <Text variant="mono" style={{ color: colors.text, fontSize: 12 }}>
              Comment ({post.commentsCount})
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionBtn, { borderColor: colors.borderSubtle }]}
          onPress={() => handleAction('Share')}
          accessible
          accessibilityRole="button"
          accessibilityLabel={`Share post by ${post.author}`}
        >
          <View style={styles.btnContentRow}>
            <Icon name="share" size={13} color={colors.textSubtle} style={{ marginRight: 4 }} />
            <Text variant="mono" style={{ color: colors.textSubtle, fontSize: 12 }}>
              Share
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Permanent Truth Disclosure */}
      <View style={[styles.cardFooter, { borderTopColor: colors.borderSubtle }]}>
        <View style={styles.footerRow}>
          <Icon name="info" size={10} color={colors.textSubtle} style={{ marginRight: 4 }} />
          <Text variant="mono" style={{ color: colors.textSubtle, fontSize: 10 }}>
            {post.syntheticDisclosure}
          </Text>
        </View>
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
  routeBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  mediaPlaceholderBox: {
    padding: primitive.spacing[4],
    borderRadius: primitive.radius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: primitive.spacing[3],
  },
  mediaNoteRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  noticeBox: {
    padding: primitive.spacing[3],
    borderRadius: primitive.radius.md,
    borderWidth: 1,
    marginTop: primitive.spacing[3],
  },
  noticeRow: {
    flexDirection: 'row',
    alignItems: 'center',
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
  btnContentRow: {
    flexDirection: 'row',
    alignItems: 'center',
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
