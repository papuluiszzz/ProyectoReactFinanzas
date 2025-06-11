import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Login from './pages/Login';
import Home from './pages/Home';
import Categorias from './pages/Categorias';
import TransaccionPage from "./pages/Transaccion";
import { CircularProgress, Box } from '@mui/material';
import './App.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null); // null = cargando
  
  // Función para verificar autenticación
  const checkAuth = () => {
    const token = localStorage.getItem('token');
    const userName = localStorage.getItem('userName');
    return !!(token && userName);
  };

  // Verificar autenticación al cargar la app
  useEffect(() => {
    setIsAuthenticated(checkAuth());
  }, []);

  // Función para actualizar el estado de autenticación (la pasaremos a los componentes)
  const updateAuth = () => {
    setIsAuthenticated(checkAuth());
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