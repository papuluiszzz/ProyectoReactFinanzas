// src/pages/Categorias/components/CategoriasModal.tsx
// 🎯 RESPONSABILIDAD: Modal - Ver disponibles (120-150 líneas)

import React, { useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    IconButton,
    Box,
    Grid,
    Card,
    Chip,
    TextField,
    InputAdornment,
    Tabs,
    Tab,
    Divider
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SearchIcon from '@mui/icons-material/Search';
import CategoryIcon from '@mui/icons-material/Category';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import type { Categoria } from '../types/categoria.types';

interface CategoriasModalProps {
    open: boolean;
    categoriasDisponibles: Categoria[];
    categoriasUsadas: Categoria[];
    onClose: () => void;
}

const CategoriasModal: React.FC<CategoriasModalProps> = ({
    open,
    categoriasDisponibles,
    categoriasUsadas,
    onClose
}) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [tabValue, setTabValue] = useState(0);

    const isUsedCategory = (categoria: Categoria) => {
        return categoriasUsadas.some(c => c.idCategoria === categoria.idCategoria);
    };

    const filteredCategorias = categoriasDisponibles.filter(categoria => {
        const matchesSearch = categoria.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             categoria.descripcion.toLowerCase().includes(searchTerm.toLowerCase());
        
        if (tabValue === 0) return matchesSearch; // Todas
        if (tabValue === 1) return matchesSearch && isUsedCategory(categoria); // Usadas
        if (tabValue === 2) return matchesSearch && !isUsedCategory(categoria); // No usadas
        
        return matchesSearch;
    });

    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setTabValue(newValue);
    };

    const handleClose = () => {
        setSearchTerm('');
        setTabValue(0);
        onClose();
    };

    const getEstadisticas = () => {
        const total = categoriasDisponibles.length;
        const usadas = categoriasUsadas.length;
        const noUsadas = total - usadas;
        const porcentaje = total > 0 ? ((usadas / total) * 100).toFixed(1) : '0';

        return { total, usadas, noUsadas, porcentaje };
    };

    const stats = getEstadisticas();

    return (
        <Dialog 
            open={open} 
            onClose={handleClose} 
            maxWidth="md" 
            fullWidth
            PaperProps={{
                sx: { borderRadius: 3, maxHeight: '90vh' }
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
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                        <CategoryIcon sx={{ color: '#6366f1' }} />
                        <Typography variant="h6" fontWeight="600" sx={{ color: '#111827' }}>
                            Categorías Disponibles
                        </Typography>
                    </Box>
                    <Typography variant="body2" sx={{ color: '#6b7280' }}>
                        Explora todas las categorías que puedes usar en tus transacciones
                    </Typography>
                </Box>
                <IconButton 
                    onClick={handleClose}
                    sx={{ color: '#6b7280' }}
                >
                    <CloseIcon />
                </IconButton>
            </DialogTitle>

            <DialogContent sx={{ pt: 3, pb: 2 }}>
                {/* Estadísticas rápidas */}
                <Box sx={{ mb: 3, p: 2, backgroundColor: '#f9fafb', borderRadius: 2 }}>
                    <Grid container spacing={2} alignItems="center">
                        <Grid item xs={6} sm={3}>
                            <Typography variant="caption" sx={{ color: '#6b7280' }}>Total</Typography>
                            <Typography variant="h6" sx={{ color: '#111827', fontWeight: 600 }}>
                                {stats.total}
                            </Typography>
                        </Grid>
                        <Grid item xs={6} sm={3}>
                            <Typography variant="caption" sx={{ color: '#6b7280' }}>Usadas</Typography>
                            <Typography variant="h6" sx={{ color: '#22c55e', fontWeight: 600 }}>
                                {stats.usadas}
                            </Typography>
                        </Grid>
                        <Grid item xs={6} sm={3}>
                            <Typography variant="caption" sx={{ color: '#6b7280' }}>Por explorar</Typography>
                            <Typography variant="h6" sx={{ color: '#f59e0b', fontWeight: 600 }}>
                                {stats.noUsadas}
                            </Typography>
                        </Grid>
                        <Grid item xs={6} sm={3}>
                            <Typography variant="caption" sx={{ color: '#6b7280' }}>% Uso</Typography>
                            <Typography variant="h6" sx={{ color: '#6366f1', fontWeight: 600 }}>
                                {stats.porcentaje}%
                            </Typography>
                        </Grid>
                    </Grid>
                </Box>

                {/* Buscador */}
                <TextField
                    fullWidth
                    placeholder="Buscar categorías por nombre o descripción..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon sx={{ color: '#6b7280' }} />
                            </InputAdornment>
                        ),
                    }}
                    sx={{ mb: 3 }}
                />

                {/* Tabs para filtrar */}
                <Tabs value={tabValue} onChange={handleTabChange} sx={{ mb: 3 }}>
                    <Tab label={`Todas (${categoriasDisponibles.length})`} />
                    <Tab label={`Mis Usadas (${categoriasUsadas.length})`} />
                    <Tab label={`Por Explorar (${stats.noUsadas})`} />
                </Tabs>

                <Divider sx={{ mb: 3 }} />

                {/* Lista de categorías */}
                <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
                    {filteredCategorias.length === 0 ? (
                        <Box sx={{ textAlign: 'center', py: 4 }}>
                            <CategoryIcon sx={{ fontSize: 48, color: '#d1d5db', mb: 2 }} />
                            <Typography variant="h6" sx={{ color: '#6b7280', mb: 1 }}>
                                No se encontraron categorías
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#9ca3af' }}>
                                {searchTerm ? 'Intenta con otros términos de búsqueda' : 'No hay categorías disponibles'}
                            </Typography>
                        </Box>
                    ) : (
                        <Grid container spacing={2}>
                            {filteredCategorias.map((categoria) => {
                                const isUsed = isUsedCategory(categoria);
                                return (
                                    <Grid item xs={12} sm={6} key={categoria.idCategoria}>
                                        <Card 
                                            elevation={0} 
                                            sx={{ 
                                                p: 2, 
                                                border: '1px solid #e5e7eb',
                                                borderRadius: 2,
                                                backgroundColor: isUsed ? '#f0fdf4' : '#ffffff',
                                                borderColor: isUsed ? '#22c55e' : '#e5e7eb',
                                                transition: 'all 0.2s ease',
                                                '&:hover': {
                                                    transform: 'translateY(-1px)',
                                                    boxShadow: '0 2px 4px -1px rgb(0 0 0 / 0.1)',
                                                }
                                            }}
                                        >
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                                <Box sx={{ flex: 1 }}>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                                        {isUsed ? 
                                                            <CheckCircleIcon sx={{ fontSize: 16, color: '#22c55e' }} /> :
                                                            <RadioButtonUncheckedIcon sx={{ fontSize: 16, color: '#d1d5db' }} />
                                                        }
                                                        <Typography variant="body1" fontWeight="600" sx={{ color: '#111827' }}>
                                                            {categoria.nombre}
                                                        </Typography>
                                                    </Box>
                                                    <Typography variant="body2" sx={{ color: '#6b7280', fontSize: '0.875rem' }}>
                                                        {categoria.descripcion}
                                                    </Typography>
                                                </Box>
                                                {isUsed && (
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
                                );
                            })}
                        </Grid>
                    )}
                </Box>
            </DialogContent>

            <DialogActions sx={{ p: 3, borderTop: '1px solid #e5e7eb' }}>
                <Button 
                    onClick={handleClose} 
                    variant="contained"
                    sx={{ 
                        backgroundColor: '#6366f1', 
                        '&:hover': { backgroundColor: '#5856eb' },
                        textTransform: 'none',
                        fontWeight: 600,
                        px: 4
                    }}
                >
                    Cerrar
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default CategoriasModal;