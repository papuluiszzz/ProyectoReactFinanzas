// src/pages/Categorias/index.tsx
// 🎯 RESPONSABILIDAD: Coordinador - Ensamblar componentes (100-150 líneas)

import React, { useState, useEffect } from 'react';
import { Box, Alert, CircularProgress, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import LogoutIcon from '@mui/icons-material/Logout';
import CategoryIcon from '@mui/icons-material/Category';
import InfoIcon from '@mui/icons-material/Info';
import AddIcon from '@mui/icons-material/Add';

// Componentes
import CategoriasList from './components/CategoriasList';
import CategoriaForm from './components/CategoriaForm';
import CategoriasModal from './components/CategoriasModal';
import StatsCards from './components/StatsCards';

// Hooks
import { useCategorias } from './hooks/useCategorias';
import { usePermisos } from './hooks/usePermisos';
import { useAlert } from './hooks/useAlert';

// Types
import type { CategoriasProps, Categoria } from './types/categoria.types';

const Categorias: React.FC<CategoriasProps> = ({ onLogout }) => {
    const navigate = useNavigate();
    const userName = localStorage.getItem('userName') || 'Usuario';
    
    // Hooks principales
    const { alert, showAlert } = useAlert();
    const { permisosMap, verificarMultiplesPermisos } = usePermisos();
    const {
        categorias,
        categoriasDisponibles,
        loading,
        submitCategoria,
        deleteCategoria
    } = useCategorias(onLogout, showAlert);

    // Estados para modales y formularios
    const [openDialog, setOpenDialog] = useState(false);
    const [openInfoDialog, setOpenInfoDialog] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [selectedCategoria, setSelectedCategoria] = useState<Categoria | null>(null);

    // Verificar permisos cuando las categorías cambien
    useEffect(() => {
        if (categorias.length > 0) {
            verificarMultiplesPermisos(categorias);
        }
    }, [categorias, verificarMultiplesPermisos]);

    // Handlers para el formulario
    const handleOpenDialog = (categoria?: Categoria) => {
        if (categoria) {
            setEditMode(true);
            setSelectedCategoria(categoria);
        } else {
            setEditMode(false);
            setSelectedCategoria(null);
        }
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setEditMode(false);
        setSelectedCategoria(null);
    };

    // Handlers para acciones de categorías
    const handleEdit = (categoria: Categoria) => {
        handleOpenDialog(categoria);
    };

    const handleDelete = async (categoria: Categoria) => {
        await deleteCategoria(categoria, permisosMap);
    };

    // Handler para submit del formulario
    const handleSubmit = async (formData: any, editMode: boolean, selectedCategoria?: Categoria) => {
        const success = await submitCategoria(formData, editMode, selectedCategoria);
        return success;
    };

    // Handler para logout
    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('userName');
        localStorage.removeItem('userId');
        onLogout();
    };

    // Mostrar loading mientras se cargan los datos
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
                    <StatsCards 
                        categoriasUsadas={categorias.length}
                        categoriasDisponibles={categoriasDisponibles.length}
                    />
                </Box>

                {/* Alertas del sistema */}
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

                {/* Lista principal de categorías */}
                <CategoriasList 
                    categorias={categorias}
                    permisosMap={permisosMap}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onOpenDialog={() => handleOpenDialog()}
                />
            </Box>

            {/* Modal para crear/editar categoría */}
            <CategoriaForm
                open={openDialog}
                editMode={editMode}
                selectedCategoria={selectedCategoria}
                onClose={handleCloseDialog}
                onSubmit={handleSubmit}
            />

            {/* Modal para ver categorías disponibles */}
            <CategoriasModal
                open={openInfoDialog}
                categoriasDisponibles={categoriasDisponibles}
                categoriasUsadas={categorias}
                onClose={() => setOpenInfoDialog(false)}
            />
        </Box>
    );
};

export default Categorias;