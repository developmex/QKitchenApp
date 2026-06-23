import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Radius, STATUS_LABELS, STATUS_COLORS } from '../utils/theme';

interface Props {
  statusId: number;
  size?: 'sm' | 'md';
}

export default function StatusBadge({ statusId, size = 'md' }: Props) {
  const color = STATUS_COLORS[statusId] || Colors.textMuted;
  return (
    <View style={[styles.badge, { backgroundColor: color + '20', borderColor: color + '40' }, size === 'sm' && styles.sm]}>
      <View style={[styles.dot, { backgroundColor: color }]} />
      <Text style={[styles.text, { color }, size === 'sm' && styles.textSm]}>
        {STATUS_LABELS[statusId] || '?'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: Radius.pill,
    borderWidth: 1,
    gap: 6,
  },
  sm: { paddingHorizontal: 8, paddingVertical: 3 },
  dot: { width: 6, height: 6, borderRadius: 3 },
  text: { fontSize: 12, fontWeight: '600' },
  textSm: { fontSize: 10 },
});
