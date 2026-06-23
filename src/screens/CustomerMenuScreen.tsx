import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, TouchableOpacity, Image } from 'react-native';
import { api } from '../services/api';
import { Colors, Radius, Shadows, Spacing } from '../utils/theme';

interface Dish {
  id: number;
  name: string;
  description?: string;
  price_per_portion?: string;
  base_price?: number;
  min_portions?: number;
  max_portions?: number;
  image_url?: string;
  is_active?: number;
}

const DISH_EMOJIS = ['🥗', '🍝', '🌮', '🐟', '🍰', '🥩', '🍕', '🍣', '🥘', '🍜'];
const DISH_COLORS = ['#E8F5E9', '#FFF3E0', '#FCE4EC', '#E3F2FD', '#F3E5F5', '#E0F2F1', '#FFF8E1', '#EDE7F6'];

export default function CustomerMenuScreen() {
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const load = async () => {
    try {
      const res = await api.getDishes();
      const list = res.data || res || [];
      setDishes(Array.isArray(list) ? list : []);
    } catch (e) { console.log(e); }
  };

  useEffect(() => { load(); }, []);

  const getEmoji = (id: number) => DISH_EMOJIS[id % DISH_EMOJIS.length];
  const getColor = (id: number) => DISH_COLORS[id % DISH_COLORS.length];

  const renderDish = ({ item, index }: { item: Dish; index: number }) => {
    const price = Number(item.price_per_portion || item.base_price || 0);
    const isSelected = selectedId === item.id;
    const emoji = getEmoji(item.id);
    const bgColor = getColor(item.id);

    return (
      <TouchableOpacity
        style={[styles.card, isSelected && styles.cardSelected]}
        onPress={() => setSelectedId(isSelected ? null : item.id)}
        activeOpacity={0.9}
      >
        {/* Image placeholder */}
        <View style={[styles.imagePlaceholder, { backgroundColor: bgColor }]}>
          <Text style={styles.dishEmoji}>{emoji}</Text>
          {item.min_portions && item.min_portions > 1 ? (
            <View style={styles.minBadge}>
              <Text style={styles.minBadgeText}>x{item.min_portions} mín</Text>
            </View>
          ) : null}
        </View>

        {/* Info */}
        <View style={styles.cardContent}>
          <View style={styles.cardHeader}>
            <Text style={styles.dishName} numberOfLines={1}>{item.name}</Text>
            <Text style={styles.dishPrice}>${price.toFixed(2)}</Text>
          </View>

          {item.description ? (
            <Text style={styles.dishDesc} numberOfLines={2}>{item.description}</Text>
          ) : (
            <Text style={styles.dishDescMuted}>Porción individual</Text>
          )}

          {/* Expanded details */}
          {isSelected && (
            <View style={styles.expanded}>
              <View style={styles.divider} />
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Porciones</Text>
                <Text style={styles.detailValue}>
                  {item.min_portions || 1} - {item.max_portions || 'ilimitadas'}
                </Text>
              </View>
              <TouchableOpacity style={styles.orderBtn}>
                <Text style={styles.orderBtnText}>Agregar al pedido</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.root}>
      {/* Premium Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.headerLabel}>CARTA</Text>
            <Text style={styles.headerTitle}>Nuestro Menú</Text>
          </View>
          <View style={styles.headerBadge}>
            <Text style={styles.headerBadgeText}>{dishes.length} platos</Text>
          </View>
        </View>
        <Text style={styles.headerSub}>Selecciona tus platillos favoritos</Text>
      </View>

      {/* Category filters */}
      <View style={styles.filterBar}>
        <TouchableOpacity style={[styles.filterChip, styles.filterChipActive]}>
          <Text style={[styles.filterChipText, styles.filterChipTextActive]}>Todos</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.filterChip}>
          <Text style={styles.filterChipText}>Entradas</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.filterChip}>
          <Text style={styles.filterChipText}>Platos fuertes</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.filterChip}>
          <Text style={styles.filterChipText}>Postres</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={dishes}
        renderItem={renderDish}
        keyExtractor={i => String(i.id)}
        numColumns={1}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load().finally(() => setRefreshing(false)); }} />}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>🍳</Text>
            <Text style={styles.emptyTitle}>Menú no disponible</Text>
            <Text style={styles.emptySub}>Estamos preparando algo delicioso</Text>
          </View>
        }
        ListHeaderComponent={
          dishes.length > 0 ? (
            <Text style={styles.sectionTitle}>Platillos</Text>
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.bg },

  // ── Header ──
  header: {
    paddingTop: 50, paddingBottom: Spacing.lg, paddingHorizontal: Spacing.lg,
    backgroundColor: Colors.primary,
    borderBottomLeftRadius: 32, borderBottomRightRadius: 32,
  },
  headerTop: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: 6,
  },
  headerLabel: {
    fontSize: 11, fontWeight: '700', color: 'rgba(255,255,255,0.6)',
    letterSpacing: 3, textTransform: 'uppercase',
  },
  headerTitle: { fontSize: 30, fontWeight: '700', color: Colors.textInverse },
  headerBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 12,
    paddingVertical: 6, borderRadius: Radius.pill,
  },
  headerBadgeText: { fontSize: 13, fontWeight: '600', color: Colors.textInverse },
  headerSub: { fontSize: 14, color: 'rgba(255,255,255,0.75)', marginTop: 4 },

  // ── Filter bar ──
  filterBar: {
    flexDirection: 'row', paddingHorizontal: Spacing.md, paddingVertical: 12, gap: 8,
    backgroundColor: Colors.surface, borderBottomWidth: 1, borderBottomColor: Colors.surfaceBorder,
  },
  filterChip: {
    paddingHorizontal: 14, paddingVertical: 7, borderRadius: Radius.pill,
    backgroundColor: Colors.bgAlt, borderWidth: 1, borderColor: 'transparent',
  },
  filterChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  filterChipText: { fontSize: 12, color: Colors.textMuted, fontWeight: '500' },
  filterChipTextActive: { color: Colors.textInverse, fontWeight: '600' },

  // ── Section title ──
  sectionTitle: {
    fontSize: 16, fontWeight: '700', color: Colors.text,
    paddingHorizontal: Spacing.md, paddingTop: Spacing.md, paddingBottom: Spacing.sm,
  },

  // ── List ──
  list: { paddingBottom: 40 },

  // ── Card ──
  card: {
    flexDirection: 'row',
    backgroundColor: Colors.surface, borderRadius: Radius.md,
    marginHorizontal: Spacing.md, marginBottom: 10,
    overflow: 'hidden',
    ...Shadows.sm,
  },
  cardSelected: {
    ...Shadows.md,
    borderColor: Colors.primary + '40',
    borderWidth: 1,
  },

  // ── Image placeholder ──
  imagePlaceholder: {
    width: 110, minHeight: 110,
    alignItems: 'center', justifyContent: 'center',
  },
  dishEmoji: { fontSize: 40 },
  minBadge: {
    position: 'absolute', bottom: 8, right: 8,
    backgroundColor: 'rgba(0,0,0,0.5)', paddingHorizontal: 6, paddingVertical: 2,
    borderRadius: Radius.sm,
  },
  minBadgeText: { fontSize: 10, color: '#fff', fontWeight: '600' },

  // ── Card content ──
  cardContent: { flex: 1, padding: 14, justifyContent: 'center' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 },
  dishName: { fontSize: 16, fontWeight: '700', color: Colors.text, flex: 1, marginRight: 8 },
  dishPrice: { fontSize: 17, fontWeight: '700', color: Colors.primaryDark },
  dishDesc: { fontSize: 12, color: Colors.textMuted, lineHeight: 16, marginBottom: 2 },
  dishDescMuted: { fontSize: 12, color: Colors.textLight, fontStyle: 'italic' },

  // ── Expanded ──
  expanded: { marginTop: 8 },
  divider: {
    height: 1, backgroundColor: Colors.bgAlt, marginBottom: 10,
  },
  detailRow: {
    flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10,
  },
  detailLabel: { fontSize: 12, color: Colors.textMuted },
  detailValue: { fontSize: 12, fontWeight: '600', color: Colors.text },
  orderBtn: {
    backgroundColor: Colors.primary, borderRadius: Radius.sm,
    paddingVertical: 10, alignItems: 'center',
  },
  orderBtnText: { color: Colors.textInverse, fontSize: 13, fontWeight: '600' },

  // ── Empty ──
  empty: { alignItems: 'center', paddingVertical: 80 },
  emptyIcon: { fontSize: 48, marginBottom: 16 },
  emptyTitle: { fontSize: 18, fontWeight: '600', color: Colors.text },
  emptySub: { fontSize: 14, color: Colors.textMuted, marginTop: 4 },
});
