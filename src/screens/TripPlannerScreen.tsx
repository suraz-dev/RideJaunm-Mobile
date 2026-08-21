import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Text } from '../components/primitives/Text';
import { Badge } from '../components/primitives/Badge';
import { Button } from '../components/primitives/Button';
import { RouteModeSelector, RouteMode } from '../components/composites/RouteModeSelector';
import { useTheme } from '../design/ThemeProvider';
import { primitive, routePresentation } from '../design/tokens';

export const TripPlannerScreen: React.FC = () => {
  const { colors } = useTheme();
  const [selectedMode, setSelectedMode] = useState<RouteMode>('supercurvy');

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
    >
      <Text variant="h1" style={styles.title}>
        Trip Planner (यात्रा योजना)
      </Text>
      <Text variant="bodyMedium" muted style={styles.subtitle}>
        Curated motorcycle routes across Nepal's passes and valleys.
      </Text>

      {/* Destination Card */}
      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={styles.destinationRow}>
          <Text variant="bodySmall" muted>ORIGIN</Text>
          <Text variant="bodyLarge" style={{ fontWeight: '700' }}>Kathmandu (काठमाडौं)</Text>
        </View>
        <View style={[styles.divider, { backgroundColor: colors.border }]} />
        <View style={styles.destinationRow}>
          <Text variant="bodySmall" muted>DESTINATION</Text>
          <Text variant="bodyLarge" style={{ fontWeight: '700', color: primitive.color.volt[400] }}>
            Pokhara via BP Highway & Besisahar
          </Text>
        </View>
      </View>

      {/* 3-Way Route Selector */}
      <Text variant="h3" style={styles.sectionHeader}>
        Select Route Personality
      </Text>
      <RouteModeSelector
        selectedMode={selectedMode}
        onSelectMode={setSelectedMode}
        style={{ marginBottom: primitive.spacing[4] }}
      />

      {/* Route Metrics Breakdown */}
      <View style={[styles.card, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}>
        <View style={styles.routeHeader}>
          <Badge
            label={routePresentation[selectedMode].label}
            variant={selectedMode === 'supercurvy' ? 'supercurvy' : selectedMode === 'curvy' ? 'volt' : 'cyan'}
          />
          <Text variant="mono" style={{ color: colors.textSubtle }}>
            214 KM · 5h 45m
          </Text>
        </View>
        <Text variant="bodyMedium" style={{ marginTop: 8, color: colors.text }}>
          {routePresentation[selectedMode].description}
        </Text>

        <View style={styles.metaGrid}>
          <View style={styles.metaBox}>
            <Text variant="bodySmall" muted>CURVINESS</Text>
            <Text variant="h3" style={{ color: primitive.color.volt[400] }}>
              {selectedMode === 'supercurvy' ? '9.4 / 10' : selectedMode === 'curvy' ? '7.8 / 10' : '4.2 / 10'}
            </Text>
          </View>
          <View style={styles.metaBox}>
            <Text variant="bodySmall" muted>MAX ELEVATION</Text>
            <Text variant="h3" style={{ color: primitive.color.cyan[400] }}>
              2,480 m
            </Text>
          </View>
        </View>

        {/* Nepal Offline Hazards Checklist */}
        <View style={styles.hazardsBox}>
          <Text variant="bodySmall" style={{ color: primitive.color.semantic.warning, fontWeight: '700' }}>
            ⚠️ 2 Active Landslide Checkpoints · 1 Fuel Gap (48km)
          </Text>
        </View>
      </View>

      <Button
        label="CACHE OFFLINE & PREVIEW (अफलाइन सेभ)"
        onPress={() => {}}
        variant="primary"
        style={{ marginTop: primitive.spacing[5] }}
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
    marginBottom: primitive.spacing[1],
  },
  subtitle: {
    marginBottom: primitive.spacing[5],
  },
  card: {
    borderRadius: primitive.radius.lg,
    padding: primitive.spacing[4],
    borderWidth: 1,
    marginBottom: primitive.spacing[4],
  },
  destinationRow: {
    marginVertical: 4,
  },
  divider: {
    height: 1,
    marginVertical: primitive.spacing[3],
  },
  sectionHeader: {
    marginBottom: primitive.spacing[3],
  },
  routeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metaGrid: {
    flexDirection: 'row',
    marginTop: primitive.spacing[4],
  },
  metaBox: {
    flex: 1,
  },
  hazardsBox: {
    marginTop: primitive.spacing[4],
    padding: primitive.spacing[3],
    backgroundColor: 'rgba(255, 176, 32, 0.1)',
    borderRadius: primitive.radius.sm,
    borderWidth: 1,
    borderColor: 'rgba(255, 176, 32, 0.3)',
  },
});
