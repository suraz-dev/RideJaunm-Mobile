import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import {
  useFonts,
  SpaceGrotesk_600SemiBold,
  SpaceGrotesk_700Bold,
} from '@expo-google-fonts/space-grotesk';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_700Bold,
} from '@expo-google-fonts/inter';
import {
  Mukta_400Regular,
  Mukta_700Bold,
} from '@expo-google-fonts/mukta';
import {
  JetBrainsMono_500Medium,
} from '@expo-google-fonts/jetbrains-mono';
import { ActivityIndicator, View } from 'react-native';
import { ThemeProvider, useTheme } from './src/design/ThemeProvider';
import { TabNavigator } from './src/navigation/TabNavigator';
import { primitive } from './src/design/tokens';

function AppContent() {
  const { mode, isDark } = useTheme();

  return (
    <SafeAreaProvider>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <NavigationContainer>
        <TabNavigator />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

export default function App() {
  const [fontsLoaded] = useFonts({
    SpaceGrotesk_600SemiBold,
    SpaceGrotesk_700Bold,
    Inter_400Regular,
    Inter_500Medium,
    Inter_700Bold,
    Mukta_400Regular,
    Mukta_700Bold,
    JetBrainsMono_500Medium,
  });

  if (!fontsLoaded) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: primitive.color.graphite[950],
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <ActivityIndicator size="large" color={primitive.color.volt[400]} />
      </View>
    );
  }

  return (
    <ThemeProvider initialMode="night">
      <AppContent />
    </ThemeProvider>
  );
}
