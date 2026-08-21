/**
 * ============================================================================
 * SQUAD ROSTER CARD COMPONENT (R11)
 * ============================================================================
 *
 * WHY THIS EXISTS:
 * Renders individual squad member cards with local role selection (Lead,
 * Sweep, Rider) using radiogroup semantics, readiness badges, and synthetic
 * invite preview actions.
 *
 * ACCESSIBILITY & SAFETY INVARIANTS:
 * 1. Minimum touch target of 48 dp for role radio buttons and action buttons.
 * 2. Role radiogroup announces member name, role, and selection state.
 * 3. Never uses SOS Red (#FF1F3D) for warnings or member status.
 * 4. Discloses that no real invitations are sent on every card.
 * 5. Zero raw hex/RGBA; uses semantic theme tokens.
 */

import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { FixtureSquadMember, FixtureTripRole } from '../../domain/tripReadiness';
import { Text } from '../primitives/Text';
import { Badge } from '../primitives/Badge';
import { Button } from '../primitives/Button';
import { useTheme } from '../../design/ThemeProvider';
import { primitive } from '../../design/tokens';

export interface SquadRosterCardProps {
  member: FixtureSquadMember;
  onRoleChange: (memberId: string, newRole: FixtureTripRole) => void;
  onToggleInvite: (memberId: string) => void;
}

export const SquadRosterCard: React.FC<SquadRosterCardProps> = ({
  member,
  onRoleChange,
  onToggleInvite,
}) => {
  const { colors, mode } = useTheme();
  const isDayGlare = mode === 'dayGlare';

  const roles: { role: FixtureTripRole; label: string; labelNepali: string }[] = [
    { role: 'lead', label: 'Lead', labelNepali: 'नेतृत्व' },
    { role: 'sweep', label: 'Sweep', labelNepali: 'अन्तिम सवार' },
    { role: 'rider', label: 'Rider', labelNepali: 'सवार' },
  ];

  const getReadinessBadgeVariant = (state: string) => {
    switch (state) {
      case 'ready':
        return 'volt';
      case 'attention':
      case 'blocked':
        return 'warning'; // Non-SOS semantic treatment (SOS Red reserved strictly for emergencies)
      case 'unknown':
      default:
        return 'neutral';
    }
  };

  const isInvitePending = member.inviteState === 'preview_pending';
  const isNotInvited = member.inviteState === 'not_invited';

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
      accessibilityLabel={`Squad member: ${member.displayName}, Role: ${member.role}. Invite state: ${member.inviteState}`}
    >
      {/* Member Header Row */}
      <View style={styles.headerRow}>
        <View style={styles.memberInfo}>
          <Text variant="bodyLarge" style={{ color: colors.text, fontWeight: '700' }}>
            {member.displayName}
          </Text>
          {member.displayNameNepali && (
            <Text variant="bodySmall" style={{ color: colors.textSubtle }}>
              {member.displayNameNepali}
            </Text>
          )}
        </View>
        <Badge
          label={
            member.role === 'lead'
              ? '👑 SQUAD LEAD'
              : member.role === 'sweep'
              ? '🛡️ SWEEP'
              : '🏍️ RIDER'
          }
          variant={member.role === 'lead' ? 'volt' : member.role === 'sweep' ? 'supercurvy' : 'cyan'}
          size="sm"
        />
      </View>

      {/* Role Selection Radiogroup */}
      <View
        style={[styles.roleRadiogroup, { borderColor: colors.borderSubtle }]}
        accessibilityRole="radiogroup"
        accessibilityLabel={`Role assignment for ${member.displayName}`}
      >
        {roles.map((r) => {
          const isSelected = member.role === r.role;
          return (
            <TouchableOpacity
              key={r.role}
              style={[
                styles.roleOption,
                {
                  backgroundColor: isSelected ? colors.surfaceElevated : 'transparent',
                  borderColor: isSelected ? primitive.color.volt[400] : colors.borderSubtle,
                },
              ]}
              onPress={() => onRoleChange(member.id, r.role)}
              accessible
              accessibilityRole="radio"
              accessibilityState={{ selected: isSelected }}
              accessibilityLabel={`${member.displayName} role: ${r.label} (${r.labelNepali})`}
            >
              <Text
                variant="mono"
                style={{
                  color: isSelected ? colors.text : colors.textMuted,
                  fontSize: 11,
                  fontWeight: isSelected ? '700' : '500',
                }}
              >
                {r.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Member Readiness Badges */}
      <View style={styles.readinessRow}>
        <View style={styles.readinessItem}>
          <Text variant="mono" style={{ color: colors.textSubtle, fontSize: 10 }}>
            MAP:
          </Text>
          <Badge
            label={member.offlineMapState.toUpperCase()}
            variant={getReadinessBadgeVariant(member.offlineMapState)}
            size="sm"
            style={{ marginLeft: 4 }}
          />
        </View>

        <View style={styles.readinessItem}>
          <Text variant="mono" style={{ color: colors.textSubtle, fontSize: 10 }}>
            PERMIT:
          </Text>
          <Badge
            label={member.permitState.toUpperCase()}
            variant={getReadinessBadgeVariant(member.permitState)}
            size="sm"
            style={{ marginLeft: 4 }}
          />
        </View>

        <View style={styles.readinessItem}>
          <Text variant="mono" style={{ color: colors.textSubtle, fontSize: 10 }}>
            ICE:
          </Text>
          <Badge
            label={member.emergencyContactState.toUpperCase()}
            variant={getReadinessBadgeVariant(member.emergencyContactState)}
            size="sm"
            style={{ marginLeft: 4 }}
          />
        </View>
      </View>

      {/* Synthetic Invite Preview Action */}
      <View style={[styles.inviteActionRow, { borderTopColor: colors.borderSubtle }]}>
        <Button
          label={
            isInvitePending
              ? 'INVITATION PREVIEW PENDING'
              : isNotInvited
              ? 'TRIGGER PREVIEW INVITE'
              : 'PREVIEW ROSTER ONLY'
          }
          onPress={() => onToggleInvite(member.id)}
          variant={isInvitePending ? 'secondary' : isNotInvited ? 'primary' : 'secondary'}
          style={{ minHeight: 48, flex: 1 }}
        />
        {/* Permanent no-invitation-sent disclosure */}
        <Text variant="mono" style={{ color: colors.textSubtle, fontSize: 10, marginTop: 4, textAlign: 'center' }}>
          ℹ️ No invitation was sent · Synthetic roster preview only
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: primitive.radius.lg,
    padding: primitive.spacing[4],
    marginBottom: primitive.spacing[3],
    borderWidth: 1,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: primitive.spacing[3],
  },
  memberInfo: {
    flex: 1,
    marginRight: primitive.spacing[2],
  },
  roleRadiogroup: {
    flexDirection: 'row',
    borderRadius: primitive.radius.md,
    borderWidth: 1,
    padding: 2,
    marginBottom: primitive.spacing[3],
  },
  roleOption: {
    flex: 1,
    minHeight: 48,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: primitive.radius.sm,
    borderWidth: 1,
  },
  readinessRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: primitive.spacing[2],
    marginBottom: primitive.spacing[3],
  },
  readinessItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  inviteActionRow: {
    paddingTop: primitive.spacing[2],
    borderTopWidth: 1,
  },
});
