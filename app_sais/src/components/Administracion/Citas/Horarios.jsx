import React, { useState } from 'react'
import { IoCaretBackOutline } from "react-icons/io5";
import '../../../styles/panelAdmin.css';
import Store from '../../../utils/storeCitaTurno';
import FormHorario from './FormHorario';

const Horarios = ({ onCLose }) => {
    const { especialidad } = Store();
    const [selectedEspecialidad, setSelectedEspecialidad] = useState(null);

    const handleEspecialidadClick = (opcion) => {
        setSelectedEspecialidad(opcion);
    };

    const handleBack = () => {
        if (selectedEspecialidad) {
            setSelectedEspecialidad(null);
        } else {
            onCLose();
        }
    };

    if (selectedEspecialidad) {
        return <FormHorario especialidad={selectedEspecialidad} onClose={handleBack} />;
    }

    return (
        <div className='view horario'>
            <section className='view-content'>
                <h3>Selecciona una Especialidad para crear y ver horarios</h3>
                <div className='opcions'>
                    {especialidad.filter(opcion => opcion.estado).map((opcion, index) => (
                        <div 
                            key={index} 
                            className="opcion"
                            onClick={() => handleEspecialidadClick(opcion)}
                            style={{ cursor: 'pointer' }}
                        >
                            {opcion.icono && (
                                <img
                                    src={opcion.icono}
                                    alt={opcion.ico_name || 'Especialidad'}
                                />
                            )}
                            <p>{opcion.especialidad}</p>
                        </div>
                    ))}
                </div>
                <button className='btn-volver' onClick={handleBack}><IoCaretBackOutline />VOLVER</button>
            </section>
        </div>
    )
}

export default Horarios