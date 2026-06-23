import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, TouchableOpacity, Animated, Dimensions } from 'react-native';
import { api } from '../services/api';
import { Colors, Radius, Shadows, Spacing } from '../utils/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

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
  category?: string;
  spicy_level?: number;
}

const DISH_EMOJIS = ['🍱', '🥘', '🌮', '🐟', '🍰', '🥩', '🍕', '🍣', '🥗', '🍝'];
const DISH_COLORS = ['#E8F0E8', '#FFF5EB', '#FDE8EC', '#E8F0FE', '#F3E8F6', '#E6F3F0', '#FFF9E6', '#EEE8F4'];

export default function CustomerMenuScreen() {
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [portions, setPortions] = useState<Record<number, number>>({});

  const load = async () => {
    try {
      const res = await api.getDishes();
      const list = res.data || res || [];
      setDishes(Array.isArray(list) ? list : []);
    } catch (e) { console.log(e); }
  };
  useEffect(() => { load(); }, []);

  const getColor = (id: number) => DISH_COLORS[id % DISH_COLORS.length];
  const getEmoji = (id: number) => DISH_EMOJIS[id % DISH_EMOJIS.length];

  const toggleSelect = (id: number) => {
    if (selectedId === id) {
      setSelectedId(null);
    } else {
      setSelectedId(id);
      if (!portions[id]) setPortions(p => ({ ...p, [id]: 1 }));
    }
  };

  const updatePortions = (id: number, delta: number) => {
    setPortions(p => {
      const current = p[id] || 1;
      const next = Math.max(1, current + delta);
      return { ...p, [id]: next };
    });
  };

  const renderDish = ({ item }: { item: Dish }) => {
    const price = Number(item.price_per_portion || item.base_price || 0);
    const isSelected = selectedId === item.id;
    const bg = getColor(item.id);
    const emoji = getEmoji(item.id);
    const qty = portions[item.id] || 1;
    const total = price * qty;

    return (
      <View style={[styles.cardWrapper, isSelected && styles.cardWrapperSelected]}>
        <TouchableOpacity
          style={styles.card}
          onPress={() => toggleSelect(item.id)}
          activeOpacity={0.95}
        >
          {/* Image */}
          <View style={styles.imageContainer}>
            {item.image_url ? (
              <Animated.Image
                source={{ uri: item.image_url }}
                style={styles.dishImage}
                resizeMode="cover"
              />
            ) : (
              <View style={[styles.imageFallback, { backgroundColor: bg }]}>
                <Text style={styles.fallbackEmoji}>{emoji}</Text>
              </View>
            )}
            {/* Badges overlay */}
            <View style={styles.badgeRow}>
              {qty > 1 && (
                <View style={[styles.countBadge, { backgroundColor: Colors.primary }]}>
                  <Text style={styles.countBadgeText}>x{qty}</Text>
                </View>
              )}
              {(item as any).spicy_level && (item as any).spicy_level > 0 && (
                <View style={styles.spicyBadge}>
                  <Text style={styles.spicyBadgeText}>{'🌶️'.repeat((item as any).spicy_level || 1)}</Text>
                </View>
              )}
            </View>
          </View>

          {/* Content */}
          <View style={styles.content}>
            <View style={styles.headerRow}>
              <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
              <Text style={styles.price}>${price.toFixed(2)}</Text>
            </View>

            {item.description ? (
              <Text style={styles.desc} numberOfLines={isSelected ? undefined : 2}>
                {item.description}
              </Text>
            ) : null}

            {/* Quick info badges */}
            <View style={styles.infoRow}>
              <View style={styles.infoBadge}>
                <Text style={styles.infoText}>
                  {item.min_portions || 1}-{item.max_portions || 8} pers
                </Text>
              </View>
              <View style={styles.infoBadge}>
                <Text style={styles.infoText}>⏱ 25 min</Text>
              </View>
            </View>
          </View>
        </TouchableOpacity>

        {/* Expanded section */}
        {isSelected && (
          <View style={styles.expandedSection}>
            <View style={styles.divider} />

            {/* Portion selector */}
            <View style={styles.portionRow}>
              <Text style={styles.portionLabel}>Porciones</Text>
              <View style={styles.stepper}>
                <TouchableOpacity
                  style={[styles.stepperBtn, qty <= 1 && styles.stepperBtnDisabled]}
                  onPress={() => updatePortions(item.id, -1)}
                  disabled={qty <= 1}
                >
                  <Text style={[styles.stepperText, qty <= 1 && styles.stepperTextDisabled]}>−</Text>
                </TouchableOpacity>
                <Text style={styles.stepperValue}>{qty}</Text>
                <TouchableOpacity
                  style={styles.stepperBtn}
                  onPress={() => updatePortions(item.id, 1)}
                >
                  <Text style={styles.stepperText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Total */}
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>${total.toFixed(2)}</Text>
            </View>

            {/* Suggested addons */}
            <Text style={styles.addonTitle}>Complementos sugeridos</Text>
            <View style={styles.addonRow}>
              {['🥤 Bebida +$25', '🥗 Extra ensalada +$35', '🍨 Postre +$45'].map((a, i) => (
                <TouchableOpacity key={i} style={styles.addonChip}>
                  <Text style={styles.addonChipText}>{a}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* CTA Button */}
            <TouchableOpacity style={styles.ctaButton} activeOpacity={0.85}>
              <Text style={styles.ctaText}>Agregar al pedido — ${total.toFixed(2)}</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.root}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerLabel}>CARTA</Text>
        <View style={styles.headerRow}>
          <Text style={styles.headerTitle}>Nuestro Menú</Text>
          <View style={styles.headerBadge}>
            <Text style={styles.headerBadgeText}>{dishes.length}</Text>
          </View>
        </View>
        <Text style={styles.headerSub}>Selecciona tus platillos favoritos</Text>
      </View>

      {/* Category filters */}
      <View style={styles.filterBar}>
        {['Todos', 'Entradas', 'Platos fuertes', 'Postres'].map((cat, i) => (
          <TouchableOpacity
            key={cat}
            style={[styles.filterChip, i === 0 && styles.filterChipActive]}
          >
            <Text style={[styles.filterChipText, i === 0 && styles.filterChipTextActive]}>
              {cat}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={dishes}
        renderItem={renderDish}
        keyExtractor={i => String(i.id)}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => {
            setRefreshing(true); load().finally(() => setRefreshing(false));
          }} />
        }
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
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Platillos</Text>
              <Text style={styles.sectionCount}>{dishes.length} opciones</Text>
            </View>
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.bg },

  // Header
  header: {
    paddingTop: 50, paddingBottom: Spacing.lg, paddingHorizontal: Spacing.lg,
    backgroundColor: Colors.primary,
    borderBottomLeftRadius: 32, borderBottomRightRadius: 32,
  },
  headerLabel: {
    fontSize: 11, fontWeight: '700', color: 'rgba(255,255,255,0.5)',
    letterSpacing: 4, textTransform: 'uppercase', marginBottom: 4,
  },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  headerTitle: { fontSize: 30, fontWeight: '700', color: Colors.textInverse },
  headerBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)', width: 30, height: 30,
    borderRadius: 15, alignItems: 'center', justifyContent: 'center',
  },
  headerBadgeText: { fontSize: 14, fontWeight: '700', color: Colors.textInverse },
  headerSub: { fontSize: 14, color: 'rgba(255,255,255,0.7)', marginTop: 4 },

  // Filters
  filterBar: {
    flexDirection: 'row', paddingHorizontal: Spacing.md, paddingVertical: 12,
    gap: 8, backgroundColor: Colors.surface,
    borderBottomWidth: 1, borderBottomColor: Colors.surfaceBorder,
  },
  filterChip: {
    paddingHorizontal: 14, paddingVertical: 7, borderRadius: Radius.pill,
    backgroundColor: Colors.bgAlt,
  },
  filterChipActive: { backgroundColor: Colors.primary },
  filterChipText: { fontSize: 12, color: Colors.textMuted, fontWeight: '500' },
  filterChipTextActive: { color: Colors.textInverse, fontWeight: '600' },

  // List
  list: { paddingBottom: 50 },
  sectionHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: Spacing.md, paddingTop: Spacing.md, paddingBottom: Spacing.sm,
  },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: Colors.text },
  sectionCount: { fontSize: 13, color: Colors.textMuted },

  // Card wrapper
  cardWrapper: {
    marginHorizontal: Spacing.md, marginBottom: 12,
    backgroundColor: Colors.surface, borderRadius: Radius.lg,
    overflow: 'hidden', ...Shadows.md,
  },
  cardWrapperSelected: {
    ...Shadows.lg,
    borderWidth: 1.5, borderColor: Colors.primary + '40',
  },
  card: { overflow: 'hidden' },

  // Image
  imageContainer: { position: 'relative' },
  dishImage: { width: '100%', height: 180 },
  imageFallback: {
    width: '100%', height: 140, alignItems: 'center', justifyContent: 'center',
  },
  fallbackEmoji: { fontSize: 48 },
  badgeRow: {
    position: 'absolute', top: 10, right: 10, flexDirection: 'row', gap: 6,
  },
  countBadge: {
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: Radius.pill,
  },
  countBadgeText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  spicyBadge: {
    backgroundColor: 'rgba(0,0,0,0.4)', paddingHorizontal: 8, paddingVertical: 3,
    borderRadius: Radius.pill,
  },
  spicyBadgeText: { fontSize: 10 },

  // Content
  content: { padding: Spacing.md },
  headerRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'flex-start', marginBottom: 6,
  },
  name: { fontSize: 18, fontWeight: '700', color: Colors.text, flex: 1, marginRight: 8 },
  price: { fontSize: 20, fontWeight: '700', color: Colors.primaryDark },
  desc: { fontSize: 13.5, color: Colors.textMuted, lineHeight: 20, marginBottom: 10 },
  infoRow: { flexDirection: 'row', gap: 8 },
  infoBadge: {
    backgroundColor: Colors.bgAlt, paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: Radius.pill,
  },
  infoText: { fontSize: 11, color: Colors.textMuted, fontWeight: '500' },

  // Expanded
  expandedSection: { paddingHorizontal: Spacing.md, paddingBottom: Spacing.md },
  divider: {
    height: 1, backgroundColor: Colors.bgAlt, marginBottom: Spacing.md,
  },

  // Stepper
  portionRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: Spacing.md,
  },
  portionLabel: { fontSize: 15, fontWeight: '600', color: Colors.text },
  stepper: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  stepperBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: Colors.bgAlt, alignItems: 'center', justifyContent: 'center',
  },
  stepperBtnDisabled: { opacity: 0.3 },
  stepperText: { fontSize: 20, fontWeight: '600', color: Colors.primaryDark },
  stepperTextDisabled: { color: Colors.textLight },
  stepperValue: { fontSize: 18, fontWeight: '700', color: Colors.text, minWidth: 28, textAlign: 'center' },

  // Total
  totalRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: Spacing.md,
    paddingTop: Spacing.sm,
    borderTopWidth: 1, borderTopColor: Colors.bgAlt,
  },
  totalLabel: { fontSize: 15, fontWeight: '600', color: Colors.text },
  totalValue: { fontSize: 22, fontWeight: '700', color: Colors.primaryDark },

  // Addons
  addonTitle: { fontSize: 13, fontWeight: '600', color: Colors.textMuted, marginBottom: 8 },
  addonRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: Spacing.md },
  addonChip: {
    backgroundColor: Colors.bgAlt, paddingHorizontal: 12, paddingVertical: 7,
    borderRadius: Radius.pill, borderWidth: 1, borderColor: Colors.surfaceBorder,
  },
  addonChipText: { fontSize: 12, color: Colors.textMuted },

  // CTA
  ctaButton: {
    backgroundColor: Colors.primary, borderRadius: Radius.md,
    paddingVertical: 14, alignItems: 'center', ...Shadows.sm,
  },
  ctaText: { color: Colors.textInverse, fontSize: 15, fontWeight: '700' },

  // Empty
  empty: { alignItems: 'center', paddingVertical: 80 },
  emptyIcon: { fontSize: 48, marginBottom: 16 },
  emptyTitle: { fontSize: 18, fontWeight: '600', color: Colors.text },
  emptySub: { fontSize: 14, color: Colors.textMuted, marginTop: 4 },
});
