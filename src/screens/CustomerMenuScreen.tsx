import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { api } from '../services/api';
import { Colors, Radius, Shadows, Spacing } from '../utils/theme';

interface Dish {
  id: number;
  name: string;
  description?: string;
  price_per_portion?: string;
  base_price?: number;
  image_url?: string;
}

export default function CustomerMenuScreen() {
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    try {
      const res = await api.getDishes();
      const list = res.data || res || [];
      setDishes(Array.isArray(list) ? list : []);
    } catch (e) { console.log(e); }
  };

  useEffect(() => { load(); }, []);

  const renderDish = ({ item }: { item: Dish }) => {
    const price = item.price_per_portion || String(item.base_price || '0');
    return (
      <View style={styles.card}>
        <View style={styles.cardBody}>
          <View style={styles.cardText}>
            <Text style={styles.dishName}>{item.name}</Text>
            {item.description ? <Text style={styles.dishDesc}>{item.description}</Text> : null}
          </View>
          <Text style={styles.dishPrice}>${Number(price).toFixed(2)}</Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.root}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🍽️ Menú</Text>
        <Text style={styles.headerSub}>Platillos disponibles</Text>
      </View>

      <FlatList
        data={dishes}
        renderItem={renderDish}
        keyExtractor={i => String(i.id)}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load().finally(() => setRefreshing(false)); }} />}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>🍳</Text>
            <Text style={styles.emptyTitle}>Menú no disponible</Text>
            <Text style={styles.emptySub}>El menú aparecerá aquí cuando esté listo</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.bg },
  header: {
    paddingTop: 60, paddingBottom: Spacing.lg, paddingHorizontal: Spacing.lg,
    backgroundColor: Colors.primary,
    borderBottomLeftRadius: Radius.lg * 2, borderBottomRightRadius: Radius.lg * 2,
  },
  headerTitle: { fontSize: 28, fontWeight: '700', color: Colors.textInverse },
  headerSub: { fontSize: 14, color: 'rgba(255,255,255,0.8)', marginTop: 4 },

  list: { padding: Spacing.sm, paddingBottom: 40 },
  card: {
    backgroundColor: Colors.surface, borderRadius: Radius.md,
    padding: Spacing.md, marginBottom: 8, ...Shadows.sm,
  },
  cardBody: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  cardText: { flex: 1, marginRight: Spacing.md },
  dishName: { fontSize: 16, fontWeight: '600', color: Colors.text, marginBottom: 4 },
  dishDesc: { fontSize: 13, color: Colors.textMuted, lineHeight: 18 },
  dishPrice: { fontSize: 18, fontWeight: '700', color: Colors.primaryDark },

  empty: { alignItems: 'center', paddingVertical: 60 },
  emptyIcon: { fontSize: 40, marginBottom: 12 },
  emptyTitle: { fontSize: 16, fontWeight: '600', color: Colors.text },
  emptySub: { fontSize: 13, color: Colors.textMuted },
});
