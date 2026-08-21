import React from 'react';
import { Text as RNText, TextProps as RNTextProps, StyleProp, TextStyle } from 'react-native';
import { typography } from '../../design/tokens';
import { useTheme } from '../../design/ThemeProvider';

export type TypographyVariant = keyof typeof typography;

export interface TextProps extends RNTextProps {
  variant?: TypographyVariant;
  color?: string;
  muted?: boolean;
  align?: 'auto' | 'left' | 'right' | 'center' | 'justify';
  style?: StyleProp<TextStyle>;
}

export const Text: React.FC<TextProps> = ({
  variant = 'bodyMedium',
  color,
  muted = false,
  align = 'left',
  style,
  children,
  ...rest
}) => {
  const { colors } = useTheme();

  const baseStyle = typography[variant] as TextStyle;
  const textColor = color || (muted ? colors.textMuted : colors.text);

  return (
    <RNText
      style={[
        baseStyle,
        { color: textColor, textAlign: align },
        style,
      ]}
      maxFontSizeMultiplier={2.0} // Support dynamic scaling up to 200% safely
      {...rest}
    >
      {children}
    </RNText>
  );
};
