'use client';

import { useState, useEffect } from 'react';
import Navigation from '../components/Navigation';
import ProtectedRoute from '../components/ProtectedRoute';
import { apiService, Debt } from '../services/api';

export default function DebtsPage() {
  const [showForm, setShowForm] = useState(false);
  const [editingDebt, setEditingDebt] = useState<Debt | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    total: '',
    remaining: '',
    dueDate: ''
  });
  const [debts, setDebts] = useState<Debt[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadDebts();
  }, []);

  const loadDebts = async () => {
    try {
      setIsLoading(true);
      const data = await apiService.getDebts();
      setDebts(data);
    } catch (error) {
      console.error('Error loading debts:', error);
      setError('Error al cargar las deudas');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({ name: '', total: '', remaining: '', dueDate: '' });
    setEditingDebt(null);
    setShowForm(false);
    setError('');
  };

  const handleEdit = (debt: Debt) => {
    setEditingDebt(debt);
    setFormData({
      name: debt.name || '',
      total: debt.total.toString(),
      remaining: debt.remaining.toString(),
      dueDate: debt.dueDate.split('T')[0], // Convertir a formato YYYY-MM-DD
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

  const calculateProgress = (total: number, remaining: number) => {
    return ((total - remaining) / total) * 100;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const debtData = {
        name: formData.name,
        total: Number(formData.total),
        remaining: Number(formData.remaining),
        dueDate: formData.dueDate
      };

      if (editingDebt) {
        await apiService.updateDebt(editingDebt.id, debtData);
      } else {
        await apiService.createDebt(debtData);
      }

      await loadDebts(); // Recargar la lista
      resetForm();
    } catch (error) {
      console.error('Error saving debt:', error);
      setError(error instanceof Error ? error.message : 'Error al guardar la deuda');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta deuda?')) {
      return;
    }

    try {
      await apiService.deleteDebt(id);
      await loadDebts(); // Recargar la lista
    } catch (error) {
      console.error('Error deleting debt:', error);
      setError('Error al eliminar la deuda');
    }
  };

  const totalDebts = debts.reduce((sum, debt) => sum + debt.remaining, 0);
  const overdueDebts = debts.filter(debt => new Date(debt.dueDate) < new Date()).length;

  if (isLoading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando deudas...</p>
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
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Gestión de Deudas</h1>
            <p className="text-gray-600">Controla y administra tus deudas pendientes</p>
          </div>

          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Resumen */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Resumen de Deudas</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-red-600">{formatCurrency(totalDebts)}</p>
                <p className="text-gray-600">Total Pendiente</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-blue-600">{debts.length}</p>
                <p className="text-gray-600">Deudas Activas</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-orange-600">{overdueDebts}</p>
                <p className="text-gray-600">Deudas Vencidas</p>
              </div>
            </div>
          </div>

          {/* Botón para agregar nueva deuda */}
          <div className="mb-8">
            <button
              onClick={() => setShowForm(true)}
              className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700 transition-colors duration-200 shadow-sm"
            >
              + Agregar Deuda
            </button>
          </div>

          {/* Modal para agregar/editar deuda */}
          {showForm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">
                    {editingDebt ? 'Editar Deuda' : 'Agregar Nueva Deuda'}
                  </h3>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nombre de la deuda
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="Préstamo Banco XYZ"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Monto Total (CLP)
                      </label>
                      <input
                        type="number"
                        name="total"
                        value={formData.total}
                        onChange={handleChange}
                        required
                        min="1"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="500000"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Monto Restante (CLP)
                      </label>
                      <input
                        type="number"
                        name="remaining"
                        value={formData.remaining}
                        onChange={handleChange}
                        required
                        min="0"
                        max={formData.total}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="300000"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Fecha de Vencimiento
                      </label>
                      <input
                        type="date"
                        name="dueDate"
                        value={formData.dueDate}
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
                        {isSubmitting ? 'Guardando...' : (editingDebt ? 'Actualizar' : 'Agregar')}
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

          {/* Lista de deudas */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Listado de Deudas</h2>
            </div>
            
            {debts.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <p className="text-lg mb-2">No hay deudas registradas</p>
                <p>Agrega una deuda para comenzar a controlar tus compromisos financieros</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {debts.map((debt) => {
                  const isOverdue = new Date(debt.dueDate) < new Date();
                  const daysUntilDue = Math.ceil((new Date(debt.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                  const progress = calculateProgress(debt.total, debt.remaining);

                  return (
                    <div key={debt.id} className="p-6 hover:bg-gray-50 transition-colors duration-150">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-3">
                            {isOverdue ? (
                              <span className="inline-block px-3 py-1 bg-red-100 text-red-800 text-sm font-medium rounded-full">Vencida</span>
                            ) : daysUntilDue <= 7 ? (
                              <span className="inline-block px-3 py-1 bg-yellow-100 text-yellow-800 text-sm font-medium rounded-full">Próxima a vencer</span>
                            ) : (
                              <span className="inline-block px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">Al día</span>
                            )}

                            <div className="ml-3">
                              <h3 className="text-lg font-semibold text-gray-900">{debt.name || 'Sin nombre'}</h3>
                              <p className="text-gray-500 text-sm">
                                Vence el: {new Date(debt.dueDate).toLocaleDateString('es-CL')}
                                {!isOverdue && daysUntilDue >= 0 && (
                                  <>{' ('}{daysUntilDue === 0 ? 'Hoy' : `${daysUntilDue} día${daysUntilDue !== 1 ? 's' : ''}`}{')'}</>
                                )}
                              </p>
                            </div>
                          </div>

                          <div className="mb-3">
                            <div className="flex justify-between text-sm text-gray-600 mb-1">
                              <span>Progreso de pago</span>
                              <span>{Math.round(progress)}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div className="bg-indigo-600 h-2 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm text-gray-600">Monto Total</p>
                              <p className="text-lg font-semibold text-gray-900">{formatCurrency(debt.total)}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600">Monto Restante</p>
                              <p className="text-lg font-semibold text-red-600">{formatCurrency(debt.remaining)}</p>
                            </div>
                          </div>
                        </div>

                        <div className="flex space-x-2 ml-4">
                          <button onClick={() => handleEdit(debt)} className="text-indigo-600 hover:text-indigo-800 text-sm font-medium transition-colors duration-200">Editar</button>
                          <button onClick={() => handleDelete(debt.id)} className="text-red-600 hover:text-red-800 text-sm font-medium transition-colors duration-200">Eliminar</button>
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