const API_URL = import.meta.env.VITE_API_URL;
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

const useStoreTurno = () => {

    const [mesActual, setMesActual] = useState(new Date());
    const [personales, setPersonales] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [filtroCondicion, setFiltroCondicion] = useState('Todos');
    const [condicionFiltro, setCondiconFiltro] = useState([])
    const [profesionFiltro, setProfesionFiltro] = useState([])
    const [columnasBloqueadas, setColumnasBloqueadas] = useState([]); // Cambiar a un arreglo de fechas bloqueadas
    const [columnaSeleccionada, setColumnaSeleccionada] = useState(null);
    const [editOpen, setEditOpen ] = useState(false)

    const [turnos, setTurnos] = useState([]);

    const fetchPersonales = async () => {
        setCargando(true);
        try {
            const response = await fetch(`${API_URL}/api/obtener-personal-for-turnos`);
            const data = await response.json();
            setPersonales(data);
            //filtrar tipo e condicion unicos
            const condicionUnicos = Array.from(new Set(data.map(personal => personal.condicion)));
            setCondiconFiltro(condicionUnicos);
            //filtrar profesion unicos
            const profesionUnicos = Array.from(new Set(data.map(personal => personal.profesion)));
            setProfesionFiltro(profesionUnicos);
        } catch (error) {
            console.error('Error al obtener los personales de salud:', error);
        } finally {
            setCargando(false);
        }
    };

    useEffect(() => {
        fetchPersonales();
    }, [mesActual]);

    const fetchTurnosPersonal = async () => {
        try {
            const response = await fetch(`${API_URL}/api/obtener-turnos/personal`);
            const data = await response.json();
            setTurnos(data);
        } catch (error) {
            console.error('Error al obtener los tipos de turnos:', error);
        }
    };

    const fetchFechasBloqueadas = async () => {
        try {
            const response = await fetch(`${API_URL}/api/obtener-fechas-bloqueadas`);
            const data = await response.json();
            // Convertir las fechas a formato de string para comparar correctamente
            const fechasBloqueadas = data.map(f => new Date(f.fecha).toDateString());
            setColumnasBloqueadas(fechasBloqueadas);
        } catch (error) {
            console.error('Error al obtener las fechas bloqueadas:', error);
        }
    };

    // Para obtener los tipos de turno de personal de salud
    const [tiposDeTurno, setTiposDeTurno] = useState([])
    const fetchTiposDeTurno = async () => {
        try {
            const response = await fetch(`${API_URL}/api/tipos-turno`);
            const data = await response.json();
            setTiposDeTurno(data);
        } catch (error) {
            console.error('Error al obtener los tipos de turnos:', error);
        }
    };

    useEffect(() => {
        fetchTurnosPersonal();
        fetchFechasBloqueadas();
        fetchTiposDeTurno();
    }, [])


    const manejarBloqueoColumna = async (fecha) => {
        try {
            // Convertir la fecha al formato YYYY-MM-DD para MySQL
            const fechaFormateada = new Date(fecha).toISOString().split('T')[0];

            if (columnasBloqueadas.includes(fecha)) {
                // Si la fecha está bloqueada, envía una solicitud para desbloquearla
                await fetch(`${API_URL}/api/desbloquear-fecha-turno`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ fecha: fechaFormateada }),  // Usar la fecha formateada
                });
                // Desbloquear localmente
                setColumnasBloqueadas(prev => prev.filter(columna => columna !== fecha));
            } else {
                // Si la fecha no está bloqueada, envía una solicitud para bloquearla
                await fetch(`${API_URL}/api/bloquear-fecha-turno`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ fecha: fechaFormateada }),  // Usar la fecha formateada
                });
                // Bloquear localmente
                setColumnasBloqueadas(prev => [...prev, fecha]);
            }
        } catch (error) {
            console.error('Error al bloquear/desbloquear la fecha:', error);
        }
        setColumnaSeleccionada(null); // Cerrar el botón de bloquear después de hacer clic
    };

    // Enviar los turnos al servidor para guardar
    const manejarGuardarTurno = async (id_personal, id_turno_tipo, fecha) => {
        try {
            const response = await fetch(`${API_URL}/api/asignar-turno/personal`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id_personal, id_turno_tipo, fecha })
            });
            await response.json();
            // Actualizar el estado local
            manejarRestablecerTurnos()
            toast.success('Turno guardado');

        } catch (error) {
            console.error('Error al guardar el turno:', error);
        }
    };
    // Restablecer turnos
    const manejarRestablecerTurnos = async () => {
        try {
            const response = await fetch(`${API_URL}/api/obtener-turnos/personal`, {
                method: 'GET'
            });
            const data = await response.json();
            const turnosIniciales = {};
            data.forEach(({ id_personal, fecha, id_turno_tipo }) => {
                turnosIniciales[`${id_personal}_${new Date(fecha).toDateString()}`] = id_turno_tipo;
            });
            setTurnos(turnosIniciales);
        } catch (error) {
            console.error('Error al restablecer los turnos:', error);
        }
    };

    const manejarSeleccionColumna = (fecha) => {
        if (columnaSeleccionada === fecha) {
            setColumnaSeleccionada(null);
        } else {
            setColumnaSeleccionada(fecha); // Selecciona la columna actual
        }
    };

    const manejarMesSiguiente = () => {
        setMesActual(prevMes => {
            const nuevoMes = new Date(prevMes);
            nuevoMes.setMonth(nuevoMes.getMonth() + 1);
            return nuevoMes;
        });
    };

    const manejarMesAnterior = () => {
        setMesActual(prevMes => {
            const nuevoMes = new Date(prevMes);
            nuevoMes.setMonth(nuevoMes.getMonth() - 1);
            return nuevoMes;
        });
    };


    // Definición de colores para cada tipo de turno
    const coloresDefault = {
        'M': 'lightgreen',
        'T': '#64B5F6',
        'MT': '#81C784',
        'GD': '#FFD54F',
        'GDD': '#BA68C8',
        'MVD': '#FFAB91',
        'TVD': '#4DB6AC',
        'MVSF': 'gray',
        'TVSF': '#FFF176',
        'L': '#FFFFFFFF'
    };

    const [coloresTurno, setColoresTurno] = useState(
        JSON.parse(localStorage.getItem('coloresTurno')) || coloresDefault
    );

    const actualizarColor = (turno, color) => {
        const nuevosColores = { ...coloresTurno, [turno]: color };
        setColoresTurno(nuevosColores);
        localStorage.setItem('coloresTurno', JSON.stringify(nuevosColores));
        // Forzar actualización en todos los componentes que usan coloresTurno
        window.dispatchEvent(new Event('coloresActualizados'));
    };

    // Escuchar cambios en los colores desde otros componentes
    useEffect(() => {
        const handleColoresActualizados = () => {
            const coloresGuardados = JSON.parse(localStorage.getItem('coloresTurno')) || coloresDefault;
            setColoresTurno(coloresGuardados);
        };

        window.addEventListener('coloresActualizados', handleColoresActualizados);
        return () => window.removeEventListener('coloresActualizados', handleColoresActualizados);
    }, []);

    const restablecerColores = () => {
        setColoresTurno(coloresDefault);
        localStorage.removeItem('coloresTurno');
        window.dispatchEvent(new Event('coloresActualizados'));
        toast.success('Colores restablecidos');
    };

    return {
        mesActual,
        setMesActual,
        personales,
        cargando,
        filtroCondicion,
        setFiltroCondicion,
        condicionFiltro,
        profesionFiltro,
        turnos,
        tiposDeTurno,

        manejarBloqueoColumna,
        columnasBloqueadas,
        columnaSeleccionada,
        setColumnaSeleccionada,
        manejarGuardarTurno,
        manejarRestablecerTurnos,

        coloresTurno,
        actualizarColor,
        restablecerColores,

        manejarSeleccionColumna,
        manejarMesSiguiente,
        manejarMesAnterior,

        editOpen,
        setEditOpen,
    }
}

export default useStoreTurno;