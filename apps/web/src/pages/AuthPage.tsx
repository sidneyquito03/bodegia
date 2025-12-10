import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Store, Mail, Lock, ArrowRight, Loader2, ArrowLeft } from 'lucide-react';

interface AuthPageProps {
  type: 'login' | 'register';
}

export const AuthPage = ({ type }: AuthPageProps) => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const isLogin = type === 'login';
  const title = isLogin ? 'Ingresar al Sistema' : 'Registro de Bodega';
  const subtitle = isLogin ? 'Introduce tus credenciales' : 'Datos del nuevo negocio';
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulación de carga
    setTimeout(() => {
      if (isLogin) {
        navigate("/dashboard"); // Login -> Sistema Real
      } else {
        navigate("/new-store"); // Registro -> Tienda Vacía
      }
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      
      {/* Botón Volver (Flotante o arriba) */}
      <div className="w-full max-w-md mb-6">
        <button 
          onClick={() => navigate("/")}
          className="flex items-center text-sm text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft size={16} className="mr-1" /> Volver al inicio
        </button>
      </div>

      <div className="bg-white w-full max-w-md rounded-xl shadow-lg border border-gray-100 p-8">
        
        {/* Cabecera del Formulario */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-50 text-blue-600 rounded-lg mb-4">
            <Store size={24} />
          </div>
          <h2 className="text-2xl font-bold text-slate-900">{title}</h2>
          <p className="text-slate-500 text-sm mt-1">{subtitle}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          
          {/* Campo Nombre (Solo registro) */}
          {!isLogin && (
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">Nombre del Negocio</label>
              <input
                required
                type="text"
                placeholder="Ej. Minimarket Don Lucho"
                className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm placeholder:text-gray-400"
              />
            </div>
          )}

          {/* Campo Email */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">Correo Electrónico</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3 text-gray-400" size={18} />
              <input
                required
                type="email"
                placeholder="correo@ejemplo.com"
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm"
              />
            </div>
          </div>

          {/* Campo Password */}
          <div className="space-y-1.5">
            <div className="flex justify-between">
              <label className="text-sm font-medium text-slate-700">Contraseña</label>
              {isLogin && (
                <a href="#" className="text-xs text-blue-600 hover:underline">¿Olvidaste tu contraseña?</a>
              )}
            </div>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3 text-gray-400" size={18} />
              <input
                required
                type="password"
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm"
              />
            </div>
          </div>

          {/* Botón Principal */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-70 disabled:cursor-not-allowed mt-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="animate-spin" size={18} /> Verificando...
              </>
            ) : (
              <>
                {isLogin ? 'Ingresar' : 'Registrar Negocio'} <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        {/* Footer del Formulario */}
        <div className="mt-6 text-center text-sm text-slate-500">
          {isLogin ? (
            <p>
              ¿No tienes cuenta?{' '}
              <button onClick={() => navigate("/register")} className="text-blue-600 font-medium hover:underline">
                Regístrate aquí
              </button>
            </p>
          ) : (
            <p>
              ¿Ya tienes cuenta?{' '}
              <button onClick={() => navigate("/login")} className="text-blue-600 font-medium hover:underline">
                Inicia sesión
              </button>
            </p>
          )}
        </div>

      </div>
    </div>
  );
};