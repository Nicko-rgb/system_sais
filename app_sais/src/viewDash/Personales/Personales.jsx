import React, { useEffect, useState } from 'react'
import './personales.css'
import Tabla from '../../components/Tabla/Tabla'
import { MdPersonSearch } from "react-icons/md";
import { MdFactCheck } from "react-icons/md";
import { IoMapSharp } from "react-icons/io5";
import { TiFilter } from "react-icons/ti";
import axios from 'axios';
import { CgNotes } from "react-icons/cg";
import { Link } from 'react-router-dom';
import RegPersonal from '../../components/Formularios/RegPersonal'
import EditPersonal from './EditPersonal';
import InfoPersonal from './InfoPersonal';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';

const Personales = ({ openForm, setOpenForm }) => {
    const [personal, setPersonal] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [totalData, setTotalData] = useState(0);
    const limit = 15;
    const API_URL = import.meta.env.VITE_API_URL;
    const { user } = useAuth();

    const handleFiltroClick = (estado) => {
        setFiltroEstado(estado);
        setPage(1);
        obtenerPersonal(searchTerm, 1);
    };
    const columns = [
        { label: 'DNI', field: 'dni' },
        { label: 'Apellidos y Nombre', field: 'nombres', render: (item) => `${item.nombres} ${item.paterno} ${item.materno}` },
        { label: 'Rol', field: 'tipo_user' },
        { label: 'Profesión', field: 'profesion' },
        { label: 'Servicio', field: 'servicio' },
        { label: 'Consultorio', field: 'especial_cita', render: (item) => item.especial_cita ? `${item.especial_cita} - ${item.num_consultorio}` : '---' },
        { label: 'Condición', field: 'condicion' },
        { label: 'Celular', field: 'celular' },
    ]

    const [filtroEstado, setFiltroEstado] = useState('activo');
    const obtenerPersonal = async (search = '', pageNumber = 1) => {
        try {
            const response = await axios.get(`${API_URL}/api/obtener-personal-salud`, {
                params: {
                    searchTerm: search,
                    page: pageNumber,
                    limit,
                    estado: filtroEstado !== 'todos' ? filtroEstado : undefined
                }
            });
            setPersonal(response.data.data);
            setTotalData(response.data.total);
            setLoading(false);
        } catch (error) {
            console.error('Error al obtener personal:', error);
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        const value = e.target.value;
        setSearchTerm(value);
        setPage(1); // siempre que busques, vuelve a página 1
        obtenerPersonal(value, 1);
    };

    const totalPages = Math.ceil(totalData / limit);

    const goNextPage = () => {
        if (page < totalPages) setPage(prev => prev + 1);
    };

    const goPrevPage = () => {
        if (page > 1) setPage(prev => prev - 1);
    };

    const [edit, setEdit] = useState(false);
    const [selectedRow, setSelectedRow] = useState(null);

    const handleViewEdit = (select) => {
        setEdit(true);
        setSelectedRow(select);
    };

    const handleCloseEdit = () => {
        setEdit(false);
        setSelectedRow(null);
        obtenerPersonal()
    };

    const [openInfo, setOpenInfo] = useState(false);

    const handleClikRow = (select) => {
        setSelectedRow(select);
        setEdit(false);
        setOpenInfo(true);
    };

    useEffect(() => {
        obtenerPersonal(searchTerm, page);
    }, [page, openForm, edit, openInfo, filtroEstado]);

    const handleActiveInactive = async (id_personal) => {
        try {
            const nuevoEstado = selectedRow.estado === 'activo' ? 'inactivo' : 'activo';
            const response = await axios.put(`${API_URL}/api/personal-salud/${id_personal}/estado`, {
                estado: nuevoEstado
            });
            
            if (response.data) {
                obtenerPersonal(searchTerm, page);
                toast.success('Estado actualizado correctamente');
            }
        } catch (error) {
            toast.error('Error al actualizar el estado');
            console.error('Error al actualizar el estado:', error);
        }
    }

    return (
        <div className='personal'>
            {!openForm && !edit && !openInfo ? (
                <>
                    <h3 className='title-view'>PERSONALES DE SALUD</h3>
                    <header>
                        <div className="search">
                            <input
                                type="text"
                                placeholder="Buscar personal de salud..."
                                value={searchTerm}
                                onChange={handleSearch}
                            />
                            <MdPersonSearch />
                        </div>
                        <Link className='btnH-per' to='/turnos-sais'  >Ver Turnos<MdFactCheck /></Link>
                        <Link className='btnH-per' to='/maps-sais'  >Sectores<IoMapSharp /></Link>
                        <div className="filtro">
                            <button className='btnH-per' >Filtrar<TiFilter /></button>
                            <div className="opciones">
                                <p onClick={() => handleFiltroClick('todos')} className={filtroEstado === 'todos' ? 'active' : ''}>Ver Todos</p>
                                <p onClick={() => handleFiltroClick('activo')} className={filtroEstado === 'activo' ? 'active' : ''}>Activos</p>
                                <p onClick={() => handleFiltroClick('inactivo')} className={filtroEstado === 'inactivo' ? 'active' : ''}>Inactivos</p>
                            </div>
                        </div>

                        {user.user.tipo_user === 'Admin' && (
                            <button onClick={() => setOpenForm(true)} className='btn-registrar'>Registrar<CgNotes /></button>
                        )}
                    </header>
                    <section>
                    <div className='filtro'>Filtro: <span>{filtroEstado.charAt(0).toUpperCase() + filtroEstado.slice(1)} — Mostrando {personal.length} de {totalData}</span></div>

                        <Tabla
                            data={personal}
                            column={columns}
                            loading={loading}
                            pagina={{
                                page,
                                totalPages,
                                goNextPage,
                                goPrevPage,
                                limit,
                            }}
                            txt1={'Editar Datos'}
                            accion1={handleViewEdit}
                            onRowClick={handleClikRow}
                        />
                    </section>
                </>
            ) : edit ? (
                <EditPersonal
                    onClose={handleCloseEdit}
                    personData={selectedRow}
                />
            ) : openForm ? (
                <RegPersonal handleForm={() => setOpenForm(false)} />
            ) : (
                <InfoPersonal
                    onClose={() => setOpenInfo(false)}
                    personData={selectedRow}
                    handleActivated={handleActiveInactive}
                />
            )}
        </div>
    )
}

export default Personales
