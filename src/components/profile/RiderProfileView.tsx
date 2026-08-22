/**
 * ============================================================================
 * RIDER PROFILE VIEW (R16 REFINED)
 * ============================================================================
 *
 * Coordinates:
 * 1. Rider identity, callsign, blood group, and synthetic emergency contact.
 * 2. Statistics grid (Total Rides, Distance, Elevation, High Passes) with tactical instrument styling.
 * 3. Achievement badges with pre-authored AD/BS unlock dates.
 * 4. Permanent truth disclosure: "Synthetic profile preview — not an account".
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { FixtureRiderProfile, AppPreviewLanguage, CalendarSystemPreview } from '../../domain/profileSettings';
import { Text } from '../primitives/Text';
import { Badge } from '../primitives/Badge';
import { Icon } from '../primitives/Icon';
import { useTheme } from '../../design/ThemeProvider';
import { primitive } from '../../design/tokens';

export interface RiderProfileViewProps {
  profile: FixtureRiderProfile;
  language?: AppPreviewLanguage;
  calendarSystem?: CalendarSystemPreview;
}

export const RiderProfileView: React.FC<RiderProfileViewProps> = ({
  profile,
  language = 'en',
  calendarSystem = 'AD',
}) => {
  const { colors, mode } = useTheme();
  const isDayGlare = mode === 'dayGlare';

  const getCallsign = () => {
    if (language === 'ne' && profile.callsignNepali) return profile.callsignNepali;
    if (language === 'hi' && profile.callsignHindi) return profile.callsignHindi;
    return profile.callsign;
  };

  const getFullName = () => {
    if (language === 'ne' && profile.fullNameNepali) return profile.fullNameNepali;
    if (language === 'hi' && profile.fullNameHindi) return profile.fullNameHindi;
    return profile.fullName;
  };

  const getBio = () => {
    if (language === 'ne' && profile.bioNepali) return profile.bioNepali;
    if (language === 'hi' && profile.bioHindi) return profile.bioHindi;
    return profile.bio;
  };

  return (
    <View style={styles.container}>
      {/* Identity Card */}
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
        accessibilityLabel={`Rider Profile: ${getFullName()}, Callsign: ${getCallsign()}`}
      >
        <View style={styles.headerRow}>
          <View style={styles.avatarCircle}>
            <Icon name="bike" size={22} color={primitive.color.volt[400]} />
          </View>
          <View style={styles.nameCol}>
            <Text variant="h2" style={{ color: colors.text }}>
              {getFullName()}
            </Text>
            <Text variant="mono" style={{ color: primitive.color.volt[400], fontSize: 12, marginTop: 2 }}>
              "{getCallsign()}"
            </Text>
          </View>
          <Badge label={`BLOOD ${profile.bloodGroup}`} variant="volt" size="sm" />
        </View>

        <Text variant="bodyMedium" style={[styles.bioText, { color: colors.text }]}>
          {getBio()}
        </Text>

        <View style={[styles.contactRow, { borderTopColor: colors.borderSubtle }]}>
          <View style={styles.contactRowContent}>
            <Icon name="phone" size={13} color={colors.textSubtle} style={{ marginRight: 6 }} />
            <Text variant="mono" style={{ color: colors.textSubtle, fontSize: 11 }}>
              Emergency Contact: {profile.emergencyContactSynthetic}
            </Text>
          </View>
        </View>
      </View>

      {/* Stats Grid */}
      <Text variant="h3" style={[styles.sectionTitle, { color: colors.text }]}>
        {language === 'ne' ? 'सवारी तथ्याङ्क (पूर्वावलोकन)' : language === 'hi' ? 'राइड सांख्यिकी (पूर्वावलोकन)' : 'Ride Statistics (Preview)'}
      </Text>

      <View
        style={[
          styles.statsGrid,
          {
            backgroundColor: isDayGlare ? primitive.color.snow[0] : colors.surface,
            borderColor: colors.border,
          },
        ]}
      >
        <View style={[styles.statBox, { borderRightColor: colors.borderSubtle, borderBottomColor: colors.borderSubtle }]}>
          <Text variant="bodySmall" muted style={{ fontWeight: '700', letterSpacing: 0.5 }}>
            {language === 'ne' ? 'कुल यात्राहरू' : language === 'hi' ? 'कुल राइड्स' : 'TOTAL RIDES'}
          </Text>
          <Text variant="h2" style={{ color: colors.text, marginTop: 4 }}>
            {profile.totalRidesCount}
          </Text>
          <Text variant="mono" style={{ color: colors.textSubtle, fontSize: 9, marginTop: 2 }}>
            Recorded count
          </Text>
        </View>

        <View style={[styles.statBox, { borderBottomColor: colors.borderSubtle }]}>
          <Text variant="bodySmall" muted style={{ fontWeight: '700', letterSpacing: 0.5 }}>
            {language === 'ne' ? 'कुल दूरी' : language === 'hi' ? 'कुल दूरी' : 'TOTAL DISTANCE'}
          </Text>
          <Text variant="h2" style={{ color: primitive.color.cyan[400], marginTop: 4 }}>
            {profile.totalDistanceKm.toLocaleString()} km
          </Text>
          <Text variant="mono" style={{ color: colors.textSubtle, fontSize: 9, marginTop: 2 }}>
            Simulated odometer
          </Text>
        </View>

        <View style={[styles.statBox, { borderRightColor: colors.borderSubtle }]}>
          <Text variant="bodySmall" muted style={{ fontWeight: '700', letterSpacing: 0.5 }}>
            {language === 'ne' ? 'उचाइ वृद्धि' : language === 'hi' ? 'ऊंचाई लाभ' : 'ELEVATION GAIN'}
          </Text>
          <Text variant="h2" style={{ color: primitive.color.volt[400], marginTop: 4 }}>
            {profile.elevationGainMeters.toLocaleString()} m
          </Text>
          <Text variant="mono" style={{ color: colors.textSubtle, fontSize: 9, marginTop: 2 }}>
            Himalayan terrain
          </Text>
        </View>

        <View style={styles.statBox}>
          <Text variant="bodySmall" muted style={{ fontWeight: '700', letterSpacing: 0.5 }}>
            {language === 'ne' ? 'उच्च भञ्ज्याङहरू' : language === 'hi' ? 'ऊंचे दर्रे' : 'HIGH PASSES'}
          </Text>
          <Text variant="h2" style={{ color: primitive.color.route.supercurvy, marginTop: 4 }}>
            {profile.highPassesCrossedCount}
          </Text>
          <Text variant="mono" style={{ color: colors.textSubtle, fontSize: 9, marginTop: 2 }}>
            &gt; 3,500m passes
          </Text>
        </View>
      </View>

      {/* Achievement Badges */}
      <Text variant="h3" style={[styles.sectionTitle, { color: colors.text }]}>
        {language === 'ne' ? 'उपलब्धि ब्याजहरू' : language === 'hi' ? 'उपलब्धि बैज' : 'Achievement Badges'}
      </Text>

      <View style={styles.badgesList}>
        {profile.badges.map((b) => (
          <View
            key={b.id}
            style={[
              styles.badgeCard,
              {
                backgroundColor: isDayGlare ? primitive.color.snow[0] : colors.surfaceElevated,
                borderColor: colors.borderSubtle,
              },
            ]}
          >
            <View style={styles.badgeHeader}>
              <View style={styles.badgeTitleRow}>
                <Icon
                  name={b.id.includes('pass') || b.id.includes('himalayan') ? 'mountain' : 'bike'}
                  size={15}
                  color={primitive.color.volt[400]}
                  style={{ marginRight: 6 }}
                />
                <Text variant="bodyMedium" style={{ fontWeight: '700', color: colors.text }}>
                  {language === 'ne' && b.nameNepali ? b.nameNepali : language === 'hi' && b.nameHindi ? b.nameHindi : b.name}
                </Text>
              </View>
              <Badge
                label={calendarSystem === 'BS' ? `BS ${b.unlockedDateBs}` : `AD ${b.unlockedDateAd}`}
                variant="neutral"
                size="sm"
              />
            </View>
            <Text variant="bodySmall" muted style={{ marginTop: 4 }}>
              {b.description}
            </Text>
          </View>
        ))}
      </View>

      {/* Permanent Truth Disclosure */}
      <View style={[styles.cardFooter, { borderTopColor: colors.borderSubtle }]}>
        <View style={styles.footerRow}>
          <Icon name="info" size={10} color={colors.textSubtle} style={{ marginRight: 4 }} />
          <Text variant="mono" style={{ color: colors.textSubtle, fontSize: 10, textAlign: 'center' }}>
            {profile.syntheticDisclosure}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: primitive.spacing[4],
  },
  card: {
    borderRadius: primitive.radius.lg,
    padding: primitive.spacing[4],
    marginBottom: primitive.spacing[4],
    borderWidth: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: primitive.spacing[3],
  },
  avatarCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: primitive.color.graphite[800],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: primitive.spacing[3],
  },
  nameCol: {
    flex: 1,
  },
  bioText: {
    lineHeight: 20,
    marginBottom: primitive.spacing[3],
  },
  contactRow: {
    paddingTop: primitive.spacing[2],
    borderTopWidth: 1,
  },
  contactRowContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionTitle: {
    marginTop: primitive.spacing[2],
    marginBottom: primitive.spacing[3],
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    borderRadius: primitive.radius.lg,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: primitive.spacing[4],
  },
  statBox: {
    width: '50%',
    padding: primitive.spacing[3],
    borderRightWidth: 1,
    borderBottomWidth: 1,
  },
  badgesList: {
    marginBottom: primitive.spacing[4],
  },
  badgeCard: {
    borderRadius: primitive.radius.md,
    padding: primitive.spacing[3],
    marginBottom: primitive.spacing[2],
    borderWidth: 1,
  },
  badgeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  badgeTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardFooter: {
    paddingTop: primitive.spacing[3],
    borderTopWidth: 0.5,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
