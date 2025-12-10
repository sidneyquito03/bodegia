import React from 'react';
import { Store, ArrowRight, UserPlus, LogIn } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const Welcome = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 font-sans text-slate-800">
      
      {/* Encabezado Simple */}
      <div className="mb-8 text-center">
        <div className="inline-flex items-center justify-center p-3 bg-white rounded-xl shadow-sm mb-4 border border-gray-100">
          <Store className="text-blue-600" size={40} />
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Bodegia AI</h1>
        <p className="text-slate-500 mt-2">Plataforma de Gestión Inteligente</p>
      </div>

      {/* Tarjeta Principal */}
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-xl border border-gray-100 overflow-hidden flex flex-col md:flex-row">
        
        {/* Lado Izquierdo: Bienvenida */}
        <div className="p-10 md:w-1/2 flex flex-col justify-center border-b md:border-b-0 md:border-r border-gray-100">
          <h2 className="text-2xl font-bold mb-4 text-slate-800">Bienvenido de nuevo</h2>
          <p className="text-slate-500 mb-8 leading-relaxed">
            Optimiza tu inventario, controla tus ventas y deja que nuestra IA te ayude a tomar las mejores decisiones para tu negocio.
          </p>
          
          <div className="flex items-center gap-3 text-sm text-slate-400">
            <div className="flex -space-x-2">
              <div className="w-8 h-8 rounded-full bg-blue-100 border-2 border-white flex items-center justify-center text-xs font-bold text-blue-600">AI</div>
              <div className="w-8 h-8 rounded-full bg-green-100 border-2 border-white flex items-center justify-center text-xs font-bold text-green-600">ST</div>
            </div>
            <span>Sistema seguro y actualizado</span>
          </div>
        </div>

        {/* Lado Derecho: Acciones */}
        <div className="p-10 md:w-1/2 bg-slate-50 flex flex-col justify-center space-y-4">
          
          {/* Botón Login */}
          <button
            onClick={() => navigate("/login")}
            className="group w-full bg-white border border-gray-200 p-5 rounded-xl hover:border-blue-500 hover:shadow-md transition-all duration-200 text-left flex items-center justify-between"
          >
            <div className="flex items-center gap-4">
              <div className="p-2.5 bg-blue-50 text-blue-600 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <LogIn size={20} />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">Iniciar Sesión</h3>
                <p className="text-xs text-slate-500">Acceder a mi panel</p>
              </div>
            </div>
            <ArrowRight size={18} className="text-slate-300 group-hover:text-blue-500 transition-colors" />
          </button>

          {/* Separador sutil */}
          <div className="flex items-center gap-3 text-xs text-slate-400 my-2">
            <div className="h-px bg-slate-200 flex-1"></div>
            <span>o si eres nuevo</span>
            <div className="h-px bg-slate-200 flex-1"></div>
          </div>

          {/* Botón Registro */}
          <button
            onClick={() => navigate("/register")}
            className="group w-full bg-white border border-gray-200 p-5 rounded-xl hover:border-green-500 hover:shadow-md transition-all duration-200 text-left flex items-center justify-between"
          >
            <div className="flex items-center gap-4">
              <div className="p-2.5 bg-green-50 text-green-600 rounded-lg group-hover:bg-green-600 group-hover:text-white transition-colors">
                <UserPlus size={20} />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">Crear Cuenta</h3>
                <p className="text-xs text-slate-500">Registrar mi bodega</p>
              </div>
            </div>
            <ArrowRight size={18} className="text-slate-300 group-hover:text-green-500 transition-colors" />
          </button>

        </div>
      </div>

      <div className="mt-8 text-center text-xs text-slate-400">
        © 2025 Bodegia System. v1.0.0
      </div>
    </div>
  );
};