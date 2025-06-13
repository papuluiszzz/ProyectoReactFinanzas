// src/utils/exportUtils.ts
import { Transaccion, EstadisticasTransacciones } from '../types/transacciones.types';

// ✅ EXPORTAR A CSV
export const exportToCSV = (
    transacciones: Transaccion[], 
    estadisticas: EstadisticasTransacciones,
    filtrosAplicados: any
) => {
    try {
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
            `"${transaccion.descripcion.replace(/"/g, '""')}"`, // Escapar comillas
            transaccion.categoria,
            transaccion.tipoTransaccion,
            transaccion.cuenta,
            transaccion.monto.toString()
        ]);

        // Agregar resumen al final
        const resumenData = [
            [],
            ['=== RESUMEN ==='],
            ['Total Transacciones', estadisticas.totalTransacciones.toString()],
            ['Total Ingresos', estadisticas.totalIngresos.toString()],
            ['Total Gastos', estadisticas.totalGastos.toString()],
            ['Balance', estadisticas.balance.toString()]
        ];

        // Combinar todo
        const allData = [headers, ...csvData, ...resumenData];
        
        // Convertir a string CSV
        const csvString = allData.map(row => row.join(',')).join('\n');
        
        // Crear y descargar archivo
        const blob = new Blob(['\uFEFF' + csvString], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        
        link.setAttribute('href', url);
        link.setAttribute('download', `transacciones_${new Date().getTime()}.csv`);
        link.style.visibility = 'hidden';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        return true;
    } catch (error) {
        console.error('Error exportando CSV:', error);
        return false;
    }
};

// ✅ EXPORTAR A PDF (usando jsPDF)
export const exportToPDF = (
    transacciones: Transaccion[], 
    estadisticas: EstadisticasTransacciones,
    filtrosAplicados: any
) => {
    try {
        // Importar jsPDF dinámicamente
        import('jspdf').then((jsPDFModule) => {
            const { jsPDF } = jsPDFModule;
            const doc = new jsPDF();

            // Configuración inicial
            const pageWidth = doc.internal.pageSize.width;
            const margin = 20;
            let currentY = margin;

            // ✅ TÍTULO DEL REPORTE
            doc.setFontSize(18);
            doc.setFont('helvetica', 'bold');
            doc.text('Reporte de Transacciones', margin, currentY);
            currentY += 10;

            // ✅ FECHA DEL REPORTE
            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            doc.text(`Generado: ${new Date().toLocaleString('es-CO')}`, margin, currentY);
            currentY += 15;

            // ✅ FILTROS APLICADOS
            if (filtrosAplicados && Object.keys(filtrosAplicados).some(key => filtrosAplicados[key])) {
                doc.setFontSize(12);
                doc.setFont('helvetica', 'bold');
                doc.text('Filtros Aplicados:', margin, currentY);
                currentY += 8;

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
                if (filtrosAplicados.idCategoria) {
                    doc.text(`• Categoría filtrada`, margin + 5, currentY);
                    currentY += 6;
                }
                if (filtrosAplicados.montoMin || filtrosAplicados.montoMax) {
                    doc.text(`• Rango de monto aplicado`, margin + 5, currentY);
                    currentY += 6;
                }
                currentY += 5;
            }

            // ✅ RESUMEN ESTADÍSTICAS
            doc.setFontSize(12);
            doc.setFont('helvetica', 'bold');
            doc.text('Resumen:', margin, currentY);
            currentY += 8;

            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');

            const formatCurrency = (amount: number) => {
                return new Intl.NumberFormat('es-CO', {
                    style: 'currency',
                    currency: 'COP'
                }).format(amount);
            };

            doc.text(`• Total Transacciones: ${estadisticas.totalTransacciones}`, margin + 5, currentY);
            currentY += 6;
            doc.text(`• Total Ingresos: ${formatCurrency(estadisticas.totalIngresos)}`, margin + 5, currentY);
            currentY += 6;
            doc.text(`• Total Gastos: ${formatCurrency(estadisticas.totalGastos)}`, margin + 5, currentY);
            currentY += 6;
            doc.text(`• Balance: ${formatCurrency(estadisticas.balance)}`, margin + 5, currentY);
            currentY += 15;

            // ✅ TABLA DE TRANSACCIONES
            doc.setFontSize(12);
            doc.setFont('helvetica', 'bold');
            doc.text('Detalle de Transacciones:', margin, currentY);
            currentY += 10;

            // Headers de la tabla
            doc.setFontSize(8);
            doc.setFont('helvetica', 'bold');
            
            const colWidths = [25, 60, 30, 20, 30, 25]; // Anchos de columnas
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

            // ✅ DATOS DE LAS TRANSACCIONES
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(7);

            transacciones.forEach((transaccion, index) => {
                // Verificar si necesitamos nueva página
                if (currentY > 270) {
                    doc.addPage();
                    currentY = margin;
                }

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
                doc.text(transaccion.categoria, currentX, currentY);
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
                const montoText = transaccion.tipoTransaccion === 'Ingreso' 
                    ? `+${formatCurrency(transaccion.monto)}`
                    : `-${formatCurrency(transaccion.monto)}`;
                doc.text(montoText, currentX, currentY);

                currentY += 6;
            });

            // ✅ PIE DE PÁGINA
            const totalPages = doc.internal.pages.length - 1;
            for (let i = 1; i <= totalPages; i++) {
                doc.setPage(i);
                doc.setFontSize(8);
                doc.setFont('helvetica', 'normal');
                doc.text(
                    `Página ${i} de ${totalPages} - Finanzas Pro`,
                    pageWidth / 2,
                    doc.internal.pageSize.height - 10,
                    { align: 'center' }
                );
            }

            // ✅ GUARDAR ARCHIVO
            doc.save(`transacciones_${new Date().getTime()}.pdf`);
        });

        return true;
    } catch (error) {
        console.error('Error exportando PDF:', error);
        return false;
    }
};