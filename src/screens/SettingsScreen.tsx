import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, TextInput } from 'react-native';
import { useAuthStore } from '../stores/authStore';
import { api } from '../services/api';
import { Colors, Radius, Shadows, Spacing, ROLE_LABELS } from '../utils/theme';
import Button from '../components/Button';

export default function SettingsScreen() {
  const user = useAuthStore((s) => s.user);
  const company = useAuthStore((s) => s.company);
  const role = useAuthStore((s) => s.role);
  const setUser = useAuthStore((s) => s.setUser);
  const logout = useAuthStore((s) => s.logout);

  const [editing, setEditing] = useState(false);
  const [firstName, setFirstName] = useState(user?.first_name || '');
  const [lastName, setLastName] = useState(user?.last_name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [language, setLanguage] = useState(user?.language || 'ES');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!firstName.trim()) {
      Alert.alert('Error', 'El nombre es obligatorio');
      return;
    }
    setSaving(true);
    try {
      const res = await api.updateProfile({
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        phone: phone.trim(),
        language,
      });
      const data = res.data || res;
      const updatedUser = data.user || data;
      setUser({ ...user, ...updatedUser, first_name: firstName.trim(), last_name: lastName.trim(), phone: phone.trim(), language });
      setEditing(false);
      Alert.alert('Perfil actualizado', 'Tus datos se guardaron correctamente');
    } catch (e: any) {
      Alert.alert('Error', e.message || 'No se pudo actualizar el perfil');
    } finally {
      setSaving(false);
    }
  };

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

  const EditableRow = ({ label, value, onChange, placeholder, keyboardType }: {
    label: string; value: string; onChange: (v: string) => void; placeholder: string; keyboardType?: any;
  }) => (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <TextInput
        style={styles.rowInput}
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor={Colors.textLight}
        keyboardType={keyboardType}
      />
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
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Información</Text>
          {!editing ? (
            <Button title="Editar" onPress={() => setEditing(true)} variant="outline" style={{ paddingVertical: 6, paddingHorizontal: 16, minHeight: 0 }} />
          ) : null}
        </View>

        {editing ? (
          <>
            <EditableRow label="Nombre" value={firstName} onChange={setFirstName} placeholder="Tu nombre" />
            <EditableRow label="Apellido" value={lastName} onChange={setLastName} placeholder="Tu apellido" />
          </>
        ) : (
          <Row label="Nombre" value={`${user?.first_name || ''} ${user?.last_name || ''}`.trim() || '—'} />
        )}

        <Row label="Email" value={user?.email || '—'} />

        {editing ? (
          <EditableRow label="Teléfono" value={phone} onChange={setPhone} placeholder="+52 555 123 4567" keyboardType="phone-pad" />
        ) : (
          <Row label="Teléfono" value={user?.phone || '—'} />
        )}

        {editing ? (
          <EditableRow label="Idioma" value={language} onChange={setLanguage} placeholder="ES" />
        ) : (
          <Row label="Idioma" value={user?.language || 'ES'} />
        )}

        {/* Rol: solo lectura */}
        <Row label="Rol" value={ROLE_LABELS[user?.role_id || 1] || role} />

        {editing && (
          <View style={styles.editActions}>
            <Button title="Cancelar" onPress={() => {
              setFirstName(user?.first_name || '');
              setLastName(user?.last_name || '');
              setPhone(user?.phone || '');
              setLanguage(user?.language || 'ES');
              setEditing(false);
            }} variant="outline" style={{ flex: 1 }} />
            <Button title="Guardar" onPress={handleSave} loading={saving} style={{ flex: 1 }} />
          </View>
        )}
      </View>

      {/* Logout */}
      <View style={styles.card}>
        <Button title="Cerrar sesión" onPress={handleLogout} variant="danger" />
      </View>

      <Text style={styles.version}>QKitchen App v1.0.0</Text>
      <Text style={styles.branding}>by monographics</Text>
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
  cardHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: Spacing.md,
  },
  cardTitle: { fontSize: 16, fontWeight: '700', color: Colors.text },

  row: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: Colors.bgAlt,
  },
  rowLabel: { fontSize: 14, color: Colors.textMuted, flex: 1 },
  rowValue: { fontSize: 14, fontWeight: '500', color: Colors.text, textAlign: 'right', flex: 2 },
  rowInput: {
    fontSize: 14, fontWeight: '500', color: Colors.text, textAlign: 'right', flex: 2,
    backgroundColor: Colors.bgAlt, borderRadius: Radius.sm, padding: 8, borderWidth: 1, borderColor: Colors.surfaceBorder,
  },

  editActions: {
    flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.md,
  },

  version: {
    textAlign: 'center', color: Colors.textLight, fontSize: 12,
    marginTop: Spacing.xl,
  },
  branding: {
    textAlign: 'center',
    fontSize: 11,
    color: Colors.textLight,
    fontWeight: '500',
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginTop: Spacing.xs,
  },
});
