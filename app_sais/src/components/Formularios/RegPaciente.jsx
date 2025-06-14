import React, { useEffect } from 'react'
import './form_paciente.css'
import { MdCloudUpload } from "react-icons/md";
import RegResponsable from './RegResponsable'
import UbicacionSelect from '../../components/Selects/UbicaCionSelect'
import { useFormPaciente } from './LogicRegPas';
import SelectHistoria from '../../components/Admision/SelectHistoria';

const RegPaciente = ({ closeForm }) => {

    const { formData, errors, handleInputChange, handleSubmit, handleUbicacionChange, formDataRes, errorsRes, handleInputChangeRes, handleUbicacionChangeRes, msg } = useFormPaciente()
    const sectores = ['Sector 1', 'Sector 2', 'Sector 3', 'Sector 4', 'Sector 5', 'Sector 6', 'Sector 7', 'Sector 8', 'Sector 9']

    useEffect(() => {
        const inputs = document.querySelectorAll('input');
        inputs.forEach(input => {
            if (input.value.trim() !== "") {
                input.classList.add('con-texto');
            } else {
                input.classList.remove('con-texto');
            }
        });


    }, [formData]);


    return (
        <div className='form_paciente'>
            <form onSubmit={handleSubmit}>
                <div>
                    <section>
                        <h3>Datos del Nuevo Paciente</h3>
                        <aside>
                            <div className='form-group'>
                                <label>DNI del Paciente
                                    <input
                                        type="text"
                                        name="dni"
                                        value={formData.dni}
                                        onChange={handleInputChange}
                                        maxLength={8}
                                        title='INGRESE DNI VALIDO DE 8 DIGITOS '
                                    />
                                    {errors.dni && <span className="error">{errors.dni}</span>}
                                </label>
                                <label>CNV Linea
                                    <input
                                        type="text"
                                        name="cnv"
                                        value={formData.cnv}
                                        onChange={handleInputChange}
                                    />
                                </label>
                                <SelectHistoria
                                    value={formData.histClinico}
                                    onChange={handleInputChange}
                                    error={errors.histClinico}
                                    dniValue={formData.dni}
                                />
                            </div>
                            <div className='form-group'>
                                <label>Apellido Paterno
                                    <input
                                        type="text"
                                        name="apePaterno"
                                        value={formData.apePaterno}
                                        onChange={handleInputChange}
                                    />
                                    {errors.apePaterno && <span className="error">{errors.apePaterno}</span>}
                                </label>
                                <label>Apellido Materno
                                    <input
                                        type="text"
                                        name="apeMaterno"
                                        value={formData.apeMaterno}
                                        onChange={handleInputChange}
                                    />
                                    {errors.apeMaterno && <span className="error">{errors.apeMaterno}</span>}
                                </label>
                            </div>
                            <label>Nombres
                                <input
                                    type="text"
                                    name="nombres"
                                    value={formData.nombres}
                                    onChange={handleInputChange}
                                />
                                {errors.nombres && <span className="error">{errors.nombres}</span>}
                            </label>
                            <div className='form-group'>
                                <label>Fecha de Nacimiento
                                    <input
                                        type="date"
                                        name="fechaNacimiento"
                                        value={formData.fechaNacimiento}
                                        onChange={handleInputChange}
                                    />
                                    {errors.fechaNacimiento && <span className="error">{errors.fechaNacimiento}</span>}
                                </label>
                                <label>Edad
                                    <input
                                        type="text"
                                        value={formData.edad}
                                        disabled
                                    />
                                </label>
                                <label className='sexo'>Sexo
                                    <div>
                                        <label>
                                            <input
                                                type="radio"
                                                name="sexo"
                                                value="Masculino"
                                                checked={formData.sexo === 'Masculino'}
                                                onChange={handleInputChange}
                                            />
                                            Masculino
                                        </label>
                                        <label>
                                            <input
                                                type="radio"
                                                name="sexo"
                                                value="Femenino"
                                                checked={formData.sexo === 'Femenino'}
                                                onChange={handleInputChange}
                                            />
                                            Femenino
                                        </label>
                                    </div>
                                    {errors.sexo && <span className="error">{errors.sexo}</span>}
                                </label>
                            </div>
                            <div className="form-group">
                                <label className='discapacidad'>
                                    <input
                                        type="checkbox"
                                        name="discapacidad"
                                        checked={formData.discapacidad}
                                        onChange={handleInputChange}
                                    />
                                    Tienes discapacidad?
                                </label>
                                {formData.discapacidad && (
                                    <label>Discapacidad
                                        <input
                                            type="text"
                                            name="tipoDiscapacidad"
                                            value={formData.tipoDiscapacidad}
                                            onChange={handleInputChange}
                                        />
                                    </label>
                                )}
                            </div>

                            {/* Renderizar solo si es mayor de 18 años */}
                            {formData.edad >= 18 && (
                                <div className='mayor'>
                                    <div className="form-group">
                                        <label>Celular 1
                                            <input
                                                type="text"
                                                name="celular1"
                                                value={formData.celular1}
                                                onChange={handleInputChange}
                                            />
                                        </label>
                                        <label>Celular 2
                                            <input
                                                type="text"
                                                name="celular2"
                                                value={formData.celular2}
                                                onChange={handleInputChange}
                                                placeholder='opcional...'
                                            />
                                        </label>
                                    </div>
                                    <div className="form-group">
                                        <label>Localidad
                                            <input
                                                type="text"
                                                name="localidad"
                                                value={formData.localidad}
                                                onChange={handleInputChange}
                                            />
                                            {errors.localidad && <span className="error">{errors.localidad}</span>}
                                        </label>
                                        <label>
                                            Sector
                                            <select
                                                name="sector"
                                                value={formData.sector}
                                                onChange={handleInputChange}
                                            >
                                                <option value="">--Ninguno--</option>
                                                {sectores.map((sector, index) => (
                                                    <option key={index} value={sector}>{sector}</option>
                                                ))}
                                            </select>
                                            {errors.sector && <span className="error">{errors.sector}</span>}
                                        </label>
                                    </div>
                                    <label>Dirección
                                        <input
                                            type="text"
                                            name="direccion"
                                            value={formData.direccion}
                                            onChange={handleInputChange}
                                        />
                                        {errors.direccion && <span className="error">{errors.direccion}</span>}
                                    </label>
                                    <UbicacionSelect
                                        setNameDepa={(valor) => handleUbicacionChange('departamento', valor)}
                                        setNameProvin={(valor) => handleUbicacionChange('provincia', valor)}
                                        setNameDistri={(valor) => handleUbicacionChange('distrito', valor)}
                                    />
                                </div>
                            )}
                            <label className='discapacidad'>
                                <input
                                    type="checkbox"
                                    name="tieneResponsable"
                                    checked={formData.tieneResponsable}
                                    onChange={handleInputChange}
                                />
                                Tienes Responsable?
                            </label>
                        </aside>
                    </section>
                    {formData.tieneResponsable && (
                        <RegResponsable
                            formDataRes={formDataRes}
                            errorsRes={errorsRes}
                            handleInputChangeRes={handleInputChangeRes}
                            handleUbicacionChangeRes={handleUbicacionChangeRes}
                        />
                    )}
                </div>
                <p className='msgg'>{msg} </p>
                <div className="btns">
                    <button type="submit" className='btn-submit'>Guardar<MdCloudUpload /></button>
                    <button type="button" className='btn-cancel' onClick={() => closeForm(false)}>Cancelar</button>
                </div>
            </form>
        </div>
    )
}

export default RegPaciente