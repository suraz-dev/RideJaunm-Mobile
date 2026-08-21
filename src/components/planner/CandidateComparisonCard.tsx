/**
 * ============================================================================
 * CANDIDATE COMPARISON CARD COMPONENT (R10)
 * ============================================================================
 *
 * WHY THIS EXISTS:
 * Renders full route comparison metrics (distance, duration, curvature,
 * elevation, surface, hazards, permits, and availability status) for
 * Straight, Curvy, and Supercurvy route profiles.
 *
 * SAFETY & ACCESSIBILITY INVARIANTS:
 * 1. Unavailable candidates are non-selectable and clearly announce reason.
 * 2. Restricted candidates disclose mandatory permits without silent bypass.
 * 3. Never uses SOS Red (#FF1F3D) for route restrictions or warnings.
 * 4. Zero raw hex/RGBA; uses semantic theme tokens.
 */

import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { PlannerRouteCandidate } from '../../domain/tripPlanner';
import { Text } from '../primitives/Text';
import { Badge } from '../primitives/Badge';
import { useTheme } from '../../design/ThemeProvider';
import { primitive, routePresentation } from '../../design/tokens';

export interface CandidateComparisonCardProps {
  candidate: PlannerRouteCandidate;
  isSelected: boolean;
  onSelect: (candidate: PlannerRouteCandidate) => void;
}

export const CandidateComparisonCard: React.FC<CandidateComparisonCardProps> = ({
  candidate,
  isSelected,
  onSelect,
}) => {
  const { colors, mode } = useTheme();
  const isDayGlare = mode === 'dayGlare';

  const config = routePresentation[candidate.profile];
  const isUnavailable = candidate.availability === 'unavailable';
  const isRestricted = candidate.availability === 'restricted';

  const formatHoursMinutes = (minutes: number) => {
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hrs}h ${mins > 0 ? `${mins}m` : ''}`;
  };

  const getBadgeVariant = () => {
    if (isUnavailable) return 'neutral';
    if (candidate.profile === 'supercurvy') return 'supercurvy';
    if (candidate.profile === 'curvy') return 'volt';
    return 'cyan';
  };

  return (
    <TouchableOpacity
      activeOpacity={isUnavailable ? 1.0 : 0.8}
      onPress={() => !isUnavailable && onSelect(candidate)}
      disabled={isUnavailable}
      style={[
        styles.card,
        {
          backgroundColor: isSelected
            ? isDayGlare ? primitive.color.snow[0] : colors.surfaceElevated
            : isUnavailable
            ? colors.surfaceCard
            : colors.surface,
          borderColor: isSelected
            ? config.color
            : isUnavailable
            ? colors.borderSubtle
            : colors.border,
          borderWidth: isSelected ? 2 : 1,
        },
      ]}
      accessible
      accessibilityRole="radio"
      accessibilityState={{ selected: isSelected, disabled: isUnavailable }}
      accessibilityLabel={`${config.label} route: ${candidate.name}. Distance ${candidate.distanceKm} km, duration ${formatHoursMinutes(candidate.durationMinutes)}. ${isUnavailable ? `Unavailable: ${candidate.restrictionReason}` : ''} ${isRestricted ? `Restricted: ${candidate.restrictionReason}` : ''}`}
    >
      {/* Header Row: Profile Badge + Distance/Duration */}
      <View style={styles.headerRow}>
        <View style={styles.badgeCluster}>
          <Badge
            label={isUnavailable ? `${config.label} (UNAVAILABLE)` : config.label}
            variant={getBadgeVariant()}
            size="sm"
          />
          {isRestricted && (
            <Badge
              label="⚠️ PERMIT REQUIRED"
              variant="warning"
              size="sm"
              style={{ marginLeft: primitive.spacing[2] }}
            />
          )}
        </View>
        <Text variant="mono" style={{ color: colors.textSubtle, fontSize: 12 }}>
          {candidate.distanceKm} KM · {formatHoursMinutes(candidate.durationMinutes)}
        </Text>
      </View>

      {/* Route Title & Description */}
      <Text variant="h3" style={{ color: isUnavailable ? colors.textSubtle : colors.text, marginTop: primitive.spacing[2] }}>
        {candidate.name}
      </Text>
      {candidate.nameNepali && (
        <Text variant="bodySmall" style={{ color: isSelected ? config.color : colors.textSubtle, marginTop: 1 }}>
          {candidate.nameNepali}
        </Text>
      )}
      <Text variant="bodyMedium" muted style={{ marginTop: primitive.spacing[2] }}>
        {candidate.description}
      </Text>

      {/* Metrics Grid: Curviness / Bends / Elevation */}
      <View style={[styles.metricsGrid, { borderTopColor: colors.borderSubtle }]}>
        <View style={styles.metricItem}>
          <Text variant="bodySmall" muted style={styles.metricLabel}>
            CURVINESS & BENDS
          </Text>
          <Text variant="bodyLarge" style={{ color: isUnavailable ? colors.textSubtle : config.color, fontWeight: '700' }}>
            {candidate.curvinessScore} / 10
            <Text variant="bodySmall" style={{ color: colors.textSubtle }}>
              {' '}({candidate.bendsCount} bends)
            </Text>
          </Text>
        </View>

        <View style={styles.metricItem}>
          <Text variant="bodySmall" muted style={styles.metricLabel}>
            MAX ELEVATION
          </Text>
          <Text variant="bodyLarge" style={{ color: isUnavailable ? colors.textSubtle : primitive.color.cyan[400], fontWeight: '700' }}>
            {candidate.maxElevationMeters.toLocaleString()} m
            <Text variant="bodySmall" style={{ color: colors.textSubtle }}>
              {' '}ASL
            </Text>
          </Text>
        </View>
      </View>

      {/* Road Surface & Safety Notes */}
      <View style={[styles.surfaceRow, { borderTopColor: colors.borderSubtle }]}>
        <Text variant="mono" style={{ color: colors.textSubtle, fontSize: 11 }}>
          🛣️ {candidate.surfaceSummary}
        </Text>
        <Text variant="mono" style={{ color: primitive.color.semantic.warning, fontSize: 11, marginTop: 2 }}>
          ⚠️ {candidate.hazardsCount} Hazard checkpoints · Max Fuel Gap: {candidate.fuelGapMaxKm} km
        </Text>
      </View>

      {/* Explicit Restriction Reason Banner (Terai / Flat / Permits) */}
      {(isUnavailable || isRestricted) && candidate.restrictionReason && (
        <View
          style={[
            styles.restrictionBox,
            {
              backgroundColor: isDayGlare ? primitive.color.snow[50] : colors.surfaceCard,
              borderColor: primitive.color.semantic.warning,
            },
          ]}
        >
          <Text variant="bodySmall" style={{ color: primitive.color.semantic.warning, fontWeight: '700' }}>
            ⚠️ {candidate.restrictionReason}
          </Text>
          {candidate.permitRequired && (
            <View style={{ marginTop: 4 }}>
              <Text variant="mono" style={{ color: colors.text, fontSize: 11 }}>
                Authority: {candidate.permitRequired.agency} ({candidate.permitRequired.type})
              </Text>
              <Text variant="bodySmall" muted style={{ fontSize: 11, marginTop: 1 }}>
                {candidate.permitRequired.note}
              </Text>
            </View>
          )}
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: primitive.radius.lg,
    padding: primitive.spacing[4],
    marginBottom: primitive.spacing[3],
    minHeight: primitive.size.targetMin,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  badgeCluster: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metricsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: primitive.spacing[3],
    paddingTop: primitive.spacing[2],
    borderTopWidth: 1,
  },
  metricItem: {
    flex: 1,
  },
  metricLabel: {
    fontSize: 10,
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  surfaceRow: {
    marginTop: primitive.spacing[2],
    paddingTop: primitive.spacing[2],
    borderTopWidth: 1,
  },
  restrictionBox: {
    marginTop: primitive.spacing[3],
    padding: primitive.spacing[3],
    borderRadius: primitive.radius.md,
    borderWidth: 1,
  },
});
