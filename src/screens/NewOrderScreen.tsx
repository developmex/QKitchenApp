import React, { useEffect, useState, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput,
  Alert, ActivityIndicator, Modal, FlatList,
} from 'react-native';
import { api } from '../services/api';
import { Colors, Radius, Shadows, Spacing } from '../utils/theme';

interface Dish {
  id: number; name: string; price_per_portion?: string; base_price?: number;
}

interface Customer {
  id: number; firstName?: string; first_name?: string;
  lastName?: string; last_name?: string; name?: string;
  phone?: string; email?: string; address?: string;
}

interface OrderItem {
  dishId: number | null; quantity: number; price: number;
  searchTerm: string; isConfirmed: boolean; searchResults: Dish[];
  showDropdown: boolean;
}

export default function NewOrderScreen({ navigation }: any) {
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Customer
  const [customerSearch, setCustomerSearch] = useState('');
  const [showCustomerResults, setShowCustomerResults] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isGuest, setIsGuest] = useState(false);
  const [showNewCustomerForm, setShowNewCustomerForm] = useState(false);
  const [newCustomer, setNewCustomer] = useState({ firstName: '', lastName: '', phone: '', email: '', address: '' });
  const [submittingCustomer, setSubmittingCustomer] = useState(false);

  // Order
  const [deliveryDate, setDeliveryDate] = useState('');
  const [deliveryTime, setDeliveryTime] = useState('');
  const [guestCount, setGuestCount] = useState('1');
  const [containerCount, setContainerCount] = useState('0');
  const [isPickup, setIsPickup] = useState(false);
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [paymentMethodId, setPaymentMethodId] = useState(1);
  const [deliveryCost, setDeliveryCost] = useState('0');
  const [items, setItems] = useState<OrderItem[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const [d, c] = await Promise.all([api.getDishes(), api.getCustomers()]);
        setDishes(Array.isArray(d) ? d : (d?.data || []));
        setCustomers(Array.isArray(c) ? c : (c?.data || []));
      } catch (e) { setError('Error al cargar datos'); }
      finally { setLoading(false); }
    })();
  }, []);

  const filteredCustomers = customers.filter(c => {
    if (customerSearch.length < 2) return false;
    const s = customerSearch.toLowerCase();
    const full = `${c.firstName || c.first_name || ''} ${c.lastName || c.last_name || ''}`.toLowerCase();
    return full.includes(s) || (c.email || '').toLowerCase().includes(s) || (c.phone || '').includes(s);
  });

  const selectCustomer = (c: Customer) => {
    setSelectedCustomer(c);
    const first = c.firstName || c.first_name || '';
    const last = c.lastName || c.last_name || '';
    setCustomerSearch(`${first} ${last}`.trim() || 'Cliente');
    if (c.address) setAddress(c.address);
    setShowCustomerResults(false);
    setIsGuest(false);
  };

  const setNoCustomer = () => {
    setSelectedCustomer(null);
    setCustomerSearch('');
    setIsGuest(true);
    setShowNewCustomerForm(false);
  };

  const toggleCustomerForm = () => {
    setShowNewCustomerForm(!showNewCustomerForm);
    if (!showNewCustomerForm) setIsGuest(false);
  };

  const saveNewCustomer = async () => {
    if (!newCustomer.firstName) { Alert.alert('Error', 'El nombre es requerido'); return; }
    setSubmittingCustomer(true);
    try {
      const res = await api.createCustomer({
        firstName: newCustomer.firstName,
        lastName: newCustomer.lastName,
        phone: newCustomer.phone,
        email: newCustomer.email,
        address: newCustomer.address,
      });
      const data = res.data || res;
      const c: Customer = {
        id: data.id,
        firstName: data.first_name || data.firstName || newCustomer.firstName,
        lastName: data.last_name || data.lastName || newCustomer.lastName,
        address: data.address || newCustomer.address,
      };
      selectCustomer(c);
      Alert.alert('Cliente creado', `${c.firstName} ${c.lastName}`);
      setShowNewCustomerForm(false);
      setNewCustomer({ firstName: '', lastName: '', phone: '', email: '', address: '' });
    } catch (e: any) { Alert.alert('Error', e.message || 'No se pudo crear el cliente'); }
    finally { setSubmittingCustomer(false); }
  };

  // Dishes
  const addDishRow = () => {
    setItems([...items, {
      dishId: null, quantity: 1, price: 0, searchTerm: '',
      isConfirmed: false, searchResults: [], showDropdown: false,
    }]);
  };

  const removeDish = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const onDishInput = (index: number, text: string) => {
    const updated = [...items];
    updated[index] = { ...updated[index], searchTerm: text, dishId: null, isConfirmed: false, showDropdown: true };
    if (text.length >= 1) {
      const s = text.toLowerCase();
      updated[index].searchResults = dishes.filter(d => d.name.toLowerCase().includes(s)).slice(0, 10);
    } else {
      updated[index].searchResults = [];
    }
    setItems(updated);
  };

  const selectDish = (itemIndex: number, dish: Dish) => {
    const updated = [...items];
    const price = Number(dish.price_per_portion || dish.base_price || 0);
    updated[itemIndex] = {
      ...updated[itemIndex],
      dishId: dish.id, searchTerm: dish.name, price,
      showDropdown: false,
    };
    setItems(updated);
  };

  const confirmRow = (index: number) => {
    const updated = [...items];
    if (updated[index].dishId && updated[index].quantity > 0) {
      updated[index].isConfirmed = true;
      setItems(updated);
    }
  };

  const updateQuantity = (index: number, qty: number) => {
    if (qty < 1) return;
    const updated = [...items];
    updated[index] = { ...updated[index], quantity: qty };
    setItems(updated);
  };

  // Totals
  const subtotal = items.reduce((sum, i) => sum + (i.price || 0) * (i.quantity || 0), 0);
  const shipping = Number(deliveryCost || 0);
  const total = subtotal + shipping;

  const hasUnconfirmedRows = items.some(i => !i.isConfirmed);
  const isFormValid = (selectedCustomer || isGuest) && deliveryDate && (isPickup || address) && items.length > 0;

  const missingFields = () => {
    const m: string[] = [];
    if (!selectedCustomer && !isGuest) m.push('Cliente');
    if (!deliveryDate) m.push('Fecha de entrega');
    if (!isPickup && !address) m.push('Dirección');
    if (!items.length) m.push('Platillos');
    return m;
  };

  const handleSubmit = async () => {
    if (hasUnconfirmedRows) { setError('Confirma todos los platillos antes de guardar'); return; }
    setSubmitting(true);
    setError('');
    try {
      const payload: any = {
        customerId: selectedCustomer?.id || '',
        deliveryDate, deliveryTime,
        guestCount: Number(guestCount) || 1,
        containerCount: Number(containerCount) || 0,
        isPickup, address, notes,
        paymentMethodId, deliveryCost: shipping,
        total,
        dishes: items.filter(i => i.isConfirmed && i.dishId).map(i => ({
          dishId: i.dishId, quantity: i.quantity, price: i.price,
        })),
      };
      const res = await api.createOrder(payload);
      if (res.success) {
        Alert.alert('Pedido guardado', 'El pedido se creó correctamente', [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      } else {
        setError(res.error || res.message || 'Error al guardar');
      }
    } catch (e: any) { setError(e.message || 'Error al guardar'); }
    finally { setSubmitting(false); }
  };

  if (loading) {
    return <View style={styles.centered}><ActivityIndicator size="large" color={Colors.primary} /><Text style={styles.loadingText}>Cargando...</Text></View>;
  }

  return (
    <View style={styles.root}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Customer */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Cliente</Text>
            <View style={styles.sectionHeaderBtns}>
              <TouchableOpacity onPress={setNoCustomer} style={[styles.headerBtn, !selectedCustomer && isGuest && styles.headerBtnActive]}>
                <Text style={[styles.headerBtnText, !selectedCustomer && isGuest && styles.headerBtnTextActive]}>Sin cliente</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={toggleCustomerForm} style={[styles.headerBtn, styles.headerBtnPrimary]}>
                <Text style={styles.headerBtnTextPrimary}>{showNewCustomerForm ? 'Cancelar' : '+ Nuevo'}</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* New Customer Form */}
          {showNewCustomerForm && (
            <View style={styles.newCustomerCard}>
              <TextInput style={styles.input} placeholder="Nombre *" placeholderTextColor={Colors.textMuted} value={newCustomer.firstName} onChangeText={t => setNewCustomer({ ...newCustomer, firstName: t })} />
              <TextInput style={styles.input} placeholder="Apellido" placeholderTextColor={Colors.textMuted} value={newCustomer.lastName} onChangeText={t => setNewCustomer({ ...newCustomer, lastName: t })} />
              <TextInput style={styles.input} placeholder="Teléfono" placeholderTextColor={Colors.textMuted} value={newCustomer.phone} onChangeText={t => setNewCustomer({ ...newCustomer, phone: t })} keyboardType="phone-pad" />
              <TextInput style={styles.input} placeholder="Email" placeholderTextColor={Colors.textMuted} value={newCustomer.email} onChangeText={t => setNewCustomer({ ...newCustomer, email: t })} keyboardType="email-address" />
              <TextInput style={styles.input} placeholder="Dirección" placeholderTextColor={Colors.textMuted} value={newCustomer.address} onChangeText={t => setNewCustomer({ ...newCustomer, address: t })} />
              <TouchableOpacity style={styles.saveBtn} onPress={saveNewCustomer} disabled={submittingCustomer || !newCustomer.firstName}>
                {submittingCustomer ? <ActivityIndicator color="#fff" size="small" /> : <Text style={styles.saveBtnText}>Guardar Cliente</Text>}
              </TouchableOpacity>
            </View>
          )}

          {/* Customer Search */}
          {!showNewCustomerForm && !isGuest && (
            <View style={styles.searchWrap}>
              <TextInput style={styles.input} placeholder="Buscar cliente..." placeholderTextColor={Colors.textMuted} value={customerSearch}
                onChangeText={t => { setCustomerSearch(t); setShowCustomerResults(t.length >= 2); }}
                onFocus={() => customerSearch.length >= 2 && setShowCustomerResults(true)} />
              {selectedCustomer && <Text style={styles.selectedBadge}>✓ {customerSearch}</Text>}
              {showCustomerResults && filteredCustomers.length > 0 && (
                <View style={styles.dropdown}>
                  {filteredCustomers.slice(0, 8).map(c => (
                    <TouchableOpacity key={c.id} style={styles.dropItem} onPress={() => selectCustomer(c)}>
                      <Text style={styles.dropName}>{c.firstName || c.first_name} {c.lastName || c.last_name}</Text>
                      <Text style={styles.dropSub}>{(c.phone || c.email || '').substring(0, 30)}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          )}
          {isGuest && <Text style={styles.guestLabel}>Pedido sin cliente asignado</Text>}
        </View>

        {/* Order Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Detalles del Pedido</Text>
          <View style={styles.row}>
            <View style={styles.half}>
              <Text style={styles.label}>Fecha</Text>
              <TextInput style={styles.input} placeholder="YYYY-MM-DD" placeholderTextColor={Colors.textMuted} value={deliveryDate} onChangeText={setDeliveryDate} />
            </View>
            <View style={styles.half}>
              <Text style={styles.label}>Hora</Text>
              <TextInput style={styles.input} placeholder="HH:MM" placeholderTextColor={Colors.textMuted} value={deliveryTime} onChangeText={setDeliveryTime} />
            </View>
          </View>
          <View style={styles.row}>
            <View style={styles.half}>
              <Text style={styles.label}>Comensales</Text>
              <TextInput style={styles.input} value={guestCount} onChangeText={setGuestCount} keyboardType="numeric" />
            </View>
            <View style={styles.half}>
              <Text style={styles.label}>Recipientes</Text>
              <TextInput style={styles.input} value={containerCount} onChangeText={setContainerCount} keyboardType="numeric" />
            </View>
          </View>
          <View style={styles.row}>
            <View style={styles.half}>
              <Text style={styles.label}>Método de pago</Text>
              <View style={styles.pickerWrap}>
                {['Efectivo','Cheque','Crédito','Transf.','Moneypool','Débito','PayPal','Mixto'].map((m, i) => (
                  <TouchableOpacity key={i} onPress={() => setPaymentMethodId(i+1)} style={[styles.paymentChip, paymentMethodId === i+1 && styles.paymentChipActive]}>
                    <Text style={[styles.paymentChipText, paymentMethodId === i+1 && styles.paymentChipTextActive]}>{m}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            <View style={styles.half}>
              <Text style={styles.label}>Envío ($)</Text>
              <TextInput style={styles.input} value={deliveryCost} onChangeText={setDeliveryCost} keyboardType="decimal-pad" />
            </View>
          </View>

          {/* Pickup Toggle */}
          <TouchableOpacity style={styles.toggleRow} onPress={() => setIsPickup(!isPickup)}>
            <View style={styles.toggleInfo}>
              <Text style={styles.toggleTitle}>📦 Recoger en tienda</Text>
              <Text style={styles.toggleSub}>El cliente pasa por el pedido</Text>
            </View>
            <View style={[styles.toggleSwitch, isPickup && styles.toggleSwitchOn]}>
              <View style={[styles.toggleKnob, isPickup && styles.toggleKnobOn]} />
            </View>
          </TouchableOpacity>

          <Text style={styles.label}>Dirección</Text>
          <TextInput style={styles.input} placeholder={isPickup ? 'No se requiere dirección' : 'Calle, #, Colonia, CP...'}
            placeholderTextColor={Colors.textMuted} value={address} onChangeText={setAddress} editable={!isPickup} />

          <Text style={styles.label}>Notas</Text>
          <TextInput style={[styles.input, styles.textarea]} placeholder="Indicaciones especiales..." placeholderTextColor={Colors.textMuted}
            value={notes} onChangeText={setNotes} multiline numberOfLines={3} />
        </View>

        {/* Dishes */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Platillos ({items.length})</Text>
            <TouchableOpacity onPress={addDishRow} style={styles.addDishBtn}>
              <Text style={styles.addDishBtnText}>+ Agregar</Text>
            </TouchableOpacity>
          </View>

          {items.map((item, idx) => (
            <View key={idx} style={[styles.dishCard, item.isConfirmed && styles.dishCardConfirmed]}>
              <View style={styles.dishSearchRow}>
                <View style={{ flex: 1 }}>
                  <TextInput style={styles.input} placeholder="Buscar platillo..." placeholderTextColor={Colors.textMuted}
                    value={item.searchTerm} onChangeText={t => onDishInput(idx, t)}
                    editable={!item.isConfirmed} />
                  {item.showDropdown && item.searchResults.length > 0 && (
                    <View style={styles.dropdown}>
                      {item.searchResults.map(d => (
                        <TouchableOpacity key={d.id} style={styles.dropItem} onPress={() => selectDish(idx, d)}>
                          <Text style={styles.dropName}>{d.name}</Text>
                          <Text style={styles.dropPrice}>${Number(d.price_per_portion || d.base_price || 0).toFixed(2)}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </View>
              </View>
              {(item.dishId || item.isConfirmed) && (
                <View style={styles.dishDetailRow}>
                  <View style={styles.qtyStepper}>
                    <TouchableOpacity onPress={() => updateQuantity(idx, item.quantity - 1)} disabled={item.isConfirmed} style={styles.stepperBtn}>
                      <Text style={styles.stepperText}>−</Text>
                    </TouchableOpacity>
                    <Text style={styles.stepperVal}>{item.quantity}</Text>
                    <TouchableOpacity onPress={() => updateQuantity(idx, item.quantity + 1)} disabled={item.isConfirmed} style={styles.stepperBtn}>
                      <Text style={styles.stepperText}>+</Text>
                    </TouchableOpacity>
                  </View>
                  <Text style={styles.dishRowTotal}>${(item.price * item.quantity).toFixed(2)}</Text>
                  {!item.isConfirmed ? (
                    <TouchableOpacity onPress={() => confirmRow(idx)} disabled={!item.dishId} style={[styles.confirmBtn, !item.dishId && styles.confirmBtnDisabled]}>
                      <Text style={styles.confirmBtnText}>✓</Text>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity onPress={() => { const u = [...items]; u[idx].isConfirmed = false; setItems(u); }} style={styles.editBtn}>
                      <Text style={styles.editBtnText}>✎</Text>
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity onPress={() => removeDish(idx)} style={styles.removeBtn}>
                    <Text style={styles.removeBtnText}>✕</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          ))}

          {items.length === 0 && (
            <View style={styles.emptyDishes}>
              <Text style={styles.emptyIcon}>🍽️</Text>
              <Text style={styles.emptyText}>Sin platillos. Agrega uno con el botón de arriba.</Text>
            </View>
          )}
        </View>

        {/* Total */}
        <View style={styles.totalCard}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Subtotal</Text>
            <Text style={styles.totalVal}>${subtotal.toFixed(2)}</Text>
          </View>
          {shipping > 0 && (
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Envío</Text>
              <Text style={styles.totalVal}>${shipping.toFixed(2)}</Text>
            </View>
          )}
          <View style={styles.totalRowFinal}>
            <Text style={styles.totalLabelFinal}>Total</Text>
            <Text style={styles.totalValFinal}>${total.toFixed(2)}</Text>
          </View>
        </View>

        {/* Validation Messages */}
        {!isFormValid && missingFields().length > 0 && (
          <View style={styles.validationCard}>
            <Text style={styles.validationTitle}>⚠️ Completa los campos requeridos:</Text>
            {missingFields().map((f, i) => <Text key={i} style={styles.validationItem}>• {f}</Text>)}
          </View>
        )}
        {hasUnconfirmedRows && (
          <View style={styles.infoCard}>
            <Text style={styles.infoText}>ℹ️ Confirma todos los platillos antes de guardar</Text>
          </View>
        )}
        {error ? <View style={styles.errorCard}><Text style={styles.errorText}>{error}</Text></View> : null}

        {/* Save */}
        <TouchableOpacity style={[styles.submitBtn, (!isFormValid || hasUnconfirmedRows || submitting) && styles.submitBtnDisabled]}
          onPress={handleSubmit} disabled={!isFormValid || hasUnconfirmedRows || submitting}>
          {submitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitBtnText}>Guardar Pedido</Text>}
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.bg },
  scroll: { padding: Spacing.md },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.bg },
  loadingText: { marginTop: 12, color: Colors.textMuted, fontSize: 14 },

  section: { marginBottom: Spacing.lg },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: Colors.primaryDark, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10 },
  sectionHeaderBtns: { flexDirection: 'row', gap: 8 },

  headerBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: Radius.pill, borderWidth: 1, borderColor: Colors.primary },
  headerBtnActive: { backgroundColor: Colors.primary },
  headerBtnPrimary: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  headerBtnText: { fontSize: 12, color: Colors.primary, fontWeight: '600' },
  headerBtnTextActive: { color: '#fff' },
  headerBtnTextPrimary: { fontSize: 12, color: '#fff', fontWeight: '600' },

  newCustomerCard: { backgroundColor: Colors.primary + '10', borderRadius: Radius.md, padding: Spacing.md, marginBottom: 12, borderWidth: 1, borderColor: Colors.primary + '30' },
  guestLabel: { color: Colors.textMuted, fontStyle: 'italic', fontSize: 13, marginTop: 4 },

  searchWrap: { position: 'relative' },
  selectedBadge: { color: Colors.primary, fontWeight: '600', fontSize: 13, marginTop: 4 },

  input: { backgroundColor: Colors.surface, borderRadius: Radius.sm, padding: 10, fontSize: 14, color: Colors.text, borderWidth: 1, borderColor: Colors.surfaceBorder, marginBottom: 8 },
  textarea: { minHeight: 70, textAlignVertical: 'top' },

  dropdown: { backgroundColor: Colors.surface, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.surfaceBorder, marginTop: -4, marginBottom: 8, ...Shadows.lg, maxHeight: 200 },
  dropItem: { padding: 12, borderBottomWidth: 1, borderBottomColor: Colors.bgAlt, flexDirection: 'row', justifyContent: 'space-between' },
  dropName: { fontSize: 14, fontWeight: '600', color: Colors.text, flex: 1 },
  dropSub: { fontSize: 11, color: Colors.textMuted },
  dropPrice: { fontSize: 14, fontWeight: '700', color: Colors.primaryDark },

  row: { flexDirection: 'row', gap: 10, marginBottom: 8 },
  half: { flex: 1 },
  label: { fontSize: 12, fontWeight: '600', color: Colors.textMuted, marginBottom: 4 },

  pickerWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 4 },
  paymentChip: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: Radius.pill, backgroundColor: Colors.bgAlt, borderWidth: 1, borderColor: Colors.surfaceBorder },
  paymentChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  paymentChipText: { fontSize: 11, color: Colors.textMuted },
  paymentChipTextActive: { color: '#fff', fontWeight: '600' },

  toggleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: Colors.surface, borderRadius: Radius.md, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: Colors.surfaceBorder },
  toggleInfo: { flex: 1 },
  toggleTitle: { fontSize: 14, fontWeight: '600', color: Colors.text },
  toggleSub: { fontSize: 11, color: Colors.textMuted, marginTop: 2 },
  toggleSwitch: { width: 48, height: 28, borderRadius: 14, backgroundColor: Colors.bgAlt, justifyContent: 'center', padding: 2 },
  toggleSwitchOn: { backgroundColor: Colors.primary },
  toggleKnob: { width: 24, height: 24, borderRadius: 12, backgroundColor: '#fff', alignSelf: 'flex-start' },
  toggleKnobOn: { alignSelf: 'flex-end' },

  dishCard: { backgroundColor: Colors.surface, borderRadius: Radius.md, padding: 10, marginBottom: 8, borderWidth: 1, borderColor: Colors.surfaceBorder },
  dishCardConfirmed: { borderColor: Colors.success + '50', backgroundColor: Colors.success + '08' },
  dishSearchRow: { marginBottom: 6 },
  dishDetailRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  qtyStepper: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  stepperBtn: { width: 30, height: 30, borderRadius: 15, backgroundColor: Colors.bgAlt, alignItems: 'center', justifyContent: 'center' },
  stepperText: { fontSize: 16, fontWeight: '700', color: Colors.primaryDark },
  stepperVal: { fontSize: 16, fontWeight: '700', color: Colors.text, minWidth: 24, textAlign: 'center' },
  dishRowTotal: { fontSize: 16, fontWeight: '700', color: Colors.primaryDark, flex: 1, textAlign: 'right' },
  confirmBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center' },
  confirmBtnDisabled: { opacity: 0.3 },
  confirmBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  editBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: Colors.bgAlt, alignItems: 'center', justifyContent: 'center' },
  editBtnText: { color: Colors.textMuted, fontSize: 14 },
  removeBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: Colors.danger + '15', alignItems: 'center', justifyContent: 'center' },
  removeBtnText: { color: Colors.danger, fontSize: 14, fontWeight: '700' },

  emptyDishes: { alignItems: 'center', paddingVertical: 30 },
  emptyIcon: { fontSize: 36, marginBottom: 8 },
  emptyText: { color: Colors.textMuted, fontSize: 13 },

  addDishBtn: { backgroundColor: Colors.primary + '15', paddingHorizontal: 14, paddingVertical: 8, borderRadius: Radius.pill },
  addDishBtnText: { color: Colors.primary, fontWeight: '700', fontSize: 13 },

  totalCard: { backgroundColor: Colors.surface, borderRadius: Radius.lg, padding: Spacing.md, marginBottom: Spacing.md, borderWidth: 1, borderColor: Colors.surfaceBorder, ...Shadows.sm },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 3 },
  totalLabel: { fontSize: 13, color: Colors.textMuted },
  totalVal: { fontSize: 14, fontWeight: '600', color: Colors.text },
  totalRowFinal: { flexDirection: 'row', justifyContent: 'space-between', paddingTop: 8, marginTop: 4, borderTopWidth: 1, borderTopColor: Colors.primary + '30' },
  totalLabelFinal: { fontSize: 15, fontWeight: '700', color: Colors.text },
  totalValFinal: { fontSize: 20, fontWeight: '700', color: Colors.primaryDark },

  validationCard: { backgroundColor: Colors.warning + '15', borderRadius: Radius.md, padding: 12, marginBottom: 12, borderLeftWidth: 3, borderLeftColor: Colors.warning },
  validationTitle: { fontSize: 13, fontWeight: '700', color: Colors.warning, marginBottom: 4 },
  validationItem: { fontSize: 13, color: Colors.textMuted, marginLeft: 4 },
  infoCard: { backgroundColor: Colors.info + '15', borderRadius: Radius.md, padding: 12, marginBottom: 12, borderLeftWidth: 3, borderLeftColor: Colors.info },
  infoText: { fontSize: 13, color: Colors.info, fontWeight: '500' },
  errorCard: { backgroundColor: Colors.danger + '15', borderRadius: Radius.md, padding: 12, marginBottom: 12, borderLeftWidth: 3, borderLeftColor: Colors.danger },
  errorText: { fontSize: 13, color: Colors.danger, fontWeight: '500' },

  submitBtn: { backgroundColor: Colors.primary, borderRadius: Radius.md, paddingVertical: 16, alignItems: 'center', marginTop: 8, ...Shadows.md },
  submitBtnDisabled: { opacity: 0.45 },
  submitBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },

  saveBtn: { backgroundColor: Colors.primary, borderRadius: Radius.md, paddingVertical: 12, alignItems: 'center', marginTop: 8 },
  saveBtnText: { color: '#fff', fontSize: 14, fontWeight: '700' },
});
