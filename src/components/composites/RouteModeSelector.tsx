import React from 'react';
import { View, TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { Text } from '../primitives/Text';
import { useTheme } from '../../design/ThemeProvider';
import { primitive, routePresentation } from '../../design/tokens';
import * as Haptics from 'expo-haptics';

export type RouteMode = 'straight' | 'curvy' | 'supercurvy';

export interface RouteModeSelectorProps {
  selectedMode: RouteMode;
  onSelectMode: (mode: RouteMode) => void;
  disabledModes?: RouteMode[];
  disabledReason?: string;
  style?: ViewStyle;
}

export const RouteModeSelector: React.FC<RouteModeSelectorProps> = ({
  selectedMode,
  onSelectMode,
  disabledModes = [],
  disabledReason,
  style,
}) => {
  const { colors } = useTheme();

  const modes: RouteMode[] = ['straight', 'curvy', 'supercurvy'];

  const handleSelect = (mode: RouteMode) => {
    if (disabledModes.includes(mode)) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      return;
    }
    if (mode !== selectedMode) {
      Haptics.selectionAsync();
      onSelectMode(mode);
    }
  };

  return (
    <View style={style}>
      <View
        style={[
          styles.container,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
          },
        ]}
        accessibilityRole="radiogroup"
        accessibilityLabel="Routing personality mode selection"
      >
        {modes.map((mode) => {
          const isSelected = selectedMode === mode;
          const isDisabled = disabledModes.includes(mode);
          const config = routePresentation[mode];

          return (
            <TouchableOpacity
              key={mode}
              activeOpacity={isDisabled ? 1.0 : 0.8}
              onPress={() => handleSelect(mode)}
              disabled={isDisabled}
              style={[
                styles.option,
                {
                  backgroundColor: isSelected
                    ? colors.surfaceElevated
                    : isDisabled
                    ? colors.surfaceCard
                    : 'transparent',
                  borderColor: isSelected ? config.color : 'transparent',
                },
              ]}
              accessibilityRole="radio"
              accessibilityState={{ selected: isSelected, disabled: isDisabled }}
              accessibilityLabel={
                isDisabled
                  ? `${config.label}: Disabled (${disabledReason || 'Unavailable'})`
                  : `${config.label} (${config.labelNepali}): ${config.description}`
              }
            >
              <View style={styles.indicatorRow}>
                <View
                  style={[
                    styles.dot,
                    {
                      backgroundColor: isDisabled ? colors.textSubtle : config.color,
                      opacity: isSelected ? 1.0 : isDisabled ? 0.3 : 0.6,
                    },
                  ]}
                />
                <Text
                  variant="bodySmall"
                  style={{
                    color: isDisabled
                      ? colors.textSubtle
                      : isSelected
                      ? colors.text
                      : colors.textMuted,
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
                  color: isDisabled
                    ? colors.textSubtle
                    : isSelected
                    ? config.color
                    : colors.textSubtle,
                  fontSize: 10,
                  marginTop: 2,
                }}
              >
                {isDisabled ? 'अनुपलब्ध' : config.labelNepali}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Explicit Terai / Route Restriction Warning */}
      {disabledModes.length > 0 && disabledReason && (
        <View style={styles.restrictionNotice}>
          <Text variant="mono" style={{ color: primitive.color.semantic.warning, fontSize: 10, textAlign: 'center' }}>
            ⚠️ {disabledReason}
          </Text>
        </View>
      )}
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
    minHeight: primitive.size.targetMin,
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
  restrictionNotice: {
    marginTop: primitive.spacing[1],
    paddingHorizontal: primitive.spacing[2],
  },
});
