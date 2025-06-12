// src/pages/Categorias/hooks/useCategorias.ts
// 🎯 RESPONSABILIDAD: Lógica de datos - Estado y API calls 

import { useState, useEffect } from 'react';
import type { Categoria, FormData } from '../types/categoria.types';

export const useCategorias = (onLogout: () => void, showAlert: (type: 'success' | 'error', message: string) => void) => {
    const [categorias, setCategorias] = useState<Categoria[]>([]);
    const [categoriasDisponibles, setCategoriasDisponibles] = useState<Categoria[]>([]);
    const [loading, setLoading] = useState(true);

    // ✅ FETCH MIS CATEGORÍAS USADAS (Privado)
    const fetchMisCategorias = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            
            if (!token) {
                showAlert('error', 'No estás autenticado');
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
                return data.data;
            } else {
                if (response.status === 401) {
                    showAlert('error', 'Sesión expirada. Por favor, inicia sesión nuevamente');
                    onLogout();
                } else {
                    showAlert('error', data.message || 'Error al cargar tus categorías');
                }
            }
        } catch (error) {
            console.error('Error:', error);
            showAlert('error', 'Error de conexión al cargar tus categorías');
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

    // ✅ SUBMIT (Híbrido inteligente)
    const submitCategoria = async (formData: FormData, editMode: boolean, selectedCategoria?: Categoria) => {
        if (!formData.nombre.trim() || !formData.descripcion.trim()) {
            showAlert('error', 'Todos los campos son requeridos');
            return false;
        }

        try {
            const token = localStorage.getItem('token');
            
            if (!token) {
                showAlert('error', 'No estás autenticado');
                onLogout();
                return false;
            }

            const url = 'http://localhost:8000/categorias';
            const method = editMode ? 'PUT' : 'POST';
            const body = editMode 
                ? { ...formData, idCategoria: selectedCategoria?.idCategoria }
                : formData;

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(body),
            });

            const data = await response.json();

            if (response.ok && data.success) {
                showAlert('success', data.message);
                fetchMisCategorias();
                fetchCategoriasDisponibles();
                return true;
            } else {
                if (response.status === 401) {
                    showAlert('error', 'Sesión expirada. Por favor, inicia sesión nuevamente');
                    onLogout();
                } else {
                    showAlert('error', data.message || 'Error al procesar la solicitud');
                }
                return false;
            }
        } catch (error) {
            console.error('Error:', error);
            showAlert('error', 'Error de conexión');
            return false;
        }
    };

    // ✅ DELETE (Seguro)
    const deleteCategoria = async (categoria: Categoria, permisosMap: Record<number, any>) => {
        const permisos = permisosMap[categoria.idCategoria];
        
        if (permisos?.puedo_eliminar !== 1) {
            showAlert('error', permisos?.razon || 'No tienes permisos para eliminar esta categoría');
            return false;
        }

        if (!confirm(`¿Estás seguro de que quieres eliminar la categoría "${categoria.nombre}"?`)) {
            return false;
        }

        try {
            const token = localStorage.getItem('token');
            
            if (!token) {
                showAlert('error', 'No estás autenticado');
                onLogout();
                return false;
            }

            const response = await fetch('http://localhost:8000/categorias', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ idCategoria: categoria.idCategoria }),
            });

            const data = await response.json();

            if (response.ok && data.success) {
                showAlert('success', data.message);
                fetchMisCategorias();
                fetchCategoriasDisponibles();
                return true;
            } else {
                if (response.status === 401) {
                    showAlert('error', 'Sesión expirada. Por favor, inicia sesión nuevamente');
                    onLogout();
                } else {
                    showAlert('error', data.message || 'Error al eliminar la categoría');
                }
                return false;
            }
        } catch (error) {
            console.error('Error:', error);
            showAlert('error', 'Error de conexión');
            return false;
        }
    };

    useEffect(() => {
        fetchMisCategorias();
        fetchCategoriasDisponibles();
    }, []);

    return {
        categorias,
        categoriasDisponibles,
        loading,
        fetchMisCategorias,
        fetchCategoriasDisponibles,
        submitCategoria,
        deleteCategoria
    };
};