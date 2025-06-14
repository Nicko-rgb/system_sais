import React from 'react'
import { LuLink } from "react-icons/lu";

const Acreditacion = () => {
    return (
        <div>
            <h2>Elige una opción</h2>
            <div className="links">
                <div className="flecha"></div>
                <a href='https://cel.sis.gob.pe/SisConsultaEnLinea' target="_blank" rel="noopener noreferrer">
                    <LuLink className='ico' />
                    Ir a SIS
                </a>
                <a href='https://app8.susalud.gob.pe:8380/login' target="_blank" rel="noopener noreferrer">
                    <LuLink className='ico' />
                    Ir a SITEDS
                </a>
            </div>
        </div>
    )
}
export default Acreditacion