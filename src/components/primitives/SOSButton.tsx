import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Animated,
  ViewStyle,
} from 'react-native';
import { Text } from './Text';
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
  const progressAnim = useRef(new Animated.Value(0)).current;
  const hapticInterval = useRef<ReturnType<typeof setInterval> | null>(null);

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
    }).start(({ finished }) => {
      if (finished) {
        if (hapticInterval.current) clearInterval(hapticInterval.current);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        setIsPressing(false);
        progressAnim.setValue(0);
        onArmed();
      }
    });
  };

  const handlePressOut = () => {
    if (hapticInterval.current) {
      clearInterval(hapticInterval.current);
    }
    setIsPressing(false);
    // Unwind animation immediately if released early
    Animated.timing(progressAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  useEffect(() => {
    return () => {
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
        style={[
          styles.button,
          {
            backgroundColor: isPressing ? safety.sos.pressed : safety.sos.color,
          },
        ]}
        accessibilityRole="button"
        accessibilityLabel="Emergency SOS button. Hold for 3 seconds to arm."
      >
        <Text
          variant="h2"
          style={styles.label}
        >
          {label}
        </Text>
        <Text
          variant="bodySmall"
          style={styles.subLabel}
        >
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
});
