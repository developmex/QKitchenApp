import React, { useState } from 'react';
import {
  View, Text, TextInput, StyleSheet, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuthStore } from '../stores/authStore';
import { api } from '../services/api';
import { Colors, Radius, Shadows, Spacing } from '../utils/theme';
import Button from '../components/Button';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const setSession = useAuthStore((s) => s.setSession);
  const navigation = useNavigation<any>();

  const handleLogin = async () => {
    if (!email.trim() || !password) { setError('Ingresa email y contraseña'); return; }
    setLoading(true); setError('');
    try {
      const res = await api.login(email.trim(), password);
      const data = res.data || res;
      const tok = data.access_token || data.accessToken || data.token || '';
      const refTok = data.refresh_token || data.refreshToken || tok;
      let usr = data.user || {};
      // API retorna user.name como "Admin Test" — separar en first/last
      if (usr.name && !usr.first_name) {
        const parts = (usr.name || '').split(' ');
        usr = { ...usr, first_name: parts[0] || '', last_name: parts.slice(1).join(' ') || '' };
      }
      const comp = data.company || { id: usr.company_id || 1, name: 'Q-Kitchen', slug: data.company_slug || 'qkitchen' };
      await setSession(tok, refTok, usr, comp);
    } catch (e: any) {
      setError(e.message || 'Error al iniciar sesión');
    } finally { setLoading(false); }
  };

  return (
    <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.topSection}>
        <View style={styles.logoCircle}>
          <Text style={styles.logoIcon}>🥂</Text>
        </View>
        <Text style={styles.brandName}>Q-Kitchen</Text>
        <Text style={styles.tagline}>Catering de excelencia</Text>
        <View style={styles.dividerRow}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>by PauQuiroga</Text>
          <View style={styles.dividerLine} />
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Iniciar sesión</Text>

        {error ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          placeholder="tu@email.com"
          placeholderTextColor={Colors.textLight}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          editable={!loading}
        />

        <Text style={styles.label}>Contraseña</Text>
        <TextInput
          style={styles.input}
          placeholder="••••••••"
          placeholderTextColor={Colors.textLight}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          editable={!loading}
        />

        <Button title="Entrar" onPress={handleLogin} loading={loading} style={{ marginTop: Spacing.sm }} />
        <Button title="Crear cuenta" onPress={() => navigation.navigate('Register')} variant="outline" style={{ marginTop: Spacing.sm }} />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.bg },
  topSection: {
    alignItems: 'center',
    paddingTop: 80,
    paddingBottom: Spacing.xl,
    backgroundColor: Colors.primary,
    borderBottomLeftRadius: Radius.lg * 2,
    borderBottomRightRadius: Radius.lg * 2,
  },
  logoCircle: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center', justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  logoIcon: { fontSize: 36 },
  brandName: {
    fontSize: 34, fontWeight: '700', color: Colors.textInverse,
    letterSpacing: 1, marginBottom: 4,
  },
  tagline: {
    fontSize: 14, color: 'rgba(255,255,255,0.8)',
    fontWeight: '400', marginBottom: Spacing.md,
  },
  dividerRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  dividerLine: { width: 40, height: 1, backgroundColor: 'rgba(255,255,255,0.3)' },
  dividerText: { fontSize: 11, color: 'rgba(255,255,255,0.6)', fontWeight: '500', letterSpacing: 2, textTransform: 'uppercase' },

  card: {
    marginHorizontal: Spacing.lg,
    marginTop: -Spacing.lg,
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    ...Shadows.lg,
  },
  cardTitle: { fontSize: 20, fontWeight: '700', color: Colors.text, marginBottom: Spacing.md },

  label: {
    fontSize: 13, fontWeight: '600', color: Colors.textMuted,
    marginBottom: 6, marginTop: 12, textTransform: 'uppercase', letterSpacing: 0.5,
  },
  input: {
    backgroundColor: Colors.bgAlt,
    borderRadius: Radius.sm,
    padding: 14,
    fontSize: 15,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
  },
  errorBox: {
    backgroundColor: '#FEF2F2',
    borderRadius: Radius.sm,
    padding: 12,
    marginBottom: Spacing.sm,
    borderLeftWidth: 3,
    borderLeftColor: Colors.danger,
  },
  errorText: { color: Colors.danger, fontSize: 13 },
});
