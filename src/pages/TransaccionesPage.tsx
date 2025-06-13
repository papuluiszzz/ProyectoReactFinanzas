// src/pages/TransaccionesPage.tsx - ACTUALIZADO CON BOTÓN DE EXPORTAR
import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Button,
    Card,
    Grid,
    Alert,
    CircularProgress,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    TextField,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Chip,
    Pagination,
    InputAdornment,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Divider
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../Context/AuthContext';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import LogoutIcon from '@mui/icons-material/Logout';
import FilterListIcon from '@mui/icons-material/FilterList';
import SearchIcon from '@mui/icons-material/Search';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import AddIcon from '@mui/icons-material/Add';

// ✅ IMPORTAR EL COMPONENTE DE EXPORTACIÓN
import ExportButtons from '../components/ExportButtons';

interface Transaccion {
    idTransaccion: number;
    monto: number;
    fecha: string;
    descripcion: string;
    categoria: string;
    idCategoria: number;
    tipoTransaccion: string;
    idTipoTransaccion: number;
    cuenta: string;
    idCuenta: number;
}

interface FiltrosState {
    fechaInicio: string;
    fechaFin: string;
    idCategoria: string;
    idTipoTransaccion: string;
    idCuenta: string;
    montoMin: string;
    montoMax: string;
    orderBy: string;
    orderDirection: string;
}

const TransaccionesPage: React.FC = () => {
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    
    // Estados principales
    const [transacciones, setTransacciones] = useState<Transaccion[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    // Estados para filtros
    const [filtros, setFiltros] = useState<FiltrosState>({
        fechaInicio: '',
        fechaFin: '',
        idCategoria: '',
        idTipoTransaccion: '',
        idCuenta: '',
        montoMin: '',
        montoMax: '',
        orderBy: 'fecha',
        orderDirection: 'DESC'
    });
    
    // Estados para paginación y datos
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        totalRecords: 0,
        limit: 10
    });
    
    const [estadisticas, setEstadisticas] = useState({
        totalTransacciones: 0,
        totalIngresos: 0,
        totalGastos: 0,
        balance: 0
    });
    
    // Estados para opciones de filtro
    const [categorias, setCategorias] = useState<any[]>([]);
    const [cuentas, setCuentas] = useState<any[]>([]);
    const [tiposTransaccion, setTiposTransaccion] = useState<any[]>([]);
    
    const userName = user?.nombre || 'Usuario';

    // Cargar datos iniciales
    useEffect(() => {
        if (user) {
            cargarDatosIniciales();
            buscarTransacciones();
        }
    }, [user]);

    const cargarDatosIniciales = async () => {
        try {
            const token = localStorage.getItem('token');
            
            // Cargar categorías
            const categoriasResponse = await fetch('http://localhost:8000/categorias');
            const categoriasData = await categoriasResponse.json();
            
            // Cargar cuentas del usuario
            const cuentasResponse = await fetch(`http://localhost:8000/cuenta?userId=${user?.idUsuario}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const cuentasData = await cuentasResponse.json();
            
            // Cargar tipos de transacción
            const tiposResponse = await fetch('http://localhost:8000/tipos-transaccion');
            const tiposData = await tiposResponse.json();
            
            setCategorias(categoriasData.success ? categoriasData.data : []);
            setCuentas(cuentasData.success ? cuentasData.data : []);
            setTiposTransaccion(tiposData.success ? tiposData.data : []);
            
        } catch (error) {
            console.error('Error cargando datos iniciales:', error);
        }
    };

    const buscarTransacciones = async (page: number = 1) => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            
            // Construir parámetros de consulta
            const params = new URLSearchParams({
                page: page.toString(),
                limit: pagination.limit.toString(),
                ...Object.fromEntries(
                    Object.entries(filtros).filter(([_, value]) => value !== '')
                )
            });
            
            const response = await fetch(`http://localhost:8000/transacciones/filtros?${params}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            const data = await response.json();
            
            if (data.success) {
                setTransacciones(data.data.transacciones);
                setPagination(data.data.pagination);
                setEstadisticas(data.data.estadisticas);
                setError(null);
            } else {
                setError(data.message || 'Error al cargar transacciones');
            }
            
        } catch (error) {
            setError('Error de conexión');
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleFiltroChange = (campo: keyof FiltrosState, valor: string) => {
        setFiltros(prev => ({ ...prev, [campo]: valor }));
    };

    const limpiarFiltros = () => {
        setFiltros({
            fechaInicio: '',
            fechaFin: '',
            idCategoria: '',
            idTipoTransaccion: '',
            idCuenta: '',
            montoMin: '',
            montoMax: '',
            orderBy: 'fecha',
            orderDirection: 'DESC'
        });
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP'
        }).format(amount);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('es-CO');
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    if (loading && transacciones.length === 0) {
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
                            borderRadius: 2, px: 3, py: 1, fontSize: '0.875rem',
                            textTransform: 'none', fontWeight: 500,
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
                            <Typography variant="h3" fontWeight="700" sx={{ color: '#111827', mb: 2 }}>
                                Mis Transacciones
                            </Typography>
                            <Typography variant="body1" sx={{ color: '#6b7280', fontSize: '1.125rem' }}>
                                Consulta y filtra tu historial de transacciones
                            </Typography>
                        </Box>
                        
                        {/* ✅ BOTONES DE ACCIÓN CON EXPORTAR */}
                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <ExportButtons 
                                transacciones={transacciones}
                                estadisticas={estadisticas}
                                filtrosAplicados={filtros}
                                totalRecords={pagination.totalRecords}
                            />
                            <Button
                                variant="contained"
                                startIcon={<AddIcon />}
                                onClick={() => navigate('/transaccion')}
                                sx={{
                                    backgroundColor: '#6366f1',
                                    '&:hover': { backgroundColor: '#5856eb' },
                                    borderRadius: 2, px: 4, py: 1.5,
                                    fontSize: '1rem', textTransform: 'none', fontWeight: 600
                                }}
                            >
                                Nueva Transacción
                            </Button>
                        </Box>
                    </Box>

                    {/* Estadísticas rápidas */}
                    <Grid container spacing={3} sx={{ mb: 4 }}>
                        <Grid item xs={12} md={3}>
                            <Card elevation={0} sx={{ p: 3, border: '1px solid #e5e7eb', borderRadius: 3 }}>
                                <Typography variant="body2" sx={{ color: '#6b7280', mb: 1 }}>
                                    Total Transacciones
                                </Typography>
                                <Typography variant="h4" fontWeight="700" sx={{ color: '#111827' }}>
                                    {estadisticas.totalTransacciones}
                                </Typography>
                            </Card>
                        </Grid>
                        <Grid item xs={12} md={3}>
                            <Card elevation={0} sx={{ p: 3, border: '1px solid #e5e7eb', borderRadius: 3 }}>
                                <Typography variant="body2" sx={{ color: '#6b7280', mb: 1 }}>
                                    Total Ingresos
                                </Typography>
                                <Typography variant="h4" fontWeight="700" sx={{ color: '#22c55e' }}>
                                    {formatCurrency(estadisticas.totalIngresos)}
                                </Typography>
                            </Card>
                        </Grid>
                        <Grid item xs={12} md={3}>
                            <Card elevation={0} sx={{ p: 3, border: '1px solid #e5e7eb', borderRadius: 3 }}>
                                <Typography variant="body2" sx={{ color: '#6b7280', mb: 1 }}>
                                    Total Gastos
                                </Typography>
                                <Typography variant="h4" fontWeight="700" sx={{ color: '#ef4444' }}>
                                    {formatCurrency(estadisticas.totalGastos)}
                                </Typography>
                            </Card>
                        </Grid>
                        <Grid item xs={12} md={3}>
                            <Card elevation={0} sx={{ p: 3, border: '1px solid #e5e7eb', borderRadius: 3 }}>
                                <Typography variant="body2" sx={{ color: '#6b7280', mb: 1 }}>
                                    Balance
                                </Typography>
                                <Typography variant="h4" fontWeight="700" sx={{ 
                                    color: estadisticas.balance >= 0 ? '#22c55e' : '#ef4444' 
                                }}>
                                    {formatCurrency(estadisticas.balance)}
                                </Typography>
                            </Card>
                        </Grid>
                    </Grid>
                </Box>

                {/* Panel de filtros */}
                <Card elevation={0} sx={{ border: '1px solid #e5e7eb', borderRadius: 3, mb: 4 }}>
                    <Accordion>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <FilterListIcon sx={{ color: '#6366f1' }} />
                                <Typography variant="h6" fontWeight="600">
                                    Filtros de Búsqueda
                                </Typography>
                            </Box>
                        </AccordionSummary>
                        <AccordionDetails>
                            <Grid container spacing={3}>
                                {/* Filtros de fecha */}
                                <Grid item xs={12} md={3}>
                                    <TextField
                                        fullWidth
                                        label="Fecha Inicio"
                                        type="date"
                                        value={filtros.fechaInicio}
                                        onChange={(e) => handleFiltroChange('fechaInicio', e.target.value)}
                                        InputLabelProps={{ shrink: true }}
                                    />
                                </Grid>
                                <Grid item xs={12} md={3}>
                                    <TextField
                                        fullWidth
                                        label="Fecha Fin"
                                        type="date"
                                        value={filtros.fechaFin}
                                        onChange={(e) => handleFiltroChange('fechaFin', e.target.value)}
                                        InputLabelProps={{ shrink: true }}
                                    />
                                </Grid>

                                {/* Filtros de categoría y tipo */}
                                <Grid item xs={12} md={3}>
                                    <FormControl fullWidth>
                                        <InputLabel>Categoría</InputLabel>
                                        <Select
                                            value={filtros.idCategoria}
                                            label="Categoría"
                                            onChange={(e) => handleFiltroChange('idCategoria', e.target.value)}
                                        >
                                            <MenuItem value="">Todas las categorías</MenuItem>
                                            {categorias.map((cat) => (
                                                <MenuItem key={cat.idCategoria} value={cat.idCategoria}>
                                                    {cat.nombre}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Grid>

                                <Grid item xs={12} md={3}>
                                    <FormControl fullWidth>
                                        <InputLabel>Tipo</InputLabel>
                                        <Select
                                            value={filtros.idTipoTransaccion}
                                            label="Tipo"
                                            onChange={(e) => handleFiltroChange('idTipoTransaccion', e.target.value)}
                                        >
                                            <MenuItem value="">Todos los tipos</MenuItem>
                                            {tiposTransaccion.map((tipo) => (
                                                <MenuItem key={tipo.idTipoTransaccion} value={tipo.idTipoTransaccion}>
                                                    {tipo.descripcion}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Grid>

                                {/* Filtros de cuenta */}
                                <Grid item xs={12} md={3}>
                                    <FormControl fullWidth>
                                        <InputLabel>Cuenta</InputLabel>
                                        <Select
                                            value={filtros.idCuenta}
                                            label="Cuenta"
                                            onChange={(e) => handleFiltroChange('idCuenta', e.target.value)}
                                        >
                                            <MenuItem value="">Todas las cuentas</MenuItem>
                                            {cuentas.map((cuenta) => (
                                                <MenuItem key={cuenta.idCuenta} value={cuenta.idCuenta}>
                                                    {cuenta.nombre}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Grid>

                                {/* Filtros de monto */}
                                <Grid item xs={12} md={3}>
                                    <TextField
                                        fullWidth
                                        label="Monto Mínimo"
                                        type="number"
                                        value={filtros.montoMin}
                                        onChange={(e) => handleFiltroChange('montoMin', e.target.value)}
                                        InputProps={{
                                            startAdornment: <InputAdornment position="start">$</InputAdornment>
                                        }}
                                    />
                                </Grid>

                                <Grid item xs={12} md={3}>
                                    <TextField
                                        fullWidth
                                        label="Monto Máximo"
                                        type="number"
                                        value={filtros.montoMax}
                                        onChange={(e) => handleFiltroChange('montoMax', e.target.value)}
                                        InputProps={{
                                            startAdornment: <InputAdornment position="start">$</InputAdornment>
                                        }}
                                    />
                                </Grid>

                                {/* Filtros de ordenamiento */}
                                <Grid item xs={12} md={3}>
                                    <FormControl fullWidth>
                                        <InputLabel>Ordenar por</InputLabel>
                                        <Select
                                            value={filtros.orderBy}
                                            label="Ordenar por"
                                            onChange={(e) => handleFiltroChange('orderBy', e.target.value)}
                                        >
                                            <MenuItem value="fecha">Fecha</MenuItem>
                                            <MenuItem value="monto">Monto</MenuItem>
                                            <MenuItem value="categoria">Categoría</MenuItem>
                                            <MenuItem value="tipoTransaccion">Tipo</MenuItem>
                                            <MenuItem value="cuenta">Cuenta</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Grid>

                                <Grid item xs={12} md={1}>
                                    <FormControl fullWidth>
                                        <InputLabel>Dirección</InputLabel>
                                        <Select
                                            value={filtros.orderDirection}
                                            label="Dirección"
                                            onChange={(e) => handleFiltroChange('orderDirection', e.target.value)}
                                        >
                                            <MenuItem value="DESC">↓</MenuItem>
                                            <MenuItem value="ASC">↑</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Grid>

                                {/* Botones de acción */}
                                <Grid item xs={12}>
                                    <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                                        <Button
                                            variant="outlined"
                                            onClick={limpiarFiltros}
                                            sx={{ textTransform: 'none' }}
                                        >
                                            Limpiar Filtros
                                        </Button>
                                        <Button
                                            variant="contained"
                                            startIcon={<SearchIcon />}
                                            onClick={() => buscarTransacciones(1)}
                                            sx={{
                                                backgroundColor: '#6366f1',
                                                '&:hover': { backgroundColor: '#5856eb' },
                                                textTransform: 'none'
                                            }}
                                        >
                                            Buscar
                                        </Button>
                                    </Box>
                                </Grid>
                            </Grid>
                        </AccordionDetails>
                    </Accordion>
                </Card>

                {/* Alertas */}
                {error && (
                    <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                        {error}
                    </Alert>
                )}

                {/* Tabla de transacciones */}
                <Card elevation={0} sx={{ border: '1px solid #e5e7eb', borderRadius: 3 }}>
                    <Box sx={{ p: 3, borderBottom: '1px solid #e5e7eb' }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Box>
                                <Typography variant="h6" fontWeight="600" sx={{ color: '#111827' }}>
                                    Resultados de la Búsqueda
                                </Typography>
                                <Typography variant="body2" sx={{ color: '#6b7280', mt: 1 }}>
                                    {pagination.totalRecords} transacciones encontradas
                                </Typography>
                            </Box>
                            
                            {/* ✅ BOTÓN DE EXPORTAR TAMBIÉN EN LA TABLA */}
                            {transacciones.length > 0 && (
                                <ExportButtons 
                                    transacciones={transacciones}
                                    estadisticas={estadisticas}
                                    filtrosAplicados={filtros}
                                    totalRecords={pagination.totalRecords}
                                />
                            )}
                        </Box>
                    </Box>

                    {loading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                            <CircularProgress />
                        </Box>
                    ) : transacciones.length === 0 ? (
                        <Box sx={{ textAlign: 'center', py: 6 }}>
                            <Typography variant="h6" sx={{ color: '#6b7280', mb: 2 }}>
                                No se encontraron transacciones
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#9ca3af' }}>
                                Intenta ajustar los filtros de búsqueda
                            </Typography>
                        </Box>
                    ) : (
                        <>
                            <TableContainer>
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell sx={{ fontWeight: 600, color: '#374151' }}>Fecha</TableCell>
                                            <TableCell sx={{ fontWeight: 600, color: '#374151' }}>Descripción</TableCell>
                                            <TableCell sx={{ fontWeight: 600, color: '#374151' }}>Categoría</TableCell>
                                            <TableCell sx={{ fontWeight: 600, color: '#374151' }}>Tipo</TableCell>
                                            <TableCell sx={{ fontWeight: 600, color: '#374151' }}>Cuenta</TableCell>
                                            <TableCell sx={{ fontWeight: 600, color: '#374151', textAlign: 'right' }}>Monto</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {transacciones.map((transaccion) => (
                                            <TableRow 
                                                key={transaccion.idTransaccion} 
                                                sx={{ '&:hover': { backgroundColor: '#f9fafb' } }}
                                            >
                                                <TableCell>
                                                    <Typography variant="body2" fontWeight="500">
                                                        {formatDate(transaccion.fecha)}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell>
                                                    <Typography variant="body2" sx={{ maxWidth: 200 }}>
                                                        {transaccion.descripcion}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell>
                                                    <Chip 
                                                        label={transaccion.categoria} 
                                                        size="small" 
                                                        variant="outlined"
                                                        sx={{ backgroundColor: '#f3f4f6' }}
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                        {transaccion.tipoTransaccion === 'Ingreso' ? (
                                                            <TrendingUpIcon sx={{ fontSize: 16, color: '#22c55e' }} />
                                                        ) : (
                                                            <TrendingDownIcon sx={{ fontSize: 16, color: '#ef4444' }} />
                                                        )}
                                                        <Chip 
                                                            label={transaccion.tipoTransaccion}
                                                            size="small"
                                                            color={transaccion.tipoTransaccion === 'Ingreso' ? 'success' : 'error'}
                                                            variant="outlined"
                                                        />
                                                    </Box>
                                                </TableCell>
                                                <TableCell>
                                                    <Typography variant="body2" sx={{ color: '#6b7280' }}>
                                                        {transaccion.cuenta}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell sx={{ textAlign: 'right' }}>
                                                    <Typography 
                                                        variant="body1" 
                                                        fontWeight="600"
                                                        sx={{ 
                                                            color: transaccion.tipoTransaccion === 'Ingreso' ? '#22c55e' : '#ef4444'
                                                        }}
                                                    >
                                                        {transaccion.tipoTransaccion === 'Ingreso' ? '+' : '-'}
                                                        {formatCurrency(transaccion.monto)}
                                                    </Typography>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>

                            {/* Paginación */}
                            {pagination.totalPages > 1 && (
                                <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                                    <Pagination
                                        count={pagination.totalPages}
                                        page={pagination.currentPage}
                                        onChange={(_, page) => buscarTransacciones(page)}
                                        color="primary"
                                        size="large"
                                    />
                                </Box>
                            )}
                        </>
                    )}
                </Card>
            </Box>
        </Box>
    );
};

export default TransaccionesPage;