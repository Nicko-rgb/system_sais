import { TbNurse } from "react-icons/tb";
import { FaUserDoctor } from "react-icons/fa6";
import { MdPsychology } from "react-icons/md";
import { FaTooth, FaCalendarAlt, FaBaby } from 'react-icons/fa';
import { LiaNutritionix } from "react-icons/lia";


export const obtenerPacientesPorTipo = async (tipo) => {
    const API_URL = import.meta.env.VITE_API_URL;
    try {
        const response = await fetch(`${API_URL}/api/obtener-pacientes-por-tipo?tipo=${tipo}`);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error al obtener pacientes:', error);
        throw error;
    }
};

export const obtenerCategoriaPorEdad = (edad) => {
    const edadNum = parseInt(edad);
    
    if (isNaN(edadNum)) {
        throw new Error('La edad debe ser un número válido');
    }

    if (edadNum >= 0 && edadNum <= 11) {
        return 'Niño';
    } else if (edadNum >= 12 && edadNum <= 17) {
        return 'Adolescente';
    } else if (edadNum >= 18 && edadNum <= 29) {
        return 'Joven';
    } else if (edadNum >= 30 && edadNum <= 59) {
        return 'Adulto';
    } else if (edadNum >= 60) {
        return 'Adulto Mayor';
    } else {
        throw new Error('La edad debe ser un número positivo');
    }
};

export const opcionesCita = [
    { especialidad: 'Enfermería', icon: 'TbNurse' },
    { especialidad: 'Medicina', icon: 'FaUserDoctor' },
    { especialidad: 'Nutrición', icon: 'LiaNutritionix' },
    { especialidad: 'Obstetricia_CPN', icon: 'FaBaby' },
    { especialidad: 'Odontología', icon: 'FaTooth' },
    { especialidad: 'Planificación', icon: 'FaCalendarAlt' },
    { especialidad: 'Psicología', icon: 'MdPsychology' },
];


export const column = [
    { label: 'Fecha', field: 'fecha', render: (item) => new Date(item.fecha).toLocaleDateString() },
    { label: 'Hora', field: 'hora' },
    {
        label: 'Nombres Paciente',
        field: 'nombres',
        render: (item) => `${item.nombres} ${item.ape_paterno} ${item.ape_materno}`
    },
    { label: 'DNI', field: 'dni' },
    { label: 'Tel Paciente', field: 'telefono' },
    {label: 'Profesional', field:'profesional_cita' },
    { label: 'Motivo', field: 'motivoConsulta' },
    { label: 'Consultorio', field: 'especialidad', render: (item) => `${item.especialidad} - ${item.consultorio}`    },
    // { label: 'Consul', field: 'consultorio' },
];