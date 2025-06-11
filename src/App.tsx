import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Login from './Pages/Login';
import Home from './Pages/Home';
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
        <CircularProgress size={60} sx={{ color: 'white' }} />
      </Box>
    );
  }

  return (
    <div className="app">
      <Router>
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
            path='*' 
            element={<Navigate to={isAuthenticated ? "/" : "/login"} replace />} 
          />
          <Route 
            path='/Transaccion' 
            element={<TransaccionPage />} 
          />
        </Routes>
      </Router>
    </div>
  );
}

export default App;