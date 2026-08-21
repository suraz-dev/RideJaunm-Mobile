/**
 * ============================================================================
 * RIDE HISTORY LIST VIEW (R14)
 * ============================================================================
 *
 * Coordinates:
 * 1. Pre-authored ride history records with route personality mode chips.
 * 2. Pre-authored AD and BS date strings.
 * 3. Empty state filter simulation with truthful disclosure.
 * 4. Permanent disclaimer: "Pre-authored ride history · Not GPS recorded".
 * 5. Full theme compliance across Night, Day Glare, Dusk, Blackout.
 */

import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { FixtureRideHistoryItem, CalendarSystemPreview, AppPreviewLanguage } from '../../domain/profileSettings';
import { Text } from '../primitives/Text';
import { Badge } from '../primitives/Badge';
import { useTheme } from '../../design/ThemeProvider';
import { primitive } from '../../design/tokens';

export interface RideHistoryListViewProps {
  historyItems: FixtureRideHistoryItem[];
  calendarSystem?: CalendarSystemPreview;
  language?: AppPreviewLanguage;
}

export const RideHistoryListView: React.FC<RideHistoryListViewProps> = ({
  historyItems,
  calendarSystem = 'AD',
  language = 'en',
}) => {
  const { colors, mode } = useTheme();
  const isDayGlare = mode === 'dayGlare';

  const [simulateEmpty, setSimulateEmpty] = useState(false);

  const displayedItems = simulateEmpty ? [] : historyItems;

  const getRouteModeBadge = (routeMode: FixtureRideHistoryItem['routeMode']) => {
    switch (routeMode) {
      case 'curvy':
        return <Badge label="CURVY" variant="volt" size="sm" />;
      case 'supercurvy':
        return <Badge label="SUPERCURVY" variant="supercurvy" size="sm" />;
      case 'straight':
        return <Badge label="STRAIGHT" variant="cyan" size="sm" />;
    }
  };

  const getHistoryStateBadge = (state: FixtureRideHistoryItem['state']) => {
    switch (state) {
      case 'cached':
        return <Badge label="CACHED" variant="neutral" size="sm" />;
      case 'stale':
        return <Badge label="STALE" variant="warning" size="sm" />;
      case 'draft':
        return <Badge label="DRAFT" variant="cyan" size="sm" />;
    }
  };

  const getTitle = (item: FixtureRideHistoryItem) => {
    if (language === 'ne' && item.titleNepali) return item.titleNepali;
    if (language === 'hi' && item.titleHindi) return item.titleHindi;
    return item.title;
  };

  return (
    <View style={styles.container}>
      {/* Header Row + Empty State Toggle */}
      <View style={styles.headerRow}>
        <Text variant="h2" style={{ color: colors.text }}>
          {language === 'ne' ? 'सवारी इतिहास' : language === 'hi' ? 'राइड इतिहास' : 'Ride History'} ({displayedItems.length})
        </Text>
        <TouchableOpacity
          style={styles.toggleEmptyBtn}
          onPress={() => setSimulateEmpty(!simulateEmpty)}
          accessible
          accessibilityRole="button"
          accessibilityLabel={simulateEmpty ? 'Show ride history records' : 'Simulate empty ride history'}
        >
          <Text variant="mono" style={{ color: primitive.color.cyan[400], fontSize: 11, fontWeight: '600' }}>
            {simulateEmpty ? '↺ Show History' : '∅ Simulate Empty'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Empty State */}
      {displayedItems.length === 0 ? (
        <View
          style={[
            styles.emptyBox,
            {
              backgroundColor: isDayGlare ? primitive.color.snow[0] : colors.surfaceCard,
              borderColor: colors.borderSubtle,
            },
          ]}
          accessible
          accessibilityRole="summary"
          accessibilityLabel="No ride history recorded in fixture preview"
        >
          <Text variant="mono" style={{ fontSize: 24, textAlign: 'center', marginBottom: 8 }}>
            🏍️
          </Text>
          <Text variant="h3" style={{ color: colors.text, textAlign: 'center' }}>
            No ride history recorded
          </Text>
          <Text variant="bodyMedium" muted style={{ textAlign: 'center', marginTop: 4 }}>
            Empty history fixture state · Completed rides will appear here once live recording capabilities are added.
          </Text>
        </View>
      ) : (
        displayedItems.map((item) => (
          <View
            key={item.id}
            style={[
              styles.historyCard,
              {
                backgroundColor: isDayGlare ? primitive.color.snow[0] : colors.surface,
                borderColor: colors.border,
              },
            ]}
            accessible
            accessibilityRole="summary"
            accessibilityLabel={`Ride: ${getTitle(item)}, Distance: ${item.distanceKm} km, Duration: ${item.durationHours} hours`}
          >
            {/* Title Row + Route Mode Badge */}
            <View style={styles.cardHeader}>
              <View style={{ flex: 1, marginRight: 8 }}>
                <Text variant="h3" style={{ color: colors.text }}>
                  {getTitle(item)}
                </Text>
                <Text variant="mono" style={{ color: colors.textSubtle, fontSize: 11, marginTop: 2 }}>
                  {item.startLocation} ➔ {item.endLocation}
                </Text>
              </View>
              <View style={styles.badgeCol}>
                {getRouteModeBadge(item.routeMode)}
                <View style={{ height: 4 }} />
                {getHistoryStateBadge(item.state)}
              </View>
            </View>

            {/* Metrics Row */}
            <View style={[styles.metricsRow, { borderTopColor: colors.borderSubtle }]}>
              <View style={styles.metricBox}>
                <Text variant="bodySmall" muted>DATE</Text>
                <Text variant="mono" style={{ color: colors.text, fontSize: 12, fontWeight: '700' }}>
                  {calendarSystem === 'BS' ? item.dateBs : item.dateAd}
                </Text>
              </View>
              <View style={styles.metricBox}>
                <Text variant="bodySmall" muted>DISTANCE</Text>
                <Text variant="mono" style={{ color: primitive.color.cyan[400], fontSize: 12, fontWeight: '700' }}>
                  {item.distanceKm} km
                </Text>
              </View>
              <View style={styles.metricBox}>
                <Text variant="bodySmall" muted>DURATION</Text>
                <Text variant="mono" style={{ color: colors.text, fontSize: 12, fontWeight: '700' }}>
                  {item.durationHours} hrs
                </Text>
              </View>
              <View style={styles.metricBox}>
                <Text variant="bodySmall" muted>ELEVATION</Text>
                <Text variant="mono" style={{ color: primitive.color.volt[400], fontSize: 12, fontWeight: '700' }}>
                  +{item.elevationGainM} m
                </Text>
              </View>
            </View>

            {/* Permanent Disclosure */}
            <View style={[styles.cardFooter, { borderTopColor: colors.borderSubtle }]}>
              <Text variant="mono" style={{ color: colors.textSubtle, fontSize: 10 }}>
                ℹ️ {item.syntheticDisclosure}
              </Text>
            </View>
          </View>
        ))
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: primitive.spacing[4],
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: primitive.spacing[3],
  },
  toggleEmptyBtn: {
    minHeight: 48,
    justifyContent: 'center',
    paddingHorizontal: primitive.spacing[2],
  },
  emptyBox: {
    borderRadius: primitive.radius.lg,
    padding: primitive.spacing[6],
    borderWidth: 1,
    alignItems: 'center',
  },
  historyCard: {
    borderRadius: primitive.radius.lg,
    padding: primitive.spacing[4],
    marginBottom: primitive.spacing[3],
    borderWidth: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: primitive.spacing[3],
  },
  badgeCol: {
    alignItems: 'flex-end',
  },
  metricsRow: {
    flexDirection: 'row',
    borderTopWidth: 1,
    paddingTop: primitive.spacing[3],
  },
  metricBox: {
    flex: 1,
  },
  cardFooter: {
    marginTop: primitive.spacing[3],
    paddingTop: primitive.spacing[2],
    borderTopWidth: 0.5,
  },
});
