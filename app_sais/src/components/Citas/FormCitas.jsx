import React, { useState } from 'react';
import './formcita.css';
import { TfiWrite } from "react-icons/tfi";
import { formatearFechaConGuion } from '../../utils/dateUtils';
import { searchByHisClinico, searchByDNI, registerCita, formatPatientData, clearFieldsCita } from './StoreCita';
import { toast } from 'react-toastify';
// Componente de formulario para agregar una cita
const FormCitas = ({ especialidad, closeForm, hora, fecha, consultorio, profesional }) => {
    const [idPaciente, setIdPaciente] = useState('')
    const [hisClinico, setHisClinico] = useState('');
    const [dni, setDni] = useState('');
    const [apellidos, setApellidos] = useState('');
    const [nombres, setNombres] = useState('');
    const [fechaNacimiento, setFechaNacimiento] = useState('');
    const [edad, setEdad] = useState('');
    const [telefono, setTelefono] = useState('');
    const [motivoConsulta, setMotivoConsulta] = useState('');
    const [direccion, setDireccion] = useState('');
    const [semEmbarazo, setSemEmbarazo] = useState('');
    const [metodo, setMetodo] = useState('');
    const [idRespons, setIdRespons] = useState('');

    const [isLoading, setIsLoading] = useState(false);
    const [modalMessage, setModalMessage] = useState(null);
    const [msg, setMsg] = useState({ text: '', type: '' });

    const handleHisClinicoChange = async (e) => {
        const value = e.target.value.trim();
        setHisClinico(value);

        if (value) {
            setMsg({ text: 'Buscando...', type: 'success' });
            const data = await searchByHisClinico(value);

            if (data) {
                const patientData = formatPatientData(data);
                setIdPaciente(patientData.id_paciente);
                setIdRespons(patientData.id_responsable);
                setDni(patientData.dni);
                setApellidos(patientData.apellidos);
                setNombres(patientData.nombres);
                setFechaNacimiento(patientData.fecha_nacimiento);
                setEdad(patientData.edad);
                setTelefono(patientData.telefono);
                setDireccion(patientData.direccion);
                setMsg({ text: '', type: '' });
            } else {
                setMsg({ text: 'Paciente no encontrado!!', type: 'error' });
                const emptyFields = clearFieldsCita();
                Object.entries(emptyFields).forEach(([key, value]) => {
                    const setterName = `set${key.charAt(0).toUpperCase() + key.slice(1)}`;
                    if (typeof eval(setterName) === 'function') {
                        eval(setterName)(value);
                    }
                });
                setDni('');
            }
        } else {
            setMsg({ text: '', type: '' });
        }
    };


    const handleDniChange = async (e) => {
        const value = e.target.value.trim();
        setDni(value);

        if (value) {
            if(value.length === 8) {
                setMsg({ text: 'Buscando...', type: 'success' });
                const data = await searchByDNI(value);

                if (data) {
                    const patientData = formatPatientData(data);
                    setIdPaciente(patientData.id_paciente);
                    setIdRespons(patientData.id_responsable);
                    setHisClinico(patientData.hist_clinico);
                    setApellidos(patientData.apellidos);
                    setNombres(patientData.nombres);
                    setFechaNacimiento(patientData.fecha_nacimiento);
                    setEdad(patientData.edad);
                    setTelefono(patientData.telefono);
                    setDireccion(patientData.direccion);
                    setMsg({ text: '', type: '' });
                } else {
                    const emptyFields = clearFieldsCita();
                    Object.entries(emptyFields).forEach(([key, value]) => {
                        const setterName = `set${key.charAt(0).toUpperCase() + key.slice(1)}`;
                        if (typeof eval(setterName) === 'function') {
                            eval(setterName)(value);
                        }
                    });
                    setHisClinico('');
                    setMsg({ text: 'Paciente no encontrado!!', type: 'error' });
                }
            } else {
                setMsg({ text: '', type: '' });
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!idPaciente) {
            toast.error('Selecciona un paciente válido');
            return;
        }

        const citaData = {
            id_paciente: idPaciente,
            especialidad,
            fecha,
            hora,
            consultorio,
            telefono,
            motivoConsulta,
            direccion,
            metodo,
            semEmbarazo,
            profesional: `${profesional.paterno} ${profesional.materno} ${profesional.nombres}`,
            idRespons,
        };

        setIsLoading(true);
        const result = await registerCita(citaData);
        setModalMessage(result.message);
        setIsLoading(false);

        if (result.success) {
            setTimeout(() => closeForm(), 2000);
        }
    };

    const handleModalClose = () => {
        setModalMessage(null); // Limpiar el mensaje del modal
        closeForm(); // Cerrar el formulario directamente si se hace clic en "Cerrar"
    };

    return (
        <div className="form-cita">
            {/* Modal de carga */}
            {isLoading && (
                <div className="modal-loading">
                    <div className="loader"></div>
                    <p>Registrando la cita...</p>
                </div>
            )}

            {/* Modal de resultado */}
            {modalMessage && (
                <div className="modal-message">
                    <div className="modal-content">
                        <p>{modalMessage}</p>
                        <button onClick={handleModalClose}>✅</button>
                    </div>
                </div>
            )}

            <form onSubmit={handleSubmit}>
                <p className="ico-close" onClick={closeForm}>×</p>
                <h2>Agendar cita para <span>{especialidad}</span></h2>
                <div className="fechas">
                    <div className="box-fechas">
                        <p>FECHA</p>
                        <span>{formatearFechaConGuion(fecha)} </span>
                    </div>
                    <div className="box-fechas">
                        <p>HORA</p>
                        <span>{hora}</span>
                    </div>
                    <div className="box-fechas">
                        <p>CONSULTORIO </p>
                        <span>N° {consultorio}</span>
                    </div>
                </div>
                <div className='box-filtra'>
                    <label>
                        Hist. Clínico:
                        <input value={hisClinico} onChange={handleHisClinicoChange} required />
                    </label>
                    <label>
                        DNI:
                        <input value={dni} maxLength={8} onChange={handleDniChange} required />
                    </label>
                    <p className='tx'>Buscar Paciente por Historia clínica o DNI</p>
                    <p className={`msg ${msg.type === 'success' ? '' : 'msgError'}`}>{msg.text} </p>
                </div>
                <div>
                    <label>
                        Apellidos:
                        <input value={apellidos} className='noo' disabled required />
                    </label>
                    <label>
                        Nombres:
                        <input value={nombres} className='noo' disabled required />
                    </label>
                </div>
                <div>
                    <label>
                        Fech. Nacimiento:
                        <input type="date" className='noo' value={fechaNacimiento} disabled required />
                    </label>
                    <label>
                        Edad:
                        <input type="text" className='noo' value={edad} disabled required />
                    </label>
                    <label>
                        Celular:
                        <input type="text" placeholder='Escribe aquí....' className='siEdit' value={telefono} onChange={(e) => setTelefono(e.target.value)} />
                    </label>
                </div>
                {especialidad === 'Medicina' && (
                    <label>
                        Dirección:
                        <input type="text" placeholder='Escribe aquí....' className='siEdit' value={direccion} onChange={(e) => setDireccion(e.target.value)} />
                    </label>
                )}
                {especialidad === 'Planificación' && (
                    <label>
                        Método de Planificación:
                        <input type="text" placeholder='Escribe aquí....' className='siEdit' value={metodo} onChange={(e) => setMetodo(e.target.value)} required />
                    </label>
                )}
                {especialidad === 'Obstetricia_CPN' && (
                    <label>
                        Semanas de embarazo:
                        <input type="text" placeholder='Escribe aquí....' className='siEdit' value={semEmbarazo} onChange={(e) => setSemEmbarazo(e.target.value)} required />
                    </label>
                )}
                <label>
                    Motivo de Consulta:
                    <textarea className='siEdit' placeholder='Escribe aquí....' value={motivoConsulta} onChange={(e) => setMotivoConsulta(e.target.value)} required />
                </label>
                <div className="btnss">
                    <button className='btn-cancel' type='button' onClick={closeForm}>Cancelar</button>
                    <button className="btn-save" type="submit"><TfiWrite /> Guardar Cita</button>
                </div>
            </form>
        </div>
    );
};

export default FormCitas;
