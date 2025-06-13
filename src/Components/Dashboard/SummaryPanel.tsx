import React from 'react';
import { Card, Box, Typography, CircularProgress } from '@mui/material';

interface EstadisticasData {
    ingresos: { total: number };
    gastos: { total: number };
    balance: { actual: number };
    transaccionesRecientes: any[];
}

interface SummaryPanelProps {
    estadisticas: EstadisticasData | null;
    loadingStats: boolean;
    periodo: string;
}

const SummaryPanel: React.FC<SummaryPanelProps> = ({ estadisticas, loadingStats, periodo }) => {
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP'
        }).format(amount);
    };

    const getPeriodLabel = () => {
        switch (periodo) {
            case 'mensual': return 'Mensual';
            case 'anual': return 'Anual';
            default: return 'Total';
        }
    };

    return (
        <Card elevation={0} sx={{ 
            backgroundColor: 'white', 
            border: '1px solid #e5e7eb', 
            borderRadius: 3,
            p: 4,
            height: 'fit-content'
        }}>
            <Typography variant="h6" fontWeight="600" sx={{ color: '#111827', mb: 3 }}>
                Resumen {getPeriodLabel()}
            </Typography>
            
            <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="body2" sx={{ color: '#6b7280' }}>
                        Ingresos
                    </Typography>
                    <Typography variant="body1" fontWeight="600" sx={{ color: '#10b981' }}>
                        {loadingStats ? '...' : formatCurrency(estadisticas?.ingresos.total || 0)}
                    </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="body2" sx={{ color: '#6b7280' }}>
                        Gastos
                    </Typography>
                    <Typography variant="body1" fontWeight="600" sx={{ color: '#ef4444' }}>
                        {loadingStats ? '...' : formatCurrency(estadisticas?.gastos.total || 0)}
                    </Typography>
                </Box>
                <Box sx={{ height: 1, backgroundColor: '#e5e7eb', my: 2 }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body1" fontWeight="600" sx={{ color: '#111827' }}>
                        Balance
                    </Typography>
                    <Typography variant="body1" fontWeight="700" sx={{ 
                        color: loadingStats ? '#6366f1' : (estadisticas?.balance.actual || 0) >= 0 ? '#22c55e' : '#ef4444'
                    }}>
                        {loadingStats ? '...' : formatCurrency(estadisticas?.balance.actual || 0)}
                    </Typography>
                </Box>
            </Box>
            
            {/* Información adicional */}
            <Box sx={{ 
                backgroundColor: '#f8fafc', 
                borderRadius: 2, 
                p: 3,
                textAlign: 'center'
            }}>
                {loadingStats ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
                        <CircularProgress size={20} />
                        <Typography variant="body2" sx={{ color: '#6b7280' }}>
                            Cargando resumen...
                        </Typography>
                    </Box>
                ) : estadisticas?.transaccionesRecientes.length ? (
                    <>
                        <Typography variant="body2" sx={{ color: '#6b7280', mb: 1, fontWeight: 600 }}>
                            📊 Últimas {estadisticas.transaccionesRecientes.length} transacciones
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#6b7280', fontSize: '0.75rem' }}>
                            Período: {getPeriodLabel().toLowerCase()}
                        </Typography>
                    </>
                ) : (
                    <>
                        <Typography variant="body2" sx={{ color: '#6b7280', mb: 1 }}>
                            🚀 ¡Comienza tu viaje financiero!
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#6b7280' }}>
                            Registra tu primera transacción para ver el resumen
                        </Typography>
                    </>
                )}
            </Box>
        </Card>
    );
};

export default SummaryPanel;