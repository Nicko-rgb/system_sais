import axios from 'axios';
import Swal from 'sweetalert2';
import { toast } from 'react-toastify';

const API_URL = import.meta.env.VITE_API_URL;

// Función para buscar paciente por Historia Clínica
export const searchByHisClinico = async (value) => {
    if (!value.trim()) return null;

    try {
        const response = await axios.get(`${API_URL}/api/obtener-paciente-historia/${value}`);
        return response.data;
    } catch (error) {
        console.error('Error al buscar paciente:', error);
        return null;
    }
};

// Función para buscar paciente por DNI
export const searchByDNI = async (value) => {
    if (!value.trim()) return null;

    try {
        const response = await axios.get(`${API_URL}/api/obtener-paciente-dni/${value}`);
        return response.data;
    } catch (error) {
        console.error('Error al buscar paciente:', error);
        return null;
    }
};

// Función para registrar una nueva cita
export const registerCita = async (citaData) => {
    try {
        const response = await axios.post(`${API_URL}/api/nino/registrar-cita`, citaData);
        return {
            success: true,
            message: response.data.message || 'Cita registrada con éxito'
        };
    } catch (error) {
        console.error('Error al registrar cita:', error);
        return {
            success: false,
            message: error.response?.data?.message || 'Error al registrar la cita'
        };
    }
};

// Función para formatear los datos del paciente
export const formatPatientData = (data) => {
    return {
        id_paciente: data.id_paciente,
        id_responsable: data.id_responsable,
        hist_clinico: data.hist_clinico,
        dni: data.dni,
        apellidos: `${data.ape_paterno} ${data.ape_materno}`,
        nombres: data.nombres,
        fecha_nacimiento: new Date(data.fecha_nacimiento).toISOString().split('T')[0],
        edad: data.edad,
        telefono: data.celular1 || data.celular2 || data.celular1_res,
        direccion: data.direccion || data.direccion_res
    };
};

// Función para limpiar campos
export const clearFieldsCita = () => {
    return {
        idPaciente: '',
        idRespons: '',
        apellidos: '',
        nombres: '',
        fechaNacimiento: '',
        edad: '',
        telefono: '',
        direccion: '',
        motivoConsulta: '',
        semEmbarazo: '',
        metodo: ''
    };
};

// Formatear hora en formato HH:mm
export const formatTime = (timeString) => {
    if (!timeString) return '---';
    const [hours, minutes] = timeString.split(':');
    return `${hours?.padStart(2, '0')}:${minutes?.padStart(2, '0')}`;
};

// Obtener filas bloqueadas desde el servidor
export const fetchBlockedRows = async () => {
    try {
        const response = await axios.get(`${API_URL}/api/nino/verificar-bloqueos-cita`);
        return response.data;
    } catch (error) {
        console.error('Error al obtener filas bloqueadas:', error);
        return [];
    }
};

// Función para bloquear horario
export const bloquearHorario = async (data) => {
    const { fecha, hora_inicio, hora_fin, consultorio, especialidad } = data;

    const result = await Swal.fire({
        title: '¿Estás seguro?',
        text: `¿Deseas bloquear el horario?\nFecha: ${fecha}\nHora: ${hora_inicio} - ${hora_fin}\nConsultorio: ${consultorio}`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, Bloquear',
        cancelButtonText: 'Cancelar',
        reverseButtons: true
    });

    if (result.isConfirmed) {
        try {
            await axios.post(`${API_URL}/api/nino/bloquear-hora-cita`, data);
            toast.success('Horario bloqueado exitosamente');
            return true;
        } catch (error) {
            console.error('Error al bloquear horario:', error);
            toast.error('No se pudo bloquear el horario');
            return false;
        }
    }
    return false;
};

// Función para desbloquear horario
export const desbloquearHorario = async (data) => {
    try {
        await axios.delete(`${API_URL}/api/nino/desbloquear-hora-cita`, { data });
        toast.success('Horario desbloqueado exitosamente');
        return true;
    } catch (error) {
        console.error('Error al desbloquear horario:', error);
        toast.error('No se pudo desbloquear el horario');
        return false;
    }
};

// Funcion para borrar cita
export const deleteCita = async (citaData) => {

    const result = await Swal.fire({
        title: '¿Eliminar cita?',
        text: `¿Deseas eliminar cita para ${citaData.nombres} ${citaData.ape_paterno} ${citaData.ape_materno}? `,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, Eliminar',
        cancelButtonText: 'Cancelar',
        reverseButtons: true
    });
    if (result.isConfirmed) {
        try {
            // Realiza la solicitud para borrar la cita
            await axios.delete(`${API_URL}/api/nino/delete-cita/${citaData.id}`);
            toast.success('Cita eliminada exitosamente');
            close();
        } catch (error) {
            console.error('Error al borrar cita:', error);
            toast.error('No se pudo borrar la cita');
        }
    }
}