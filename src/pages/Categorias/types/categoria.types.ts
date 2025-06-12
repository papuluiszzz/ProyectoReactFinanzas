
export interface Categoria {
    idCategoria: number;
    nombre: string;
    descripcion: string;
    veces_usada?: number;
    ultima_vez_usada?: string;
}

export interface Permisos {
    puedo_editar: number;
    puedo_eliminar: number;
    razon: string;
}

export interface AlertState {
    show: boolean;
    type: 'success' | 'error';
    message: string;
}

export interface FormData {
    nombre: string;
    descripcion: string;
}

export interface CategoriasProps {
    onLogout: () => void;
}