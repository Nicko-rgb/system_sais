import React from 'react'
import { useAuth } from '../../context/AuthContext'
import './Perfil.css'
import { formatearFechaConSlash, formatearFechaConGuion } from '../../utils/dateUtils'

const Perfil = () => {
    const { user } = useAuth()
    const datos = user.user

    const handleOpenDoc = () => {
        window.open(`${import.meta.env.VITE_API_URL}/api/user-get-documento/${datos.id}`, '_blank');
    }

    return (
        <div className="perfil-container">
            <div className="perfil-card">
                <div className="perfil-header">
                    <div className="perfil-icon">👤</div>
                    <h2>Perfil del Usuario</h2>
                    <p>Sistema de Salud</p>
                </div>
                <div className="perfil-info">
                    <div className="perfil-row">
                        <p><strong>ID:</strong> {datos.id}</p>
                        <p><strong>DNI:</strong> {datos.dni}</p>
                    </div>
                    <div className="perfil-row">
                        <p><strong>Nombre:</strong> {datos.nombres}</p>
                        <p><strong>Apellidos:</strong> {datos.apellidos || `${datos.paterno} ${datos.materno}`}</p>
                    </div>
                    <div className="perfil-row">
                        <p style={{textTransform: 'none'}} ><strong>Correo:</strong> {datos.correo}</p>
                        <p><strong>Celular:</strong> {datos.celular}</p>
                    </div>
                    <div className="perfil-row">
                        <p><strong>Profesión:</strong> {datos.profesion}</p>
                        <p><strong>Servicio:</strong> {datos.servicio}</p>
                    </div>
                    <div className="perfil-row">
                        <p><strong>Consultorio Cita:</strong> {datos.consultorio || 'No asignada'}</p>
                        <p><strong>Num Consultorio:</strong> {datos.num_consultorio || '-'}</p>
                    </div>
                    <div className="perfil-row">
                        <p><strong>Condición:</strong> {datos.condicion || '-'}</p>
                        <p><strong>Rol de Usuario:</strong> {datos.tipo_user}</p>
                    </div>
                    {/* <div className="perfil-row">

                    </div> */}
                    <div className="perfil-row">
                        <p><strong>Tipo de Usuario:</strong> {datos.tipo_personal}</p>
                        <p><strong>Fecha de Registro:</strong> {formatearFechaConGuion(datos.fecha_registro)}</p>
                    </div>
                    <div className="perfil-row">
                        <p><strong>Documento:</strong> <a style={{textDecoration: 'underline'}} onClick={handleOpenDoc}> {datos.doc_name} </a>  </p>
                        <p><strong>Estado:</strong> {datos.estado}</p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Perfil
