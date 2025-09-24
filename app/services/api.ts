// Configuración de la API
const API_BASE_URL = 'http://localhost:3001';

// Tipos para las respuestas paginadas
interface PaginatedResponse<T> {
  data?: T[];
  expenses?: T[];
  debts?: T[];
  payments?: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  salary: number;
  firstName?: string;
  lastName?: string;
}

export interface AuthResponse {
  access_token: string;
  user: {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
    salary: number;
    createdAt: string;
    updatedAt: string;
  };
}

export interface Expense {
  id: string;
  category: string;
  amount: number;
  date: string;
  description?: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Debt {
  id: string;
  name?: string;
  total: number;
  remaining: number;
  dueDate: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Payment {
  id: string;
  debtId: string;
  amount: number;
  date: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  firstName?: string;
  lastName?: string;
  email: string;
  salary: number;
  createdAt: string;
  updatedAt: string;
}

class ApiService {
  private baseURL = API_BASE_URL;

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = this.getToken();
    
    const config: RequestInit = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
    };

    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, config);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Error response data:', errorData);
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Manejo de tokens
  private getToken(): string | null {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('access_token');
      return token;
    }
    return null;
  }

  private setToken(token: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('access_token', token);
    }
  }

  private removeToken(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
    }
  }

  // Métodos de autenticación
  async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });

    this.setToken(response.access_token);
    if (typeof window !== 'undefined') {
      localStorage.setItem('user', JSON.stringify(response.user));
    }

    return response;
  }

  async register(data: RegisterRequest): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });

    this.setToken(response.access_token);
    if (typeof window !== 'undefined') {
      localStorage.setItem('user', JSON.stringify(response.user));
    }

    return response;
  }

  logout(): void {
    this.removeToken();
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  getCurrentUserFromStorage(): User | null {
    if (typeof window !== 'undefined') {
      const userData = localStorage.getItem('user');
      return userData ? JSON.parse(userData) : null;
    }
    return null;
  }

  // Métodos para gastos
  async getExpenses(): Promise<Expense[]> {
    const response = await this.request<PaginatedResponse<Expense>>('/expenses');
    return response.expenses || [];
  }

  async createExpense(data: Omit<Expense, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<Expense> {
    return this.request<Expense>('/expenses', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateExpense(id: string, data: Partial<Expense>): Promise<Expense> {
    return this.request<Expense>(`/expenses/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteExpense(id: string): Promise<void> {
    return this.request<void>(`/expenses/${id}`, {
      method: 'DELETE',
    });
  }

  // Métodos para deudas
  async getDebts(): Promise<Debt[]> {
    const response = await this.request<PaginatedResponse<Debt>>('/debts');
    return response.debts || [];
  }

  async createDebt(data: Omit<Debt, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<Debt> {
    return this.request<Debt>('/debts', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateDebt(id: string, data: Partial<Debt>): Promise<Debt> {
    return this.request<Debt>(`/debts/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteDebt(id: string): Promise<void> {
    return this.request<void>(`/debts/${id}`, {
      method: 'DELETE',
    });
  }

  // Métodos para pagos
  async getPayments(): Promise<Payment[]> {
    const response = await this.request<PaginatedResponse<Payment>>('/payments');
    return response.payments || [];
  }

  async createPayment(data: Omit<Payment, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<Payment> {
    return this.request<Payment>('/payments', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updatePayment(id: string, data: Partial<Payment>): Promise<Payment> {
    return this.request<Payment>(`/payments/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deletePayment(id: string): Promise<void> {
    return this.request<void>(`/payments/${id}`, {
      method: 'DELETE',
    });
  }

  // Métodos para usuario
  async getCurrentUser(): Promise<User> {
    return this.request<User>('/users/profile');
  }

  async getProfile(): Promise<User> {
    return this.request<User>('/users/profile');
  }

  async updateUser(data: Partial<User>): Promise<User> {
    return this.request<User>('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async updateProfile(data: Partial<User>): Promise<User> {
    return this.updateUser(data);
  }
}

export const apiService = new ApiService();