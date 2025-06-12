import React, { useEffect, useState } from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';
import TransactionForm from '../Components/TransaccionForm';
import { useAuth } from '../Context/AuthContext';
import { useNavigate } from 'react-router-dom';

const TransaccionPage: React.FC = () => {
    const [categorias, setCategorias] = useState<any[]>([]);
    const [cuentas, setCuentas] = useState<any[]>([]);
    const [error, setError] = useState<string | null>(null);
    const { user, loading } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        // Si aún está cargando, no hacer nada
        if (loading) {
            return;
        }

        // Si no hay usuario después de cargar, redirigir al login
        if (!user) {
            navigate('/login');
            return;
        }

        const fetchData = async () => {
            try {
                setError(null); // Limpiar errores previos

                // Fetch categorías
                const categoriesResponse = await fetch('http://localhost:8000/categorias');
                if (!categoriesResponse.ok) {
                    throw new Error("Error al obtener categorías");
                }
                const categoriasData = await categoriesResponse.json();

                // Fetch cuentas
                const cuentasResponse = await fetch('http://localhost:8000/cuenta', {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });
                if (!cuentasResponse.ok) {
                    throw new Error("Error al obtener tus cuentas");
                }
                const cuentasData = await cuentasResponse.json();

                // Actualizar estados
                setCategorias(categoriasData);
                setCuentas(cuentasData);

            } catch (error) {
                console.error('Error fetching data:', error);
                setError(error instanceof Error ? error.message : "Ocurrió un error.");
            }
        };

        fetchData();
    }, [user, loading, navigate]); // Cambiar dependencias

    const handleSubmit = async (transaccionData: any) => {
        try {
            // Verificar que el usuario esté disponible
            if (!user?.idUsuario) {
                throw new Error("Usuario no válido");
            }

            const response = await fetch('http://localhost:8000/transaccion', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    ...transaccionData,
                    idUsuario: user.idUsuario,
                    fecha: transaccionData.fecha.toISOString().split('T')[0]
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Error al registrar la transacción.");
            }

            const result = await response.json();
            alert('Transacción registrada exitosamente.');
            
            // Opcional: limpiar el formulario o redirigir
            // navigate('/transacciones');

        } catch (error) {
            console.error('Error submitting transaction:', error);
            alert(error instanceof Error ? error.message : 'Error al registrar la transacción.');
        }
    };

    // Mostrar loading mientras se carga la autenticación
    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
                <CircularProgress />
                <Typography ml={2}>Cargando...</Typography>
            </Box>
        );
    }

    // Si hay error, mostrarlo
    if (error) {
        return (
            <Box textAlign="center" mt={4}>
                <Typography color="error" variant="h6">
                    {error}
                </Typography>
                <Typography mt={2}>
                    <button onClick={() => window.location.reload()}>
                        Intentar de nuevo
                    </button>
                </Typography>
            </Box>
        );
    }

    // Si no hay usuario (ya se habría redirigido, pero por seguridad)
    if (!user) {
        return (
            <Box textAlign="center" mt={4}>
                <Typography>Redirigiendo al login...</Typography>
            </Box>
        );
    }

    return (
        <Box maxWidth="md" mx="auto" p={3}>
            <Typography variant="h4" gutterBottom>
                Registrar Transacción
            </Typography>
            <TransactionForm 
                onSubmit={handleSubmit} 
                categorias={categorias || [] } 
                cuentas={cuentas || [] }
                idUsuario={user.idUsuario}
            />
        </Box>        
    );
};

export default TransaccionPage;