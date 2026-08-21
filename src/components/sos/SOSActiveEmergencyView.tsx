/**
 * ============================================================================
 * ACTIVE EMERGENCY PREVIEW & STAND-DOWN VIEW (R15)
 * ============================================================================
 *
 * Coordinates:
 * 1. Full-screen simulated active emergency state utilizing SOS Red (#FF1F3D) token exclusively.
 * 2. Channel evidence timeline where every item is Unavailable, Unknown, or Simulated.
 * 3. Deliberate 3-second hold to Stand Down with truth copy:
 *    "Stand-down preview complete — no all-clear was sent."
 * 4. VoiceOver / TalkBack accessible equivalent for Stand Down via deliberate confirmation modal.
 * 5. Zero persistent state, outbox writes, or dispatch claims.
 */

import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, Animated, Modal } from 'react-native';
import { FixtureSafetyEvidenceItem } from '../../domain/sosConsole';
import { Text } from '../primitives/Text';
import { Badge } from '../primitives/Badge';
import { useTheme } from '../../design/ThemeProvider';
import { primitive, safety } from '../../design/tokens';
import * as Haptics from 'expo-haptics';

export interface SOSActiveEmergencyViewProps {
  evidenceItems: FixtureSafetyEvidenceItem[];
  onStandDownComplete: () => void;
}

export const SOSActiveEmergencyView: React.FC<SOSActiveEmergencyViewProps> = ({
  evidenceItems,
  onStandDownComplete,
}) => {
  const { colors } = useTheme();

  const [isHoldingStandDown, setIsHoldingStandDown] = useState(false);
  const [standDownNotice, setStandDownNotice] = useState<string | null>(null);
  const [accessibleStandDownModalVisible, setAccessibleStandDownModalVisible] = useState(false);

  const holdProgress = useRef(new Animated.Value(0)).current;
  const holdTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const completeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isPhysicalTouchRef = useRef(false);

  const handlePressIn = () => {
    isPhysicalTouchRef.current = true;
    setIsHoldingStandDown(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    Animated.timing(holdProgress, {
      toValue: 1,
      duration: safety.sos.holdMs,
      useNativeDriver: false,
    }).start();

    holdTimer.current = setTimeout(() => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setStandDownNotice('Stand-down preview complete — no all-clear was sent.');
      completeTimer.current = setTimeout(() => {
        onStandDownComplete();
      }, 1200);
    }, safety.sos.holdMs);
  };

  const handlePressOut = () => {
    if (holdTimer.current) {
      clearTimeout(holdTimer.current);
      holdTimer.current = null;
    }
    setIsHoldingStandDown(false);
    Animated.timing(holdProgress, {
      toValue: 0,
      duration: 150,
      useNativeDriver: false,
    }).start();
  };

  const handleAccessibleTrigger = () => {
    if (isPhysicalTouchRef.current) {
      isPhysicalTouchRef.current = false;
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setAccessibleStandDownModalVisible(true);
  };

  const handleConfirmAccessibleStandDown = () => {
    setAccessibleStandDownModalVisible(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setStandDownNotice('Stand-down preview complete — no all-clear was sent.');
    completeTimer.current = setTimeout(() => {
      onStandDownComplete();
    }, 1200);
  };

  const handleCancelAccessibleStandDown = () => {
    setAccessibleStandDownModalVisible(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  useEffect(() => {
    return () => {
      if (holdTimer.current) clearTimeout(holdTimer.current);
      if (completeTimer.current) clearTimeout(completeTimer.current);
    };
  }, []);

  const progressWidth = holdProgress.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <ScrollView style={[styles.container, { backgroundColor: primitive.color.graphite[950] }]}>
      {/* Emergency Header (SOS Red permitted here) */}
      <View style={[styles.headerBox, { borderColor: safety.sos.color }]}>
        <Badge label="ACTIVE SIMULATED EMERGENCY PREVIEW" variant="danger" size="md" />
        <Text variant="h1" style={[styles.title, { color: safety.sos.color }]}>
          SIMULATED ACTIVE SOS
        </Text>
        <Text variant="bodyMedium" style={{ color: primitive.color.snow[50], textAlign: 'center', marginTop: 4 }}>
          No real emergency was declared. No responder or contact was notified.
        </Text>
      </View>

      {/* Stand-down notice */}
      {standDownNotice && (
        <View style={[styles.noticeBox, { borderColor: primitive.color.volt[400] }]}>
          <Text variant="mono" style={{ color: primitive.color.volt[400], fontSize: 12, fontWeight: '700', textAlign: 'center' }}>
            ✓ {standDownNotice}
          </Text>
        </View>
      )}

      {/* Evidence Timeline */}
      <Text variant="h3" style={[styles.sectionTitle, { color: primitive.color.snow[50] }]}>
        Channel Evidence Timeline (Simulation)
      </Text>

      <View style={[styles.timelineCard, { backgroundColor: primitive.color.graphite[900], borderColor: primitive.color.graphite[700] }]}>
        {evidenceItems.map((item, idx) => (
          <View key={item.id} style={styles.timelineRow}>
            <View style={styles.timelineInfoCol}>
              <Text variant="bodyMedium" style={{ fontWeight: '700', color: primitive.color.snow[0] }}>
                {item.channelName}
              </Text>
              <Text variant="mono" style={{ color: primitive.color.graphite[300], fontSize: 11, marginTop: 2 }}>
                {item.detail}
              </Text>
            </View>
            <Badge
              label={item.statusLabel}
              variant={item.evidenceState === 'local_observation' ? 'volt' : item.evidenceState === 'device_reported' ? 'cyan' : 'warning'}
              size="sm"
            />
          </View>
        ))}
      </View>

      {/* 3-Second Hold to Stand Down Button with Screen Reader Alternate */}
      <View style={styles.standDownSection}>
        <Text variant="bodySmall" muted style={{ textAlign: 'center', marginBottom: primitive.spacing[2] }}>
          Deliberate 3s hold required to stand down simulated emergency
        </Text>

        <TouchableOpacity
          activeOpacity={0.9}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          onPress={handleAccessibleTrigger}
          accessibilityActions={[{ name: 'activate', label: 'Open accessible stand-down confirmation' }]}
          onAccessibilityAction={(event) => {
            if (event.nativeEvent.actionName === 'activate') {
              handleAccessibleTrigger();
            }
          }}
          style={[
            styles.standDownBtn,
            {
              backgroundColor: primitive.color.graphite[800],
              borderColor: primitive.color.volt[400],
            },
          ]}
          accessible
          accessibilityRole="button"
          accessibilityLabel="Hold for 3 seconds to stand down simulated emergency, or double tap for accessible confirmation."
          accessibilityHint="Double tap to open accessible stand-down confirmation dialog, or hold continuously for 3 seconds."
        >
          <Animated.View
            style={[
              styles.holdProgressOverlay,
              {
                width: progressWidth,
                backgroundColor: primitive.color.volt[500],
              },
            ]}
          />
          <Text
            variant="mono"
            style={{
              color: isHoldingStandDown ? primitive.color.graphite[950] : primitive.color.snow[0],
              fontSize: 13,
              fontWeight: '700',
              zIndex: 2,
            }}
          >
            {isHoldingStandDown ? 'HOLDING STAND DOWN...' : '✋ HOLD 3s TO STAND DOWN'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* VoiceOver / TalkBack Stand Down Confirmation Modal */}
      <Modal
        visible={accessibleStandDownModalVisible}
        transparent
        animationType="fade"
        onRequestClose={handleCancelAccessibleStandDown}
      >
        <View style={styles.modalOverlay}>
          <View
            style={styles.modalBox}
            accessible
            accessibilityRole="alert"
            accessibilityLabel="Accessible Stand-Down Confirmation. Deliberate confirmation required to stand down simulated emergency."
          >
            <Badge label="ACCESSIBLE STAND-DOWN" variant="volt" size="md" />

            <Text variant="h2" style={{ color: primitive.color.snow[0], marginTop: primitive.spacing[3], textAlign: 'center' }}>
              Stand Down Simulated Emergency?
            </Text>

            <Text variant="bodyMedium" style={{ textAlign: 'center', color: primitive.color.snow[50], marginVertical: primitive.spacing[3] }}>
              VoiceOver/TalkBack deliberate confirmation required. This will conclude the simulated emergency preview. No all-clear was sent.
            </Text>

            <TouchableOpacity
              style={styles.confirmStandDownBtn}
              onPress={handleConfirmAccessibleStandDown}
              accessible
              accessibilityRole="button"
              accessibilityLabel="Confirm stand down simulated emergency"
            >
              <Text variant="mono" style={{ color: primitive.color.graphite[950], fontSize: 13, fontWeight: '700' }}>
                ✓ CONFIRM STAND DOWN PREVIEW
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelModalBtn}
              onPress={handleCancelAccessibleStandDown}
              accessible
              accessibilityRole="button"
              accessibilityLabel="Cancel accessible stand-down"
            >
              <Text variant="mono" style={{ color: primitive.color.snow[300], fontSize: 12, fontWeight: '600' }}>
                ✕ KEEP ACTIVE PREVIEW
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Permanent Truth Disclosure */}
      <View style={styles.footer}>
        <Text variant="mono" style={{ color: primitive.color.graphite[300], fontSize: 10, textAlign: 'center' }}>
          ℹ️ Stand-down preview · No cancellation packets were transmitted
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: primitive.spacing[4],
    paddingTop: 56,
  },
  headerBox: {
    borderRadius: primitive.radius.xl,
    padding: primitive.spacing[5],
    alignItems: 'center',
    borderWidth: 2,
    borderColor: safety.sos.color,
    backgroundColor: 'rgba(255, 31, 61, 0.12)',
    marginBottom: primitive.spacing[4],
  },
  title: {
    marginTop: primitive.spacing[2],
    textAlign: 'center',
    fontWeight: '800',
  },
  noticeBox: {
    padding: primitive.spacing[3],
    borderRadius: primitive.radius.md,
    borderWidth: 1.5,
    backgroundColor: 'rgba(180, 255, 57, 0.12)',
    marginBottom: primitive.spacing[4],
  },
  sectionTitle: {
    marginBottom: primitive.spacing[3],
  },
  timelineCard: {
    borderRadius: primitive.radius.lg,
    padding: primitive.spacing[4],
    borderWidth: 1,
    marginBottom: primitive.spacing[5],
  },
  timelineRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: primitive.spacing[2],
    borderBottomWidth: 0.5,
    borderBottomColor: primitive.color.graphite[700],
  },
  timelineInfoCol: {
    flex: 1,
    marginRight: primitive.spacing[3],
  },
  standDownSection: {
    alignItems: 'center',
    marginBottom: primitive.spacing[5],
  },
  standDownBtn: {
    width: '100%',
    minHeight: 56,
    borderRadius: primitive.radius.md,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    position: 'relative',
  },
  holdProgressOverlay: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(5, 8, 7, 0.94)',
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
    borderColor: primitive.color.volt[400],
    backgroundColor: primitive.color.graphite[900],
  },
  confirmStandDownBtn: {
    width: '100%',
    minHeight: 52,
    borderRadius: primitive.radius.md,
    backgroundColor: primitive.color.volt[400],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: primitive.spacing[3],
  },
  cancelModalBtn: {
    width: '100%',
    minHeight: 48,
    borderRadius: primitive.radius.md,
    borderWidth: 1,
    borderColor: primitive.color.graphite[600],
    justifyContent: 'center',
    alignItems: 'center',
  },
  footer: {
    paddingVertical: primitive.spacing[4],
    borderTopWidth: 0.5,
    borderTopColor: primitive.color.graphite[800],
    marginBottom: 40,
  },
});
