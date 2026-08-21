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
 * 4. Zero persistent state, outbox writes, or dispatch claims.
 */

import React, { useState, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, Animated } from 'react-native';
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

  const holdProgress = useRef(new Animated.Value(0)).current;
  const holdTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handlePressIn = () => {
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
      setTimeout(() => {
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

      {/* 3-Second Hold to Stand Down Button */}
      <View style={styles.standDownSection}>
        <Text variant="bodySmall" muted style={{ textAlign: 'center', marginBottom: primitive.spacing[2] }}>
          Deliberate 3s hold required to stand down simulated emergency
        </Text>

        <TouchableOpacity
          activeOpacity={0.9}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          style={[
            styles.standDownBtn,
            {
              backgroundColor: primitive.color.graphite[800],
              borderColor: primitive.color.volt[400],
            },
          ]}
          accessible
          accessibilityRole="button"
          accessibilityLabel="Hold for 3 seconds to stand down simulated emergency"
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
  footer: {
    paddingVertical: primitive.spacing[4],
    borderTopWidth: 0.5,
    borderTopColor: primitive.color.graphite[800],
    marginBottom: 40,
  },
});
