// src/Components/Dashboard/QuickActions.tsx - ARCHIVO COMPLETO ACTUALIZADO
import React from 'react';
import { Grid, Card, Box, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import ReceiptIcon from '@mui/icons-material/Receipt';
import CategoryIcon from '@mui/icons-material/Category';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import HistoryIcon from '@mui/icons-material/History'; // ✅ NUEVA IMPORTACIÓN

const QuickActions: React.FC = () => {
    const navigate = useNavigate();

    const actions = [
        {
            title: 'Agregar Ingreso',
            description: 'Registra un nuevo ingreso',
            icon: MonetizationOnIcon,
            color: '#10b981',
            onClick: () => {
                // TODO: Implementar formulario de ingreso directo
                navigate('/transaccion');
            }
        },
        {
            title: 'Registrador Gasto',
            description: 'Añade un nuevo gasto',
            icon: ReceiptIcon,
            color: '#ef4444',
            onClick: () => navigate('/transaccion')
        },
        {
            title: 'Ver Historial',  // ✅ NUEVA ACCIÓN
            description: 'Consulta tus transacciones',
            icon: HistoryIcon,
            color: '#3b82f6',
            onClick: () => navigate('/transacciones')
        },
        {
            title: 'Categorías de gestión',
            description: 'Organiza tus categorías',
            icon: CategoryIcon,
            color: '#6366f1',
            onClick: () => navigate('/categorias')
        },
        {
            title: 'Mis cuentas',
            description: 'Gestionar mis cuentas bancarias',
            icon: AccountBalanceIcon,
            color: '#8b5cf6',
            onClick: () => navigate('/cuentas')
        }
    ];

    return (
        <Card elevation={0} sx={{ 
            backgroundColor: 'white', 
            border: '1px solid #e5e7eb', 
            borderRadius: 3,
            p: 4
        }}>
            <Typography variant="h6" fontWeight="600" sx={{ color: '#111827', mb: 3 }}>
                Acciones Rápidas
            </Typography>
            
            <Grid container spacing={3}>
                {actions.map((action, index) => (
                    <Grid item xs={12} sm={6} md={2.4} key={index}> {/* ✅ CAMBIADO A md={2.4} PARA 5 COLUMNAS */}
                        <Box 
                            onClick={action.onClick}
                            sx={{ 
                                p: 3, 
                                borderRadius: 2, 
                                backgroundColor: '#f9fafb',
                                border: '1px solid #e5e7eb',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                '&:hover': {
                                    backgroundColor: '#f3f4f6',
                                    transform: 'translateY(-1px)',
                                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                                }
                            }}
                        >
                            <action.icon sx={{ fontSize: 24, color: action.color, mb: 2 }} />
                            <Typography variant="body1" fontWeight="600" sx={{ color: '#111827', mb: 1 }}>
                                {action.title}
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#6b7280' }}>
                                {action.description}
                            </Typography>
                        </Box>
                    </Grid>
                ))}
            </Grid>
        </Card>
    );
};

export default QuickActions;