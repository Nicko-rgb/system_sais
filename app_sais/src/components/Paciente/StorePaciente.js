import { useState, useEffect } from "react"
const API_URL = import.meta.env.VITE_API_URL;
import { toast } from "react-toastify";

const handleError = (err) => {
    toast.error(err.message || 'Error en la operación');
    console.log('Error: ', err);
    return false;
};

export const usePacienteStore = () => {

    const [paciente, setPaciente] = useState({});
    const [loading, setLoading] = useState(false);

    const fetchPaciente = async (historia) => {
        if (!historia) {
            return;
        }
        const toastId = toast.loading('Verificando datos...', { position: 'top-center' });
        setLoading(true);
        try {
            const response = await fetch(`${API_URL}/api/obtener-paciente-historia/${historia}`);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message);
            }

            setPaciente(data);
            toast.success(data.message);
            return true; 
        } catch (err) {
            toast.error(err.message || 'Error al buscar paciente');
            console.log('Erro: ', err);
            return false; 
        } finally {
            setLoading(false);
            toast.dismiss(toastId) 
        }
    }
    const updatePaciente = async (id, data) => {
        const toastId = toast.loading('Actualizando datos...', { position: 'top-center' });
        setLoading(true);
        try {
            const response = await fetch(`${API_URL}/api/actualizar-paciente/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });

            const responseData = await response.json();

            if (!response.ok) {
                throw new Error(responseData.message);
            }

            setPaciente(responseData);
            toast.success('Datos actualizados correctamente');
            return true;
        } catch (err) {
            return handleError(err);
        } finally {
            setLoading(false);
            toast.dismiss(toastId);
        }
    };

    return {
        paciente,
        loading,
        setLoading,
        fetchPaciente,
        updatePaciente
    }
}

