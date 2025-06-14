import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import '../styles/dashboard.css';
import { useNavigate } from 'react-router-dom';
import { FaBars, FaArrowAltCircleRight } from "react-icons/fa";
import { RiLogoutCircleRLine } from "react-icons/ri";

import { GoHome } from "react-icons/go";
import { MdFamilyRestroom } from "react-icons/md";
import { FaRegCalendarCheck } from "react-icons/fa";
import { LuMapPinned } from "react-icons/lu";
import { RiTimerLine } from "react-icons/ri";
import { TiInputChecked } from "react-icons/ti";
import { HiOutlineUsers } from "react-icons/hi2";
import { CiUser } from "react-icons/ci";
import { MdOutlineAdminPanelSettings } from "react-icons/md";

import HeaderNav from '../components/NavHeader/Header';
import Loading from '../components/Loading/Loading';
import Admision from '../viewDash/Admision/Admision';
import PanelCita from '../viewDash/Citas/PanelCita';
import Personales from '../viewDash/Personales/Personales';
import FichaFamiliar from '../viewDash/Ficha/FichaFamiliar';
import Acreditacion from '../viewDash/Acreditacion';
import Pefil from '../viewDash/Perfil/Pefil';
import Panel from '../viewDash/Administracion/Panel';
// import Notificaciones from '../viewDash/Notificaciones/Notificaciones';

const Dashboard = () => {
    const { user, loading, logout } = useAuth(); // Ahora también traemos loading
    const navigate = useNavigate();

    const [active, setActive] = useState(() => {
        return localStorage.getItem('activeSection') || 'Admisión';
    });
    const [localLoading, setLocalLoading] = useState(true); // Para carga entre cambios de secciones
    const [formActive, setFormActive] = useState(false);
    const [activeMenu, setActiveMenu] = useState(true);
    const [fichaView, setFichaView] = useState(false);
    const [pacientesData, setPacienteData] = useState(null)

    const menus = [
        { icon: <GoHome strokeWidth={1} />, text1: 'Admisión', text2: '', componente: <Admision formActive={formActive} setFormActive={setFormActive} setFichaView={setFichaView} setPacienteData={setPacienteData} /> },
        { icon: <MdFamilyRestroom />, text1: 'Ficha Familiar', text2: '', etiqueta: 'Vista de familias', componente: <FichaFamiliar data={pacientesData} viewOpcion={fichaView} setData={setPacienteData} setViewOpcion={setFichaView} /> },
        { icon: <FaRegCalendarCheck />, text1: 'Citas', text2: 'Otorga citas', etiqueta: 'Solo a niños', componente: <PanelCita /> },
        { icon: <LuMapPinned strokeWidth={2.2} />, text1: 'Sectores', text2: 'Ver mapa', etiqueta: 'Mapa SAIS', componente: '' },
        { icon: <RiTimerLine strokeWidth={.5} />, text1: 'Turnos', text2: 'Ver Turnos', etiqueta: 'Turnos de personales', componente: '' },
        { icon: <TiInputChecked style={{ fontSize: '1.5rem', padding: '0' }} />, text1: 'Acreditación', text2: '', etiqueta: <Acreditacion />, },
        { icon: <HiOutlineUsers strokeWidth={2.2} />, text1: 'Personales', text2: '', etiqueta: 'Todos los personales', componente: <Personales openForm={formActive} setOpenForm={setFormActive} /> },
        { icon: <CiUser strokeWidth={1.5} />, text1: 'Perfil', text2: '', etiqueta: '', componente: <Pefil /> },
    ];
    // Agregar opción "Administración" si el usuario es admin
    if (user?.user?.tipo_user?.toLowerCase() === 'admin') {
        menus.push({
            icon: <MdOutlineAdminPanelSettings />,
            text1: 'Administración',
            text2: '',
            etiqueta: '',
            componente: <Panel />
        });
    }

    const renderComponenteActivo = () => {
        const menuActivo = menus.find(menu => menu.text1 === active);
        return menuActivo?.componente || <Admision />;
    };

    useEffect(() => {
        if (fichaView && pacientesData) {
            setActive('Ficha Familiar');
            localStorage.setItem('activeSection', 'Ficha Familiar');
            setFormActive(false);
        }

        // Cada vez que cambie el menú activo, mostramos el Loading interno
        setLocalLoading(true);
        const timer = setTimeout(() => {
            setLocalLoading(false);
        }, 500);

        return () => clearTimeout(timer);
    }, [active, fichaView, pacientesData]);


    // Protege mientras se carga la sesión
    if (loading) return <Loading message="Verificando sesión..." />;

    if (!user) {
        window.location.href = '/';
        return null;
    }

    const handleNaveggacion = (menu) => {
        if (menu === 'Sectores') {
            localStorage.setItem('activeSection', 'Admisión');
            navigate('/maps-sais');
        }
        if (menu === 'Turnos') {
            localStorage.setItem('activeSection', 'Admisión');
            navigate('/turnos-sais');
        }
    }

    return (
        <div className='dashboard'>
            {/* Header */}
            <HeaderNav active={active} setActive={setActive} user={user} />

            {/* Menú lateral */}
            <section className={`menus ${activeMenu ? '' : 'menus-oculto'}`}>
                <h4>Menú <FaBars title='Ocultar/Mostrar menú' onClick={() => setActiveMenu(!activeMenu)} /></h4>
                {menus.map((menu, index) => (
                    <aside
                        key={index}
                        className={`item-menu ${active === menu.text1 ? 'active' : ''}`}
                        onClick={() => {
                            setActive(menu.text1);
                            localStorage.setItem('activeSection', menu.text1);
                            handleNaveggacion(menu.text1);
                            setFormActive(false);
                            setPacienteData(null);
                            setFichaView(false);
                        }}
                    >
                        {menu.icon}
                        <p className='item-text1'>{menu.text1}</p>
                        <p className='item-text2'>{menu.text2}</p>
                        {menu.etiqueta && <div className='etique-item'>{menu.etiqueta}</div>}
                    </aside>
                ))}
                <button onClick={() => logout()} className='close-sesion'><RiLogoutCircleRLine />Cerrar Sesión</button>
            </section>

            {/* Botón para abrir menú si está oculto */}
            {!activeMenu && (
                <FaArrowAltCircleRight onClick={() => setActiveMenu(true)} className='arrow-active' />
            )}

            {/* Contenido principal */}
            <main className={`${activeMenu ? '' : 'main-1'}`}>
                {localLoading ? (<Loading message={'Cargando datos...'} />) : (renderComponenteActivo())}
            </main>
        </div>
    );
};

export default Dashboard;

