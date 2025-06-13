// src/types/transacciones.types.ts
export interface Transaccion {
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

export interface FiltrosTransaccion {
    fechaInicio: string;
    fechaFin: string;
    idCategoria: string;
    idTipoTransaccion: string;
    idCuenta: string;
    montoMin: string;
    montoMax: string;
    orderBy: string;
    orderDirection: string;
}

export interface PaginacionResponse {
    currentPage: number;
    totalPages: number;
    totalRecords: number;
    limit: number;
    hasNext: boolean;
    hasPrev: boolean;
}

export interface EstadisticasTransacciones {
    totalTransacciones: number;
    totalIngresos: number;
    totalGastos: number;
    balance: number;
}

export interface TransaccionesResponse {
    success: boolean;
    data: {
        transacciones: Transaccion[];
        pagination: PaginacionResponse;
        estadisticas: EstadisticasTransacciones;
        filtrosAplicados: Partial<FiltrosTransaccion>;
    };
    message: string;
}

export interface ResumenCategoria {
    idCategoria: number;
    categoria: string;
    tipoTransaccion: string;
    cantidadTransacciones: number;
    totalMonto: number;
    promedioMonto: number;
    montoMinimo: number;
    montoMaximo: number;
    fechaPrimera: string;
    fechaUltima: string;
}

export interface ResumenCategoriaResponse {
    success: boolean;
    data: ResumenCategoria[];
    message: string;
}

export interface TransaccionReciente {
    idTransaccion: number;
    monto: number;
    fecha: string;
    descripcion: string;
    categoria: string;
    tipoTransaccion: string;
    cuenta: string;
}

export interface TransaccionesRecientesResponse {
    success: boolean;
    data: TransaccionReciente[];
    message: string;
}