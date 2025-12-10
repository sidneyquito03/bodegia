import React from 'react';
import { LayoutDashboard, Package, Users, TrendingUp, AlertCircle } from 'lucide-react';

// Un dashboard estático con ceros para simular cuenta nueva
const EmptyDashboard = () => {
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      {/* Header Simulado */}
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Panel de Control</h1>
          <p className="text-gray-500">Bienvenido a tu nueva tienda "Mi Bodega"</p>
        </div>
        <div className="bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-medium animate-pulse">
          Modo Configuración Inicial
        </div>
      </div>

      {/* Tarjetas Vacías */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500">Ventas Totales</p>
              <h3 className="text-2xl font-bold text-gray-900">S/ 0.00</h3>
            </div>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><TrendingUp size={20} /></div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500">Productos</p>
              <h3 className="text-2xl font-bold text-gray-900">0</h3>
            </div>
            <div className="p-2 bg-purple-50 text-purple-600 rounded-lg"><Package size={20} /></div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500">Clientes</p>
              <h3 className="text-2xl font-bold text-gray-900">0</h3>
            </div>
            <div className="p-2 bg-orange-50 text-orange-600 rounded-lg"><Users size={20} /></div>
          </div>
        </div>
      </div>

      {/* Mensaje de Bienvenida / Empty State */}
      <div className="bg-white rounded-2xl p-12 text-center border-2 border-dashed border-gray-200 flex flex-col items-center justify-center min-h-[400px]">
        <div className="bg-blue-50 p-6 rounded-full mb-6">
          <LayoutDashboard size={48} className="text-blue-500" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">¡Tu inventario está vacío!</h2>
        <p className="text-gray-500 max-w-md mb-8">
          Parece que acabas de registrar tu negocio. Para comenzar a usar la Inteligencia Artificial, necesitas registrar tus primeros productos o importar un excel.
        </p>
        <button className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200">
          + Agregar Primer Producto
        </button>
      </div>
    </div>
  );
};

export default EmptyDashboard;