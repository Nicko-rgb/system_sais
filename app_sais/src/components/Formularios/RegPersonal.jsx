import React, { useState } from 'react';
import { toast } from 'react-toastify';
import './reg_personal.css';
import Selected from './SelectPersonal.jsx';
// import 'react-toastify/dist/ReactToastify.css'; // Asegúrate de importar los estilos en tu App.js o aquí si no lo has hecho
import { IoCheckmarkDoneOutline } from "react-icons/io5";
import Store from '../../utils/storeCitaTurno.js';

const RegPersonal = ({ handleForm }) => {
    const [formData, setFormData] = useState({
        dni: '',
        paterno: '',
        materno: '',
        nombres: '',
        tipoUser: '',
        tipoPersonal: '',
        file: null,
        profesion: null,
        servicio: null,
        especialidad: null,
        consultorio: null,
        condicion: '',
        celular: '',
        correo: '',
        nameUser: '',
        contrasena: '',
        repitContra: ''
    });
    
    const { especialidad } = Store()
    const [tieneEspecialidad, setTieneEspecialidad] = useState(false);
    const [mostrarConsultorio, setMostrarConsultorio] = useState(false);
    const [loading, setLoading] = useState(false);

    const API_URL = import.meta.env.VITE_API_URL;

    const handleChange = (e) => {
        const { name, value, type, files } = e.target;
        if (type === 'file') {
            const file = files[0];
            if (file) {
                const fileType = file.name.split('.').pop().toLowerCase();
                if (!['docx', 'pdf'].includes(fileType)) {
                    toast.error('Solo se permiten archivos .docx y .pdf');
                    e.target.value = '';
                    return;
                }
                setFormData(prev => ({ ...prev, [name]: file }));
            }
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleProfesionChange = (selectedOption) => {
        setFormData(prev => ({ ...prev, profesion: selectedOption }));
    };

    const handleServicioChange = (selectedOption) => {
        setFormData(prev => ({ ...prev, servicio: selectedOption }));
    };

    const handleCheckboxChange = () => {
        setTieneEspecialidad(!tieneEspecialidad);
        formData.especialidad = null; // Limpia la especialidad si se desactiva
        formData.consultorio = null; // Limpia el consultorio si se desactiva
        setMostrarConsultorio(false); // Oculta el campo de consultori
    };

    const handleEspecialidadChange = (e) => {
        const selectedEspecialidad = e.target.value;
        setFormData(prev => ({ ...prev, especialidad: selectedEspecialidad }));

        setMostrarConsultorio(
            selectedEspecialidad === 'Enfermería' ||
            selectedEspecialidad === 'Medicina' ||
            selectedEspecialidad === 'Odontología'
        );
    };

    const handleKeyPress = (e) => {
        if (!/[0-9]/.test(e.key)) e.preventDefault();
    };

    const validarEmail = (email) => {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;
        if (typeof email !== 'string') return false;
        const trimmedEmail = email.trim();
        return regex.test(trimmedEmail);
    };

    const validarDatos = () => {
        const {
            dni, paterno, materno, nombres, profesion, servicio, tipoPersonal,
            celular, correo, contrasena, repitContra
        } = formData;

        if (!dni || !paterno || !materno || !nombres || !profesion || !servicio || !tipoPersonal || !celular || !correo || !contrasena || !repitContra) {
            toast.warning('Todos los campos son obligatorios.', { autoClose: 2500 });
            return false;
        }

        if (dni.length !== 8) {
            toast.warning('El DNI debe tener 8 dígitos.', { autoClose: 2500 });
            return false;
        }

        if (celular.length !== 9) {
            toast.warning('El celular debe tener 9 dígitos.', { autoClose: 2500 });
            return false;
        }

        if (!validarEmail(correo)) {
            toast.error('El correo electrónico no es válido.', { autoClose: 2500 });
            return false;
        }


        if (contrasena.length < 6) {
            toast.warning('La contraseña debe tener al menos 6 caracteres.', { autoClose: 2500 });
            return false;
        }

        if (contrasena !== repitContra) {
            toast.error('Las contraseñas no coinciden.', { autoClose: 2500 });
            return false;
        }

        return true;
    };

    const handleFormData = async (e) => {
        e.preventDefault();
        if (!validarDatos()) return;

        setLoading(true);

        const dataPersonal = {
            dni: formData.dni,
            paterno: formData.paterno,
            materno: formData.materno,
            nombres: formData.nombres,
            tipoUser: formData.tipoUser || null,
            tipoPersonal: formData.tipoPersonal,
            profesion: formData.profesion.id_profesion,
            servicio: formData.servicio.id_servicio,
            especialidad: tieneEspecialidad ? formData.especialidad || null : null,
            consultorio: tieneEspecialidad && formData.consultorio ? formData.consultorio : null,
            condicion: formData.condicion,
            celular: formData.celular,
            correo: formData.correo,
            nameUser: formData.dni,
            contrasena: formData.contrasena,
            file: formData.file || null
        };

        console.log('Datos del formulario:', dataPersonal);
        

        try {
            const formDataToSend = new FormData();
            Object.keys(dataPersonal).forEach(key => {
                formDataToSend.append(key, dataPersonal[key]);
            });

            const response = await fetch(`${API_URL}/api/registrar-personal`, {
                method: 'POST',
                body: formDataToSend
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Error al registrar el personal.');
            }

            const result = await response.json();
            toast.success('Estado: ' + result.message, { autoClose: 3000 });
            handleForm();
        } catch (error) {
            console.error('Error:', error.message);
            toast.error('Error al registrar: ' + error.message, { autoClose: 3000 });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="reg-personal">
            <form onSubmit={handleFormData} className="form-personal">
                <h3 style={{ color: 'var(--color1)', fontSize: '1.4rem' }} className='title-view' >Registrar Nuevo Personal de Salud</h3>
                <div className="fc">
                    <div className="fd">
                        {/* Primera Columna */}
                        <div>
                            <label>DNI:
                                <input name="dni" className={`d ${formData.dni ? 'activo' : ''}`} value={formData.dni} onChange={handleChange} maxLength={8} onKeyPress={handleKeyPress} disabled={loading} />
                            </label>
                            <label>Nombres:
                                <input name="nombres" className={`${formData.nombres ? 'activo' : ''}`} value={formData.nombres} onChange={handleChange} disabled={loading} />
                            </label>
                        </div>

                        <div>
                            <label>Paterno:
                                <input name="paterno" className={`${formData.paterno ? 'activo' : ''}`} value={formData.paterno} onChange={handleChange} disabled={loading} />
                            </label>
                            <label>Materno:
                                <input name="materno" className={`${formData.materno ? 'activo' : ''}`} value={formData.materno} onChange={handleChange} disabled={loading} />
                            </label>
                        </div>

                        <div>
                            <label>Celular:
                                <input name="celular" className={`${formData.celular ? 'activo' : ''}`} value={formData.celular} onChange={handleChange} maxLength={9} onKeyPress={handleKeyPress} disabled={loading} />
                            </label>
                            <label>Correo:
                                <input style={{ textTransform: 'none' }} name="correo" className={`d ${formData.correo ? 'activo' : ''}`} value={formData.correo} onChange={handleChange} disabled={loading} />
                            </label>
                        </div>

                        <div>
                            <label>Rol de Personal:
                                <select name="tipoUser" className={`${formData.tipoUser ? 'activo' : ''}`} value={formData.tipoUser} onChange={handleChange} disabled={loading}>
                                    <option value="">--Ninguno--</option>
                                    <option value="Admin">Admin</option>
                                    <option value="Jefe">Jefe</option>
                                    <option value="Responsable">Responsable</option>
                                </select>
                            </label>
                            <label>Condición:
                                <select name="condicion" className={`${formData.condicion ? 'activo' : ''}`} value={formData.condicion} onChange={handleChange} disabled={loading}>
                                    <option value="">--Ninguno--</option>
                                    <option value="Nombrado">Nombrado</option>
                                    <option value="Contratado">Contratado</option>
                                    <option value="Tercero">Tercero</option>
                                    <option value="CAS">CAS</option>
                                    <option value="CLAS">CLAS</option>
                                    <option value="Serums">Serums</option>
                                </select>
                            </label>
                        </div>
                    </div>

                    {/* Segunda Columna */}
                    <div className="fi">
                        <div>
                            <label>Tipo Personal:
                                <select name="tipoPersonal" value={formData.tipoPersonal} onChange={handleChange} disabled={loading} >
                                    <option value="">--Ninguno--</option>
                                    <option value="Administrativo">Administrativo</option>
                                    <option value="Salud">Asistencial</option>
                                </select>
                            </label>
                            <label className='file'>Adjuntar Archivo:
                                <input name='file' type="file" accept=".docx, .pdf" onChange={handleChange} disabled={loading} />
                            </label>
                        </div>
                        <Selected
                            onProfesionChange={handleProfesionChange}
                            onServicioChange={handleServicioChange}
                        />

                        <div className="especialidad">
                            <label className="label-especialidad" style={{ width: 'auto', gap: '5px' }}>
                                <input type="checkbox" checked={tieneEspecialidad} onChange={handleCheckboxChange} disabled={loading} />
                                Citas?
                            </label>

                            {tieneEspecialidad && (
                                <>
                                    <label>Especialidad:
                                        <select name="especialidad" className={`${formData.especialidad ? 'activo' : ''}`} value={formData.especialidad} onChange={handleEspecialidadChange} disabled={loading}>
                                            <option value="">Seleccione una opción</option>
                                            {especialidad.map((e) => (
                                                <option key={e.id_especi} value={e.especialidad} >{e.especialidad} </option>
                                            ))}
                                        </select>
                                    </label>
                                    {formData.especialidad && (
                                        <label>N° Consultorio:
                                            <select name="consultorio" className={`${formData.consultorio ? 'activo' : ''}`} value={formData.consultorio} onChange={handleChange} disabled={loading} required>
                                                <option value="">---</option>
                                                <option value="1">1</option>
                                                {mostrarConsultorio && (
                                                    <option value="2">2</option>
                                                )}
                                            </select>
                                        </label>
                                    )}
                                </>
                            )}
                        </div>

                        <fieldset className="credencialesAcceso">
                            <legend>Credenciales de acceso</legend>
                            <label>Usuario (DNI):
                                <input value={formData.dni} disabled style={{ cursor: 'no-drop' }} />
                            </label>
                            <label>Contraseña:
                                <input name="contrasena" className={`${formData.contrasena ? 'activo' : ''}`} value={formData.contrasena} onChange={handleChange} disabled={loading} />
                            </label>
                            <label>Repetir contraseña:
                                <input name="repitContra" className={`${formData.repitContra ? 'activo' : ''}`} value={formData.repitContra} onChange={handleChange} disabled={loading} />
                            </label>
                        </fieldset>

                        <div className="btns">
                            <button type="button" className="btn-cancel" onClick={handleForm} disabled={loading}>Cancelar</button>
                            <button type="submit" className="btn-save" disabled={loading}>
                                {loading ? 'Guardando...' : 'Registrar'} <IoCheckmarkDoneOutline />
                            </button>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default RegPersonal;
