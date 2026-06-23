import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Colors, Radius, Shadows } from '../utils/theme';

interface Props {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'gold' | 'outline' | 'danger';
  loading?: boolean;
  disabled?: boolean;
  style?: any;
}

export default function Button({ title, onPress, variant = 'primary', loading, disabled, style }: Props) {
  const bg = {
    primary: Colors.primary,
    gold: Colors.gold,
    outline: 'transparent',
    danger: Colors.danger,
  }[variant];

  const txt = variant === 'outline' ? Colors.primary : variant === 'gold' ? Colors.text : Colors.textInverse;

  return (
    <TouchableOpacity
      style={[
        styles.base,
        { backgroundColor: bg },
        variant === 'outline' && { borderWidth: 1.5, borderColor: Colors.primary },
        (disabled || loading) && styles.disabled,
        style,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color={txt} size="small" />
      ) : (
        <Text style={[styles.text, { color: txt }]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
    ...Shadows.sm,
  },
  disabled: { opacity: 0.5 },
  text: {
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
});
