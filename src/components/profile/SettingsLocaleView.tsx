/**
 * ============================================================================
 * SETTINGS & LOCALE PREVIEW VIEW (R14)
 * ============================================================================
 *
 * Coordinates:
 * 1. Local language selector (English, Nepali, Hindi) updating R14 local copy.
 * 2. Calendar system selector (AD / BS) using pre-authored date strings.
 * 3. Unit system selector (Metric / Imperial).
 * 4. Theme & Glare Mode selector wired to ThemeProvider.
 * 5. Offline map packs summary and Offline Maps Manager launcher.
 * 6. Disabled safety/privacy toggles with explicit unavailable capability explanations.
 * 7. "Preview only — app settings were not saved" notice on any selection.
 * 8. 48dp minimum touch targets across all 4 themes (Night, Day Glare, Dusk, Blackout).
 */

import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Switch } from 'react-native';
import {
  AppPreviewLanguage,
  CalendarSystemPreview,
  UnitSystemPreview,
} from '../../domain/profileSettings';
import { Text } from '../primitives/Text';
import { Badge } from '../primitives/Badge';
import { Button } from '../primitives/Button';
import { Icon } from '../primitives/Icon';
import { useTheme } from '../../design/ThemeProvider';
import { useAppState } from '../../state/AppStateContext';
import { ThemeMode, primitive } from '../../design/tokens';
import * as Haptics from 'expo-haptics';

export interface SettingsLocaleViewProps {
  currentLanguage: AppPreviewLanguage;
  onLanguageChange: (lang: AppPreviewLanguage) => void;
  currentCalendar: CalendarSystemPreview;
  onCalendarChange: (cal: CalendarSystemPreview) => void;
  onOpenOfflineManager: () => void;
}

export const SettingsLocaleView: React.FC<SettingsLocaleViewProps> = ({
  currentLanguage,
  onLanguageChange,
  currentCalendar,
  onCalendarChange,
  onOpenOfflineManager,
}) => {
  const { mode, setMode, colors } = useTheme();
  const { offlineRegions } = useAppState();
  const isDayGlare = mode === 'dayGlare';

  const [unitSystem, setUnitSystem] = useState<UnitSystemPreview>('metric');
  const [dataSaver, setDataSaver] = useState(false);
  const [settingNotice, setSettingNotice] = useState<string | null>(null);

  const languages: { key: AppPreviewLanguage; label: string; subLabel: string }[] = [
    { key: 'en', label: 'English', subLabel: 'Default preview language' },
    { key: 'ne', label: 'नेपाली', subLabel: 'स्थानीयकरण पूर्वावलोकन' },
    { key: 'hi', label: 'हिन्दी', subLabel: 'स्थानीयकरण पूर्वावलोकन' },
  ];

  const calendars: { key: CalendarSystemPreview; label: string; desc: string }[] = [
    { key: 'AD', label: 'Gregorian (AD)', desc: 'Pre-authored Solar Calendar' },
    { key: 'BS', label: 'Bikram Sambat (BS)', desc: 'Pre-authored Nepali Calendar (वि.सं.)' },
  ];

  const themesList: { key: ThemeMode; label: string; desc: string }[] = [
    { key: 'night', label: 'Night (रात्री)', desc: 'Tactical dark base (Default)' },
    { key: 'dayGlare', label: 'Day-Glare (घाम)', desc: 'High-contrast sunlight mode' },
    { key: 'dusk', label: 'Dusk (साँझ)', desc: 'Soft mountain twilight' },
    { key: 'blackout', label: 'Blackout (कालो)', desc: 'Ultra-low battery OLED dark' },
  ];

  const handleLanguageSelect = (lang: AppPreviewLanguage) => {
    Haptics.selectionAsync();
    onLanguageChange(lang);
    setSettingNotice('Preview only — app settings were not saved.');
  };

  const handleCalendarSelect = (cal: CalendarSystemPreview) => {
    Haptics.selectionAsync();
    onCalendarChange(cal);
    setSettingNotice('Preview only — app settings were not saved.');
  };

  const handleUnitToggle = (unit: UnitSystemPreview) => {
    Haptics.selectionAsync();
    setUnitSystem(unit);
    setSettingNotice('Preview only — app settings were not saved.');
  };

  const handleDataSaverToggle = (val: boolean) => {
    setDataSaver(val);
    setSettingNotice('Preview only — app settings were not saved.');
  };

  const handleThemeChange = (newMode: ThemeMode) => {
    Haptics.selectionAsync();
    setMode(newMode);
  };

  const getLifecycleBadge = (lifecycle: string, progressPercentage?: number) => {
    switch (lifecycle) {
      case 'complete':
        return <Badge label="DOWNLOADED" variant="volt" size="sm" />;
      case 'downloading':
        return (
          <Badge
            label={`DOWNLOADING (${progressPercentage ?? 45}%)`}
            variant="cyan"
            size="sm"
          />
        );
      case 'queued':
        return <Badge label="QUEUED" variant="neutral" size="sm" />;
      case 'paused':
        return (
          <Badge
            label={`PAUSED (${progressPercentage ?? 60}%)`}
            variant="warning"
            size="sm"
          />
        );
      case 'partial':
        return (
          <Badge
            label={`PARTIAL CACHE (${progressPercentage ?? 70}%)`}
            variant="warning"
            size="sm"
          />
        );
      case 'stale':
        return <Badge label="UPDATE AVAILABLE" variant="warning" size="sm" />;
      case 'failed':
        return <Badge label="TRANSFER ERROR" variant="warning" size="sm" />;
      case 'storage_full':
        return <Badge label="STORAGE FULL" variant="warning" size="sm" />;
      default:
        return <Badge label="LOCAL CACHE" variant="neutral" size="sm" />;
    }
  };

  return (
    <View style={styles.container}>
      <Text variant="h2" style={[styles.title, { color: colors.text }]}>
        Settings & Preferences (सेटिङ)
      </Text>

      {/* Setting Feedback Notice */}
      {settingNotice && (
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
            <Icon name="info" size={12} color={primitive.color.cyan[400]} style={{ marginRight: 6 }} />
            <Text variant="mono" style={{ color: primitive.color.cyan[400], fontSize: 11, fontWeight: '700' }}>
              {settingNotice}
            </Text>
          </View>
        </View>
      )}

      {/* 1. Language Preview Selector */}
      <Text variant="h3" style={[styles.sectionHeader, { color: colors.text }]}>
        Language & Localization Preview
      </Text>
      <Text variant="bodySmall" muted style={styles.sectionDesc}>
        Changes local preview copy in Profile and Squad · Does not claim full app localization.
      </Text>

      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        {languages.map((l) => {
          const isSelected = currentLanguage === l.key;
          return (
            <TouchableOpacity
              key={l.key}
              style={[
                styles.optionRow,
                {
                  backgroundColor: isSelected ? colors.surfaceElevated : 'transparent',
                  borderColor: isSelected ? primitive.color.volt[400] : 'transparent',
                },
              ]}
              onPress={() => handleLanguageSelect(l.key)}
              accessible
              accessibilityRole="radio"
              accessibilityState={{ selected: isSelected }}
              accessibilityLabel={`Language ${l.label}`}
            >
              <View>
                <Text variant="bodyMedium" style={{ fontWeight: isSelected ? '700' : '500', color: colors.text }}>
                  {l.label}
                </Text>
                <Text variant="bodySmall" muted>
                  {l.subLabel}
                </Text>
              </View>
              {isSelected && <Badge label="PREVIEW ACTIVE" variant="volt" size="sm" />}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* 2. Calendar Display Selector */}
      <Text variant="h3" style={[styles.sectionHeader, { color: colors.text }]}>
        Calendar System (मिति ढाँचा)
      </Text>
      <Text variant="bodySmall" muted style={styles.sectionDesc}>
        Pre-authored AD / BS date strings · No dynamic calendar conversion algorithm.
      </Text>

      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        {calendars.map((c) => {
          const isSelected = currentCalendar === c.key;
          return (
            <TouchableOpacity
              key={c.key}
              style={[
                styles.optionRow,
                {
                  backgroundColor: isSelected ? colors.surfaceElevated : 'transparent',
                  borderColor: isSelected ? primitive.color.volt[400] : 'transparent',
                },
              ]}
              onPress={() => handleCalendarSelect(c.key)}
              accessible
              accessibilityRole="radio"
              accessibilityState={{ selected: isSelected }}
              accessibilityLabel={`Calendar ${c.label}`}
            >
              <View>
                <Text variant="bodyMedium" style={{ fontWeight: isSelected ? '700' : '500', color: colors.text }}>
                  {c.label}
                </Text>
                <Text variant="bodySmall" muted>
                  {c.desc}
                </Text>
              </View>
              {isSelected && <Badge label="ACTIVE" variant="cyan" size="sm" />}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* 3. Measurement Units */}
      <Text variant="h3" style={[styles.sectionHeader, { color: colors.text }]}>
        Measurement Units (एकाइहरू)
      </Text>

      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={styles.unitToggleRow}>
          <TouchableOpacity
            style={[
              styles.unitBtn,
              {
                backgroundColor: unitSystem === 'metric' ? colors.surfaceElevated : 'transparent',
                borderColor: unitSystem === 'metric' ? primitive.color.volt[400] : 'transparent',
              },
            ]}
            onPress={() => handleUnitToggle('metric')}
            accessible
            accessibilityRole="button"
            accessibilityLabel="Set units to metric"
          >
            <Text variant="bodyMedium" style={{ fontWeight: unitSystem === 'metric' ? '700' : '500', color: colors.text }}>
              Metric (km, m, L)
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.unitBtn,
              {
                backgroundColor: unitSystem === 'imperial' ? colors.surfaceElevated : 'transparent',
                borderColor: unitSystem === 'imperial' ? primitive.color.volt[400] : 'transparent',
              },
            ]}
            onPress={() => handleUnitToggle('imperial')}
            accessible
            accessibilityRole="button"
            accessibilityLabel="Set units to imperial"
          >
            <Text variant="bodyMedium" style={{ fontWeight: unitSystem === 'imperial' ? '700' : '500', color: colors.text }}>
              Imperial (mi, ft, gal)
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 4. Theme & Glare Mode */}
      <Text variant="h3" style={[styles.sectionHeader, { color: colors.text }]}>
        Theme & Ambient Glare Mode
      </Text>

      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        {themesList.map((t) => {
          const isSelected = mode === t.key;
          return (
            <TouchableOpacity
              key={t.key}
              style={[
                styles.optionRow,
                {
                  backgroundColor: isSelected ? colors.surfaceElevated : 'transparent',
                  borderColor: isSelected ? primitive.color.volt[400] : 'transparent',
                },
              ]}
              onPress={() => handleThemeChange(t.key)}
              accessible
              accessibilityRole="radio"
              accessibilityState={{ selected: isSelected }}
              accessibilityLabel={`Theme ${t.label}`}
            >
              <View>
                <Text variant="bodyMedium" style={{ fontWeight: isSelected ? '700' : '500', color: colors.text }}>
                  {t.label}
                </Text>
                <Text variant="bodySmall" muted>
                  {t.desc}
                </Text>
              </View>
              {isSelected && <Badge label="ACTIVE" variant="volt" size="sm" />}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* 5. Offline Region Packs (Fixture Preview) */}
      <View style={styles.sectionHeaderRow}>
        <Text variant="h3" style={[styles.sectionHeader, { color: colors.text }]}>
          Nepal Offline Map Packs ({offlineRegions.length})
        </Text>
        <TouchableOpacity
          style={styles.manageBtn}
          onPress={onOpenOfflineManager}
          accessible
          accessibilityRole="button"
          accessibilityLabel="Open offline region manager"
        >
          <View style={styles.manageBtnRow}>
            <Text variant="mono" style={{ color: primitive.color.cyan[400], fontSize: 11, fontWeight: '700', marginRight: 4 }}>
              MANAGE
            </Text>
            <Icon name="arrow-right" size={11} color={primitive.color.cyan[400]} />
          </View>
        </TouchableOpacity>
      </View>

      <View style={[styles.card, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}>
        {offlineRegions.map((region, idx) => (
          <React.Fragment key={region.id}>
            <View style={styles.regionRow}>
              <View style={{ flex: 1, marginRight: 8 }}>
                <Text variant="bodyMedium" style={{ fontWeight: '700', color: colors.text }}>
                  {region.name}
                </Text>
                <Text variant="mono" style={{ color: colors.textSubtle }}>
                  {Math.round(region.sizeBytes / (1024 * 1024))} MB · {region.includes3dElevation ? '3D Elevation' : '2D Tiles'}
                </Text>
              </View>
              {getLifecycleBadge(region.lifecycle, region.progressPercentage)}
            </View>
            {idx < offlineRegions.length - 1 && (
              <View style={[styles.divider, { backgroundColor: colors.border }]} />
            )}
          </React.Fragment>
        ))}

        <Button
          label="OPEN OFFLINE MAPS MANAGER"
          onPress={onOpenOfflineManager}
          variant="secondary"
          style={{ marginTop: primitive.spacing[3] }}
        />
      </View>

      {/* 6. Data Saver Toggle */}
      <View
        style={[
          styles.switchCard,
          {
            backgroundColor: isDayGlare ? primitive.color.snow[0] : colors.surface,
            borderColor: colors.border,
          },
        ]}
      >
        <View style={{ flex: 1, marginRight: 8 }}>
          <Text variant="bodyMedium" style={{ fontWeight: '700', color: colors.text }}>
            Low-Data / Data Saver Mode
          </Text>
          <Text variant="bodySmall" muted>
            Suppresses map tile downloads and media placeholders in community feed.
          </Text>
        </View>
        <Switch
          value={dataSaver}
          onValueChange={handleDataSaverToggle}
          trackColor={{ false: primitive.color.graphite[700], true: primitive.color.volt[500] }}
          thumbColor={primitive.color.snow[50]}
          accessibilityLabel="Toggle low-data mode"
        />
      </View>

      {/* 7. Privacy & Safety Services (Disabled in Preview) */}
      <Text variant="h3" style={[styles.sectionHeader, { color: colors.text }]}>
        Privacy & Live Location Services
      </Text>

      <View
        style={[
          styles.disabledCard,
          {
            backgroundColor: isDayGlare ? primitive.color.snow[50] : colors.surfaceCard,
            borderColor: colors.borderSubtle,
          },
        ]}
      >
        <View style={styles.disabledRow}>
          <View style={{ flex: 1, marginRight: 8 }}>
            <Text variant="bodyMedium" style={{ fontWeight: '700', color: colors.textSubtle }}>
              Background GPS Ride Logging
            </Text>
            <Text variant="mono" style={{ color: colors.textSubtle, fontSize: 10, marginTop: 2 }}>
              Live background services & sharing are offline in this preview.
            </Text>
          </View>
          <Switch value={false} disabled accessibilityLabel="Background GPS logging disabled" />
        </View>

        <View style={[styles.divider, { backgroundColor: colors.borderSubtle }]} />

        <View style={styles.disabledRow}>
          <View style={{ flex: 1, marginRight: 8 }}>
            <Text variant="bodyMedium" style={{ fontWeight: '700', color: colors.textSubtle }}>
              Mesh Radar Discovery Broadcast
            </Text>
            <Text variant="mono" style={{ color: colors.textSubtle, fontSize: 10, marginTop: 2 }}>
              Mesh radar discovery is offline in this preview.
            </Text>
          </View>
          <Switch value={false} disabled accessibilityLabel="Mesh radar discovery broadcast disabled" />
        </View>
      </View>

      {/* Permanent Truth Disclosure */}
      <View style={[styles.cardFooter, { borderTopColor: colors.borderSubtle }]}>
        <View style={styles.footerRow}>
          <Icon name="info" size={10} color={colors.textSubtle} style={{ marginRight: 4 }} />
          <Text variant="mono" style={{ color: colors.textSubtle, fontSize: 10, textAlign: 'center' }}>
            Local preview preferences · Device storage offline
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
  title: {
    marginBottom: primitive.spacing[2],
  },
  noticeBox: {
    padding: primitive.spacing[3],
    borderRadius: primitive.radius.md,
    borderWidth: 1,
    marginBottom: primitive.spacing[3],
  },
  sectionHeader: {
    marginTop: primitive.spacing[3],
    marginBottom: primitive.spacing[1],
  },
  sectionDesc: {
    marginBottom: primitive.spacing[2],
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: primitive.spacing[3],
    marginBottom: primitive.spacing[2],
  },
  manageBtn: {
    minHeight: 48,
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingHorizontal: primitive.spacing[2],
  },
  card: {
    borderRadius: primitive.radius.lg,
    padding: primitive.spacing[2],
    marginBottom: primitive.spacing[4],
    borderWidth: 1,
  },
  optionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: primitive.spacing[3],
    borderRadius: primitive.radius.md,
    borderWidth: 1,
    marginVertical: 2,
    minHeight: 48,
  },
  regionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: primitive.spacing[2],
  },
  unitToggleRow: {
    flexDirection: 'row',
    gap: primitive.spacing[2],
  },
  unitBtn: {
    flex: 1,
    minHeight: 48,
    borderRadius: primitive.radius.md,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: primitive.spacing[2],
  },
  switchCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: primitive.spacing[4],
    borderRadius: primitive.radius.lg,
    borderWidth: 1,
    marginBottom: primitive.spacing[4],
  },
  disabledCard: {
    borderRadius: primitive.radius.lg,
    padding: primitive.spacing[4],
    borderWidth: 1,
    marginBottom: primitive.spacing[4],
  },
  disabledRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  divider: {
    height: 1,
    marginVertical: primitive.spacing[3],
  },
  cardFooter: {
    paddingTop: primitive.spacing[3],
    borderTopWidth: 0.5,
  },
  manageBtnRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  noticeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
