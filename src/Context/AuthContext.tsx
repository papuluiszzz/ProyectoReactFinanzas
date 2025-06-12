import React, { createContext, useContext, type ReactNode, useState, useEffect } from 'react';

interface User {
    idUsuario: number;
    nombre: string;
    apellido: string;
    email: string;
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (userData: User, token: string) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        try {
            // Verificar si hay datos en el nuevo formato
            const storedUser = localStorage.getItem('userData');
            const storedToken = localStorage.getItem('token');
            
            if (storedUser && storedToken) {
                const userData = JSON.parse(storedUser);
                setUser(userData);
            } else {
                // ✅ MIGRACIÓN: Verificar si hay datos en el formato antiguo
                const oldUserName = localStorage.getItem('userName');
                const oldUserId = localStorage.getItem('userId');
                const oldUserInfo = localStorage.getItem('userInfo');
                const oldToken = localStorage.getItem('token');
                
                if (oldToken && oldUserId && oldUserName) {
                    console.log('Migrando datos del formato antiguo...');
                    
                    let userInfo = {};
                    try {
                        userInfo = oldUserInfo ? JSON.parse(oldUserInfo) : {};
                    } catch (e) {
                        console.warn('Error al parsear userInfo:', e);
                    }
                    
                    // Crear userData en el nuevo formato
                    const userData: User = {
                        idUsuario: parseInt(oldUserId),
                        nombre: oldUserName,
                        apellido: (userInfo as any)?.apellido || '',
                        email: (userInfo as any)?.email || ''
                    };
                    
                    // Guardar en el nuevo formato
                    localStorage.setItem('userData', JSON.stringify(userData));
                    
                    // Limpiar datos antiguos
                    localStorage.removeItem('userName');
                    localStorage.removeItem('userId');
                    localStorage.removeItem('userInfo');
                    
                    setUser(userData);
                    console.log('Migración completada:', userData);
                }
            }
        } catch (error) {
            console.error("Error al cargar datos de usuario:", error);
            logout();
        } finally {
            setLoading(false);
        }
    }, []);

    const login = (userData: User, token: string) => {
        localStorage.setItem('token', token);
        localStorage.setItem('userData', JSON.stringify(userData));
        
        // Limpiar cualquier dato del formato antiguo que pueda existir
        localStorage.removeItem('userName');
        localStorage.removeItem('userId');
        localStorage.removeItem('userInfo');
        
        setUser(userData);
    };

    const logout = () => {
        // Limpiar todos los datos posibles
        localStorage.removeItem('token');
        localStorage.removeItem('userData');
        localStorage.removeItem('userName');
        localStorage.removeItem('userId');
        localStorage.removeItem('userInfo');
        
        setUser(null);    
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth debe usarse dentro de un AuthProvider");
    }
    return context;
};