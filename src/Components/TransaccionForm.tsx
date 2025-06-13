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
    Grid,
    Chip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Alert,
    AlertTitle
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { es } from 'date-fns/locale/es';
import ClearAllIcon from '@mui/icons-material/ClearAll';
import ErrorIcon from '@mui/icons-material/Error';
import WarningIcon from '@mui/icons-material/Warning';
import BlockIcon from '@mui/icons-material/Block';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

interface Categoria {
    idCategoria: number | string;
    nombre: string;
}

interface Cuenta {
    idCuenta: number | string;
    nombre: string;
    tipo: string;
    saldo: number;
    estado: string;
    tipoCuenta: string;
}

interface TipoTransaccion {
    idTipoTransaccion: number | string;
    descripcion: string;
}

interface TransaccionFormProps {
    onSubmit: (transaccionData: any) => void;
    categorias: Categoria[];
    cuentas: Cuenta[];
    tiposTransaccion: TipoTransaccion[];
    idUsuario: number;
}

const TransaccionForm: React.FC<TransaccionFormProps> = ({
    onSubmit,
    categorias = [],
    cuentas = [],
    tiposTransaccion = [],
    idUsuario
}) => {
    // Debug - ver qué llega
    console.log('Categorias recibidas:', categorias);
    console.log('Cuentas recibidas:', cuentas);
    console.log('Tipos transacción recibidos:', tiposTransaccion);
    console.log('Es categorias un array?', Array.isArray(categorias));
    console.log('Es cuentas un array?', Array.isArray(cuentas));
    console.log('Es tiposTransaccion un array?', Array.isArray(tiposTransaccion));

    const [formData, setFormData] = useState({
        monto: '',
        fecha: new Date(),
        descripcion: '',
        idCategoria: '',
        idCuenta: '',
        idTipoTransaccion: '',
        idUsuario: idUsuario
    });

    // Estados para alertas personalizadas
    const [alertDialog, setAlertDialog] = useState({
        open: false,
        type: 'error' as 'error' | 'warning' | 'blocked' | 'success',
        title: '',
        message: '',
        details: '',
        onConfirm: null as (() => void) | null,
        confirmText: 'Aceptar',
        showCancel: false
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const showCustomAlert = (
        type: 'error' | 'warning' | 'blocked' | 'success',
        title: string,
        message: string,
        details: string = '',
        onConfirm: (() => void) | null = null,
        confirmText: string = 'Aceptar',
        showCancel: boolean = false
    ) => {
        setAlertDialog({
            open: true,
            type,
            title,
            message,
            details,
            onConfirm,
            confirmText,
            showCancel
        });
    };

    const handleAlertClose = () => {
        setAlertDialog({ ...alertDialog, open: false });
    };

    const handleAlertConfirm = () => {
        if (alertDialog.onConfirm) {
            alertDialog.onConfirm();
        }
        handleAlertClose();
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        // Obtener cuenta seleccionada
        const cuentaSeleccionada = (() => {
            let cuentasArray = [];
            if (Array.isArray(cuentas)) {
                cuentasArray = cuentas;
            } else if (cuentas && cuentas.data && Array.isArray(cuentas.data)) {
                cuentasArray = cuentas.data;
            } else if (cuentas && cuentas.success && Array.isArray(cuentas.data)) {
                cuentasArray = cuentas.data;
            }
            return cuentasArray.find(c => c.idCuenta == formData.idCuenta);
        })();
        
        // ✅ VALIDAR QUE LA CUENTA ESTÉ ACTIVA
        if (cuentaSeleccionada && cuentaSeleccionada.estado === 'inactivo') {
            showCustomAlert(
                'blocked',
                '🚫 Cuenta Inactiva',
                `La cuenta "${cuentaSeleccionada.nombre}" está inactiva.`,
                'No puedes realizar transacciones con cuentas inactivas. Ve a "Mis Cuentas" y actívala primero para poder usarla.'
            );
            return;
        }
        
        // Validar si es un gasto y si tiene suficiente saldo
        const tipoSeleccionado = tiposTransaccion.find(t => t.idTipoTransaccion == formData.idTipoTransaccion);
        
        if (tipoSeleccionado?.descripcion === 'Gasto' && cuentaSeleccionada) {
            const monto = parseFloat(formData.monto);
            if (monto > cuentaSeleccionada.saldo) {
                showCustomAlert(
                    'error',
                    '💸 Saldo Insuficiente',
                    `No puedes gastar más de lo que tienes disponible.`,
                    `Monto que intentas gastar: $${monto.toLocaleString('es-CO')}\nSaldo disponible en "${cuentaSeleccionada.nombre}": $${cuentaSeleccionada.saldo.toLocaleString('es-CO')}\n\nDiferencia faltante: $${(monto - cuentaSeleccionada.saldo).toLocaleString('es-CO')}`
                );
                return;
            }
            
            // Alerta de saldo bajo después del gasto
            const saldoRestante = cuentaSeleccionada.saldo - monto;
            if (saldoRestante < 50000 && saldoRestante > 0) {
                showCustomAlert(
                    'warning',
                    '⚠️ Advertencia de Saldo Bajo',
                    `Después de este gasto tu saldo quedará muy bajo.`,
                    `Saldo actual: $${cuentaSeleccionada.saldo.toLocaleString('es-CO')}\nSaldo después del gasto: $${saldoRestante.toLocaleString('es-CO')}\n\nTe recomendamos tener cuidado con futuros gastos.`,
                    () => onSubmit(formData),
                    'Continuar de todas formas',
                    true
                );
                return;
            }

            // Alerta de éxito para gastos normales
            if (saldoRestante >= 50000) {
                showCustomAlert(
                    'success',
                    '✅ Gasto Autorizado',
                    `Tu gasto de $${monto.toLocaleString('es-CO')} será procesado.`,
                    `Saldo restante: $${saldoRestante.toLocaleString('es-CO')}\nCuenta: ${cuentaSeleccionada.nombre}`,
                    () => onSubmit(formData),
                    'Confirmar Gasto',
                    true
                );
                return;
            }
        }
        
        // Para ingresos, mostrar confirmación positiva
        if (tipoSeleccionado?.descripcion === 'Ingreso' && cuentaSeleccionada) {
            const monto = parseFloat(formData.monto);
            const saldoFinal = cuentaSeleccionada.saldo + monto;
            
            showCustomAlert(
                'success',
                '💰 Ingreso Confirmado',
                `Tu ingreso de $${monto.toLocaleString('es-CO')} será registrado.`,
                `Saldo actual: $${cuentaSeleccionada.saldo.toLocaleString('es-CO')}\nSaldo después del ingreso: $${saldoFinal.toLocaleString('es-CO')}\nCuenta: ${cuentaSeleccionada.nombre}`,
                () => onSubmit(formData),
                'Registrar Ingreso',
                true
            );
            return;
        }
        
        // Fallback para otros casos
        onSubmit(formData);
    };

    const handleClearForm = () => {
        setFormData({
            monto: '',
            fecha: new Date(),
            descripcion: '',
            idCategoria: '',
            idCuenta: '',
            idTipoTransaccion: '',
            idUsuario: idUsuario
        });
    };

    const getAlertIcon = () => {
        switch (alertDialog.type) {
            case 'error': return <ErrorIcon sx={{ fontSize: 40, color: '#ef4444' }} />;
            case 'warning': return <WarningIcon sx={{ fontSize: 40, color: '#f59e0b' }} />;
            case 'blocked': return <BlockIcon sx={{ fontSize: 40, color: '#6b7280' }} />;
            case 'success': return <CheckCircleIcon sx={{ fontSize: 40, color: '#22c55e' }} />;
            default: return <ErrorIcon sx={{ fontSize: 40, color: '#ef4444' }} />;
        }
    };

    const getAlertColor = () => {
        switch (alertDialog.type) {
            case 'error': return { bg: '#fef2f2', border: '#ef4444', text: '#dc2626' };
            case 'warning': return { bg: '#fffbeb', border: '#f59e0b', text: '#d97706' };
            case 'blocked': return { bg: '#f9fafb', border: '#6b7280', text: '#374151' };
            case 'success': return { bg: '#f0fdf4', border: '#22c55e', text: '#16a34a' };
            default: return { bg: '#fef2f2', border: '#ef4444', text: '#dc2626' };
        }
    };

    return (
        <>
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
                        <Grid item xs={12} md={4}>
                            <FormControl fullWidth>
                                <InputLabel id="tipo-transaccion-label">Tipo de Transacción</InputLabel>
                                <Select
                                    labelId="tipo-transaccion-label"
                                    label="Tipo de Transacción"
                                    name="idTipoTransaccion"
                                    value={formData.idTipoTransaccion}
                                    onChange={(e) => setFormData(prev => ({ ...prev, idTipoTransaccion: e.target.value }))}
                                    required
                                    MenuProps={{
                                        PaperProps: {
                                            style: {
                                                maxHeight: 300,
                                                minWidth: 200,
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
                                        let tiposArray = [];
                                        
                                        if (Array.isArray(tiposTransaccion)) {
                                            tiposArray = tiposTransaccion;
                                        } else if (tiposTransaccion && tiposTransaccion.data && Array.isArray(tiposTransaccion.data)) {
                                            tiposArray = tiposTransaccion.data;
                                        } else if (tiposTransaccion && tiposTransaccion.success && Array.isArray(tiposTransaccion.data)) {
                                            tiposArray = tiposTransaccion.data;
                                        } else {
                                            console.log('TiposTransaccion estructura:', tiposTransaccion);
                                            tiposArray = [];
                                        }
                                        
                                        return tiposArray.map((tipo) => (
                                            <MenuItem 
                                                key={tipo.idTipoTransaccion} 
                                                value={tipo.idTipoTransaccion}
                                                sx={{
                                                    minHeight: 48,
                                                    padding: '12px 16px',
                                                    fontSize: '1rem',
                                                    '&:hover': {
                                                        backgroundColor: '#f5f5f5',
                                                    }
                                                }}
                                            >
                                                {tipo.descripcion}
                                            </MenuItem>
                                        ));
                                    })()}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} md={4}>
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
                                        let categoriasArray = [];
                                        
                                        if (Array.isArray(categorias)) {
                                            categoriasArray = categorias;
                                        } else if (categorias && categorias.data && Array.isArray(categorias.data)) {
                                            categoriasArray = categorias.data;
                                        } else if (categorias && categorias.success && Array.isArray(categorias.data)) {
                                            categoriasArray = categorias.data;
                                        } else {
                                            console.log('Categorias estructura:', categorias);
                                            categoriasArray = [];
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
                        <Grid item xs={12} md={4}>
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
                                                minWidth: 320,
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
                                        let cuentasArray = [];
                                        
                                        if (Array.isArray(cuentas)) {
                                            cuentasArray = cuentas;
                                        } else if (cuentas && cuentas.data && Array.isArray(cuentas.data)) {
                                            cuentasArray = cuentas.data;
                                        } else if (cuentas && cuentas.success && Array.isArray(cuentas.data)) {
                                            cuentasArray = cuentas.data;
                                        } else {
                                            console.log('Cuentas estructura:', cuentas);
                                            cuentasArray = [];
                                        }
                                        
                                        // ✅ FILTRAR SOLO CUENTAS ACTIVAS
                                        const cuentasActivas = cuentasArray.filter(cuenta => cuenta.estado === 'activo');
                                        
                                        if (cuentasActivas.length === 0) {
                                            return (
                                                <MenuItem disabled value="">
                                                    <em style={{ color: '#ef4444' }}>No tienes cuentas activas disponibles</em>
                                                </MenuItem>
                                            );
                                        }
                                        
                                        return cuentasActivas.map((cuenta) => (
                                            <MenuItem key={cuenta.idCuenta} value={cuenta.idCuenta}>
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                                                    <span>{cuenta.nombre} ({cuenta.tipoCuenta})</span>
                                                    <Chip 
                                                        label={`$${cuenta.saldo.toLocaleString('es-CO')}`}
                                                        size="small"
                                                        color={cuenta.saldo > 100000 ? 'success' : cuenta.saldo > 50000 ? 'warning' : 'error'}
                                                        sx={{ ml: 1, fontSize: '0.75rem' }}
                                                    />
                                                </Box>
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

            {/* Dialog de Alerta Personalizada */}
            <Dialog 
                open={alertDialog.open} 
                onClose={handleAlertClose}
                maxWidth="sm"
                fullWidth
                PaperProps={{
                    sx: {
                        borderRadius: 3,
                        border: `2px solid ${getAlertColor().border}`,
                        backgroundColor: getAlertColor().bg
                    }
                }}
            >
                <DialogTitle sx={{ 
                    textAlign: 'center', 
                    pt: 3,
                    pb: 1,
                    color: getAlertColor().text
                }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                        {getAlertIcon()}
                        <Typography variant="h5" fontWeight="700" sx={{ color: getAlertColor().text }}>
                            {alertDialog.title}
                        </Typography>
                    </Box>
                </DialogTitle>
                
                <DialogContent sx={{ textAlign: 'center', pb: 2 }}>
                    <Typography variant="h6" sx={{ mb: 2, color: getAlertColor().text, fontWeight: 500 }}>
                        {alertDialog.message}
                    </Typography>
                    
                    {alertDialog.details && (
                        <Box sx={{ 
                            backgroundColor: 'rgba(255,255,255,0.8)', 
                            borderRadius: 2, 
                            p: 2, 
                            mt: 2,
                            border: `1px solid ${getAlertColor().border}20`
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
                                {alertDialog.details}
                            </Typography>
                        </Box>
                    )}
                </DialogContent>

                <DialogActions sx={{ justifyContent: 'center', pb: 3, gap: 2 }}>
                    {alertDialog.showCancel && (
                        <Button 
                            onClick={handleAlertClose}
                            variant="outlined"
                            sx={{ 
                                borderColor: '#6b7280',
                                color: '#6b7280',
                                px: 3,
                                py: 1,
                                fontWeight: 600,
                                '&:hover': {
                                    borderColor: '#374151',
                                    color: '#374151'
                                }
                            }}
                        >
                            Cancelar
                        </Button>
                    )}
                    
                    <Button
                        onClick={handleAlertConfirm}
                        variant="contained"
                        sx={{ 
                            backgroundColor: getAlertColor().border,
                            color: 'white',
                            px: 4,
                            py: 1,
                            fontWeight: 700,
                            '&:hover': {
                                backgroundColor: getAlertColor().text
                            }
                        }}
                    >
                        {alertDialog.confirmText}
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default TransaccionForm;