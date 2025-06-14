import React, { useState, useEffect } from 'react';
import './admision.css';
import { useNavigate } from 'react-router-dom';
import { LuUserRoundSearch } from "react-icons/lu";
import { IoClose } from "react-icons/io5";
import { CgNotes } from "react-icons/cg";
import Tabla from '../../components/Tabla/Tabla';
// import Swal from 'sweetalert2';
import { toast } from 'react-toastify';
import axios from 'axios';
import RegPaciente from '../../components/Formularios/RegPaciente'
import { usePacienteStore } from '../../components/Paciente/StorePaciente';
// import ExportData from './ExportData';
import Pacientes from '../../components/Admision/Graficos/Pacientes';
import Citas from '../../components/Admision/Graficos/Citas';
import GeneroPas from '../../components/Admision/Graficos/GeneroPas';
import TipoPas from '../../components/Admision/Graficos/TipoPas';
import { generatePatientPDF } from '../../utils/pdfGenerator';

import { useConfig } from '../../context/ConfigContext';

const Admision = ({ formActive, setFormActive, setFichaView, setPacienteData }) => {
    const { dniHistoriaValue } = useConfig();
    const { paciente, fetchPaciente, loading, setLoading } = usePacienteStore()
    const [pacientes, setPacientes] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const limit = 15;
    const navigate = useNavigate();
    const API_URL = import.meta.env.VITE_API_URL;

    const obtenerPacientes = async (search = '', pageNumber = 1) => {
        setLoading(true);
        try {
            const response = await axios.get(`${API_URL}/api/obtener-pacientes`, {
                params: { searchTerm: search, page: pageNumber, limit }
            });
            setPacientes(response.data.data);
            setTotal(response.data.total);
            setLoading(false);
        } catch (error) {
            console.error('Error al obtener pacientes:', error);
            setLoading(false);
        }
    };

    useEffect(() => {
        obtenerPacientes(searchTerm, page);
    }, [formActive, page]);

    // Definir columnas base
    let columnas = [
        { label: 'DNI', field: 'dni' },
        { label: 'Hist Clínico', field: 'hist_clinico' },
        { label: 'Cod Ficha', field: 'codigo_ficha' },
        {
            label: 'Nombres',
            field: 'nombres',
            render: (item) => `${item.nombres} ${item.ape_paterno} ${item.ape_materno}`
        },
        { label: 'Sexo', field: 'sexo' },
        { label: 'Edad', field: 'edad' },
        { label: 'Tipo', field: 'tipo_paciente' },
    ];

    // Si está activa la opción "dni_historia", modificar columnas dinámicamente
    if (dniHistoriaValue) {
        columnas = columnas
            .filter(col => col.field !== 'dni') // eliminar columna DNI
            .map(col => {
                // reemplazar el valor de hist_clinico por el DNI
                if (col.field === 'hist_clinico') {
                    return {
                        ...col,
                        render: (item) => item.dni
                    };
                }
                return col;
            });
    }

    const handleViewData = (item) => {
        const name = item.nombres.toUpperCase();
        if (item.id_ficha) {
            toast.success(`Ver ficha de ${name}`);
            navigate(`/ficha/${item.codigo_ficha}`);
            return;
        } else {
            setPacienteData(item)
            setFichaView(true)
            toast.success(`Añadir a Nueva Ficha a ${name}`)
        }
    }

    const handleDownloadData = async (item) => {
        try {
            toast.loading('Generando PDF...', { toastId: 'pdf-loading' });

            // Obtener los datos completos del paciente
            const response = await axios.get(`${API_URL}/api/obtener-paciente-historia/${item.hist_clinico}`);
            const pacienteCompleto = response.data;

            // Generar y descargar el PDF
            generatePatientPDF(pacienteCompleto);

            toast.dismiss('pdf-loading');
            toast.success('PDF descargado exitosamente', { icon: '📄' });
        } catch (error) {
            console.error('Error al generar PDF:', error);
            toast.dismiss('pdf-loading');
            toast.error('Error al generar el PDF');
        }
    }

    const handleSearch = (e) => {
        const value = e.target.value;
        setSearchTerm(value);
        setPage(1);
        obtenerPacientes(value, 1);
    };

    const totalPages = Math.ceil(total / limit);

    const goNextPage = () => {
        if (page < totalPages) setPage(prev => prev + 1);
    };

    const goPrevPage = () => {
        if (page > 1) setPage(prev => prev - 1);
    };

    return (
        formActive ? (
            <RegPaciente closeForm={setFormActive} />
        ) : (
            <div className='admision'>
                <h3 className='title-view'>ADMISIÓN SAIS</h3>
                <header>
                    <div className="search">
                        <input
                            type="text"
                            placeholder='Buscar por dni, historial clínico, código de ficha o nombres'
                            value={searchTerm}
                            onChange={handleSearch}
                        />
                        {searchTerm && <IoClose className='ico-cls' onClick={() => setSearchTerm('')} />}
                        <LuUserRoundSearch className='ico-search' />
                    </div>
                    {/* <button>Exportar</button> */}
                    <button className='regis' onClick={() => setFormActive(true)}>Registrar <CgNotes /></button>
                </header>
                <div>
                    <h3>Pacientes Registrados - <span>{pacientes.length} </span> </h3>
                    <Tabla
                        column={columnas}
                        data={pacientes}
                        loading={loading}
                        accion1={handleViewData}
                        txt1='Nueva Ficha'
                        accion2={handleDownloadData}
                        txt2='-'
                        pagina={{
                            page,
                            totalPages,
                            goNextPage,
                            goPrevPage,
                            limit
                        }}
                    />
                </div>
                <hr style={{ marginTop: '100px' }} />
                <h3 className='title-view' style={{ maxWidth: '1300px' }} >Estadísticas</h3>
                <section className='estadisticas'>
                    <Pacientes />
                    <Citas />
                    <GeneroPas />
                    <TipoPas />
                </section>
            </div>
        )
    );
}

export default Admision;