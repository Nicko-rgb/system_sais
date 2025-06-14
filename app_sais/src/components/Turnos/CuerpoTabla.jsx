import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import useStoreTurno from './StoreTurno';
import ReporteTurnos from './ReporteTurnos';

const CuerpoTabla = ({
    activosFiltrados,
    fechasDelMes,
    tiposDeTurno,
    obtenerClaveTurno,
    turnos,
    manejarClickPersonal,
    columnasBloqueadas,
    manejarGuardarTurno,
    mesActual
}) => {
    const { coloresTurno } = useStoreTurno();
    const { user } = useAuth();
    const tipoUser = user.user.tipo_user.toLowerCase();
    const [horasTotales, setHorasTotales] = useState({});

    const idTurno = useMemo(() => {
        const buscar = clave => tiposDeTurno.find(t => t.clave_turno === clave)?.id_turno_tipo;
        return {
            GD: buscar('GD'),
            GDD: buscar('GDD'),
            M: buscar('M'),
            MT: buscar('MT'),
            L: buscar('L'),
        };
    }, [tiposDeTurno]);

    const calcularHorasTurno = (turnoId) => {
        if (turnoId === idTurno.L) return 0;
        if (turnoId === idTurno.GDD) return 12;
        return (turnoId === idTurno.GD || turnoId === idTurno.MT) ? 12 : 6;
    };

    const validarTurno = (personal, fecha, nuevoTurno) => {
        const esNombrado = personal.condicion?.toLowerCase() === 'nombrado';

        if ((nuevoTurno === idTurno.GD || nuevoTurno === idTurno.GDD) && !esNombrado) {
            alert('Solo el personal NOMBRADO puede tener turno GD o GDD');
            return false;
        }

        const formatoFecha = date => date.toDateString();
        const keyTurno = (id, date) => `${id}_${formatoFecha(date)}`;

        const fechaAnterior = new Date(fecha);
        fechaAnterior.setDate(fechaAnterior.getDate() - 1);

        const fechaSiguiente = new Date(fecha);
        fechaSiguiente.setDate(fechaSiguiente.getDate() + 1);

        const turnoAnterior = turnos[keyTurno(personal.id_personal, fechaAnterior)];
        const turnoSiguiente = turnos[keyTurno(personal.id_personal, fechaSiguiente)];

        if ((turnoAnterior === idTurno.GD || turnoAnterior === idTurno.GDD) &&
            (nuevoTurno === idTurno.GD || nuevoTurno === idTurno.M)) {
            alert('No se puede asignar turno GD o M después de una Guardia Diurna');
            return false;
        }

        if ((nuevoTurno === idTurno.GD || nuevoTurno === idTurno.GDD) &&
            (turnoSiguiente === idTurno.GD || turnoSiguiente === idTurno.M)) {
            alert('No se pueden asignar Guardias Diurnas en días consecutivos');
            return false;
        }

        return true;
    };

    useEffect(() => {
        const nuevoHorasTotales = {};

        const fechasBloqueadas = new Set(columnasBloqueadas.map(f => new Date(f).toDateString()));

        activosFiltrados.forEach(personal => {
            let total = 0;
            const fechasSumadas = new Set();

            Object.entries(turnos).forEach(([key, turnoId]) => {
                const [personalId, fechaStr] = key.split('_');
                const fecha = new Date(fechaStr);

                if (
                    parseInt(personalId) === personal.id_personal &&
                    fecha.getMonth() === mesActual.getMonth() &&
                    fecha.getFullYear() === mesActual.getFullYear()
                ) {
                    const fechaKey = fecha.toDateString();

                    if (fechasBloqueadas.has(fechaKey)) {
                        if (!fechasSumadas.has(fechaKey)) {
                            total += 6;
                            fechasSumadas.add(fechaKey);
                        }
                    } else {
                        total += calcularHorasTurno(turnoId);
                    }
                }
            });

            nuevoHorasTotales[personal.id_personal] = total;
        });

        setHorasTotales(nuevoHorasTotales);
    }, [turnos, activosFiltrados, columnasBloqueadas, mesActual, idTurno]);

    const esResponsable = tipoUser === 'responsable';
    const hoy = useMemo(() => {
        const d = new Date();
        d.setHours(0, 0, 0, 0);
        return d;
    }, []);

    return (
        <tbody>
            {activosFiltrados.map((personal, index) => (
                <tr key={personal.id_personal}>
                    <td className='index'>{index + 1}</td>
                    <td className="names" onClick={(e) => { e.stopPropagation(); manejarClickPersonal(personal, e); }}>
                        {`${personal.paterno} ${personal.materno}, ${personal.nombres}`}
                    </td>
                    {fechasDelMes.map((fecha, fechaIndex) => {
                        const fechaKey = `${personal.id_personal}_${fecha.toDateString()}`;
                        const turnoAsignado = turnos[fechaKey] || "";
                        const claveTurno = obtenerClaveTurno(turnoAsignado);
                        const esDomingo = fecha.getDay() === 0;
                        const esBloqueada = columnasBloqueadas.includes(fecha.toDateString());

                        return (
                            <td
                                key={fechaIndex}
                                className={`claves ${esBloqueada ? 'bloqueada' : ''} ${esDomingo ? 'domingo' : ''}`.trim()}
                            >
                                {!esDomingo && (
                                    !esResponsable ? (
                                        <select
                                            value={turnoAsignado}
                                            onChange={(e) => {
                                                const nuevoTurno = parseInt(e.target.value);
                                                if (validarTurno(personal, fecha, nuevoTurno)) {
                                                    manejarGuardarTurno(personal.id_personal, fecha, nuevoTurno);
                                                }
                                            }}
                                            style={{
                                                backgroundColor: coloresTurno[claveTurno] || ''
                                            }}
                                        >
                                            <option value=""></option>
                                            {tiposDeTurno
                                                .filter(turno => !esBloqueada || ['M', 'T'].includes(turno.clave_turno))
                                                .map(turno => (
                                                    <option key={turno.id_turno_tipo} value={turno.id_turno_tipo}>
                                                        {turno.clave_turno}
                                                    </option>
                                                ))
                                            }
                                        </select>
                                    ) : (
                                        <p style={{ backgroundColor: coloresTurno[claveTurno] || '' }}>
                                            {
                                                tiposDeTurno.find(t => t.id_turno_tipo === turnoAsignado)?.clave_turno || ""
                                            }
                                        </p>
                                    )
                                )}
                            </td>
                        );
                    })}
                    <td className='hrs'>{horasTotales[personal.id_personal] || 0}</td>
                </tr>
            ))}
        </tbody>
    );
};

const TablaCompleta = (props) => (
    <>
        <CuerpoTabla {...props} />
        <ReporteTurnos
            activosFiltrados={props.activosFiltrados}
            turnos={props.turnos}
            tiposDeTurno={props.tiposDeTurno}
            mesActual={props.mesActual}
        />
    </>
);

export default CuerpoTabla;
