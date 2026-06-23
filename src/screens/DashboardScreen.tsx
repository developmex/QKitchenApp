import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuthStore } from '../stores/authStore';
import { api } from '../services/api';
import type { Order } from '../types';
import { Colors, Radius, Shadows, Spacing } from '../utils/theme';
import StatusBadge from '../components/StatusBadge';

export default function DashboardScreen() {
  const user = useAuthStore((s) => s.user);
  const navigation = useNavigation<any>();
  const [orders, setOrders] = useState<Order[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({ total: 0, pending: 0, inProcess: 0, done: 0 });

  const loadData = async () => {
    try {
      const res = await api.getOrders();
      const list = res.data || res || [];
      const arr = Array.isArray(list) ? list : list?.orders || [];
      setOrders(arr);
      setStats({
        total: arr.length,
        pending: arr.filter((o: Order) => [1, 2].includes(o.status_id)).length,
        inProcess: arr.filter((o: Order) => [3, 4, 5].includes(o.status_id)).length,
        done: arr.filter((o: Order) => [6, 7, 8].includes(o.status_id)).length,
      });
    } catch (e) { console.log('Dashboard:', e); }
  };

  useEffect(() => { loadData(); }, []);

  const Stat = ({ label, value, color, icon }: any) => (
    <View style={[styles.stat, { borderLeftColor: color }]}>
      <Text style={styles.statIcon}>{icon}</Text>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );

  return (
    <ScrollView style={styles.root} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadData().then(() => setRefreshing(false)); }} />}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Buenos días,</Text>
          <Text style={styles.userName}>{user?.first_name || 'Chef'}</Text>
        </View>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {(user?.first_name || 'Q')[0].toUpperCase()}
          </Text>
        </View>
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        <Stat label="Total" value={stats.total} color={Colors.primary} icon="📋" />
        <Stat label="Pendientes" value={stats.pending} color={Colors.gold} icon="⏳" />
        <Stat label="En proceso" value={stats.inProcess} color={Colors.accent} icon="🔥" />
        <Stat label="Completadas" value={stats.done} color={Colors.success} icon="✅" />
      </View>

      {/* Orders */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Órdenes del día</Text>
        {orders.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyIcon}>📭</Text>
            <Text style={styles.emptyTitle}>Sin órdenes hoy</Text>
            <Text style={styles.emptySub}>Las órdenes aparecerán aquí cuando las crees</Text>
          </View>
        ) : (
          orders.map((order) => (
            <TouchableOpacity
              key={order.id}
              style={styles.orderCard}
              onPress={() => navigation.navigate('OrderDetail', { orderId: order.id })}
              activeOpacity={0.7}
            >
              <View style={styles.orderHeader}>
                <Text style={styles.orderId}>#{order.id}</Text>
                <StatusBadge statusId={order.status_id} />
              </View>
              <View style={styles.orderBody}>
                <View style={styles.orderInfo}>
                  <Text style={styles.orderCustomer}>{order.customer_name || 'Cliente'}</Text>
                  <Text style={styles.orderTime}>🕐 {order.delivery_time?.substring(0, 5) || '12:00'}</Text>
                  <Text style={styles.orderPeople}>👥 {order.diners_count || 0} personas</Text>
                </View>
                <Text style={styles.orderTotal}>${Number(order.total_amount || 0).toFixed(2)}</Text>
              </View>
              {order.items && order.items.length > 0 && (
                <View style={styles.itemsRow}>
                  {order.items.slice(0, 3).map((it) => (
                    <View key={it.id} style={styles.itemTag}>
                      <Text style={styles.itemTagText}>{it.portions}x {it.dish_name}</Text>
                    </View>
                  ))}
                  {order.items.length > 3 && (
                    <Text style={styles.moreItems}>+{order.items.length - 3}</Text>
                  )}
                </View>
              )}
            </TouchableOpacity>
          ))
        )}
      </View>
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.bg },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: Spacing.lg, paddingTop: 60, backgroundColor: Colors.primary,
    borderBottomLeftRadius: Radius.lg * 2, borderBottomRightRadius: Radius.lg * 2,
  },
  greeting: { fontSize: 14, color: 'rgba(255,255,255,0.8)', fontWeight: '400' },
  userName: { fontSize: 26, fontWeight: '700', color: Colors.textInverse, marginTop: 2 },
  avatar: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { fontSize: 20, fontWeight: '700', color: Colors.textInverse },

  statsRow: { flexDirection: 'row', flexWrap: 'wrap', padding: Spacing.md, gap: 8, marginTop: -20 },
  stat: {
    flex: 1, minWidth: 80, backgroundColor: Colors.surface,
    borderRadius: Radius.md, padding: 14, borderLeftWidth: 3, ...Shadows.md,
  },
  statIcon: { fontSize: 18, marginBottom: 6 },
  statValue: { fontSize: 24, fontWeight: '700' },
  statLabel: { fontSize: 11, color: Colors.textMuted, marginTop: 2, textTransform: 'uppercase', letterSpacing: 0.5 },

  section: { paddingHorizontal: Spacing.md },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: Colors.text, marginBottom: 12, marginTop: Spacing.lg },

  emptyCard: {
    backgroundColor: Colors.surface, borderRadius: Radius.lg,
    padding: Spacing.xl, alignItems: 'center', ...Shadows.sm,
  },
  emptyIcon: { fontSize: 40, marginBottom: 12 },
  emptyTitle: { fontSize: 16, fontWeight: '600', color: Colors.text, marginBottom: 4 },
  emptySub: { fontSize: 13, color: Colors.textMuted, textAlign: 'center' },

  orderCard: {
    backgroundColor: Colors.surface, borderRadius: Radius.md,
    padding: Spacing.md, marginBottom: 10, ...Shadows.sm,
  },
  orderHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  orderId: { fontSize: 18, fontWeight: '700', color: Colors.text },
  orderBody: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 10 },
  orderInfo: { flex: 1, gap: 3 },
  orderCustomer: { fontSize: 14, fontWeight: '500', color: Colors.text },
  orderTime: { fontSize: 13, color: Colors.textMuted },
  orderPeople: { fontSize: 13, color: Colors.textMuted },
  orderTotal: { fontSize: 22, fontWeight: '700', color: Colors.primaryDark },

  itemsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, paddingTop: 8, borderTopWidth: 1, borderTopColor: Colors.bgAlt },
  itemTag: {
    backgroundColor: Colors.primary + '15', borderRadius: Radius.pill,
    paddingHorizontal: 10, paddingVertical: 4,
  },
  itemTagText: { fontSize: 12, color: Colors.primaryDark, fontWeight: '500' },
  moreItems: { fontSize: 12, color: Colors.textMuted, alignSelf: 'center' },
});
