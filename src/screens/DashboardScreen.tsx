import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { useAuthStore } from '../stores/authStore';
import { api } from '../services/api';
import type { Order } from '../types';
import { STATUS_LABELS, STATUS_COLORS } from '../types';

export default function DashboardScreen() {
  const user = useAuthStore((s) => s.user);
  const role = useAuthStore((s) => s.role);
  const [orders, setOrders] = useState<Order[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({ total: 0, pending: 0, inProcess: 0, done: 0 });

  const loadData = async () => {
    try {
      const res = await api.getOrders({ date: new Date().toISOString().split('T')[0] });
      const list = res.data || res || [];
      const arr = Array.isArray(list) ? list : list?.orders || [];
      setOrders(arr);

      setStats({
        total: arr.length,
        pending: arr.filter((o: Order) => [1, 2].includes(o.status_id)).length,
        inProcess: arr.filter((o: Order) => [3, 4, 5].includes(o.status_id)).length,
        done: arr.filter((o: Order) => [6, 7, 8].includes(o.status_id)).length,
      });
    } catch (e) {
      console.log('Dashboard load error:', e);
    }
  };

  useEffect(() => { loadData(); }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const StatCard = ({ label, value, color }: { label: string; value: number; color: string }) => (
    <View style={[styles.statCard, { borderLeftColor: color }]}>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <Text style={styles.greeting}>
        Hola, {user?.first_name || 'Usuario'}
      </Text>
      <Text style={styles.role}>Rol: {role}</Text>

      <Text style={styles.sectionTitle}>Resumen del día</Text>
      <View style={styles.statsRow}>
        <StatCard label="Total" value={stats.total} color="#3b82f6" />
        <StatCard label="Pendientes" value={stats.pending} color="#f59e0b" />
        <StatCard label="En proceso" value={stats.inProcess} color="#8b5cf6" />
        <StatCard label="Completadas" value={stats.done} color="#10b981" />
      </View>

      <Text style={styles.sectionTitle}>Órdenes recientes</Text>
      {orders.length === 0 ? (
        <Text style={styles.empty}>No hay órdenes hoy</Text>
      ) : (
        orders.slice(0, 10).map((order) => (
          <View key={order.id} style={styles.orderCard}>
            <View style={styles.orderHeader}>
              <Text style={styles.orderId}>#{order.id}</Text>
              <View style={[styles.statusBadge, { backgroundColor: STATUS_COLORS[order.status_id] || '#6b7280' }]}>
                <Text style={styles.statusText}>{STATUS_LABELS[order.status_id] || '?'}</Text>
              </View>
            </View>
            <Text style={styles.orderCustomer}>{order.customer_name || 'Cliente'}</Text>
            <Text style={styles.orderTotal}>${Number(order.total_amount).toFixed(2)}</Text>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f3f4f6' },
  greeting: { fontSize: 24, fontWeight: '700', color: '#1f2937', paddingHorizontal: 20, paddingTop: 20 },
  role: { fontSize: 14, color: '#6b7280', paddingHorizontal: 20, marginBottom: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: '#374151', paddingHorizontal: 20, marginBottom: 12, marginTop: 8 },
  statsRow: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 16, gap: 8, marginBottom: 16 },
  statCard: {
    flex: 1, minWidth: 80,
    backgroundColor: '#fff', borderRadius: 12, padding: 14,
    borderLeftWidth: 4,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  statValue: { fontSize: 24, fontWeight: '700' },
  statLabel: { fontSize: 11, color: '#6b7280', marginTop: 4 },
  orderCard: {
    backgroundColor: '#fff', borderRadius: 12, padding: 16, marginHorizontal: 20, marginBottom: 8,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  orderHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  orderId: { fontSize: 18, fontWeight: '600', color: '#1f2937' },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  statusText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  orderCustomer: { fontSize: 14, color: '#4b5563', marginBottom: 4 },
  orderTotal: { fontSize: 16, fontWeight: '600', color: '#059669' },
  empty: { textAlign: 'center', color: '#9ca3af', padding: 40, fontSize: 16 },
});
