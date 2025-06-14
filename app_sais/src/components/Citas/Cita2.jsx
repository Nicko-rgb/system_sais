import React from 'react';
import '../../styles/citas.css';
import CuerpoTabla from './CuerpoTabla';

const Citas2 = ({ especialidad, fecha, fechaT, horarios,  consultorio }) => {
    const formatTime = (timeString) => {
        if (!timeString) return '---';

        const parts = timeString.split(':');
        if (parts.length < 2) return '---';

        const hours = parts[0].padStart(2, '0');
        const minutes = parts[1].padStart(2, '0');

        return `${hours}:${minutes}`;
    };

    return (
        <div className="container-tb">
            <div className="header-tab">
                <p className="txt_header">CONSULTORIO N° { consultorio}</p>
                <p className='txt_header'>{fechaT} </p>
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
                        formatTime={formatTime}
                        fecha={fecha}
                        consultorio={ consultorio}
                    />
            </table>
        </div>
    );
};

export default Citas2;  