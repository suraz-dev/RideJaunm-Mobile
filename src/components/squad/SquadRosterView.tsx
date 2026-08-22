/**
 * ============================================================================
 * SQUAD ROSTER & MAP CONTEXT VIEW (R13)
 * ============================================================================
 *
 * Coordinates:
 * 1. Pre-authored squad roster with deterministic presence states
 *    ('Cached fixture', 'Last-known fixture', 'Unavailable', 'Mesh preview' — zero 'Live' claims).
 * 2. Embedded MapSurface bounds preview with unconditional cache_only network policy
 *    and explicit disclosure: "Fixture presence preview — not live rider tracking."
 * 3. Disabled member action affordances (call, ping, navigate) with capability notice.
 * 4. 48dp minimum touch targets across all 4 themes (Night, Day Glare, Dusk, Blackout).
 */

import React, { useState, useMemo } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { FixtureSquadGroup, FixtureSquadPresence } from '../../domain/squadCommunity';
import { Text } from '../primitives/Text';
import { Badge } from '../primitives/Badge';
import { Icon } from '../primitives/Icon';
import { MapSurface } from '../map/MapSurface';
import { MarkerLayer } from '../map/MarkerLayer';
import { MapRenderInput } from '../../domain/map';
import { MapMarker } from '../../domain/mapOverlay';
import { useTheme } from '../../design/ThemeProvider';
import { primitive } from '../../design/tokens';

export interface SquadRosterViewProps {
  group: FixtureSquadGroup;
}

export const SquadRosterView: React.FC<SquadRosterViewProps> = ({ group }) => {
  const { colors, mode } = useTheme();
  const isDayGlare = mode === 'dayGlare';

  const [actionNotice, setActionNotice] = useState<string | null>(null);
  const [showMapPreview, setShowMapPreview] = useState(true);

  const getPresenceBadge = (presence: FixtureSquadPresence['presence']) => {
    switch (presence) {
      case 'cached':
        return <Badge label="CACHED FIXTURE" variant="neutral" size="sm" />;
      case 'last_known':
        return <Badge label="LAST-KNOWN FIXTURE" variant="neutral" size="sm" />;
      case 'mesh_preview':
        return <Badge label="MESH PREVIEW" variant="cyan" size="sm" />;
      case 'unavailable':
        return <Badge label="UNAVAILABLE" variant="warning" size="sm" />;
    }
  };

  const handleMemberAction = (action: string, memberName: string) => {
    setActionNotice(`${action} for ${memberName} is unavailable in fixture preview`);
  };

  // Map preview inputs — strictly unconditional cache_only policy with explicit fixture provenance
  const mapRenderInput: MapRenderInput = useMemo(() => {
    return {
      camera: {
        center: { latitude: 27.7172, longitude: 85.324 }, // Kathmandu Valley
        zoom: 9.0,
        bearingDegrees: 0,
        pitchDegrees: 0,
      },
      networkPolicy: 'cache_only',
      baseState: 'fresh',
      coverage: { isCovered: true },
      provenance: {
        source: 'OpenStreetMap Vector Contours (Squad Fixture Roster)',
        sourceVersion: 'OSM-NP-2026.08.15',
        licence: 'Open Database Licence (ODbL) 1.0',
        attribution: '© OpenStreetMap contributors',
      },
    };
  }, []);

  const squadMarkers: MapMarker[] = useMemo(() => {
    return [
      {
        id: 'squad-lead-marker',
        kind: 'origin',
        position: { x: 30, y: 40 },
        label: 'Lead (Bikash)',
      },
      {
        id: 'squad-user-marker',
        kind: 'waypoint',
        position: { x: 50, y: 50 },
        label: 'You (Suraj)',
      },
      {
        id: 'squad-sweep-marker',
        kind: 'destination',
        position: { x: 70, y: 65 },
        label: 'Sweep (Rabin)',
      },
    ];
  }, []);

  return (
    <View style={styles.container}>
      {/* Squad Summary Card */}
      <View
        style={[
          styles.groupCard,
          {
            backgroundColor: isDayGlare ? primitive.color.snow[0] : colors.surface,
            borderColor: colors.border,
          },
        ]}
      >
        <View style={styles.groupHeader}>
          <View>
            <Text variant="h2" style={{ color: colors.text }}>
              {group.name}
            </Text>
            {group.nameNepali && (
              <Text variant="bodySmall" style={{ color: colors.textSubtle, marginTop: 2 }}>
                {group.nameNepali}
              </Text>
            )}
          </View>
          <Badge label="FIXTURE ROSTER" variant="volt" size="sm" />
        </View>

        <Text variant="bodyMedium" muted style={{ marginTop: primitive.spacing[2] }}>
          {group.description}
        </Text>
        <Text variant="mono" style={{ color: primitive.color.cyan[400], fontSize: 11, marginTop: 4 }}>
          🛣️ {group.corridor}
        </Text>
      </View>

      {/* Action Notice */}
      {actionNotice && (
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
            ℹ️ {actionNotice}
          </Text>
        </View>
      )}

      {/* Embedded Map Bounds Preview */}
      {showMapPreview && (
        <View style={styles.mapSection}>
          <View style={styles.mapHeader}>
            <Text variant="bodySmall" muted style={{ fontWeight: '700', letterSpacing: 0.5 }}>
              SQUAD MAP BOUNDS PREVIEW
            </Text>
            <Badge label="CACHE-ONLY MAP" variant="neutral" size="sm" />
          </View>
          <View style={[styles.mapContainer, { borderColor: colors.border }]}>
            <MapSurface input={mapRenderInput} style={{ flex: 1 }}>
              <MarkerLayer markers={squadMarkers} />
            </MapSurface>
          </View>
          <Text variant="mono" style={{ color: colors.textSubtle, fontSize: 10, marginTop: 4 }}>
            Fixture presence preview — not live rider tracking · © OpenStreetMap contributors
          </Text>
        </View>
      )}

      {/* Member Roster List */}
      <View style={styles.rosterSection}>
        <View style={styles.rosterHeader}>
          <Text variant="h3" style={{ color: colors.text }}>
            Roster Members ({group.members.length})
          </Text>
          <TouchableOpacity
            style={styles.toggleMapBtn}
            onPress={() => setShowMapPreview(!showMapPreview)}
            accessible
            accessibilityRole="button"
            accessibilityLabel={showMapPreview ? 'Hide squad map preview' : 'Show squad map preview'}
          >
            <Text variant="mono" style={{ color: primitive.color.cyan[400], fontSize: 11, fontWeight: '600' }}>
              {showMapPreview ? '✕ Hide Map' : '🗺️ Show Map Preview'}
            </Text>
          </TouchableOpacity>
        </View>

        {group.members.map((member) => (
          <View
            key={member.memberId}
            style={[
              styles.memberCard,
              {
                backgroundColor: isDayGlare ? primitive.color.snow[0] : colors.surfaceElevated,
                borderColor: colors.borderSubtle,
              },
            ]}
            accessible
            accessibilityRole="summary"
            accessibilityLabel={`Squad member ${member.displayName}, Role: ${member.role}, Presence: ${member.presence}`}
          >
            <View style={styles.memberHeaderRow}>
              <View style={styles.memberInfoCol}>
                <View style={styles.nameRow}>
                  <Text variant="bodyMedium" style={{ fontWeight: '700', color: colors.text }}>
                    {member.displayName}
                  </Text>
                  <Badge
                    label={member.role.toUpperCase()}
                    variant={member.role === 'lead' ? 'volt' : member.role === 'sweep' ? 'cyan' : 'neutral'}
                    size="sm"
                    style={{ marginLeft: 6 }}
                  />
                </View>
                {member.displayNameNepali && (
                  <Text variant="bodySmall" style={{ color: colors.textSubtle, fontSize: 11 }}>
                    {member.displayNameNepali}
                  </Text>
                )}
                {member.relativePosition && (
                  <Text variant="mono" style={{ color: primitive.color.volt[400], fontSize: 10, marginTop: 2 }}>
                    Relative: {member.relativePosition} (Simulated)
                  </Text>
                )}
              </View>
              {getPresenceBadge(member.presence)}
            </View>

            {/* Member Action Controls (Disabled in Fixture Preview) */}
            <View style={[styles.memberActionsRow, { borderTopColor: colors.borderSubtle }]}>
              <TouchableOpacity
                style={[styles.actionBtn, { borderColor: colors.borderSubtle }]}
                onPress={() => handleMemberAction('Radio / Call', member.displayName)}
                accessible
                accessibilityRole="button"
                accessibilityLabel={`Call ${member.displayName} preview`}
              >
                <View style={styles.actionBtnRow}>
                  <Icon name="mic" size={12} color={colors.textSubtle} style={{ marginRight: 4 }} />
                  <Text variant="mono" style={{ color: colors.textSubtle, fontSize: 11 }}>
                    Call (Preview)
                  </Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionBtn, { borderColor: colors.borderSubtle }]}
                onPress={() => handleMemberAction('Ping', member.displayName)}
                accessible
                accessibilityRole="button"
                accessibilityLabel={`Ping ${member.displayName} preview`}
              >
                <View style={styles.actionBtnRow}>
                  <Icon name="map-pin" size={12} color={colors.textSubtle} style={{ marginRight: 4 }} />
                  <Text variant="mono" style={{ color: colors.textSubtle, fontSize: 11 }}>
                    Ping (Preview)
                  </Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionBtn, { borderColor: colors.borderSubtle }]}
                onPress={() => handleMemberAction('Navigate', member.displayName)}
                accessible
                accessibilityRole="button"
                accessibilityLabel={`Navigate to ${member.displayName} preview`}
              >
                <View style={styles.actionBtnRow}>
                  <Icon name="navigation" size={12} color={colors.textSubtle} style={{ marginRight: 4 }} />
                  <Text variant="mono" style={{ color: colors.textSubtle, fontSize: 11 }}>
                    Navigate (Preview)
                  </Text>
                </View>
              </TouchableOpacity>
            </View>

            <View style={[styles.cardFooter, { borderTopColor: colors.borderSubtle }]}>
              <View style={styles.footerRow}>
                <Icon name="info" size={10} color={colors.textSubtle} style={{ marginRight: 4 }} />
                <Text variant="mono" style={{ color: colors.textSubtle, fontSize: 9 }}>
                  {member.syntheticDisclosure}
                </Text>
              </View>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: primitive.spacing[4],
  },
  groupCard: {
    borderRadius: primitive.radius.lg,
    padding: primitive.spacing[4],
    marginBottom: primitive.spacing[4],
    borderWidth: 1,
  },
  groupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  noticeBox: {
    padding: primitive.spacing[3],
    borderRadius: primitive.radius.md,
    borderWidth: 1,
    marginBottom: primitive.spacing[4],
  },
  mapSection: {
    marginBottom: primitive.spacing[4],
  },
  mapHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: primitive.spacing[2],
  },
  mapContainer: {
    height: 180,
    borderRadius: primitive.radius.lg,
    borderWidth: 1,
    overflow: 'hidden',
  },
  rosterSection: {
    marginBottom: primitive.spacing[4],
  },
  rosterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: primitive.spacing[3],
  },
  toggleMapBtn: {
    minHeight: 48,
    justifyContent: 'center',
    paddingHorizontal: primitive.spacing[2],
  },
  memberCard: {
    borderRadius: primitive.radius.md,
    padding: primitive.spacing[3],
    marginBottom: primitive.spacing[3],
    borderWidth: 1,
  },
  memberHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  memberInfoCol: {
    flex: 1,
    marginRight: primitive.spacing[2],
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  memberActionsRow: {
    flexDirection: 'row',
    gap: primitive.spacing[2],
    marginTop: primitive.spacing[3],
    paddingTop: primitive.spacing[2],
    borderTopWidth: 1,
  },
  actionBtn: {
    flex: 1,
    minHeight: 48,
    borderRadius: primitive.radius.sm,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardFooter: {
    marginTop: primitive.spacing[2],
    paddingTop: primitive.spacing[1],
    borderTopWidth: 0.5,
  },
  actionBtnRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
