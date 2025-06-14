import React, { useEffect } from 'react';
import '../styles/data_paciente.css';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Header from '../components/NavHeader/Header';
import { usePacienteStore } from '../components/Paciente/StorePaciente';
import { BiLinkExternal, BiEditAlt } from "react-icons/bi";
import { RiPlayReverseLargeFill } from "react-icons/ri";
import { AiFillHome } from "react-icons/ai";
import { calcularEdad } from '../utils/dateUtils'

const DataPaciente = () => {
    const { historia } = useParams();
    const navigate = useNavigate();
    const { paciente, loading, fetchPaciente } = usePacienteStore();

    useEffect(() => {
        fetchPaciente(historia);
    }, [historia]);

    const handleEditar = () => {
        navigate(`/edit-pas/${paciente.hist_clinico}`);
    };

    return (
        <div className="paciente">
            <Header active="Datos de Paciente" />
            <h3 className="title-view" style={{ marginTop: '60px' }}>Ficha Clínica del Paciente</h3>
            <div className="ficha-contenedor">
                <AiFillHome onClick={() => navigate('/dashboard')} className='ico-home' />
                <Link onClick={() => navigate(-1)} className='volver_link'><RiPlayReverseLargeFill />Back</Link>

                {loading ? (
                    <div className="loader">Cargando datos...</div>
                ) : paciente ? (
                    <div className="ficha-datos">
                        <section>
                            <h3>Información Personal</h3>
                            <div className="fila">
                                <span className='name'><strong>Nombre completo:</strong> {paciente.ape_paterno} {paciente.ape_materno} {paciente.nombres}</span>
                                <span><strong>DNI:</strong> {paciente.dni}</span>
                                <span><strong>Sexo:</strong> {paciente.sexo}</span>
                            </div>
                            <div className="fila">
                                <span><strong>Fecha de nacimiento:</strong> {new Date(paciente.fecha_nacimiento).toLocaleDateString()}</span>
                                <span><strong>Edad:</strong> {calcularEdad(paciente.fecha_nacimiento)}</span>
                                <span><strong>Tipo de paciente:</strong> {paciente.tipo_paciente}</span>
                            </div>
                        </section>

                        <section>
                            <h3>Contacto y Dirección</h3>
                            <div className="fila">
                                <span><strong>Celular 1:</strong> {paciente.celular1 || '---'}</span>
                                <span><strong>Celular 2:</strong> {paciente.celular2 || '---'}</span>
                                <span></span>
                            </div>
                            <div className="fila">
                                <span><strong>Dirección:</strong> {paciente.direccion || '---'}</span>
                                <span><strong>Sector:</strong> {paciente.sector || '---'}</span>
                                <span><strong>Localidad:</strong> {paciente.localidad || '---'}</span>
                            </div>
                            <div className="fila">
                                <span><strong>Departamento:</strong> {paciente.departamento}</span>
                                <span><strong>Provincia:</strong> {paciente.provincia}</span>
                                <span><strong>Distrito:</strong> {paciente.distrito}</span>
                            </div>
                        </section>

                        <section>
                            <h3>Historia Clínica</h3>
                            <div className="fila">
                                <span><strong>Historia clínica:</strong> {paciente.hist_clinico}</span>
                                <span><strong>CNV Línea:</strong> {paciente.cnv_linea}</span>
                                <span className='discapacidad'><strong>Discapacidad:</strong> {paciente.discapacidad || '---'}</span>
                            </div>
                            <div className="fila">
                                <span><strong>Jefe de familia:</strong> {paciente.is_jefe ? 'Sí' : 'No'}</span>
                                <span><strong>Tiene Responsable:</strong> {paciente.id_responsable ? 'Si' : 'NO'}</span>
                                <span><strong>Fecha de registro:</strong> {new Date(paciente.fechaRegistro).toLocaleString()}</span>
                            </div>
                        </section>
                        {paciente.responsable_paciente ? (
                            <section>
                                <h3>Responsable del Paciente</h3>
                                <div className="fila">
                                    <span><strong>Nombre:</strong> {paciente.responsable_paciente.nombres_res}</span>
                                    <span><strong>Apellido Paterno:</strong> {paciente.responsable_paciente.ape_paterno_res}</span>
                                    <span><strong>Apellido Materno:</strong> {paciente.responsable_paciente.ape_materno_res}</span>
                                </div>
                                <div className="fila">
                                    <span><strong>DNI:</strong> {paciente.responsable_paciente.dni_res}</span>
                                    <span><strong>Parentesco:</strong> {paciente.responsable_paciente.tipo_res} </span>
                                    <span><strong>Celular:</strong> {paciente.responsable_paciente.celular1_res} </span>
                                </div>
                                <button><BiEditAlt /> Editar Datos</button>
                            </section>
                        ) : (
                            <p>No se encontró información del responsable del paciente.</p>
                        )}

                        {paciente.ficha_familiar ? (
                            <section className='ficha-fami'>
                                <h3>Ficha Familiar</h3>
                                <div className="fila">
                                    <span><strong>Código de Ficha:</strong> {paciente.ficha_familiar.codigo_ficha}</span>
                                    <span><strong>Manzana:</strong> {paciente.ficha_familiar.manzana}</span>
                                    <span><strong>Número de Vivienda:</strong> {paciente.ficha_familiar.vivienda_numero}</span>
                                </div>
                                <div className="fila">
                                    <span><strong>Grupo Familiar:</strong> {paciente.ficha_familiar.grupo_familiar}</span>
                                    <span><strong>Jefe Familia:</strong> {paciente.ficha_familiar.jefe_familia}</span>
                                    <span></span>
                                </div>
                                <button onClick={() => window.location.href = `/ficha/${paciente.codigo_ficha}`} >Ver Ficha <BiLinkExternal /></button>
                            </section>
                        ) : (
                            <p>No se encontró información de la ficha familiar.</p>
                        )}
                        <div className="btn-area">
                            <button className="btn-editar" onClick={handleEditar}><BiEditAlt />Editar Datos</button>
                        </div>
                    </div>
                ) : (
                    <p className="alerta">No se encontró información del paciente.</p>
                )}
            </div>
        </div>
    );
};

export default DataPaciente;
