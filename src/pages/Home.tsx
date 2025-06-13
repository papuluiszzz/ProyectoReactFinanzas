import React, { useEffect, useState } from 'react';
import { Box, Typography, Button, CircularProgress, Grid } from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import { useNavigate } from 'react-router-dom';

// Componentes del Dashboard
import DashboardHeader from '../Components/Dashboard/DashboardHeader';
import StatsCards from '../Components/Dashboard/StatsCards';
import QuickActions from '../Components/Dashboard/QuickActions';
import SummaryPanel from '../Components/Dashboard/SummaryPanel';

interface HomeProps {
    onLogout: () => void;
}

interface EstadisticasData {
    periodo: string;
    fechaInicio: string;
    fechaFin: string;
    ingresos: {
        total: number;
        porcentajeCambio: number;
        anterior: number;
    };
    gastos: {
        total: number;
        porcentajeCambio: number;
        anterior: number;
    };
    balance: {
        actual: number;
        saldoTotal: number;
        disponible: number;
    };
    transaccionesRecientes: any[];
    gastosPorCategoria: any[];
}

const Home: React.FC<HomeProps> = ({ onLogout }) => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [tokenValid, setTokenValid] = useState(false);
    const [userName, setUserName] = useState('');
    const [estadisticas, setEstadisticas] = useState<EstadisticasData | null>(null);
    const [periodo, setPeriodo] = useState('mensual');
    const [loadingStats, setLoadingStats] = useState(false);

    useEffect(() => {
        const validateSession = async () => {
            const storedToken = localStorage.getItem('token');
            const storedUserName = localStorage.getItem('userName');

            if (!storedToken || !storedUserName) {
                setTokenValid(false);
                setLoading(false);
                return;
            }

            try {
                const response = await fetch('http://localhost:8000/users', {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${storedToken}`,
                        'Content-Type': 'application/json',
                    },
                });

                if (response.ok) {
                    setTokenValid(true);
                    setUserName(storedUserName);
                    fetchEstadisticas();
                } else {
                    setTokenValid(false);
                    localStorage.removeItem('token');
                    localStorage.removeItem('userName');
                    onLogout();
                }
            } catch (error) {
                console.error('Error verificando token:', error);
                setTokenValid(true);
                setUserName(storedUserName);
                fetchEstadisticas();
            }

            setLoading(false);
        };

        validateSession();
    }, [onLogout]);

    const fetchEstadisticas = async () => {
        try {
            setLoadingStats(true);
            const token = localStorage.getItem('token');
            
            if (!token) return;

            const response = await fetch(`http://localhost:8000/estadisticas/financieras?periodo=${periodo}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    setEstadisticas(data.data);
                }
            }
        } catch (error) {
            console.error('Error fetching estadísticas:', error);
        } finally {
            setLoadingStats(false);
        }
    };

    useEffect(() => {
        if (tokenValid) {
            fetchEstadisticas();
        }
    }, [periodo, tokenValid]);

    const handleLogout = () => {
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
                {/* Header del Dashboard */}
                <DashboardHeader
                    periodo={periodo}
                    setPeriodo={setPeriodo}
                    loadingStats={loadingStats}
                    onRefresh={fetchEstadisticas}
                    tokenValid={tokenValid}
                />

                {/* Tarjetas de estadísticas */}
                <StatsCards
                    estadisticas={estadisticas}
                    loadingStats={loadingStats}
                    periodo={periodo}
                />

                {/* Sección de acciones rápidas y resumen */}
                <Grid container spacing={4}>
                    <Grid item xs={12} lg={8}>
                        <QuickActions />
                    </Grid>
                    
                    <Grid item xs={12} lg={4}>
                        <SummaryPanel
                            estadisticas={estadisticas}
                            loadingStats={loadingStats}
                            periodo={periodo}
                        />
                    </Grid>
                </Grid>
            </Box>
        </Box>
    );
};

export default Home;