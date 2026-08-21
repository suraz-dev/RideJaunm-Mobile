import React from 'react';
import { View, TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { Text } from '../primitives/Text';
import { useTheme } from '../../design/ThemeProvider';
import { primitive, routePresentation } from '../../design/tokens';
import * as Haptics from 'expo-haptics';

export type RouteMode = 'straight' | 'curvy' | 'supercurvy';

interface RouteModeSelectorProps {
  selectedMode: RouteMode;
  onSelectMode: (mode: RouteMode) => void;
  style?: ViewStyle;
}

export const RouteModeSelector: React.FC<RouteModeSelectorProps> = ({
  selectedMode,
  onSelectMode,
  style,
}) => {
  const { colors } = useTheme();

  const modes: RouteMode[] = ['straight', 'curvy', 'supercurvy'];

  const handleSelect = (mode: RouteMode) => {
    if (mode !== selectedMode) {
      Haptics.selectionAsync();
      onSelectMode(mode);
    }
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
        },
        style,
      ]}
      accessibilityRole="radiogroup"
      accessibilityLabel="Routing personality mode selection"
    >
      {modes.map((mode) => {
        const isSelected = selectedMode === mode;
        const config = routePresentation[mode];

        return (
          <TouchableOpacity
            key={mode}
            activeOpacity={0.8}
            onPress={() => handleSelect(mode)}
            style={[
              styles.option,
              {
                backgroundColor: isSelected
                  ? colors.surfaceElevated
                  : 'transparent',
                borderColor: isSelected ? config.color : 'transparent',
              },
            ]}
            accessibilityRole="radio"
            accessibilityState={{ selected: isSelected }}
            accessibilityLabel={`${config.label} (${config.labelNepali}): ${config.description}`}
          >
            <View style={styles.indicatorRow}>
              <View
                style={[
                  styles.dot,
                  {
                    backgroundColor: config.color,
                    opacity: isSelected ? 1.0 : 0.4,
                  },
                ]}
              />
              <Text
                variant="bodySmall"
                style={{
                  color: isSelected ? colors.text : colors.textMuted,
                  fontWeight: isSelected ? '700' : '500',
                  fontSize: 13,
                }}
              >
                {config.label}
              </Text>
            </View>
            <Text
              variant="bodySmall"
              style={{
                color: isSelected ? config.color : colors.textSubtle,
                fontSize: 10,
                marginTop: 2,
              }}
            >
              {config.labelNepali}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderRadius: primitive.radius.lg,
    padding: primitive.spacing[1],
    borderWidth: 1,
  },
  option: {
    flex: 1,
    paddingVertical: primitive.spacing[3],
    paddingHorizontal: primitive.spacing[2],
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: primitive.radius.md,
    borderWidth: 1.5,
  },
  indicatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
});
