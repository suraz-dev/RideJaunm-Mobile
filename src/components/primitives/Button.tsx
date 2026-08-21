import React from 'react';
import {
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
  TextStyle,
  StyleProp,
  View,
} from 'react-native';
import { Text } from './Text';
import { useTheme } from '../../design/ThemeProvider';
import { primitive } from '../../design/tokens';
import * as Haptics from 'expo-haptics';

export type ButtonVariant = 'primary' | 'secondary' | 'glass' | 'danger';

export interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  inRide?: boolean; // Expands to 56px target for moving motorcycle gloves
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

export const Button: React.FC<ButtonProps> = ({
  label,
  onPress,
  variant = 'primary',
  inRide = false,
  disabled = false,
  loading = false,
  icon,
  style,
  textStyle,
}) => {
  const { colors } = useTheme();

  const handlePress = () => {
    if (disabled || loading) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return {
          bg: primitive.color.volt[400],
          border: primitive.color.volt[500],
          text: primitive.color.graphite[950],
          spinner: primitive.color.graphite[950],
        };
      case 'secondary':
        return {
          bg: colors.surfaceElevated,
          border: colors.border,
          text: colors.text,
          spinner: colors.text,
        };
      case 'glass':
        return {
          bg: colors.mapGlass.backgroundColor,
          border: colors.mapGlass.borderColor,
          text: colors.text,
          spinner: colors.text,
        };
      case 'danger':
        return {
          bg: primitive.color.semantic.danger,
          border: primitive.color.semantic.danger,
          text: '#FFFFFF',
          spinner: '#FFFFFF',
        };
      default:
        return {
          bg: colors.surfaceElevated,
          border: colors.border,
          text: colors.text,
          spinner: colors.text,
        };
    }
  };

  const vStyles = getVariantStyles();
  const height = inRide ? primitive.size.targetInRide : primitive.size.targetMin;

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={handlePress}
      disabled={disabled || loading}
      style={[
        styles.button,
        {
          height,
          minHeight: height,
          backgroundColor: disabled ? colors.surfaceElevated : vStyles.bg,
          borderColor: disabled ? colors.border : vStyles.border,
          opacity: disabled ? 0.5 : 1.0,
          borderRadius: primitive.radius.md,
        },
        style,
      ]}
      accessibilityRole="button"
      accessibilityState={{ disabled: disabled || loading, busy: loading }}
    >
      {loading ? (
        <ActivityIndicator color={vStyles.spinner} size="small" />
      ) : (
        <View style={styles.contentRow}>
          {icon && <View style={styles.icon}>{icon}</View>}
          <Text
            variant="bodyMedium"
            style={[
              styles.label,
              {
                color: disabled ? colors.textMuted : vStyles.text,
                fontWeight: '700',
              },
              textStyle,
            ]}
          >
            {label}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingHorizontal: primitive.spacing[5],
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    marginRight: primitive.spacing[3],
  },
  label: {
    letterSpacing: 0.2,
  },
});
