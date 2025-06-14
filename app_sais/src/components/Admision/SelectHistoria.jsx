import React, { useState, useEffect } from 'react'
import { useConfig } from '../../context/ConfigContext';

const SelectHistoria = ({ value, onChange, error, dniValue }) => {
    const { dniHistoriaValue } = useConfig();
    const API_URL = import.meta.env.VITE_API_URL;
    const [historiasDisponibles, setHistoriasDisponibles] = useState([])

    useEffect(() => {
        const fetchHistorias = async () => {
            try {
                const response = await fetch(`${API_URL}/api/historias-disponibles`)
                if (response.ok) {
                    const data = await response.json()
                    setHistoriasDisponibles(data)
                }
            } catch (error) {
                console.error('Error al obtener historias:', error)
            }
        }

        fetchHistorias()
    }, [])

    const handleHistoriaClick = (historia) => {
        onChange({ target: { name: 'histClinico', value: historia } })

    }

    return (
        <label className='historia_clin'>
            Hist Clínico
            <input 
                type="text"
                name="histClinico"
                value={ dniHistoriaValue ? dniValue : value}
                onChange={onChange}
                maxLength="5"
                placeholder="-----"
            />
            <div className="historias-disponibles">
                <p>Hist disponibles</p>
                <ul>
                    {historiasDisponibles.map((historia, index) => (
                        <li 
                            key={index}
                            onClick={() => {handleHistoriaClick(historia)}}
                            className={value === historia ? 'selected' : ''}
                        >
                            {historia}
                        </li>
                    ))}
                </ul>
            </div>
        {error && <span className="error">{error}</span>}
    </label>
)
}

export default SelectHistoria