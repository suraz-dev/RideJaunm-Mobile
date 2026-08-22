/**
 * ============================================================================
 * SQUAD, COMMUNITY FEED, AND CHAT SCREEN (R16 REFINED)
 * ============================================================================
 *
 * Coordinates:
 * 1. 3 Primary internal tabs: Feed, Groups, and Chat with vector icons.
 * 2. Feed tab: Post stream with Following/Nearby/Routes filters, low-data toggle, and local composer.
 * 3. Groups tab: Squad roster with qualified presence states and cache-only MapSurface preview.
 * 4. Chat tab: Group chat transcript with local message composer.
 * 5. Permanent synthetic preview disclaimers on every surface.
 */

import React, { useState, useMemo } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Text } from '../components/primitives/Text';
import { Badge } from '../components/primitives/Badge';
import { Icon, IconName } from '../components/primitives/Icon';
import { FeedPostCard } from '../components/squad/FeedPostCard';
import { FeedComposerCard } from '../components/squad/FeedComposerCard';
import { SquadRosterView } from '../components/squad/SquadRosterView';
import { ChatTranscriptView } from '../components/squad/ChatTranscriptView';
import { ChatComposerBar } from '../components/squad/ChatComposerBar';
import { useTheme } from '../design/ThemeProvider';
import { useAppState } from '../state/AppStateContext';
import { primitive } from '../design/tokens';
import { FeedFilterCategory } from '../domain/squadCommunity';
import {
  allFixtureCommunityPosts,
  primarySquadGroupFixture,
  allFixtureChatMessages,
} from '../fixtures/squadCommunity.fixture';

export type SquadPrimaryTab = 'feed' | 'groups' | 'chat';

export const SquadFeedScreen: React.FC = () => {
  const { colors, mode } = useTheme();
  const { connectionState } = useAppState();
  const isDayGlare = mode === 'dayGlare';

  const [activeTab, setActiveTab] = useState<SquadPrimaryTab>('feed');
  const [feedFilter, setFeedFilter] = useState<FeedFilterCategory>('following');
  const [isLowDataMode, setIsLowDataMode] = useState(false);

  const isOffline =
    connectionState.mode === 'deadZone' || connectionState.mode === 'meshOnly';

  const primaryTabs: { tab: SquadPrimaryTab; label: string; labelNepali: string; icon: IconName }[] = [
    { tab: 'feed', label: 'Feed', labelNepali: 'फिड', icon: 'file-text' },
    { tab: 'groups', label: 'Groups', labelNepali: 'समूह', icon: 'users' },
    { tab: 'chat', label: 'Chat', labelNepali: 'च्याट', icon: 'message' },
  ];

  const feedFilterTabs: { category: FeedFilterCategory; label: string; labelNepali: string }[] = [
    { category: 'following', label: 'Following', labelNepali: 'पछ्याइरहेको' },
    { category: 'nearby', label: 'Nearby', labelNepali: 'नजिकै' },
    { category: 'routes', label: 'Routes', labelNepali: 'मार्गहरू' },
  ];

  const filteredPosts = useMemo(() => {
    return allFixtureCommunityPosts.filter(
      (p) => p.filterCategory === feedFilter && p.state !== 'hidden_preview'
    );
  }, [feedFilter]);

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
    >
      {/* Screen Title & Subtitle */}
      <Text variant="h1" style={{ color: colors.text }}>
        Himalayan Squad & Community
      </Text>
      <Text variant="bodyMedium" muted style={styles.subtitle}>
        Simulated trail reports, squad coordination, and group communication.
      </Text>

      {/* Top Synthetic Preview Disclaimer */}
      <View
        style={[
          styles.disclaimerBanner,
          {
            backgroundColor: isDayGlare ? primitive.color.snow[50] : colors.surfaceElevated,
            borderColor: colors.borderSubtle,
          },
        ]}
      >
        <Badge label="SYNTHETIC PREVIEW" variant="neutral" size="sm" />
        <Text variant="mono" style={{ color: colors.textSubtle, fontSize: 10, marginTop: 4 }}>
          Deterministic local fixtures · No live location, chat delivery, media uploads, or remote tracking.
        </Text>
      </View>

      {/* Offline/Mesh Banner */}
      {isOffline && (
        <View
          style={[
            styles.offlineBanner,
            {
              backgroundColor: isDayGlare ? primitive.color.snow[50] : colors.surfaceCard,
              borderColor: primitive.color.semantic.warning,
            },
          ]}
        >
          <Badge
            label="OFFLINE MESH MODE"
            variant="warning"
            size="sm"
            icon={<Icon name="wifi-off" size={11} color={primitive.color.semantic.warning} />}
          />
          <Text variant="bodySmall" style={{ color: colors.text, marginTop: 4, fontWeight: '600' }}>
            Operating in offline dead-zone / mesh mode.
          </Text>
          <Text variant="mono" style={{ color: colors.textSubtle, fontSize: 10, marginTop: 2 }}>
            Feed, squad, and chat are rendered from cached local fixtures. No remote data transfers active.
          </Text>
        </View>
      )}

      {/* 3 Primary Navigation Tabs (Feed, Groups, Chat) */}
      <View
        style={[styles.primaryTablist, { backgroundColor: colors.surface, borderColor: colors.border }]}
        accessibilityRole="tablist"
        accessibilityLabel="Squad main navigation tabs"
      >
        {primaryTabs.map((t) => {
          const isTabActive = activeTab === t.tab;
          return (
            <TouchableOpacity
              key={t.tab}
              style={[
                styles.primaryTab,
                {
                  backgroundColor: isTabActive ? colors.surfaceElevated : 'transparent',
                  borderColor: isTabActive ? primitive.color.volt[400] : 'transparent',
                },
              ]}
              onPress={() => setActiveTab(t.tab)}
              accessible
              accessibilityRole="tab"
              accessibilityState={{ selected: isTabActive }}
              accessibilityLabel={`Select ${t.label} tab (${t.labelNepali})`}
            >
              <View style={styles.primaryTabRow}>
                <Icon
                  name={t.icon}
                  size={14}
                  color={isTabActive ? primitive.color.volt[400] : colors.textMuted}
                  style={{ marginRight: 6 }}
                />
                <Text
                  variant="bodySmall"
                  style={{
                    color: isTabActive ? colors.text : colors.textMuted,
                    fontWeight: isTabActive ? '700' : '500',
                    fontSize: 12,
                  }}
                >
                  {t.label}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* TAB 1: FEED */}
      {activeTab === 'feed' && (
        <View style={styles.tabContentSection}>
          {/* Feed Filter Controls + Low Data Toggle */}
          <View style={styles.feedControlsRow}>
            <View
              style={[styles.filterSubTablist, { borderColor: colors.borderSubtle }]}
              accessibilityRole="tablist"
              accessibilityLabel="Feed filter categories"
            >
              {feedFilterTabs.map((f) => {
                const isFilterActive = feedFilter === f.category;
                return (
                  <TouchableOpacity
                    key={f.category}
                    style={[
                      styles.filterSubTab,
                      {
                        backgroundColor: isFilterActive ? colors.surfaceElevated : 'transparent',
                        borderColor: isFilterActive ? primitive.color.volt[400] : 'transparent',
                      },
                    ]}
                    onPress={() => setFeedFilter(f.category)}
                    accessible
                    accessibilityRole="tab"
                    accessibilityState={{ selected: isFilterActive }}
                    accessibilityLabel={`Filter ${f.label} (${f.labelNepali})`}
                  >
                    <Text
                      variant="bodySmall"
                      style={{
                        color: isFilterActive ? colors.text : colors.textMuted,
                        fontWeight: isFilterActive ? '700' : '500',
                        fontSize: 11,
                      }}
                    >
                      {f.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Low-Data Toggle Button */}
            <TouchableOpacity
              style={[
                styles.lowDataBtn,
                {
                  backgroundColor: isLowDataMode ? primitive.color.snow[50] : colors.surface,
                  borderColor: isLowDataMode ? primitive.color.volt[400] : colors.borderSubtle,
                },
              ]}
              onPress={() => setIsLowDataMode(!isLowDataMode)}
              accessible
              accessibilityRole="button"
              accessibilityLabel={isLowDataMode ? 'Disable low-data mode preview' : 'Enable low-data mode preview'}
            >
              <View style={styles.lowDataRow}>
                <Icon
                  name="wifi-off"
                  size={12}
                  color={isLowDataMode ? primitive.color.volt[400] : colors.textSubtle}
                  style={{ marginRight: 4 }}
                />
                <Text variant="mono" style={{ color: isLowDataMode ? primitive.color.volt[400] : colors.textSubtle, fontSize: 10, fontWeight: '700' }}>
                  {isLowDataMode ? 'Low Data: ON' : 'Low Data: OFF'}
                </Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Local Post Composer */}
          <FeedComposerCard />

          {/* Post Stream */}
          <View style={styles.postsList}>
            {filteredPosts.length === 0 ? (
              <View style={[styles.emptyBox, { backgroundColor: colors.surfaceCard, borderColor: colors.borderSubtle }]}>
                <Text variant="bodyMedium" muted style={{ textAlign: 'center' }}>
                  No community posts match the selected filter.
                </Text>
              </View>
            ) : (
              filteredPosts.map((post) => (
                <FeedPostCard key={post.id} post={post} isLowDataMode={isLowDataMode} />
              ))
            )}
          </View>
        </View>
      )}

      {/* TAB 2: GROUPS / SQUAD CONTEXT */}
      {activeTab === 'groups' && (
        <View style={styles.tabContentSection}>
          <SquadRosterView group={primarySquadGroupFixture} />
        </View>
      )}

      {/* TAB 3: CHAT */}
      {activeTab === 'chat' && (
        <View style={styles.tabContentSection}>
          <View style={styles.chatHeaderBox}>
            <Text variant="h3" style={{ color: colors.text }}>
              {primarySquadGroupFixture.name} — Chat
            </Text>
            <Badge label="CACHED TRANSCRIPT" variant="neutral" size="sm" />
          </View>

          {/* Chat Messages */}
          <ChatTranscriptView messages={allFixtureChatMessages} />

          {/* Chat Composer */}
          <ChatComposerBar />
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: primitive.spacing[4],
    paddingTop: 56,
    paddingBottom: 120,
  },
  subtitle: {
    marginTop: primitive.spacing[1],
    marginBottom: primitive.spacing[3],
  },
  disclaimerBanner: {
    padding: primitive.spacing[3],
    borderRadius: primitive.radius.md,
    borderWidth: 1,
    marginBottom: primitive.spacing[4],
  },
  offlineBanner: {
    padding: primitive.spacing[3],
    borderRadius: primitive.radius.md,
    borderWidth: 1,
    marginBottom: primitive.spacing[4],
  },
  primaryTablist: {
    flexDirection: 'row',
    borderRadius: primitive.radius.md,
    padding: 2,
    borderWidth: 1,
    marginBottom: primitive.spacing[4],
  },
  primaryTab: {
    flex: 1,
    minHeight: 48,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: primitive.radius.sm,
    borderWidth: 1.5,
  },
  primaryTabRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tabContentSection: {
    marginBottom: primitive.spacing[4],
  },
  feedControlsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: primitive.spacing[3],
    gap: primitive.spacing[2],
  },
  filterSubTablist: {
    flex: 1,
    flexDirection: 'row',
    borderRadius: primitive.radius.md,
    borderWidth: 1,
    padding: 2,
  },
  filterSubTab: {
    flex: 1,
    minHeight: 48,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: primitive.radius.sm,
    borderWidth: 1,
  },
  lowDataBtn: {
    minHeight: 48,
    paddingHorizontal: primitive.spacing[3],
    borderRadius: primitive.radius.md,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  lowDataRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  postsList: {
    marginTop: primitive.spacing[2],
  },
  chatHeaderBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: primitive.spacing[3],
  },
  emptyBox: {
    padding: primitive.spacing[4],
    borderRadius: primitive.radius.md,
    borderWidth: 1,
  },
});
