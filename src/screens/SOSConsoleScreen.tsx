/**
 * ============================================================================
 * SOS CONSOLE & SAFETY CAPABILITY GATE SCREEN (R15)
 * ============================================================================
 *
 * Coordinates:
 * 1. Presentational safety state machine (ready -> cancel_window -> active_preview -> stood_down_preview).
 * 2. Limitation banner before controls.
 * 3. Deliberate 3-second hold to arm using 88dp SOSButton (early release safely aborts).
 * 4. 10-Second simulated cancel window with explicit "SIMULATED SOS PREVIEW — no alert was sent" copy.
 * 5. Full-screen active emergency simulation utilizing SOS Red (#FF1F3D) token exclusively.
 * 6. Deliberate 3-second hold to Stand Down with confirmation copy.
 * 7. Zero storage, AppState, outbox, network, or phone dialing mutations.
 * 8. Full theme compliance across Night, Day Glare, Dusk, Blackout.
 */

import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Text } from '../components/primitives/Text';
import { Badge } from '../components/primitives/Badge';
import { SOSButton } from '../components/primitives/SOSButton';
import { SOSLimitationBanner } from '../components/sos/SOSLimitationBanner';
import { SafetyCapabilityMatrix } from '../components/sos/SafetyCapabilityMatrix';
import { SOSCancelWindowModal } from '../components/sos/SOSCancelWindowModal';
import { SOSActiveEmergencyView } from '../components/sos/SOSActiveEmergencyView';
import { ManualEmergencyInfoCard } from '../components/sos/ManualEmergencyInfoCard';
import { useTheme } from '../design/ThemeProvider';
import { useAppState } from '../state/AppStateContext';
import { primitive, safety } from '../design/tokens';
import {
  FixtureSafetyConsoleState,
  FixtureSafetyCapabilitySnapshot,
} from '../domain/sosConsole';
import {
  defaultSafetyCapabilitySnapshot,
  deadZoneSafetyCapabilitySnapshot,
} from '../fixtures/sosConsole.fixture';
import * as Haptics from 'expo-haptics';

export const SOSConsoleScreen: React.FC = () => {
  const { colors, mode } = useTheme();
  const { connectionState } = useAppState();
  const isDayGlare = mode === 'dayGlare';

  const [consoleState, setConsoleState] = useState<FixtureSafetyConsoleState>('ready');
  const [cancelCountdown, setCancelCountdown] = useState(10);

  const isOffline =
    connectionState.mode === 'deadZone' || connectionState.mode === 'meshOnly';

  const capabilitySnapshot: FixtureSafetyCapabilitySnapshot = isOffline
    ? deadZoneSafetyCapabilitySnapshot
    : defaultSafetyCapabilitySnapshot;

  // Handle completed 3-second hold trigger
  const handleHoldComplete = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    setCancelCountdown(10);
    setConsoleState('cancel_window');
  };

  // Handle cancellation action
  const handleCancelSOS = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setConsoleState('ready');
  };

  // 10-Second cancellation window timer
  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;
    if (consoleState === 'cancel_window') {
      if (cancelCountdown > 0) {
        timer = setInterval(() => {
          setCancelCountdown((prev) => prev - 1);
        }, 1000);
      } else {
        // Countdown reached zero -> advance to simulated active emergency state
        setConsoleState('active_preview');
      }
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [consoleState, cancelCountdown]);

  // Full-Screen Active Emergency Preview
  if (consoleState === 'active_preview' || consoleState === 'stand_down_hold') {
    return (
      <SOSActiveEmergencyView
        evidenceItems={capabilitySnapshot.evidenceItems}
        onStandDownComplete={() => setConsoleState('stood_down_preview')}
      />
    );
  }

  // Stood Down Confirmation Screen
  if (consoleState === 'stood_down_preview') {
    return (
      <ScrollView
        style={[styles.container, { backgroundColor: colors.background }]}
        contentContainerStyle={styles.content}
      >
        <View
          style={[
            styles.stoodDownCard,
            {
              backgroundColor: isDayGlare ? primitive.color.snow[0] : colors.surface,
              borderColor: primitive.color.volt[400],
            },
          ]}
        >
          <Badge label="STOOD DOWN" variant="volt" size="md" />
          <Text variant="h2" style={{ color: colors.text, marginTop: primitive.spacing[3], textAlign: 'center' }}>
            Stand-down preview complete — no all-clear was sent.
          </Text>
          <Text variant="bodyMedium" muted style={{ textAlign: 'center', marginTop: primitive.spacing[2], marginBottom: primitive.spacing[4] }}>
            Emergency simulation concluded locally. All systems returned to normal preview state.
          </Text>

          <TouchableOpacity
            style={[
              styles.returnBtn,
              {
                backgroundColor: primitive.color.volt[400],
                borderColor: primitive.color.volt[500],
              },
            ]}
            onPress={() => setConsoleState('ready')}
            accessible
            accessibilityRole="button"
            accessibilityLabel="Return to SOS Console"
          >
            <Text variant="mono" style={{ color: primitive.color.graphite[950], fontSize: 13, fontWeight: '700' }}>
              RETURN TO SOS CONSOLE
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
    >
      {/* Header */}
      <View style={styles.header}>
        <Badge label="SAFETY REHEARSAL CONSOLE" variant="neutral" size="sm" />
        <Text variant="h1" style={[styles.title, { color: colors.text }]}>
          Emergency SOS Console
        </Text>
        <Text variant="bodyMedium" muted>
          Rehearses the emergency interaction model locally. No active emergency services dispatch.
        </Text>
      </View>

      {/* Limitation Banner (Always before trigger) */}
      <SOSLimitationBanner />

      {/* Main 88dp SOS Hold Trigger (Only emergency element permitted to use SOS Red) */}
      <View
        style={[
          styles.triggerCard,
          {
            backgroundColor: isDayGlare ? primitive.color.snow[0] : colors.surface,
            borderColor: colors.border,
          },
        ]}
      >
        <Text variant="h3" style={{ color: colors.text, marginBottom: primitive.spacing[4] }}>
          Hold to Trigger Simulated SOS
        </Text>

        <SOSButton onArmed={handleHoldComplete} />

        <Text variant="mono" style={{ color: colors.textSubtle, fontSize: 11, marginTop: primitive.spacing[4], textAlign: 'center' }}>
          Deliberate 3s hold required to arm simulated emergency packet
        </Text>
      </View>

      {/* 10-Second Cancel Window Modal */}
      <SOSCancelWindowModal
        visible={consoleState === 'cancel_window'}
        countdown={cancelCountdown}
        onCancel={handleCancelSOS}
      />

      {/* Capability & Evidence Matrix */}
      <SafetyCapabilityMatrix snapshot={capabilitySnapshot} />

      {/* Disabled Manual Help Info Card */}
      <ManualEmergencyInfoCard />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: primitive.spacing[4],
    paddingTop: 56,
    paddingBottom: 120,
  },
  header: {
    marginBottom: primitive.spacing[4],
  },
  title: {
    marginTop: primitive.spacing[2],
    marginBottom: primitive.spacing[1],
  },
  triggerCard: {
    borderRadius: primitive.radius.lg,
    padding: primitive.spacing[5],
    alignItems: 'center',
    marginBottom: primitive.spacing[4],
    borderWidth: 1,
  },
  stoodDownCard: {
    borderRadius: primitive.radius.xl,
    padding: primitive.spacing[6],
    alignItems: 'center',
    marginTop: primitive.spacing[6],
    borderWidth: 2,
  },
  returnBtn: {
    minHeight: 48,
    paddingHorizontal: primitive.spacing[5],
    borderRadius: primitive.radius.md,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
