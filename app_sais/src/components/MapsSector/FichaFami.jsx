import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './fichaMap.css';
import { BiLinkExternal } from "react-icons/bi";
import { useNavigate } from 'react-router-dom';

const FichaFami = ({ manzana }) => {
    const mz = manzana.text.split('\n')[0];
    const [fichas, setFichas] = useState([]);
    const [loading, setLoading] = useState(true);
    const API_URL = import.meta.env.VITE_API_URL;
    const navigate = useNavigate();

    useEffect(() => {
        const obtenerFichas = async () => {
            setLoading(true);
            try {
                const response = await axios.get(`${API_URL}/api/map/fichas-manzana/${mz}`);
                setFichas(response.data);
                setLoading(false);
            } catch (error) {
                console.error('Error al obtener fichas familiares:', error);
                setLoading(false);
            }
        };

        if (mz) obtenerFichas();
    }, [mz]);

    const handleFichaClick = (codigo) => {
        navigate(`/ficha/${codigo}`);
    };

    return (
        <div className='ficha-map'>
            <h3>Ficha Familiar</h3>
            <div className='fichas'>
                {loading ? (
                    <p>Cargando...</p>
                ): (
                    fichas.length === 0 ? (
                        <p>No se encontraron fichas familiares.</p>
                    ) : (
                        fichas.map((ficha, idx) => (
                            <div className='ficha' key={idx}>
                                <p>{ficha.codigo_ficha}</p>
                                <p>{ficha.jefe_familia || '---'} </p>
                                <BiLinkExternal title='VER FICHA' onClick={() => handleFichaClick(ficha.codigo_ficha)} />
                            </div>
                        ))
                    )
                ) }
            </div>
        </div>
    );
};

export default FichaFami;
