/**
 * ============================================================================
 * OFFLINE REGION CARD COMPONENT (R16 REFINED)
 * ============================================================================
 *
 * WHY THIS EXISTS:
 * Renders individual offline map region packs across all 8 lifecycle states
 * with component-local interactive previews and vector icons.
 */

import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { OfflineRegion, OfflinePackLifecycle } from '../../domain/offline';
import { Text } from '../primitives/Text';
import { Badge } from '../primitives/Badge';
import { Icon } from '../primitives/Icon';
import { useTheme } from '../../design/ThemeProvider';
import { primitive } from '../../design/tokens';

export interface OfflineRegionCardProps {
  region: OfflineRegion;
  isSelected?: boolean;
  onSelect?: (region: OfflineRegion) => void;
  onLifecycleChange?: (regionId: string, nextLifecycle: OfflinePackLifecycle) => void;
  onActionNotice?: (notice: string) => void;
}

export const OfflineRegionCard: React.FC<OfflineRegionCardProps> = ({
  region,
  isSelected = false,
  onSelect,
  onLifecycleChange,
  onActionNotice,
}) => {
  const { colors, mode } = useTheme();
  const isDayGlare = mode === 'dayGlare';

  const [isExpanded, setIsExpanded] = useState(false);
  const [isPendingRemove, setIsPendingRemove] = useState(false);

  const formatMb = (bytes: number) => Math.round(bytes / (1024 * 1024));

  const getLifecycleBadgeVariant = (lifecycle: OfflinePackLifecycle) => {
    switch (lifecycle) {
      case 'complete':
        return 'volt';
      case 'downloading':
        return 'cyan';
      case 'queued':
        return 'neutral';
      case 'paused':
      case 'partial':
      case 'stale':
      case 'failed':
      case 'storage_full':
      default:
        return 'warning';
    }
  };

  const getLifecycleLabel = (lifecycle: OfflinePackLifecycle) => {
    switch (lifecycle) {
      case 'complete':
        return 'COMPLETE (FIXTURE)';
      case 'downloading':
        return `DOWNLOADING PREVIEW (${region.progressPercentage}%)`;
      case 'queued':
        return 'QUEUED (FIXTURE)';
      case 'paused':
        return `PAUSED PREVIEW (${region.progressPercentage}%)`;
      case 'partial':
        return `PARTIAL PREVIEW (${region.progressPercentage}%)`;
      case 'stale':
        return 'STALE (FIXTURE UPDATE PREVIEW)';
      case 'failed':
        return 'FAILED (SIMULATED)';
      case 'storage_full':
        return 'STORAGE FULL (FIXTURE)';
    }
  };

  const handlePauseResume = () => {
    if (region.lifecycle === 'downloading') {
      onLifecycleChange?.(region.id, 'paused');
      onActionNotice?.('Paused preview · No real download transfer active');
    } else if (region.lifecycle === 'paused') {
      onLifecycleChange?.(region.id, 'downloading');
      onActionNotice?.('Resumed preview · Simulated progress only');
    }
  };

  const handleRetry = () => {
    onLifecycleChange?.(region.id, 'downloading');
    onActionNotice?.('Retry preview only — no download started');
  };

  const handleConfirmRemove = () => {
    setIsPendingRemove(false);
    onActionNotice?.('Removal preview only — no region was deleted');
  };

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: isSelected
            ? isDayGlare ? primitive.color.snow[0] : colors.surfaceElevated
            : isDayGlare ? primitive.color.snow[0] : colors.surface,
          borderColor: isSelected ? primitive.color.volt[400] : colors.border,
          borderWidth: isSelected ? 2 : 1,
        },
      ]}
      accessible
      accessibilityRole="summary"
      accessibilityLabel={`Offline region pack: ${region.name}. Status: ${region.lifecycle}. Size: ${formatMb(region.sizeBytes)} MB.`}
    >
      {/* Header Row: Title + Lifecycle Badge */}
      <View style={styles.headerRow}>
        <View style={styles.titleInfo}>
          <Text variant="h3" style={{ color: colors.text }}>
            {region.name}
          </Text>
          {region.nameNepali && (
            <Text variant="bodySmall" style={{ color: colors.textSubtle, marginTop: 1, fontFamily: 'Mukta_500Medium' }}>
              {region.nameNepali}
            </Text>
          )}
        </View>
        <Badge
          label={getLifecycleLabel(region.lifecycle)}
          variant={getLifecycleBadgeVariant(region.lifecycle)}
          size="sm"
        />
      </View>

      {/* Metrics Row: Size + Features */}
      <View style={[styles.metricsRow, { borderTopColor: colors.borderSubtle }]}>
        <Text variant="mono" style={{ color: colors.textSubtle, fontSize: 11 }}>
          Size: {formatMb(region.sizeBytes)} MB · Zoom: {region.zoomMin}–{region.zoomMax}
        </Text>
        <View style={styles.featureBadges}>
          {region.includes3dElevation && (
            <Badge label="3D ELEVATION" variant="cyan" size="sm" style={{ marginRight: 4 }} />
          )}
          {region.includesHeliLandingZones && (
            <Badge label="HELI LZ" variant="warning" size="sm" />
          )}
        </View>
      </View>

      {/* Progress Bar for downloading/paused/partial */}
      {(region.lifecycle === 'downloading' ||
        region.lifecycle === 'paused' ||
        region.lifecycle === 'partial') && (
        <View style={styles.progressContainer}>
          <View
            style={[
              styles.progressTrack,
              {
                backgroundColor: isDayGlare ? primitive.color.snow[300] : colors.surfaceCard,
                borderColor: colors.borderSubtle,
              },
            ]}
          >
            <View
              style={[
                styles.progressBar,
                {
                  width: `${region.progressPercentage ?? 0}%`,
                  backgroundColor:
                    region.lifecycle === 'downloading'
                      ? primitive.color.cyan[400]
                      : primitive.color.semantic.warning,
                },
              ]}
            />
          </View>
        </View>
      )}

      {/* Warning/Failure Banner for stale/failed/storage_full */}
      {region.lifecycle === 'stale' && (
        <View
          style={[
            styles.warningBanner,
            {
              backgroundColor: isDayGlare ? primitive.color.snow[50] : colors.surfaceCard,
              borderColor: primitive.color.semantic.warning,
            },
          ]}
        >
          <View style={styles.warningTitleRow}>
            <Icon name="alert-triangle" size={13} color={primitive.color.semantic.warning} style={{ marginRight: 6 }} />
            <Text variant="bodySmall" style={{ color: primitive.color.semantic.warning, fontWeight: '700' }}>
              Stale Fixture State — Future Update Preview
            </Text>
          </View>
          <Text variant="mono" style={{ color: colors.text, fontSize: 11, marginTop: 2 }}>
            Pack expired {region.expiryUtc}. In future builds, tapping update will fetch diff delta.
          </Text>
        </View>
      )}

      {(region.lifecycle === 'failed' || region.lifecycle === 'storage_full') && (
        <View
          style={[
            styles.warningBanner,
            {
              backgroundColor: isDayGlare ? primitive.color.snow[50] : colors.surfaceCard,
              borderColor: primitive.color.semantic.warning,
            },
          ]}
        >
          <View style={styles.warningTitleRow}>
            <Icon name="alert-triangle" size={13} color={primitive.color.semantic.warning} style={{ marginRight: 6 }} />
            <Text variant="bodySmall" style={{ color: primitive.color.semantic.warning, fontWeight: '700' }}>
              {region.lifecycle === 'storage_full' ? 'Storage Pressure Warning' : 'Simulated Transfer Fault'}
            </Text>
          </View>
          <Text variant="mono" style={{ color: colors.text, fontSize: 11, marginTop: 2 }}>
            {region.failureReason}
          </Text>
        </View>
      )}

      {/* Expanded Details Section */}
      {isExpanded && (
        <View style={[styles.expandedBox, { borderTopColor: colors.borderSubtle }]}>
          <Text variant="mono" style={{ color: colors.textSubtle, fontSize: 10 }}>
            Checksum: {region.checksumSha256.substring(0, 24)}...
          </Text>
          <Text variant="mono" style={{ color: colors.textSubtle, fontSize: 10, marginTop: 2 }}>
            Bounds: [{region.bounds.minLat.toFixed(2)}, {region.bounds.minLng.toFixed(2)}] to [{region.bounds.maxLat.toFixed(2)}, {region.bounds.maxLng.toFixed(2)}]
          </Text>
          <Text variant="mono" style={{ color: colors.textSubtle, fontSize: 10, marginTop: 2 }}>
            Fixture timestamp: {region.lastUpdatedUtc} · Fixture expiry: {region.expiryUtc}
          </Text>
        </View>
      )}

      {/* Interactive Controls Row */}
      <View style={[styles.actionsRow, { borderTopColor: colors.borderSubtle }]}>
        {/* Toggle Details Button */}
        <TouchableOpacity
          style={[styles.smallBtn, { borderColor: colors.borderSubtle }]}
          onPress={() => setIsExpanded(!isExpanded)}
          accessible
          accessibilityRole="button"
          accessibilityLabel={isExpanded ? `Hide ${region.name} fixture details` : `Show ${region.name} fixture details`}
        >
          <View style={styles.actionBtnRow}>
            <Icon name={isExpanded ? 'chevron-up' : 'chevron-down'} size={12} color={primitive.color.cyan[400]} style={{ marginRight: 4 }} />
            <Text variant="mono" style={{ color: primitive.color.cyan[400], fontSize: 11, fontWeight: '600' }}>
              {isExpanded ? 'Hide Details' : 'Details'}
            </Text>
          </View>
        </TouchableOpacity>

        {/* Map Preview Focus Button */}
        {onSelect && (
          <TouchableOpacity
            style={[styles.smallBtn, { borderColor: colors.borderSubtle }]}
            onPress={() => onSelect(region)}
            accessible
            accessibilityRole="button"
            accessibilityLabel={`Show ${region.name} bounds in map preview`}
          >
            <View style={styles.actionBtnRow}>
              <Icon name="navigation" size={12} color={colors.interactive} style={{ marginRight: 4 }} />
              <Text variant="mono" style={{ color: colors.interactive, fontSize: 11, fontWeight: '600' }}>
                Map Bounds
              </Text>
            </View>
          </TouchableOpacity>
        )}

        {/* Pause/Resume for downloading/paused */}
        {(region.lifecycle === 'downloading' || region.lifecycle === 'paused') && (
          <TouchableOpacity
            style={[styles.smallBtn, { borderColor: colors.borderSubtle }]}
            onPress={handlePauseResume}
            accessible
            accessibilityRole="button"
            accessibilityLabel={
              region.lifecycle === 'downloading'
                ? `Pause ${region.name} fixture download preview`
                : `Resume ${region.name} fixture download preview`
            }
          >
            <Text variant="mono" style={{ color: colors.text, fontSize: 11, fontWeight: '700' }}>
              {region.lifecycle === 'downloading' ? 'Pause' : 'Resume'}
            </Text>
          </TouchableOpacity>
        )}

        {/* Retry Button for Failed */}
        {region.lifecycle === 'failed' && (
          <TouchableOpacity
            style={[styles.smallBtn, { borderColor: primitive.color.semantic.warning }]}
            onPress={handleRetry}
            accessible
            accessibilityRole="button"
            accessibilityLabel={`Retry ${region.name} simulated transfer`}
          >
            <Text variant="mono" style={{ color: primitive.color.semantic.warning, fontSize: 11, fontWeight: '700' }}>
              Retry
            </Text>
          </TouchableOpacity>
        )}

        {/* Removal Button */}
        {!isPendingRemove ? (
          <TouchableOpacity
            style={[styles.smallBtn, { borderColor: colors.borderSubtle }]}
            onPress={() => setIsPendingRemove(true)}
            accessible
            accessibilityRole="button"
            accessibilityLabel={`Remove ${region.name} fixture preview`}
          >
            <View style={styles.actionBtnRow}>
              <Icon name="x" size={12} color={colors.textSubtle} style={{ marginRight: 4 }} />
              <Text variant="mono" style={{ color: colors.textSubtle, fontSize: 11 }}>
                Remove
              </Text>
            </View>
          </TouchableOpacity>
        ) : (
          <View style={styles.confirmInlineRow}>
            <TouchableOpacity
              style={[
                styles.smallBtn,
                {
                  backgroundColor: colors.surfaceElevated,
                  borderColor: primitive.color.semantic.warning,
                  marginRight: 6,
                },
              ]}
              onPress={handleConfirmRemove}
              accessible
              accessibilityRole="button"
              accessibilityLabel={`Confirm removal of ${region.name} fixture preview`}
            >
              <Text variant="mono" style={{ color: primitive.color.semantic.warning, fontSize: 11, fontWeight: '700' }}>
                CONFIRM
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.smallBtn,
                {
                  backgroundColor: colors.surfaceElevated,
                  borderColor: colors.borderSubtle,
                },
              ]}
              onPress={() => setIsPendingRemove(false)}
              accessible
              accessibilityRole="button"
              accessibilityLabel={`Cancel removal of ${region.name}`}
            >
              <Text variant="mono" style={{ color: colors.textSubtle, fontSize: 11 }}>
                CANCEL
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Permanent Truth Disclosure */}
      <View style={[styles.cardFooter, { borderTopColor: colors.borderSubtle }]}>
        <View style={styles.footerRow}>
          <Icon name="info" size={10} color={colors.textSubtle} style={{ marginRight: 4 }} />
          <Text variant="mono" style={{ color: colors.textSubtle, fontSize: 10 }}>
            Simulated fixture pack · No device files or downloads performed
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: primitive.radius.lg,
    padding: primitive.spacing[4],
    marginBottom: primitive.spacing[3],
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  titleInfo: {
    flex: 1,
    marginRight: primitive.spacing[2],
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: primitive.spacing[3],
    paddingTop: primitive.spacing[2],
    borderTopWidth: 1,
  },
  featureBadges: {
    flexDirection: 'row',
  },
  progressContainer: {
    marginTop: primitive.spacing[2],
  },
  progressTrack: {
    height: 8,
    borderRadius: primitive.radius.full,
    overflow: 'hidden',
    borderWidth: 1,
  },
  progressBar: {
    height: '100%',
  },
  warningBanner: {
    marginTop: primitive.spacing[3],
    padding: primitive.spacing[3],
    borderRadius: primitive.radius.md,
    borderWidth: 1,
  },
  warningTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  expandedBox: {
    marginTop: primitive.spacing[3],
    paddingTop: primitive.spacing[2],
    borderTopWidth: 0.5,
  },
  actionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: primitive.spacing[2],
    marginTop: primitive.spacing[3],
    paddingTop: primitive.spacing[2],
    borderTopWidth: 1,
  },
  smallBtn: {
    minHeight: 48,
    paddingHorizontal: primitive.spacing[3],
    borderRadius: primitive.radius.md,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionBtnRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  confirmInlineRow: {
    flexDirection: 'row',
  },
  cardFooter: {
    marginTop: primitive.spacing[3],
    paddingTop: primitive.spacing[2],
    borderTopWidth: 0.5,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
