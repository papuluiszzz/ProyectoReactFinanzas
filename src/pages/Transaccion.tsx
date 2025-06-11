import React, { useEffect, useState } from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';
import TransactionForm from '../Components/TransaccionForm';
import { useAuth } from '../Context/AuthContext';
import { useNavigate } from 'react-router-dom';

const TransaccionPage: React.FC = () => {
    const [categorias, setCategorias ] = useState<any[]>([]);
    const [ cuentas, setCuentas ] = useState<any[]>([]);
    const [ loading, setLoading ] = useState(true);
    const [ error, setError ] = useState<string | null>(null);
    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {

        if (!user) {
            navigate('/login');
            return;
        }

        const fetchData = async() => {
            try {
                const categoriesResponse = await fetch('http://localhost:8000/categorias');

                if (!categoriesResponse.ok) {
                    throw new Error("Error al obtener categoria");
                }
                const cuentasResponse = await fetch('http://localhost:8000/cuenta')
                const categoriasData = await categoriesResponse.json();

                if (!cuentasResponse.ok) {
                    throw new Error("Error al obtener tus cuentas");
                }
                const cuentasData = await cuentasResponse.json();
                    setCategorias(categoriasData);
                    setCuentas(cuentasData);
                    setLoading(false);
            } catch (error) {
                setError(error instanceof Error ? error.message:"Ocurrió un error.")
                setLoading(false);
            }
        };
        fetchData();
    }, [user.UserId]);

    const handleSubmit = async (transaccionData: any) => {
        try {
            
            const response = await fetch('http://localhost:8000/transaccion', {
                method: 'POST',
                headers: {
                    'Content-Type':'application/json',
                    'Authorization':`Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    ...transaccionData,
                    idUsuario: user.idUsuario,
                    fecha: transaccionData.fecha.toISOString().split('T')[0]
                })
            });

            if (!response.ok) {
                throw new Error("Error al registrar la transaccion.");
                
            }

            alert('Transaccion registrada exitosamente.');

        } catch (error) {
            alert(error instanceof Error ? error.message : 'Error al registrar la transaccion.')
        }
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" mt={4}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Box textAlign="center" mt={4}>
                <Typography color='error'>{error}</Typography>
            </Box>
        );
    }

    return (
        <Box maxWidth="md" mx="auto" p={3}>
            <Typography variant="h4" gutterBottom>
                Registrar Transacción
            </Typography>
            <TransactionForm 
                onSubmit={handleSubmit} 
                categorias={categorias} 
                cuentas={cuentas}
                idUsuario={user.UserId}
            />
        </Box>        
    );
};

export default TransaccionPage;