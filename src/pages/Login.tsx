import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    TextField,
    Button,
    Typography,
    Alert,
    CircularProgress,
    Paper,
} from '@mui/material';
import LoginIcon from '@mui/icons-material/Login';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';

interface LoginProps {
    onLogin: () => void; // Callback para notificar al App del login exitoso
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
    const navigate = useNavigate();
    
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        if (error) setError('');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!formData.email || !formData.password) {
            setError('Por favor, completa todos los campos');
            return;
        }

        setLoading(true);
        console.log('Enviando login:', { email: formData.email, password: formData.password });

        try {
            const response = await fetch('http://localhost:8000/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: formData.email,
                    password: formData.password
                }),
            });

            console.log('Status de respuesta:', response.status);
            const data = await response.json();
            console.log('Datos recibidos:', data);

            if (response.ok && data.success) {
                // Guardar en localStorage
                localStorage.setItem('token', data.accessToken);
                localStorage.setItem('userName', data.data);
                
                console.log('Login exitoso, actualizando estado...');
                
                // Notificar al App que hubo login exitoso
                onLogin();
                
                // Redirigir
                navigate('/');
            } else {
                console.error('Error en login:', data);
                setError(data.msg || 'Credenciales incorrectas');
            }
        } catch (error) {
            console.error('Error de conexión:', error);
            setError('Error de conexión. Verifica que el servidor esté funcionando.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box
            sx={{
                width: '100vw',
                height: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#f8fafc',
                padding: 2,
            }}
        >
            <Paper
                elevation={3}
                sx={{
                    p: 4,
                    width: '100%',
                    maxWidth: 400,
                    borderRadius: 3,
                    textAlign: 'center',
                }}
            >
                <Box mb={3}>
                    <AccountBalanceWalletIcon 
                        sx={{ 
                            fontSize: 60, 
                            color: 'primary.main', 
                            mb: 2 
                        }} 
                    />
                    <Typography variant="h4" fontWeight="bold" gutterBottom color="primary">
                        Finanzas Personales
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        Inicia sesión para gestionar tus finanzas
                    </Typography>
                </Box>

                {error && (
                    <Alert severity="error" sx={{ mb: 3 }}>
                        {error}
                    </Alert>
                )}

                <Box component="form" onSubmit={handleSubmit}>
                    <TextField
                        name="email"
                        label="Email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        variant="outlined"
                        fullWidth
                        required
                        disabled={loading}
                        sx={{ mb: 2 }}
                        placeholder="Ingresa tu email"
                    />

                    <TextField
                        name="password"
                        label="Contraseña"
                        type="password"
                        value={formData.password}
                        onChange={handleChange}
                        variant="outlined"
                        fullWidth
                        required
                        disabled={loading}
                        sx={{ mb: 3 }}
                        placeholder="Ingresa tu contraseña"
                    />

                    <Button
                        type="submit"
                        variant="contained"
                        fullWidth
                        disabled={loading}
                        startIcon={loading ? <CircularProgress size={20} /> : <LoginIcon />}
                        sx={{
                            py: 1.5,
                            fontSize: '1rem',
                            backgroundColor: '#2563eb',
                            color: 'white',
                            borderRadius: 2,
                            '&:hover': {
                                backgroundColor: '#1d4ed8',
                                transform: 'translateY(-2px)',
                                boxShadow: '0 4px 12px rgba(37, 99, 235, 0.4)',
                            },
                            '&:disabled': {
                                backgroundColor: '#94a3b8',
                                opacity: 0.7,
                            }
                        }}
                    >
                        {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
                    </Button>
                </Box>
            </Paper>
        </Box>
    );
};

export default Login;