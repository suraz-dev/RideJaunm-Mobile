import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Text } from '../components/primitives/Text';
import { Badge } from '../components/primitives/Badge';
import { Button } from '../components/primitives/Button';
import { useTheme } from '../design/ThemeProvider';
import { ThemeMode, primitive } from '../design/tokens';
import * as Haptics from 'expo-haptics';

export const ProfileGarageScreen: React.FC = () => {
  const { mode, setMode, colors } = useTheme();

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

        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text variant="bodySmall" muted>TOTAL RIDES</Text>
            <Text variant="h3" style={{ color: colors.text }}>48</Text>
          </View>
          <View style={styles.statBox}>
            <Text variant="bodySmall" muted>DISTANCE</Text>
            <Text variant="h3" style={{ color: primitive.color.cyan[400] }}>4,820 km</Text>
          </View>
          <View style={styles.statBox}>
            <Text variant="bodySmall" muted>HIGHEST PASS</Text>
            <Text variant="h3" style={{ color: primitive.color.volt[400] }}>5,416 m</Text>
          </View>
        </View>
      </View>

      {/* Offline Region Cache Manager */}
      <Text variant="h3" style={styles.sectionHeader}>
        Nepal Offline Map Packs
      </Text>
      <View style={[styles.card, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}>
        <View style={styles.regionRow}>
          <View>
            <Text variant="bodyMedium" style={{ fontWeight: '700' }}>Bagmati & Narayani Zone</Text>
            <Text variant="mono" style={{ color: colors.textSubtle }}>142 MB · Full 3D Elevation</Text>
          </View>
          <Badge label="DOWNLOADED" variant="volt" size="sm" />
        </View>
        <View style={[styles.divider, { backgroundColor: colors.border }]} />
        <View style={styles.regionRow}>
          <View>
            <Text variant="bodyMedium" style={{ fontWeight: '700' }}>Annapurna & Mustang Circuit</Text>
            <Text variant="mono" style={{ color: colors.textSubtle }}>218 MB · Offline Trails & LZs</Text>
          </View>
          <Badge label="DOWNLOADED" variant="volt" size="sm" />
        </View>
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
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
    paddingTop: primitive.spacing[3],
  },
  statBox: {
    flex: 1,
  },
  sectionHeader: {
    marginTop: primitive.spacing[3],
    marginBottom: primitive.spacing[3],
  },
  regionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
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
