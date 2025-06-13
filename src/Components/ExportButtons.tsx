// src/Components/ExportButtons.tsx - CON EXPORTACIÓN PDF REAL
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

// ✅ TIPOS CORREGIDOS - Usando la estructura real de tu proyecto
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

interface EstadisticasTransacciones {
    totalTransacciones: number;
    totalIngresos: number;
    totalGastos: number;
    balance: number;
}

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

    // ✅ FUNCIÓN EXPORT CSV (igual que antes)
    const handleExportCSV = async () => {
        try {
            setLoading('csv');
            handleClose();

            if (transacciones.length === 0) {
                showNotification('No hay datos para exportar', 'error');
                return;
            }

            // Crear encabezados del CSV
            const headers = [
                'Fecha',
                'Descripción',
                'Categoría',
                'Tipo de Transacción',
                'Cuenta',
                'Monto'
            ];

            // Convertir transacciones a formato CSV
            const csvData = transacciones.map(transaccion => [
                new Date(transaccion.fecha).toLocaleDateString('es-CO'),
                `"${transaccion.descripcion.replace(/"/g, '""')}"`,
                transaccion.categoria,
                transaccion.tipoTransaccion,
                transaccion.cuenta,
                transaccion.monto.toString()
            ]);

            // Agregar resumen
            const resumenData = [
                [],
                ['=== RESUMEN ==='],
                ['Total Transacciones', estadisticas.totalTransacciones.toString()],
                ['Total Ingresos', estadisticas.totalIngresos.toString()],
                ['Total Gastos', estadisticas.totalGastos.toString()],
                ['Balance', estadisticas.balance.toString()]
            ];

            const allData = [headers, ...csvData, ...resumenData];
            const csvString = allData.map(row => row.join(',')).join('\n');
            
            const blob = new Blob(['\uFEFF' + csvString], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);
            
            link.setAttribute('href', url);
            link.setAttribute('download', `transacciones_${new Date().getTime()}.csv`);
            link.style.visibility = 'hidden';
            
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            showNotification(
                `✅ CSV exportado exitosamente (${transacciones.length} registros)`,
                'success'
            );

        } catch (error) {
            console.error('Error en exportación CSV:', error);
            showNotification('Error al exportar CSV', 'error');
        } finally {
            setLoading(null);
        }
    };

    // ✅ FUNCIÓN EXPORT PDF REAL CON jsPDF
    const handleExportPDF = async () => {
        try {
            setLoading('pdf');
            handleClose();

            if (transacciones.length === 0) {
                showNotification('No hay datos para exportar', 'error');
                return;
            }

            // Importar jsPDF dinámicamente
            const jsPDF = (await import('jspdf')).default;
            const doc = new jsPDF();

            // Configuración del documento
            const pageWidth = doc.internal.pageSize.width;
            const pageHeight = doc.internal.pageSize.height;
            const margin = 20;
            let currentY = margin;

            // Función para formatear moneda
            const formatCurrency = (amount: number) => {
                return new Intl.NumberFormat('es-CO', {
                    style: 'currency',
                    currency: 'COP'
                }).format(amount);
            };

            // Función para agregar nueva página si es necesario
            const checkPageBreak = (requiredSpace: number) => {
                if (currentY + requiredSpace > pageHeight - margin) {
                    doc.addPage();
                    currentY = margin;
                    return true;
                }
                return false;
            };

            // TÍTULO DEL REPORTE
            doc.setFontSize(20);
            doc.setFont('helvetica', 'bold');
            doc.text('REPORTE DE TRANSACCIONES', pageWidth / 2, currentY, { align: 'center' });
            currentY += 15;

            // FECHA DEL REPORTE
            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            doc.text(`Generado: ${new Date().toLocaleString('es-CO')}`, pageWidth / 2, currentY, { align: 'center' });
            currentY += 20;

            // FILTROS APLICADOS
            if (filtrosAplicados && Object.keys(filtrosAplicados).some(key => filtrosAplicados[key])) {
                checkPageBreak(30);
                doc.setFontSize(14);
                doc.setFont('helvetica', 'bold');
                doc.text('FILTROS APLICADOS:', margin, currentY);
                currentY += 10;

                doc.setFontSize(10);
                doc.setFont('helvetica', 'normal');

                if (filtrosAplicados.fechaInicio) {
                    doc.text(`• Fecha desde: ${filtrosAplicados.fechaInicio}`, margin + 5, currentY);
                    currentY += 6;
                }
                if (filtrosAplicados.fechaFin) {
                    doc.text(`• Fecha hasta: ${filtrosAplicados.fechaFin}`, margin + 5, currentY);
                    currentY += 6;
                }
                if (filtrosAplicados.montoMin || filtrosAplicados.montoMax) {
                    const rangoTexto = `• Rango de monto: ${filtrosAplicados.montoMin || 'Sin mínimo'} - ${filtrosAplicados.montoMax || 'Sin máximo'}`;
                    doc.text(rangoTexto, margin + 5, currentY);
                    currentY += 6;
                }
                currentY += 10;
            }

            // RESUMEN ESTADÍSTICAS
            checkPageBreak(40);
            doc.setFontSize(14);
            doc.setFont('helvetica', 'bold');
            doc.text('RESUMEN FINANCIERO:', margin, currentY);
            currentY += 10;

            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');

            const estadisticasTexto = [
                `• Total de transacciones: ${estadisticas.totalTransacciones}`,
                `• Total ingresos: ${formatCurrency(estadisticas.totalIngresos)}`,
                `• Total gastos: ${formatCurrency(estadisticas.totalGastos)}`,
                `• Balance: ${formatCurrency(estadisticas.balance)}`
            ];

            estadisticasTexto.forEach(texto => {
                doc.text(texto, margin + 5, currentY);
                currentY += 6;
            });
            currentY += 15;

            // DETALLE DE TRANSACCIONES
            checkPageBreak(20);
            doc.setFontSize(14);
            doc.setFont('helvetica', 'bold');
            doc.text('DETALLE DE TRANSACCIONES:', margin, currentY);
            currentY += 15;

            // Headers de la tabla
            doc.setFontSize(8);
            doc.setFont('helvetica', 'bold');
            
            const colWidths = [25, 60, 30, 20, 30, 25];
            let currentX = margin;

            doc.text('Fecha', currentX, currentY);
            currentX += colWidths[0];
            doc.text('Descripción', currentX, currentY);
            currentX += colWidths[1];
            doc.text('Categoría', currentX, currentY);
            currentX += colWidths[2];
            doc.text('Tipo', currentX, currentY);
            currentX += colWidths[3];
            doc.text('Cuenta', currentX, currentY);
            currentX += colWidths[4];
            doc.text('Monto', currentX, currentY);

            currentY += 8;

            // Línea separadora
            doc.line(margin, currentY - 2, pageWidth - margin, currentY - 2);
            currentY += 5;

            // DATOS DE LAS TRANSACCIONES
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(7);

            transacciones.forEach((transaccion, index) => {
                checkPageBreak(8);

                currentX = margin;

                // Fecha
                doc.text(new Date(transaccion.fecha).toLocaleDateString('es-CO'), currentX, currentY);
                currentX += colWidths[0];

                // Descripción (truncar si es muy larga)
                const descripcion = transaccion.descripcion.length > 35 
                    ? transaccion.descripcion.substring(0, 32) + '...'
                    : transaccion.descripcion;
                doc.text(descripcion, currentX, currentY);
                currentX += colWidths[1];

                // Categoría
                const categoria = transaccion.categoria.length > 15 
                    ? transaccion.categoria.substring(0, 12) + '...'
                    : transaccion.categoria;
                doc.text(categoria, currentX, currentY);
                currentX += colWidths[2];

                // Tipo
                doc.text(transaccion.tipoTransaccion === 'Ingreso' ? 'ING' : 'GAS', currentX, currentY);
                currentX += colWidths[3];

                // Cuenta (truncar si es muy larga)
                const cuenta = transaccion.cuenta.length > 15 
                    ? transaccion.cuenta.substring(0, 12) + '...'
                    : transaccion.cuenta;
                doc.text(cuenta, currentX, currentY);
                currentX += colWidths[4];

                // Monto
                const montoTexto = transaccion.tipoTransaccion === 'Ingreso' 
                    ? `+${formatCurrency(transaccion.monto)}`
                    : `-${formatCurrency(transaccion.monto)}`;
                doc.text(montoTexto, currentX, currentY);

                currentY += 6;
            });

            // PIE DE PÁGINA
            const totalPages = doc.internal.pages.length - 1;
            for (let i = 1; i <= totalPages; i++) {
                doc.setPage(i);
                doc.setFontSize(8);
                doc.setFont('helvetica', 'normal');
                doc.text(
                    `Página ${i} de ${totalPages} - Finanzas Pro`,
                    pageWidth / 2,
                    pageHeight - 10,
                    { align: 'center' }
                );
            }

            // GUARDAR ARCHIVO
            doc.save(`transacciones_${new Date().getTime()}.pdf`);

            showNotification(
                `✅ PDF exportado exitosamente (${transacciones.length} registros)`,
                'success'
            );

        } catch (error) {
            console.error('Error en exportación PDF:', error);
            showNotification('Error al exportar PDF. Asegúrate de que jsPDF esté instalado.', 'error');
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
                                {totalRecords} registros • Reporte profesional
                            </Box>
                        </Box>
                    </ListItemText>
                </MenuItem>
            </Menu>

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