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
  chef_id?: number;
  container_id?: number;
}

export interface Dish {
  id: number;
  company_id: number;
  name: string;
  description?: string;
  base_price: number;
  // API usa price_per_portion, normalizar en el adapter
  price_per_portion?: string;
  min_portions: number;
  max_portions?: number;
  image_url?: string;
  menu_id?: number;
  is_active: boolean;
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
