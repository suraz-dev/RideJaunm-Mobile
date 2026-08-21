import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Modal } from 'react-native';
import { Text } from '../components/primitives/Text';
import { Badge } from '../components/primitives/Badge';
import { Button } from '../components/primitives/Button';
import { SOSButton } from '../components/primitives/SOSButton';
import { useTheme } from '../design/ThemeProvider';
import { primitive, safety } from '../design/tokens';
import * as Haptics from 'expo-haptics';

export const SOSConsoleScreen: React.FC = () => {
  const { colors } = useTheme();
  const [isArmed, setIsArmed] = useState(false);
  const [countdown, setCountdown] = useState(10);

  const handleArmSOS = () => {
    setIsArmed(true);
    setCountdown(10);
  };

  const handleCancelSOS = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setIsArmed(false);
  };

  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;
    if (isArmed && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isArmed, countdown]);

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
    >
      <View style={styles.header}>
        <Badge label="EMERGENCY SUBSYSTEM (आपतकालीन)" variant="danger" size="md" />
        <Text variant="h1" style={[styles.title, { color: safety.sos.color }]}>
          Emergency SOS Console
        </Text>
        <Text variant="bodyMedium" muted>
          Multi-hop relay active. Transmits encrypted coordinates over BLE Mesh and queued SMS if cellular is lost.
        </Text>
      </View>

      {/* Main SOS Hold Trigger */}
      <View style={styles.triggerContainer}>
        <SOSButton onArmed={handleArmSOS} />
        <Text variant="bodySmall" muted style={styles.holdHint}>
          Deliberate 3s hold required to arm emergency packet
        </Text>
      </View>

      {/* Channel Cascade & Evidence Tracker */}
      <Text variant="h3" style={styles.sectionHeader}>
        Channel Cascade Status
      </Text>

      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={styles.channelRow}>
          <Text variant="bodyMedium" style={{ fontWeight: '700' }}>1. Local Device GPS</Text>
          <Badge label="LOCKED (±4m)" variant="volt" size="sm" />
        </View>
        <View style={[styles.divider, { backgroundColor: colors.border }]} />

        <View style={styles.channelRow}>
          <Text variant="bodyMedium" style={{ fontWeight: '700' }}>2. BLE Multi-Hop Mesh</Text>
          <Badge label="3 SQUAD PEERS" variant="supercurvy" size="sm" />
        </View>
        <View style={[styles.divider, { backgroundColor: colors.border }]} />

        <View style={styles.channelRow}>
          <Text variant="bodyMedium" style={{ fontWeight: '700' }}>3. Nepal Cellular (NTC/Ncell)</Text>
          <Badge label="DEAD ZONE (STANDBY)" variant="warning" size="sm" />
        </View>
        <View style={[styles.divider, { backgroundColor: colors.border }]} />

        <View style={styles.channelRow}>
          <Text variant="bodyMedium" style={{ fontWeight: '700' }}>4. SMS Breadcrumb Relay</Text>
          <Badge label="QUEUED" variant="neutral" size="sm" />
        </View>
      </View>

      {/* Nepal Emergency Helplines */}
      <Text variant="h3" style={styles.sectionHeader}>
        Direct Nepal Emergency Helplines
      </Text>
      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text variant="bodyMedium" style={{ color: colors.text }}>🚨 Nepal Police: 100</Text>
        <Text variant="bodyMedium" style={{ color: colors.text, marginTop: 6 }}>🚑 Nepal Red Cross Ambulance: 102</Text>
        <Text variant="bodyMedium" style={{ color: colors.text, marginTop: 6 }}>🏔️ Tourist Police Nepal: 1144</Text>
      </View>

      {/* Active Cancellation Modal */}
      <Modal visible={isArmed} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalBox, { backgroundColor: colors.surfaceElevated, borderColor: safety.sos.color }]}>
            <Badge label="SOS ARMED · BROADCASTING" variant="danger" size="md" />
            <Text variant="telemetryHero" style={{ color: safety.sos.color, marginVertical: 12 }}>
              00:0{countdown}
            </Text>
            <Text variant="bodyMedium" style={{ textAlign: 'center', marginBottom: 20 }}>
              Broadcasting distress packet to nearby squad mesh peers and queued Nepal emergency lines.
            </Text>
            <Button
              label="CANCEL SOS (रद्द गर्नुहोस्)"
              onPress={handleCancelSOS}
              variant="danger"
              inRide
              style={{ width: '100%' }}
            />
          </View>
        </View>
      </Modal>
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
  header: {
    marginBottom: primitive.spacing[5],
  },
  title: {
    marginTop: primitive.spacing[2],
    marginBottom: primitive.spacing[1],
  },
  triggerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: primitive.spacing[5],
  },
  holdHint: {
    marginTop: primitive.spacing[3],
  },
  sectionHeader: {
    marginTop: primitive.spacing[4],
    marginBottom: primitive.spacing[3],
  },
  card: {
    borderRadius: primitive.radius.lg,
    padding: primitive.spacing[4],
    borderWidth: 1,
  },
  channelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  divider: {
    height: 1,
    marginVertical: primitive.spacing[2],
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(5, 8, 7, 0.92)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: primitive.spacing[5],
  },
  modalBox: {
    width: '100%',
    borderRadius: primitive.radius.xl,
    padding: primitive.spacing[5],
    alignItems: 'center',
    borderWidth: 2,
  },
});
