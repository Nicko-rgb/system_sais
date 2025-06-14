import React from 'react';
import './turno.css'

const InfoTurno = ({ personals, cerrarModal }) => {
    if (!personals) return null;

    return (
        <div className='content-info' onClick={(e) => e.stopPropagation()}>
            <div className="flecha"></div>
            <h3 className='title-page'>Datos del Personal</h3>
            <div className="datos">
                <div>
                    <p><b>DNI:</b> {personals.dni}</p>
                    <p><b>Nombre:</b> {personals.nombres}</p>
                    <p><b>Apellido:</b> {personals.paterno} {personals.materno}</p>
                    <p style={{textTransform: 'none'}} id='email'><b>Email:</b>{personals.correo} </p>
                    <p><b>Telefono:</b>{personals.celular} </p>
                    <p><b>ROL DE USUARIO:</b> {personals.tipo_user}</p>
                    <p><b>Estado:</b>{personals.estado} </p>
                </div>
                <div>
                    <p><b>PROFESION:</b> {personals.profesion}</p>
                    <p><b>SERVICIO:</b> {personals.servicio}</p>
                    <p><b>CONDICON:</b> {personals.condicion}</p>
                    <p><b>TIPO DE USUARIO:</b> {personals.tipo_personal}</p>
                    <p><b>Program Cita: </b>{personals.especial_cita ? personals.especial_cita : '---'} </p>
                    {personals.especial_cita && <p><b>Consultorio: </b> {personals.num_consultorio} </p> }
                </div>
            </div>
            <div className="btns">
                <button className='btn-save' onClick={cerrarModal}>ACEPTAR</button>
            </div>
        </div>
    );
};

export default InfoTurno;
