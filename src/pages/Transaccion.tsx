import React, { useEffect, useState } from 'react';
import { Box, CircularProgress, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import LogoutIcon from '@mui/icons-material/Logout';
import TransactionForm from '../Components/TransaccionForm';
import { useAuth } from '../Context/AuthContext';

const TransaccionPage: React.FC = () => {
    const [categorias, setCategorias] = useState<any[]>([]);
    const [cuentas, setCuentas] = useState<any[]>([]);
    const [tiposTransaccion, setTiposTransaccion] = useState<any[]>([]);
    const [error, setError] = useState<string | null>(null);
    const { user, loading, logout } = useAuth();
    const navigate = useNavigate();
    const userName = user?.nombre || 'Usuario';

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
                const cuentasResponse = await fetch(`http://localhost:8000/cuenta?userId=${user.idUsuario}`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });
                if (!cuentasResponse.ok) {
                    throw new Error("Error al obtener tus cuentas");
                }
                const cuentasData = await cuentasResponse.json();

                // Fetch tipos de transacción
                const tiposResponse = await fetch('http://localhost:8000/tipos-transaccion');
                if (!tiposResponse.ok) {
                    throw new Error("Error al obtener tipos de transacción");
                }
                const tiposData = await tiposResponse.json();

                // Actualizar estados - CORREGIR extracción de arrays
                setCategorias(categoriasData.success ? categoriasData.data : []);
                setCuentas(cuentasData.success ? cuentasData.data : []);
                setTiposTransaccion(tiposData.success ? tiposData.data : []);

            } catch (error) {
                console.error('Error fetching data:', error);
                setError(error instanceof Error ? error.message : "Ocurrió un error.");
            }
        };

        fetchData();
    }, [user, loading, navigate]);

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
            
            // Redirigir al home después del éxito
            navigate('/');

        } catch (error) {
            console.error('Error submitting transaction:', error);
            alert(error instanceof Error ? error.message : 'Error al registrar la transacción.');
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    // Mostrar loading mientras se carga la autenticación
    if (loading) {
        return (
            <Box
                sx={{
                    width: '100vw',
                    height: '100vh',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: '#ffffff',
                }}
            >
                <CircularProgress size={60} sx={{ color: '#6366f1' }} />
            </Box>
        );
    }

    // Si hay error, mostrarlo
    if (error) {
        return (
            <Box
                sx={{
                    width: '100vw',
                    minHeight: '100vh',
                    backgroundColor: '#ffffff',
                    padding: 0,
                }}
            >
                {/* Navbar */}
                <Box
                    sx={{
                        backgroundColor: 'white',
                        borderBottom: '1px solid #e5e7eb',
                        px: 4,
                        py: 2,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)'
                    }}
                >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, cursor: 'pointer' }}
                         onClick={() => navigate('/')}>
                        <AccountBalanceWalletIcon sx={{ fontSize: 32, color: '#6366f1' }} />
                        <Typography variant="h6" fontWeight="700" sx={{ color: '#111827' }}>
                            Finanzas Pro
                        </Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                        <Box sx={{ textAlign: 'right' }}>
                            <Typography variant="body2" sx={{ color: '#6b7280', fontSize: '0.875rem' }}>
                                Usuario activo
                            </Typography>
                            <Typography variant="body1" fontWeight="600" sx={{ color: '#111827' }}>
                                {userName}
                            </Typography>
                        </Box>
                        
                        <Button
                            variant="outlined"
                            startIcon={<LogoutIcon />}
                            onClick={handleLogout}
                            sx={{
                                borderRadius: 2,
                                px: 3,
                                py: 1,
                                fontSize: '0.875rem',
                                borderColor: '#d1d5db',
                                color: '#6b7280',
                                textTransform: 'none',
                                fontWeight: 500,
                                '&:hover': {
                                    borderColor: '#ef4444',
                                    color: '#ef4444',
                                    backgroundColor: '#fef2f2',
                                }
                            }}
                        >
                            Salir
                        </Button>
                    </Box>
                </Box>

                <Box sx={{ maxWidth: 1400, mx: 'auto', px: 4, py: 6, textAlign: 'center' }}>
                    <Typography color="error" variant="h6" sx={{ mb: 2 }}>
                        {error}
                    </Typography>
                    <Button 
                        variant="contained"
                        onClick={() => window.location.reload()}
                        sx={{
                            backgroundColor: '#6366f1',
                            '&:hover': { backgroundColor: '#5856eb' },
                            textTransform: 'none',
                            fontWeight: 600
                        }}
                    >
                        Intentar de nuevo
                    </Button>
                </Box>
            </Box>
        );
    }

    // Si no hay usuario (ya se habría redirigido, pero por seguridad)
    if (!user) {
        return (
            <Box
                sx={{
                    width: '100vw',
                    height: '100vh',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: '#ffffff',
                }}
            >
                <CircularProgress size={60} sx={{ color: '#6366f1' }} />
                <Typography ml={2}>Redirigiendo al login...</Typography>
            </Box>
        );
    }

    return (
        <Box
            sx={{
                width: '100vw',
                minHeight: '100vh',
                backgroundColor: '#ffffff',
                padding: 0,
            }}
        >
            {/* Header/Navbar superior */}
            <Box
                sx={{
                    backgroundColor: 'white',
                    borderBottom: '1px solid #e5e7eb',
                    px: 4,
                    py: 2,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)'
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, cursor: 'pointer' }}
                     onClick={() => navigate('/')}>
                    <AccountBalanceWalletIcon sx={{ fontSize: 32, color: '#6366f1' }} />
                    <Typography variant="h6" fontWeight="700" sx={{ color: '#111827' }}>
                        Finanzas Pro
                    </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                    <Box sx={{ textAlign: 'right' }}>
                        <Typography variant="body2" sx={{ color: '#6b7280', fontSize: '0.875rem' }}>
                            Usuario activo
                        </Typography>
                        <Typography variant="body1" fontWeight="600" sx={{ color: '#111827' }}>
                            {userName}
                        </Typography>
                    </Box>
                    
                    <Button
                        variant="outlined"
                        startIcon={<LogoutIcon />}
                        onClick={handleLogout}
                        sx={{
                            borderRadius: 2,
                            px: 3,
                            py: 1,
                            fontSize: '0.875rem',
                            borderColor: '#d1d5db',
                            color: '#6b7280',
                            textTransform: 'none',
                            fontWeight: 500,
                            '&:hover': {
                                borderColor: '#ef4444',
                                color: '#ef4444',
                                backgroundColor: '#fef2f2',
                            }
                        }}
                    >
                        Salir
                    </Button>
                </Box>
            </Box>

            {/* Contenido principal */}
            <Box sx={{ maxWidth: 1400, mx: 'auto', px: 4, py: 6 }}>
                <TransactionForm 
                    onSubmit={handleSubmit} 
                    categorias={categorias || []} 
                    cuentas={cuentas || []}
                    tiposTransaccion={tiposTransaccion || []}
                    idUsuario={user.idUsuario}
                />
            </Box>
        </Box>
    );
};

export default TransaccionPage;