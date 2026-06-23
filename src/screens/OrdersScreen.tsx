import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  RefreshControl, Alert,
} from 'react-native';
import { api } from '../services/api';
import { useAuthStore } from '../stores/authStore';
import type { Order } from '../types';
import { STATUS_LABELS, STATUS_COLORS } from '../types';

export default function OrdersScreen() {
  const role = useAuthStore((s) => s.role);
  const [orders, setOrders] = useState<Order[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<number | null>(null);

  const loadOrders = useCallback(async () => {
    try {
      const res = await api.getOrders({ date: new Date().toISOString().split('T')[0] });
      const list = res.data || res || [];
      const arr = Array.isArray(list) ? list : list?.orders || [];
      setOrders(arr);
    } catch (e) {
      console.log('Orders load error:', e);
    }
  }, []);

  useEffect(() => { loadOrders(); }, [loadOrders]);

  // Auto-refresh cada 30s para cocina (tiempo real)
  useEffect(() => {
    if (role !== 'kitchen' && role !== 'admin') return;
    const timer = setInterval(loadOrders, 30000);
    return () => clearInterval(timer);
  }, [role, loadOrders]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadOrders();
    setRefreshing(false);
  };

  const handleStatusChange = async (orderId: number, newStatus: number) => {
    const statusLabel = STATUS_LABELS[newStatus];
    Alert.alert(
      'Cambiar estado',
      `¿Marcar orden #${orderId} como "${statusLabel}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Confirmar',
          onPress: async () => {
            try {
              await api.updateOrderStatus(orderId, newStatus);
              loadOrders();
            } catch (e: any) {
              Alert.alert('Error', e.message || 'No se pudo actualizar');
            }
          },
        },
      ],
    );
  };

  const getNextStatus = (currentStatus: number): { id: number; label: string } | null => {
    const flow: Record<number, number> = {
      1: 2,  // Pendiente → Programado
      2: 3,  // Programado → En proceso
      3: 5,  // En proceso → Listo para entrega
      5: 6,  // Listo → En camino
      6: 7,  // En camino → Entregado (pendiente pago)
      7: 8,  // Entregado pend. pago → Entregado pagado
    };
    const next = flow[currentStatus];
    return next ? { id: next, label: STATUS_LABELS[next] } : null;
  };

  const filtered = selectedStatus
    ? orders.filter((o) => o.status_id === selectedStatus)
    : orders;

  // Filtros de estado
  const statusFilters = [1, 2, 3, 5, 6, 7, 8].filter((s) => {
    if (role === 'kitchen') return [2, 3, 5].includes(s);
    if (role === 'driver') return [5, 6, 7].includes(s);
    return true;
  });

  const renderOrder = ({ item }: { item: Order }) => {
    const next = getNextStatus(item.status_id);
    const canAdvance = next && 
      ((role === 'kitchen' && [2, 3, 5].includes(next.id)) ||
       (role === 'driver' && [5, 6, 7].includes(next.id)) ||
       (role === 'admin'));

    return (
      <View style={styles.card}>
        <View style={styles.header}>
          <View>
            <Text style={styles.orderId}>#{item.id}</Text>
            <Text style={styles.customer}>{item.customer_name || 'Cliente'}</Text>
          </View>
          <View style={[styles.badge, { backgroundColor: STATUS_COLORS[item.status_id] || '#6b7280' }]}>
            <Text style={styles.badgeText}>{STATUS_LABELS[item.status_id] || '?'}</Text>
          </View>
        </View>

        <View style={styles.details}>
          <Text style={styles.detail}>🕐 {item.delivery_time?.substring(0, 5) || '12:00'}</Text>
          <Text style={styles.detail}>👥 {item.diners_count} comensales</Text>
          <Text style={styles.detail}>📦 {item.is_pickup ? 'Recoger' : 'Entrega'}</Text>
        </View>

        {item.items && item.items.length > 0 && (
          <View style={styles.items}>
            {item.items.map((it) => (
              <Text key={it.id} style={styles.itemText}>
                {it.portions}x {it.dish_name}
              </Text>
            ))}
          </View>
        )}

        <View style={styles.footer}>
          <Text style={styles.total}>${Number(item.total_amount).toFixed(2)}</Text>
          {canAdvance && next && (
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: STATUS_COLORS[next.id] }]}
              onPress={() => handleStatusChange(item.id, next.id)}
            >
              <Text style={styles.actionBtnText}>{next.label}</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Filtros */}
      <View style={styles.filters}>
        <TouchableOpacity
          style={[styles.filterBtn, !selectedStatus && styles.filterBtnActive]}
          onPress={() => setSelectedStatus(null)}
        >
          <Text style={[styles.filterText, !selectedStatus && styles.filterTextActive]}>Todas</Text>
        </TouchableOpacity>
        {statusFilters.map((s) => (
          <TouchableOpacity
            key={s}
            style={[styles.filterBtn, selectedStatus === s && { backgroundColor: STATUS_COLORS[s] }]}
            onPress={() => setSelectedStatus(selectedStatus === s ? null : s)}
          >
            <Text style={[styles.filterText, selectedStatus === s && { color: '#fff' }]}>
              {STATUS_LABELS[s]}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filtered}
        renderItem={renderOrder}
        keyExtractor={(item) => String(item.id)}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <Text style={styles.empty}>No hay órdenes</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f3f4f6' },
  filters: {
    flexDirection: 'row', flexWrap: 'wrap', padding: 12, gap: 6,
    backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e5e7eb',
  },
  filterBtn: {
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20,
    backgroundColor: '#f3f4f6',
  },
  filterBtnActive: { backgroundColor: '#f97316' },
  filterText: { fontSize: 12, color: '#4b5563', fontWeight: '500' },
  filterTextActive: { color: '#fff' },
  list: { padding: 12, paddingBottom: 40 },
  card: {
    backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 10,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 },
  orderId: { fontSize: 18, fontWeight: '700', color: '#1f2937' },
  customer: { fontSize: 14, color: '#6b7280', marginTop: 2 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  badgeText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  details: { flexDirection: 'row', gap: 12, marginBottom: 10 },
  detail: { fontSize: 13, color: '#4b5563' },
  items: { borderTopWidth: 1, borderTopColor: '#f3f4f6', paddingTop: 8, marginBottom: 8 },
  itemText: { fontSize: 13, color: '#374151', paddingVertical: 1 },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 },
  total: { fontSize: 20, fontWeight: '700', color: '#059669' },
  actionBtn: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8 },
  actionBtnText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  empty: { textAlign: 'center', color: '#9ca3af', padding: 40, fontSize: 16 },
});
