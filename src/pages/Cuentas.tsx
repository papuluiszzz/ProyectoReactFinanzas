import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Button,
    Card,
    Grid,
    Alert,
    CircularProgress,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    IconButton,
    Chip
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import LogoutIcon from '@mui/icons-material/Logout';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import { useAuth } from '../Context/AuthContext';

interface Cuenta {
    idCuenta: number;
    nombre: string;
    tipoCuenta: string;
    saldo: number;
    estado: 'activo' | 'inactivo';
}

const tiposCuentaPredefinidos = [
    'Cuenta de ahorro',
    'Cuenta corriente',
    'Cuenta nómina',
    'Cuenta joven',
    'Cuenta infantil',
    'Cuenta remunerada',
    'Cuenta de inversión',
    'Cuenta empresarial',
    'Cuenta digital',
    'Cuenta básica',
    'Cuenta en divisas',
    'Cuenta mancomunada',
    'Cuenta de depósito a plazo',
    'Cuenta fiduciaria',
    'Cuenta maestra'
];

const CuentasPage: React.FC = () => {
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const [cuentas, setCuentas] = useState<Cuenta[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [openDialog, setOpenDialog] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [selectedCuenta, setSelectedCuenta] = useState<Cuenta | null>(null);
    
    const [formData, setFormData] = useState({
        nombre: '',
        tipoCuenta: '',
        saldo: '',
        estado: 'activo'
    });

    const userName = user?.nombre || 'Usuario';

    useEffect(() => {
        if (user) {
            fetchCuentas();
        }
    }, [user]);

    const fetchCuentas = async () => {
        try {
            setLoading(true);
            const response = await fetch(`http://localhost:8000/cuenta?userId=${user?.idUsuario}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (!response.ok) {
                throw new Error('Error al obtener las cuentas');
            }

            const data = await response.json();
            setCuentas(data.success ? data.data : []);
        } catch (error) {
            setError(error instanceof Error ? error.message : 'Error desconocido');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenDialog = (cuenta?: Cuenta) => {
        if (cuenta) {
            setEditMode(true);
            setSelectedCuenta(cuenta);
            setFormData({
                nombre: cuenta.nombre,
                tipoCuenta: cuenta.tipoCuenta,
                saldo: cuenta.saldo.toString(),
                estado: cuenta.estado
            });
        } else {
            setEditMode(false);
            setSelectedCuenta(null);
            setFormData({
                nombre: '',
                tipoCuenta: '',
                saldo: '',
                estado: 'activo'
            });
        }
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setEditMode(false);
        setSelectedCuenta(null);
        setFormData({
            nombre: '',
            tipoCuenta: '',
            saldo: '',
            estado: 'activo'
        });
    };

    const handleSubmit = async () => {
        try {
            // Validaciones
            if (!formData.nombre.trim()) {
                setError('El nombre es requerido');
                return;
            }

            if (!formData.tipoCuenta) {
                setError('Debe seleccionar un tipo de cuenta');
                return;
            }

            const saldo = parseFloat(formData.saldo);
            if (isNaN(saldo) || saldo < 0) {
                setError('El saldo debe ser un número mayor o igual a 0');
                return;
            }

            const url = editMode 
                ? `http://localhost:8000/cuenta/${selectedCuenta?.idCuenta}`
                : 'http://localhost:8000/cuenta';
            
            const method = editMode ? 'PUT' : 'POST';

            const body = {
                nombre: formData.nombre.trim(),
                tipoCuenta: formData.tipoCuenta,
                saldo: saldo,
                estado: formData.estado,
                idUsuario: user?.idUsuario
            };

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(body)
            });

            const data = await response.json();

            if (response.ok && data.success) {
                setSuccess(editMode ? 'Cuenta actualizada correctamente' : 'Cuenta creada correctamente');
                setError(null);
                handleCloseDialog();
                fetchCuentas();
            } else {
                setError(data.message || 'Error al procesar la solicitud');
            }
        } catch (error) {
            setError(error instanceof Error ? error.message : 'Error de conexión');
        }
    };

    const handleDelete = async (cuenta: Cuenta) => {
        if (!confirm(`¿Estás seguro de que quieres eliminar la cuenta "${cuenta.nombre}"?`)) {
            return;
        }

        try {
            const response = await fetch(`http://localhost:8000/cuenta/${cuenta.idCuenta}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            const data = await response.json();

            if (response.ok && data.success) {
                setSuccess('Cuenta eliminada correctamente');
                setError(null);
                fetchCuentas();
            } else {
                setError(data.message || 'Error al eliminar la cuenta');
            }
        } catch (error) {
            setError(error instanceof Error ? error.message : 'Error de conexión');
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP'
        }).format(amount);
    };

    const getSaldoColor = (saldo: number) => {
        if (saldo < 50000) return '#ef4444'; // Rojo
        if (saldo < 100000) return '#f59e0b'; // Amarillo
        return '#22c55e'; // Verde
    };

    const getSaldoAlert = (saldo: number) => {
        if (saldo === 0) return 'Sin saldo disponible';
        if (saldo < 50000) return 'Saldo bajo - Recarga pronto';
        if (saldo < 100000) return 'Saldo moderado';
        return 'Saldo saludable';
    };

    if (loading) {
        return (
            <Box sx={{ width: '100vw', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CircularProgress size={60} sx={{ color: '#6366f1' }} />
            </Box>
        );
    }

    return (
        <Box sx={{ width: '100vw', minHeight: '100vh', backgroundColor: '#ffffff', padding: 0 }}>
            {/* Header */}
            <Box sx={{
                backgroundColor: 'white',
                borderBottom: '1px solid #e5e7eb',
                px: 4, py: 2,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)'
            }}>
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
                            borderRadius: 2, px: 3, py: 1,
                            fontSize: '0.875rem', textTransform: 'none',
                            fontWeight: 500,
                            borderColor: '#d1d5db', color: '#6b7280',
                            '&:hover': { borderColor: '#ef4444', color: '#ef4444', backgroundColor: '#fef2f2' }
                        }}
                    >
                        Salir
                    </Button>
                </Box>
            </Box>

            {/* Contenido principal */}
            <Box sx={{ maxWidth: 1400, mx: 'auto', px: 4, py: 6 }}>
                {/* Header de la página */}
                <Box sx={{ mb: 6 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 4 }}>
                        <Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                                <AccountBalanceIcon sx={{ fontSize: 40, color: '#6366f1' }} />
                                <Typography variant="h3" fontWeight="700" sx={{ color: '#111827' }}>
                                    Mis Cuentas
                                </Typography>
                            </Box>
                            <Typography variant="body1" sx={{ color: '#6b7280', fontSize: '1.125rem' }}>
                                Gestiona tus cuentas bancarias y controla tus saldos
                            </Typography>
                        </Box>
                        
                        <Button
                            variant="contained"
                            startIcon={<AddIcon />}
                            onClick={() => handleOpenDialog()}
                            sx={{
                                backgroundColor: '#6366f1',
                                '&:hover': { backgroundColor: '#5856eb' },
                                borderRadius: 2, px: 4, py: 1.5,
                                fontSize: '1rem', textTransform: 'none', fontWeight: 600
                            }}
                        >
                            Nueva Cuenta
                        </Button>
                    </Box>

                    {/* Estadísticas rápidas */}
                    <Grid container spacing={3} sx={{ mb: 4 }}>
                        <Grid item xs={12} md={4}>
                            <Card elevation={0} sx={{ p: 3, border: '1px solid #e5e7eb', borderRadius: 3 }}>
                                <Typography variant="body2" sx={{ color: '#6b7280', mb: 1 }}>
                                    Total Cuentas
                                </Typography>
                                <Typography variant="h4" fontWeight="700" sx={{ color: '#111827' }}>
                                    {cuentas.length}
                                </Typography>
                            </Card>
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <Card elevation={0} sx={{ p: 3, border: '1px solid #e5e7eb', borderRadius: 3 }}>
                                <Typography variant="body2" sx={{ color: '#6b7280', mb: 1 }}>
                                    Saldo Total
                                </Typography>
                                <Typography variant="h4" fontWeight="700" sx={{ color: '#22c55e' }}>
                                    {formatCurrency(cuentas.reduce((sum, cuenta) => sum + cuenta.saldo, 0))}
                                </Typography>
                            </Card>
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <Card elevation={0} sx={{ p: 3, border: '1px solid #e5e7eb', borderRadius: 3 }}>
                                <Typography variant="body2" sx={{ color: '#6b7280', mb: 1 }}>
                                    Cuentas Activas
                                </Typography>
                                <Typography variant="h4" fontWeight="700" sx={{ color: '#6366f1' }}>
                                    {cuentas.filter(c => c.estado === 'activo').length}
                                </Typography>
                            </Card>
                        </Grid>
                    </Grid>
                </Box>

                {/* Alertas */}
                {error && (
                    <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setError(null)}>
                        {error}
                    </Alert>
                )}

                {success && (
                    <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setSuccess(null)}>
                        {success}
                    </Alert>
                )}

                {/* Alertas de saldo bajo */}
                {cuentas.filter(c => c.saldo < 50000 && c.estado === 'activo').length > 0 && (
                    <Alert severity="warning" sx={{ mb: 3, borderRadius: 2 }}>
                        <Typography variant="body2" fontWeight="600">
                            ⚠️ Tienes {cuentas.filter(c => c.saldo < 50000 && c.estado === 'activo').length} cuenta(s) con saldo bajo
                        </Typography>
                    </Alert>
                )}

                {/* Tabla de cuentas */}
                <Card elevation={0} sx={{ border: '1px solid #e5e7eb', borderRadius: 3 }}>
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell sx={{ fontWeight: 600, color: '#374151' }}>Nombre</TableCell>
                                    <TableCell sx={{ fontWeight: 600, color: '#374151' }}>Tipo</TableCell>
                                    <TableCell sx={{ fontWeight: 600, color: '#374151' }}>Saldo</TableCell>
                                    <TableCell sx={{ fontWeight: 600, color: '#374151' }}>Estado</TableCell>
                                    <TableCell sx={{ fontWeight: 600, color: '#374151' }}>Alerta</TableCell>
                                    <TableCell sx={{ fontWeight: 600, color: '#374151', textAlign: 'center' }}>Acciones</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {cuentas.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} sx={{ textAlign: 'center', py: 6 }}>
                                            <Typography variant="h6" sx={{ color: '#6b7280', mb: 2 }}>
                                                No tienes cuentas registradas
                                            </Typography>
                                            <Button
                                                variant="outlined"
                                                startIcon={<AddIcon />}
                                                onClick={() => handleOpenDialog()}
                                            >
                                                Crear Primera Cuenta
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    cuentas.map((cuenta) => (
                                        <TableRow key={cuenta.idCuenta} sx={{ '&:hover': { backgroundColor: '#f9fafb' } }}>
                                            <TableCell>
                                                <Typography variant="body1" fontWeight="600">
                                                    {cuenta.nombre}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Chip label={cuenta.tipoCuenta} size="small" variant="outlined" />
                                            </TableCell>
                                            <TableCell>
                                                <Typography 
                                                    variant="body1" 
                                                    fontWeight="600" 
                                                    sx={{ color: getSaldoColor(cuenta.saldo) }}
                                                >
                                                    {formatCurrency(cuenta.saldo)}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Chip 
                                                    label={cuenta.estado}
                                                    size="small"
                                                    color={cuenta.estado === 'activo' ? 'success' : 'default'}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Typography 
                                                    variant="caption" 
                                                    sx={{ color: getSaldoColor(cuenta.saldo), fontWeight: 500 }}
                                                >
                                                    {getSaldoAlert(cuenta.saldo)}
                                                </Typography>
                                            </TableCell>
                                            <TableCell sx={{ textAlign: 'center' }}>
                                                <IconButton
                                                    onClick={() => handleOpenDialog(cuenta)}
                                                    sx={{ color: '#6366f1', mr: 1 }}
                                                    size="small"
                                                >
                                                    <EditIcon fontSize="small" />
                                                </IconButton>
                                                <IconButton
                                                    onClick={() => handleDelete(cuenta)}
                                                    sx={{ color: '#ef4444' }}
                                                    size="small"
                                                >
                                                    <DeleteIcon fontSize="small" />
                                                </IconButton>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Card>
            </Box>

            {/* Dialog para crear/editar cuenta */}
            <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ borderBottom: '1px solid #e5e7eb' }}>
                    {editMode ? 'Editar Cuenta' : 'Nueva Cuenta'}
                </DialogTitle>
                <DialogContent sx={{ pt: 3 }}>
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Nombre de la Cuenta"
                                value={formData.nombre}
                                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                                placeholder="Ej: Mi Cuenta Principal"
                                variant="outlined"
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <FormControl fullWidth>
                                <InputLabel>Tipo de Cuenta</InputLabel>
                                <Select
                                    value={formData.tipoCuenta}
                                    label="Tipo de Cuenta"
                                    onChange={(e) => setFormData({ ...formData, tipoCuenta: e.target.value })}
                                >
                                    {tiposCuentaPredefinidos.map((tipo) => (
                                        <MenuItem key={tipo} value={tipo}>
                                            {tipo}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Saldo Inicial"
                                type="number"
                                value={formData.saldo}
                                onChange={(e) => setFormData({ ...formData, saldo: e.target.value })}
                                InputProps={{ inputProps: { min: 0 } }}
                                helperText="El saldo no puede ser menor a 0"
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <FormControl fullWidth>
                                <InputLabel>Estado</InputLabel>
                                <Select
                                    value={formData.estado}
                                    label="Estado"
                                    onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
                                >
                                    <MenuItem value="activo">Activo</MenuItem>
                                    <MenuItem value="inactivo">Inactivo</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions sx={{ p: 3, borderTop: '1px solid #e5e7eb' }}>
                    <Button onClick={handleCloseDialog}>
                        Cancelar
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handleSubmit}
                        sx={{ backgroundColor: '#6366f1', '&:hover': { backgroundColor: '#5856eb' } }}
                    >
                        {editMode ? 'Actualizar' : 'Crear'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default CuentasPage;