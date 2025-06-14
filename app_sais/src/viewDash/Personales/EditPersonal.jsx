import React, { useState, useEffect } from "react";
// import "./EditPersonal.css";
import '../../components/Formularios/reg_personal.css'
import { toast } from "react-toastify";
import Store from "../../utils/storeCitaTurno";

const EditPersonal = ({ personData, onClose }) => {
    const [formData, setFormData] = useState({ ...personData });
    const [loading, setLoading] = useState(false);
    const [file, setFile] = useState(null);
    const API_URL = import.meta.env.VITE_API_URL;
    const { especialidad, profesiones, servicios } = Store();

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === 'especial_cita' && value && !formData.num_consultorio) {
            setFormData({ ...formData, [name]: value, num_consultorio: '1' });
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
    
        try {
            // Clonar y limpiar los campos innecesarios
            const cleanData = { ...formData };
            delete cleanData.profesion;
            delete cleanData.servicio;
    
            const formDataToSend = new FormData();
            for (const key in cleanData) {
                formDataToSend.append(key, cleanData[key]);
            }
    
            if (file) {
                formDataToSend.append('file', file);
            }
    
            const response = await fetch(`${API_URL}/api/editar-personal`, {
                method: 'PUT',
                body: formDataToSend,
            });
    
            if (response.ok) {
                toast.success('Personal editado con éxito');
            } else {
                toast.error('Error al editar personal');
            }
    
            setLoading(false);
            onClose();
        } catch (error) {
            console.error('Error al enviar datos:', error);
            setLoading(false);
            toast.error('Error al enviar datos.');
        }
    };

    useEffect(() => {
        if (personData && profesiones.length > 0 && servicios.length > 0) {
            const profesionMatch = profesiones.find(p => p.nombre_profesion === personData.profesion);
            const servicioMatch = servicios.find(s => s.nombre_servicio === personData.servicio);
    
            setFormData(prev => ({
                ...prev,
                id_profesion: profesionMatch ? profesionMatch.id_profesion : '',
                id_servicio: servicioMatch ? servicioMatch.id_servicio : ''
            }));
        }
    }, [personData, profesiones, servicios]);

    return (
        <div className="reg-personal">
            <form className="form-personal" onSubmit={handleSubmit}>
                <h3 style={{ color: 'var(--color1)', fontSize: '1.5rem' }} className='title-view'>Editar Datos Personales</h3>
                <div className="fc">
                    <div className="fd">
                        <div>
                            <label>DNI:
                                <input type="text" name="dni" value={formData.dni} required onChange={handleChange} maxLength={"8"} pattern='\d{8}' />
                            </label>
                            <label>Nombre:
                                <input type="text" name="nombres" value={formData.nombres} required onChange={handleChange} />
                            </label>
                        </div>
                        <div>
                            <label>Apellido Paterno:
                                <input type="text" name="paterno" value={formData.paterno} required onChange={handleChange} />
                            </label>
                            <label>Apellido Materno:
                                <input type="text" name="materno" value={formData.materno} required onChange={handleChange} />
                            </label>
                        </div>
                        <div>
                            <label>Celular:
                                <input type="text" name="celular" value={formData.celular} onChange={handleChange} />
                            </label>
                            <label>Correo:
                                <input id="email" type="text" name="correo" value={formData.correo} onChange={handleChange} />
                            </label>
                        </div>
                        <div>
                            <label>Rol:
                                <select name="tipo_user" value={formData.tipo_user} onChange={handleChange}>
                                    <option value="">--Ninguno--</option>
                                    <option value="Jefe">Jefe</option>
                                    <option value="Admin">Admin</option>
                                    <option value="Responsable">Responsable</option>
                                </select>
                            </label>
                            <label>Condición:
                                <select name="condicion" value={formData.condicion} onChange={handleChange}>
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
                    <div className="fi">
                        <div>
                            <label>Tipo Personal:
                                <select name="tipo_personal" value={formData.tipo_personal} onChange={handleChange} >
                                    <option value="Administrativo">Administrativo</option>
                                    <option value="Salud">Salud</option>
                                </select>
                            </label>
                            <label className="file">Documento:
                                <input
                                    type="file"
                                    name="file"
                                    accept=".pdf, .docx"
                                    onChange={(e) => setFile(e.target.files[0])}
                                />
                            </label>
                        </div>
                        <div>
                            <label>Profesión:
                                <select
                                    name="id_profesion"
                                    value={formData.id_profesion || ''}
                                    onChange={handleChange}
                                >
                                    <option value="">Seleccione una profesión</option>
                                    {profesiones.map((prof) => (
                                        <option key={prof.id_profesion} value={prof.id_profesion}>
                                            {prof.nombre_profesion}
                                        </option>
                                    ))}
                                </select>
                            </label>
                            <label>Servicio:
                                <select
                                    name="id_servicio"
                                    value={formData.id_servicio || ''}
                                    onChange={handleChange}
                                >
                                    <option value="">Seleccione un servicio</option>
                                    {servicios.map((serv) => (
                                        <option key={serv.id_servicio} value={serv.id_servicio}>
                                            {serv.nombre_servicio}
                                        </option>
                                    ))}
                                </select>
                            </label>
                        </div>
                        <div className="selec-cita">
                            <label>Especialidad en citas:
                                <select name="especial_cita" value={formData.especial_cita} onChange={handleChange}>
                                    <option value="">--Ninguno--</option>
                                    {especialidad.map((opcion, index) => (
                                        <option key={index} value={opcion.especialidad}>{opcion.especialidad}</option>
                                    ))}
                                </select>
                            </label>
                            {/* Mostrar N° Consultorio solo si hay especialidad seleccionada */}
                            {formData.especial_cita && (
                                <label>N° Consultorio:
                                    <select name="num_consultorio" value={formData.num_consultorio} onChange={handleChange}>
                                        {Array.from({ length: especialidad.find(esp => esp.especialidad === formData.especial_cita)?.consultorios || 1 }, (_, i) => (
                                            <option key={i + 1} value={i + 1}>{i + 1}</option>
                                        ))}
                                    </select>
                                </label>
                            )}

                        </div>

                        <fieldset className="credencialesAcceso">
                            <legend>credenciales de acceso</legend>
                            <div className="form-grid">
                                <label>Usuario(DNI):
                                    <input disabled style={{ cursor: 'no-drop' }} type="text" name="usuario" value={formData.dni} onChange={handleChange} />
                                </label>
                                <label>Contraseña:
                                    <input type="text" name="contrasena" value={formData.contrasena} onChange={handleChange} />
                                </label>
                            </div>
                        </fieldset>
                        <div className="btns">
                            <button type="submit" id={loading ? 'savee' : ''} className="btn-save">{loading && <div className="loader"></div>}  {loading ? 'Guardando...' : 'Guardar'} </button>
                            <button type="button" className="btn-cancel" onClick={onClose}>Cancelar</button>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default EditPersonal;