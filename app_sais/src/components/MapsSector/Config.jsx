import React, { useState } from 'react';
import './config.css';
import { TiWarningOutline } from "react-icons/ti";
import { TbDatabaseX, TbPackageExport } from "react-icons/tb";
import { IoReloadOutline } from "react-icons/io5";
import useStoreMap from './StoreMap';
import Store from '../../utils/storeCitaTurno';
import { useAuth } from '../../context/AuthContext';

const Config = () => {
    const { defaultColors, handleExporNota, handleExportAsignado, confirmarAccion, notas } = useStoreMap();
    const { sectorPer } = Store();
    const { user } = useAuth();
    const [colorState, setColorState] = useState(() => {
        const savedColors = localStorage.getItem('colors');
        return savedColors ? JSON.parse(savedColors) : defaultColors;
    });

    const handleColorChange = (key, value) => {
        setColorState(prevColors => {
            const updatedColors = {
                ...prevColors,
                [key]: value,
            };
            localStorage.setItem('colors', JSON.stringify(updatedColors));
            return updatedColors;
        });
    };

    const handleReset = () => {
        setColorState(defaultColors);
        localStorage.setItem('colors', JSON.stringify(defaultColors));
    };

    return (
        <div className='configmz'>
            <h3>Configuración</h3>
            <p className='prf'>
                Configuración del plano de la jurisdicción del EESS
                Centro de Salud de Micaela Bastidas
            </p>
            <div className="header-box">
                <p className='txtBox'>Cambiar Colores del mapa</p>
                <div onClick={handleReset} className="restablece">
                    <IoReloadOutline />
                    <div className="etiqueta">Reestablecer</div>
                </div>
            </div>
            <div className="boxs" style={{ padding: 0 }} >
                {Object.keys(colorState).map((key) => (
                    <div className='box' key={key}>
                        <label>{key}:</label>
                        <input
                            type="color"
                            value={colorState[key]}
                            onChange={(e) => handleColorChange(key, e.target.value)}
                        />
                    </div>
                ))}
            </div>
            <hr />
            <div className="nums">
                <p>N° de asignados: <span>{sectorPer.length}</span> </p>
                <p>N° de notas: <span>{notas.length} </span></p>
            </div>
            <hr />
            <div className="btns">
                <button onClick={handleExportAsignado} ><TbPackageExport />Export Asignaciones</button>
                <button onClick={handleExporNota} ><TbPackageExport />Exportar Notas</button>
            </div>
            {user.user.tipo_user === 'Admin' && (
                <fieldset className="btns">
                    <legend><TiWarningOutline />Acciones Peligrosas</legend>
                    <button onClick={() => confirmarAccion('asignacion')}>
                        <TbDatabaseX />Vaciar Asignación
                    </button>
                    <button onClick={() => confirmarAccion('notas')}>
                        <TbDatabaseX />Vaciar Notas
                    </button>
                </fieldset>
            )}
        </div>
    );
};

export default Config;
