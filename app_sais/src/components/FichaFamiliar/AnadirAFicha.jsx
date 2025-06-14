import React from 'react'
import { LuTextSearch } from "react-icons/lu"
import { FaSearch } from "react-icons/fa"
import { formatearFechaSlash2, formatearFechaConGuion } from '../../utils/dateUtils'
import { FaRegSquareCheck } from "react-icons/fa6"
import { BiSolidArrowFromLeft } from "react-icons/bi"
import { useFichaStore } from './StoreFicha';

const AñadirAFicha = ({ data, onClose, fichas }) => {
    const {
        searchTerm,
        setSearchTerm,
        loading,
        pacienteSearch,
        setPacienteSearch,
        pacienteEncontrado,
        fichaEncontrada,
        buscarPaciente,
        buscarFicha,
        asignarPaciente
    } = useFichaStore();

    const paciente = data || pacienteEncontrado;

    const handleAsignar = async (id_ficha, id_paciente) => {
        const success = await asignarPaciente(id_ficha, id_paciente);
        if (success) onClose();
    }

    const renderPacienteInfo = () => {
        if (!paciente) return null
        return (
            <div className="data">
                <label>DNI: <span>{paciente.dni}</span></label>
                <label>Apellidos y Nombres:
                    <span>{paciente.ape_paterno} {paciente.ape_materno}, {paciente.nombres}</span>
                </label>
                <label>Hist Clínico: <span>{paciente.hist_clinico}</span></label>
                <label>Edad: <span>{paciente.edad}</span></label>
                <label>F Nacimiento: <span>{formatearFechaSlash2(paciente.fecha_nacimiento)}</span></label>
            </div>
        )
    }

    const renderFichaInfo = () => {
        if (!fichaEncontrada) return null
        return (
            <div className="data">
                <label>Código Ficha: <span>{fichaEncontrada.codigo_ficha}</span></label>
                <label>Jefe de Familia: <span>{fichaEncontrada.jefe_familia}</span></label>
                <label>Manzana: <span>{fichaEncontrada.manzana}</span></label>
                <label>Vivienda: <span>{fichaEncontrada.vivienda_numero}</span></label>
                <label>Familia: <span>{fichaEncontrada.grupo_familiar}</span></label>
            </div>
        )
    }

    return (
        <div className='agrega-ficha'>
            <h3 className='title-view'>Agregar a Nueva Ficha Familiar</h3>
            <main>
                <section>
                    <h3>{data ? 'Asignar paciente' : 'Buscar paciente para asignar'}</h3>
                    {!data && (
                        <div className="search">
                            <input
                                type="text"
                                placeholder='Buscar por DNI o Historia'
                                value={pacienteSearch}
                                onChange={(e) => setPacienteSearch(e.target.value)}
                            />
                            <LuTextSearch />
                            <button onClick={() => buscarPaciente(pacienteSearch)}>Buscar <FaSearch /></button>
                        </div>
                    )}
                    {renderPacienteInfo()}
                </section>
                {paciente && (
                    <div className="div">
                        <BiSolidArrowFromLeft />
                    </div>
                )}
                {paciente && (
                    <section>
                        <h3>Buscar ficha familiar</h3>
                        <div className="search">
                            <input
                                type="text"
                                placeholder='Buscar código de ficha...'
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            <LuTextSearch />
                            <button onClick={() => buscarFicha(searchTerm.toUpperCase() )}>Buscar <FaSearch /></button>
                        </div>
                        {renderFichaInfo()}
                    </section>
                )}
            </main>

            <div className="btns">
                <button onClick={() => handleAsignar(fichaEncontrada?.id_ficha, paciente?.id_paciente)} disabled={loading || (!paciente || !fichaEncontrada)}>
                    <FaRegSquareCheck /> {loading ? 'Asignando...' : 'Asignar a Ficha'}
                </button>
                <button onClick={onClose} disabled={loading}>Cancelar</button>
            </div>
        </div>
    )
}

export default AñadirAFicha
