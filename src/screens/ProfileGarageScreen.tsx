import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Text } from '../components/primitives/Text';
import { Badge } from '../components/primitives/Badge';
import { Button } from '../components/primitives/Button';
import { OfflineMapsScreen } from './OfflineMapsScreen';
import { useTheme } from '../design/ThemeProvider';
import { useAppState } from '../state/AppStateContext';
import { ThemeMode, primitive } from '../design/tokens';
import * as Haptics from 'expo-haptics';

export const ProfileGarageScreen: React.FC = () => {
  const { mode, setMode, colors } = useTheme();
  const { offlineRegions, pendingOperationsCount, resetAccountData } = useAppState();
  const [showOfflineManager, setShowOfflineManager] = useState(false);

  const themesList: { key: ThemeMode; label: string; desc: string }[] = [
    { key: 'night', label: 'Night (रात्री)', desc: 'Tactical dark base (Default)' },
    { key: 'dayGlare', label: 'Day-Glare (घाम)', desc: 'High-contrast sunlight mode' },
    { key: 'dusk', label: 'Dusk (साँझ)', desc: 'Soft mountain twilight' },
    { key: 'blackout', label: 'Blackout (कालो)', desc: 'Ultra-low battery OLED dark' },
  ];

  const handleThemeChange = (newMode: ThemeMode) => {
    Haptics.selectionAsync();
    setMode(newMode);
  };

  const getLifecycleBadge = (lifecycle: string) => {
    switch (lifecycle) {
      case 'complete':
        return <Badge label="DOWNLOADED" variant="volt" size="sm" />;
      case 'downloading':
        return <Badge label="45% DOWNLOADING" variant="cyan" size="sm" />;
      case 'queued':
        return <Badge label="QUEUED" variant="neutral" size="sm" />;
      case 'storage_full':
      default:
        return <Badge label="STORAGE FULL" variant="warning" size="sm" />;
    }
  };

  if (showOfflineManager) {
    return <OfflineMapsScreen onBackToMain={() => setShowOfflineManager(false)} />;
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
    >
      <Text variant="h1" style={styles.title}>
        Garage & Profile (प्रोफाइल)
      </Text>

      {/* Motorcycle Garage Card */}
      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={styles.garageHeader}>
          <View>
            <Text variant="h2">Royal Enfield Himalayan 450</Text>
            <Text variant="mono" style={{ color: primitive.color.volt[400], marginTop: 2 }}>
              BA 02 PA 4821 · Kaza Brown
            </Text>
          </View>
          <Badge label="VERIFIED" variant="volt" size="sm" />
        </View>

        <View style={[styles.statsRow, { borderTopColor: colors.borderSubtle }]}>
          <View style={styles.statBox}>
            <Text variant="bodySmall" muted>TOTAL RIDES</Text>
            <Text variant="h3" style={{ color: colors.text }}>48</Text>
          </View>
          <View style={styles.statBox}>
            <Text variant="bodySmall" muted>DISTANCE</Text>
            <Text variant="h3" style={{ color: primitive.color.cyan[400] }}>4,820 km</Text>
          </View>
          <View style={styles.statBox}>
            <Text variant="bodySmall" muted>OUTBOX QUEUE</Text>
            <Text variant="h3" style={{ color: pendingOperationsCount > 0 ? primitive.color.semantic.warning : primitive.color.volt[400] }}>
              {pendingOperationsCount}
            </Text>
          </View>
        </View>
      </View>

      {/* Offline Region Cache Manager */}
      <View style={styles.sectionHeaderRow}>
        <Text variant="h3" style={styles.sectionHeader}>
          Nepal Offline Map Packs ({offlineRegions.length})
        </Text>
        <TouchableOpacity
          style={styles.manageBtn}
          onPress={() => setShowOfflineManager(true)}
          accessible
          accessibilityRole="button"
          accessibilityLabel="Open offline region manager"
        >
          <Text variant="mono" style={{ color: primitive.color.cyan[400], fontSize: 11, fontWeight: '700' }}>
            MANAGE ➔
          </Text>
        </TouchableOpacity>
      </View>

      <View style={[styles.card, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}>
        {offlineRegions.map((region, idx) => (
          <React.Fragment key={region.id}>
            <View style={styles.regionRow}>
              <View style={{ flex: 1, marginRight: 8 }}>
                <Text variant="bodyMedium" style={{ fontWeight: '700' }}>
                  {region.name}
                </Text>
                <Text variant="mono" style={{ color: colors.textSubtle }}>
                  {Math.round(region.sizeBytes / (1024 * 1024))} MB · {region.includes3dElevation ? '3D Elevation' : '2D Tiles'}
                </Text>
              </View>
              {getLifecycleBadge(region.lifecycle)}
            </View>
            {idx < offlineRegions.length - 1 && (
              <View style={[styles.divider, { backgroundColor: colors.border }]} />
            )}
          </React.Fragment>
        ))}

        <Button
          label="OPEN OFFLINE MAPS MANAGER"
          onPress={() => setShowOfflineManager(true)}
          variant="secondary"
          style={{ marginTop: primitive.spacing[3] }}
        />
      </View>

      {/* 4 Theme Modes Selector */}
      <Text variant="h3" style={styles.sectionHeader}>
        Theme & Ambient Glare Mode
      </Text>

      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        {themesList.map((t) => {
          const isSelected = mode === t.key;
          return (
            <TouchableOpacity
              key={t.key}
              activeOpacity={0.8}
              onPress={() => handleThemeChange(t.key)}
              style={[
                styles.themeOption,
                {
                  backgroundColor: isSelected ? colors.surfaceElevated : 'transparent',
                  borderColor: isSelected ? primitive.color.volt[400] : 'transparent',
                },
              ]}
            >
              <View>
                <Text variant="bodyMedium" style={{ fontWeight: isSelected ? '700' : '500' }}>
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

      <Button
        label="RESET LOCAL CACHE & OUTBOX"
        onPress={resetAccountData}
        variant="secondary"
        style={{ marginTop: primitive.spacing[4] }}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: primitive.spacing[5],
    paddingTop: 60,
    paddingBottom: 100,
  },
  title: {
    marginBottom: primitive.spacing[5],
  },
  card: {
    borderRadius: primitive.radius.lg,
    padding: primitive.spacing[4],
    borderWidth: 1,
    marginBottom: primitive.spacing[4],
  },
  garageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: primitive.spacing[4],
  },
  statsRow: {
    flexDirection: 'row',
    borderTopWidth: 1,
    paddingTop: primitive.spacing[3],
  },
  statBox: {
    flex: 1,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: primitive.spacing[3],
    marginBottom: primitive.spacing[3],
  },
  sectionHeader: {
    marginVertical: 0,
  },
  manageBtn: {
    minHeight: 48,
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingHorizontal: primitive.spacing[2],
  },
  regionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  divider: {
    height: 1,
    marginVertical: primitive.spacing[2],
  },
  themeOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: primitive.spacing[3],
    borderRadius: primitive.radius.md,
    borderWidth: 1,
    marginVertical: 2,
  },
});
