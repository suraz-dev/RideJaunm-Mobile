/**
 * ============================================================================
 * PROFILE, GARAGE, HISTORY, AND SETTINGS SCREEN (R14)
 * ============================================================================
 *
 * Coordinates:
 * 1. 4 Accessible inner tabs: Profile, Garage, History, and Settings.
 * 2. Local language preview selection (English, Nepali, Hindi) updating local copy.
 * 3. Calendar display selection (AD / BS) using pre-authored date strings.
 * 4. Integration with offline maps region manager.
 * 5. Permanent synthetic preview disclosures on every surface.
 * 6. 48dp minimum touch targets across all 4 themes (Night, Day Glare, Dusk, Blackout).
 */

import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Text } from '../components/primitives/Text';
import { Badge } from '../components/primitives/Badge';
import { RiderProfileView } from '../components/profile/RiderProfileView';
import { GarageVehiclesView } from '../components/profile/GarageVehiclesView';
import { RideHistoryListView } from '../components/profile/RideHistoryListView';
import { SettingsLocaleView } from '../components/profile/SettingsLocaleView';
import { OfflineMapsScreen } from './OfflineMapsScreen';
import { useTheme } from '../design/ThemeProvider';
import { useAppState } from '../state/AppStateContext';
import { primitive } from '../design/tokens';
import {
  AppPreviewLanguage,
  CalendarSystemPreview,
} from '../domain/profileSettings';
import {
  primaryRiderProfileFixture,
  allFixtureMotorcycles,
  allFixtureRideHistory,
} from '../fixtures/profileSettings.fixture';

export type ProfileInnerTab = 'profile' | 'garage' | 'history' | 'settings';

export const ProfileGarageScreen: React.FC = () => {
  const { colors, mode } = useTheme();
  const { resetAccountData } = useAppState();
  const isDayGlare = mode === 'dayGlare';

  const [activeTab, setActiveTab] = useState<ProfileInnerTab>('profile');
  const [language, setLanguage] = useState<AppPreviewLanguage>('en');
  const [calendarSystem, setCalendarSystem] = useState<CalendarSystemPreview>('AD');
  const [showOfflineManager, setShowOfflineManager] = useState(false);

  const tabs: { tab: ProfileInnerTab; label: string; labelNepali: string; icon: string }[] = [
    { tab: 'profile', label: 'Profile', labelNepali: 'प्रोफाइल', icon: '👤' },
    { tab: 'garage', label: 'Garage', labelNepali: 'ग्यारेज', icon: '🏍️' },
    { tab: 'history', label: 'History', labelNepali: 'इतिहास', icon: '📜' },
    { tab: 'settings', label: 'Settings', labelNepali: 'सेटिङ', icon: '⚙️' },
  ];

  if (showOfflineManager) {
    return <OfflineMapsScreen onBackToMain={() => setShowOfflineManager(false)} />;
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
    >
      {/* Screen Title & Subtitle */}
      <Text variant="h1" style={{ color: colors.text }}>
        {language === 'ne'
          ? 'प्रोफाइल तथा ग्यारेज'
          : language === 'hi'
          ? 'प्रोफ़ाइल और गैरेज'
          : 'Profile & Garage'}
      </Text>
      <Text variant="bodyMedium" muted style={styles.subtitle}>
        {language === 'ne'
          ? 'स्थानीय राइडर प्रोफाइल, ग्यारेज, सवारी इतिहास र पूर्वावलोकन सेटिङ।'
          : language === 'hi'
          ? 'स्थानीय राइडर प्रोफ़ाइल, गैरेज, राइड इतिहास और पूर्वावलोकन सेटिंग्स।'
          : 'Simulated rider identity, garage fleet, ride history, and locale settings.'}
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
          Deterministic local fixtures · Not connected to backend user accounts or live telemetry.
        </Text>
      </View>

      {/* 4 Primary Inner Tabs (Profile, Garage, History, Settings) */}
      <View
        style={[styles.tablist, { backgroundColor: colors.surface, borderColor: colors.border }]}
        accessibilityRole="tablist"
        accessibilityLabel="Profile section navigation tabs"
      >
        {tabs.map((t) => {
          const isTabActive = activeTab === t.tab;
          return (
            <TouchableOpacity
              key={t.tab}
              style={[
                styles.tabBtn,
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
              <Text
                variant="bodySmall"
                style={{
                  color: isTabActive ? colors.text : colors.textMuted,
                  fontWeight: isTabActive ? '700' : '500',
                  fontSize: 11,
                }}
              >
                {t.icon} {t.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* TAB 1: RIDER PROFILE */}
      {activeTab === 'profile' && (
        <RiderProfileView
          profile={primaryRiderProfileFixture}
          language={language}
          calendarSystem={calendarSystem}
        />
      )}

      {/* TAB 2: GARAGE */}
      {activeTab === 'garage' && (
        <GarageVehiclesView
          vehicles={allFixtureMotorcycles}
          language={language}
          calendarSystem={calendarSystem}
        />
      )}

      {/* TAB 3: RIDE HISTORY */}
      {activeTab === 'history' && (
        <RideHistoryListView
          historyItems={allFixtureRideHistory}
          language={language}
          calendarSystem={calendarSystem}
        />
      )}

      {/* TAB 4: SETTINGS & LOCALE */}
      {activeTab === 'settings' && (
        <SettingsLocaleView
          currentLanguage={language}
          onLanguageChange={setLanguage}
          currentCalendar={calendarSystem}
          onCalendarChange={setCalendarSystem}
          onOpenOfflineManager={() => setShowOfflineManager(true)}
          onResetAccountData={resetAccountData}
        />
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
  tablist: {
    flexDirection: 'row',
    borderRadius: primitive.radius.lg,
    padding: 3,
    borderWidth: 1,
    marginBottom: primitive.spacing[4],
  },
  tabBtn: {
    flex: 1,
    minHeight: 48,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: primitive.radius.md,
    borderWidth: 1.5,
  },
});
