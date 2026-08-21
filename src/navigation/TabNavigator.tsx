import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { RideHomeScreen } from '../screens/RideHomeScreen';
import { TripPlannerScreen } from '../screens/TripPlannerScreen';
import { SOSConsoleScreen } from '../screens/SOSConsoleScreen';
import { SquadFeedScreen } from '../screens/SquadFeedScreen';
import { ProfileGarageScreen } from '../screens/ProfileGarageScreen';
import { Text } from '../components/primitives/Text';
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
          height: primitive.size.navBar + 20,
          paddingBottom: 20,
          paddingTop: 8,
        },
        tabBarActiveTintColor: primitive.color.volt[400],
        tabBarInactiveTintColor: colors.textMuted,
      }}
    >
      <Tab.Screen
        name="Ride"
        component={RideHomeScreen}
        options={{
          tabBarLabel: ({ color }) => (
            <Text variant="bodySmall" style={{ color, fontSize: 11, fontWeight: '700' }}>
              Ride
            </Text>
          ),
          tabBarIcon: ({ color }) => (
            <Text variant="bodyMedium" style={{ color }}>
              🏍️
            </Text>
          ),
        }}
      />
      <Tab.Screen
        name="Plan"
        component={TripPlannerScreen}
        options={{
          tabBarLabel: ({ color }) => (
            <Text variant="bodySmall" style={{ color, fontSize: 11, fontWeight: '700' }}>
              Plan
            </Text>
          ),
          tabBarIcon: ({ color }) => (
            <Text variant="bodyMedium" style={{ color }}>
              🗺️
            </Text>
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
              style={{ color: safety.sos.color, fontSize: 11, fontWeight: '900' }}
            >
              SOS
            </Text>
          ),
          tabBarIcon: () => (
            <View style={styles.centerSosButton}>
              <Text variant="bodySmall" style={{ color: '#FFFFFF', fontWeight: '900' }}>
                SOS
              </Text>
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
            <Text variant="bodySmall" style={{ color, fontSize: 11, fontWeight: '700' }}>
              Squad
            </Text>
          ),
          tabBarIcon: ({ color }) => (
            <Text variant="bodyMedium" style={{ color }}>
              👥
            </Text>
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileGarageScreen}
        options={{
          tabBarLabel: ({ color }) => (
            <Text variant="bodySmall" style={{ color, fontSize: 11, fontWeight: '700' }}>
              Garage
            </Text>
          ),
          tabBarIcon: ({ color }) => (
            <Text variant="bodyMedium" style={{ color }}>
              ⚙️
            </Text>
          ),
        }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  centerSosButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: safety.sos.color,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: safety.sos.color,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.6,
    shadowRadius: 6,
    elevation: 6,
    marginBottom: 4,
  },
});
