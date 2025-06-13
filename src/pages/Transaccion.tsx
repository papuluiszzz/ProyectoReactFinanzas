import React, { useEffect, useState } from 'react';
import { Box, CircularProgress, Typography, Button, Dialog, DialogTitle, DialogContent, DialogActions, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import LogoutIcon from '@mui/icons-material/Logout';
import WarningIcon from '@mui/icons-material/Warning';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import TransactionForm from '../Components/TransaccionForm';
import { useAuth } from '../Context/AuthContext';

const TransaccionPage: React.FC = () => {
    const [categorias, setCategorias] = useState<any[]>([]);
    const [cuentas, setCuentas] = useState<any[]>([]);
    const [tiposTransaccion, setTiposTransaccion] = useState<any[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [resultDialog, setResultDialog] = useState({
        open: false,
        success: false,
        title: '',
        message: '',
        details: '',
        showAlert: false
    });
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
                
                // ✅ AGREGAR ESTA LÍNEA AQUÍ
                console.log('Tipos de transacción raw:', tiposData);

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

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.msg || "Error al registrar la transacción.");
            }

            // ✅ MOSTRAR RESULTADO CON DIALOG PERSONALIZADO
            if (result.success && result.data) {
                const { saldoAnterior, saldoNuevo, cambio, porcentajeCambio, alertaBajadaSignificativa } = result.data;
                
                let details = `Saldo anterior: $${saldoAnterior.toLocaleString('es-CO')}\n`;
                details += `Saldo actual: $${saldoNuevo.toLocaleString('es-CO')}\n`;
                details += `Cambio: ${cambio > 0 ? '+' : ''}$${Math.abs(cambio).toLocaleString('es-CO')}`;

                setResultDialog({
                    open: true,
                    success: true,
                    title: alertaBajadaSignificativa ? '🚨 Transacción Registrada - ¡Alerta!' : '✅ Transacción Exitosa',
                    message: alertaBajadaSignificativa 
                        ? `Tu saldo ha disminuido más del 50% (${porcentajeCambio.toFixed(1)}%)`
                        : 'Tu transacción ha sido procesada correctamente',
                    details: details,
                    showAlert: alertaBajadaSignificativa
                });
            } else {
                setResultDialog({
                    open: true,
                    success: true,
                    title: '✅ Transacción Exitosa',
                    message: 'Tu transacción ha sido procesada correctamente',
                    details: '',
                    showAlert: false
                });
            }

        } catch (error) {
            console.error('Error submitting transaction:', error);
            setResultDialog({
                open: true,
                success: false,
                title: '❌ Error en la Transacción',
                message: error instanceof Error ? error.message : 'Error al registrar la transacción.',
                details: '',
                showAlert: false
            });
        }
    };

    const handleResultClose = () => {
        setResultDialog({ ...resultDialog, open: false });
        if (resultDialog.success) {
            navigate('/');
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

            {/* Dialog de Resultado de Transacción */}
            <Dialog 
                open={resultDialog.open} 
                onClose={handleResultClose}
                maxWidth="sm"
                fullWidth
                PaperProps={{
                    sx: {
                        borderRadius: 3,
                        border: `2px solid ${resultDialog.success ? '#22c55e' : '#ef4444'}`,
                        backgroundColor: resultDialog.success ? '#f0fdf4' : '#fef2f2'
                    }
                }}
            >
                <DialogTitle sx={{ 
                    textAlign: 'center', 
                    pt: 3,
                    pb: 1,
                    color: resultDialog.success ? '#16a34a' : '#dc2626'
                }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                        {resultDialog.showAlert ? (
                            <WarningIcon sx={{ fontSize: 50, color: '#f59e0b' }} />
                        ) : resultDialog.success ? (
                            <CheckCircleIcon sx={{ fontSize: 50, color: '#22c55e' }} />
                        ) : (
                            <WarningIcon sx={{ fontSize: 50, color: '#ef4444' }} />
                        )}
                        <Typography variant="h5" fontWeight="700" sx={{ 
                            color: resultDialog.showAlert ? '#d97706' : resultDialog.success ? '#16a34a' : '#dc2626' 
                        }}>
                            {resultDialog.title}
                        </Typography>
                    </Box>
                </DialogTitle>
                
                <DialogContent sx={{ textAlign: 'center', pb: 2 }}>
                    <Typography variant="h6" sx={{ 
                        mb: 2, 
                        color: resultDialog.showAlert ? '#d97706' : resultDialog.success ? '#16a34a' : '#dc2626', 
                        fontWeight: 500 
                    }}>
                        {resultDialog.message}
                    </Typography>
                    
                    {resultDialog.details && (
                        <Box sx={{ 
                            backgroundColor: 'rgba(255,255,255,0.8)', 
                            borderRadius: 2, 
                            p: 2, 
                            mt: 2,
                            border: `1px solid ${resultDialog.success ? '#22c55e' : '#ef4444'}20`
                        }}>
                            <Typography 
                                variant="body2" 
                                sx={{ 
                                    color: '#374151', 
                                    whiteSpace: 'pre-line',
                                    fontFamily: 'monospace',
                                    fontSize: '0.9rem'
                                }}
                            >
                                {resultDialog.details}
                            </Typography>
                        </Box>
                    )}

                    {resultDialog.showAlert && (
                        <Alert severity="warning" sx={{ mt: 2, borderRadius: 2 }}>
                            <Typography variant="body2" fontWeight="600">
                                💡 Recomendación: Considera revisar tus gastos para mantener un balance saludable
                            </Typography>
                        </Alert>
                    )}
                </DialogContent>

                <DialogActions sx={{ justifyContent: 'center', pb: 3 }}>
                    <Button
                        onClick={handleResultClose}
                        variant="contained"
                        sx={{ 
                            backgroundColor: resultDialog.success ? '#22c55e' : '#ef4444',
                            color: 'white',
                            px: 4,
                            py: 1,
                            fontWeight: 700,
                            '&:hover': {
                                backgroundColor: resultDialog.success ? '#16a34a' : '#dc2626'
                            }
                        }}
                    >
                        {resultDialog.success ? 'Ir al Dashboard' : 'Entendido'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default TransaccionPage;