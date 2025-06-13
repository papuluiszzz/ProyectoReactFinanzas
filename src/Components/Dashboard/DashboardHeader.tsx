import React from 'react';
import { Box, Typography, Button, FormControl, InputLabel, Select, MenuItem, CircularProgress } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';

interface DashboardHeaderProps {
    periodo: string;
    setPeriodo: (periodo: string) => void;
    loadingStats: boolean;
    onRefresh: () => void;
    tokenValid: boolean;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({
    periodo,
    setPeriodo,
    loadingStats,
    onRefresh,
    tokenValid
}) => {
    return (
        <Box sx={{ mb: 6 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 4 }}>
                <Box>
                    <Typography variant="h3" fontWeight="700" sx={{ color: '#111827', mb: 2 }}>
                        Dashboard Financiero
                    </Typography>
                    <Typography variant="body1" sx={{ color: '#6b7280', fontSize: '1.125rem', mb: 4 }}>
                        Gestiona y controla tus finanzas personales de manera inteligente
                    </Typography>
                </Box>
                
                {/* Selector de período y botón refresh */}
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                    <FormControl size="small" sx={{ minWidth: 130 }}>
                        <InputLabel>Período</InputLabel>
                        <Select
                            value={periodo}
                            label="Período"
                            onChange={(e) => setPeriodo(e.target.value)}
                            disabled={loadingStats}
                        >
                            <MenuItem value="mensual">Este Mes</MenuItem>
                            <MenuItem value="anual">Este Año</MenuItem>
                            <MenuItem value="total">Total</MenuItem>
                        </Select>
                    </FormControl>
                    
                    <Button
                        variant="outlined"
                        startIcon={loadingStats ? <CircularProgress size={16} /> : <RefreshIcon />}
                        onClick={onRefresh}
                        disabled={loadingStats}
                        sx={{
                            borderColor: '#6366f1',
                            color: '#6366f1',
                            '&:hover': {
                                borderColor: '#5856eb',
                                backgroundColor: '#eef2ff'
                            }
                        }}
                    >
                        {loadingStats ? 'Cargando...' : 'Actualizar'}
                    </Button>
                </Box>
            </Box>

            {/* Indicador de estado */}
            {tokenValid ? (
                <Box sx={{ 
                    display: 'inline-flex', 
                    alignItems: 'center', 
                    gap: 1, 
                    backgroundColor: '#f0f9ff', 
                    color: '#0369a1', 
                    px: 3, 
                    py: 1.5, 
                    borderRadius: 2,
                    border: '1px solid #bae6fd'
                }}>
                    <Box sx={{ width: 8, height: 8, backgroundColor: '#22c55e', borderRadius: '50%' }} />
                    <Typography variant="body2" fontWeight="500">
                        Sesión activa • Datos actualizados
                    </Typography>
                </Box>
            ) : (
                <Box sx={{ 
                    display: 'inline-flex', 
                    alignItems: 'center', 
                    gap: 1, 
                    backgroundColor: '#fef2f2', 
                    color: '#dc2626', 
                    px: 3, 
                    py: 1.5, 
                    borderRadius: 2,
                    border: '1px solid #fecaca'
                }}>
                    <Box sx={{ width: 8, height: 8, backgroundColor: '#ef4444', borderRadius: '50%' }} />
                    <Typography variant="body2" fontWeight="500">
                        Error de autenticación
                    </Typography>
                </Box>
            )}
        </Box>
    );
};

export default DashboardHeader;