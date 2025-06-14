import React from 'react';
import useStoreTurno from './StoreTurno';
import { IoClose } from "react-icons/io5";

const ReporteTurnos = ({ activosFiltrados, turnos, tiposDeTurno, mesActual, columnasBloqueadas, onClose }) => {
    const GDTurnos = [
        tiposDeTurno.find(t => t.clave_turno === 'GD')?.id_turno_tipo,
        tiposDeTurno.find(t => t.clave_turno === 'GDD')?.id_turno_tipo
    ];
    const MT = tiposDeTurno.find(t => t.clave_turno === 'MT')?.id_turno_tipo;
    const L = tiposDeTurno.find(t => t.clave_turno === 'L')?.id_turno_tipo;

    const contarColumsBlock = true

    const calcularHorasTurno = (turnoId, fechaTurnoStr) => {
        const esBloqueado = columnasBloqueadas.includes(fechaTurnoStr);
        if (esBloqueado) return 6;

        if (GDTurnos.includes(turnoId) || turnoId === MT) return 12;
        if (turnoId === L) return 0;
        return 6;
    };

    // contar las columnas bloqueadas que estan vacias tambien como 6 horas si "contarColumsBlock" es true
    const calcularEstadisticasPersonal = (personal) => {
        let totalHoras = 0;
        let turnosGD = 0;
        let turnosL = 0;
        let turnosM = 0;
        let totalTurnos = 0;

        const fechasContadas = new Set();

        Object.entries(turnos).forEach(([key, turnoId]) => {
            const [personalId, fechaStr] = key.split('_');
            const fechaObj = new Date(fechaStr);

            if (
                personalId === personal.id_personal.toString() &&
                fechaObj.getMonth() === mesActual.getMonth() &&
                fechaObj.getFullYear() === mesActual.getFullYear()
            ) {
                const turnoTipo = tiposDeTurno.find(t => t.id_turno_tipo === turnoId);
                const fechaString = fechaObj.toDateString();

                // Prevenir doble conteo
                if (fechasContadas.has(fechaString)) return;
                fechasContadas.add(fechaString);

                const esBloqueado = columnasBloqueadas.includes(fechaString);
                const esGD = GDTurnos.includes(turnoId);

                // Calcular horas solo si hay un turno asignado
                if (turnoTipo) {
                    totalHoras += calcularHorasTurno(turnoId, fechaString);

                    if (esGD) {
                        if (esBloqueado) {
                            // En bloqueado cuenta como Mañana si tiene turno asignado
                            turnosM++;
                            totalTurnos++;
                        } else {
                            turnosGD++;
                            totalTurnos++;
                        }
                    } else if (turnoTipo.clave_turno === 'M') {
                        turnosM++;
                        totalTurnos++;
                    } else if (turnoTipo.clave_turno === 'L') {
                        turnosL++;
                    } else {
                        // Contar cualquier otro tipo de turno que no sea L
                        totalTurnos++;
                    }
                }
            }
        });


        return {
            totalHoras,
            turnosGD,
            turnosL,
            turnosM,
            totalTurnos,
            faltanLibres: turnosGD > turnosL ? turnosGD - turnosL : 0
        };
    };

    return (
        <div className="reporte-turnos" onClick={onClose}>
            <aside onClick={(e) => e.stopPropagation()} >
                <h3>Reporte de Turnos y Horas  </h3>
                <IoClose onClick={onClose} strokeWidth={2} className='close-ico' />
                {activosFiltrados.length > 0 ? (
                    <table>
                    <thead>
                        <tr>
                            <th>Personal</th>
                            <th>Condición</th>
                            <th>Total Horas</th>
                            {tiposDeTurno.map((tipo, index) => (
                                <th key={index}>{tipo.clave_turno}</th>
                            ))}
                            <th>Total Turnos</th>
                            <th>Estado</th>

                        </tr>
                    </thead>
                    <tbody>
                        {activosFiltrados.map(personal => {
                            const stats = calcularEstadisticasPersonal(personal);
                            const esNombrado = personal.condicion === 'Nombrado';
                            const cumpleHoras = stats.totalHoras === 150;
                            const cumpleReglas = esNombrado
                            ? (
                                // stats.turnosGD === 10 && 
                                // stats.turnosM === 5 && 
                                stats.turnosL >= stats.turnosGD
                            )
                            : stats.totalTurnos === 25;
                            
                            return (
                                <tr key={personal.id_personal}>
                                    <td className='name' >{`${personal.paterno} ${personal.materno}, ${personal.nombres}`}</td>
                                    <td>{personal.condicion}</td>
                                    <td id='num' className={stats.totalHoras > 150 ? 'exceso' : stats.totalHoras < 150 ? 'falta' : 'ok'}>
                                        {stats.totalHoras}
                                    </td>
                                    {tiposDeTurno.map((tipo) => {
                                        let conteoTurno = 0;
                                        Object.entries(turnos).forEach(([key, turnoId]) => {
                                            const [personalId, fechaStr] = key.split('_');
                                            const fechaObj = new Date(fechaStr);
                                            if (
                                                personalId === personal.id_personal.toString() &&
                                                fechaObj.getMonth() === mesActual.getMonth() &&
                                                fechaObj.getFullYear() === mesActual.getFullYear() &&
                                                turnoId === tipo.id_turno_tipo
                                            ) {
                                                conteoTurno++;
                                            }
                                        });
                                        return (
                                            <td key={tipo.id_turno_tipo} id='num' className={tipo.clave_turno === 'L' && stats.faltanLibres > 0 ? 'falta' : ''}>
                                                {conteoTurno}
                                            </td>
                                        );
                                    })}
                                    <td id='num' >{stats.totalTurnos}</td>
                                    <td className={cumpleHoras && cumpleReglas ? 'ok' : 'falta'}>
                                        {cumpleHoras && cumpleReglas ? 'Completo' : 'Pendiente'}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
                ) : (
                    <p>No hay datos.</p>
                )}
            </aside>
        </div>
    );
};

export default ReporteTurnos;