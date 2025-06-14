import React, { useState, useEffect } from 'react';
import { IoCaretBackOutline, IoCheckmarkDoneOutline } from "react-icons/io5";
import axios from 'axios';
import { FiEdit3 } from "react-icons/fi";
import { RiDeleteBin6Line } from "react-icons/ri";
import { CiBoxList } from "react-icons/ci";
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import { TiInfoOutline } from "react-icons/ti";

const FormHorario = ({ especialidad, onClose }) => {
    const API_URL = import.meta.env.VITE_API_URL;
    const [horarios, setHorarios] = useState([]);
    const [formData, setFormData] = useState({
        turno: 'mañana',
        tipo_atencion: 'normal',
        hora_inicio: '',
        hora_fin: ''
    });
    const [editMode, setEditMode] = useState(false);
    const [editId, setEditId] = useState(null);
    const [viewList, setViewList] = useState(false);

    useEffect(() => {
        fetchHorarios();
    }, [viewList]);

    const fetchHorarios = async () => {
        try {
            const response = await axios.get(`${API_URL}/api/nino/horarios-cita?id_especialidad=${especialidad.id_especi}`);
            setHorarios(response.data);
        } catch (error) {
            console.error('Error al obtener horarios:', error);
            toast.error('Error al cargar los horarios');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const toastId = toast.loading(editMode ? 'Actualizando horario...' : 'Registrando horario...', { position: 'top-center' });
        try {
            if (editMode) {
                await axios.put(`${API_URL}/api/nino/actualizar-horario/${editId}`, {
                    ...formData,
                    id_especialidad: especialidad.id_especi
                });
                toast.update(toastId, {
                    render: 'Horario actualizado exitosamente',
                    type: 'success',
                    isLoading: false,
                    autoClose: 3000
                });
                setEditMode(false);
                setEditId(null);
            } else {
                await axios.post(`${API_URL}/api/nino/crear-horario`, {
                    ...formData,
                    id_especialidad: especialidad.id_especi
                });
                toast.update(toastId, {
                    render: 'Horario registrado exitosamente',
                    type: 'success',
                    isLoading: false,
                    autoClose: 3000
                });
            }
            setFormData({
                turno: 'mañana',
                tipo_atencion: 'normal',
                hora_inicio: '',
                hora_fin: ''
            });
            fetchHorarios();
        } catch (error) {
            console.error('Error al procesar horario:', error);
            toast.update(toastId, {
                render: editMode ? 'Error al actualizar el horario' : 'Error al registrar el horario',
                type: 'error',
                isLoading: false,
                autoClose: 3000
            });
        }
    };

    const handleEdit = (horario) => {
        setViewList(false);
        setFormData({
            turno: horario.turno,
            tipo_atencion: horario.tipo_atencion,
            hora_inicio: horario.hora_inicio,
            hora_fin: horario.hora_fin
        });
        setEditMode(true);
        setEditId(horario.id);
    };

    const handleDelete = async (id) => {
        const result = await Swal.fire({
            title: '¿Está seguro?',
            text: '¿Desea eliminar este horario?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        });

        if (result.isConfirmed) {
            const toastId = toast.loading('Eliminando horario...', { position: 'top-center' });
            try {
                await axios.delete(`${API_URL}/api/nino/eliminar-horario/${id}`);
                toast.update(toastId, {
                    render: 'Horario eliminado exitosamente',
                    type: 'success',
                    isLoading: false,
                    autoClose: 3000
                });
                Swal.fire('Eliminado', 'El horario ha sido eliminado exitosamente', 'success');
                fetchHorarios();
            } catch (error) {
                console.error('Error al eliminar horario:', error);
                toast.update(toastId, {
                    render: 'Error al eliminar el horario',
                    type: 'error',
                    isLoading: false,
                    autoClose: 3000
                });
                Swal.fire('Error', 'No se pudo eliminar el horario', 'error');
            }
        }
    };

    const handleRegrese = () => {
        if(viewList) {
            setViewList(false);
        } else {
            onClose();
        }
    }

    // const [activeList, setActiveList] = useState(false)

    return (
        <div className='view form-horario'>
            <section className='view-content'>
                {!viewList ? (
                    <>
                        <h3>{editMode ? 'Editar' : 'Registrar'} Horario para <strong>{especialidad.especialidad} </strong></h3>
                        <form onSubmit={handleSubmit}>
                            <p className="nota"><TiInfoOutline />Ingrese la hora en <span>FORMATO DE 24 HORAS</span> </p>
                            <div className="form-group">
                                <label>Turno:</label>
                                <select
                                    value={formData.turno}
                                    onChange={(e) => setFormData({ ...formData, turno: e.target.value })}
                                >
                                    <option value="mañana">Mañana</option>
                                    <option value="tarde">Tarde</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Tipo de Atención:</label>
                                <select
                                    value={formData.tipo_atencion}
                                    onChange={(e) => setFormData({ ...formData, tipo_atencion: e.target.value })}
                                >
                                    <option value="normal">Normal</option>
                                    <option value="AtencionEspecial">Atención Especial</option>
                                    <option value="receso">Receso</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Hora de Inicio:</label>
                                <input
                                    type="time"
                                    value={formData.hora_inicio}
                                    onChange={(e) => setFormData({ ...formData, hora_inicio: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Hora de Fin:</label>
                                <input
                                    type="time"
                                    value={formData.hora_fin}
                                    onChange={(e) => setFormData({ ...formData, hora_fin: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="btns">
                                {editMode && (
                                    <button type="button" onClick={() => {
                                        setEditMode(false);
                                        setEditId(null);
                                        setViewList(true)
                                        setFormData({
                                            turno: 'mañana',
                                            tipo_atencion: 'normal',
                                            hora_inicio: '',
                                            hora_fin: ''
                                        });
                                    }}>
                                        CANCELAR
                                    </button>
                                )}
                                <button type="submit" className="btn-submit">
                                    {editMode ? 'ACTUALIZAR' : 'GUARDAR'}
                                    <IoCheckmarkDoneOutline />
                                </button>
                            </div>
                        </form>
                        <div className="btn-view">
                            {/* <label htmlFor='list' id='list' >Lista activa
                                <input type="checkbox" name="list" id="list" onChange={(e) => setViewList(e.target.value)} />
                            </label> */}
                            <button onClick={() => setViewList(true)} className='btn-view-list'>Ver Horarios<CiBoxList fontSize={18} /></button>
                        </div>
                    </>
                ) : (
                    <div className='horarios-list'>
                        <h4>Horarios Registrados {especialidad.especialidad} </h4>
                        <table>
                            <thead>
                                <tr>
                                    <th>Turno</th>
                                    <th>Tipo Horario</th>
                                    <th>Inicio</th>
                                    <th>Fin</th>
                                    <th>Accion</th>
                                </tr>
                            </thead>
                            <tbody>
                                {horarios.length === 0 && (
                                    <tr>
                                        <td colSpan="5">No hay horarios registrados</td>
                                    </tr>
                                )}
                                {horarios.map((horario, index) => (
                                    <tr key={index} className={horario.tipo_atencion == 'receso' ? 'receso' : horario.tipo_atencion == 'AtencionEspecial' ? 'especial' : ''} >
                                        <td>{horario.turno}</td>
                                        <td>{horario.tipo_atencion}</td>
                                        <td>{horario.hora_inicio}</td>
                                        <td>{horario.hora_fin}</td>
                                        <td className='accion'>
                                            <div>
                                                <FiEdit3 title='EDITAR' onClick={() => handleEdit(horario)} />
                                                <RiDeleteBin6Line title='ELIMINAR' onClick={() => handleDelete(horario.id)} />
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
                <button type="button" onClick={handleRegrese} className='btn-volver'>
                    <IoCaretBackOutline />VOLVER
                </button>
            </section>
        </div>
    );
};

export default FormHorario;