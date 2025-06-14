import React from 'react'
import { useNavigate } from 'react-router-dom'
import '../styles/NotFound.css'

const NotFound = () => {
    const navigate = useNavigate()

    return (
        <div className="notfound-container">
            <img
                src="https://cdn-icons-png.flaticon.com/512/2748/2748558.png"
                alt="404 Not Found"
                className="notfound-image"
            />
            <h1>404</h1>
            <p>Lo sentimos, la página que buscas no existe.</p>
            <button onClick={() => navigate('/')} className="notfound-button">
                Volver al inicio
            </button>
        </div>
    )
}

export default NotFound
