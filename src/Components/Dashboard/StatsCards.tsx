import React from 'react';
import { Grid, Card, Box, Typography, CircularProgress } from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import ReceiptIcon from '@mui/icons-material/Receipt';
import SavingsIcon from '@mui/icons-material/Savings';

interface EstadisticasData {
    ingresos: {
        total: number;
        porcentajeCambio: number;
    };
    gastos: {
        total: number;
        porcentajeCambio: number;
    };
    balance: {
        actual: number;
        saldoTotal: number;
    };
}

interface StatsCardsProps {
    estadisticas: EstadisticasData | null;
    loadingStats: boolean;
    periodo: string;
}

const StatsCards: React.FC<StatsCardsProps> = ({ estadisticas, loadingStats, periodo }) => {
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP'
        }).format(amount);
    };

    const getTrendColor = (percentage: number) => {
        if (percentage > 0) return '#22c55e';
        if (percentage < 0) return '#ef4444';
        return '#6b7280';
    };

    const getTrendIcon = (percentage: number) => {
        if (percentage > 0) return <TrendingUpIcon sx={{ fontSize: 16 }} />;
        if (percentage < 0) return <TrendingDownIcon sx={{ fontSize: 16 }} />;
        return <TrendingUpIcon sx={{ fontSize: 16, color: '#6b7280' }} />;
    };

    const cards = [
        {
            title: 'Ingresos Totales',
            value: estadisticas?.ingresos.total || 0,
            percentage: estadisticas?.ingresos.porcentajeCambio || 0,
            icon: MonetizationOnIcon,
            bgColor: '#ecfdf5',
            iconColor: '#10b981',
            borderColor: '#10b981'
        },
        {
            title: 'Gastos Totales',
            value: estadisticas?.gastos.total || 0,
            percentage: estadisticas?.gastos.porcentajeCambio || 0,
            icon: ReceiptIcon,
            bgColor: '#fef2f2',
            iconColor: '#ef4444',
            borderColor: '#ef4444'
        },
        {
            title: 'Balance del Período',
            value: estadisticas?.balance.actual || 0,
            percentage: null,
            icon: TrendingUpIcon,
            bgColor: '#eef2ff',
            iconColor: '#6366f1',
            borderColor: '#6366f1',
            isBalance: true
        },
        {
            title: 'Saldo Total Disponible',
            value: estadisticas?.balance.saldoTotal || 0,
            percentage: null,
            icon: SavingsIcon,
            bgColor: '#fffbeb',
            iconColor: '#f59e0b',
            borderColor: '#f59e0b'
        }
    ];

    return (
        <Grid container spacing={3} sx={{ mb: 6 }}>
            {cards.map((card, index) => (
                <Grid item xs={12} md={6} lg={3} key={index}>
                    <Card 
                        elevation={0}
                        sx={{ 
                            p: 0,
                            backgroundColor: 'white',
                            border: '1px solid #e5e7eb',
                            borderRadius: 3,
                            overflow: 'hidden',
                            transition: 'all 0.2s ease',
                            '&:hover': {
                                transform: 'translateY(-2px)',
                                boxShadow: '0 10px 25px -3px rgb(0 0 0 / 0.1), 0 4px 6px -2px rgb(0 0 0 / 0.05)',
                                borderColor: card.borderColor,
                            }
                        }}
                    >
                        <Box sx={{ p: 3 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
                                <Box>
                                    <Typography variant="body2" sx={{ color: '#6b7280', fontWeight: 500, mb: 1 }}>
                                        {card.title}
                                    </Typography>
                                    <Typography 
                                        variant="h4" 
                                        fontWeight="700" 
                                        sx={{ 
                                            color: loadingStats ? '#111827' : 
                                                   card.isBalance ? (card.value >= 0 ? '#22c55e' : '#ef4444') : '#111827'
                                        }}
                                    >
                                        {loadingStats ? (
                                            <CircularProgress size={24} />
                                        ) : (
                                            formatCurrency(card.value)
                                        )}
                                    </Typography>
                                </Box>
                                <Box sx={{ 
                                    width: 48, 
                                    height: 48, 
                                    backgroundColor: card.bgColor, 
                                    borderRadius: 2, 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'center'
                                }}>
                                    <card.icon sx={{ fontSize: 24, color: card.iconColor }} />
                                </Box>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                {loadingStats ? (
                                    <Typography variant="body2" sx={{ color: '#6b7280' }}>
                                        Cargando...
                                    </Typography>
                                ) : card.percentage !== null ? (
                                    <>
                                        {getTrendIcon(card.percentage)}
                                        <Typography 
                                            variant="body2" 
                                            sx={{ 
                                                color: getTrendColor(card.percentage), 
                                                fontWeight: 500 
                                            }}
                                        >
                                            {card.percentage > 0 ? '+' : ''}
                                            {card.percentage.toFixed(1)}% 
                                            {periodo === 'mensual' ? ' vs mes anterior' : periodo === 'anual' ? ' vs año anterior' : ''}
                                        </Typography>
                                    </>
                                ) : card.isBalance ? (
                                    <Typography variant="body2" sx={{ color: '#6b7280', fontWeight: 500 }}>
                                        {card.value >= 0 ? 'Balance positivo' : 'Balance negativo'}
                                    </Typography>
                                ) : (
                                    <Typography variant="body2" sx={{ color: card.iconColor, fontWeight: 500 }}>
                                        En cuentas activas
                                    </Typography>
                                )}
                            </Box>
                        </Box>
                    </Card>
                </Grid>
            ))}
        </Grid>
    );
};

export default StatsCards;