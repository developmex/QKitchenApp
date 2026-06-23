import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { api } from '../services/api';
import { useAuthStore } from '../stores/authStore';
import type { Order } from '../types';
import { Colors, Radius, Shadows, Spacing, STATUS_LABELS, STATUS_COLORS } from '../utils/theme';
import StatusBadge from '../components/StatusBadge';

const STATUS_FLOW: Record<number, number> = {
  1: 2, 2: 3, 3: 5, 5: 6, 6: 7, 7: 8,
};

export default function OrdersScreen() {
  const role = useAuthStore((s) => s.role);
  const [orders, setOrders] = useState<Order[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<number | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await api.getOrders();
      const list = res.data || res || [];
      const raw = Array.isArray(list) ? list : list?.orders || [];
      setOrders(raw.map((o: any) => ({
        ...o,
        customer_name: o.customer || o.customer_name,
        total_amount: Number(o.total || o.total_amount || 0),
        items: typeof o.dishes === 'string'
          ? o.dishes.split(',').map((d: string, i: number) => ({ id: i, dish_name: d.trim(), portions: 1 }))
          : (o.items || []),
      })));
    } catch (e) { console.log(e); }
  }, []);

  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    if (role !== 'kitchen' && role !== 'admin' && role !== 'director') return;
    const t = setInterval(load, 30000);
    return () => clearInterval(t);
  }, [role, load]);

  const advance = (id: number, next: number) => {
    Alert.alert('Cambiar estado', `¿Marcar como "${STATUS_LABELS[next]}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Confirmar', onPress: async () => { try { await api.updateOrderStatus(id, next); load(); } catch (e: any) { Alert.alert('Error', e.message); } } },
    ]);
  };

  const visible = [1, 2, 3, 5, 6, 7, 8].filter(s => {
    if (role === 'kitchen') return [2, 3, 5].includes(s);
    if (role === 'driver') return [5, 6, 7].includes(s);
    return true;
  });

  const filtered = filter ? orders.filter(o => o.status_id === filter) : orders;

  const renderOrder = ({ item }: { item: Order }) => {
    const nextId = STATUS_FLOW[item.status_id];
    const canAdvance = nextId && (
      (role === 'kitchen' && [2, 3, 5].includes(nextId)) ||
      (role === 'driver' && [5, 6, 7].includes(nextId)) ||
      role === 'admin' || role === 'director'
    );

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View>
            <Text style={styles.orderId}>Pedido #{item.id}</Text>
            <Text style={styles.customer}>{item.customer_name || 'Cliente'}</Text>
          </View>
          <StatusBadge statusId={item.status_id} />
        </View>

        <View style={styles.meta}>
          <View style={styles.metaItem}><Text style={styles.metaIcon}>🕐</Text><Text style={styles.metaText}>{item.delivery_time?.substring(0, 5) || '12:00'}</Text></View>
          <View style={styles.metaItem}><Text style={styles.metaIcon}>👥</Text><Text style={styles.metaText}>{item.diners_count || 0}</Text></View>
          <View style={styles.metaItem}><Text style={styles.metaIcon}>{item.is_pickup ? '📦' : '🏠'}</Text><Text style={styles.metaText}>{item.is_pickup ? 'Recoger' : 'Entrega'}</Text></View>
        </View>

        {item.items && item.items.length > 0 && (
          <View style={styles.items}>
            {item.items.map(it => (
              <View key={it.id} style={styles.itemRow}>
                <Text style={styles.itemQty}>{it.portions}x</Text>
                <Text style={styles.itemName}>{it.dish_name}</Text>
              </View>
            ))}
          </View>
        )}

        <View style={styles.footer}>
          <Text style={styles.total}>${Number(item.total_amount || 0).toFixed(2)}</Text>
          {canAdvance && nextId && (
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: STATUS_COLORS[nextId] }]}
              onPress={() => advance(item.id, nextId)}
              activeOpacity={0.8}
            >
              <Text style={styles.actionText}>▶ {STATUS_LABELS[nextId]}</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.root}>
      {/* Filters */}
      <View style={styles.filterBar}>
        <TouchableOpacity
          style={[styles.filterBtn, !filter && styles.filterActive]}
          onPress={() => setFilter(null)}
        >
          <Text style={[styles.filterText, !filter && styles.filterTextActive]}>Todas</Text>
        </TouchableOpacity>
        {visible.map(s => (
          <TouchableOpacity
            key={s}
            style={[styles.filterBtn, filter === s && { backgroundColor: STATUS_COLORS[s] + '20', borderColor: STATUS_COLORS[s] }]}
            onPress={() => setFilter(filter === s ? null : s)}
          >
            <Text style={[styles.filterText, filter === s && { color: STATUS_COLORS[s], fontWeight: '700' }]}>
              {STATUS_LABELS[s]}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filtered}
        renderItem={renderOrder}
        keyExtractor={i => String(i.id)}
        refreshing={refreshing}
        onRefresh={() => { setRefreshing(true); load().then(() => setRefreshing(false)); }}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>📋</Text>
            <Text style={styles.emptyTitle}>Sin órdenes</Text>
            <Text style={styles.emptySub}>No hay órdenes con este filtro</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.bg },
  filterBar: {
    flexDirection: 'row', flexWrap: 'wrap', padding: Spacing.sm, gap: 6,
    backgroundColor: Colors.surface, borderBottomWidth: 1, borderBottomColor: Colors.surfaceBorder,
  },
  filterBtn: {
    paddingHorizontal: 12, paddingVertical: 7, borderRadius: Radius.pill,
    backgroundColor: Colors.bgAlt, borderWidth: 1, borderColor: 'transparent',
  },
  filterActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  filterText: { fontSize: 12, color: Colors.textMuted, fontWeight: '500' },
  filterTextActive: { color: Colors.textInverse, fontWeight: '600' },

  list: { padding: Spacing.sm, paddingBottom: 40 },

  card: {
    backgroundColor: Colors.surface, borderRadius: Radius.md,
    padding: Spacing.md, marginBottom: 10, ...Shadows.sm,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  orderId: { fontSize: 18, fontWeight: '700', color: Colors.text },
  customer: { fontSize: 13, color: Colors.textMuted, marginTop: 2 },

  meta: { flexDirection: 'row', gap: 16, marginBottom: 12 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaIcon: { fontSize: 13 },
  metaText: { fontSize: 13, color: Colors.textMuted },

  items: {
    borderTopWidth: 1, borderTopColor: Colors.bgAlt, paddingTop: 10, marginBottom: 12, gap: 4,
  },
  itemRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  itemQty: { fontSize: 13, fontWeight: '600', color: Colors.primaryDark, width: 28 },
  itemName: { fontSize: 13, color: Colors.text },

  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  total: { fontSize: 22, fontWeight: '700', color: Colors.primaryDark },
  actionBtn: {
    paddingHorizontal: 16, paddingVertical: 10,
    borderRadius: Radius.sm, flexDirection: 'row', alignItems: 'center', gap: 4,
  },
  actionText: { color: '#fff', fontSize: 13, fontWeight: '600' },

  empty: { alignItems: 'center', paddingVertical: 60 },
  emptyIcon: { fontSize: 40, marginBottom: 12 },
  emptyTitle: { fontSize: 16, fontWeight: '600', color: Colors.text },
  emptySub: { fontSize: 13, color: Colors.textMuted },
});
