import React, { useEffect, useState } from 'react';
import { useNavigate } from'react-router-dom'
import { Box, Container, TextField, Button, Typography, Paper, Grid } from '@mui/material';
import { toast } from 'react-toastify';
import Coordenada from '../../data/CoodenadaMap';

const CrearFicha = ({ onClose }) => {
    const API_URL = import.meta.env.VITE_API_URL;
    const navigate = useNavigate();
    const { manzanas } = Coordenada()
    const [formData, setFormData] = useState({
        manzana: '',
        vivienda_numero: '',
        grupo_familiar: '',
    });

        

    const [codigoFicha, setCodigoFicha] = useState('');
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        const { manzana, vivienda_numero, grupo_familiar } = formData;
        if (manzana && vivienda_numero && grupo_familiar) {
            const cod = `${manzana}${vivienda_numero}${grupo_familiar.toUpperCase()}`;
            setCodigoFicha(cod);
        } else {
            setCodigoFicha('');
        }
    }, [formData]);

    const handleChange = (e) => {
        const { name, value } = e.target;

        let newValue = value;

        if (name === 'manzana') {
            newValue = value.toUpperCase().replace(/[^A-Z0-9]/g, '');
        } else if (name === 'vivienda_numero') {
            newValue = value.replace(/[^0-9]/g, '');
        } else if (name === 'grupo_familiar') {
            newValue = value.toUpperCase().replace(/[^A-Z]/g, '');
        }

        setFormData({
            ...formData,
            [name]: newValue,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const toastId = toast.loading('Verificando datos...', {position: 'top-center'} );
    
        // Verificar si la manzana existe en el array de Coordenada
        const manzanaInput = formData.manzana.toUpperCase();
    
        const manzanaExiste = manzanas.some((m) => {
            const txtManzana = m.text.split('\n')[0].trim().toUpperCase();
            return txtManzana === manzanaInput;
        });
    
        if (!manzanaExiste) {
            toast.error('La manzana ingresada no existe en la base de datos', {position: 'top-center'} );
            toast.dismiss(toastId)
            setLoading(false);
            return;
        }
    
        const finalData = {
            ...formData,
            codigo_ficha: codigoFicha
        };
    
        try {
            const res = await fetch(`${API_URL}/api/ficha/register-ficha`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(finalData),
            });
    
            const data = await res.json();
    
            if (res.ok) {
                toast.success('Ficha guardada correctamente', {position: 'top-center'});
                toast.dismiss(toastId)
                onClose();
                navigate(`/ficha/${data.codigo_ficha}`);
            } else {
                toast.error(data.message || 'Error al guardar ficha', {position: 'top-center'} );
                toast.dismiss(toastId)
            }
        } catch (error) {
            toast.error('Error del servidor');
            toast.dismiss(toastId)
            console.error(error);
        } finally {
            setLoading(false);
            toast.dismiss(toastId)
        }
    };
    

    return (
        <Container maxWidth="md" >
            <Paper elevation={2} sx={{ padding: 4, textAlign: 'center', marginTop: 2 }}>
                <Typography variant="h5" gutterBottom>
                    Crear Nueva Ficha Familiar
                </Typography>
                <form onSubmit={handleSubmit}>
                    {/* Primera fila: inputs sin espacios innecesarios */}
                    <Box display="flex" gap={2} mb={2}>
                        <TextField
                            fullWidth
                            label="Manzana"
                            name="manzana"
                            value={formData.manzana}
                            onChange={handleChange}
                            required
                            InputProps={{ style: { fontWeight: 700}}}
                            // InputLabelProps={{ style: { fontWeight: 600 } }}
                        />
                        <TextField
                            fullWidth
                            label="Vivienda N°"
                            name="vivienda_numero"
                            value={formData.vivienda_numero}
                            onChange={handleChange}
                            required
                            InputProps={{ style: { fontWeight: 700 } }}
                            // InputLabelProps={{ style: { fontWeight: 600 } }}
                        />
                        <TextField
                            fullWidth
                            label="Grupo Familiar"
                            name="grupo_familiar"
                            value={formData.grupo_familiar}
                            onChange={handleChange}
                            inputProps={{ maxLength: 1 }}
                            required
                            InputProps={{ style: { fontWeight: 700 } }}
                            // InputLabelProps={{ style: { fontWeight: 600 } }}
                        />
                    </Box>

                    {/* Código de ficha centrado */}
                    <Box display="flex" justifyContent="center" mb={3}>
                        <TextField
                            label="Código de Ficha"
                            value={codigoFicha}
                            InputProps={{ readOnly: true, style: { fontWeight: 700 } }}
                            // InputLabelProps={{ style: { fontWeight: 600 } }}
                        />
                    </Box>

                    {/* Botones en una fila centrados y espaciados */}
                    <Box display="flex" justifyContent="space-evenly" marginTop={5} >
                        <Button variant="contained" color="primary" type="submit">
                            {loading ? 'Guardando...' : 'Guardar Ficha'}
                        </Button>
                        <Button variant="outlined" color="secondary" onClick={onClose}>
                            Cancelar
                        </Button>
                    </Box>
                </form>
            </Paper>
        </Container>
    );
};

export default CrearFicha;
