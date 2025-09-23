import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-2">
            ContabilizadorApp
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            Organiza tus finanzas de manera inteligente
          </p>
          
          <div className="bg-white rounded-lg shadow-lg p-8 space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Bienvenido
              </h2>
              <p className="text-gray-600">
                Gestiona tus gastos, deudas y pagos en un solo lugar
              </p>
            </div>

            <div className="space-y-4">
              <Link
                href="/login"
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 ease-in-out"
              >
                Iniciar Sesión
              </Link>

              <Link
                href="/register"
                className="w-full flex justify-center py-3 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 ease-in-out"
              >
                Crear Cuenta Nueva
              </Link>
            </div>

            <div className="mt-8 border-t border-gray-200 pt-6">
              <p className="text-center text-sm text-gray-600 mb-4">
                Características principales:
              </p>
              <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                <div className="text-center">
                  <div className="text-2xl mb-1">💰</div>
                  <div>Gestión de Gastos</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl mb-1">💳</div>
                  <div>Control de Deudas</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl mb-1">💸</div>
                  <div>Registro de Pagos</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl mb-1">📊</div>
                  <div>Dashboard Completo</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}