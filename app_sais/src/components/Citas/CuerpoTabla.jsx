import React, { useState, useEffect } from 'react';
import '../../styles/citas.css';
import { BiPlusCircle } from "react-icons/bi";
import { PiPencilLineBold } from "react-icons/pi";
import { RxValueNone } from "react-icons/rx";
import { PiLockKeyOpenFill } from "react-icons/pi";
import { RiDeleteBin6Line } from "react-icons/ri";
import { CiLock } from "react-icons/ci";
import FormCitas from './FormCitas';
import EditCita from './EditCita';
import InfoCita from './InfoCita';
import Store from '../../utils/storeCitaTurno';
import { formatTime, fetchBlockedRows, bloquearHorario, desbloquearHorario, deleteCita } from './StoreCita'

const CuerpoTabla = ({ horarios, especialidad, fecha, consultorio }) => {
    const { citas, turnosPersonal} = Store()
    const [openForm, setOpenForm] = useState(false);
    const [openEdit, setOpenEdit] = useState(false)
    const [citaSelect, setCitaSelect] = useState(null)
    const [showInfoModal, setShowInfoModal] = useState(false)
    const [formData, setFormData] = useState(null);
    const [blockedRows, setBlockedRows] = useState([]);

    // Manejar bloqueo de horario
    const handleBlock = async (horario) => {
        const data = {
            fecha,
            hora_inicio: formatTime(horario.hora_inicio),
            hora_fin: formatTime(horario.hora_fin),
            consultorio,
            especialidad,
        };
        
        const success = await bloquearHorario(data);
        if (success) {
            const updatedRows = await fetchBlockedRows();
            setBlockedRows(updatedRows);
        }
    };

    // Manejar desbloqueo de horario
    const handleUnblock = async (horario) => {
        const data = {
            fecha,
            hora_inicio: formatTime(horario.hora_inicio),
            hora_fin: formatTime(horario.hora_fin),
            consultorio,
            especialidad,
        };
        
        const success = await desbloquearHorario(data);
        if (success) {
            const updatedRows = await fetchBlockedRows();
            setBlockedRows(updatedRows);
        }
    };

    // Abrir el formulario para registrar citas
    const handleOpenForm = (hora_inicio, hora_fin, profesional) => {
        setFormData({
            fecha,
            especialidad,
            hora: `${formatTime(hora_inicio)} - ${formatTime(hora_fin)}`,
            consultorio,
            profesional,
        });
        setOpenForm(true);
    };

    //abrir el formulario para editar cita
    const handleEditForm = (citaEdit) => {
        setCitaSelect(citaEdit)
        setOpenEdit(true)
    }

    const isRowBlocked = (horario) => {
        return blockedRows.some(
            (blocked) =>
                blocked.fecha === fecha &&
                blocked.hora_inicio === formatTime(horario.hora_inicio) &&
                blocked.hora_fin === formatTime(horario.hora_fin) &&
                blocked.especialidad === especialidad &&
                Number(blocked.consultorio) === Number(consultorio)
        );
    };

    // Cerrar el formulario
    const closeForm = () => {
        setOpenForm(false);
        setFormData(null);
        setCitaSelect(null)
        setOpenEdit(false)
        setShowInfoModal(false)
    };

    const handleRowClick = (cita) => {
        if (cita) {
            setCitaSelect(cita);
            setShowInfoModal(true);
        }
    };

    // Cargar datos al cargar componente
    useEffect(() => {
        const loadBlockedRows = async () => {
            const rows = await fetchBlockedRows();
            setBlockedRows(rows);
        };
        loadBlockedRows();
    }, []);

    //creamos una funcion para recortar un texto
    const recortarTexto = (texto) => {
        if (texto.length > 30) {
            return texto.substring(0, 30) + '...';
        }
        return texto
    }

    const today = new Date();
    today.setHours(12, 0, 0, 0); // Establecer hora a mediodía para evitar problemas de zona horaria

    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    yesterday.setHours(12, 0, 0, 0); // Asegurar la misma hora para comparaciones consistentes

    return (
        <>
            <tbody>
                {horarios.map((horario, index) => {
                    const rowBlocked = isRowBlocked(horario);

                    // Encuentra una cita filtrada que coincida con este horario
                    const cita = citas.find(
                        (c) =>
                            c.hora === `${formatTime(horario.hora_inicio)} - ${formatTime(horario.hora_fin)}` &&
                            c.especialidad === especialidad &&
                            c.consultorio === consultorio &&
                            new Date(c.fecha).toISOString().split('T')[0] === fecha
                    );

                    // Encuentra al profesional responsable para atención para este horario
                    const responsable = turnosPersonal.find((res) => {
                        const isGuardiaDiurna = res.turno === 'Guardia Diurna';
                        const isGuardiaDevolucion = res.turno === 'Guardia Devolucion';
                        const isMananaTarde = res.turno === 'Mañana y Tarde';
                    
                        if (res.especial_cita) {
                            const isMatchingSpecialty = res.especial_cita.toLowerCase() === especialidad.toLowerCase();
                            const isMatchingConsultorio = Number(res.num_consultorio) === Number(consultorio);
                            const isMatchingFecha = new Date(res.fecha).toISOString().split('T')[0] === fecha;
                    
                            return (
                                isMatchingSpecialty &&
                                isMatchingConsultorio &&
                                isMatchingFecha &&
                                (
                                    isGuardiaDiurna ||
                                    isGuardiaDevolucion ||
                                    isMananaTarde ||
                                    res.turno.toLowerCase() === horario.turno.toLowerCase()
                                )
                            );
                        }
                    });
                    

                    if (horario.tipo_atencion === 'receso') {
                        return (
                            <tr key={index} className="receso">
                                <td style={{ textAlign: 'center' }} colSpan="2">
                                    {formatTime(horario.hora_inicio)} - {formatTime(horario.hora_fin)}
                                </td>
                                <td style={{ textAlign: 'center' }} colSpan={8}>Receso</td>
                                {(especialidad.toLowerCase() === 'medicina' || especialidad.toLowerCase() === 'obstetricia_cpn' || especialidad.toLowerCase() === 'planificación') && (
                                    <td className="box-ac"></td>
                                )}
                            </tr>
                        );
                    }

                    // Agregar clase si la fila está bloqueada
                    const rowClass = [
                        horario.tipo_atencion === 'AtencionEspecial' ? 'atencion-especial' : 'normal',
                        rowBlocked ? 'bloqueada' : '',
                    ].filter(Boolean).join(' ');

                    return (
                        <tr key={index} className={rowClass} onClick={() => handleRowClick(cita)} style={{ cursor: cita ? 'pointer' : 'default' }}>
                            <td>{`${formatTime(horario.hora_inicio)} - ${formatTime(horario.hora_fin)}`}</td>
                            <td>{horario.turno}</td>
                            <td>{cita ? cita.dni : '---'}</td>
                            <td style={{textTransform: 'uppercase', textAlign: 'left'}} >{cita ? cita.nombres : '---'} {cita ? cita.apellidos : '---'} </td>
                            <td>{cita ? cita.edad : '---'}</td>
                            <td>{cita ? new Date(cita.fecha_nacimiento).toLocaleDateString() : '---'}</td>
                            <td>{cita ? cita.telefono : '---'}</td>
                            {especialidad.toLowerCase() === 'medicina' && <td>{cita ? cita.direccion_c : '---'}</td>}
                            {especialidad.toLowerCase() === 'obstetricia_cpn' && <td>{cita ? cita.semEmbarazo : '---'}</td>}
                            {especialidad.toLowerCase() === 'planificación' && <td>{cita ? cita.metodo : '---'}</td>}
                            <td style={{textAlign: 'left'}} >{recortarTexto(cita ? cita.motivoConsulta : '---')}</td>
                            <td className={`${responsable ? 'responsable' : ''}`}>{responsable ? `${responsable.paterno} ${responsable.materno}, ${responsable.nombres}` : 'Ninguno, asignar en turnos.'}  </td>

                            <td className="box-ac" onClick={(e) => e.stopPropagation()} style={{ padding: '0' }}>
                                <div className="accion">
                                    {new Date(fecha) < yesterday ? (
                                        <CiLock style={{ color: 'red', cursor: 'initial' }} className="ico ico-" title="Fecha pasada, no editable" />
                                    ) : (
                                        !rowBlocked ? (
                                            cita ? (
                                                <>
                                                    <PiPencilLineBold
                                                        title='EDITAR CITA'
                                                        className="ico ico-edit"
                                                        onClick={() => handleEditForm(cita)}
                                                    />
                                                    <RiDeleteBin6Line
                                                        title='BORRAR CITA'
                                                        className='ico ico-delete'
                                                        onClick={() => deleteCita(cita)}
                                                    />
                                                </>
                                            ) : (
                                                responsable ?
                                                    <>
                                                        <BiPlusCircle
                                                            title='AGREGAR CITA'
                                                            className="ico ico-mas"
                                                            onClick={() => handleOpenForm(horario.hora_inicio, horario.hora_fin, responsable)}
                                                        />
                                                        <RxValueNone
                                                            title='BLOQUEAR HORA'
                                                            className="ico ico-bloq"
                                                            onClick={() => handleBlock(horario)}
                                                        />
                                                    </>
                                                    : <RxValueNone
                                                        title='BLOQUEAR HORA'
                                                        className="ico ico-bloq"
                                                        onClick={() => handleBlock(horario)}
                                                    />
                                            )
                                        ) : (
                                            <PiLockKeyOpenFill
                                                title='DESBLOQUEAR HORA'
                                                className="ico ico-abi"
                                                onClick={() => handleUnblock(horario)}
                                            />
                                        )
                                    )}
                                </div>
                            </td>
                        </tr>
                    );
                })}
            </tbody>

            {/* Modales existentes */}
            {openForm && (
                <FormCitas
                    closeForm={closeForm}
                    fecha={formData.fecha}
                    hora={formData.hora}
                    especialidad={formData.especialidad}
                    consultorio={formData.consultorio}
                    profesional={formData.profesional}
                />
            )}
            {openEdit && (
                <EditCita
                    citaData={citaSelect}
                    closeForm={closeForm}
                    horarios={horarios}
                    formatTime={formatTime}
                    especialidad={especialidad}
                />
            )}
            {showInfoModal && (
                <InfoCita
                    cita={citaSelect}
                    onClose={closeForm}
                />
            )}
        </>
    );
};

export default CuerpoTabla;