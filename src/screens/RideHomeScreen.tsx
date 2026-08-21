import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Text } from '../components/primitives/Text';
import { TelemetryHUD } from '../components/composites/TelemetryHUD';
import { RouteModeSelector, RouteMode } from '../components/composites/RouteModeSelector';
import { Badge } from '../components/primitives/Badge';
import { Button } from '../components/primitives/Button';
import { useTheme } from '../design/ThemeProvider';
import { primitive } from '../design/tokens';

export const RideHomeScreen: React.FC = () => {
  const { colors } = useTheme();
  const [selectedRouteMode, setSelectedRouteMode] = useState<RouteMode>('curvy');
  const [isNavigating, setIsNavigating] = useState(false);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Simulated Map Surface Area */}
      <View style={[styles.mapPlaceholder, { backgroundColor: colors.surface }]}>
        <View style={styles.mapGridLines}>
          <Text variant="mono" style={{ color: colors.textSubtle, opacity: 0.6 }}>
            N 27°42'54.2" · E 85°19'30.1" · 1,400m ASL
          </Text>
          <Text variant="bodySmall" style={{ color: primitive.color.volt[400], marginTop: 4 }}>
            📍 Kathmandu Valley ➔ Dhulikhel Ridge
          </Text>
        </View>

        {/* Floating Top In-Ride Warning */}
        <View style={styles.hazardBanner}>
          <Badge
            label="⚠️ Monsoon Warning: Mugling Section (Mud/Gravel)"
            variant="warning"
            size="md"
          />
        </View>
      </View>

      {/* Bottom Tactical Floating Console */}
      <View style={styles.bottomConsole}>
        <TelemetryHUD
          speedKmh={isNavigating ? 68 : 0}
          altitudeMeters={1740}
          bearingDeg={45}
          gpsStatus="locked"
          networkStatus="online"
          style={styles.hudOverlay}
        />

        <View style={styles.routeSelectorWrapper}>
          <RouteModeSelector
            selectedMode={selectedRouteMode}
            onSelectMode={setSelectedRouteMode}
          />
        </View>

        <View style={styles.actionRow}>
          <Button
            label={isNavigating ? 'END RIDE' : 'START RIDE (राइड सुरु)'}
            onPress={() => setIsNavigating(!isNavigating)}
            variant={isNavigating ? 'danger' : 'primary'}
            inRide
            style={styles.startBtn}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  mapPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapGridLines: {
    padding: primitive.spacing[4],
    alignItems: 'center',
  },
  hazardBanner: {
    position: 'absolute',
    top: 56,
    paddingHorizontal: primitive.spacing[4],
    width: '100%',
    alignItems: 'center',
  },
  bottomConsole: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
  },
  hudOverlay: {
    marginBottom: primitive.spacing[3],
  },
  routeSelectorWrapper: {
    marginBottom: primitive.spacing[3],
  },
  actionRow: {
    flexDirection: 'row',
  },
  startBtn: {
    flex: 1,
  },
});
