import React, { useState, useEffect } from 'react';
import './notas.css';
import { TbPencilPlus } from "react-icons/tb";
import { GoInfo } from "react-icons/go";
import { RiDeleteBin6Line } from "react-icons/ri";
import { CgNotes } from "react-icons/cg";
import axios from 'axios';
import { formatearFechaConSlash } from '../../utils/dateUtils'
import { toast } from 'react-toastify';
import StoreMap from './StoreMap';
import { useAuth } from '../../context/AuthContext';

const Notas = ({ manzana }) => {
    const [openForm, setOpenForm] = useState(false);
    const apiUrl = import.meta.env.VITE_API_URL;
    const [fechaRecordar, setFechaRecordar] = useState('');
    const [nota, setNota] = useState('');
    const { notas, getNotas, cargando } = StoreMap();
    const {user} = useAuth()

    useEffect(() => {
        getNotas();
    }, []);

    // Filtrar notas por manzana actual
    const notasFiltradas = notas.filter(
        (n) =>
            n.id_manzana === manzana.id &&
            n.manzana === manzana.mz
    );

    // Manejar el envío del formulario
    const handleSubmit = async (e) => {
        e.preventDefault();
        toast.info('Guardando...');
        const datos = {
            id_manzana: manzana.id,
            codigo: manzana.text.split('\n')[0],
            manzana: manzana.mz,
            nota,
            fechaRecordar,
        };

        try {
            const response = await axios.post(`${apiUrl}/api/map/registrar-nota-manzana`, datos);
            setOpenForm(!openForm);
            setNota('');
            setFechaRecordar('');
            getNotas();
            toast.success(response.data.message);
        } catch (error) {
            toast.error('Error al registrar la nota.');
            console.error('Error al registrar la nota:', error);
        }
    };

    // Funcion para borrar nota de manzana 
    const handleDelete = async (idNota) => {
        try {
            const response = await axios.delete(`${apiUrl}/api/map/eliminar-nota-manzana/${idNota}`);
            getNotas();
            toast.success(response.data.message);
        } catch (error) {
            console.error('Error al eliminar la nota:', error);
            toast.error('Error al eliminar la nota.');
        }
    };

    // Cancelar la operación y limpiar el formulario
    const handleCancel = () => {
        setOpenForm(false);
        setNota('');
        setFechaRecordar('');
    };

    return (
        <div className="notas">
            <h3>Notas de Manzana</h3>
            {cargando ? (
                <p className="nota-info"><GoInfo /> Cargando notas...</p>
            ) : (
                notasFiltradas.length === 0 ? (
                    <p className="nota-info"><GoInfo /> No hay notas para esta manzana</p>
                ) : (
                    <div className='boxs'>
                        {notasFiltradas.map((n) => (
                            <div key={n.id_notas_manzana} className='box'>
                                <CgNotes className='ico' />
                                {user.user.tipo_user.toLowerCase() !== 'responsable' && 
                                    <RiDeleteBin6Line onClick={() => handleDelete(n.id_notas_manzana)} className='delete' title='Eliminar' />
                                }
                                <p className="nota-text">{n.nota}</p>
                                <p className="fecha">
                                    {n.fecha_recordatorio ? formatearFechaConSlash(n.fecha_recordatorio) : '---'}
                                </p>
                            </div>
                        ))}
                    </div>
                )
            )}

            {!openForm && user.user.tipo_user.toLowerCase() !== 'responsable' && (
                <button className="btn-nota" onClick={() => setOpenForm(!openForm)}>
                    <TbPencilPlus /> Agregar Nota
                </button>
            )}
            <form onSubmit={handleSubmit} className={`${openForm ? 'open' : ''}`}>
                <textarea
                    value={nota}
                    onChange={(e) => setNota(e.target.value)}
                    placeholder="Escribe una nota para esta manzana..."
                    required
                />
                <label>
                    Fecha de Recordatorio
                    <input
                        type="date"
                        value={fechaRecordar}
                        onChange={(e) => setFechaRecordar(e.target.value)}
                    />
                </label>
                <div className="btns">
                    <button type="button" onClick={handleCancel} className="btn-cancela">Cancelar</button>
                    <button type="submit" className="btn-submit">Guardar</button>
                </div>
            </form>
        </div>
    );
};

export default Notas;
