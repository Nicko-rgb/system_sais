import React, { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import './header.css'
import { FaUsers, FaPowerOff, FaUser } from "react-icons/fa";
import { IoMdNotifications } from "react-icons/io";
import { FaUsersGear } from "react-icons/fa6"
import { useNavigate} from 'react-router-dom';
import Notificacion from '../Notificacion/Notificacion';
import headerStore from './headerStore';

const Header = ({active, setActive}) => {

    const [openNoti, setOpenNoti] = useState(false)
    const { logout, user } = useAuth()
    const navigate = useNavigate()
    const { notificaciones, marcarComoLeido, noti, setNoti } = headerStore()

    const handleHeaderClick = (section) => {
        if(section === 'Personales'){
            navigate('/dashboard')
            window.location.reload()
            setActive('Personales')
        }
        localStorage.setItem('activeSection', section)
        setActive(section)
    }

    const handleNavHome = () => {
        navigate('/dashboard')
        window.location.reload()
    }

    return (
        <header className="header">
            <div onClick={handleNavHome} className="header_left">
                <FaUsersGear />
                <p>SAIS - CS. MICAELA BASTIDAS</p>
            </div>
            <p className="header_center">{active}</p>
            <div className="header_right">
                <p className="name">{user.user.nombres}</p>
                <div className='ico-h' onClick={() => handleHeaderClick('Perfil')}>
                    <FaUser />
                    <span className='etique' >Usuario</span>
                </div>
                <div className='ico-h' onClick={() => handleHeaderClick('Personales')}>
                    <FaUsers />
                    <span className='etique' >Personales</span>
                </div>
                <div className='ico-h' style={{position: 'relative'}} onClick={() => setOpenNoti(!openNoti)}>
                    <IoMdNotifications className={noti ? "bell-icon" : ""} />
                    <span className='etique' >Notificaciones</span>
                    {noti && <span className='noti'></span>}
                    {openNoti && <Notificacion close = {() => setOpenNoti(false)} setNoti={setNoti} notificaciones={notificaciones} marcarComoLeido={marcarComoLeido} />}
                </div>
                <div className='ico-h' onClick={() => logout()}>
                    <FaPowerOff />
                    <span className='etique eti-fin'>Cerrar</span>
                </div>
            </div>
        </header>
    )
}

export default Header