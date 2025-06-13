// src/hooks/useTransacciones.ts
import { useState, useCallback } from 'react';
import { 
    Transaccion, 
    FiltrosTransaccion, 
    PaginacionResponse, 
    EstadisticasTransacciones,
    TransaccionesResponse,
    ResumenCategoriaResponse,
    TransaccionesRecientesResponse
} from '../types/transacciones.types';

interface UseTransaccionesReturn {
    // Estados
    transacciones: Transaccion[];
    loading: boolean;
    error: string | null;
    pagination: PaginacionResponse;
    estadisticas: EstadisticasTransacciones;
    
    // Funciones
    buscarTransacciones: (filtros: Partial<FiltrosTransaccion>, page?: number, limit?: number) => Promise<void>;
    obtenerResumenPorCategoria: (filtros?: Partial<FiltrosTransaccion>) => Promise<any[]>;
    obtenerTransaccionesRecientes: (limit?: number) => Promise<any[]>;
    limpiarError: () => void;
}

export const useTransacciones = (): UseTransaccionesReturn => {
    const [transacciones, setTransacciones] = useState<Transaccion[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [pagination, setPagination] = useState<PaginacionResponse>({
        currentPage: 1,
        totalPages: 1,
        totalRecords: 0,
        limit: 10,
        hasNext: false,
        hasPrev: false
    });
    const [estadisticas, setEstadisticas] = useState<EstadisticasTransacciones>({
        totalTransacciones: 0,
        totalIngresos: 0,
        totalGastos: 0,
        balance: 0
    });

    const buscarTransacciones = useCallback(async (
        filtros: Partial<FiltrosTransaccion>, 
        page: number = 1, 
        limit: number = 10
    ) => {
        try {
            setLoading(true);
            setError(null);
            
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('No se encontró token de autenticación');
            }

            // Construir parámetros de consulta
            const params = new URLSearchParams({
                page: page.toString(),
                limit: limit.toString(),
                ...Object.fromEntries(
                    Object.entries(filtros).filter(([_, value]) => value !== '' && value !== undefined)
                )
            });

            const response = await fetch(`http://localhost:8000/transacciones/filtros?${params}`, {
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`Error HTTP: ${response.status}`);
            }

            const data: TransaccionesResponse = await response.json();

            if (data.success) {
                setTransacciones(data.data.transacciones);
                setPagination(data.data.pagination);
                setEstadisticas(data.data.estadisticas);
            } else {
                throw new Error(data.message || 'Error al cargar transacciones');
            }

        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
            setError(errorMessage);
            console.error('Error en buscarTransacciones:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    const obtenerResumenPorCategoria = useCallback(async (
        filtros: Partial<FiltrosTransaccion> = {}
    ) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('No se encontró token de autenticación');
            }

            const params = new URLSearchParams(
                Object.fromEntries(
                    Object.entries(filtros).filter(([_, value]) => value !== '' && value !== undefined)
                )
            );

            const response = await fetch(`http://localhost:8000/transacciones/resumen-categoria?${params}`, {
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`Error HTTP: ${response.status}`);
            }

            const data: ResumenCategoriaResponse = await response.json();

            if (data.success) {
                return data.data;
            } else {
                throw new Error(data.message || 'Error al cargar resumen por categoría');
            }

        } catch (err) {
            console.error('Error en obtenerResumenPorCategoria:', err);
            throw err;
        }
    }, []);

    const obtenerTransaccionesRecientes = useCallback(async (limit: number = 5) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('No se encontró token de autenticación');
            }

            const response = await fetch(`http://localhost:8000/transacciones/recientes?limit=${limit}`, {
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`Error HTTP: ${response.status}`);
            }

            const data: TransaccionesRecientesResponse = await response.json();

            if (data.success) {
                return data.data;
            } else {
                throw new Error(data.message || 'Error al cargar transacciones recientes');
            }

        } catch (err) {
            console.error('Error en obtenerTransaccionesRecientes:', err);
            throw err;
        }
    }, []);

    const limpiarError = useCallback(() => {
        setError(null);
    }, []);

    return {
        // Estados
        transacciones,
        loading,
        error,
        pagination,
        estadisticas,
        
        // Funciones
        buscarTransacciones,
        obtenerResumenPorCategoria,
        obtenerTransaccionesRecientes,
        limpiarError
    };
};