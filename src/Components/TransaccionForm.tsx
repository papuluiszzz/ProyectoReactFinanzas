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
import type esLocale from 'date-fns/locale/es';

interface TransaccionFormProps {
    onSubmit: (transaccionData: any) => void;
    categorias: any[];
    cuentas: any[];
    idUsuario: number;
}

const TransaccionForm: React.FC<TransaccionFormProps> = ({
    onSubmit,
    categorias,
    cuentas,
    idUsuario
}) => {
    const [formData, setFormData] = useState({
        monto:'',
        fecha: new Date(),
        descripcion:'',
        idCategoria:'',
        idCuenta:'',
        idUsuario: idUsuario
    });

    const handleChange = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit({
            ...formData,
            idUsuario: idUsuario});
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
                        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={esLocale}>
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
                            >
                                {categorias.map((categoria) => (
                                    <MenuItem key={categoria.idCategoria} value={categoria.idCategoria}>
                                        {categoria.nombre}
                                    </MenuItem>
                                ))}
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
                            >
                                {cuentas.map((cuentas) => (
                                    <MenuItem key={cuentas.idCuenta} value={cuentas.idCuenta}>
                                        {cuentas.nombre} ({cuentas.tipo})
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12}>
                        <Button 
                            type="submit" 
                            variant="contained" 
                            color="primary"
                            fullWidth
                            sx={{ mt: 2 }}
                        >
                            Registrar Transacción
                        </Button>
                    </Grid>
                </Grid>
            </form>
        </Paper>
    );
};

export default TransaccionForm;