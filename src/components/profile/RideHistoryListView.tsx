/**
 * ============================================================================
 * RIDE HISTORY LIST VIEW (R16 REFINED)
 * ============================================================================
 *
 * Coordinates:
 * 1. Pre-authored ride history records with route mode badges.
 * 2. Empty history simulation toggle for UI state testing.
 * 3. AD/BS date format selection.
 * 4. Permanent truth disclosure: "Pre-authored history — no GPS records stored."
 */

import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { FixtureRideHistoryItem, CalendarSystemPreview, AppPreviewLanguage } from '../../domain/profileSettings';
import { Text } from '../primitives/Text';
import { Badge } from '../primitives/Badge';
import { Icon } from '../primitives/Icon';
import { useTheme } from '../../design/ThemeProvider';
import { primitive, routePresentation } from '../../design/tokens';

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
    const config = routePresentation[routeMode];
    const variant = routeMode === 'supercurvy' ? 'supercurvy' : routeMode === 'curvy' ? 'volt' : 'cyan';
    return <Badge label={config.label.toUpperCase()} variant={variant} size="sm" />;
  };

  const getHistoryStateBadge = (state: FixtureRideHistoryItem['state']) => {
    switch (state) {
      case 'cached':
        return <Badge label="CACHED" variant="volt" size="sm" />;
      case 'stale':
        return <Badge label="STALE" variant="warning" size="sm" />;
      case 'draft':
      default:
        return <Badge label="DRAFT" variant="neutral" size="sm" />;
    }
  };

  const getTitle = (item: FixtureRideHistoryItem) => {
    if (language === 'ne' && item.titleNepali) return item.titleNepali;
    if (language === 'hi' && item.titleHindi) return item.titleHindi;
    return item.title;
  };

  return (
    <View style={styles.container}>
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
            {simulateEmpty ? 'Show History' : 'Simulate Empty'}
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
          <Icon name="bike" size={32} color={colors.textSubtle} style={{ marginBottom: 8 }} />
          <Text variant="h3" style={{ color: colors.text, textAlign: 'center' }}>
            No ride history recorded
          </Text>
          <Text variant="bodyMedium" muted style={{ textAlign: 'center', marginTop: 4 }}>
            Empty history state · Completed rides will appear here once recording capabilities are active.
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
                <View style={styles.locationRow}>
                  <Text variant="mono" style={{ color: colors.textSubtle, fontSize: 11 }}>
                    {item.startLocation}
                  </Text>
                  <Icon name="arrow-right" size={11} color={colors.textSubtle} style={{ marginHorizontal: 4 }} />
                  <Text variant="mono" style={{ color: colors.textSubtle, fontSize: 11 }}>
                    {item.endLocation}
                  </Text>
                </View>
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
                <Text variant="bodySmall" muted style={{ fontWeight: '700', letterSpacing: 0.5 }}>DATE</Text>
                <Text variant="mono" style={{ color: colors.text, fontSize: 12, fontWeight: '700', marginTop: 2 }}>
                  {calendarSystem === 'BS' ? item.dateBs : item.dateAd}
                </Text>
              </View>
              <View style={styles.metricBox}>
                <Text variant="bodySmall" muted style={{ fontWeight: '700', letterSpacing: 0.5 }}>DISTANCE</Text>
                <Text variant="mono" style={{ color: primitive.color.cyan[400], fontSize: 12, fontWeight: '700', marginTop: 2 }}>
                  {item.distanceKm} km
                </Text>
              </View>
              <View style={styles.metricBox}>
                <Text variant="bodySmall" muted style={{ fontWeight: '700', letterSpacing: 0.5 }}>DURATION</Text>
                <Text variant="mono" style={{ color: colors.text, fontSize: 12, fontWeight: '700', marginTop: 2 }}>
                  {item.durationHours} hrs
                </Text>
              </View>
              <View style={styles.metricBox}>
                <Text variant="bodySmall" muted style={{ fontWeight: '700', letterSpacing: 0.5 }}>ELEVATION</Text>
                <Text variant="mono" style={{ color: primitive.color.volt[400], fontSize: 12, fontWeight: '700', marginTop: 2 }}>
                  +{item.elevationGainM} m
                </Text>
              </View>
            </View>

            {/* Permanent Disclosure */}
            <View style={[styles.cardFooter, { borderTopColor: colors.borderSubtle }]}>
              <View style={styles.footerRow}>
                <Icon name="info" size={10} color={colors.textSubtle} style={{ marginRight: 4 }} />
                <Text variant="mono" style={{ color: colors.textSubtle, fontSize: 10 }}>
                  {item.syntheticDisclosure}
                </Text>
              </View>
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
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  badgeCol: {
    alignItems: 'flex-end',
  },
  metricsRow: {
    flexDirection: 'row',
    borderTopWidth: 1,
    paddingTop: primitive.spacing[3],
    marginBottom: primitive.spacing[2],
  },
  metricBox: {
    flex: 1,
  },
  cardFooter: {
    marginTop: primitive.spacing[2],
    paddingTop: primitive.spacing[2],
    borderTopWidth: 0.5,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
