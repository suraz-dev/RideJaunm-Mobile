/**
 * ============================================================================
 * FIXTURE TRIP READINESS & SQUAD HANDOFF SCREEN (R16 REFINED)
 * ============================================================================
 *
 * Coordinates:
 * 1. Squad roster inspection and local role reassignment (Lead, Sweep, Rider).
 * 2. Local validation states for lead/sweep assignment.
 * 3. 6-Category pre-ride readiness facts with vector icons.
 * 4. Synthetic invite and save actions with explicit no-send/no-save confirmations.
 * 5. Offline/mesh banner handling in dead-zone and meshOnly states.
 */

import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Text } from '../components/primitives/Text';
import { Badge } from '../components/primitives/Badge';
import { Button } from '../components/primitives/Button';
import { Icon, IconName } from '../components/primitives/Icon';
import { SquadRosterCard } from '../components/planner/SquadRosterCard';
import { useTheme } from '../design/ThemeProvider';
import { useAppState } from '../state/AppStateContext';
import { primitive } from '../design/tokens';
import {
  FixtureSquadMember,
  FixtureTripRole,
} from '../domain/tripReadiness';
import {
  fixtureSquadMembers,
  fixtureTripReadinessChecklist,
} from '../fixtures/tripReadiness.fixture';

export interface TripReadinessScreenProps {
  onBackToPlanner?: () => void;
}

export const TripReadinessScreen: React.FC<TripReadinessScreenProps> = ({
  onBackToPlanner,
}) => {
  const { colors, mode } = useTheme();
  const { connectionState } = useAppState();
  const isDayGlare = mode === 'dayGlare';

  const [members, setMembers] = useState<FixtureSquadMember[]>(fixtureSquadMembers);
  const [inviteNotice, setInviteNotice] = useState<string | null>(null);
  const [saveNotice, setSaveNotice] = useState<string | null>(null);

  const isOffline =
    connectionState.mode === 'deadZone' || connectionState.mode === 'meshOnly';

  // Role reassignment handler
  const handleRoleChange = (memberId: string, newRole: FixtureTripRole) => {
    setMembers((prev) =>
      prev.map((m) => (m.id === memberId ? { ...m, role: newRole } : m))
    );
  };

  // Synthetic invite preview toggle
  const handleToggleInvite = (memberId: string) => {
    setMembers((prev) =>
      prev.map((m) => {
        if (m.id === memberId) {
          const nextState =
            m.inviteState === 'not_invited' ? 'preview_pending' : 'not_invited';
          return { ...m, inviteState: nextState };
        }
        return m;
      })
    );
    setInviteNotice('No invitation was sent · Synthetic preview only');
  };

  // Synthetic save preview action
  const handleSavePreview = () => {
    setSaveNotice('No trip was saved · Local preview only');
  };

  // Check if lead and sweep are designated
  const hasLead = members.some((m) => m.role === 'lead');
  const hasSweep = members.some((m) => m.role === 'sweep');

  const getCategoryIconName = (category: string): IconName => {
    switch (category) {
      case 'route':
        return 'route';
      case 'offline_map':
        return 'download';
      case 'permit':
        return 'shield-check';
      case 'fuel':
        return 'flame';
      case 'weather':
        return 'mountain';
      case 'safety':
      default:
        return 'shield';
    }
  };

  const getReadinessBadgeVariant = (state: string) => {
    switch (state) {
      case 'ready':
        return 'volt';
      case 'attention':
      case 'blocked':
        return 'warning';
      case 'unknown':
      default:
        return 'neutral';
    }
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
    >
      {/* Return Button */}
      {onBackToPlanner && (
        <TouchableOpacity
          style={[styles.backBtn, { borderColor: colors.borderSubtle }]}
          onPress={onBackToPlanner}
          accessible
          accessibilityRole="button"
          accessibilityLabel="Back to Trip Planner screen"
        >
          <View style={styles.backRow}>
            <Icon name="chevron-left" size={16} color={primitive.color.cyan[400]} style={{ marginRight: 4 }} />
            <Text variant="mono" style={{ color: primitive.color.cyan[400], fontSize: 13, fontWeight: '600' }}>
              Back to Trip Planner (यात्रा योजना)
            </Text>
          </View>
        </TouchableOpacity>
      )}

      {/* Screen Title & Subtitle */}
      <Text variant="h1" style={{ color: colors.text }}>
        Fixture Trip Readiness — Local Preview
      </Text>
      <Text variant="bodyMedium" muted style={styles.subtitle}>
        Pre-ride squad roster, role assignment, and multi-factor readiness verification.
      </Text>

      {/* Offline/Mesh Mode Notice Banner */}
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
            All squad readiness facts are stored locally. No remote syncing or invitation delivery performed.
          </Text>
        </View>
      )}

      {/* 1. Squad Roster Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeaderRow}>
          <View style={styles.headerTitleRow}>
            <Icon name="users" size={18} color={primitive.color.volt[400]} style={{ marginRight: 6 }} />
            <Text variant="h2" style={{ color: colors.text }}>
              Squad Roster & Roles (टोली रोस्टर)
            </Text>
          </View>
          <Badge label={`${members.length} MEMBERS`} variant="supercurvy" size="sm" />
        </View>

        {/* Lead/Sweep Validation Notice */}
        {(!hasLead || !hasSweep) && (
          <View
            style={[
              styles.validationNotice,
              {
                backgroundColor: isDayGlare ? primitive.color.snow[50] : colors.surfaceCard,
                borderColor: primitive.color.semantic.warning,
              },
            ]}
          >
            <View style={styles.validationRow}>
              <Icon name="alert-triangle" size={14} color={primitive.color.semantic.warning} style={{ marginRight: 6 }} />
              <Text variant="bodySmall" style={{ color: primitive.color.semantic.warning, fontWeight: '700', flex: 1 }}>
                Role Validation: {!hasLead ? 'No Lead designated. ' : ''}{!hasSweep ? 'No Sweep designated. ' : ''}
              </Text>
            </View>
            <Text variant="mono" style={{ color: colors.textSubtle, fontSize: 10, marginTop: 2 }}>
              Local role assignment is for pre-ride planning only (no remote dispatch).
            </Text>
          </View>
        )}

        {/* Invite action feedback message */}
        {inviteNotice && (
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
              <Icon name="info" size={13} color={primitive.color.cyan[400]} style={{ marginRight: 4 }} />
              <Text variant="mono" style={{ color: primitive.color.cyan[400], fontSize: 11, fontWeight: '700' }}>
                {inviteNotice}
              </Text>
            </View>
          </View>
        )}

        {/* Roster Cards */}
        {members.map((member) => (
          <SquadRosterCard
            key={member.id}
            member={member}
            onRoleChange={handleRoleChange}
            onToggleInvite={handleToggleInvite}
          />
        ))}
      </View>

      {/* 2. Pre-Ride Readiness Checklist */}
      <View style={styles.section}>
        <View style={styles.sectionHeaderRow}>
          <View style={styles.headerTitleRow}>
            <Icon name="shield-check" size={18} color={primitive.color.volt[400]} style={{ marginRight: 6 }} />
            <Text variant="h2" style={{ color: colors.text }}>
              Pre-Ride Readiness (तयारी विवरण)
            </Text>
          </View>
          <Badge label="6 FACTORS" variant="volt" size="sm" />
        </View>

        {fixtureTripReadinessChecklist.map((item) => (
          <View
            key={item.id}
            style={[
              styles.readinessCard,
              {
                backgroundColor: isDayGlare ? primitive.color.snow[0] : colors.surface,
                borderColor: colors.border,
              },
            ]}
            accessible
            accessibilityLabel={`Readiness factor: ${item.title}. Status: ${item.state}. Detail: ${item.detail}`}
          >
            <View style={styles.checklistHeader}>
              <View style={styles.categoryBadgeCluster}>
                <Icon name={getCategoryIconName(item.category)} size={14} color={colors.textSubtle} style={{ marginRight: 6 }} />
                <Badge
                  label={item.category.toUpperCase()}
                  variant="neutral"
                  size="sm"
                />
              </View>
              <Badge
                label={item.state.toUpperCase()}
                variant={getReadinessBadgeVariant(item.state)}
                size="sm"
              />
            </View>

            <Text variant="h3" style={{ color: colors.text, marginTop: primitive.spacing[2] }}>
              {item.title}
            </Text>
            {item.titleNepali && (
              <Text variant="bodySmall" style={{ color: colors.textSubtle, marginTop: 1, fontFamily: 'Mukta_500Medium' }}>
                {item.titleNepali}
              </Text>
            )}
            <Text variant="bodyMedium" muted style={{ marginTop: primitive.spacing[2] }}>
              {item.detail}
            </Text>

            {/* Provenance & Synthetic Disclosure */}
            <View style={[styles.checklistFooter, { borderTopColor: colors.borderSubtle }]}>
              <Text variant="mono" style={{ color: colors.textSubtle, fontSize: 10 }}>
                Source: {item.sourceVersion} · {item.syntheticDisclosure}
              </Text>
            </View>
          </View>
        ))}
      </View>

      {/* 3. Save Preview Action Card */}
      <View style={[styles.saveCard, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}>
        <Text variant="h3" style={{ color: colors.text }}>
          Trip Plan & Squad Readiness
        </Text>
        <Text variant="mono" style={{ color: colors.textSubtle, fontSize: 10, marginTop: 2 }}>
          Squad preview · No saved trips or server invitations generated.
        </Text>

        {saveNotice && (
          <View
            style={[
              styles.noticeBox,
              {
                backgroundColor: isDayGlare ? primitive.color.snow[50] : colors.surface,
                borderColor: primitive.color.volt[400],
                marginTop: primitive.spacing[3],
              },
            ]}
          >
            <View style={styles.noticeRow}>
              <Icon name="check" size={13} color={primitive.color.volt[400]} style={{ marginRight: 4 }} />
              <Text variant="mono" style={{ color: primitive.color.volt[400], fontSize: 12, fontWeight: '700' }}>
                {saveNotice}
              </Text>
            </View>
          </View>
        )}

        <Button
          label="SAVE TRIP PREVIEW (पूर्वावलोकन सुरक्षित)"
          onPress={handleSavePreview}
          variant="primary"
          icon={<Icon name="check" size={16} color={primitive.color.graphite[950]} strokeWidth={2.5} />}
          style={{ marginTop: primitive.spacing[3], minHeight: 48 }}
        />
      </View>
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
  backBtn: {
    minHeight: 48,
    justifyContent: 'center',
    marginBottom: primitive.spacing[3],
  },
  backRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  subtitle: {
    marginTop: primitive.spacing[1],
    marginBottom: primitive.spacing[4],
  },
  offlineBanner: {
    padding: primitive.spacing[3],
    borderRadius: primitive.radius.md,
    borderWidth: 1,
    marginBottom: primitive.spacing[4],
  },
  section: {
    marginBottom: primitive.spacing[4],
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: primitive.spacing[3],
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  validationNotice: {
    padding: primitive.spacing[3],
    borderRadius: primitive.radius.md,
    borderWidth: 1,
    marginBottom: primitive.spacing[3],
  },
  validationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  noticeBox: {
    padding: primitive.spacing[3],
    borderRadius: primitive.radius.md,
    borderWidth: 1,
    marginBottom: primitive.spacing[3],
  },
  noticeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  readinessCard: {
    borderRadius: primitive.radius.lg,
    padding: primitive.spacing[4],
    marginBottom: primitive.spacing[3],
    borderWidth: 1,
  },
  checklistHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryBadgeCluster: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checklistFooter: {
    marginTop: primitive.spacing[3],
    paddingTop: primitive.spacing[2],
    borderTopWidth: 0.5,
  },
  saveCard: {
    padding: primitive.spacing[4],
    borderRadius: primitive.radius.lg,
    borderWidth: 1,
    marginTop: primitive.spacing[2],
  },
});
