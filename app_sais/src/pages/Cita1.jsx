import React, { useEffect, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { FaCalendarCheck } from "react-icons/fa";
import { RiPlayReverseLargeFill } from "react-icons/ri";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import axios from 'axios';
import '../styles/citas.css';
import Citas2 from '../components/Citas/Cita2'
import CuerpoTabla from '../components/Citas/CuerpoTabla';
import Calendar from 'react-calendar';
import Header from '../components/NavHeader/Header';

const Cita1 = () => {
    const location = useLocation();
    const { especialidad } = location.state || {};
    const [horarios, setHorarios] = useState([]);
    const [openCalendar, setOpenCalendar] = useState(false);
    const consultorio1 = 1;
    const consultorio2 = 2;
    const [fecha, setFecha] = useState(() => {
        const today = new Date();
        today.setHours(12, 0, 0, 0); // Establecer hora a mediodía para evitar problemas de zona horaria
        return today;
    });
    const API_URL = import.meta.env.VITE_API_URL;

    useEffect(() => {
        if (especialidad) {
            axios.get(`${API_URL}/api/nino/horarios-cita?id_especialidad=${especialidad.id_especi}`)
                .then(response => setHorarios(response.data))
                .catch(error => console.error("Error al obtener los horarios:", error));
        }
    }, [especialidad]);

    const handleDateChange = (date) => {
        setFecha(date);
    };

    const handlePreviousDay = () => {
        // Restar un día a la fecha actual
        setFecha((prevFecha) => {
            const newFecha = new Date(prevFecha);
            newFecha.setDate(newFecha.getDate() - 1);
            return newFecha;
        });
    };

    const handleNextDay = () => {
        // Sumar un día a la fecha actual
        setFecha((prevFecha) => {
            const newFecha = new Date(prevFecha);
            newFecha.setDate(newFecha.getDate() + 1);
            return newFecha;
        });
    };

    const handleCalendar = () => {
        setOpenCalendar(!openCalendar);
    };

    if (!especialidad) {
        return <p>Especialidad no encontrada o no se recibieron datos.</p>;
    }

    // Convertir fecha a formato legible
    const fechaFormateada = fecha.toLocaleDateString('es-ES', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });

    const fechaFormatNumero = new Date(fecha).toISOString().split('T')[0];

    const txtNav = `CITAS ${especialidad.especialidad}`
    return (
        <div className="cita-nino">
            <Header active={txtNav} />
            <main>
                <div className="container-tb">
                    <div className="header-tab">
                        <Link to='/dashboard' className='volver_link'>
                            <RiPlayReverseLargeFill /> Back
                        </Link>
                        {openCalendar && (
                            <div className="md-calendar" onClick={handleCalendar} >
                                <div className="md-cale" onClick={(e) => e.stopPropagation()}>
                                    <Calendar
                                        className="custom-calendar"
                                        onChange={handleDateChange}
                                        value={fecha}
                                        tileClassName={({ date, view }) => view === 'month' && date.getDay() === 0 ? 'react-calendar__tile--sunday' : null}
                                    />
                                </div>
                            </div>
                        )}
                        <p className="txt_header">CONSULTORIO N° {consultorio1}  </p>
                        <button className='bt' onClick={handleCalendar} style={{gap: '4px'}}><FaCalendarCheck />{openCalendar ? 'Cerrar Calendario' : 'Abrir Calendario'} </button>
                        <button className='bt' onClick={handlePreviousDay}><IoIosArrowBack className='icod' /> Anterior</button>
                        <button className='bt' onClick={handleNextDay}>Siguiente <IoIosArrowForward className='icod' /></button>
                        <p className='txt_header'>{fechaFormateada} </p>
                    </div>
                    <table className="cita-table">
                        <thead>
                            <tr>
                                <th>Hora</th>
                                <th>Turno</th>
                                <th>DNI</th>
                                <th>Apellidos y Nombres</th>
                                <th>Edad</th>
                                <th>Nacimiento</th>
                                <th>Celular</th>
                                {especialidad.especialidad.toLowerCase() === 'medicina' && <th>Dirección</th>}
                                {especialidad.especialidad.toLowerCase() === 'obstetricia_cpn' && <th>Sem. de Embarazo</th>}
                                {especialidad.especialidad.toLowerCase() === 'planificación' && <th>Método Planificación</th>}
                                <th>Motivo Consulta</th>
                                <th>Profesional Responsable</th>
                                <th>Acción</th>
                            </tr>
                        </thead>
                        <CuerpoTabla
                            horarios={horarios}
                            especialidad={especialidad.especialidad}
                            fecha={fechaFormatNumero}
                            consultorio={consultorio1}
                        />
                    </table>
                </div>
                <hr />
                {especialidad.consultorios !== 1 ? (
                    <Citas2
                        horarios={horarios}
                        especialidad={especialidad}
                        consultorio={consultorio2}
                        fecha={fechaFormatNumero}
                        fechaT={fechaFormateada}
                    />
                ) : (
                    <p style={{ textAlign: 'center' }}>No hay Consultorio 2</p>
                )}
            </main>
        </div>
    );
};

export default Cita1;