import React, { useState, useEffect } from 'react'
import './panelcita.css'
import { useNavigate } from 'react-router-dom';
import Tabla from '../../components/Tabla/Tabla'
import { MdPersonSearch, MdOutlineInfo } from 'react-icons/md';
import { column } from '../StoreDash'

import axios from 'axios';
import InfoCita from '../../components/Citas/InfoCita';
import Store from '../../utils/storeCitaTurno';

const PanelCita = () => {

    const { especialidad } = Store()
    const [citas, setCitas] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const limit = 15;
    const navigate = useNavigate();
    const [selectedCita, setSelectedCita] = useState(null);
    const [showModal, setShowModal] = useState(false);

    const fActual = new Date()

    const obtenerCitas = async (search = '', pageNumber = 1) => {
        const API_URL = import.meta.env.VITE_API_URL;
        try {
            const response = await axios.get(`${API_URL}/api/obtener-citas-3`, {
                params: { searchTerm: search, page: pageNumber, limit }
            });
            setCitas(response.data.data);
            setTotal(response.data.total);
            setLoading(false);
        } catch (error) {
            console.error('Error al obtener pacientes:', error);
            setLoading(false);
        }
    };

    useEffect(() => {
        obtenerCitas();
    }, []);

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
        setPage(1);
        obtenerCitas(e.target.value, 1);
    };

    const totalPages = Math.ceil(total / limit);

    const goNextPage = () => {
        if (page < totalPages) setPage(prev => prev + 1);
    };

    const goPrevPage = () => {
        if (page > 1) setPage(prev => prev - 1);
    };

    const handleCita = (especialidad) => {
        navigate(`/cita-niño/${especialidad.especialidad.toLowerCase()}`, { state: { especialidad } });
    };

    const handleRowClick = (cita) => {
        setSelectedCita(cita);
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setSelectedCita(null);
    };

    return (
        <div className='panel-cita'>
            <h3 className="title-view">ESPECIALIDADES DISPONIBLES PARA CITAS</h3>
            <div className="contenedor-opciones">
                {especialidad
                    .filter(opcion => opcion.estado) // Solo especialidades activas
                    .map((opcion, index) => (
                        <div onClick={() => handleCita(opcion)} key={index} className="opcion">
                            {opcion.icono && (
                                <img
                                    src={opcion.icono}
                                    alt={opcion.ico_name || 'Especialidad'}
                                />
                            )}
                            <p>{opcion.especialidad}</p>
                        </div>
                    ))}

            </div>
            <h4 className='cercaTxt'>CITAS PENDIENTES CERCANAS - {new Date(fActual).toLocaleDateString()} </h4>
            <div className="search">
                <input
                    type="text"
                    placeholder='Buscar por nombres o dni...'
                    value={searchTerm}
                    onChange={handleSearch}
                />
                <MdPersonSearch className='ico1' />
                <div>
                    <MdOutlineInfo className='ico2' />
                    <p className="etiqueta">Lista de citas cercanas a 3 días</p>
                </div>
            </div>
            <div className="tbl-container">
                <Tabla
                    column={column}
                    data={citas}
                    loading={loading}
                    pagina={{
                        page,
                        totalPages,
                        goNextPage,
                        goPrevPage,
                        limit
                    }}
                    onRowClick={handleRowClick}
                />
                {showModal && <InfoCita cita={selectedCita} onClose={handleCloseModal} />}
            </div>
        </div>
    )
}

export default PanelCita