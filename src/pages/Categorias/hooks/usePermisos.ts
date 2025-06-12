// src/pages/Categorias/hooks/usePermisos.ts
// 🎯 RESPONSABILIDAD: Lógica permisos - Verificaciones (50-80 líneas)

import { useState } from 'react';
import type { Permisos } from '../types/categoria.types';

export const usePermisos = () => {
    const [permisosMap, setPermisosMap] = useState<Record<number, Permisos>>({});

    const verificarPermisos = async (idCategoria: number) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;

            const response = await fetch(`http://localhost:8000/categorias/permisos?idCategoria=${idCategoria}`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();
            
            if (response.ok && data.success) {
                setPermisosMap(prev => ({
                    ...prev,
                    [idCategoria]: data.data
                }));
            }
        } catch (error) {
            console.error('Error verificando permisos:', error);
        }
    };

    const verificarMultiplesPermisos = async (categorias: Array<{ idCategoria: number }>) => {
        for (const categoria of categorias) {
            await verificarPermisos(categoria.idCategoria);
        }
    };

    const obtenerPermisos = (idCategoria: number): Permisos => {
        return permisosMap[idCategoria] || { 
            puedo_editar: 0, 
            puedo_eliminar: 0, 
            razon: 'Verificando...' 
        };
    };

    return {
        permisosMap,
        verificarPermisos,
        verificarMultiplesPermisos,
        obtenerPermisos
    };
};