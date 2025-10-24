// Tema EXACTO de WhereTonight Web
// Sincronizado con tailwind.config.ts de la web

export const colors = {
  // Dark colors
  dark: {
    primary: '#0A0A1A',
    secondary: '#16163A',
    card: '#1E1E3F',
    hover: '#252552',
  },
  
  // Neon colors
  neon: {
    pink: '#FF00FF',
    purple: '#A020F0',
    blue: '#00BFFF',
    cyan: '#00FFFF',
    green: '#00FF7F',
  },
  
  // Text colors
  text: {
    light: '#FFFFFF',
    secondary: '#A0A0C0',
    muted: '#6A6A8E',
  },
};

export const shadows = {
  neonPink: {
    shadowColor: colors.neon.pink,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 5,
  },
  neonBlue: {
    shadowColor: colors.neon.blue,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 5,
  },
  neonCyan: {
    shadowColor: colors.neon.cyan,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 5,
  },
  neonPurple: {
    shadowColor: colors.neon.purple,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 5,
  },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const borderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

export const fontSize = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 24,
  xxl: 32,
  xxxl: 48,
};

export const fontWeight = {
  normal: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
  extrabold: '800' as const,
};

// Estilos comunes reutilizables
export const commonStyles = {
  container: {
    flex: 1,
    backgroundColor: colors.dark.primary,
  },
  card: {
    backgroundColor: colors.dark.card,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
  },
  button: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  buttonPrimary: {
    backgroundColor: colors.neon.blue,
  },
  buttonSecondary: {
    backgroundColor: colors.dark.secondary,
  },
  input: {
    backgroundColor: colors.dark.secondary,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    color: colors.text.light,
    fontSize: fontSize.md,
  },
  textLight: {
    color: colors.text.light,
  },
  textSecondary: {
    color: colors.text.secondary,
  },
  textMuted: {
    color: colors.text.muted,
  },
};

export default {
  colors,
  shadows,
  spacing,
  borderRadius,
  fontSize,
  fontWeight,
  commonStyles,
};
