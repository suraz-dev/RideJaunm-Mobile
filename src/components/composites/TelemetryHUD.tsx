/**
 * ============================================================================
 * TRUTHFUL TELEMETRY HUD COMPOSITE (R16 REFINED)
 * ============================================================================
 *
 * Displays rider speed, elevation altitude, bearing compass, and GPS/network
 * lock state in a rugged, compact motorcycle cluster layout.
 *
 * TRUTHFULNESS & SAFETY INVARIANTS:
 * 1. 4 Explicit GPS States: 'locked', 'acquiring', 'stale', 'lost'.
 * 2. Stale/Lost states NEVER use numeric 0 as a substitute for unavailable
 *    telemetry; non-numeric placeholder ("--") is displayed instead.
 * 3. Stale GPS clearly discloses last-known fix age and avoids "live" claims.
 * 4. A valid observed speed of 0 is preserved and displayed as "0" (never fabricated).
 * 5. Uses semantic tokens and crisp vector icons.
 */

import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { Text } from '../primitives/Text';
import { Badge } from '../primitives/Badge';
import { Icon } from '../primitives/Icon';
import { useTheme } from '../../design/ThemeProvider';
import { primitive } from '../../design/tokens';
import { GpsLockState } from '../../domain/connectivity';

export interface TelemetryHUDProps {
  speedKmh?: number;
  altitudeMeters?: number;
  bearingDeg?: number;
  gpsStatus: GpsLockState;
  networkStatus: 'online' | 'mesh' | 'offline';
  sourceLabel?: string;
  observationAgeSeconds?: number;
  style?: ViewStyle;
}

export const TelemetryHUD: React.FC<TelemetryHUDProps> = ({
  speedKmh,
  altitudeMeters,
  bearingDeg,
  gpsStatus,
  networkStatus,
  sourceLabel,
  observationAgeSeconds,
  style,
}) => {
  const { colors, mode } = useTheme();
  const isDayGlare = mode === 'dayGlare';

  const getGpsBadge = () => {
    switch (gpsStatus) {
      case 'locked':
        return (
          <Badge
            label="GPS LOCKED"
            variant="volt"
            size="sm"
            icon={<Icon name="locate" size={12} color={primitive.color.volt[400]} />}
          />
        );
      case 'acquiring':
        return (
          <Badge
            label="ACQUIRING GPS..."
            variant="warning"
            size="sm"
            icon={<Icon name="refresh" size={12} color={primitive.color.semantic.warning} />}
          />
        );
      case 'stale':
        return (
          <Badge
            label="LAST KNOWN FIX"
            variant="warning"
            size="sm"
            icon={<Icon name="clock" size={12} color={primitive.color.semantic.warning} />}
          />
        );
      case 'lost':
      default:
        return (
          <Badge
            label="GPS UNAVAILABLE"
            variant="danger"
            size="sm"
            icon={<Icon name="alert-triangle" size={12} color={primitive.color.semantic.danger} />}
          />
        );
    }
  };

  const getNetworkBadge = () => {
    switch (networkStatus) {
      case 'online':
        return (
          <Badge
            label="CELLULAR 4G"
            variant="cyan"
            size="sm"
            icon={<Icon name="wifi" size={12} color={primitive.color.cyan[400]} />}
          />
        );
      case 'mesh':
        return (
          <Badge
            label="BLE MESH RELAY"
            variant="supercurvy"
            size="sm"
            icon={<Icon name="radio" size={12} color={primitive.color.route.supercurvy} />}
          />
        );
      case 'offline':
      default:
        return (
          <Badge
            label="OFFLINE CACHE"
            variant="neutral"
            size="sm"
            icon={<Icon name="wifi-off" size={12} color={colors.textMuted} />}
          />
        );
    }
  };

  const getBearingCompass = (deg?: number) => {
    if (deg === undefined || gpsStatus === 'lost' || gpsStatus === 'acquiring') {
      return '--°';
    }
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    const index = Math.round(((deg % 360) / 45)) % 8;
    return `${directions[index]} ${Math.round(deg)}°`;
  };

  const formatSpeed = () => {
    if (gpsStatus !== 'locked' || typeof speedKmh !== 'number') {
      return '--';
    }
    return Math.round(speedKmh).toString();
  };

  const formatAltitude = () => {
    if (typeof altitudeMeters !== 'number' || gpsStatus === 'lost') {
      return '--';
    }
    return Math.round(altitudeMeters).toString();
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: isDayGlare ? colors.surfaceElevated : colors.surface,
          borderColor: colors.border,
          shadowColor: primitive.color.graphite[950],
        },
        style,
      ]}
      accessible
      accessibilityRole="summary"
      accessibilityLabel={`Telemetry HUD: GPS ${gpsStatus}, Speed ${formatSpeed()} KM/H, Altitude ${formatAltitude()} meters.`}
    >
      {/* Top Status & Bearing Bar */}
      <View style={styles.statusBar}>
        <View style={styles.badgeRow}>
          {getGpsBadge()}
          <View style={{ width: primitive.spacing[2] }} />
          {getNetworkBadge()}
        </View>
        <View style={styles.bearingRow}>
          <Icon name="compass" size={13} color={colors.textSubtle} style={{ marginRight: 3 }} />
          <Text variant="mono" style={{ color: colors.textSubtle, fontSize: 11, fontWeight: '700' }}>
            {getBearingCompass(bearingDeg)}
          </Text>
        </View>
      </View>

      {/* Main Telemetry Readout Grid */}
      <View style={styles.metricsGrid}>
        {/* Speedometer (Hero) */}
        <View style={styles.speedBlock}>
          <Text
            variant="telemetryHero"
            style={{
              color: gpsStatus === 'locked' ? primitive.color.volt[400] : colors.textSubtle,
              fontFamily: 'SpaceGrotesk_700Bold',
              fontSize: 44,
              lineHeight: 48,
              letterSpacing: -1,
            }}
          >
            {formatSpeed()}
          </Text>
          <Text variant="bodySmall" muted style={styles.unitLabel}>
            KM/H
          </Text>
        </View>

        {/* Altitude & Himalayan Elevation */}
        <View style={styles.subMetrics}>
          <View style={styles.metricItem}>
            <View style={styles.metricLabelRow}>
              <Icon name="mountain" size={11} color={colors.textSubtle} style={{ marginRight: 3 }} />
              <Text variant="bodySmall" muted style={{ fontSize: 9, letterSpacing: 0.5, fontWeight: '700' }}>
                ALTITUDE
              </Text>
            </View>
            <Text
              variant="telemetryLarge"
              style={{
                color: gpsStatus === 'lost' ? colors.textSubtle : primitive.color.cyan[400],
                fontFamily: 'JetBrainsMono_700Bold',
                fontSize: 20,
              }}
            >
              {formatAltitude()}
              <Text variant="bodySmall" style={{ color: colors.textSubtle, fontSize: 11 }}>
                {' '}m
              </Text>
            </Text>
          </View>
        </View>
      </View>

      {/* Observation Source / Stale Age Disclosure Banner */}
      {(sourceLabel || gpsStatus === 'stale') && (
        <View style={[styles.provenanceRow, { borderTopColor: colors.borderSubtle }]}>
          <Icon name="info" size={11} color={colors.textSubtle} style={{ marginRight: 4 }} />
          <Text variant="mono" style={{ color: colors.textSubtle, fontSize: 10 }}>
            {sourceLabel || (observationAgeSeconds ? `Last observed ${observationAgeSeconds}s ago` : 'Last known GPS fix')}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: primitive.radius.lg,
    padding: primitive.spacing[3],
    borderWidth: 1,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  statusBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: primitive.spacing[2],
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bearingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metricsGrid: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingVertical: 2,
  },
  speedBlock: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  unitLabel: {
    marginLeft: primitive.spacing[2],
    fontWeight: '800',
    letterSpacing: 0.5,
    fontSize: 11,
  },
  subMetrics: {
    alignItems: 'flex-end',
  },
  metricItem: {
    alignItems: 'flex-end',
  },
  metricLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  provenanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: primitive.spacing[2],
    paddingTop: primitive.spacing[1],
    borderTopWidth: 0.5,
  },
});
