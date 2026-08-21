import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { Text } from '../primitives/Text';
import { Badge } from '../primitives/Badge';
import { useTheme } from '../../design/ThemeProvider';
import { primitive } from '../../design/tokens';

interface TelemetryHUDProps {
  speedKmh: number;
  altitudeMeters: number;
  bearingDeg: number;
  gpsStatus: 'locked' | 'acquiring' | 'lost';
  networkStatus: 'online' | 'mesh' | 'offline';
  style?: ViewStyle;
}

export const TelemetryHUD: React.FC<TelemetryHUDProps> = ({
  speedKmh,
  altitudeMeters,
  bearingDeg,
  gpsStatus,
  networkStatus,
  style,
}) => {
  const { colors } = useTheme();

  const getGpsBadge = () => {
    switch (gpsStatus) {
      case 'locked':
        return <Badge label="GPS 3D" variant="volt" size="sm" />;
      case 'acquiring':
        return <Badge label="GPS ACQ..." variant="warning" size="sm" />;
      case 'lost':
      default:
        return <Badge label="GPS LOST" variant="danger" size="sm" />;
    }
  };

  const getNetworkBadge = () => {
    switch (networkStatus) {
      case 'online':
        return <Badge label="4G LIVE" variant="cyan" size="sm" />;
      case 'mesh':
        return <Badge label="BLE MESH (3)" variant="supercurvy" size="sm" />;
      case 'offline':
      default:
        return <Badge label="OFFLINE PACK" variant="neutral" size="sm" />;
    }
  };

  const getBearingCompass = (deg: number) => {
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    const index = Math.round(((deg % 360) / 45)) % 8;
    return directions[index];
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.mapGlass.backgroundColor,
          borderColor: colors.mapGlass.borderColor,
        },
        style,
      ]}
    >
      {/* Top Status Bar */}
      <View style={styles.statusBar}>
        <View style={styles.badgeRow}>
          {getGpsBadge()}
          <View style={{ width: 8 }} />
          {getNetworkBadge()}
        </View>
        <Text variant="mono" style={{ color: colors.textSubtle }}>
          {getBearingCompass(bearingDeg)} {Math.round(bearingDeg)}°
        </Text>
      </View>

      {/* Main Telemetry Readout */}
      <View style={styles.metricsGrid}>
        {/* Speedometer (Hero) */}
        <View style={styles.speedBlock}>
          <Text variant="telemetryHero" style={{ color: primitive.color.volt[400] }}>
            {Math.round(speedKmh)}
          </Text>
          <Text variant="bodySmall" muted style={styles.unitLabel}>
            KM/H
          </Text>
        </View>

        {/* Altitude & Himalayan Elevation */}
        <View style={styles.subMetrics}>
          <View style={styles.metricItem}>
            <Text variant="bodySmall" muted>
              ALTITUDE
            </Text>
            <Text variant="telemetryLarge" style={{ color: primitive.color.cyan[400] }}>
              {Math.round(altitudeMeters)}
              <Text variant="bodySmall" style={{ color: colors.textSubtle }}>
                {' '}m
              </Text>
            </Text>
          </View>
        </View>
      </View>
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
    shadowOpacity: 0.4,
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
});
