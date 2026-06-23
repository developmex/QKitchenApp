import { useAuthStore } from '../stores/authStore';

const BASE_URL = 'https://qkitchen.app/Q-Kitchen/QKitchenApi';

interface FetchOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: unknown;
  headers?: Record<string, string>;
}

class ApiClient {
  private getHeaders(): Record<string, string> {
    const { token, companyId } = useAuthStore.getState();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (token) headers['Authorization'] = 'Bearer ' + token;
    if (token && companyId) headers['X-Company-ID'] = String(companyId);
    return headers;
  }

  async request<T = any>(endpoint: string, options: FetchOptions = {}): Promise<T> {
    const { method = 'GET', body, headers: extraHeaders } = options;

    const fetchOptions: RequestInit = {
      method,
      headers: { ...this.getHeaders(), ...extraHeaders },
    };

    if (body && method !== 'GET') {
      fetchOptions.body = JSON.stringify(body);
    }

    const url = BASE_URL + endpoint;
    const response = await fetch(url, fetchOptions);
    const data = await response.json();

    if (data?.success === false && 
        (data.message?.includes('Invalid or expired session token') ||
         data.error?.includes('Invalid or expired session token'))) {
      useAuthStore.getState().logout();
      throw new Error('SESSION_EXPIRED');
    }

    if (!response.ok) {
      throw new Error(data?.message || data?.error || 'HTTP ' + response.status);
    }

    if (data && typeof data === 'object' && 'success' in data && !data.success) {
      throw new Error(data.message || data.error || 'Error desconocido');
    }

    return data;
  }

  async login(email: string, password: string): Promise<any> {
    return this.request('/login', { method: 'POST', body: { email, password } });
  }

  async register(data: { first_name: string; last_name: string; email: string; password: string }) {
    return this.request('/user', { method: 'POST', body: data });
  }

  async refreshToken(refreshToken: string) {
    try {
      return await this.request('/refresh-token', { method: 'POST', body: { refresh_token: refreshToken } });
    } catch {
      // API actual no procesa refresh_token en body → ignorar silenciosamente
      return { success: false };
    }
  }

  async logout() {
    const { token } = useAuthStore.getState();
    return this.request('/logout', { method: 'POST', headers: token ? { Authorization: 'Bearer ' + token } : {} });
  }

  async getDashboard() {
    return this.request<any>('/dashboard/metrics');
  }

  async getOrders(params?: { date?: string; status?: number }) {
    const qs = new URLSearchParams();
    if (params?.date) qs.set('date', params.date);
    if (params?.status) qs.set('status', String(params.status));
    const query = qs.toString();
    return this.request<any>('/order' + (query ? '?' + query : ''));
  }

  async getOrder(id: number) {
    return this.request('/order/detail?id=' + id);
  }

  async updateOrderStatus(orderId: number, statusId: number) {
    return this.request('/order', { method: 'PUT', body: { id: orderId, status_id: statusId } });
  }

  async createOrder(data: Record<string, unknown>) {
    return this.request('/order', { method: 'POST', body: data });
  }

  async getMenu() {
    return this.request('/menu');
  }

  async getDishes() {
    return this.request('/dish');
  }

  async getIngredients() {
    return this.request('/ingredient');
  }

  async getCustomers() {
    return this.request('/customer');
  }

  async getStaff() {
    return this.request('/employee');
  }
}

export const api = new ApiClient();
