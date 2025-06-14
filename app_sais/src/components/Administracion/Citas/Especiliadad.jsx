import React, { useState } from 'react';
import '../../../styles/panelAdmin.css';
import { IoCheckmarkDoneOutline, IoCaretBackOutline } from "react-icons/io5";
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';

const Especialidad = ({ onClose }) => {

    const API_URL = import.meta.env.VITE_API_URL;
    const [especialidad, setEspecialidad] = useState('');
    const [consultorios, setConsultorios] = useState(1);
    const [icono, setIcono] = useState(null);
    const [iconoNombre, setIconoNombre] = useState('');

    const handleFileChange = (e) => {
        if (e.target.files[0]) {
            setIcono(e.target.files[0]);
            setIconoNombre(e.target.files[0].name);
        }
    };

    const handleClose = () => {
        setEspecialidad('');
        setConsultorios(1);
        setIcono(null);
        setIconoNombre('');
        onClose();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Confirmación con SweetAlert2
        const confirm = await Swal.fire({
            title: '¿Estás seguro?',
            html: `
                <p><strong>Especialidad:</strong> ${especialidad}</p>
                <p><strong>Consultorios:</strong> ${consultorios}</p>
                <p><strong>Icono:</strong> ${iconoNombre}</p>
                <p>¿Deseas registrar esta especialidad?</p>
            `,
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Sí, registrar',
            cancelButtonText: 'Cancelar',
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33'
        });

        if (!confirm.isConfirmed) return;

        const loadId = toast.loading('Registrando Especialidad...', { position: 'top-center' });

        const formData = new FormData();
        formData.append('especialidad', especialidad);
        formData.append('consultorios', consultorios);
        formData.append('icono', icono);
        formData.append('iconoNombre', iconoNombre);

        try {
            const response = await fetch(`${API_URL}/api/nino/crear-especialidad`, {
                method: 'POST',
                body: formData
            });

            if (response.ok) {
                toast.update(loadId, {
                    render: 'Especialidad registrada con éxito',
                    type: 'success',
                    isLoading: false,
                    autoClose: 3000
                });
                handleClose();
            } else {
                toast.update(loadId, {
                    render: 'Error al registrar la especialidad',
                    type: 'error',
                    isLoading: false,
                    autoClose: 3000
                });
            }

        } catch (error) {
            console.error('Error:', error);
            toast.update(loadId, {
                render: 'Error al registrar la especialidad',
                type: 'error',
                isLoading: false,
                autoClose: 3000
            });
        }
    };

    return (
        <div className="view">
            <div className="view-content">
                <h3>Registrar Nueva Especialidad para citas</h3>
                <form onSubmit={handleSubmit} className="form">
                    <div>
                        <label>
                            Nombre de la Especialidad:
                            <input
                                type="text"
                                value={especialidad}
                                onChange={(e) => setEspecialidad(e.target.value.toUpperCase())}
                                required
                                style={{ textTransform: 'uppercase' }}
                            />
                        </label>
                        <label>
                            Número de Consultorios:
                            <select
                                value={consultorios}
                                onChange={(e) => setConsultorios(Number(e.target.value))}
                                required
                            >
                                <option value={1}>1 Consultorio</option>
                                <option value={2}>2 Consultorios</option>
                            </select>
                        </label>
                    </div>
                    <label>
                        Icono de la Especialidad:
                        <input
                            type="file"
                            accept=".png,.jpg,.jpeg"
                            onChange={handleFileChange}
                            required
                            className='file'
                        />
                    </label>
                    <div className="btns">
                        <button type="button" className="btn-cancel" onClick={handleClose}>Cancelar</button>
                        <button type="submit" className="btn-submit">Guardar<IoCheckmarkDoneOutline /></button>
                    </div>
                </form>
                <button className='btn-volver' onClick={() => handleClose()}><IoCaretBackOutline />VOLVER</button>
            </div>
        </div>
    );
};

export default Especialidad;
