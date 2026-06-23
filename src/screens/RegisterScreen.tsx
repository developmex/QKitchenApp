import React, { useState } from 'react';
import {
  View, Text, TextInput, StyleSheet, ScrollView, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useAuthStore } from '../stores/authStore';
import { api } from '../services/api';
import { Colors, Radius, Shadows, Spacing } from '../utils/theme';
import Button from '../components/Button';

export default function RegisterScreen({ navigation }: any) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const setSession = useAuthStore((s) => s.setSession);

  const handleRegister = async () => {
    if (!firstName.trim() || !email.trim() || !password) {
      setError('Nombre, email y contraseña son obligatorios'); return;
    }
    if (password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres'); return;
    }
    setLoading(true); setError('');
    try {
      const res = await api.register({
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        email: email.trim(),
        password,
      });
      const data = res.data || res;
      const tok = data.access_token || data.accessToken || data.token || '';
      const usr = data.user || {};
      const comp = data.company || { id: usr.company_id || 1, name: 'Q-Kitchen', slug: data.company_slug || 'qkitchen' };
      await setSession(tok, tok, usr, comp);
    } catch (e: any) {
      setError(e.message || 'Error al crear cuenta');
    } finally { setLoading(false); }
  };

  return (
    <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.topSection}>
          <Text style={styles.brandName}>Q-Kitchen</Text>
          <Text style={styles.tagline}>Crear cuenta nueva</Text>
        </View>

        <View style={styles.card}>
          {error ? (
            <View style={styles.errorBox}><Text style={styles.errorText}>{error}</Text></View>
          ) : null}

          <Text style={styles.label}>Nombre</Text>
          <TextInput style={styles.input} placeholder="Tu nombre" placeholderTextColor={Colors.textLight} value={firstName} onChangeText={setFirstName} editable={!loading} />

          <Text style={styles.label}>Apellido</Text>
          <TextInput style={styles.input} placeholder="Tu apellido" placeholderTextColor={Colors.textLight} value={lastName} onChangeText={setLastName} editable={!loading} />

          <Text style={styles.label}>Email</Text>
          <TextInput style={styles.input} placeholder="tu@email.com" placeholderTextColor={Colors.textLight} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" editable={!loading} />

          <Text style={styles.label}>Contraseña</Text>
          <TextInput style={styles.input} placeholder="Mínimo 8 caracteres" placeholderTextColor={Colors.textLight} value={password} onChangeText={setPassword} secureTextEntry editable={!loading} />

          <Button title="Crear cuenta" onPress={handleRegister} loading={loading} style={{ marginTop: Spacing.sm }} />
          <Button title="Volver al login" onPress={() => navigation.goBack()} variant="outline" style={{ marginTop: Spacing.sm }} />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.bg },
  scroll: { flexGrow: 1 },
  topSection: {
    alignItems: 'center', paddingTop: 60, paddingBottom: Spacing.xl,
    backgroundColor: Colors.primary,
    borderBottomLeftRadius: Radius.lg * 2, borderBottomRightRadius: Radius.lg * 2,
  },
  brandName: { fontSize: 30, fontWeight: '700', color: Colors.textInverse, letterSpacing: 1 },
  tagline: { fontSize: 14, color: 'rgba(255,255,255,0.8)', marginTop: 4 },
  card: {
    marginHorizontal: Spacing.lg, marginTop: -Spacing.lg,
    backgroundColor: Colors.surface, borderRadius: Radius.lg,
    padding: Spacing.lg, ...Shadows.lg,
  },
  label: {
    fontSize: 13, fontWeight: '600', color: Colors.textMuted,
    marginBottom: 6, marginTop: 12, textTransform: 'uppercase', letterSpacing: 0.5,
  },
  input: {
    backgroundColor: Colors.bgAlt, borderRadius: Radius.sm, padding: 14,
    fontSize: 15, color: Colors.text, borderWidth: 1, borderColor: Colors.surfaceBorder,
  },
  errorBox: {
    backgroundColor: '#FEF2F2', borderRadius: Radius.sm, padding: 12,
    marginBottom: Spacing.sm, borderLeftWidth: 3, borderLeftColor: Colors.danger,
  },
  errorText: { color: Colors.danger, fontSize: 13 },
});
