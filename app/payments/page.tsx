'use client';

import { useState, useEffect } from 'react';
import Navigation from '../components/Navigation';
import ProtectedRoute from '../components/ProtectedRoute';
import { apiService, Payment, Debt } from '../services/api';

export default function PaymentsPage() {
  const [showForm, setShowForm] = useState(false);
  const [editingPayment, setEditingPayment] = useState<Payment | null>(null);
  const [formData, setFormData] = useState({
    debtId: '',
    amount: '',
    date: ''
  });
  const [payments, setPayments] = useState<Payment[]>([]);
  const [debts, setDebts] = useState<Debt[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [paymentsData, debtsData] = await Promise.all([
        apiService.getPayments(),
        apiService.getDebts()
      ]);
      setPayments(paymentsData);
      setDebts(debtsData);
    } catch (error) {
      console.error('Error loading data:', error);
      setError('Error al cargar los datos');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({ debtId: '', amount: '', date: '' });
    setEditingPayment(null);
    setShowForm(false);
    setError('');
  };

  const handleEdit = (payment: Payment) => {
    setEditingPayment(payment);
    setFormData({
      debtId: payment.debtId,
      amount: payment.amount.toString(),
      date: payment.date.split('T')[0], // Convertir a formato YYYY-MM-DD
    });
    setShowForm(true);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getDebtInfo = (debtId: string) => {
    return debts.find(debt => debt.id === debtId);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const paymentData = {
        debtId: formData.debtId,
        amount: Number(formData.amount),
        date: formData.date
      };

      if (editingPayment) {
        await apiService.updatePayment(editingPayment.id, paymentData);
      } else {
        await apiService.createPayment(paymentData);
      }

      await loadData(); // Recargar todos los datos
      resetForm();
    } catch (error) {
      console.error('Error saving payment:', error);
      setError(error instanceof Error ? error.message : 'Error al guardar el pago');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este pago?')) {
      return;
    }

    try {
      await apiService.deletePayment(id);
      await loadData(); // Recargar todos los datos
    } catch (error) {
      console.error('Error deleting payment:', error);
      setError('Error al eliminar el pago');
    }
  };

  const totalPayments = payments.reduce((sum, payment) => sum + payment.amount, 0);

  if (isLoading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando pagos...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        
        <div className="max-w-6xl mx-auto p-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Gestión de Pagos</h1>
            <p className="text-gray-600">Registra los pagos realizados a tus deudas</p>
          </div>

          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Resumen */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Resumen de Pagos</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-green-600">{formatCurrency(totalPayments)}</p>
                <p className="text-gray-600">Total Pagado</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-blue-600">{payments.length}</p>
                <p className="text-gray-600">Pagos Registrados</p>
              </div>
            </div>
          </div>

          {/* Botón para agregar nuevo pago */}
          <div className="mb-8">
            <button
              onClick={() => setShowForm(true)}
              disabled={debts.length === 0}
              className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 shadow-sm"
            >
              + Agregar Pago
            </button>
            {debts.length === 0 && (
              <p className="text-gray-500 text-sm mt-2">
                Necesitas tener al menos una deuda registrada para poder agregar pagos
              </p>
            )}
          </div>

          {/* Modal para agregar/editar pago */}
          {showForm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">
                    {editingPayment ? 'Editar Pago' : 'Agregar Nuevo Pago'}
                  </h3>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Deuda
                      </label>
                      <select
                        name="debtId"
                        value={formData.debtId}
                        onChange={handleChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="">Seleccionar deuda</option>
                        {debts.map(debt => (
                          <option key={debt.id} value={debt.id}>
                            Deuda de {formatCurrency(debt.remaining)} (Vence: {new Date(debt.dueDate).toLocaleDateString('es-CL')})
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Monto del Pago (CLP)
                      </label>
                      <input
                        type="number"
                        name="amount"
                        value={formData.amount}
                        onChange={handleChange}
                        required
                        min="1"
                        max={formData.debtId ? getDebtInfo(formData.debtId)?.remaining : undefined}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="50000"
                      />
                      {formData.debtId && getDebtInfo(formData.debtId) && (
                        <p className="text-sm text-gray-600 mt-1">
                          Máximo: {formatCurrency(getDebtInfo(formData.debtId)!.remaining)}
                        </p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Fecha del Pago
                      </label>
                      <input
                        type="date"
                        name="date"
                        value={formData.date}
                        onChange={handleChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    
                    <div className="flex space-x-3 pt-4">
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="flex-1 bg-indigo-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                      >
                        {isSubmitting ? 'Guardando...' : (editingPayment ? 'Actualizar' : 'Agregar')}
                      </button>
                      <button
                        type="button"
                        onClick={resetForm}
                        className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-400 transition-colors duration-200"
                      >
                        Cancelar
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}

          {/* Lista de pagos */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Historial de Pagos</h2>
            </div>
            
            {payments.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <p className="text-lg mb-2">No hay pagos registrados</p>
                <p>Comienza registrando tus pagos a las deudas</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {payments.map((payment) => {
                  const debtInfo = getDebtInfo(payment.debtId);
                  
                  return (
                    <div key={payment.id} className="p-6 hover:bg-gray-50 transition-colors duration-150">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <span className="inline-block px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">
                              Pago Realizado
                            </span>
                            <span className="text-gray-500 text-sm">
                              {new Date(payment.date).toLocaleDateString('es-CL')}
                            </span>
                          </div>
                          <h3 className="font-semibold text-gray-900 text-lg mb-1">
                            {formatCurrency(payment.amount)}
                          </h3>
                          {debtInfo && (
                            <p className="text-gray-600 text-sm">
                              Pago a deuda de {formatCurrency(debtInfo.total)} 
                              (Restante: {formatCurrency(debtInfo.remaining)})
                            </p>
                          )}
                          <p className="text-gray-500 text-xs mt-1">
                            Registrado el: {new Date(payment.createdAt).toLocaleDateString('es-CL')}
                          </p>
                        </div>
                        <div className="flex space-x-2 ml-4">
                          <button
                            onClick={() => handleEdit(payment)}
                            className="text-indigo-600 hover:text-indigo-800 text-sm font-medium transition-colors duration-200"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => handleDelete(payment.id)}
                            className="text-red-600 hover:text-red-800 text-sm font-medium transition-colors duration-200"
                          >
                            Eliminar
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}