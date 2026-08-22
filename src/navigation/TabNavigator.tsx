/**
 * ============================================================================
 * MAIN APPLICATION TAB NAVIGATOR (R16 REFINED)
 * ============================================================================
 *
 * 5-tab core navigation:
 * 1. Ride (Map-led tactical instrument)
 * 2. Plan (Trip route & readiness planner)
 * 3. SOS (Safety capability gate & console)
 * 4. Squad (Rider community feed & live squad)
 * 5. Profile (Rider profile, garage, & settings)
 */

import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { RideHomeScreen } from '../screens/RideHomeScreen';
import { TripPlannerScreen } from '../screens/TripPlannerScreen';
import { SOSConsoleScreen } from '../screens/SOSConsoleScreen';
import { SquadFeedScreen } from '../screens/SquadFeedScreen';
import { ProfileGarageScreen } from '../screens/ProfileGarageScreen';
import { Text } from '../components/primitives/Text';
import { Icon } from '../components/primitives/Icon';
import { useTheme } from '../design/ThemeProvider';
import { primitive, safety } from '../design/tokens';
import * as Haptics from 'expo-haptics';

export type RootTabParamList = {
  Ride: undefined;
  Plan: undefined;
  SOS: undefined;
  Squad: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<RootTabParamList>();

export const TabNavigator: React.FC = () => {
  const { colors } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          height: Platform.OS === 'ios' ? 84 : 68,
          paddingBottom: Platform.OS === 'ios' ? 24 : 10,
          paddingTop: 8,
          elevation: 8,
        },
        tabBarActiveTintColor: primitive.color.volt[400],
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: {
          fontFamily: 'Inter_700Bold',
          fontSize: 10,
          letterSpacing: 0.5,
          marginTop: 2,
        },
      }}
    >
      <Tab.Screen
        name="Ride"
        component={RideHomeScreen}
        options={{
          tabBarLabel: ({ color }) => (
            <Text variant="bodySmall" style={[styles.tabLabel, { color }]}>
              Ride
            </Text>
          ),
          tabBarIcon: ({ color, focused }) => (
            <Icon
              name="navigation"
              size={22}
              color={color}
              strokeWidth={focused ? 2.5 : 2}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Plan"
        component={TripPlannerScreen}
        options={{
          tabBarLabel: ({ color }) => (
            <Text variant="bodySmall" style={[styles.tabLabel, { color }]}>
              Plan
            </Text>
          ),
          tabBarIcon: ({ color, focused }) => (
            <Icon
              name="route"
              size={22}
              color={color}
              strokeWidth={focused ? 2.5 : 2}
            />
          ),
        }}
      />
      <Tab.Screen
        name="SOS"
        component={SOSConsoleScreen}
        options={{
          tabBarLabel: () => (
            <Text
              variant="bodySmall"
              style={[styles.tabLabel, { color: safety.sos.color, fontWeight: '900' }]}
            >
              SOS
            </Text>
          ),
          tabBarIcon: () => (
            <View style={styles.centerSosContainer}>
              <View style={styles.centerSosButton}>
                <Icon name="shield-alert" size={20} color="#FFFFFF" strokeWidth={2.5} />
              </View>
            </View>
          ),
        }}
        listeners={{
          tabPress: () => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
          },
        }}
      />
      <Tab.Screen
        name="Squad"
        component={SquadFeedScreen}
        options={{
          tabBarLabel: ({ color }) => (
            <Text variant="bodySmall" style={[styles.tabLabel, { color }]}>
              Squad
            </Text>
          ),
          tabBarIcon: ({ color, focused }) => (
            <Icon
              name="users"
              size={22}
              color={color}
              strokeWidth={focused ? 2.5 : 2}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileGarageScreen}
        options={{
          tabBarLabel: ({ color }) => (
            <Text variant="bodySmall" style={[styles.tabLabel, { color }]}>
              Profile
            </Text>
          ),
          tabBarIcon: ({ color, focused }) => (
            <Icon
              name="user"
              size={22}
              color={color}
              strokeWidth={focused ? 2.5 : 2}
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  centerSosContainer: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  centerSosButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: safety.sos.color,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: safety.sos.color,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.5,
    shadowRadius: 5,
    elevation: 6,
  },
});
