import { useState, useEffect } from 'react';
import axios from 'axios';

const Store = () => {
    const apiUrl = import.meta.env.VITE_API_URL;
    // Logica para obtener a los personales de salud
    const [personalSalud, setPersonalSalud] = useState([])
    const [profesionFiltro, setProfesionFiltro] = useState([])
    const [condicionFiltro, setCondiconFiltro] = useState([])
    const [cargando, setCargando] = useState(true);
    const API_URL = import.meta.env.VITE_API_URL;

    const fetchPersonalSalud = async () => {
        setCargando(true)
        try {
            const response = await fetch(`${API_URL}/api/obtener-personal-for-turnos`);
            const data = await response.json();
            setPersonalSalud(data);

            // Filtrar tipos de profesion unicos
            const preofesionUnicos = Array.from(new Set(data.map(personal => personal.profesion)));
            setProfesionFiltro(preofesionUnicos);
            //filtrar tipo e condicion unicos
            const condicionUnicos = Array.from(new Set(data.map(personal => personal.condicion)));
            setCondiconFiltro(condicionUnicos);

        } catch (error) {
            console.error('Error al obtener el personal:', error);
        } finally {
            setCargando(false)
        }
    };

    //para obtener horarios de citas bloqueadas
    const [blockedRows, setBlockedRows] = useState([]);
    const fetchBlockedRows = async () => {
        try {
            const response = await axios.get(`${API_URL}/api/nino/verificar-bloqueos-cita`);
            setBlockedRows(response.data);
        } catch (error) {
            console.error('Error al obtener filas bloqueadas:', error);
        }
    };


    //para obtener todas las citas de ninos
    const [citas, setCitas] = useState([]);
    const fetchCitas = async () => {
        try {
            const response = await axios.get(`${API_URL}/api/filtrar-todas-citas-ninho`)
            setCitas(response.data);
        } catch (error) {
            console.error('Error al obtener citas:', error);
        }
    }

    const [turnosPersonal, setTurnosPersonal] = useState([])
    const fetchTurnosPersonal = async () => {
        try {
            const response = await axios.get(`${API_URL}/api/obtener-turnos/personal`);
            setTurnosPersonal(response.data);
        } catch (error) {
            console.error('Error al obtener turnos de personal:', error);
        }
    }

    //para obtener profesion y servicio de personal de salud
    const [profesiones, setProfesiones] = useState([]);
    const [servicios, setServicios] = useState([]);
    const fetchOptionsProfesServi = async () => {
        try {
            const profesionResponse = await fetch(`${API_URL}/api/obtener/profesiones`);
            const servicioResponse = await fetch(`${API_URL}/api/obtener/servicios`);

            if (profesionResponse.ok && servicioResponse.ok) {
                const profesionesData = await profesionResponse.json();
                const serviciosData = await servicioResponse.json();
                setProfesiones(profesionesData);
                setServicios(serviciosData);
            } else {
                console.error("Error al cargar profesiones o servicios.");
            }
        } catch (error) {
            console.error("Error de red:", error);
        }
    };

    // Obtner especialidades de citas
    const [especialidad, setEspecialidad] = useState([]);

    const fetchEspecialidad = async () => {
        try {
            const response = await axios.get(`${API_URL}/api/nino/especialidad-unico-nino`);
            setEspecialidad(response.data);
        } catch (error) {
            console.error("Error al obtener los horarios:", error);
        }
    };

    useEffect(() => {
        fetchEspecialidad();
    }, []);

    // obtener datos de sector asignado a personal
    const [sectorPer, setSectorPer] = useState([]);
    const fetchSectorPer = async () => {
        setCargando(true)
        try {
            const response = await axios.get(`${API_URL}/api/personal/obtener-sector-asignado`);
            setSectorPer(response.data);    
            setCargando(false)
        } catch (error) {
            console.error('Error al obtener los datos del sector:', error);
            setCargando(false)
        }
    }

    // Carga de datos 
    useEffect(() => {
        fetchPersonalSalud();
        fetchBlockedRows()
        fetchTurnosPersonal()
        fetchOptionsProfesServi()
    }, []);

    useEffect(() => {
        fetchSectorPer()
        fetchCitas();
        const intervalId = setInterval(() => {
            fetchCitas();
            fetchSectorPer()
        }, 1000);

        return () => clearInterval(intervalId);
    }, []);

    const obtenerDescripcionTurno = (clave_turno) => {
        switch (clave_turno) {
            case 'M':
                return 'Mañana';
            case 'T':
                return 'Tarde';
            case 'MT':
                return 'Mañana y Tarde';
            case 'GD':
                return 'Guardia Diurna';
            case 'GDD':
                return 'Guardia Devolución';
            case 'MVD':
                return 'Mañana Visita Domiciliaria';
            case 'TVD':
                return 'Tarde Visita Domiciliaria';
            case 'MVSF':
                return 'Mañana Visita Salud Familiar';
            case 'TVSF':
                return 'Tarde Visita Salud Familiar';
            case 'L':
                return 'Libre';
            default:
                return 'Indefinido';
        };
    };

    // Definición de colores para cada tipo de turno

    return {
        apiUrl,
        personalSalud,
        profesionFiltro,
        condicionFiltro,
        cargando,
        obtenerDescripcionTurno,
        blockedRows,
        citas,
        turnosPersonal,
        profesiones,
        servicios,
        fetchOptionsProfesServi,
        especialidad,
        fetchEspecialidad,
        sectorPer,
    }
}

export default Store