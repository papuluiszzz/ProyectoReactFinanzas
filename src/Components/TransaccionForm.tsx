import React, { useEffect, useState } from 'react';
import {
    Box,
    Button,
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    TextField,
    Typography,
    Paper,
    Grid
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { es } from 'date-fns/locale/es';

interface Categoria {
    idCategoria: number | string;
    nombre: string;
}

interface Cuenta {
    idCuenta: number | string;
    nombre: string;
    tipo: string;
}

interface TransaccionFormProps {
    onSubmit: (transaccionData: any) => void;
    categorias: Categoria[];
    cuentas: Cuenta[];
    idUsuario: number;
}

const TransaccionForm: React.FC<TransaccionFormProps> = ({
    onSubmit,
    categorias = [],
    cuentas = [],
    idUsuario
}) => {
    const [formData, setFormData] = useState({
        monto: '',
        fecha: new Date(),
        descripcion: '',
        idCategoria: '',
        idCuenta: '',
        idUsuario: idUsuario
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
    };

    // 🔧 FUNCIÓN PARA OBTENER CATEGORÍAS SEGURA
    const getCategoriasArray = () => {
        // Si categorias es un objeto con una propiedad 'data', extraerla
        if (categorias && typeof categorias === 'object' && 'data' in categorias) {
            return Array.isArray(categorias.data) ? categorias.data : [];
        }
        // Si categorias es directamente un array, usarlo
        if (Array.isArray(categorias)) {
            return categorias;
        }
        // Si no es ninguno de los anteriores, devolver array vacío
        return [];
    };

    // 🔧 FUNCIÓN PARA OBTENER CUENTAS SEGURA
    const getCuentasArray = () => {
        // Si cuentas es un objeto con una propiedad 'data', extraerla
        if (cuentas && typeof cuentas === 'object' && 'data' in cuentas) {
            return Array.isArray(cuentas.data) ? cuentas.data : [];
        }
        // Si cuentas es directamente un array, usarlo
        if (Array.isArray(cuentas)) {
            return cuentas;
        }
        // Si no es ninguno de los anteriores, devolver array vacío
        return [];
    };

    const categoriasArray = getCategoriasArray();
    const cuentasArray = getCuentasArray();

    return (
        <Box sx={{ maxWidth: 800, mx: 'auto', p: 0 }}>
            <Paper 
                elevation={0} 
                sx={{ 
                    p: 4,
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: 3,
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                }}
            >
                <Box sx={{ mb: 4 }}>
                    <Typography variant="h5" fontWeight="700" sx={{ color: '#111827', mb: 2 }}>
                        Nueva Transacción
                    </Typography>
                    <Typography variant="body1" sx={{ color: '#6b7280' }}>
                        Registra un nuevo movimiento financiero en tu cuenta
                    </Typography>
                </Box>

                <form onSubmit={handleSubmit}>
                    <Grid container spacing={3}>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="Monto"
                                name="monto"
                                type="number"
                                value={formData.monto}
                                onChange={handleChange}
                                required
                                InputProps={{
                                    startAdornment: <Typography sx={{ mr: 1, color: '#6b7280' }}>$</Typography>,
                                }}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: 2,
                                        '&:hover fieldset': {
                                            borderColor: '#6366f1',
                                        },
                                        '&.Mui-focused fieldset': {
                                            borderColor: '#6366f1',
                                        },
                                    },
                                }}
                            />
                        </Grid>
                        
                        <Grid item xs={12} md={6}>
                            <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
                                <DatePicker
                                    label="Fecha de la transacción"
                                    value={formData.fecha}
                                    onChange={(newValue) => {
                                        if (newValue) {
                                            setFormData(prev => ({ ...prev, fecha: newValue }));
                                        }
                                    }}
                                    renderInput={(params) => 
                                        <TextField 
                                            {...params} 
                                            fullWidth 
                                            sx={{
                                                '& .MuiOutlinedInput-root': {
                                                    borderRadius: 2,
                                                    height: '56px', // 🔧 Altura fija más grande
                                                    fontSize: '1rem',
                                                    '& input': {
                                                        padding: '16px 14px', // 🔧 Padding interno más grande
                                                        fontSize: '1rem',
                                                    },
                                                    '&:hover fieldset': {
                                                        borderColor: '#6366f1',
                                                    },
                                                    '&.Mui-focused fieldset': {
                                                        borderColor: '#6366f1',
                                                    },
                                                },
                                                '& .MuiInputLabel-root': {
                                                    fontSize: '1rem', // 🔧 Label más grande
                                                    '&.Mui-focused': {
                                                        color: '#6366f1',
                                                    },
                                                },
                                                '& .MuiIconButton-root': {
                                                    padding: '12px', // 🔧 Icono del calendario más grande
                                                    '& svg': {
                                                        fontSize: '1.5rem',
                                                    },
                                                },
                                            }}
                                        />
                                    }
                                    componentsProps={{
                                        actionBar: {
                                            actions: ['accept', 'cancel', 'today'],
                                        },
                                    }}
                                />
                            </LocalizationProvider>
                        </Grid>
                        
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Descripción"
                                name="descripcion"
                                value={formData.descripcion}
                                onChange={handleChange}
                                required
                                multiline
                                rows={3}
                                placeholder="Describe brevemente esta transacción..."
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: 2,
                                        '&:hover fieldset': {
                                            borderColor: '#6366f1',
                                        },
                                        '&.Mui-focused fieldset': {
                                            borderColor: '#6366f1',
                                        },
                                    },
                                }}
                            />
                        </Grid>
                        
                        <Grid item xs={12} md={6}>
                            <FormControl 
                                fullWidth
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: 2,
                                        '&:hover fieldset': {
                                            borderColor: '#6366f1',
                                        },
                                        '&.Mui-focused fieldset': {
                                            borderColor: '#6366f1',
                                        },
                                    },
                                }}
                            >
                                <InputLabel id="categoria-label">Categoría</InputLabel>
                                <Select
                                    labelId="categoria-label"
                                    label="Categoría"
                                    name="idCategoria"
                                    value={formData.idCategoria}
                                    onChange={(e) => setFormData(prev => ({ ...prev, idCategoria: e.target.value }))}
                                    required
                                >
                                    {categoriasArray.length > 0 ? (
                                        categoriasArray.map((categoria) => (
                                            <MenuItem key={categoria.idCategoria} value={categoria.idCategoria}>
                                                {categoria.nombre}
                                            </MenuItem>
                                        ))
                                    ) : (
                                        <MenuItem disabled value="">
                                            No hay categorías disponibles
                                        </MenuItem>
                                    )}
                                </Select>
                            </FormControl>
                        </Grid>
                        
                        <Grid item xs={12} md={6}>
                            <FormControl 
                                fullWidth
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: 2,
                                        '&:hover fieldset': {
                                            borderColor: '#6366f1',
                                        },
                                        '&.Mui-focused fieldset': {
                                            borderColor: '#6366f1',
                                        },
                                    },
                                }}
                            >
                                <InputLabel id="cuenta-label">Cuenta</InputLabel>
                                <Select
                                    labelId="cuenta-label"
                                    label="Cuenta"
                                    name="idCuenta"
                                    value={formData.idCuenta}
                                    onChange={(e) => setFormData(prev => ({ ...prev, idCuenta: e.target.value }))}
                                    required
                                >
                                    {cuentasArray.length > 0 ? (
                                        cuentasArray.map((cuenta) => (
                                            <MenuItem key={cuenta.idCuenta} value={cuenta.idCuenta}>
                                                {cuenta.nombre} ({cuenta.tipo})
                                            </MenuItem>
                                        ))
                                    ) : (
                                        <MenuItem disabled value="">
                                            No hay cuentas disponibles
                                        </MenuItem>
                                    )}
                                </Select>
                            </FormControl>
                        </Grid>
                        
                        <Grid item xs={12}>
                            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 2 }}>
                                <Button 
                                    variant="outlined"
                                    sx={{
                                        borderRadius: 2,
                                        px: 4,
                                        py: 1.5,
                                        fontSize: '1rem',
                                        textTransform: 'none',
                                        fontWeight: 500,
                                        borderColor: '#d1d5db',
                                        color: '#6b7280',
                                        '&:hover': {
                                            borderColor: '#6366f1',
                                            color: '#6366f1',
                                            backgroundColor: '#f8fafc',
                                        }
                                    }}
                                >
                                    Cancelar
                                </Button>
                                <Button 
                                    type="submit" 
                                    variant="contained"
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
                                    Registrar Transacción
                                </Button>
                            </Box>
                        </Grid>
                    </Grid>
                </form>
            </Paper>
        </Box>
    );
};

export default TransaccionForm;