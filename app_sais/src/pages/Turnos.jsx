import React, { useState, useEffect } from "react";
import '../styles/turnos.css';
import { RiPlayReverseLargeFill, RiPaintFill } from "react-icons/ri";
import { Link, useNavigate } from "react-router-dom";
import { MdPersonSearch, MdNavigateNext, MdNavigateBefore } from "react-icons/md";
import { RxExternalLink } from "react-icons/rx";
import { RiResetLeftFill } from "react-icons/ri";
import { BsCheckAll } from "react-icons/bs";
import { FiBarChart2 } from "react-icons/fi";
import { CiFilter } from "react-icons/ci";
import Header from '../components/NavHeader/Header'
import CuerpoTabla from "../components/Turnos/CuerpoTabla";
import { useAuth } from '../context/AuthContext';
import InfoTurno from "../components/Turnos/InfoTurno";
import { LeyendasTurno } from "../components/Turnos/Mini";
import useStoreTurno from "../components/Turnos/StoreTurno";
// import ReporteTurnos from "../components/Turnos/ReporteTurnos";
// import EditColor from "../components/Turnos/EditColor";

const ReporteTurnos = React.lazy(() => import('../components/Turnos/ReporteTurnos'));
const EditColor = React.lazy(() => import('../components/Turnos/EditColor'));

const Turnos = () => {
    const navigate = useNavigate();
    const { personales, mesActual, manejarMesAnterior, manejarMesSiguiente, cargando,
        condicionFiltro, profesionFiltro, filtroCondicion,
        setFiltroCondicion, columnasBloqueadas, columnaSeleccionada, setColumnaSeleccionada,
        manejarBloqueoColumna, manejarSeleccionColumna, manejarGuardarTurno, manejarRestablecerTurnos,
        turnos, tiposDeTurno, editOpen, setEditOpen } = useStoreTurno()
    const [openReport, setOpenReport] = useState(false)
    const [checkCitas, setCheckCitas] = useState(false)
    const [busqueda, setBusqueda] = useState('');
    const [personalSeleccionado, setPersonalSeleccionado] = useState(null);
    const [modalAbierto, setModalAbierto] = useState(false);
    const { user } = useAuth()
    const tipoUser = user.user.tipo_user


    const obtenerFechasDelMes = (fecha) => {
        const anio = fecha.getFullYear();
        const mes = fecha.getMonth();
        const primerDia = new Date(anio, mes, 1);
        const ultimoDia = new Date(anio, mes + 1, 0);
        const fechas = [];

        for (let dia = new Date(primerDia); dia <= ultimoDia; dia.setDate(dia.getDate() + 1)) {
            fechas.push(new Date(dia));
        }
        return fechas;
    };

    const fechasDelMes = obtenerFechasDelMes(mesActual);

    const personalesFiltrados = personales.filter(personal => {
        const coincideBusqueda = `${personal.paterno} ${personal.materno} ${personal.nombres}`.toLowerCase().includes(busqueda.toLowerCase()) ||
            personal.dni.includes(busqueda);
        const coincideCondicion = filtroCondicion === 'Todos' || personal.condicion === filtroCondicion || personal.profesion === filtroCondicion;
        const personalCitado = checkCitas ? personal.especial_cita : true;
        return coincideBusqueda && coincideCondicion && personalCitado && coincideBusqueda;
    });

    const activosFiltrados = personalesFiltrados.filter(personal =>
        (personal.estado || '').toLowerCase() === 'activo' &&
        (personal.tipo_personal || '').toLowerCase() !== 'administrativo'
    );

    const manejarClickPersonal = (personal, event) => {
        const { top, right } = event.currentTarget.getBoundingClientRect();
        setPersonalSeleccionado(personal);
        setModalAbierto(true);
        setColumnaSeleccionada(null)
        setModalPosicion({ top: top + window.scrollY, left: right }); // Posiciona a la derecha
    };

    // Añade un estado para la posición del modal
    const [modalPosicion, setModalPosicion] = useState({ top: 0, left: 0 });

    const cerrarModal = () => {
        setModalAbierto(false);
        setPersonalSeleccionado(null);
    };

    useEffect(() => {
        manejarRestablecerTurnos()
    }, [])

    const obtenerClaveTurno = (id_turno_tipo) => {
        const turno = tiposDeTurno.find(t => t.id_turno_tipo === id_turno_tipo);
        return turno ? turno.clave_turno : '';
    };

    const handleCheckCita = () => {
        setCheckCitas(!checkCitas)
    }

    const handleCloseModals = () => {
        setModalAbierto(false)
        setPersonalSeleccionado(null)
        setColumnaSeleccionada(null)
    }

    const handleNavigateExport = () => {
        navigate('/exportar-turnos')
        window.location.reload()
    }

    return (
        <div className="turnos-personal" onClick={handleCloseModals}>
            <Header active='Turnos' />
            <main>
                <h3 className="title-view"  >TABLA DE TURNOS DE PERSONAL</h3>
                <section>
                    <div className="acciones">
                        <Link onClick={() => navigate(-1)} className='volver_link'>
                            <RiPlayReverseLargeFill /> Back
                        </Link>
                        <input
                            className='buscar-personal'
                            placeholder="Buscar por nombre, apellidos o DNI"
                            value={busqueda}
                            onChange={(e) => setBusqueda(e.target.value)}
                        />
                        <MdPersonSearch className='ico_buscar' />
                        <div className="filtros">
                            <button className="btn-filtro"><CiFilter style={{strokeWidth: 1}} className='ico' />Condición</button>
                            <div className="filtro">
                                <span onClick={() => setFiltroCondicion('Todos')}>TODOS</span>
                                {condicionFiltro.map((condicion, index) => (
                                    condicion && (
                                        <span key={index} onClick={() => setFiltroCondicion(condicion)} >{condicion}</span>
                                    )
                                ))}
                            </div>
                        </div>
                        <div className="filtros">
                            <button className="btn-filtro"><CiFilter style={{strokeWidth: 1}} className='ico' />Profesión</button>
                            <div className="filtro">
                                <span onClick={() => setFiltroCondicion('Todos')}>TODOS</span>
                                {profesionFiltro.map((profesion, index) => (
                                    profesion && (
                                        <span key={index} onClick={() => setFiltroCondicion(profesion)} >{profesion}</span>
                                    )
                                ))}
                            </div>
                        </div>
                        <label onClick={handleCheckCita} htmlFor="chec" className="switch">
                            <input checked={checkCitas} name="chec" type="checkbox" />
                            <span className="slider"></span>
                            <p>Con Citas</p>
                        </label>
                        <div className="fecha-cambiar">
                            {/* <button type="button" onClick={manejarMesAnterior}><MdNavigateBefore className="ico-cambiar" />Mes Anterior</button>
                            <button type="button" onClick={manejarMesSiguiente}>Mes Siguiente <MdNavigateNext className="ico-cambiar" /></button> */}
                            <button className="btns-export" type="button" onClick={handleNavigateExport}><RxExternalLink className="icoExport" />Exportar</button>
                            <button onClick={() => setEditOpen(true)} ><RiPaintFill style={{fontSize: 16}} />Color</button>
                            <button onClick={() => setOpenReport(true)} ><FiBarChart2 style={{fontSize: 17}} />Reportes</button>
                        </div>
                    </div>
                    <div className="inf">
                        <div>
                            <p>{mesActual.toLocaleString('es-ES', { month: 'long', year: 'numeric' })}</p>
                            <p className="contador"> {filtroCondicion}: {activosFiltrados.length} de {personales.length} </p>
                        </div>
                        <div>
                            {/* <button className="btn-a b-save" >Guardar <BsCheckAll /></button>
                            <button className="btn-a b-reset" >Resetear<RiResetLeftFill /></button>
                            <hr /> */}
                            <button type="button" onClick={manejarMesAnterior}><MdNavigateBefore className="ico-cambiar" />Mes Anterior</button>
                            <button type="button" onClick={manejarMesSiguiente}>Mes Siguiente <MdNavigateNext className="ico-cambiar" /></button>
                        </div>
                    </div>
                    {cargando ? (
                        <p className="loader-tur"> <span></span> Cargando datos...</p>
                    ) : (
                        <div className="tbl">
                            <table>
                                <thead>
                                    <tr>
                                        <th>N°</th>
                                        <th className="cab">Personal</th>
                                        {fechasDelMes.map((fecha, index) => {
                                            const diaSemana = fecha.toLocaleString('es-ES', { weekday: 'short' });
                                            const numeroDia = fecha.getDate();
                                            const esDomingo = fecha.getDay() === 0;
                                            const esHoy = fecha.toDateString() === new Date().toDateString();

                                            const columnaBloqueada = columnasBloqueadas.includes(fecha.toDateString());

                                            return (
                                                <th
                                                    key={index}
                                                    style={{ zIndex: 99 }}
                                                    className={`${esDomingo ? 'domingo' : ''} ${esHoy ? 'hoy' : ''} ${columnaBloqueada ? 'bloqueada' : ''}`}
                                                    onClick={(e) => (manejarSeleccionColumna(fecha.toDateString()))(e.stopPropagation())} // Usar la fecha como clave
                                                >
                                                    {diaSemana.charAt(0).toUpperCase()}-{numeroDia}
                                                    {columnaSeleccionada === fecha.toDateString() && (
                                                        tipoUser.toLowerCase() !== 'responsable' && (
                                                            <div className="accion-cabeza">
                                                                <div className="balloon">
                                                                    <p>ACCIONES</p>
                                                                    <button className={columnaBloqueada ? 'ss' : 'nn'} onClick={() => manejarBloqueoColumna(fecha.toDateString())}>
                                                                        {columnaBloqueada ? 'Desbloquear' : 'Bloquear'}
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        )
                                                    )}
                                                </th>
                                            );

                                        })}
                                        <th>Hrs</th>
                                    </tr>
                                </thead>
                                <CuerpoTabla
                                    activosFiltrados={activosFiltrados}
                                    fechasDelMes={fechasDelMes}
                                    tiposDeTurno={tiposDeTurno}
                                    obtenerClaveTurno={obtenerClaveTurno}
                                    turnos={turnos}
                                    manejarClickPersonal={manejarClickPersonal}
                                    columnasBloqueadas={columnasBloqueadas}
                                    manejarGuardarTurno={manejarGuardarTurno}
                                    mesActual={mesActual}
                                />
                            </table>
                        </div>
                    )}
                </section>
            </main>
            {modalAbierto && personalSeleccionado && (
                <div style={{
                    position: 'absolute',
                    top: modalPosicion.top,
                    left: modalPosicion.left,
                    transform: 'translate(0, 0)',
                    zIndex: 1000,
                }}>
                    <InfoTurno
                        personals={personalSeleccionado}
                        cerrarModal={cerrarModal}
                    />
                </div>
            )}
            {!cargando && (
                <LeyendasTurno tiposDeTurno={tiposDeTurno} />
            )}
            {openReport && (
                <>
                    <ReporteTurnos
                        activosFiltrados={activosFiltrados}
                        turnos={turnos}
                        tiposDeTurno={tiposDeTurno}
                        mesActual={mesActual}
                        columnasBloqueadas={columnasBloqueadas}
                        onClose={() => setOpenReport(false)}
                    />
                </>
            )}
            {editOpen && <EditColor close={() => setEditOpen(false)} />}
        </div>
    );
};

export default Turnos;