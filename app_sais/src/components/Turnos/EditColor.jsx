import React from 'react'
import './edit_color.css'
import useStoreTurno from './StoreTurno'
import { TbPencilMinus } from "react-icons/tb";

const EditColor = ( {close} ) => {
    const { coloresTurno, actualizarColor, restablecerColores } = useStoreTurno()

    return (
        <div onClick={close} className="edit-color-modal">
            <main onClick={(e) => e.stopPropagation()} >
                <h2>Editar Colores de Turnos</h2>
                <div className="color-grid">
                    {Object.entries(coloresTurno).map(([turno, color]) => (
                        <div key={turno} className="color-item">
                            <span className="color-label">{turno}</span>
                            <div
                                className="color-preview"
                                style={{ backgroundColor: color }}
                            />
                            <TbPencilMinus />
                            <input
                                type="color"
                                className="color-input"
                                value={color}
                                onChange={(e) => actualizarColor(turno, e.target.value)}
                            />
                        </div>
                    ))}
                </div>
                <div className="buttons-container">
                    <button className='btn-cancel' onClick={close}>
                        Cerrar
                    </button>
                    <button className="reset-button" onClick={restablecerColores}>
                        Restablecer
                    </button>
                    {/* <button className="save-button" onClick={close}>
                        Cerrar
                    </button> */}
                </div>
            </main>
        </div>
    )
}

export default EditColor