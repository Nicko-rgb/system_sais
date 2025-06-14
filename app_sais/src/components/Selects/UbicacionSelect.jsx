import React, { useState, useEffect } from 'react';

// Importa los datos JSON
import departamentosData from '../../data/departamentos.json';
import provinciasData from '../../data/provincias.json';
import distritosData from '../../data/distritos.json';

function UbicacionSelect({setNameDepa, setNameProvin, setNameDistri}) {
    const [departamento, setDepartamento] = useState('');
    const [provincia, setProvincia] = useState('');
    const [distrito, setDistrito] = useState('');

    const [provincias, setProvincias] = useState([]);
    const [distritos, setDistritos] = useState([]);

    // const [nameDepa, setNameDepa] = useState('');
    // const [nameProvin, setNameProvin] = useState('');
    // const [nameDistri, setNameDistri] = useState('');

    // Actualiza las provincias y nombre de departamento cuando cambia el departamento
    useEffect(() => {
        if (departamento) {
            const provinciasFiltradas = provinciasData.filter(
                (prov) => prov.department_id === departamento
            );
            setProvincias(provinciasFiltradas);
            setProvincia('');
            setDistritos([]);
            setDistrito('');

            const depSeleccionado = departamentosData.find((dep) => dep.id === departamento);
            setNameDepa(depSeleccionado ? depSeleccionado.name : '');
            setNameProvin('');
            setNameDistri('');
        } else {
            setProvincias([]);
            setProvincia('');
            setDistritos([]);
            setDistrito('');
            setNameDepa('');
            setNameProvin('');
            setNameDistri('');
        }
    }, [departamento]);

    // Actualiza los distritos y nombre de provincia cuando cambia la provincia
    useEffect(() => {
        if (provincia) {
            const distritosFiltrados = distritosData.filter(
                (dist) => dist.province_id === provincia
            );
            setDistritos(distritosFiltrados);
            setDistrito('');

            const provSeleccionada = provinciasData.find((prov) => prov.id === provincia);
            setNameProvin(provSeleccionada ? provSeleccionada.name : '');
            setNameDistri('');
        } else {
            setDistritos([]);
            setDistrito('');
            setNameProvin('');
            setNameDistri('');
        }
    }, [provincia]);

    // Actualiza el nombre del distrito cuando cambia el distrito
    useEffect(() => {
        if (distrito) {
            const distSeleccionado = distritosData.find((dist) => dist.id === distrito);
            setNameDistri(distSeleccionado ? distSeleccionado.name : '');
        } else {
            setNameDistri('');
        }
    }, [distrito]);

    return (
        <div className='form-group'>
            <label>Departamento:
                <select value={departamento} onChange={(e) => setDepartamento(e.target.value)} required>
                    <option value="">--Seleccionar--</option>
                    {departamentosData.map((dep) => (
                        <option key={dep.id} value={dep.id}>{dep.name}</option>
                    ))}
                </select>
            </label>
            <label>Provincia:
                <select value={provincia} onChange={(e) => setProvincia(e.target.value)} disabled={!provincias.length} required>
                    <option value="">--Seleccionar--</option>
                    {provincias.map((prov) => (
                        <option key={prov.id} value={prov.id}>{prov.name}</option>
                    ))}
                </select>
            </label>

            <label>Distrito:
                <select value={distrito} onChange={(e) => setDistrito(e.target.value)} disabled={!distritos.length} required>
                    <option value="">--Seleccionar--</option>
                    {distritos.map((dist) => (
                        <option key={dist.id} value={dist.id}>{dist.name}</option>
                    ))}
                </select>
            </label>

            {/* <div>
                <h4>Ubicación Seleccionada:</h4>
                <p>Departamento: {nameDepa || '-'}</p>
                <p>Provincia: {nameProvin || '-'}</p>
                <p>Distrito: {nameDistri || '-'}</p>
            </div> */}
        </div>
    );
}

export default UbicacionSelect;
