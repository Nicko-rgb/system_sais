import React, { useState, useEffect } from 'react';
import '../styles/fichaFamiliar.css';
import { useParams } from 'react-router-dom';
import Header from '../components/NavHeader/Header';
import Cabeza from '../components/FichaFamiliar/Cabeza';
import { useFichaStore } from '../components/FichaFamiliar/StoreFicha'
import { RiDeleteBin6Line } from "react-icons/ri";
import { FaUserCheck } from "react-icons/fa";

const FichaFamiliar = () => {
    const { codigo } = useParams();
    const [searchTerm, setSearchTerm] = useState('');
    const { deletePacienteFicha, fichaEncontrada, loading, buscarFicha, handleAsignarJefe } = useFichaStore()

    // Filtrar pacientes por nombre, apellido o DNI (usando el searchTerm)
    const pacientesFiltrados = fichaEncontrada?.pacientes?.filter(p =>
        `${p.nombres} ${p.ape_paterno} ${p.ape_materno}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.dni?.toString().includes(searchTerm)
    );

    useEffect(() => {
        buscarFicha(codigo);
    }, [fichaEncontrada]);

    return (
        <div className='ficha-familiar'>
            <Header active={'Ficha Familiar'} />
            <h3 className='title-view' style={{ marginTop: '60px' }} >Ficha Familiar: {codigo}</h3>
            <Cabeza data={fichaEncontrada} setSearchTerm={setSearchTerm} />

            <main>
                <p className='txt'>Miembros de Familia</p>
                {loading ? (
                    <div><div className="ico-gira-loader"></div> Cargando...</div>
                ) : fichaEncontrada ? (
                    <table>
                        <thead>
                            <tr>
                                <th>N°</th>
                                <th>DNI</th>
                                <th>Hist. Clínica</th>
                                <th>Nombre</th>
                                <th>Apellido</th>
                                <th>Edad</th>
                                <th>Tipo Paciente</th>
                                <th>Teléfono</th>
                                <th>Dirección</th>
                                <th>Jefe Hogar</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {pacientesFiltrados.length > 0 ? (
                                pacientesFiltrados.map((p, index) => (
                                    <tr key={p.id_paciente}>
                                        <td>{index + 1}</td>
                                        <td>{p.dni}</td>
                                        <td>{p.hist_clinico}</td>
                                        <td>{p.nombres}</td>
                                        <td>{`${p.ape_paterno} ${p.ape_materno}`}</td>
                                        <td>{p.edad}</td>
                                        <td>{p.tipo_paciente} </td>
                                        <td>{p.celular1}</td>
                                        <td>{p.direccion}</td>
                                        <td>{p.is_jefe ? 'Sí' : 'No'}</td>
                                        <td className='acc'>
                                            <div>
                                                <RiDeleteBin6Line onClick={() => deletePacienteFicha(p.id_paciente)} className='ico-del' />
                                                <p>Eliminar</p>
                                            </div>
                                            {!p.is_jefe &&
                                                <div>
                                                    <FaUserCheck onClick={() => handleAsignarJefe(p.id_paciente, fichaEncontrada.id_ficha )} className='ico-jefe' />
                                                    <p>Asignar Jefe</p>
                                                </div>
                                            }
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="11">No se encontraron familias para esta ficha.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                ) : (
                    <p>Ficha no encontrada.</p>
                )}
            </main>
        </div>
    );
};

export default FichaFamiliar;
