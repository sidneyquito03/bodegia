// src/services/configuracion.ts

// --- TIPOS DE DATOS ---

export interface NegocioConfig {
    nombre: string;
    direccion: string;
    telefono: string;
    ruc: string;
}

export interface CuentaConfig {
    nombreCompleto: string;
    email: string;
    celular: string;
}

// --- ESTADO INICIAL SIMULADO (Como si fuera tu base de datos) ---

let initialNegocioData: NegocioConfig = {
    nombre: "Bodega San José",
    direccion: "Av. Los Pinos 456, Lima",
    telefono: "987 654 321",
    ruc: "20123456789",
};

let initialCuentaData: CuentaConfig = {
    nombreCompleto: "Juan Pérez García",
    email: "juan@ejemplo.com",
    celular: "987 654 321",
};

let currentCategorias: string[] = ["Bebidas", "Panadería", "Lácteos", "Abarrotes", "Limpieza", "Snacks"];


// --- FUNCIONES DE SIMULACIÓN DE API ---

/** Simula la carga inicial de todos los datos de configuración. */
export const getConfigData = async (): Promise<{ negocio: NegocioConfig, cuenta: CuentaConfig, categorias: string[] }> => {
    await new Promise(resolve => setTimeout(resolve, 500)); // Simula latencia
    return {
        negocio: initialNegocioData,
        cuenta: initialCuentaData,
        categorias: currentCategorias.slice(),
    };
};

/** Simula el guardado de la configuración del Negocio. */
export const saveNegocioConfig = async (data: NegocioConfig): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 800));
    // Actualiza los datos simulados:
    initialNegocioData = { ...data };
    console.log("Configuración de Negocio guardada:", initialNegocioData);
    return;
};

/** Simula el guardado de la configuración de la Cuenta. */
export const saveCuentaConfig = async (data: CuentaConfig): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 800));
    // Actualiza los datos simulados:
    initialCuentaData = { ...data };
    console.log("Configuración de Cuenta guardada:", initialCuentaData);
    return;
};

/** Simula la actualización de la lista de Categorías. */
export const updateCategorias = async (newCategories: string[]): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    currentCategorias = newCategories;
    console.log("Categorías actualizadas:", currentCategorias);
    return;
};