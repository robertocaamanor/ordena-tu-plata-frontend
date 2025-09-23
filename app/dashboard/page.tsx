'use client';

import { useEffect, useState } from 'react';
import Navigation from '../components/Navigation';
import ProtectedRoute from '../components/ProtectedRoute';
import { useAuth } from '../contexts/AuthContext';
import { apiService, Expense, Debt, Payment } from '../services/api';

export default function DashboardPage() {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [debts, setDebts] = useState<Debt[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setIsLoading(true);
        
        const [expensesData, debtsData, paymentsData] = await Promise.all([
          apiService.getExpenses(),
          apiService.getDebts(),
          apiService.getPayments()
        ]);

        console.log('Dashboard data loaded successfully:', {
          expenses: expensesData.length,
          debts: debtsData.length,
          payments: paymentsData.length
        });

        setExpenses(expensesData);
        setDebts(debtsData);
        setPayments(paymentsData);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
        setError('Error al cargar los datos del dashboard');
        // En caso de error, asegurar que sean arrays vacíos
        setExpenses([]);
        setDebts([]);
        setPayments([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  // Calcular estadísticas reales
  const stats = {
    totalExpenses: expenses.reduce((sum, expense) => sum + (expense.amount || 0), 0),
    totalDebts: debts.reduce((sum, debt) => sum + (debt.remaining || 0), 0),
    monthlyBudget: user?.salary || 0,
    totalPaid: payments.reduce((sum, payment) => sum + (payment.amount || 0), 0)
  };

  const remainingBudget = stats.monthlyBudget - stats.totalExpenses;

  // Gastos recientes (últimos 5)
  const recentExpenses = expenses
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  // Deudas próximas a vencer
  const upcomingDebts = debts
    .filter(debt => debt.remaining > 0)
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, 3);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0
    }).format(amount);
  };

  if (isLoading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando dashboard...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="mt-2 text-gray-600">Resumen de tu situación financiera</p>
            {error && (
              <div className="mt-4 bg-red-50 border border-red-200 rounded-md p-4">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                    <span className="text-red-600 text-sm">💰</span>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Gastos del Mes</p>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalExpenses)}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                    <span className="text-orange-600 text-sm">💳</span>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Deudas Totales</p>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalDebts)}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 text-sm">📊</span>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Presupuesto Mensual</p>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.monthlyBudget)}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-green-600 text-sm">💚</span>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Presupuesto Restante</p>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(remainingBudget)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Recent Expenses */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Gastos Recientes</h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {recentExpenses.length === 0 ? (
                    <p className="text-center text-gray-500 py-4">No hay gastos registrados</p>
                  ) : (
                    recentExpenses.map((expense) => (
                      <div key={expense.id} className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{expense.category}</p>
                          <p className="text-sm text-gray-600">{expense.description || 'Sin descripción'}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(expense.date).toLocaleDateString('es-CL')}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-red-600">-{formatCurrency(expense.amount)}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                <div className="mt-6">
                  <a href="/expenses" className="text-indigo-600 hover:text-indigo-500 text-sm font-medium">
                    Ver todos los gastos →
                  </a>
                </div>
              </div>
            </div>

            {/* Upcoming Debts */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Deudas Próximas a Vencer</h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {upcomingDebts.length === 0 ? (
                    <p className="text-center text-gray-500 py-4">No hay deudas pendientes</p>
                  ) : (
                    upcomingDebts.map((debt) => (
                      <div key={debt.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium text-gray-900">Deuda #{debt.id.slice(-6)}</span>
                          <span className="text-xs text-gray-500">
                            Vence: {new Date(debt.dueDate).toLocaleDateString('es-CL')}
                          </span>
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm text-gray-600">
                            Total: {formatCurrency(debt.total)}
                          </p>
                          <p className="text-sm text-orange-600">
                            Restante: {formatCurrency(debt.remaining)}
                          </p>
                        </div>
                        <div className="mt-2">
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-orange-600 h-2 rounded-full" 
                              style={{ width: `${((debt.total - debt.remaining) / debt.total) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                <div className="mt-6">
                  <a href="/debts" className="text-indigo-600 hover:text-indigo-500 text-sm font-medium">
                    Ver todas las deudas →
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}