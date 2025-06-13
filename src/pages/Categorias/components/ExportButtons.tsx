// src/components/ExportButtons.tsx
import React, { useState } from 'react';
import {
    Box,
    Button,
    Menu,
    MenuItem,
    ListItemIcon,
    ListItemText,
    CircularProgress,
    Alert,
    Snackbar
} from '@mui/material';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import TableViewIcon from '@mui/icons-material/TableView';
import { Transaccion, EstadisticasTransacciones } from '../types/transacciones.types';
import { exportToCSV, exportToPDF } from '../utils/exportUtils';

interface ExportButtonsProps {
    transacciones: Transaccion[];
    estadisticas: EstadisticasTransacciones;
    filtrosAplicados: any;
    totalRecords: number;
}

const ExportButtons: React.FC<ExportButtonsProps> = ({
    transacciones,
    estadisticas,
    filtrosAplicados,
    totalRecords
}) => {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [loading, setLoading] = useState<'csv' | 'pdf' | null>(null);
    const [notification, setNotification] = useState<{
        open: boolean;
        message: string;
        severity: 'success' | 'error';
    }>({
        open: false,
        message: '',
        severity: 'success'
    });

    const open = Boolean(anchorEl);

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const showNotification = (message: string, severity: 'success' | 'error') => {
        setNotification({ open: true, message, severity });
    };

    const handleExportCSV = async () => {
        try {
            setLoading('csv');
            handleClose();

            if (transacciones.length === 0) {
                showNotification('No hay datos para exportar', 'error');
                return;
            }

            const success = exportToCSV(transacciones, estadisticas, filtrosAplicados);
            
            if (success) {
                showNotification(
                    `✅ CSV exportado exitosamente (${transacciones.length} registros)`,
                    'success'
                );
            } else {
                showNotification('Error al exportar CSV', 'error');
            }
        } catch (error) {
            console.error('Error en exportación CSV:', error);
            showNotification('Error al exportar CSV', 'error');
        } finally {
            setLoading(null);
        }
    };

    const handleExportPDF = async () => {
        try {
            setLoading('pdf');
            handleClose();

            if (transacciones.length === 0) {
                showNotification('No hay datos para exportar', 'error');
                return;
            }

            const success = exportToPDF(transacciones, estadisticas, filtrosAplicados);
            
            if (success) {
                showNotification(
                    `✅ PDF exportado exitosamente (${transacciones.length} registros)`,
                    'success'
                );
            } else {
                showNotification('Error al exportar PDF', 'error');
            }
        } catch (error) {
            console.error('Error en exportación PDF:', error);
            showNotification('Error al exportar PDF', 'error');
        } finally {
            setLoading(null);
        }
    };

    const handleCloseNotification = () => {
        setNotification({ ...notification, open: false });
    };

    return (
        <>
            <Button
                variant="outlined"
                startIcon={loading ? <CircularProgress size={16} /> : <FileDownloadIcon />}
                onClick={handleClick}
                disabled={loading !== null || transacciones.length === 0}
                sx={{
                    textTransform: 'none',
                    fontWeight: 500,
                    borderColor: '#6366f1',
                    color: '#6366f1',
                    '&:hover': {
                        borderColor: '#5856eb',
                        backgroundColor: '#eef2ff'
                    },
                    '&:disabled': {
                        opacity: 0.6
                    }
                }}
            >
                {loading ? 'Exportando...' : 'Exportar'}
            </Button>

            <Menu
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'left',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'left',
                }}
                PaperProps={{
                    sx: {
                        borderRadius: 2,
                        border: '1px solid #e5e7eb',
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                        minWidth: 200
                    }
                }}
            >
                <MenuItem onClick={handleExportCSV} disabled={loading === 'csv'}>
                    <ListItemIcon>
                        {loading === 'csv' ? (
                            <CircularProgress size={20} />
                        ) : (
                            <TableViewIcon sx={{ color: '#22c55e' }} />
                        )}
                    </ListItemIcon>
                    <ListItemText>
                        <Box>
                            <Box sx={{ fontWeight: 600 }}>Exportar a CSV</Box>
                            <Box sx={{ fontSize: '0.75rem', color: '#6b7280' }}>
                                {totalRecords} registros • Excel compatible
                            </Box>
                        </Box>
                    </ListItemText>
                </MenuItem>

                <MenuItem onClick={handleExportPDF} disabled={loading === 'pdf'}>
                    <ListItemIcon>
                        {loading === 'pdf' ? (
                            <CircularProgress size={20} />
                        ) : (
                            <PictureAsPdfIcon sx={{ color: '#ef4444' }} />
                        )}
                    </ListItemIcon>
                    <ListItemText>
                        <Box>
                            <Box sx={{ fontWeight: 600 }}>Exportar a PDF</Box>
                            <Box sx={{ fontSize: '0.75rem', color: '#6b7280' }}>
                                {totalRecords} registros • Reporte completo
                            </Box>
                        </Box>
                    </ListItemText>
                </MenuItem>
            </Menu>

            {/* Notificaciones */}
            <Snackbar
                open={notification.open}
                autoHideDuration={4000}
                onClose={handleCloseNotification}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert 
                    onClose={handleCloseNotification} 
                    severity={notification.severity}
                    sx={{ width: '100%', borderRadius: 2 }}
                >
                    {notification.message}
                </Alert>
            </Snackbar>
        </>
    );
};

export default ExportButtons;