import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text } from '../components/primitives/Text';
import { Badge } from '../components/primitives/Badge';
import { Button } from '../components/primitives/Button';
import { useTheme } from '../design/ThemeProvider';
import { primitive } from '../design/tokens';

export const SquadFeedScreen: React.FC = () => {
  const { colors } = useTheme();

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
    >
      <Text variant="h1" style={styles.title}>
        Himalayan Squad (दल)
      </Text>
      <Text variant="bodyMedium" muted style={styles.subtitle}>
        Live radar, group coordination, and Nepal trail updates.
      </Text>

      {/* Active Squad Radar Widget */}
      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={styles.cardHeader}>
          <Text variant="h3">Himalayan Riders KT-04</Text>
          <Badge label="3 RIDERS ACTIVE" variant="volt" size="sm" />
        </View>

        <View style={styles.riderRow}>
          <Text variant="bodyMedium" style={{ fontWeight: '700' }}>🏍️ Bikash Shrestha (Lead)</Text>
          <Text variant="mono" style={{ color: primitive.color.volt[400] }}>0.4km ahead</Text>
        </View>
        <View style={styles.riderRow}>
          <Text variant="bodyMedium" style={{ fontWeight: '700' }}>🏍️ Suraj (You)</Text>
          <Text variant="mono" style={{ color: primitive.color.cyan[400] }}>Point</Text>
        </View>
        <View style={styles.riderRow}>
          <Text variant="bodyMedium" style={{ fontWeight: '700' }}>🏍️ Rabin Thapa (Sweep)</Text>
          <Text variant="mono" style={{ color: colors.textSubtle }}>1.2km behind · Mesh</Text>
        </View>
      </View>

      {/* Community Feed / Road Alert */}
      <Text variant="h3" style={styles.sectionHeader}>
        Live Road Conditions & Feed
      </Text>

      <View style={[styles.card, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}>
        <View style={styles.cardHeader}>
          <Text variant="bodyMedium" style={{ fontWeight: '700' }}>Prashant Lama</Text>
          <Text variant="mono" style={{ color: colors.textSubtle }}>14m ago</Text>
        </View>
        <Text variant="bodyMedium" style={{ marginTop: 8 }}>
          Just crossed Kulekhani - Sisneri route. Fresh gravel on the final climb, road dry and clear. Perfect for Supercurvy mode!
        </Text>
        <View style={styles.badgeRow}>
          <Badge label="Kulekhani - Hetauda" variant="neutral" size="sm" />
          <View style={{ width: 8 }} />
          <Badge label="Clear Surface" variant="volt" size="sm" />
        </View>
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
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: primitive.spacing[3],
  },
  riderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  sectionHeader: {
    marginTop: primitive.spacing[3],
    marginBottom: primitive.spacing[3],
  },
  badgeRow: {
    flexDirection: 'row',
    marginTop: primitive.spacing[3],
  },
});
