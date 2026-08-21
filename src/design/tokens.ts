/**
 * RideJaunm Design Tokens (Derived directly from tokens/ridejaunm.tokens.json)
 * Single source of truth for UI colors, typography, sizing, and safety constraints.
 */

export const primitive = {
  color: {
    volt: { 400: '#B4FF39', 500: '#9FE81F', 600: '#7FC40E' },
    cyan: { 400: '#22C9EE', 600: '#0B87A6' },
    graphite: {
      50: '#E9EFED',
      200: '#A6B6B1',
      300: '#7E918C',
      500: '#3C4B47',
      600: '#2C3835',
      700: '#202A27',
      800: '#171F1D',
      850: '#111716',
      900: '#0B0F0E',
      950: '#050807',
    },
    snow: {
      0: '#FFFFFF',
      50: '#F7F9F8',
      300: '#CBD4D1',
      600: '#54615D',
      900: '#0F1513',
    },
    semantic: {
      success: '#2FD07A',
      warning: '#FFB020',
      info: '#22C9EE',
      danger: '#F2603C', // Standard destructive / hazard action (NOT SOS)
    },
    sos: {
      400: '#FF4D64',
      500: '#FF1F3D', // STRICTLY RESERVED: Emergency SOS only
      600: '#D80D28',
      900: '#3D0209',
    },
    route: {
      straight: '#22C9EE',
      curvy: '#B4FF39',
      supercurvy: '#C25CFF',
      alternative: '#5A6D68',
      detour: '#FFB020',
      hazard: '#F2603C',
      lost: '#7E918C',
    },
  },
  spacing: {
    0: 0,
    1: 2,
    2: 4,
    3: 8,
    4: 12,
    5: 16,
    6: 20,
    7: 24,
    8: 32,
    9: 40,
    10: 48,
    11: 64,
    12: 80,
    13: 96,
  },
  radius: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    '2xl': 28,
    full: 999,
  },
  size: {
    targetMin: 48,
    targetInRide: 56, // Minimum touch target when vehicle is in motion
    targetPTT: 72,
    targetSOS: 88, // Glove-accessible dedicated SOS dome
    icon: 24,
    iconHUD: 32,
    navBar: 64,
    appBar: 56,
    sheetPeek: 120,
  },
  duration: {
    instant: 100,
    fast: 200,
    base: 320,
    slow: 600,
    cinematic: 1200,
    sosHold: 3000, // 3-second deliberate hold to arm/disarm
    sosCancel: 10000, // 10-second cancel window before transmission
  },
} as const;

export type ThemeMode = 'night' | 'dayGlare' | 'dusk' | 'blackout';

export interface ThemeColors {
  background: string;
  surface: string;
  surfaceElevated: string;
  surfaceCard: string;
  text: string;
  textMuted: string;
  textSubtle: string;
  border: string;
  borderSubtle: string;
  interactive: string;
  interactivePressed: string;
  information: string;
  accentSupercurvy: string;
  mapGlass: {
    backgroundColor: string;
    borderColor: string;
    blurRadius: number;
  };
}

const night: ThemeColors = {
  background: primitive.color.graphite[900],
  surface: primitive.color.graphite[850],
  surfaceElevated: primitive.color.graphite[800],
  surfaceCard: primitive.color.graphite[700],
  text: primitive.color.graphite[50],
  textMuted: primitive.color.graphite[200],
  textSubtle: primitive.color.graphite[300],
  border: primitive.color.graphite[600],
  borderSubtle: primitive.color.graphite[700],
  interactive: primitive.color.volt[400],
  interactivePressed: primitive.color.volt[600],
  information: primitive.color.cyan[400],
  accentSupercurvy: primitive.color.route.supercurvy,
  mapGlass: {
    backgroundColor: 'rgba(11, 15, 14, 0.72)',
    borderColor: 'rgba(255, 255, 255, 0.08)',
    blurRadius: 24,
  },
};

export const themes: Record<ThemeMode, ThemeColors> = {
  night,
  dusk: {
    ...night,
    background: '#121917',
    surface: '#18221F',
  },
  blackout: {
    ...night,
    background: primitive.color.graphite[950],
    surface: primitive.color.graphite[900],
    surfaceElevated: primitive.color.graphite[850],
    border: primitive.color.graphite[700],
  },
  dayGlare: {
    background: primitive.color.snow[50],
    surface: primitive.color.snow[0],
    surfaceElevated: primitive.color.snow[0],
    surfaceCard: primitive.color.snow[50],
    text: primitive.color.snow[900],
    textMuted: primitive.color.snow[600],
    textSubtle: primitive.color.snow[300],
    border: primitive.color.snow[300],
    borderSubtle: '#E2E8E6',
    interactive: primitive.color.volt[600],
    interactivePressed: primitive.color.volt[500],
    information: primitive.color.cyan[600],
    accentSupercurvy: primitive.color.route.supercurvy,
    mapGlass: {
      backgroundColor: 'rgba(255, 255, 255, 0.96)', // Near solid for direct daylight glare
      borderColor: primitive.color.snow[300],
      blurRadius: 0,
    },
  },
};

export const typography = {
  displayHero: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 48,
    lineHeight: 52,
    letterSpacing: -0.96,
  },
  h1: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 32,
    lineHeight: 38,
    letterSpacing: -0.64,
  },
  h2: {
    fontFamily: 'SpaceGrotesk_600SemiBold',
    fontSize: 24,
    lineHeight: 30,
    letterSpacing: -0.48,
  },
  h3: {
    fontFamily: 'SpaceGrotesk_600SemiBold',
    fontSize: 20,
    lineHeight: 26,
    letterSpacing: -0.2,
  },
  bodyLarge: {
    fontFamily: 'Inter_400Regular',
    fontSize: 17,
    lineHeight: 26,
  },
  bodyMedium: {
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
    lineHeight: 22,
  },
  bodySmall: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    lineHeight: 20,
  },
  telemetryHero: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 56,
    lineHeight: 60,
    fontVariant: ['tabular-nums'] as const,
  },
  telemetryXL: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 44,
    lineHeight: 46,
    fontVariant: ['tabular-nums'] as const,
  },
  telemetryLarge: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 32,
    lineHeight: 34,
    fontVariant: ['tabular-nums'] as const,
  },
  telemetryMedium: {
    fontFamily: 'SpaceGrotesk_600SemiBold',
    fontSize: 22,
    lineHeight: 26,
    fontVariant: ['tabular-nums'] as const,
  },
  npBody: {
    fontFamily: 'Mukta_400Regular',
    fontSize: 16,
    lineHeight: 24,
  },
  npHeading: {
    fontFamily: 'Mukta_700Bold',
    fontSize: 24,
    lineHeight: 32,
  },
  mono: {
    fontFamily: 'JetBrainsMono_500Medium',
    fontSize: 12,
    lineHeight: 16,
    fontVariant: ['tabular-nums'] as const,
  },
} as const;

export const routePresentation = {
  straight: {
    label: 'Straight',
    labelNepali: 'सिधा',
    color: primitive.color.route.straight,
    lineWidth: 6,
    lineDasharray: undefined,
    icon: 'arrow-straight',
    description: 'Fastest & most direct highway routes',
  },
  curvy: {
    label: 'Curvy',
    labelNepali: 'घुमाउरो',
    color: primitive.color.route.curvy,
    lineWidth: 7,
    lineDasharray: undefined,
    icon: 'wave-single',
    description: 'The signature balanced Himalayan ride',
  },
  supercurvy: {
    label: 'Supercurvy',
    labelNepali: 'अत्यन्त घुमाउरो',
    color: primitive.color.route.supercurvy,
    lineWidth: 8,
    lineDasharray: [4, 3],
    icon: 'wave-double',
    description: 'Maximum bends, mountain passes & unpaved terrain',
  },
} as const;

export const safety = {
  sos: {
    color: primitive.color.sos[500],
    pressed: primitive.color.sos[600],
    wash: primitive.color.sos[900],
    holdMs: primitive.duration.sosHold,
    cancelWindowMs: primitive.duration.sosCancel,
    target: primitive.size.targetSOS,
  },
  accessibility: {
    minContrast: 4.5,
    telemetryContrast: 7.0,
    sosContrast: 10.0,
    minTarget: primitive.size.targetMin,
    inRideTarget: primitive.size.targetInRide,
  },
} as const;
