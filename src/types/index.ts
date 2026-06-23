// Tipos basados en el schema real de Q-Kitchen (14 tablas)

export interface User {
  id: number;
  company_id: number;
  role_id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  address?: string;
  city?: string;
  is_active: boolean;
  language: string;
  created_at: string;
}

export interface Company {
  id: number;
  name: string;
  slug: string;
  logo_url?: string;
  rfc?: string;
  fiscal_address?: string;
  phone?: string;
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  expires_at: string;
  user: User;
  company: Company;
}

export type Role = 'customer' | 'employee' | 'director' | 'admin' | 'kitchen' | 'driver';
export type OrderStatus = 
  | 'pending_approval'
  | 'scheduled'
  | 'in_process'
  | 'delayed'
  | 'ready_for_delivery'
  | 'on_the_way'
  | 'delivered_pending_payment'
  | 'delivered_paid'
  | 'cancelled';

export interface Order {
  id: number;
  company_id: number;
  customer_id?: number;
  customer_name?: string;
  delivery_address?: string;
  delivery_date: string;
  delivery_time: string;
  diners_count: number;
  is_pickup: boolean;
  payment_method_id: number;
  delivery_cost: number;
  subtotal: number;
  tax: number;
  total_amount: number;
  notes?: string;
  status_id: number;
  status_name: string;
  is_paid: boolean;
  created_at: string;
  items?: OrderItem[];
}

export interface OrderItem {
  id: number;
  order_id: number;
  dish_id: number;
  dish_name: string;
  portions: number;
  notes?: string;
  status_id: number;
  status_name: string;
  chef_id?: number;
  container_id?: number;
}

export interface Dish {
  id: number;
  company_id: number;
  name: string;
  description?: string;
  base_price: number;
  min_portions: number;
  max_portions?: number;
  image_url?: string;
  menu_id?: number;
  is_active: boolean;
  ingredients?: RecipeIngredient[];
}

export interface RecipeIngredient {
  id: number;
  ingredient_id: number;
  ingredient_name: string;
  amount: number;
  unit_type_id: number;
  unit_abbreviation: string;
}

export interface Ingredient {
  id: number;
  company_id: number;
  name: string;
  description?: string;
  inventory_quantity: number;
  unit_type_id: number;
  unit_name: string;
  is_active: boolean;
}

export interface Menu {
  id: number;
  company_id: number;
  name: string;
  description?: string;
  start_date: string;
  end_date: string;
  start_time: string;
  end_time: string;
  is_active: boolean;
}

export interface Container {
  id: number;
  company_id: number;
  name: string;
  type: 'returnable' | 'disposable';
  total_stock: number;
  image_url?: string;
  is_active: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// Mapeo de roles para UI
export const ROLE_LABELS: Record<number, string> = {
  1: 'Cliente',
  2: 'Empleado',
  3: 'Director',
  4: 'Administrador',
  5: 'Cocina',
  6: 'Chofer',
};

export const STATUS_LABELS: Record<number, string> = {
  1: 'Pendiente',
  2: 'Programado',
  3: 'En proceso',
  4: 'Demorado',
  5: 'Listo para entrega',
  6: 'En camino',
  7: 'Entregado (pago pendiente)',
  8: 'Entregado (pagado)',
  9: 'Cancelado',
};

export const STATUS_COLORS: Record<number, string> = {
  1: '#f59e0b',
  2: '#3b82f6',
  3: '#8b5cf6',
  4: '#ef4444',
  5: '#10b981',
  6: '#06b6d4',
  7: '#f97316',
  8: '#22c55e',
  9: '#6b7280',
};
