import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Login from './Pages/Login';
import Home from './Pages/Home';
import Categorias from './Pages/Categorias';
import { CircularProgress, Box } from '@mui/material';
import './App.css';
import TransaccionPage from './pages/Transaccion';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null); // null = cargando
  
  // ✅ ACTUALIZADO: Función para verificar autenticación incluyendo userId
  const checkAuth = () => {
    const token = localStorage.getItem('token');
    const userName = localStorage.getItem('userName');
    const userId = localStorage.getItem('userId'); // ✅ NUEVO: Verificar userId
    
    console.log('Verificando autenticación:');
    console.log('- Token:', token ? 'Presente' : 'Ausente');
    console.log('- UserName:', userName || 'Ausente');
    console.log('- UserId:', userId || 'Ausente');
    
    return !!(token && userName && userId); // ✅ ACTUALIZADO: Requiere los 3 valores
  };

  // Verificar autenticación al cargar la app
  useEffect(() => {
    setIsAuthenticated(checkAuth());
  }, []);

  // ✅ ACTUALIZADO: Función para limpiar TODOS los datos del usuario
  const updateAuth = () => {
    setIsAuthenticated(checkAuth());
  };

  // ✅ NUEVO: Función para logout completo
  const handleLogout = () => {
    console.log('Cerrando sesión y limpiando datos...');
    localStorage.removeItem('token');
    localStorage.removeItem('userName');
    localStorage.removeItem('userId');
    localStorage.removeItem('userInfo'); // Por si guardaste info adicional
    setIsAuthenticated(false);
  };

  // Mostrar loading mientras verifica
  if (isAuthenticated === null) {
    return (
      <Box
        sx={{
          width: '100vw',
          height: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#ffffff',
        }}
      >
        <CircularProgress size={60} sx={{ color: '#6366f1' }} />
      </Box>
    );
  }

  return (
    <div className="app">
      <Routes>
        <Route 
          path='/login' 
          element={isAuthenticated ? <Navigate to="/" replace /> : <Login onLogin={updateAuth} />} 
        />
        <Route 
          path='/' 
          element={isAuthenticated ? <Home onLogout={updateAuth} /> : <Navigate to="/login" replace />} 
        />
        <Route 
          path='/categorias' 
          element={isAuthenticated ? <Categorias onLogout={updateAuth} /> : <Navigate to="/login" replace />} 
        />
        <Route 
          path='/transaccion' 
          element={<TransaccionPage />} 
        />
        <Route 
          path='*' 
          element={<Navigate to={isAuthenticated ? "/" : "/login"} replace />} 
        />
        <Route 
          path='*' 
          element={
            <Navigate to={isAuthenticated ? "/" : "/login"} replace />
          } 
        />
      </Routes>
    </div>
  );
}

export default App;