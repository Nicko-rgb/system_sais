import React, { use, useState } from 'react'
import '../../components/Citas/info_cita.css'
import { IoMdClose } from 'react-icons/io';
import { RiDeleteBin6Line } from "react-icons/ri";
import { toast } from 'react-toastify';
import { BiLinkExternal } from "react-icons/bi";
import { useAuth } from '../../context/AuthContext';

const InfoPersonal = ({ onClose, personData, handleActivated }) => {
    const [estado, setEstado] = useState(personData.estado);
    const [btnText, setBtnText] = useState(estado === 'activo' ? 'Inactivar' : 'Activar');
    const [fileName, setFileName] = useState(personData.file_name);
    const { user } = useAuth()

    const handleDelete = async () => {
        const toastId = toast.loading('Eliminando personal...', { position: 'top-center' });
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/eliminar-personal/${personData.id_personal}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            const data = await response.json();

            if (response.ok) {
                toast.success(data.message);
                onClose();
            } else {
                toast.error(data.message);
            }
            toast.dismiss(toastId);

        } catch (error) {
            console.error('Error al eliminar el personal:', error);
            toast.error('Error al eliminar el personal');
            toast.dismiss(toastId);
        }
    }

    const handleDeleteArchivo = async () => {
        const confirm = window.confirm("¿Estás seguro de eliminar el archivo?");
        if (!confirm) return;

        const toastId = toast.loading('Eliminando archivo...', { position: 'top-center' });

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/delete-archivo-personal/${personData.id_personal}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            const data = await response.json();

            if (response.ok) {
                toast.success(data.message);
                // Limpia el nombre del archivo en el estado si lo estás usando
                personData.file_name = null; // o usa setPersonData si es state
                setFileName(null);
            } else {
                toast.error(data.message);
            }

        } catch (error) {
            console.error('Error al eliminar archivo:', error);
            toast.error('Error al eliminar archivo');
        } finally {
            toast.dismiss(toastId);
        }
    };


    return (
        <div className='info-cita' onClick={onClose} >
            <div className="modal-info" onClick={(e) => e.stopPropagation()} >
                <div className="modal-header">
                    <h2>Información de Personal</h2>
                    <button className="close-button" onClick={onClose}>
                        <IoMdClose />
                    </button>
                </div>
                <div className="content-info-cita">
                    <div className="cbz">
                        {user.user.tipo_user.toLowerCase() == 'admin' && (
                            <button onClick={() => handleDelete()} className='delete'><RiDeleteBin6Line />Eliminar</button>
                        )}
                        {user.user.tipo_user.toLowerCase() !== 'responsable' && (
                            <button
                            id='btn-activar'
                                onClick={async () => {
                                    await handleActivated(personData.id_personal);
                                    const nuevoEstado = estado === 'activo' ? 'inactivo' : 'activo';
                                    setEstado(nuevoEstado);
                                    setBtnText(nuevoEstado === 'activo' ? 'Inactivar' : 'Activar');
                                }} className={btnText.toLowerCase()} > {btnText}
                            </button>
                        )}
                    </div>
                    <div className="group">
                        <label className='info-label'>DNI:
                            <span className='info-value'>{personData.dni} </span>
                        </label>
                        <label className='info-label'>Rol de Personal:
                            <span className='info-value'>{personData.tipo_user || '---'}</span>
                        </label>
                        {personData.tipo_personal && (
                            <label className='info-label'>Tipo Personal:
                                <span className='info-value'>{personData.tipo_personal}</span>
                            </label>
                        )}
                    </div>
                    <div className="group">
                        <label className='info-label'>Nombres:
                            <span className='info-value'>{personData.paterno} {personData.materno}, {personData.nombres} </span>
                        </label>
                    </div>
                    <div className="group">
                        <label className='info-label'>Profesión:
                            <span className='info-value'>{personData.profesion}</span>
                        </label>
                        <label className='info-label'>Servicio:
                            <span className='info-value'>{personData.servicio}</span>
                        </label>
                    </div>
                    <div className="group">
                        <label className='info-label'>Atencion Cita:
                            <span className='info-value'>{personData.especial_cita || '---'}</span>
                        </label>
                        <label className='info-label'>Consultorio:
                            <span className='info-value'>{personData.especial_cita ? personData.num_consultorio : '---' || '---'}</span>
                        </label>
                    </div>
                    <div className="group">
                        <label className='info-label'>Condición:
                            <span className='info-value'>{personData.condicion}</span>
                        </label>
                        <label className='info-label'>Telefono:
                            <span className='info-value'>{personData.celular}</span>
                        </label>
                        <label className='info-label'>Correo:
                            <span style={{ textTransform: 'none' }} className='info-value'>{personData.correo}</span>
                        </label>
                    </div>
                    <div className="group files">
                        <label className='info-label' >Documento:
                            <span className='info-value'>{fileName || '--No hay documento--'}</span>
                        </label>
                        {fileName && <>
                            <BiLinkExternal title='Ver Archivo' onClick={() => {
                                window.open(`${import.meta.env.VITE_API_URL}/api/user-get-documento/${personData.id_personal}`, '_blank');
                            }} />
                            <RiDeleteBin6Line onClick={() => handleDeleteArchivo()} title='Eliminar Archivo' />
                        </>}

                    </div>
                    <div className="group">
                        <label className='info-label'>Estado:
                            <span className='info-value'>{estado}</span>
                            <div className={`dot  ${estado === 'activo' ? 'activo' : ''}`} ></div>
                        </label>
                    </div>
                    <div className="group"></div>
                </div>
            </div>
        </div>
    )
}

export default InfoPersonal