import React from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { useAuthStore } from '../stores/authStore';
import { api } from '../services/api';
import { Colors, Radius, Shadows, Spacing, ROLE_LABELS } from '../utils/theme';
import Button from '../components/Button';

export default function SettingsScreen() {
  const user = useAuthStore((s) => s.user);
  const company = useAuthStore((s) => s.company);
  const role = useAuthStore((s) => s.role);
  const logout = useAuthStore((s) => s.logout);

  const handleLogout = () => {
    Alert.alert('Cerrar sesión', '¿Estás seguro?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Salir', style: 'destructive',
        onPress: async () => {
          try { await api.logout(); } catch (_) {}
          await logout();
        },
      },
    ]);
  };

  const Row = ({ label, value }: { label: string; value: string }) => (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );

  return (
    <ScrollView style={styles.root}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{(user?.first_name || 'U')[0].toUpperCase()}</Text>
        </View>
        <Text style={styles.name}>{user?.first_name} {user?.last_name || ''}</Text>
        <Text style={styles.email}>{user?.email}</Text>
        <View style={styles.roleBadge}>
          <Text style={styles.roleText}>{ROLE_LABELS[user?.role_id || 1] || role}</Text>
        </View>
      </View>

      {/* Info */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Información</Text>
        <Row label="Empresa" value={company?.name || 'Q-Kitchen'} />
        <Row label="Rol" value={ROLE_LABELS[user?.role_id || 1] || role} />
        <Row label="Email" value={user?.email || '—'} />
        <Row label="Teléfono" value={user?.phone || '—'} />
        <Row label="Idioma" value={user?.language || 'ES'} />
      </View>

      {/* Logout */}
      <View style={styles.card}>
        <Button title="Cerrar sesión" onPress={handleLogout} variant="danger" />
      </View>

      <Text style={styles.version}>QKitchen App v1.0.0</Text>
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.bg },
  header: {
    alignItems: 'center', paddingTop: 60, paddingBottom: Spacing.xl,
    backgroundColor: Colors.primary,
    borderBottomLeftRadius: Radius.lg * 2, borderBottomRightRadius: Radius.lg * 2,
  },
  avatar: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.md,
  },
  avatarText: { fontSize: 30, fontWeight: '700', color: Colors.textInverse },
  name: { fontSize: 22, fontWeight: '700', color: Colors.textInverse, marginBottom: 2 },
  email: { fontSize: 14, color: 'rgba(255,255,255,0.8)', marginBottom: Spacing.sm },
  roleBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: Radius.pill,
    paddingHorizontal: 14, paddingVertical: 5,
  },
  roleText: { fontSize: 13, fontWeight: '600', color: Colors.textInverse },

  card: {
    marginHorizontal: Spacing.md, marginTop: Spacing.md,
    backgroundColor: Colors.surface, borderRadius: Radius.md,
    padding: Spacing.md, ...Shadows.sm,
  },
  cardTitle: { fontSize: 16, fontWeight: '700', color: Colors.text, marginBottom: Spacing.md },

  row: {
    flexDirection: 'row', justifyContent: 'space-between',
    paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: Colors.bgAlt,
  },
  rowLabel: { fontSize: 14, color: Colors.textMuted },
  rowValue: { fontSize: 14, fontWeight: '500', color: Colors.text },

  version: {
    textAlign: 'center', color: Colors.textLight, fontSize: 12,
    marginTop: Spacing.xl,
  },
});
