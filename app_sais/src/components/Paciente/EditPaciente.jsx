import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { usePacienteStore } from './StorePaciente';
import Header from '../NavHeader/Header';
import { RiPlayReverseLargeFill } from "react-icons/ri";
import './EditPaciente.css';

const EditPaciente = () => {
    const { historia } = useParams();
    const navigate = useNavigate();
    const { paciente, fetchPaciente } = usePacienteStore();
    const [formData, setFormData] = useState({
        nombres: '',
        ape_paterno: '',
        ape_materno: '',
        dni: '',
        fecha_nacimiento: '',
        edad: '',
        sexo: '',
        celular1: '',
        celular2: '',
        direccion: '',
        sector: '',
        localidad: '',
        departamento: '',
        provincia: '',
        distrito: '',
        tipo_paciente: '',
        discapacidad: ''
    });

    useEffect(() => {
        if (historia) {
            fetchPaciente(historia);
        }
    }, [historia]);

    useEffect(() => {
        if (paciente) {
            setFormData({
                nombres: paciente.nombres || '',
                ape_paterno: paciente.ape_paterno || '',
                ape_materno: paciente.ape_materno || '',
                dni: paciente.dni || '',
                fecha_nacimiento: paciente.fecha_nacimiento ? new Date(paciente.fecha_nacimiento).toLocaleDateString('en-CA') : '',
                edad: paciente.edad || '',
                sexo: paciente.sexo || '',
                celular1: paciente.celular1 || '',
                celular2: paciente.celular2 || '',
                direccion: paciente.direccion || '',
                sector: paciente.sector || '',
                localidad: paciente.localidad || '',
                departamento: paciente.departamento || '',
                provincia: paciente.provincia || '',
                distrito: paciente.distrito || '',
                tipo_paciente: paciente.tipo_paciente || '',
                discapacidad: paciente.discapacidad || ''
            });
        }
    }, [paciente]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const toastId = toast.loading('Actualizando datos...', { position: 'top-center' });

        // Convertir campos vacíos a null
        const Data = Object.fromEntries(
            Object.entries(formData).map(([key, value]) => [
                key,
                value === '' ? null : value
            ])
        );

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/actualizar-paciente/${paciente.id_paciente}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(Data)
            });

            const data = await response.json();

            if (!response.ok) {
                toast.error(data.message || 'Error al actualizar los datos.');
                throw new Error(data.message);
            }

            toast.success('Datos actualizados correctamente');
            navigate(`/admision/${paciente.hist_clinico}`);
        } catch (error) {
            toast.error(error.message || 'Error de servidor o red.');
            console.error('Error:', error);
        } finally {
            toast.dismiss(toastId);
        }
    };

    return (
        <div className="edit-paciente">
            <Header active="Editar Paciente" />
            <h2 className='title-view'>Editar Datos del Paciente</h2>
            <div className="edit-form-wrapper">
                    <button onClick={() => navigate(-1)} className='volver_link'><RiPlayReverseLargeFill />Back</button>
                <form onSubmit={handleSubmit} className="edit-form">
                    <div className="form-section">
                        <h3>Información Personal</h3>
                        <div className="form-row">
                            <div className="form-group">
                                <label>Nombres:</label>
                                <input
                                    type="text"
                                    name="nombres"
                                    value={formData.nombres}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Apellido Paterno:</label>
                                <input
                                    type="text"
                                    name="ape_paterno"
                                    value={formData.ape_paterno}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Apellido Materno:</label>
                                <input
                                    type="text"
                                    name="ape_materno"
                                    value={formData.ape_materno}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>DNI:</label>
                                <input
                                    type="text"
                                    name="dni"
                                    value={formData.dni}
                                    onChange={handleChange}
                                    required
                                    maxLength={8}
                                />
                            </div>
                            <div className="form-group">
                                <label>Fecha de Nacimiento:</label>
                                <input
                                    type="date"
                                    name="fecha_nacimiento"
                                    value={formData.fecha_nacimiento}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Sexo:</label>
                                <select
                                    name="sexo"
                                    value={formData.sexo}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="">Seleccionar</option>
                                    <option value="Masculino">Masculino</option>
                                    <option value="Femenino">Femenino</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="form-section">
                        <h3>Contacto</h3>
                        <div className="form-row">
                            <div className="form-group">
                                <label>Celular 1:</label>
                                <input
                                    type="tel"
                                    name="celular1"
                                    value={formData.celular1}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="form-group">
                                <label>Celular 2:</label>
                                <input
                                    type="tel"
                                    name="celular2"
                                    value={formData.celular2}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="form-section">
                        <h3>Dirección</h3>
                        <div className="form-row">
                            <div className="form-group">
                                <label>Dirección:</label>
                                <input
                                    type="text"
                                    name="direccion"
                                    value={formData.direccion}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="form-group">
                                <label>Sector:</label>
                                <input
                                    type="text"
                                    name="sector"
                                    value={formData.sector}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Localidad:</label>
                                <input
                                    type="text"
                                    name="localidad"
                                    value={formData.localidad}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="form-group">
                                <label>Departamento:</label>
                                <input
                                    type="text"
                                    name="departamento"
                                    value={formData.departamento}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Provincia:</label>
                                <input
                                    type="text"
                                    name="provincia"
                                    value={formData.provincia}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="form-group">
                                <label>Distrito:</label>
                                <input
                                    type="text"
                                    name="distrito"
                                    value={formData.distrito}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="form-section">
                        <h3>Información Adicional</h3>
                        <div className="form-row">
                                <div className="form-group">
                                    <label>Discapacidad:
                                        <input
                                            type="text"
                                            name="discapacidad"
                                            value={formData.discapacidad}
                                            placeholder={formData.discapacidad ? '' : 'Tiene discapacidad?'}
                                            onChange={handleChange}
                                        />
                                    </label>
                                </div>
                        </div>
                    </div>

                    <div className="form-actions">
                        <button type="button" onClick={() => navigate(-1)} className="btn-cancelar">
                            Cancelar
                        </button>
                        <button type="submit" className="btn-guardar">
                            Guardar Cambios
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditPaciente;