/**
 * ============================================================================
 * STORAGE SUMMARY BAR COMPONENT (R12)
 * ============================================================================
 *
 * WHY THIS EXISTS:
 * Renders pre-authored fixture storage metrics and a segmented visual bar
 * showing simulated offline map pack capacity without reading real device storage.
 *
 * INVARIANTS:
 * 1. Zero device flash storage access.
 * 2. Segmented visual bar with accessible percentage announcements.
 * 3. Never uses SOS Red (#FF1F3D) for storage pressure warnings.
 * 4. Zero raw hex/RGBA; uses semantic theme tokens.
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from '../primitives/Text';
import { Badge } from '../primitives/Badge';
import { Icon } from '../primitives/Icon';
import { useTheme } from '../../design/ThemeProvider';
import { primitive } from '../../design/tokens';

export interface StorageSummaryBarProps {
  mapPacksBytes?: number;
  appCacheBytes?: number;
  freeDeviceBytes?: number;
}

export const StorageSummaryBar: React.FC<StorageSummaryBarProps> = ({
  mapPacksBytes = 1503238554, // 1.4 GB
  appCacheBytes = 429496730,  // 0.4 GB
  freeDeviceBytes = 15247133696, // 14.2 GB
}) => {
  const { colors, mode } = useTheme();
  const isDayGlare = mode === 'dayGlare';

  const totalBytes = mapPacksBytes + appCacheBytes + freeDeviceBytes;
  const mapPercent = Math.round((mapPacksBytes / totalBytes) * 100);
  const cachePercent = Math.round((appCacheBytes / totalBytes) * 100);

  const formatGb = (bytes: number) => (bytes / (1024 * 1024 * 1024)).toFixed(1);

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: isDayGlare ? primitive.color.snow[0] : colors.surface,
          borderColor: colors.border,
        },
      ]}
      accessible
      accessibilityRole="summary"
      accessibilityLabel={`Storage summary: ${formatGb(mapPacksBytes)} GB used by offline maps (${mapPercent}%), ${formatGb(appCacheBytes)} GB app cache, ${formatGb(freeDeviceBytes)} GB free storage.`}
    >
      {/* Header Row */}
      <View style={styles.headerRow}>
        <View>
          <Text variant="h3" style={{ color: colors.text }}>
            Storage Overview (भण्डारण सारांश)
          </Text>
          <Text variant="mono" style={{ color: colors.textSubtle, fontSize: 11, marginTop: 2 }}>
            {formatGb(mapPacksBytes)} GB MAPS · {formatGb(freeDeviceBytes)} GB FREE
          </Text>
        </View>
        <Badge label="STORAGE ESTIMATE" variant="neutral" size="sm" />
      </View>

      {/* Segmented Visual Progress Bar */}
      <View
        style={[
          styles.barTrack,
          {
            backgroundColor: isDayGlare ? primitive.color.snow[300] : colors.surfaceElevated,
            borderColor: colors.borderSubtle,
          },
        ]}
      >
        {/* Maps Segment */}
        <View
          style={[
            styles.segment,
            {
              width: `${mapPercent}%`,
              backgroundColor: primitive.color.volt[400],
            },
          ]}
        />
        {/* App Cache Segment */}
        <View
          style={[
            styles.segment,
            {
              width: `${cachePercent}%`,
              backgroundColor: primitive.color.cyan[400],
            },
          ]}
        />
      </View>

      {/* Legend & Breakdown */}
      <View style={styles.legendRow}>
        <View style={styles.legendItem}>
          <View style={[styles.dot, { backgroundColor: primitive.color.volt[400] }]} />
          <Text variant="mono" style={{ color: colors.text, fontSize: 10 }}>
            Offline Packs ({formatGb(mapPacksBytes)} GB)
          </Text>
        </View>

        <View style={styles.legendItem}>
          <View style={[styles.dot, { backgroundColor: primitive.color.cyan[400] }]} />
          <Text variant="mono" style={{ color: colors.text, fontSize: 10 }}>
            Cache ({formatGb(appCacheBytes)} GB)
          </Text>
        </View>

        <View style={styles.legendItem}>
          <View
            style={[
              styles.dot,
              {
                backgroundColor: isDayGlare
                  ? primitive.color.graphite[500]
                  : primitive.color.graphite[300],
              },
            ]}
          />
          <Text variant="mono" style={{ color: colors.textSubtle, fontSize: 10 }}>
            Free ({formatGb(freeDeviceBytes)} GB)
          </Text>
        </View>
      </View>

      {/* Permanent Truth Disclosure */}
      <View style={[styles.disclosureBox, { borderTopColor: colors.borderSubtle }]}>
        <View style={styles.disclosureRow}>
          <Icon name="info" size={10} color={colors.textSubtle} style={{ marginRight: 4 }} />
          <Text variant="mono" style={{ color: colors.textSubtle, fontSize: 10 }}>
            Storage estimate · Device storage preview
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: primitive.radius.lg,
    padding: primitive.spacing[4],
    marginBottom: primitive.spacing[4],
    borderWidth: 1,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: primitive.spacing[3],
  },
  barTrack: {
    height: 12,
    borderRadius: primitive.radius.full,
    flexDirection: 'row',
    overflow: 'hidden',
    borderWidth: 1,
    marginBottom: primitive.spacing[3],
  },
  segment: {
    height: '100%',
  },
  legendRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: primitive.spacing[3],
    marginBottom: primitive.spacing[2],
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  disclosureBox: {
    marginTop: primitive.spacing[2],
    paddingTop: primitive.spacing[2],
    borderTopWidth: 0.5,
  },
  disclosureRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
