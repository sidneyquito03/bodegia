// src/services/data.ts

import { api } from "@/lib/api";

// --- TIPOS DE DATOS BASE (Añadido 'id' para consistencia) ---

export type Venta = { 
    id: string; // Añadido ID
    total: number; 
    created_at: string 
};
export type Cliente = { 
    id: string; // Añadido ID
    deuda_total: number; 
    nombre?: string 
};
export type Producto = { 
    id: string; // Añadido ID
    stock: number;
    // Opcionalmente: nombre: string; para mostrar en el consejo 
};
export type TransaccionFiado = { 
    id: string; // Añadido ID
    metodo_pago: string; 
    created_at: string 
};

// --- TIPOS DE LA LÓGICA DEL CONSEJERO ---

export type Recomendacion = {
    id: string;
    titulo: string;
    descripcion: string;
    prioridad: 'Alta' | 'Media' | 'Baja';
    categoria: 'Inventario' | 'Fiados' | 'Ventas' | 'Marketing';
};


// --- FUNCIONES DE CARGA DE DATOS (API CALLS) ---

export async function fetchVentas(desdeISO: string) {
    // Es buena práctica usar 'any' si los tipos de la API son más complejos que lo que definiste aquí
    return api<Venta[]>(`/ventas?since=${encodeURIComponent(desdeISO)}`, { method: "GET" });
}
export async function fetchClientes() {
    return api<Cliente[]>(`/clientes`, { method: "GET" });
}
export async function fetchProductos() {
    return api<Producto[]>(`/productos`, { method: "GET" });
}
export async function fetchTransaccionesFiados(desdeISO: string) {
    return api<TransaccionFiado[]>(`/fiados/transacciones?since=${encodeURIComponent(desdeISO)}`, { method: "GET" });
}


// --- FUNCIÓN DEL CONSEJERO ESTRATÉGICO (IA) ---

// Tipo del payload que recibe la IA (basado en lo que prepara el ConsejeroEstrategico.tsx)
type AIPayload = {
    ventas: number;
    totalVendido: number;
    clientesConDeuda: number;
    deudaTotal: number;
    productosStockBajo: number;
    transaccionesFiados: number;
    metodosPago: Record<string, number>;
};

/**
 * Función que llama al endpoint de IA para generar recomendaciones estratégicas.
 * Si no tienes un endpoint de IA real, esta función actuará como un mock (simulador).
 */
export async function generateStrategicRecommendations(payload: AIPayload): Promise<Recomendacion[] | null> {
    
    // --- SIMULACIÓN DE RESPUESTA DE IA ---
    // Si aún no tienes un endpoint de IA, descomenta el bloque de simulación:
    /*
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simula latencia de IA
    if (payload.productosStockBajo > 0 && payload.deudaTotal > 50) {
         return [
             { id: 'ai-1', titulo: 'Doble Peligro: Stock y Fiados', descripcion: 'Prioriza reponer el stock bajo y usa las ganancias de cobranza para financiar la reposición. ¡Acción inmediata!', prioridad: 'Alta', categoria: 'Inventario' },
             { id: 'ai-2', titulo: 'Promueve Pagos Digitales', descripcion: 'El ' + (payload.metodosPago["Efectivo"] || 0) + ' de tus transacciones fueron en efectivo. Incentiva Yape/Plin.', prioridad: 'Media', categoria: 'Marketing' }
         ];
     }
     return [];
    */
    // --- FIN SIMULACIÓN ---
    
    // Si ya tienes un endpoint de IA, usa la siguiente línea:
    // Nota: El endpoint de IA en tu backend debe existir en `/ai/recomendaciones`
    try {
        return api<Recomendacion[]>(`/ai/recomendaciones`, { 
            method: "POST", 
            body: JSON.stringify(payload) 
        });
    } catch (e) {
        console.error("Fallo al llamar al servicio de IA", e);
        return null; // Retorna null si falla, para que use el fallback.
    }
}
