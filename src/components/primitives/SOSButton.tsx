/**
 * ============================================================================
 * EMERGENCY SOS BUTTON (R15)
 * ============================================================================
 *
 * Coordinates:
 * 1. 88dp Target emergency SOS trigger with deliberate 3-second press-and-hold.
 * 2. VoiceOver / TalkBack accessible equivalent: double-tap / accessibility action
 *    opens a deliberate accessible confirmation dialog (never auto-triggers on accidental tap).
 * 3. Early release cleanly unwinds animation and aborts without arming.
 * 4. Ticking haptics every 400ms during hold.
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Animated,
  ViewStyle,
  Modal,
} from 'react-native';
import { Text } from './Text';
import { Badge } from './Badge';
import { primitive, safety } from '../../design/tokens';
import * as Haptics from 'expo-haptics';

interface SOSButtonProps {
  onArmed: () => void;
  style?: ViewStyle;
  label?: string;
  subLabel?: string;
}

export const SOSButton: React.FC<SOSButtonProps> = ({
  onArmed,
  style,
  label = 'HOLD SOS',
  subLabel = '3s to trigger',
}) => {
  const [isPressing, setIsPressing] = useState(false);
  const [accessibleModalVisible, setAccessibleModalVisible] = useState(false);
  const progressAnim = useRef(new Animated.Value(0)).current;
  const hapticInterval = useRef<ReturnType<typeof setInterval> | null>(null);
  const holdTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const HOLD_DURATION = safety.sos.holdMs; // 3,000 ms

  const handlePressIn = () => {
    setIsPressing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // Ticking haptic feedback every 400ms while holding
    hapticInterval.current = setInterval(() => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    }, 400);

    Animated.timing(progressAnim, {
      toValue: 1,
      duration: HOLD_DURATION,
      useNativeDriver: false,
    }).start();

    holdTimer.current = setTimeout(() => {
      if (hapticInterval.current) clearInterval(hapticInterval.current);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setIsPressing(false);
      progressAnim.setValue(0);
      onArmed();
    }, HOLD_DURATION);
  };

  const handlePressOut = () => {
    if (holdTimer.current) {
      clearTimeout(holdTimer.current);
      holdTimer.current = null;
    }
    if (hapticInterval.current) {
      clearInterval(hapticInterval.current);
      hapticInterval.current = null;
    }
    setIsPressing(false);
    // Unwind animation immediately if released early
    Animated.timing(progressAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  const handleAccessibleTrigger = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setAccessibleModalVisible(true);
  };

  const handleConfirmAccessibleArm = () => {
    setAccessibleModalVisible(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    onArmed();
  };

  const handleCancelAccessibleArm = () => {
    setAccessibleModalVisible(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  useEffect(() => {
    return () => {
      if (holdTimer.current) clearTimeout(holdTimer.current);
      if (hapticInterval.current) clearInterval(hapticInterval.current);
    };
  }, []);

  const progressInterpolate = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={[styles.outerContainer, style]}>
      {/* Outer Glow / Halo Ring */}
      <View
        style={[
          styles.glowRing,
          {
            borderColor: isPressing ? safety.sos.color : 'rgba(255, 31, 61, 0.3)',
          },
        ]}
      />

      <TouchableOpacity
        activeOpacity={1.0}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={handleAccessibleTrigger}
        accessibilityActions={[{ name: 'activate', label: 'Open accessible emergency arming confirmation' }]}
        onAccessibilityAction={(event) => {
          if (event.nativeEvent.actionName === 'activate') {
            handleAccessibleTrigger();
          }
        }}
        style={[
          styles.button,
          {
            backgroundColor: isPressing ? safety.sos.pressed : safety.sos.color,
          },
        ]}
        accessibilityRole="button"
        accessibilityLabel="Emergency SOS button. Hold for 3 seconds to arm, or double tap for accessible confirmation."
        accessibilityHint="Double tap to open deliberate accessible confirmation dialog, or hold continuously for 3 seconds."
      >
        <Text variant="h2" style={styles.label}>
          {label}
        </Text>
        <Text variant="bodySmall" style={styles.subLabel}>
          {isPressing ? 'HOLDING...' : subLabel}
        </Text>

        {/* Progress indicator bar overlay */}
        {isPressing && (
          <View style={styles.progressTrack}>
            <Animated.View
              style={[
                styles.progressBar,
                { width: progressInterpolate },
              ]}
            />
          </View>
        )}
      </TouchableOpacity>

      {/* VoiceOver / TalkBack Deliberate Confirmation Modal */}
      <Modal
        visible={accessibleModalVisible}
        transparent
        animationType="fade"
        onRequestClose={handleCancelAccessibleArm}
      >
        <View style={styles.modalOverlay}>
          <View
            style={styles.modalBox}
            accessible
            accessibilityRole="alert"
            accessibilityLabel="Accessible Emergency Arming Confirmation. Deliberate confirmation required to arm simulated SOS."
          >
            <Badge label="ACCESSIBLE CONFIRMATION" variant="warning" size="md" />

            <Text variant="h2" style={{ color: safety.sos.color, marginTop: primitive.spacing[3], textAlign: 'center' }}>
              Arm Simulated Emergency SOS?
            </Text>

            <Text variant="bodyMedium" style={{ textAlign: 'center', color: primitive.color.snow[50], marginVertical: primitive.spacing[3] }}>
              VoiceOver/TalkBack deliberate confirmation required. This will advance to the simulated 10-second cancellation window. No alert will be sent.
            </Text>

            <TouchableOpacity
              style={styles.confirmArmBtn}
              onPress={handleConfirmAccessibleArm}
              accessible
              accessibilityRole="button"
              accessibilityLabel="Confirm and arm simulated SOS"
            >
              <Text variant="mono" style={{ color: primitive.color.snow[0], fontSize: 13, fontWeight: '700' }}>
                ✓ CONFIRM & ARM SIMULATED SOS
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelModalBtn}
              onPress={handleCancelAccessibleArm}
              accessible
              accessibilityRole="button"
              accessibilityLabel="Cancel accessible arming"
            >
              <Text variant="mono" style={{ color: primitive.color.snow[300], fontSize: 12, fontWeight: '600' }}>
                ✕ CANCEL (रद्द गर्नुहोस्)
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: primitive.size.targetSOS + 24,
    height: primitive.size.targetSOS + 24,
  },
  glowRing: {
    position: 'absolute',
    width: primitive.size.targetSOS + 16,
    height: primitive.size.targetSOS + 16,
    borderRadius: primitive.radius.full,
    borderWidth: 2,
  },
  button: {
    width: primitive.size.targetSOS,
    height: primitive.size.targetSOS,
    borderRadius: primitive.radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    shadowColor: safety.sos.color,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    overflow: 'hidden',
  },
  label: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 16,
    letterSpacing: 0.8,
  },
  subLabel: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 10,
    fontWeight: '700',
  },
  progressTrack: {
    position: 'absolute',
    bottom: 8,
    width: '60%',
    height: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#FFFFFF',
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
    borderColor: safety.sos.color,
    backgroundColor: primitive.color.graphite[900],
  },
  confirmArmBtn: {
    width: '100%',
    minHeight: 52,
    borderRadius: primitive.radius.md,
    backgroundColor: safety.sos.color,
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
});
