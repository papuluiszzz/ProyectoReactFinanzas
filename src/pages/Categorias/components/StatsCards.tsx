// src/pages/Categorias/components/StatsCards.tsx
// 🎯 RESPONSABILIDAD: Estadísticas - Mostrar métricas (100-120 líneas)

import React from 'react';
import { Grid, Card, Box, Typography, LinearProgress } from '@mui/material';
import CategoryIcon from '@mui/icons-material/Category';
import InfoIcon from '@mui/icons-material/Info';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AssessmentIcon from '@mui/icons-material/Assessment';

interface StatsCardsProps {
    categoriasUsadas: number;
    categoriasDisponibles: number;
}

const StatsCards: React.FC<StatsCardsProps> = ({ categoriasUsadas, categoriasDisponibles }) => {
    const porcentajeUso = categoriasDisponibles > 0 ? (categoriasUsadas / categoriasDisponibles) * 100 : 0;
    const categoriasNoUsadas = categoriasDisponibles - categoriasUsadas;

    const cards = [
        {
            id: 'usadas',
            title: 'Mis Categorías Usadas',
            value: categoriasUsadas,
            icon: CategoryIcon,
            color: '#6366f1',
            bgColor: '#eef2ff',
            description: 'Categorías que has utilizado',
        },
        {
            id: 'disponibles',
            title: 'Disponibles Globalmente',
            value: categoriasDisponibles,
            icon: InfoIcon,
            color: '#22c55e',
            bgColor: '#f0fdf4',
            description: 'Total en el sistema',
        },
        {
            id: 'no-usadas',
            title: 'Por Explorar',
            value: categoriasNoUsadas,
            icon: TrendingUpIcon,
            color: '#f59e0b',
            bgColor: '#fffbeb',
            description: 'Categorías disponibles sin usar',
        },
        {
            id: 'porcentaje',
            title: 'Porcentaje de Uso',
            value: `${porcentajeUso.toFixed(1)}%`,
            icon: AssessmentIcon,
            color: '#8b5cf6',
            bgColor: '#f3e8ff',
            description: 'Del total disponible',
            showProgress: true,
            progressValue: porcentajeUso,
        }
    ];

    const getProgressColor = (percentage: number) => {
        if (percentage >= 80) return '#22c55e'; // Verde
        if (percentage >= 50) return '#f59e0b'; // Amarillo
        if (percentage >= 25) return '#ef4444'; // Rojo
        return '#6b7280'; // Gris
    };

    return (
        <Grid container spacing={3} sx={{ mb: 4 }}>
            {cards.map((card) => (
                <Grid item xs={12} sm={6} md={3} key={card.id}>
                    <Card 
                        elevation={0} 
                        sx={{ 
                            p: 3, 
                            backgroundColor: 'white', 
                            border: '1px solid #e5e7eb', 
                            borderRadius: 3,
                            transition: 'all 0.2s ease',
                            '&:hover': {
                                transform: 'translateY(-2px)',
                                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                                borderColor: card.color,
                            }
                        }}
                    >
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                            <Box sx={{ flex: 1 }}>
                                <Typography 
                                    variant="body2" 
                                    sx={{ 
                                        color: '#6b7280', 
                                        fontWeight: 500,
                                        mb: 1,
                                        fontSize: '0.875rem'
                                    }}
                                >
                                    {card.title}
                                </Typography>
                                <Typography 
                                    variant="h3" 
                                    fontWeight="700" 
                                    sx={{ 
                                        color: '#111827',
                                        mb: 1,
                                        fontSize: { xs: '1.75rem', sm: '2rem' }
                                    }}
                                >
                                    {card.value}
                                </Typography>
                                <Typography 
                                    variant="caption" 
                                    sx={{ 
                                        color: '#9ca3af',
                                        fontSize: '0.75rem'
                                    }}
                                >
                                    {card.description}
                                </Typography>
                            </Box>
                            
                            <Box sx={{ 
                                width: 48, 
                                height: 48, 
                                backgroundColor: card.bgColor, 
                                borderRadius: 2, 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center',
                                ml: 2
                            }}>
                                <card.icon sx={{ fontSize: 24, color: card.color }} />
                            </Box>
                        </Box>

                        {card.showProgress && (
                            <Box sx={{ mt: 2 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                    <Typography variant="caption" sx={{ color: '#6b7280', fontWeight: 500 }}>
                                        Progreso
                                    </Typography>
                                    <Typography variant="caption" sx={{ color: card.color, fontWeight: 600 }}>
                                        {card.progressValue?.toFixed(1)}%
                                    </Typography>
                                </Box>
                                <LinearProgress
                                    variant="determinate"
                                    value={card.progressValue || 0}
                                    sx={{
                                        height: 6,
                                        borderRadius: 3,
                                        backgroundColor: '#f3f4f6',
                                        '& .MuiLinearProgress-bar': {
                                            backgroundColor: getProgressColor(card.progressValue || 0),
                                            borderRadius: 3,
                                        }
                                    }}
                                />
                            </Box>
                        )}
                    </Card>
                </Grid>
            ))}
        </Grid>
    );
};

export default StatsCards;