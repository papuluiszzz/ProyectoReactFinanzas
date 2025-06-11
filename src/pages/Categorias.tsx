import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Typography,
    Button,
    Card,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Alert,
    Chip,
    CircularProgress,
    Grid,
    Tooltip
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CategoryIcon from '@mui/icons-material/Category';
import CloseIcon from '@mui/icons-material/Close';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import LogoutIcon from '@mui/icons-material/Logout';
import InfoIcon from '@mui/icons-material/Info';

interface Categoria {
    idCategoria: number;
    nombre: string;
    descripcion: string;
    veces_usada?: number;
    ultima_vez_usada?: string;
}

interface Permisos {
    puedo_editar: number;
    puedo_eliminar: number;
    razon: string;
}

interface CategoriasProps {
    onLogout: () => void;
}

const Categorias: React.FC<CategoriasProps> = ({ onLogout }) => {
    const navigate = useNavigate();
    const [categorias, setCategorias] = useState<Categoria[]>([]);
    const [categoriasDisponibles, setCategoriasDisponibles] = useState<Categoria[]>([]);
    const [loading, setLoading] = useState(true);
    const [openDialog, setOpenDialog] = useState(false);
    const [openInfoDialog, setOpenInfoDialog] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [selectedCategoria, setSelectedCategoria] = useState<Categoria | null>(null);
    const [formData, setFormData] = useState({ nombre: '', descripcion: '' });
    const [permisosMap, setPermisosMap] = useState<Record<number, Permisos>>({});
    const [alert, setAlert] = useState<{ show: boolean; type: 'success' | 'error'; message: string }>({
        show: false,
        type: 'success',
        message: ''
    });

    const userName = localStorage.getItem('userName') || 'Usuario';

    useEffect(() => {
        fetchMisCategorias();
        fetchCategoriasDisponibles();
    }, []);

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
                // Verificar permisos para cada categoría
                data.data.forEach((cat: Categoria) => {
                    verificarPermisos(cat.idCategoria);
                });
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

    // ✅ VERIFICAR PERMISOS
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

    const showAlert = (type: 'success' | 'error', message: string) => {
        setAlert({ show: true, type, message });
        setTimeout(() => setAlert({ show: false, type: 'success', message: '' }), 5000);
    };

    const handleOpenDialog = (categoria?: Categoria) => {
        if (categoria) {
            setEditMode(true);
            setSelectedCategoria(categoria);
            setFormData({ nombre: categoria.nombre, descripcion: categoria.descripcion });
        } else {
            setEditMode(false);
            setSelectedCategoria(null);
            setFormData({ nombre: '', descripcion: '' });
        }
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setEditMode(false);
        setSelectedCategoria(null);
        setFormData({ nombre: '', descripcion: '' });
    };

    // ✅ SUBMIT (Híbrido inteligente)
    const handleSubmit = async () => {
        if (!formData.nombre.trim() || !formData.descripcion.trim()) {
            showAlert('error', 'Todos los campos son requeridos');
            return;
        }

        try {
            const token = localStorage.getItem('token');
            
            if (!token) {
                showAlert('error', 'No estás autenticado');
                onLogout();
                return;
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
                handleCloseDialog();
                fetchMisCategorias();
                fetchCategoriasDisponibles(); // Actualizar también las disponibles
            } else {
                if (response.status === 401) {
                    showAlert('error', 'Sesión expirada. Por favor, inicia sesión nuevamente');
                    onLogout();
                } else {
                    showAlert('error', data.message || 'Error al procesar la solicitud');
                }
            }
        } catch (error) {
            console.error('Error:', error);
            showAlert('error', 'Error de conexión');
        }
    };

    // ✅ DELETE (Seguro)
    const handleDelete = async (categoria: Categoria) => {
        const permisos = permisosMap[categoria.idCategoria];
        
        if (permisos?.puedo_eliminar !== 1) {
            showAlert('error', permisos?.razon || 'No tienes permisos para eliminar esta categoría');
            return;
        }

        if (!confirm(`¿Estás seguro de que quieres eliminar la categoría "${categoria.nombre}"?`)) {
            return;
        }

        try {
            const token = localStorage.getItem('token');
            
            if (!token) {
                showAlert('error', 'No estás autenticado');
                onLogout();
                return;
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
            } else {
                if (response.status === 401) {
                    showAlert('error', 'Sesión expirada. Por favor, inicia sesión nuevamente');
                    onLogout();
                } else {
                    showAlert('error', data.message || 'Error al eliminar la categoría');
                }
            }
        } catch (error) {
            console.error('Error:', error);
            showAlert('error', 'Error de conexión');
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('userName');
        localStorage.removeItem('userId');
        onLogout();
    };

    // ✅ COMPONENTE ITEM DE CATEGORÍA
    const CategoriaItem: React.FC<{ categoria: Categoria }> = ({ categoria }) => {
        const permisos = permisosMap[categoria.idCategoria] || { puedo_editar: 0, puedo_eliminar: 0, razon: 'Verificando...' };

        return (
            <TableRow 
                sx={{ 
                    '&:hover': { 
                        backgroundColor: '#f9fafb' 
                    }
                }}
            >
                <TableCell sx={{ py: 2 }}>
                    <Chip 
                        label={categoria.idCategoria} 
                        size="small"
                        sx={{ 
                            backgroundColor: '#f3f4f6', 
                            color: '#6b7280',
                            fontWeight: 500,
                            fontSize: '0.75rem'
                        }}
                    />
                </TableCell>
                <TableCell sx={{ py: 2 }}>
                    <Typography variant="body1" fontWeight="600" sx={{ color: '#111827' }}>
                        {categoria.nombre}
                    </Typography>
                </TableCell>
                <TableCell sx={{ py: 2 }}>
                    <Typography 
                        variant="body2" 
                        sx={{ 
                            color: '#6b7280',
                            maxWidth: 300,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                        }}
                    >
                        {categoria.descripcion}
                    </Typography>
                </TableCell>
                <TableCell sx={{ py: 2 }}>
                    {categoria.veces_usada && (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                            <Chip 
                                label={`${categoria.veces_usada} usos`} 
                                size="small" 
                                color="primary"
                                variant="outlined"
                            />
                            {categoria.ultima_vez_usada && (
                                <Typography variant="caption" sx={{ color: '#6b7280' }}>
                                    Último: {new Date(categoria.ultima_vez_usada).toLocaleDateString()}
                                </Typography>
                            )}
                        </Box>
                    )}
                </TableCell>
                <TableCell sx={{ textAlign: 'center', py: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                        {permisos.puedo_editar === 1 ? (
                            <IconButton
                                onClick={() => handleOpenDialog(categoria)}
                                sx={{ 
                                    color: '#6366f1',
                                    backgroundColor: '#eef2ff',
                                    '&:hover': {
                                        backgroundColor: '#e0e7ff',
                                        transform: 'scale(1.05)'
                                    },
                                    transition: 'all 0.2s ease'
                                }}
                                size="small"
                            >
                                <EditIcon fontSize="small" />
                            </IconButton>
                        ) : (
                            <Tooltip title={permisos.razon} arrow>
                                <span>
                                    <IconButton
                                        disabled
                                        sx={{ 
                                            color: '#d1d5db',
                                            backgroundColor: '#f9fafb'
                                        }}
                                        size="small"
                                    >
                                        <EditIcon fontSize="small" />
                                    </IconButton>
                                </span>
                            </Tooltip>
                        )}
                        
                        {permisos.puedo_eliminar === 1 ? (
                            <IconButton
                                onClick={() => handleDelete(categoria)}
                                sx={{ 
                                    color: '#ef4444',
                                    backgroundColor: '#fef2f2',
                                    '&:hover': {
                                        backgroundColor: '#fee2e2',
                                        transform: 'scale(1.05)'
                                    },
                                    transition: 'all 0.2s ease'
                                }}
                                size="small"
                            >
                                <DeleteIcon fontSize="small" />
                            </IconButton>
                        ) : (
                            <Tooltip title={permisos.razon} arrow>
                                <span>
                                    <IconButton
                                        disabled
                                        sx={{ 
                                            color: '#d1d5db',
                                            backgroundColor: '#f9fafb'
                                        }}
                                        size="small"
                                    >
                                        <DeleteIcon fontSize="small" />
                                    </IconButton>
                                </span>
                            </Tooltip>
                        )}
                    </Box>
                </TableCell>
            </TableRow>
        );
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
                
                {/* Header de la página */}
                <Box sx={{ mb: 6 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 4 }}>
                        <Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                                <CategoryIcon sx={{ fontSize: 40, color: '#6366f1' }} />
                                <Typography variant="h3" fontWeight="700" sx={{ color: '#111827' }}>
                                    Mis Categorías
                                </Typography>
                            </Box>
                            <Typography variant="body1" sx={{ color: '#6b7280', fontSize: '1.125rem', mb: 2 }}>
                                Gestiona las categorías que has usado en tus transacciones
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <InfoIcon sx={{ fontSize: 20, color: '#6366f1' }} />
                                <Typography variant="body2" sx={{ color: '#6366f1', fontWeight: 500 }}>
                                    Sistema híbrido: Ves solo las que usas, pero puedes crear nuevas para todos
                                </Typography>
                            </Box>
                        </Box>
                        
                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <Button
                                variant="outlined"
                                startIcon={<InfoIcon />}
                                onClick={() => setOpenInfoDialog(true)}
                                sx={{
                                    borderRadius: 2,
                                    px: 3,
                                    py: 1.5,
                                    fontSize: '0.875rem',
                                    textTransform: 'none',
                                    fontWeight: 500,
                                }}
                            >
                                Ver Disponibles ({categoriasDisponibles.length})
                            </Button>
                            
                            <Button
                                variant="contained"
                                startIcon={<AddIcon />}
                                onClick={() => handleOpenDialog()}
                                sx={{
                                    backgroundColor: '#6366f1',
                                    '&:hover': { backgroundColor: '#5856eb' },
                                    borderRadius: 2,
                                    px: 4,
                                    py: 1.5,
                                    fontSize: '1rem',
                                    textTransform: 'none',
                                    fontWeight: 600,
                                    boxShadow: '0 4px 6px -1px rgb(99 102 241 / 0.1), 0 2px 4px -1px rgb(99 102 241 / 0.06)',
                                }}
                            >
                                Nueva Categoría
                            </Button>
                        </Box>
                    </Box>

                    {/* Stats */}
                    <Grid container spacing={3} sx={{ mb: 4 }}>
                        <Grid item xs={12} md={4}>
                            <Card elevation={0} sx={{ 
                                p: 3, 
                                backgroundColor: 'white', 
                                border: '1px solid #e5e7eb', 
                                borderRadius: 3,
                                transition: 'all 0.2s ease',
                                '&:hover': {
                                    transform: 'translateY(-2px)',
                                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                                }
                            }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Box>
                                        <Typography variant="body2" sx={{ color: '#6b7280', fontWeight: 500 }}>
                                            Mis Categorías Usadas
                                        </Typography>
                                        <Typography variant="h3" fontWeight="700" sx={{ color: '#111827' }}>
                                            {categorias.length}
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
                                        <CategoryIcon sx={{ fontSize: 24, color: '#6366f1' }} />
                                    </Box>
                                </Box>
                            </Card>
                        </Grid>
                        
                        <Grid item xs={12} md={4}>
                            <Card elevation={0} sx={{ 
                                p: 3, 
                                backgroundColor: 'white', 
                                border: '1px solid #e5e7eb', 
                                borderRadius: 3,
                                transition: 'all 0.2s ease',
                                '&:hover': {
                                    transform: 'translateY(-2px)',
                                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                                }
                            }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Box>
                                        <Typography variant="body2" sx={{ color: '#6b7280', fontWeight: 500 }}>
                                            Disponibles Globalmente
                                        </Typography>
                                        <Typography variant="h3" fontWeight="700" sx={{ color: '#111827' }}>
                                            {categoriasDisponibles.length}
                                        </Typography>
                                    </Box>
                                    <Box sx={{ 
                                        width: 48, 
                                        height: 48, 
                                        backgroundColor: '#f0fdf4', 
                                        borderRadius: 2, 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        justifyContent: 'center'
                                    }}>
                                        <InfoIcon sx={{ fontSize: 24, color: '#22c55e' }} />
                                    </Box>
                                </Box>
                            </Card>
                        </Grid>
                    </Grid>
                </Box>

                {/* Alert */}
                {alert.show && (
                    <Alert 
                        severity={alert.type} 
                        sx={{ 
                            mb: 3,
                            borderRadius: 2,
                            '& .MuiAlert-message': {
                                fontWeight: 500
                            }
                        }}
                    >
                        {alert.message}
                    </Alert>
                )}

                {/* Tabla de mis categorías */}
                <Card elevation={0} sx={{ 
                    border: '1px solid #e5e7eb', 
                    borderRadius: 3,
                    overflow: 'hidden'
                }}>
                    <Box sx={{ p: 3, borderBottom: '1px solid #e5e7eb', backgroundColor: '#f9fafb' }}>
                        <Typography variant="h6" fontWeight="600" sx={{ color: '#111827' }}>
                            Categorías que has usado
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#6b7280', mt: 1 }}>
                            Solo puedes editar categorías que otros usuarios no estén usando
                        </Typography>
                    </Box>
                    
                    <TableContainer component={Paper} elevation={0}>
                        <Table>
                            <TableHead sx={{ backgroundColor: '#f9fafb' }}>
                                <TableRow>
                                    <TableCell sx={{ fontWeight: 600, color: '#374151', fontSize: '0.875rem' }}>
                                        ID
                                    </TableCell>
                                    <TableCell sx={{ fontWeight: 600, color: '#374151', fontSize: '0.875rem' }}>
                                        Nombre
                                    </TableCell>
                                    <TableCell sx={{ fontWeight: 600, color: '#374151', fontSize: '0.875rem' }}>
                                        Descripción
                                    </TableCell>
                                    <TableCell sx={{ fontWeight: 600, color: '#374151', fontSize: '0.875rem' }}>
                                        Uso
                                    </TableCell>
                                    <TableCell sx={{ fontWeight: 600, color: '#374151', fontSize: '0.875rem', textAlign: 'center' }}>
                                        Acciones
                                    </TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {categorias.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} sx={{ textAlign: 'center', py: 6 }}>
                                            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                                                <CategoryIcon sx={{ fontSize: 48, color: '#d1d5db' }} />
                                                <Typography variant="h6" sx={{ color: '#6b7280', fontWeight: 500 }}>
                                                    Aún no has usado ninguna categoría
                                                </Typography>
                                                <Typography variant="body2" sx={{ color: '#9ca3af' }}>
                                                    Registra tu primera transacción para comenzar a usar categorías
                                                </Typography>
                                                <Button
                                                    variant="outlined"
                                                    startIcon={<AddIcon />}
                                                    onClick={() => handleOpenDialog()}
                                                    sx={{ mt: 2 }}
                                                >
                                                    Crear Primera Categoría
                                                </Button>
                                            </Box>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    categorias.map((categoria) => (
                                        <CategoriaItem key={categoria.idCategoria} categoria={categoria} />
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Card>
            </Box>

            {/* Dialog para crear/editar categoría */}
            <Dialog 
                open={openDialog} 
                onClose={handleCloseDialog} 
                maxWidth="sm" 
                fullWidth
                PaperProps={{
                    sx: { borderRadius: 3 }
                }}
            >
                <DialogTitle sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    pb: 2,
                    borderBottom: '1px solid #e5e7eb'
                }}>
                    <Typography variant="h6" fontWeight="600" sx={{ color: '#111827' }}>
                        {editMode ? 'Editar Categoría' : 'Nueva Categoría'}
                    </Typography>
                    <IconButton 
                        onClick={handleCloseDialog}
                        sx={{ color: '#6b7280' }}
                    >
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent sx={{ pt: 3, pb: 2 }}>
                    {!editMode && (
                        <Alert severity="info" sx={{ mb: 3, borderRadius: 2 }}>
                            <Typography variant="body2">
                                Las categorías nuevas estarán disponibles para todos los usuarios. 
                                Si ya existe una con el mismo nombre, podrás empezar a usarla.
                            </Typography>
                        </Alert>
                    )}
                    <TextField
                        fullWidth
                        label="Nombre de la categoría"
                        value={formData.nombre}
                        onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                        sx={{ mb: 3 }}
                        placeholder="Ej: Alimentación, Transporte, Entretenimiento"
                        variant="outlined"
                    />
                    <TextField
                        fullWidth
                        label="Descripción"
                        value={formData.descripcion}
                        onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                        multiline
                        rows={3}
                        placeholder="Descripción detallada de la categoría"
                        variant="outlined"
                    />
                </DialogContent>
                <DialogActions sx={{ p: 3, borderTop: '1px solid #e5e7eb' }}>
                    <Button 
                        onClick={handleCloseDialog} 
                        sx={{ 
                            color: '#6b7280',
                            textTransform: 'none',
                            fontWeight: 500
                        }}
                    >
                        Cancelar
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handleSubmit}
                        sx={{ 
                            backgroundColor: '#6366f1', 
                            '&:hover': { backgroundColor: '#5856eb' },
                            textTransform: 'none',
                            fontWeight: 600,
                            px: 3
                        }}
                    >
                        {editMode ? 'Actualizar' : 'Crear'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Dialog para ver categorías disponibles */}
            <Dialog 
                open={openInfoDialog} 
                onClose={() => setOpenInfoDialog(false)} 
                maxWidth="md" 
                fullWidth
                PaperProps={{
                    sx: { borderRadius: 3 }
                }}
            >
                <DialogTitle sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    pb: 2,
                    borderBottom: '1px solid #e5e7eb'
                }}>
                    <Box>
                        <Typography variant="h6" fontWeight="600" sx={{ color: '#111827' }}>
                            Categorías Disponibles
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#6b7280', mt: 1 }}>
                            Todas las categorías que puedes usar en tus transacciones
                        </Typography>
                    </Box>
                    <IconButton 
                        onClick={() => setOpenInfoDialog(false)}
                        sx={{ color: '#6b7280' }}
                    >
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent sx={{ pt: 3 }}>
                    <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
                        <Grid container spacing={2}>
                            {categoriasDisponibles.map((categoria) => (
                                <Grid item xs={12} sm={6} key={categoria.idCategoria}>
                                    <Card 
                                        elevation={0} 
                                        sx={{ 
                                            p: 2, 
                                            border: '1px solid #e5e7eb',
                                            borderRadius: 2,
                                            backgroundColor: categorias.some(c => c.idCategoria === categoria.idCategoria) ? '#f0fdf4' : '#ffffff',
                                            borderColor: categorias.some(c => c.idCategoria === categoria.idCategoria) ? '#22c55e' : '#e5e7eb'
                                        }}
                                    >
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                            <Box sx={{ flex: 1 }}>
                                                <Typography variant="body1" fontWeight="600" sx={{ color: '#111827', mb: 1 }}>
                                                    {categoria.nombre}
                                                </Typography>
                                                <Typography variant="body2" sx={{ color: '#6b7280', fontSize: '0.875rem' }}>
                                                    {categoria.descripcion}
                                                </Typography>
                                            </Box>
                                            {categorias.some(c => c.idCategoria === categoria.idCategoria) && (
                                                <Chip 
                                                    label="En uso" 
                                                    size="small" 
                                                    color="success"
                                                    sx={{ ml: 1 }}
                                                />
                                            )}
                                        </Box>
                                    </Card>
                                </Grid>
                            ))}
                        </Grid>
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 3, borderTop: '1px solid #e5e7eb' }}>
                    <Button 
                        onClick={() => setOpenInfoDialog(false)} 
                        variant="contained"
                        sx={{ 
                            backgroundColor: '#6366f1', 
                            '&:hover': { backgroundColor: '#5856eb' },
                            textTransform: 'none',
                            fontWeight: 600
                        }}
                    >
                        Cerrar
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default Categorias;