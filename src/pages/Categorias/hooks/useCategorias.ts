// src/pages/Categorias/hooks/useCategorias.ts

import { useState, useEffect } from 'react';
import type { Categoria, CategoriaFormData } from '../types/categoriaTypes';

export const useCategorias = (onLogout: () => void) => {
    const [categorias, setCategorias] = useState<Categoria[]>([]);
    const [categoriasDisponibles, setCategoriasDisponibles] = useState<Categoria[]>([]);
    const [loading, setLoading] = useState(true);

    // ✅ FETCH MIS CATEGORÍAS USADAS (Privado) - SIN ESTADÍSTICAS
    const fetchMisCategorias = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            
            if (!token) {
                onLogout();
                return;
            }

            const response = await fetch('http://localhost:8000/categorias/mis-usadas', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
            });

            const data = await response.json();
            
            if (response.ok && data.success) {
                setCategorias(data.data);
            } else {
                if (response.status === 401) {
                    onLogout();
                } else {
                    throw new Error(data.message || 'Error al cargar tus categorías');
                }
            }
        } catch (error) {
            console.error('Error:', error);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    // ✅ FETCH CATEGORÍAS DISPONIBLES (Global)
    const fetchCategoriasDisponibles = async () => {
        try {
            const response = await fetch('http://localhost:8000/categorias', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            const data = await response.json();
            
            if (response.ok && data.success) {
                setCategoriasDisponibles(data.data);
            } else {
                console.error('Error al cargar categorías disponibles:', data.message);
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    // ✅ CREAR CATEGORÍA
    const crearCategoria = async (formData: CategoriaFormData) => {
        const token = localStorage.getItem('token');
        
        if (!token) {
            onLogout();
            throw new Error('No estás autenticado');
        }

        const response = await fetch('http://localhost:8000/categorias', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(formData),
        });

        const data = await response.json();

        if (response.ok && data.success) {
            // Recargar ambas listas
            await Promise.all([
                fetchMisCategorias(),
                fetchCategoriasDisponibles()
            ]);
            return { success: true, message: data.message };
        } else {
            if (response.status === 401) {
                onLogout();
            }
            throw new Error(data.message || 'Error al crear la categoría');
        }
    };

    // ✅ ACTUALIZAR CATEGORÍA
    const actualizarCategoria = async (idCategoria: number, formData: CategoriaFormData) => {
        const token = localStorage.getItem('token');
        
        if (!token) {
            onLogout();
            throw new Error('No estás autenticado');
        }

        const response = await fetch('http://localhost:8000/categorias', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ ...formData, idCategoria }),
        });

        const data = await response.json();

        if (response.ok && data.success) {
            await Promise.all([
                fetchMisCategorias(),
                fetchCategoriasDisponibles()
            ]);
            return { success: true, message: data.message };
        } else {
            if (response.status === 401) {
                onLogout();
            }
            throw new Error(data.message || 'Error al actualizar la categoría');
        }
    };

    // ✅ ELIMINAR CATEGORÍA
    const eliminarCategoria = async (idCategoria: number) => {
        const token = localStorage.getItem('token');
        
        if (!token) {
            onLogout();
            throw new Error('No estás autenticado');
        }

        const response = await fetch('http://localhost:8000/categorias', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ idCategoria }),
        });

        const data = await response.json();

        if (response.ok && data.success) {
            await Promise.all([
                fetchMisCategorias(),
                fetchCategoriasDisponibles()
            ]);
            return { success: true, message: data.message };
        } else {
            if (response.status === 401) {
                onLogout();
            }
            throw new Error(data.message || 'Error al eliminar la categoría');
        }
    };

    // ✅ CARGAR DATOS INICIALES
    useEffect(() => {
        fetchMisCategorias();
        fetchCategoriasDisponibles();
    }, []);

    return {
        // Estados
        categorias,
        categoriasDisponibles,
        loading,
        
        // Funciones
        fetchMisCategorias,
        fetchCategoriasDisponibles,
        crearCategoria,
        actualizarCategoria,
        eliminarCategoria
    };
};