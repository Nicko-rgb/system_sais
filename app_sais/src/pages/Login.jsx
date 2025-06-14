import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Box, Container, TextField, Button, Typography, Paper, Grid } from '@mui/material';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import enfermeros from '../assets/img/hospital.png';
import logoSalud from '../assets/img/logoSalud.png';
import fondoForm from '../assets/img/fondoForm.svg';

const Login = () => {
    const navigate = useNavigate();
    const { login, loading, logout, user } = useAuth();
    const [credentials, setCredentials] = useState({
        dni: '',
        password: ''
    });

    // cerramos sesion 
    useEffect(()=> {
        if (user){
            navigate('/dashboard');
        }
    }, [])

    const handleChange = (e) => {
        const { name, value } = e.target;
        setCredentials(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const success = await login(credentials.dni, credentials.password);
        if (success) {
            navigate('/dashboard');
        }
    };

    return (
        <Box
            sx={{
                minHeight: '100vh',
                display: 'flex',
                backgroundColor: '#146B61FF',
            }}
        >
            <ToastContainer />
            <Container style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-evenly', alignItems: 'center' }}>
                <Box >
                    <Typography variant="h4" style={{ textShadow: '0 0 5px aquamarine', fontWeight: '800', fontSize: '1.7rem', textAlign: 'center', color: 'white'}}>
                        CENTRO DE SALUD MICAELA BASTIDAS
                    </Typography>
                    <Typography variant="h6" style={{textAlign: 'center', color: 'white', fontWeight: 600}}>
                        Sistema de Atención Integral de Salud
                    </Typography>
                </Box>
                <Box
                    component="img"
                    src={enfermeros}
                    alt="Equipo de enfermeros"
                    sx={{
                        maxWidth: '100%',
                        height: 'auto',
                        mt: 2
                    }}
                />
                <Box
                    component="img"
                    src={logoSalud}
                    alt="Logo Salud"
                    sx={{
                        maxWidth: 300,
                        height: 'auto',
                        mb: 2
                    }}
                />
            </Container>

            <Container style={{
                flex: 1, backgroundImage: `url(${fondoForm})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
            }}>
                <Grid item xs={12} md={6}>
                    <Paper
                        elevation={3}
                        sx={{
                            padding: 4,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            backgroundColor: 'white',
                            borderRadius: 2,
                            maxWidth: 400,
                            margin: '0 auto',
                            boxShadow: '0 0 10px rgba(0, 0, 0, 0.5)',
                        }}
                    >
                        <Typography component="h1" variant="h5" color="primary" style={{fontWeight: '800'}}>
                            INICIAR SESIÓN
                        </Typography>
                        <Typography component="h2" variant="subtitle1" color="primary" style={{fontWeight: '700'}}>
                            --SAIS--
                        </Typography>
                        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1, width: '100%' }}>
                            <TextField
                                margin="normal"
                                required
                                fullWidth
                                id="dni"
                                label="DNI"
                                name="dni"
                                autoComplete="dni"
                                autoFocus
                                value={credentials.dni}
                                onChange={handleChange}
                            />
                            <TextField
                                margin="normal"
                                required
                                fullWidth
                                name="password"
                                label="Clave"
                                type="password"
                                id="password"
                                autoComplete="current-password"
                                value={credentials.password}
                                onChange={handleChange}
                            />
                            <Button
                                type="submit"
                                fullWidth
                                variant="contained"
                                sx={{ mt: 3, mb: 2 }}
                                disabled={loading}
                            >
                                {loading ? 'Ingresando...' : 'Ingresar'}
                            </Button>
                            <Typography
                                variant="body2"
                                color="primary"
                                align="center"
                                sx={{ cursor: 'pointer', textDecoration: 'underline' }}
                            >
                                ¿Olvidaste tu contraseña?
                            </Typography>
                        </Box>
                    </Paper>
                </Grid>
            </Container>
        </Box>
    );
};

export default Login;