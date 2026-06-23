import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { api } from '../services/api';
import type { Order } from '../types';
import { Colors, Radius, Shadows, Spacing, STATUS_LABELS, STATUS_COLORS } from '../utils/theme';
import StatusBadge from '../components/StatusBadge';

export default function OrderDetailScreen({ route }: any) {
  const { orderId } = route.params;
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.getOrder(orderId);
        const ord = (res.order || res.data || res) as Order;
        // API retorna items a nivel raíz, no dentro de order
        if (!ord.items && res.items) { (ord as any).items = res.items; }
        // API devuelve is_pickup como 0/1, no boolean
        if (typeof ord.is_pickup === 'number') {
          (ord as any).is_pickup = ord.is_pickup === 1;
        }
        setOrder(ord);
      } catch (e) { console.log(e); }
      finally { setLoading(false); }
    })();
  }, [orderId]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Cargando orden...</Text>
      </View>
    );
  }

  if (!order) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>No se pudo cargar la orden</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.root}>
      {/* Status header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Orden #{order.id}</Text>
        <StatusBadge statusId={order.status_id} size="md" />
      </View>

      {/* Customer info */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Cliente</Text>
        <Text style={styles.value}>{order.customer_name || 'Cliente'}</Text>
        {order.delivery_address ? <Text style={styles.muted}>📍 {order.delivery_address}</Text> : null}
      </View>

      {/* Delivery info */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Entrega</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Fecha</Text>
          <Text style={styles.value}>{order.delivery_date}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Hora</Text>
          <Text style={styles.value}>{order.delivery_time?.substring(0, 5) || '12:00'}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Comensales</Text>
          <Text style={styles.value}>{order.diners_count || 0}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Tipo</Text>
          <Text style={styles.value}>{order.is_pickup ? '📦 Recoger en tienda' : '🏠 Entrega a domicilio'}</Text>
        </View>
      </View>

      {/* Items */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Platillos ({order.items?.length || 0})</Text>
        {order.items && order.items.length > 0 ? (
          order.items.map((item, i) => (
            <View key={item.id || i} style={styles.itemRow}>
              <View style={styles.itemQtyBadge}>
                <Text style={styles.itemQty}>{item.portions}x</Text>
              </View>
              <Text style={styles.itemName}>{item.dish_name}</Text>
              {item.notes ? <Text style={styles.itemNotes}>{item.notes}</Text> : null}
            </View>
          ))
        ) : (
          <Text style={styles.muted}>Sin platillos registrados</Text>
        )}
      </View>

      {/* Financial */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Totales</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Subtotal</Text>
          <Text style={styles.value}>${Number(order.subtotal || 0).toFixed(2)}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Envío</Text>
          <Text style={styles.value}>${Number(order.delivery_cost || 0).toFixed(2)}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Impuestos</Text>
          <Text style={styles.value}>${Number(order.tax || 0).toFixed(2)}</Text>
        </View>
        <View style={[styles.row, styles.totalRow]}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>${Number(order.total_amount || 0).toFixed(2)}</Text>
        </View>
        {order.is_paid ? (
          <View style={styles.paidBadge}><Text style={styles.paidText}>✅ Pagado</Text></View>
        ) : (
          <View style={styles.unpaidBadge}><Text style={styles.unpaidText}>⚠️ Pendiente de pago</Text></View>
        )}
      </View>

      {order.notes ? (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Notas</Text>
          <Text style={styles.value}>{order.notes}</Text>
        </View>
      ) : null}

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.bg },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.bg },
  loadingText: { marginTop: 12, color: Colors.textMuted, fontSize: 14 },
  errorText: { color: Colors.danger, fontSize: 16 },

  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: Spacing.lg, paddingTop: 60,
    backgroundColor: Colors.primary,
    borderBottomLeftRadius: Radius.lg * 2, borderBottomRightRadius: Radius.lg * 2,
  },
  headerTitle: { fontSize: 22, fontWeight: '700', color: Colors.textInverse },

  card: {
    marginHorizontal: Spacing.md, marginTop: Spacing.md,
    backgroundColor: Colors.surface, borderRadius: Radius.md,
    padding: Spacing.md, ...Shadows.sm,
  },
  sectionTitle: {
    fontSize: 14, fontWeight: '700', color: Colors.primaryDark,
    textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10,
  },

  row: {
    flexDirection: 'row', justifyContent: 'space-between',
    paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: Colors.bgAlt,
  },
  label: { fontSize: 14, color: Colors.textMuted },
  value: { fontSize: 14, fontWeight: '500', color: Colors.text },
  muted: { fontSize: 13, color: Colors.textMuted, marginTop: 4 },

  itemRow: { flexDirection: 'row', alignItems: 'flex-start', paddingVertical: 8, gap: 10, borderBottomWidth: 1, borderBottomColor: Colors.bgAlt },
  itemQtyBadge: {
    backgroundColor: Colors.primary + '15', borderRadius: Radius.sm,
    paddingHorizontal: 8, paddingVertical: 3, minWidth: 40, alignItems: 'center',
  },
  itemQty: { fontSize: 13, fontWeight: '700', color: Colors.primaryDark },
  itemName: { fontSize: 14, color: Colors.text, flex: 1 },
  itemNotes: { fontSize: 12, color: Colors.textMuted, fontStyle: 'italic' },

  totalRow: { borderBottomWidth: 0, marginTop: 8, paddingTop: 8, borderTopWidth: 2, borderTopColor: Colors.primary + '30' },
  totalLabel: { fontSize: 16, fontWeight: '700', color: Colors.text },
  totalValue: { fontSize: 20, fontWeight: '700', color: Colors.primaryDark },

  paidBadge: {
    marginTop: 10, backgroundColor: Colors.success + '15',
    borderRadius: Radius.sm, padding: 8, alignItems: 'center',
  },
  paidText: { color: Colors.success, fontWeight: '600', fontSize: 13 },
  unpaidBadge: {
    marginTop: 10, backgroundColor: Colors.warning + '15',
    borderRadius: Radius.sm, padding: 8, alignItems: 'center',
  },
  unpaidText: { color: Colors.warning, fontWeight: '600', fontSize: 13 },
});
