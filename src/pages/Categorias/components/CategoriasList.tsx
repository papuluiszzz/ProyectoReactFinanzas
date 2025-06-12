// src/pages/Categorias/components/CategoriasList.tsx
// 🎯 RESPONSABILIDAD: Lista/Tabla - Mostrar categorías (150-200 líneas)

import React, { useState } from 'react';
import {
    Card,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Typography,
    Box,
    Button,
    TablePagination,
    Chip,
    InputAdornment,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CategoryIcon from '@mui/icons-material/Category';
import SearchIcon from '@mui/icons-material/Search';
import SortIcon from '@mui/icons-material/Sort';
import CategoriaItem from './CategoriaItem';
import type { Categoria, Permisos } from '../types/categoria.types';

interface CategoriasListProps {
    categorias: Categoria[];
    permisosMap: Record<number, Permisos>;
    onEdit: (categoria: Categoria) => void;
    onDelete: (categoria: Categoria) => void;
    onOpenDialog: () => void;
}

type SortField = 'nombre' | 'descripcion' | 'veces_usada' | 'ultima_vez_usada';
type SortDirection = 'asc' | 'desc';

const CategoriasList: React.FC<CategoriasListProps> = ({
    categorias,
    permisosMap,
    onEdit,
    onDelete,
    onOpenDialog
}) => {
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortField, setSortField] = useState<SortField>('nombre');
    const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

    // Filtrar categorías por búsqueda
    const filteredCategorias = categorias.filter(categoria =>
        categoria.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        categoria.descripcion.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Ordenar categorías
    const sortedCategorias = [...filteredCategorias].sort((a, b) => {
        let aValue: any = a[sortField];
        let bValue: any = b[sortField];

        // Manejar valores undefined/null
        if (aValue === undefined || aValue === null) aValue = '';
        if (bValue === undefined || bValue === null) bValue = '';

        // Convertir a string para comparación
        if (typeof aValue === 'string') aValue = aValue.toLowerCase();
        if (typeof bValue === 'string') bValue = bValue.toLowerCase();

        // Para fechas
        if (sortField === 'ultima_vez_usada') {
            aValue = new Date(aValue || 0).getTime();
            bValue = new Date(bValue || 0).getTime();
        }

        if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
        return 0;
    });

    // Paginación
    const paginatedCategorias = sortedCategorias.slice(
        page * rowsPerPage,
        page * rowsPerPage + rowsPerPage
    );

    const handleChangePage = (event: unknown, newPage: number) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleSort = (field: SortField) => {
        if (sortField === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('asc');
        }
        setPage(0);
    };

    const getSortIcon = (field: SortField) => {
        if (sortField === field) {
            return sortDirection === 'asc' ? '↑' : '↓';
        }
        return '';
    };

    const getTableHeaderStyle = (field: SortField) => ({
        fontWeight: 600,
        color: '#374151',
        fontSize: '0.875rem',
        cursor: 'pointer',
        userSelect: 'none',
        '&:hover': {
            backgroundColor: '#f3f4f6'
        },
        backgroundColor: sortField === field ? '#f3f4f6' : 'transparent'
    });

    const EmptyState = () => (
        <TableRow>
            <TableCell colSpan={5} sx={{ textAlign: 'center', py: 6 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                    <CategoryIcon sx={{ fontSize: 48, color: '#d1d5db' }} />
                    <Typography variant="h6" sx={{ color: '#6b7280', fontWeight: 500 }}>
                        {searchTerm ? 'No se encontraron categorías' : 'Aún no has usado ninguna categoría'}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#9ca3af' }}>
                        {searchTerm 
                            ? 'Intenta con otros términos de búsqueda'
                            : 'Registra tu primera transacción para comenzar a usar categorías'
                        }
                    </Typography>
                    {!searchTerm && (
                        <Button
                            variant="outlined"
                            startIcon={<AddIcon />}
                            onClick={onOpenDialog}
                            sx={{ mt: 2 }}
                        >
                            Crear Primera Categoría
                        </Button>
                    )}
                </Box>
            </TableCell>
        </TableRow>
    );

    return (
        <Card elevation={0} sx={{ 
            border: '1px solid #e5e7eb', 
            borderRadius: 3,
            overflow: 'hidden'
        }}>
            {/* Header con título y controles */}
            <Box sx={{ p: 3, borderBottom: '1px solid #e5e7eb', backgroundColor: '#f9fafb' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box>
                        <Typography variant="h6" fontWeight="600" sx={{ color: '#111827' }}>
                            Categorías que has usado
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#6b7280', mt: 1 }}>
                            Solo puedes editar categorías que otros usuarios no estén usando
                        </Typography>
                    </Box>
                    <Chip 
                        label={`${filteredCategorias.length} categoría${filteredCategorias.length !== 1 ? 's' : ''}`}
                        color="primary"
                        variant="outlined"
                        size="small"
                    />
                </Box>

                {/* Controles de búsqueda y ordenamiento */}
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
                    <TextField
                        size="small"
                        placeholder="Buscar categorías..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon sx={{ color: '#6b7280', fontSize: 20 }} />
                                </InputAdornment>
                            ),
                        }}
                        sx={{ minWidth: 200 }}
                    />
                    
                    <FormControl size="small" sx={{ minWidth: 150 }}>
                        <InputLabel>Ordenar por</InputLabel>
                        <Select
                            value={sortField}
                            label="Ordenar por"
                            onChange={(e) => handleSort(e.target.value as SortField)}
                            startAdornment={<SortIcon sx={{ mr: 1, fontSize: 16 }} />}
                        >
                            <MenuItem value="nombre">Nombre</MenuItem>
                            <MenuItem value="descripcion">Descripción</MenuItem>
                            <MenuItem value="veces_usada">Veces usada</MenuItem>
                            <MenuItem value="ultima_vez_usada">Última vez usada</MenuItem>
                        </Select>
                    </FormControl>
                </Box>
            </Box>
            
            {/* Tabla */}
            <TableContainer component={Paper} elevation={0}>
                <Table stickyHeader>
                    <TableHead>
                        <TableRow>
                            <TableCell sx={getTableHeaderStyle('nombre')} onClick={() => handleSort('nombre')}>
                                ID {getSortIcon('nombre')}
                            </TableCell>
                            <TableCell sx={getTableHeaderStyle('nombre')} onClick={() => handleSort('nombre')}>
                                Nombre {getSortIcon('nombre')}
                            </TableCell>
                            <TableCell sx={getTableHeaderStyle('descripcion')} onClick={() => handleSort('descripcion')}>
                                Descripción {getSortIcon('descripcion')}
                            </TableCell>
                            <TableCell sx={getTableHeaderStyle('veces_usada')} onClick={() => handleSort('veces_usada')}>
                                Uso {getSortIcon('veces_usada')}
                            </TableCell>
                            <TableCell sx={{ fontWeight: 600, color: '#374151', fontSize: '0.875rem', textAlign: 'center' }}>
                                Acciones
                            </TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {paginatedCategorias.length === 0 ? (
                            <EmptyState />
                        ) : (
                            paginatedCategorias.map((categoria) => (
                                <CategoriaItem 
                                    key={categoria.idCategoria} 
                                    categoria={categoria}
                                    permisos={permisosMap[categoria.idCategoria] || { 
                                        puedo_editar: 0, 
                                        puedo_eliminar: 0, 
                                        razon: 'Verificando...' 
                                    }}
                                    onEdit={onEdit}
                                    onDelete={onDelete}
                                />
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Paginación */}
            {sortedCategorias.length > 0 && (
                <TablePagination
                    rowsPerPageOptions={[5, 10, 25, 50]}
                    component="div"
                    count={sortedCategorias.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    labelRowsPerPage="Filas por página:"
                    labelDisplayedRows={({ from, to, count }) =>
                        `${from}-${to} de ${count !== -1 ? count : `más de ${to}`}`
                    }
                    sx={{
                        borderTop: '1px solid #e5e7eb',
                        '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': {
                            fontSize: '0.875rem',
                            color: '#6b7280'
                        }
                    }}
                />
            )}
        </Card>
    );
};

export default CategoriasList;