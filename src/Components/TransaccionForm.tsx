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
import ClearAllIcon from '@mui/icons-material/ClearAll';

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
    // Debug - ver qué llega
    console.log('Categorias recibidas:', categorias);
    console.log('Cuentas recibidas:', cuentas);
    console.log('Es categorias un array?', Array.isArray(categorias));
    console.log('Es cuentas un array?', Array.isArray(cuentas));

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

    const handleClearForm = () => {
        setFormData({
            monto: '',
            fecha: new Date(),
            descripcion: '',
            idCategoria: '',
            idCuenta: '',
            idUsuario: idUsuario
        });
    };

    return (
        <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
                Nueva Transacción
            </Typography>
            <form onSubmit={handleSubmit}>
                <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                        <TextField
                            fullWidth
                            label="Monto"
                            name="monto"
                            type="number"
                            value={formData.monto}
                            onChange={handleChange}
                            required
                        />
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
                            <DatePicker
                                label="Fecha"
                                value={formData.fecha}
                                onChange={(newValue) => {
                                    if (newValue) {
                                        setFormData(prev => ({ ...prev, fecha: newValue }));
                                    }
                                }}
                                renderInput={(params) => <TextField {...params} fullWidth />}
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
                        />
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <FormControl fullWidth>
                            <InputLabel id="categoria-label">Categoría</InputLabel>
                            <Select
                                labelId="categoria-label"
                                label="Categoría"
                                name="idCategoria"
                                value={formData.idCategoria}
                                onChange={(e) => setFormData(prev => ({ ...prev, idCategoria: e.target.value }))}
                                required
                                MenuProps={{
                                    PaperProps: {
                                        style: {
                                            maxHeight: 300,
                                            minWidth: 250,
                                        },
                                    },
                                    anchorOrigin: {
                                        vertical: 'bottom',
                                        horizontal: 'left',
                                    },
                                    transformOrigin: {
                                        vertical: 'top',
                                        horizontal: 'left',
                                    },
                                }}
                            >
                                {(() => {
                                    // Intentar diferentes estructuras de datos
                                    let categoriasArray = [];
                                    
                                    if (Array.isArray(categorias)) {
                                        categoriasArray = categorias;
                                    } else if (categorias && categorias.data && Array.isArray(categorias.data)) {
                                        categoriasArray = categorias.data;
                                    } else if (categorias && typeof categorias === 'object') {
                                        console.log('Categorias no es array, estructura:', categorias);
                                    }
                                    
                                    return categoriasArray.map((categoria) => (
                                        <MenuItem 
                                            key={categoria.idCategoria} 
                                            value={categoria.idCategoria}
                                            sx={{
                                                minHeight: 48,
                                                padding: '12px 16px',
                                                fontSize: '1rem',
                                                '&:hover': {
                                                    backgroundColor: '#f5f5f5',
                                                }
                                            }}
                                        >
                                            {categoria.nombre}
                                        </MenuItem>
                                    ));
                                })()}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <FormControl fullWidth>
                            <InputLabel id="cuenta-label">Cuenta</InputLabel>
                            <Select
                                labelId="cuenta-label"
                                label="Cuenta"
                                name="idCuenta"
                                value={formData.idCuenta}
                                onChange={(e) => setFormData(prev => ({ ...prev, idCuenta: e.target.value }))}
                                required
                                MenuProps={{
                                    PaperProps: {
                                        style: {
                                            maxHeight: 300,
                                            minWidth: 280,
                                        },
                                    },
                                    anchorOrigin: {
                                        vertical: 'bottom',
                                        horizontal: 'left',
                                    },
                                    transformOrigin: {
                                        vertical: 'top',
                                        horizontal: 'left',
                                    },
                                }}
                            >
                                {(() => {
                                    // Intentar diferentes estructuras de datos
                                    let cuentasArray = [];
                                    
                                    if (Array.isArray(cuentas)) {
                                        cuentasArray = cuentas;
                                    } else if (cuentas && cuentas.data && Array.isArray(cuentas.data)) {
                                        cuentasArray = cuentas.data;
                                    } else if (cuentas && typeof cuentas === 'object') {
                                        console.log('Cuentas no es array, estructura:', cuentas);
                                    }
                                    
                                    return cuentasArray.map((cuenta) => (
                                        <MenuItem key={cuenta.idCuenta} value={cuenta.idCuenta}>
                                            {cuenta.nombre} ({cuenta.tipo})
                                        </MenuItem>
                                    ));
                                })()}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12}>
                        <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                            <Button 
                                variant="outlined"
                                startIcon={<ClearAllIcon />}
                                onClick={handleClearForm}
                                sx={{ 
                                    py: 1.5,
                                    fontSize: '1rem'
                                }}
                            >
                                Limpiar Campos
                            </Button>
                            <Button 
                                type="submit" 
                                variant="contained" 
                                color="primary"
                                sx={{ 
                                    py: 1.5,
                                    fontSize: '1.1rem',
                                    flex: 1
                                }}
                            >
                                Registrar Transacción
                            </Button>
                        </Box>
                    </Grid>
                </Grid>
            </form>
        </Paper>
    );
};

export default TransaccionForm;