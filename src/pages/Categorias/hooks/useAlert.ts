// src/pages/Categorias/hooks/useAlert.ts
// 🎯 RESPONSABILIDAD: Lógica alertas - Mensajes (30-50 líneas)

import { useState } from 'react';
import type { AlertState } from '../types/categoria.types';

export const useAlert = () => {
    const [alert, setAlert] = useState<AlertState>({
        show: false,
        type: 'success',
        message: ''
    });

    const showAlert = (type: 'success' | 'error', message: string) => {
        setAlert({ show: true, type, message });
        setTimeout(() => setAlert({ show: false, type: 'success', message: '' }), 5000);
    };

    const hideAlert = () => {
        setAlert({ show: false, type: 'success', message: '' });
    };

    return {
        alert,
        showAlert,
        hideAlert
    };
};