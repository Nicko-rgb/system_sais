import React from 'react'
import Store from '../../../utils/storeCitaTurno'
import { IoCaretBackOutline } from "react-icons/io5";
import { MdOutlineCleaningServices } from "react-icons/md";
import Swal from 'sweetalert2';
import axios from 'axios';
import { toast } from 'react-toastify';
const API_URL = import.meta.env.VITE_API_URL;

const Otros = ({ onclose }) => {
    const { especialidad, fetchEspecialidad } = Store();

    const handleToggleEstado = async (e, opcion) => {
        e.stopPropagation();

        const nuevaAccion = opcion.estado ? 'desactivar' : 'activar';

        const result = await Swal.fire({
            title: '¿Estás seguro?',
            html: `¿Deseas <strong>${nuevaAccion}</strong> la especialidad <strong>${opcion.especialidad}</strong>?`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: `Sí, ${nuevaAccion}`,
            cancelButtonText: 'Cancelar'
        });

        if (result.isConfirmed) {
            const loadingToast = toast.loading(`${nuevaAccion === 'activar' ? 'Activando' : 'Desactivando'} especialidad...`);
            try {
                await axios.put(`${API_URL}/api/nino/estado-especialidad/${opcion.id_especi}`);
                toast.update(loadingToast, {
                    render: `Especialidad ${nuevaAccion} exitosamente`,
                    type: 'success',
                    isLoading: false,
                    autoClose: 2000
                });
                fetchEspecialidad();
            } catch (error) {
                console.error(`Error al ${nuevaAccion} la especialidad:`, error);
                toast.update(loadingToast, {
                    render: `Error al ${nuevaAccion} la especialidad`,
                    type: 'error',
                    isLoading: false,
                    autoClose: 2000
                });
            }
        }
    };

    const handleDeleteCitas = async (e, opcion) => {
        e.stopPropagation();

        const result = await Swal.fire({
            title: '¿Estás seguro?',
            html: `¿Deseas eliminar todas las citas pasadas de la especialidad <strong>${opcion.especialidad}</strong>?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        });

        if (result.isConfirmed) {
            const loadingToast = toast.loading('Eliminando citas pasadas...');
            try {
                await axios.delete(`${API_URL}/api/nino/eliminar-citas-pasadas/${opcion.especialidad}`);
                toast.update(loadingToast, {
                    render: 'Citas pasadas eliminadas exitosamente',
                    type: 'success',
                    isLoading: false,
                    autoClose: 2000
                });
                fetchEspecialidad();
            } catch (error) {
                console.error('Error al eliminar las citas pasadas:', error);
                toast.update(loadingToast, {
                    render: 'Error al eliminar las citas pasadas',
                    type: 'error',
                    isLoading: false,
                    autoClose: 2000
                });
            }
        }
    };

    return (
        <div className='view horario'>
            <div className="view-content">
                <h3>OTRAS CONFIGURACIONES PARA CITAS</h3>
                <p style={{textAlign: 'center', fontSize: '.9rem', color: 'gray'}}>Activa o inactiva las especialidades que se brindan en citas. Tambien puedes eliminar las citas pasadas (desde un día antes) para cada especialidad.</p>
                <div className='opcions other'>
                    {especialidad.map((opcion, index) => (
                        <div
                            key={index}
                            className={`opcion ${opcion.estado ? '' : 'inactive'}`}
                            onClick={() => handleToggleEstado(event, opcion)}
                            style={{ cursor: 'pointer' }}
                        >
                            {opcion.icono && (
                                <img
                                    src={opcion.icono}
                                    alt={opcion.ico_name || 'Especialidad'}
                                />
                            )}
                            <p>{opcion.especialidad}</p>
                            {/* <p className='estado-texto'>
                                {opcion.estado ? 'ACTIVA' : 'INACTIVA'}
                            </p> */}
                            {opcion.estado ?
                                <MdOutlineCleaningServices
                                    className='delete2'
                                    title='ELIMINAR CITAS PASADAS'
                                    onClick={(e) => handleDeleteCitas(e, opcion)}
                                    style={{ cursor: 'pointer' }}
                                />
                            : <></>}
                        </div>
                    ))}
                </div>
                <div className="leyend">
                    <p><p className='active' ></p> Activo</p>
                    <p><p className='inactive' ></p> Inactivo</p>
                </div>
                <button className='btn-volver' onClick={() => onclose()}>
                    <IoCaretBackOutline />VOLVER
                </button>
            </div>
        </div>
    )
}

export default Otros;
