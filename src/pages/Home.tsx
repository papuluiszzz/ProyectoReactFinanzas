import React, { useEffect, useState } from 'react';
import {
    Box,
    Typography,
    Button,
    Card,
    CircularProgress,
    Grid,
} from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import SavingsIcon from '@mui/icons-material/Savings';
import ReceiptIcon from '@mui/icons-material/Receipt';
import { useNavigate } from 'react-router-dom';

interface HomeProps {
    onLogout: () => void;
}

const Home: React.FC<HomeProps> = ({ onLogout }) => {
    const [loading, setLoading] = useState(true);
    const [tokenValid, setTokenValid] = useState(false);
    const [userName, setUserName] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const validateSession = async () => {
            const storedToken = localStorage.getItem('token');
            const storedUserName = localStorage.getItem('userName');

            console.log('Validando sesión...');
            console.log('Token:', storedToken ? 'Presente' : 'No encontrado');
            console.log('Usuario:', storedUserName);

            if (!storedToken || !storedUserName) {
                console.log('No hay token o usuario');
                setTokenValid(false);
                setLoading(false);
                return;
            }

            try {
                console.log('Verificando token con el servidor...');
                const response = await fetch('http://localhost:8000/users', {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${storedToken}`,
                        'Content-Type': 'application/json',
                    },
                });

                console.log('Respuesta del servidor:', response.status);

                if (response.ok) {
                    console.log('Token válido');
                    setTokenValid(true);
                    setUserName(storedUserName);
                } else {
                    console.log('Token inválido');
                    setTokenValid(false);
                    localStorage.removeItem('token');
                    localStorage.removeItem('userName');
                    onLogout();
                }
            } catch (error) {
                console.error('Error verificando token:', error);
                setTokenValid(true);
                setUserName(storedUserName);
            }

            setLoading(false);
        };

        validateSession();
    }, [onLogout]);

    const handleLogout = () => {
        console.log('Cerrando sesión...');
        localStorage.removeItem('token');
        localStorage.removeItem('userName');
        onLogout();
    };

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
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <AccountBalanceWalletIcon sx={{ fontSize: 32, color: '#6366f1' }} />
                    <Typography variant="h6" fontWeight="700" sx={{ color: '#111827' }}>
                        Finanzas Pro
                    </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                    <Box sx={{ textAlign: 'right' }}>
                        <Typography variant="body2" sx={{ color: '#6b7280', fontSize: '0.875rem' }}>
                            Bienvenido de vuelta
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
                
                {/* Sección de bienvenida */}
                <Box sx={{ mb: 6 }}>
                    <Typography variant="h3" fontWeight="700" sx={{ color: '#111827', mb: 2 }}>
                        Dashboard Financiero
                    </Typography>
                    <Typography variant="body1" sx={{ color: '#6b7280', fontSize: '1.125rem', mb: 4 }}>
                        Gestiona y controla tus finanzas personales de manera inteligente
                    </Typography>
                    
                    {tokenValid ? (
                        <Box sx={{ 
                            display: 'inline-flex', 
                            alignItems: 'center', 
                            gap: 1, 
                            backgroundColor: '#f0f9ff', 
                            color: '#0369a1', 
                            px: 3, 
                            py: 1.5, 
                            borderRadius: 2,
                            border: '1px solid #bae6fd'
                        }}>
                            <Box sx={{ width: 8, height: 8, backgroundColor: '#22c55e', borderRadius: '50%' }} />
                            <Typography variant="body2" fontWeight="500">
                                Sesión activa
                            </Typography>
                        </Box>
                    ) : (
                        <Box sx={{ 
                            display: 'inline-flex', 
                            alignItems: 'center', 
                            gap: 1, 
                            backgroundColor: '#fef2f2', 
                            color: '#dc2626', 
                            px: 3, 
                            py: 1.5, 
                            borderRadius: 2,
                            border: '1px solid #fecaca'
                        }}>
                            <Box sx={{ width: 8, height: 8, backgroundColor: '#ef4444', borderRadius: '50%' }} />
                            <Typography variant="body2" fontWeight="500">
                                Error de autenticación
                            </Typography>
                        </Box>
                    )}
                </Box>

                {/* Resumen financiero principal */}
                <Grid container spacing={3} sx={{ mb: 6 }}>
                    <Grid item xs={12} md={6} lg={3}>
                        <Card 
                            elevation={0}
                            sx={{ 
                                p: 0,
                                backgroundColor: 'white',
                                border: '1px solid #e5e7eb',
                                borderRadius: 3,
                                overflow: 'hidden',
                                transition: 'all 0.2s ease',
                                '&:hover': {
                                    transform: 'translateY(-2px)',
                                    boxShadow: '0 10px 25px -3px rgb(0 0 0 / 0.1), 0 4px 6px -2px rgb(0 0 0 / 0.05)',
                                    borderColor: '#10b981',
                                }
                            }}
                        >
                            <Box sx={{ p: 3 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
                                    <Box>
                                        <Typography variant="body2" sx={{ color: '#6b7280', fontWeight: 500, mb: 1 }}>
                                            Ingresos Totales
                                        </Typography>
                                        <Typography variant="h4" fontWeight="700" sx={{ color: '#111827' }}>
                                            $0.00
                                        </Typography>
                                    </Box>
                                    <Box sx={{ 
                                        width: 48, 
                                        height: 48, 
                                        backgroundColor: '#ecfdf5', 
                                        borderRadius: 2, 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        justifyContent: 'center'
                                    }}>
                                        <MonetizationOnIcon sx={{ fontSize: 24, color: '#10b981' }} />
                                    </Box>
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <TrendingUpIcon sx={{ fontSize: 16, color: '#10b981' }} />
                                    <Typography variant="body2" sx={{ color: '#10b981', fontWeight: 500 }}>
                                        +0% este mes
                                    </Typography>
                                </Box>
                            </Box>
                        </Card>
                    </Grid>

                    <Grid item xs={12} md={6} lg={3}>
                        <Card 
                            elevation={0}
                            sx={{ 
                                p: 0,
                                backgroundColor: 'white',
                                border: '1px solid #e5e7eb',
                                borderRadius: 3,
                                overflow: 'hidden',
                                transition: 'all 0.2s ease',
                                '&:hover': {
                                    transform: 'translateY(-2px)',
                                    boxShadow: '0 10px 25px -3px rgb(0 0 0 / 0.1), 0 4px 6px -2px rgb(0 0 0 / 0.05)',
                                    borderColor: '#ef4444',
                                }
                            }}
                        >
                            <Box sx={{ p: 3 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
                                    <Box>
                                        <Typography variant="body2" sx={{ color: '#6b7280', fontWeight: 500, mb: 1 }}>
                                            Gastos Totales
                                        </Typography>
                                        <Typography variant="h4" fontWeight="700" sx={{ color: '#111827' }}>
                                            $0.00
                                        </Typography>
                                    </Box>
                                    <Box sx={{ 
                                        width: 48, 
                                        height: 48, 
                                        backgroundColor: '#fef2f2', 
                                        borderRadius: 2, 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        justifyContent: 'center'
                                    }}>
                                        <ReceiptIcon sx={{ fontSize: 24, color: '#ef4444' }} />
                                    </Box>
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <TrendingUpIcon sx={{ fontSize: 16, color: '#6b7280' }} />
                                    <Typography variant="body2" sx={{ color: '#6b7280', fontWeight: 500 }}>
                                        +0% este mes
                                    </Typography>
                                </Box>
                            </Box>
                        </Card>
                    </Grid>

                    <Grid item xs={12} md={6} lg={3}>
                        <Card 
                            elevation={0}
                            sx={{ 
                                p: 0,
                                backgroundColor: 'white',
                                border: '1px solid #e5e7eb',
                                borderRadius: 3,
                                overflow: 'hidden',
                                transition: 'all 0.2s ease',
                                '&:hover': {
                                    transform: 'translateY(-2px)',
                                    boxShadow: '0 10px 25px -3px rgb(0 0 0 / 0.1), 0 4px 6px -2px rgb(0 0 0 / 0.05)',
                                    borderColor: '#6366f1',
                                }
                            }}
                        >
                            <Box sx={{ p: 3 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
                                    <Box>
                                        <Typography variant="body2" sx={{ color: '#6b7280', fontWeight: 500, mb: 1 }}>
                                            Balance Actual
                                        </Typography>
                                        <Typography variant="h4" fontWeight="700" sx={{ color: '#111827' }}>
                                            $0.00
                                        </Typography>
                                    </Box>
                                    <Box sx={{ 
                                        width: 48, 
                                        height: 48, 
                                        backgroundColor: '#eef2ff', 
                                        borderRadius: 2, 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        justifyContent: 'center'
                                    }}>
                                        <TrendingUpIcon sx={{ fontSize: 24, color: '#6366f1' }} />
                                    </Box>
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <TrendingUpIcon sx={{ fontSize: 16, color: '#6b7280' }} />
                                    <Typography variant="body2" sx={{ color: '#6b7280', fontWeight: 500 }}>
                                        Disponible
                                    </Typography>
                                </Box>
                            </Box>
                        </Card>
                    </Grid>

                    <Grid item xs={12} md={6} lg={3}>
                        <Card 
                            elevation={0}
                            sx={{ 
                                p: 0,
                                backgroundColor: 'white',
                                border: '1px solid #e5e7eb',
                                borderRadius: 3,
                                overflow: 'hidden',
                                transition: 'all 0.2s ease',
                                '&:hover': {
                                    transform: 'translateY(-2px)',
                                    boxShadow: '0 10px 25px -3px rgb(0 0 0 / 0.1), 0 4px 6px -2px rgb(0 0 0 / 0.05)',
                                    borderColor: '#f59e0b',
                                }
                            }}
                        >
                            <Box sx={{ p: 3 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
                                    <Box>
                                        <Typography variant="body2" sx={{ color: '#6b7280', fontWeight: 500, mb: 1 }}>
                                            Meta de Ahorro
                                        </Typography>
                                        <Typography variant="h4" fontWeight="700" sx={{ color: '#111827' }}>
                                            $0.00
                                        </Typography>
                                    </Box>
                                    <Box sx={{ 
                                        width: 48, 
                                        height: 48, 
                                        backgroundColor: '#fffbeb', 
                                        borderRadius: 2, 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        justifyContent: 'center'
                                    }}>
                                        <SavingsIcon sx={{ fontSize: 24, color: '#f59e0b' }} />
                                    </Box>
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Box sx={{ 
                                        width: '100%', 
                                        height: 4, 
                                        backgroundColor: '#f3f4f6', 
                                        borderRadius: 2,
                                        position: 'relative',
                                        overflow: 'hidden'
                                    }}>
                                        <Box sx={{ 
                                            width: '0%', 
                                            height: '100%', 
                                            backgroundColor: '#f59e0b', 
                                            borderRadius: 2
                                        }} />
                                    </Box>
                                </Box>
                            </Box>
                        </Card>
                    </Grid>
                </Grid>

                {/* Sección de acciones rápidas */}
                <Grid container spacing={4}>
                    <Grid item xs={12} lg={8}>
                        <Card elevation={0} sx={{ 
                            backgroundColor: 'white', 
                            border: '1px solid #e5e7eb', 
                            borderRadius: 3,
                            p: 4
                        }}>
                            <Typography variant="h6" fontWeight="600" sx={{ color: '#111827', mb: 3 }}>
                                Acciones Rápidas
                            </Typography>
                            
                            <Grid container spacing={3}>
                                <Grid item xs={12} sm={6} md={4}>
                                    <Box sx={{ 
                                        p: 3, 
                                        borderRadius: 2, 
                                        backgroundColor: '#f9fafb',
                                        border: '1px solid #e5e7eb',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s ease',
                                        '&:hover': {
                                            backgroundColor: '#f3f4f6',
                                            transform: 'translateY(-1px)'
                                        }
                                    }}>
                                        <MonetizationOnIcon sx={{ fontSize: 24, color: '#10b981', mb: 2 }} />
                                        <Typography variant="body1" fontWeight="600" sx={{ color: '#111827', mb: 1 }}>
                                            Agregar Ingreso
                                        </Typography>
                                        <Typography variant="body2" sx={{ color: '#6b7280' }}>
                                            Registra un nuevo ingreso
                                        </Typography>
                                    </Box>
                                </Grid>
                                
                                <Grid item xs={12} sm={6} md={4}>
                                    <Box 
                                    onClick={()=>navigate('/Transaccion')}
                                    sx={{ 
                                        p: 3, 
                                        borderRadius: 2, 
                                        backgroundColor: '#f9fafb',
                                        border: '1px solid #e5e7eb',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s ease',
                                        '&:hover': {
                                            backgroundColor: '#f3f4f6',
                                            transform: 'translateY(-1px)'
                                        }
                                    }}>
                                        <ReceiptIcon sx={{ fontSize: 24, color: '#ef4444', mb: 2 }} />
                                        <Typography variant="body1" fontWeight="600" sx={{ color: '#111827', mb: 1 }}>
                                            Registrar Gasto
                                        </Typography>
                                        <Typography variant="body2" sx={{ color: '#6b7280' }}>
                                            Añade un nuevo gasto
                                        </Typography>
                                    </Box>
                                </Grid>
                                
                                <Grid item xs={12} sm={6} md={4}>
                                    <Box sx={{ 
                                        p: 3, 
                                        borderRadius: 2, 
                                        backgroundColor: '#f9fafb',
                                        border: '1px solid #e5e7eb',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s ease',
                                        '&:hover': {
                                            backgroundColor: '#f3f4f6',
                                            transform: 'translateY(-1px)'
                                        }
                                    }}>
                                        <SavingsIcon sx={{ fontSize: 24, color: '#f59e0b', mb: 2 }} />
                                        <Typography variant="body1" fontWeight="600" sx={{ color: '#111827', mb: 1 }}>
                                            Definir Meta
                                        </Typography>
                                        <Typography variant="body2" sx={{ color: '#6b7280' }}>
                                            Establece objetivos de ahorro
                                        </Typography>
                                    </Box>
                                </Grid>
                            </Grid>
                        </Card>
                    </Grid>
                    
                    <Grid item xs={12} lg={4}>
                        <Card elevation={0} sx={{ 
                            backgroundColor: 'white', 
                            border: '1px solid #e5e7eb', 
                            borderRadius: 3,
                            p: 4,
                            height: 'fit-content'
                        }}>
                            <Typography variant="h6" fontWeight="600" sx={{ color: '#111827', mb: 3 }}>
                                Resumen Mensual
                            </Typography>
                            
                            <Box sx={{ mb: 3 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                    <Typography variant="body2" sx={{ color: '#6b7280' }}>
                                        Ingresos
                                    </Typography>
                                    <Typography variant="body1" fontWeight="600" sx={{ color: '#10b981' }}>
                                        $0.00
                                    </Typography>
                                </Box>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                    <Typography variant="body2" sx={{ color: '#6b7280' }}>
                                        Gastos
                                    </Typography>
                                    <Typography variant="body1" fontWeight="600" sx={{ color: '#ef4444' }}>
                                        $0.00
                                    </Typography>
                                </Box>
                                <Box sx={{ height: 1, backgroundColor: '#e5e7eb', my: 2 }} />
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Typography variant="body1" fontWeight="600" sx={{ color: '#111827' }}>
                                        Balance
                                    </Typography>
                                    <Typography variant="body1" fontWeight="700" sx={{ color: '#6366f1' }}>
                                        $0.00
                                    </Typography>
                                </Box>
                            </Box>
                            
                            <Box sx={{ 
                                backgroundColor: '#f8fafc', 
                                borderRadius: 2, 
                                p: 3,
                                textAlign: 'center'
                            }}>
                                <Typography variant="body2" sx={{ color: '#6b7280', mb: 1 }}>
                                    🚀 Próximamente
                                </Typography>
                                <Typography variant="body2" sx={{ color: '#6b7280' }}>
                                    Gráficos y reportes detallados de tus finanzas
                                </Typography>
                            </Box>
                        </Card>
                    </Grid>
                </Grid>
            </Box>
        </Box>
    );
};

export default Home;