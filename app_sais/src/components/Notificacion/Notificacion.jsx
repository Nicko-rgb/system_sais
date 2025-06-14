import React, { useState, useEffect } from 'react'
import './notificacion.css'
import { IoNotifications } from "react-icons/io5";
import { useAuth } from '../../context/AuthContext';
import Store from '../../utils/storeCitaTurno';
import StoreMap from '../MapsSector/StoreMap';
import { IoMdClose } from "react-icons/io";

const Notificacion = ({ close, notificaciones, marcarComoLeido}) => {
    

    return (
        <div className='notificacion' onClick={(e) => e.stopPropagation()} >
            <h2><IoNotifications /> Notificaciones <IoNotifications /> <IoMdClose onClick={close} className='ico-close' /></h2>
            {notificaciones.length === 0 ? (
                <p style={{ textAlign: 'center', color: '#666' }}>No hay notificaciones pendientes</p>
            ) : (
                notificaciones.map((notif, index) => (
                    <div 
                        key={index} 
                        className="card" 
                        onClick={() => marcarComoLeido(index)}
                        style={{ cursor: 'pointer' }}
                    >
                        <div className="titulo">
                            <h5>{notif.titulo}</h5>
                            <span className="estado" style={{ 
                                backgroundColor: notif.leido ? '#ccc' : 'dodgerblue',
                                boxShadow: notif.leido ? 'none' : '0 0 5px dodgerblue'
                            }}></span>
                        </div>
                        <p>{notif.descripcion}</p>
                        <small style={{ 
                            color: '#666', 
                            fontSize: '0.75rem',
                            // fontStyle: 'italic',
                            textAlign: 'right',
                            fontWeight: 'bold'
                        }}>
                            {new Date(notif.fecha).toLocaleDateString()}
                        </small>
                    </div>
                ))
            )}
        </div>
    )
}

export default Notificacion
