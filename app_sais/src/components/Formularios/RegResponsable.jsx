import React, { useEffect } from 'react'
import UbicacionSelect from '../../components/Selects/UbicaCionSelect'

const RegResponsable = ({ formDataRes, errorsRes, handleInputChangeRes, handleUbicacionChangeRes }) => {

    useEffect(() => {
        const inputs = document.querySelectorAll('input');
        inputs.forEach(input => {
            if (input.value.trim() !== "") {
                input.classList.add('con-texto');
            } else {
                input.classList.remove('con-texto');
            }
        });
    }, [formDataRes]);

    return (
        <section>
            <h3>Datos de Responsable</h3>   
            <div className="form-group">
                <label>DNI de Responsable
                    <input
                        type="text"
                        name="dni"
                        value={formDataRes.dni}
                        onChange={handleInputChangeRes}
                    />
                    {errorsRes.dni && <span className="error">{errorsRes.dni}</span>}
                </label>
                <label>Tipo Responsable
                    <select
                        name="tipoResponsable"
                        value={formDataRes.tipoResponsable}
                        onChange={handleInputChangeRes}
                    >
                        <option value="">--Seleccionar--</option>
                        <option value="Padre">Padre</option>
                        <option value="Madre">Madre</option>
                        <option value="Hijo">Hijo</option>
                        <option value="Otros">Otros</option>
                    </select>
                    {errorsRes.tipoResponsable && <span className="error">{errorsRes.tipoResponsable}</span>}
                </label>
            </div>
            <div className="form-group">
                <label>Apellido Paterno
                    <input
                        type="text"
                        name="apePaterno"
                        value={formDataRes.apePaterno}
                        onChange={handleInputChangeRes}
                    />
                    {errorsRes.apePaterno && <span className="error">{errorsRes.apePaterno}</span>}
                </label>
                <label>Apellido Materno
                    <input
                        type="text"
                        name="apeMaterno"
                        value={formDataRes.apeMaterno}
                        onChange={handleInputChangeRes}
                    />
                    {errorsRes.apeMaterno && <span className="error">{errorsRes.apeMaterno}</span>}
                </label>
            </div>
            <label>Nombres
                <input
                    type="text"
                    name="nombres"
                    value={formDataRes.nombres}
                    onChange={handleInputChangeRes}
                />
                {errorsRes.nombres && <span className="error">{errorsRes.nombres}</span>}
            </label>
            <div className="form-group">
                <label>Celular 1
                    <input
                        type="text"
                        name="celular1"
                        value={formDataRes.celular1}
                        onChange={handleInputChangeRes}
                    />
                    {errorsRes.celular1 && <span className="error">{errorsRes.celular1}</span>}
                </label>
                <label>Celular 2
                    <input
                        type="text"
                        name="celular2"
                        value={formDataRes.celular2}
                        onChange={handleInputChangeRes}
                        placeholder='opcional...'
                    />
                </label>
            </div>
            <div className="form-group">
                <label>Localidad
                    <input
                        type="text"
                        name="localidad"
                        value={formDataRes.localidad}
                        onChange={handleInputChangeRes}
                    />
                    {errorsRes.localidad && <span className="error">{errorsRes.localidad}</span>}
                </label>
                <label>Sector
                    <input
                        type="text"
                        name="sector"
                        value={formDataRes.sector}
                        onChange={handleInputChangeRes}
                    />
                </label>
            </div>
            <label>Dirección
                <input
                    type="text"
                    name="direccion"
                    value={formDataRes.direccion}
                    onChange={handleInputChangeRes}
                />
                {errorsRes.direccion && <span className="error">{errorsRes.direccion}</span>}
            </label>
            <UbicacionSelect
                setNameDepa={(valor) => handleUbicacionChangeRes('departamento', valor)}
                setNameProvin={(valor) => handleUbicacionChangeRes('provincia', valor)}
                setNameDistri={(valor) => handleUbicacionChangeRes('distrito', valor)}
            />
        </section>
    )
}

export default RegResponsable