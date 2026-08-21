import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { Text } from './Text';
import { useTheme } from '../../design/ThemeProvider';
import { primitive } from '../../design/tokens';

export type BadgeVariant = 'volt' | 'cyan' | 'supercurvy' | 'warning' | 'danger' | 'neutral';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  size?: 'sm' | 'md';
  icon?: React.ReactNode;
  style?: ViewStyle;
}

export const Badge: React.FC<BadgeProps> = ({
  label,
  variant = 'volt',
  size = 'md',
  icon,
  style,
}) => {
  const { colors } = useTheme();

  const getVariantStyles = () => {
    switch (variant) {
      case 'volt':
        return {
          bg: 'rgba(180, 255, 57, 0.15)',
          border: primitive.color.volt[400],
          text: primitive.color.volt[400],
        };
      case 'cyan':
        return {
          bg: 'rgba(34, 201, 238, 0.15)',
          border: primitive.color.cyan[400],
          text: primitive.color.cyan[400],
        };
      case 'supercurvy':
        return {
          bg: 'rgba(194, 92, 255, 0.15)',
          border: primitive.color.route.supercurvy,
          text: primitive.color.route.supercurvy,
        };
      case 'warning':
        return {
          bg: 'rgba(255, 176, 32, 0.15)',
          border: primitive.color.semantic.warning,
          text: primitive.color.semantic.warning,
        };
      case 'danger':
        return {
          bg: 'rgba(242, 96, 60, 0.15)',
          border: primitive.color.semantic.danger,
          text: primitive.color.semantic.danger,
        };
      case 'neutral':
      default:
        return {
          bg: colors.surfaceElevated,
          border: colors.border,
          text: colors.textMuted,
        };
    }
  };

  const current = getVariantStyles();
  const isSmall = size === 'sm';

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: current.bg,
          borderColor: current.border,
          paddingVertical: isSmall ? 2 : 4,
          paddingHorizontal: isSmall ? 6 : 10,
        },
        style,
      ]}
    >
      {icon && <View style={styles.iconContainer}>{icon}</View>}
      <Text
        variant="bodySmall"
        style={{
          color: current.text,
          fontSize: isSmall ? 11 : 12,
          fontWeight: '700',
        }}
      >
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: primitive.radius.full,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  iconContainer: {
    marginRight: 4,
  },
});
