/**
 * ============================================================================
 * TRUTHFUL TELEMETRY HUD COMPOSITE (R9)
 * ============================================================================
 *
 * WHY THIS EXISTS:
 * Displays rider speed, elevation altitude, bearing compass, and GPS/network
 * lock state with strict truthfulness.
 *
 * TRUTHFULNESS & SAFETY INVARIANTS:
 * 1. 4 Explicit GPS States: 'locked', 'acquiring', 'stale', 'lost'.
 * 2. Stale/Lost states NEVER use numeric 0 as a substitute for unavailable
 *    telemetry; non-numeric placeholder ("--") is displayed instead.
 * 3. Stale GPS clearly discloses last-known fix age and avoids "live" claims.
 * 4. Never uses SOS Red (#FF1F3D) for GPS errors or offline status.
 */

import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { Text } from '../primitives/Text';
import { Badge } from '../primitives/Badge';
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
        return <Badge label="GPS LOCKED" variant="volt" size="sm" />;
      case 'acquiring':
        return <Badge label="ACQUIRING GPS..." variant="warning" size="sm" />;
      case 'stale':
        return <Badge label="LAST KNOWN FIX" variant="warning" size="sm" />;
      case 'lost':
      default:
        // Semantic danger (never SOS red)
        return <Badge label="GPS UNAVAILABLE" variant="danger" size="sm" />;
    }
  };

  const getNetworkBadge = () => {
    switch (networkStatus) {
      case 'online':
        return <Badge label="CELLULAR 4G" variant="cyan" size="sm" />;
      case 'mesh':
        return <Badge label="BLE MESH RELAY" variant="supercurvy" size="sm" />;
      case 'offline':
      default:
        return <Badge label="OFFLINE CACHE" variant="neutral" size="sm" />;
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
    if (gpsStatus !== 'locked' || speedKmh === undefined) {
      return '--';
    }
    return Math.round(speedKmh).toString();
  };

  const formatAltitude = () => {
    if (altitudeMeters === undefined || gpsStatus === 'lost') {
      return '--';
    }
    return Math.round(altitudeMeters).toString();
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: isDayGlare ? colors.surfaceElevated : colors.mapGlass.backgroundColor,
          borderColor: colors.border,
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
        <Text variant="mono" style={{ color: colors.textSubtle, fontSize: 12 }}>
          {getBearingCompass(bearingDeg)}
        </Text>
      </View>

      {/* Main Telemetry Readout Grid */}
      <View style={styles.metricsGrid}>
        {/* Speedometer (Hero) */}
        <View style={styles.speedBlock}>
          <Text
            variant="telemetryHero"
            style={{
              color: gpsStatus === 'locked' ? colors.interactive : colors.textSubtle,
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
            <Text variant="bodySmall" muted style={{ fontSize: 10, letterSpacing: 0.5 }}>
              ALTITUDE
            </Text>
            <Text
              variant="telemetryLarge"
              style={{
                color: gpsStatus === 'lost' ? colors.textSubtle : primitive.color.cyan[400],
              }}
            >
              {formatAltitude()}
              <Text variant="bodySmall" style={{ color: colors.textSubtle }}>
                {' '}m
              </Text>
            </Text>
          </View>
        </View>
      </View>

      {/* Observation Source / Stale Age Disclosure Banner */}
      {(sourceLabel || gpsStatus === 'stale') && (
        <View style={[styles.provenanceRow, { borderTopColor: colors.borderSubtle }]}>
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
    borderRadius: primitive.radius.xl,
    padding: primitive.spacing[4],
    borderWidth: 1,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 6,
  },
  statusBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: primitive.spacing[3],
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metricsGrid: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  speedBlock: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  unitLabel: {
    marginLeft: primitive.spacing[2],
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  subMetrics: {
    alignItems: 'flex-end',
  },
  metricItem: {
    alignItems: 'flex-end',
  },
  provenanceRow: {
    marginTop: primitive.spacing[2],
    paddingTop: primitive.spacing[1],
    borderTopWidth: 0.5,
  },
});
