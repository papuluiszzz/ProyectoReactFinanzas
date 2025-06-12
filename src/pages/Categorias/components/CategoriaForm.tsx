// src/pages/Categorias/components/CategoriaForm.tsx
// 🎯 RESPONSABILIDAD: Formulario - Crear/editar (100-150 líneas)

import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    Typography,
    IconButton,
    Alert,
    Box,
    Divider
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SaveIcon from '@mui/icons-material/Save';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import type { FormData, Categoria } from '../types/categoria.types';

interface CategoriaFormProps {
    open: boolean;
    editMode: boolean;
    selectedCategoria: Categoria | null;
    onClose: () => void;
    onSubmit: (formData: FormData, editMode: boolean, selectedCategoria?: Categoria) => Promise<boolean>;
}

const CategoriaForm: React.FC<CategoriaFormProps> = ({
    open,
    editMode,
    selectedCategoria,
    onClose,
    onSubmit
}) => {
    const [formData, setFormData] = useState<FormData>({ nombre: '', descripcion: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Efecto para actualizar formulario cuando cambian las props
    useEffect(() => {
        if (editMode && selectedCategoria) {
            setFormData({ 
                nombre: selectedCategoria.nombre, 
                descripcion: selectedCategoria.descripcion 
            });
        } else {
            setFormData({ nombre: '', descripcion: '' });
        }
        setErrors({});
    }, [editMode, selectedCategoria, open]);

    // Validaciones
    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!formData.nombre.trim()) {
            newErrors.nombre = 'El nombre es requerido';
        } else if (formData.nombre.trim().length < 3) {
            newErrors.nombre = 'El nombre debe tener al menos 3 caracteres';
        } else if (formData.nombre.trim().length > 50) {
            newErrors.nombre = 'El nombre no puede exceder 50 caracteres';
        }

        if (!formData.descripcion.trim()) {
            newErrors.descripcion = 'La descripción es requerida';
        } else if (formData.descripcion.trim().length < 10) {
            newErrors.descripcion = 'La descripción debe tener al menos 10 caracteres';
        } else if (formData.descripcion.trim().length > 200) {
            newErrors.descripcion = 'La descripción no puede exceder 200 caracteres';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Handlers
    const handleInputChange = (field: keyof FormData, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        // Limpiar error del campo cuando el usuario empiece a escribir
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;

        setIsSubmitting(true);
        try {
            const success = await onSubmit(formData, editMode, selectedCategoria || undefined);
            if (success) {
                handleClose();
            }
        } catch (error) {
            console.error('Error submitting form:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        setFormData({ nombre: '', descripcion: '' });
        setErrors({});
        setIsSubmitting(false);
        onClose();
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && e.ctrlKey) {
            handleSubmit();
        }
    };

    return (
        <Dialog 
            open={open} 
            onClose={handleClose} 
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
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    {editMode ? <EditIcon sx={{ color: '#6366f1' }} /> : <AddIcon sx={{ color: '#6366f1' }} />}
                    <Typography variant="h6" fontWeight="600" sx={{ color: '#111827' }}>
                        {editMode ? 'Editar Categoría' : 'Nueva Categoría'}
                    </Typography>
                </Box>
                <IconButton 
                    onClick={handleClose}
                    sx={{ color: '#6b7280' }}
                    disabled={isSubmitting}
                >
                    <CloseIcon />
                </IconButton>
            </DialogTitle>

            <DialogContent sx={{ pt: 3, pb: 2 }} onKeyPress={handleKeyPress}>
                {!editMode && (
                    <>
                        <Alert severity="info" sx={{ mb: 3, borderRadius: 2 }}>
                            <Typography variant="body2" color='black'>
                                <strong>💡 Tip:</strong> Las categorías nuevas estarán disponibles para todos los usuarios. 
                                Si ya existe una con el mismo nombre, podrás empezar a usarla automáticamente.
                            </Typography>
                        </Alert>
                        <Divider sx={{ mb: 3 }} />
                    </>
                )}

                <TextField
                    fullWidth
                    label="Nombre de la categoría"
                    value={formData.nombre}
                    onChange={(e) => handleInputChange('nombre', e.target.value)}
                    error={!!errors.nombre}
                    helperText={errors.nombre || `${formData.nombre.length}/50 caracteres`}
                    sx={{ mb: 3 }}
                    placeholder="Ej: Alimentación, Transporte, Entretenimiento"
                    variant="outlined"
                    disabled={isSubmitting}
                    autoFocus
                />

                <TextField
                    fullWidth
                    label="Descripción"
                    value={formData.descripcion}
                    onChange={(e) => handleInputChange('descripcion', e.target.value)}
                    error={!!errors.descripcion}
                    helperText={errors.descripcion || `${formData.descripcion.length}/200 caracteres`}
                    multiline
                    rows={3}
                    placeholder="Descripción detallada de la categoría y su propósito"
                    variant="outlined"
                    disabled={isSubmitting}
                />
            </DialogContent>

            <DialogActions sx={{ p: 3, borderTop: '1px solid #e5e7eb' }}>
                <Button 
                    onClick={handleClose} 
                    disabled={isSubmitting}
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
                    disabled={isSubmitting}
                    startIcon={isSubmitting ? null : <SaveIcon />}
                    sx={{ 
                        backgroundColor: '#6366f1', 
                        '&:hover': { backgroundColor: '#5856eb' },
                        textTransform: 'none',
                        fontWeight: 600,
                        px: 3
                    }}
                >
                    {isSubmitting ? 'Guardando...' : (editMode ? 'Actualizar' : 'Crear')}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default CategoriaForm;