import { Card } from "./ui/card";
import { 
  ShirtIcon, 
  ShoppingBag, 
  Sparkles, 
  ShoppingCart, 
  Laptop, 
  Home, 
  Wrench, 
  PawPrint,
  Palette,
  Droplets,
  BookOpen,
  Wine,
  Package
} from "lucide-react";

export interface Clasificacion {
  id: string;
  nombre: string;
  Icon: any;
  color: string;
  categorias: string[];
}

export const CLASIFICACIONES: Clasificacion[] = [
  {
    id: "ropa",
    nombre: "Ropa",
    Icon: ShirtIcon,
    color: "bg-rose-300 hover:bg-rose-400",
    categorias: ["ropa", "vestuario", "prendas"]
  },
  {
    id: "calzado",
    nombre: "Calzado",
    Icon: ShoppingBag,
    color: "bg-blue-400 hover:bg-blue-500",
    categorias: ["calzado", "zapatos"]
  },
  {
    id: "limpieza",
    nombre: "Limpieza",
    Icon: Sparkles,
    color: "bg-emerald-400 hover:bg-emerald-500",
    categorias: ["limpieza", "productos de limpieza"]
  },
  {
    id: "abarrotes",
    nombre: "Abarrotes",
    Icon: ShoppingCart,
    color: "bg-amber-400 hover:bg-amber-500",
    categorias: ["lacteos", "cereales", "enlatados", "bebidas", "snacks", "condimentos"]
  },
  {
    id: "tecnologia",
    nombre: "Tecnología",
    Icon: Laptop,
    color: "bg-indigo-400 hover:bg-indigo-500",
    categorias: ["tecnologia", "electronica", "gadgets"]
  },
  {
    id: "hogar",
    nombre: "Hogar",
    Icon: Home,
    color: "bg-teal-400 hover:bg-teal-500",
    categorias: ["hogar", "decoracion", "muebles"]
  },
  {
    id: "herramientas",
    nombre: "Herramientas",
    Icon: Wrench,
    color: "bg-slate-400 hover:bg-slate-500",
    categorias: ["herramientas", "ferreteria"]
  },
  {
    id: "mascotas",
    nombre: "Mascotas",
    Icon: PawPrint,
    color: "bg-orange-300 hover:bg-orange-400",
    categorias: ["mascotas", "animales", "petshop"]
  },
  {
    id: "belleza",
    nombre: "Belleza",
    Icon: Palette,
    color: "bg-pink-400 hover:bg-pink-500",
    categorias: ["belleza", "cosmeticos", "maquillaje"]
  },
  {
    id: "aseo_personal",
    nombre: "Aseo Personal",
    Icon: Droplets,
    color: "bg-cyan-400 hover:bg-cyan-500",
    categorias: ["aseo", "higiene", "cuidado personal"]
  },
  {
    id: "libreria",
    nombre: "Librería",
    Icon: BookOpen,
    color: "bg-violet-400 hover:bg-violet-500",
    categorias: ["libreria", "papeleria", "libros"]
  },
  {
    id: "licores",
    nombre: "Licores",
    Icon: Wine,
    color: "bg-red-600 hover:bg-red-700",
    categorias: ["licores", "bebidas alcoholicas", "vinos"]
  }
];

interface ClasificacionesInventarioProps {
  clasificacionActiva: string;
  onSeleccionar: (id: string) => void;
}

export const ClasificacionesInventario = ({ 
  clasificacionActiva, 
  onSeleccionar 
}: ClasificacionesInventarioProps) => {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-700">Clasificaciones</h3>
        {clasificacionActiva && (
          <button
            onClick={() => onSeleccionar("")}
            className="text-xs text-teal-600 hover:text-teal-700 font-medium"
          >
            Ver todos
          </button>
        )}
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-12 gap-2">
        {CLASIFICACIONES.map((clf) => {
          const Icon = clf.Icon;
          const isActive = clasificacionActiva === clf.id;
          
          return (
            <button
              key={clf.id}
              onClick={() => onSeleccionar(clf.id)}
              className={`
                flex flex-col items-center justify-center p-3 rounded-lg
                transition-all duration-200 
                ${isActive 
                  ? `${clf.color} text-white shadow-lg scale-105 ring-2 ring-offset-2 ring-gray-300` 
                  : 'bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 hover:border-gray-300 hover:shadow'
                }
              `}
            >
              <Icon className={`h-5 w-5 mb-1 ${isActive ? 'text-white' : 'text-gray-600'}`} />
              <span className="text-[10px] font-medium text-center leading-tight">
                {clf.nombre}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export interface CampoConfig {
  nombre: string;
  obligatorio: boolean;
  tipo: 'text' | 'number' | 'date' | 'select' | 'textarea';
  placeholder?: string;
  opciones?: string[];
}

export interface ConfiguracionClasificacion {
  requiereFechaVencimiento: boolean;
  camposObligatorios: CampoConfig[];
  camposOpcionales: CampoConfig[];
}

export function obtenerClasificacionPorCategoria(categoria: string): Clasificacion | null {
  const categoriaLower = categoria.toLowerCase();
  return CLASIFICACIONES.find(c => 
    c.categorias.some(cat => categoriaLower.includes(cat) || cat.includes(categoriaLower))
  ) || null;
}

export function obtenerCamposPersonalizados(clasificacionId: string): ConfiguracionClasificacion {
  switch (clasificacionId) {
    case "ropa":
    case "calzado":
      return {
        requiereFechaVencimiento: false,
        camposObligatorios: [
          { nombre: "talla", obligatorio: true, tipo: "text", placeholder: "Ej: S, M, L, XL, 38, 40" },
          { nombre: "color", obligatorio: true, tipo: "text", placeholder: "Ej: Rojo, Azul, Negro" },
          { nombre: "genero", obligatorio: true, tipo: "select", opciones: ["Hombre", "Mujer", "Unisex", "Niño", "Niña"] },
          { nombre: "tipo_tela", obligatorio: true, tipo: "text", placeholder: "Ej: Algodón, Poliéster, Jean, Cuero" }
        ],
        camposOpcionales: [
          { nombre: "garantia_dias", obligatorio: false, tipo: "number", placeholder: "Ej: 30, 90" }
        ]
      };
    
    case "limpieza":
    case "abarrotes":
      return {
        requiereFechaVencimiento: true,
        camposObligatorios: [
          { nombre: "volumen_peso_neto", obligatorio: true, tipo: "text", placeholder: "Ej: 500ml, 1L, 250g, 1kg" }
        ],
        camposOpcionales: []
      };
    
    case "tecnologia":
      return {
        requiereFechaVencimiento: false,
        camposObligatorios: [
          { nombre: "garantia_dias", obligatorio: true, tipo: "number", placeholder: "Ej: 365, 730" }
        ],
        camposOpcionales: [
          { nombre: "detalles_clave", obligatorio: false, tipo: "textarea", placeholder: "Características principales del producto" }
        ]
      };
    
    case "hogar":
      return {
        requiereFechaVencimiento: false,
        camposObligatorios: [],
        camposOpcionales: [
          { nombre: "alto_cm", obligatorio: false, tipo: "number", placeholder: "Alto en cm" },
          { nombre: "ancho_cm", obligatorio: false, tipo: "number", placeholder: "Ancho en cm" },
          { nombre: "profundo_cm", obligatorio: false, tipo: "number", placeholder: "Profundidad en cm" },
          { nombre: "material", obligatorio: false, tipo: "text", placeholder: "Ej: Madera, Plástico, Metal" }
        ]
      };
    
    case "herramientas":
      return {
        requiereFechaVencimiento: false,
        camposObligatorios: [],
        camposOpcionales: [
          { nombre: "material", obligatorio: false, tipo: "text", placeholder: "Ej: Acero, Aluminio" },
          { nombre: "garantia_dias", obligatorio: false, tipo: "number", placeholder: "Días de garantía" },
          { nombre: "especificacion_electrica", obligatorio: false, tipo: "text", placeholder: "Ej: 220V 1500W" }
        ]
      };
    
    case "mascotas":
      return {
        requiereFechaVencimiento: true,
        camposObligatorios: [
          { nombre: "volumen_peso_neto", obligatorio: true, tipo: "text", placeholder: "Ej: 500g, 1kg, 2L" },
          { nombre: "tipo_mascota", obligatorio: true, tipo: "select", opciones: ["Perro", "Gato", "Ave", "Roedor", "Pez", "Reptil", "Otro"] }
        ],
        camposOpcionales: [
          { nombre: "color", obligatorio: false, tipo: "text", placeholder: "Solo para accesorios" }
        ]
      };
    
    case "belleza":
    case "aseo_personal":
      return {
        requiereFechaVencimiento: true,
        camposObligatorios: [
          { nombre: "volumen_peso_neto", obligatorio: true, tipo: "text", placeholder: "Ej: 100ml, 250g" },
          { nombre: "tono_aroma", obligatorio: true, tipo: "text", placeholder: "Ej: Lavanda, Neutro, Rosa" }
        ],
        camposOpcionales: [
          { nombre: "tipo_piel_cabello", obligatorio: false, tipo: "text", placeholder: "Ej: Piel grasa, Cabello seco" },
          { nombre: "color", obligatorio: false, tipo: "text", placeholder: "Para ítems visuales" }
        ]
      };
    
    case "libreria":
      return {
        requiereFechaVencimiento: false,
        camposObligatorios: [
          { nombre: "autor", obligatorio: true, tipo: "text", placeholder: "Nombre del autor" },
          { nombre: "editorial", obligatorio: true, tipo: "text", placeholder: "Nombre de la editorial" }
        ],
        camposOpcionales: [
          { nombre: "isbn_ean", obligatorio: false, tipo: "text", placeholder: "ISBN o EAN" },
          { nombre: "formato_libro", obligatorio: false, tipo: "select", opciones: ["Tapa Dura", "Tapa Blanda", "Digital", "Espiral"] },
          { nombre: "numero_paginas", obligatorio: false, tipo: "number", placeholder: "Número de páginas" }
        ]
      };
    
    case "licores":
      return {
        requiereFechaVencimiento: true,
        camposObligatorios: [
          { nombre: "volumen_peso_neto", obligatorio: true, tipo: "text", placeholder: "Ej: 750ml, 1L" }
        ],
        camposOpcionales: []
      };
    
    default:
      return {
        requiereFechaVencimiento: false,
        camposObligatorios: [],
        camposOpcionales: []
      };
  }
}
