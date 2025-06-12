// src/pages/Categorias/components/CategoriaItem.tsx
// 🎯 RESPONSABILIDAD: Fila de tabla - Render individual (80-100 líneas)

import React from 'react';
import { TableRow, TableCell, Typography, Chip, Box, IconButton, Tooltip } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import type { Categoria, Permisos } from '../types/categoria.types';

interface CategoriaItemProps {
    categoria: Categoria;
    permisos: Permisos;
    onEdit: (categoria: Categoria) => void;
    onDelete: (categoria: Categoria) => void;
}

const CategoriaItem: React.FC<CategoriaItemProps> = ({ categoria, permisos, onEdit, onDelete }) => {
    return (
        <TableRow 
            sx={{ 
                '&:hover': { 
                    backgroundColor: '#f9fafb' 
                }
            }}
        >
            <TableCell sx={{ py: 2 }}>
                <Chip 
                    label={categoria.idCategoria} 
                    size="small"
                    sx={{ 
                        backgroundColor: '#f3f4f6', 
                        color: '#6b7280',
                        fontWeight: 500,
                        fontSize: '0.75rem'
                    }}
                />
            </TableCell>
            <TableCell sx={{ py: 2 }}>
                <Typography variant="body1" fontWeight="600" sx={{ color: '#111827' }}>
                    {categoria.nombre}
                </Typography>
            </TableCell>
            <TableCell sx={{ py: 2 }}>
                <Typography 
                    variant="body2" 
                    sx={{ 
                        color: '#6b7280',
                        maxWidth: 300,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                    }}
                >
                    {categoria.descripcion}
                </Typography>
            </TableCell>
            <TableCell sx={{ py: 2 }}>
                {categoria.veces_usada && (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                        <Chip 
                            label={`${categoria.veces_usada} usos`} 
                            size="small" 
                            color="primary"
                            variant="outlined"
                        />
                        {categoria.ultima_vez_usada && (
                            <Typography variant="caption" sx={{ color: '#6b7280' }}>
                                Último: {new Date(categoria.ultima_vez_usada).toLocaleDateString()}
                            </Typography>
                        )}
                    </Box>
                )}
            </TableCell>
            <TableCell sx={{ textAlign: 'center', py: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                    {permisos.puedo_editar === 1 ? (
                        <IconButton
                            onClick={() => onEdit(categoria)}
                            sx={{ 
                                color: '#6366f1',
                                backgroundColor: '#eef2ff',
                                '&:hover': {
                                    backgroundColor: '#e0e7ff',
                                    transform: 'scale(1.05)'
                                },
                                transition: 'all 0.2s ease'
                            }}
                            size="small"
                        >
                            <EditIcon fontSize="small" />
                        </IconButton>
                    ) : (
                        <Tooltip title={permisos.razon} arrow>
                            <span>
                                <IconButton
                                    disabled
                                    sx={{ 
                                        color: '#d1d5db',
                                        backgroundColor: '#f9fafb'
                                    }}
                                    size="small"
                                >
                                    <EditIcon fontSize="small" />
                                </IconButton>
                            </span>
                        </Tooltip>
                    )}
                    
                    {permisos.puedo_eliminar === 1 ? (
                        <IconButton
                            onClick={() => onDelete(categoria)}
                            sx={{ 
                                color: '#ef4444',
                                backgroundColor: '#fef2f2',
                                '&:hover': {
                                    backgroundColor: '#fee2e2',
                                    transform: 'scale(1.05)'
                                },
                                transition: 'all 0.2s ease'
                            }}
                            size="small"
                        >
                            <DeleteIcon fontSize="small" />
                        </IconButton>
                    ) : (
                        <Tooltip title={permisos.razon} arrow>
                            <span>
                                <IconButton
                                    disabled
                                    sx={{ 
                                        color: '#d1d5db',
                                        backgroundColor: '#f9fafb'
                                    }}
                                    size="small"
                                >
                                    <DeleteIcon fontSize="small" />
                                </IconButton>
                            </span>
                        </Tooltip>
                    )}
                </Box>
            </TableCell>
        </TableRow>
    );
};

export default CategoriaItem;