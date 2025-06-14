import React from 'react';
import './info_cita.css';
import { IoMdClose } from 'react-icons/io';

const InfoCita = ({ cita, onClose }) => {
    if (!cita) return null;

    return (
        <div className="info-cita" onClick={onClose}>
            <div className="modal-info" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Información de la Cita</h2>
                    <button className="close-button" onClick={onClose}>
                        <IoMdClose />
                    </button>
                </div>
                <div className="content-info-cita">
                    <div className="group">
                        <label className='info-label'>DNI:
                            <span className='info-value'>{cita.dni} </span>
                        </label>
                        <label className='info-label'>Fecha de Cita:
                            <span className='info-value'>{new Date(cita.fecha).toLocaleDateString()}</span>
                        </label>
                        <label className='info-label'>Hora Cita:
                            <span className='info-value'>{cita.hora}</span>
                        </label>
                    </div>
                    <div className="group">
                        <label className='info-label'>Nombres:
                            <span className='info-value'>{cita.nombres}, {cita.ape_paterno} {cita.ape_materno}</span>
                        </label>
                    </div>
                    <div className="group">
                        <label className='info-label'>F. Nacimiento:
                            <span className='info-value'>{new Date(cita.fecha_nacimiento).toLocaleDateString()}</span>
                        </label>
                        <label className='info-label'>Edad:
                            <span className='info-value'>{cita.edad} años</span>
                        </label>
                        {cita.telefono && (
                            <label className='info-label'>Teléfono:
                                <span className='info-value'>{cita.telefono}</span>
                            </label>
                        )}
                    </div>
                    <div className="group">
                        <label className='info-label'>Especialidad:
                            <span className='info-value'>{cita.especialidad}</span>
                        </label>
                        <label className='info-label'>Consultorio:
                            <span className='info-value'>{cita.consultorio}</span>
                        </label>
                    </div>
                    {cita.direccion_c && (
                        <div className="group">
                            <label className='info-label'>Dirección:
                                <span className='info-value'>{cita.direccion_c}</span>
                            </label>
                        </div>
                    )}
                    {cita.semEmbarazo && (
                        <div className="group">
                            <label className='info-label'>Semana de Embarazo:
                                <span className='info-value'>{cita.semEmbarazo}</span>
                            </label>
                            {cita.metodo && (
                                <label className='info-label'>Método de Planificación:
                                    <span className='info-value'>{cita.metodo}</span>
                                </label>
                            )}
                        </div>
                    )}
                    <div className="group">
                        <label className='info-label'>Motivo de Consulta:
                            <span className='info-value motivo' style={{ textTransform: 'none', fontWeight: 500 }}>{cita.motivoConsulta}</span>
                        </label>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InfoCita;