// Q-Kitchen Design System — PauQuiroga Premium Catering Brand
// Basado en globals.css de la web app

export const Colors = {
  // Primary — Sage / Olive Green
  primary: '#94A385',
  primaryDark: '#5D6B4E',
  primaryLight: '#B8C5A8',
  primaryGlow: 'rgba(148, 163, 133, 0.4)',

  // Accent — Terracotta
  accent: '#B97A57',
  accentGlow: 'rgba(185, 122, 87, 0.3)',

  // Secondary — Champagne Gold
  gold: '#D4AF37',
  goldGlow: 'rgba(212, 175, 55, 0.3)',

  // Backgrounds
  bg: '#FCFCFC',
  bgAlt: '#F3F4F6',
  bgDark: '#1F2937',

  // Surfaces — Glass morphism
  surface: '#FFFFFF',
  surfaceGlass: 'rgba(255, 255, 255, 0.7)',
  surfaceBorder: 'rgba(0, 0, 0, 0.08)',

  // Text
  text: '#1F2937',
  textMuted: '#6B7280',
  textLight: '#9CA3AF',
  textInverse: '#F8FAFC',

  // Status
  danger: '#DC2626',
  success: '#10B981',
  warning: '#F59E0B',
  info: '#3B82F6',

  // Gradients
  gradientStart: '#F3F4F6',
  gradientEnd: '#E5E7EB',
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const Radius = {
  sm: 8,
  md: 16,
  lg: 24,
  pill: 9999,
};

export const Shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 8,
  },
};

export const Typography = {
  h1: { fontSize: 28, fontWeight: '700' as const, color: Colors.text, fontFamily: undefined },
  h2: { fontSize: 22, fontWeight: '600' as const, color: Colors.text },
  h3: { fontSize: 18, fontWeight: '600' as const, color: Colors.text },
  body: { fontSize: 15, fontWeight: '400' as const, color: Colors.text },
  caption: { fontSize: 13, fontWeight: '400' as const, color: Colors.textMuted },
  label: { fontSize: 11, fontWeight: '500' as const, color: Colors.textMuted, textTransform: 'uppercase' as const, letterSpacing: 1 },
};

// Mapa de estados idéntico al web app
export const STATUS_LABELS: Record<number, string> = {
  1: 'Pendiente', 2: 'Programado', 3: 'En proceso', 4: 'Demorado',
  5: 'Listo para entrega', 6: 'En camino', 7: 'Entregado (pago pend.)',
  8: 'Entregado (pagado)', 9: 'Cancelado',
};

export const STATUS_COLORS: Record<number, string> = {
  1: Colors.warning, 2: Colors.info, 3: '#8B5CF6', 4: Colors.danger,
  5: Colors.success, 6: '#06B6D4', 7: '#F97316', 8: '#22C55E', 9: '#6B7280',
};

export const ROLE_LABELS: Record<number, string> = {
  1: 'Cliente', 2: 'Empleado', 3: 'Director', 4: 'Administrador', 5: 'Cocina', 6: 'Chofer',
};
