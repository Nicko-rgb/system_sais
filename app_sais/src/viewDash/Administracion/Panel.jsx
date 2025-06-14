import React, { useState } from 'react'
import './panel.css'
import { MdOutlineViewInAr, MdOutlineCleaningServices } from "react-icons/md";
import { TbExchange } from "react-icons/tb";
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import axios from 'axios';
import { useConfig } from '../../context/ConfigContext';
// Components for citas
import Especialidad from '../../components/Administracion/Citas/Especiliadad';
import Horarios from '../../components/Administracion/Citas/Horarios';
import Otros1 from '../../components/Administracion/Citas/Otros';

// conponents for turnos
import ProfeServi from '../../components/Administracion/Turnos/ProfeServi';
import AddTurno from '../../components/Administracion/Turnos/AddTurno';
import Otros2 from '../../components/Administracion/Turnos/Otros';

const Panel = () => {

    const [render, setRender] = useState(null);
    const API_URL = import.meta.env.VITE_API_URL;
    const { dniHistoriaValue, fetchConfigs } = useConfig();

    const handleTab = (tab) => {
        setRender(tab);
        if (render) {
            setRender(null);
        }
    }

    const handleClose = () => {
        setRender(null);
    }

    const handleDeleteTurnosPasados = () => {
        setRender(null);
        Swal.fire({
            title: '¿Estás seguro?',
            html: "Esto eliminará todas los turnos de los personales creados desde el mes anterior. <strong>No podrás revertir esto!</strong>",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Sí, eliminar!',
            cancelButtonText: 'Cancelar'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const response = await fetch(`${API_URL}/api/eliminar-turnos-pasados`, {
                        method: 'DELETE'
                    });

                    const data = await response.json();

                    if (response.ok) {
                        toast.success(data.message);
                    } else {
                        toast.error(data.message);
                    }
                } catch (error) {
                    toast.error("Ocurrió un error al eliminar los turnos.");
                    console.error(error);
                }
            }
        });
    };

    const handleDniHistoria = async () => {
        const result = await Swal.fire({
            title: '¿Estás seguro?',
            html: `Esto cambiará la configuración de uso ${dniHistoriaValue ? 'del DNI e Historia clínica por separado.' : 'del DNI como historia clínica.'}`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sí, continuar',
            cancelButtonText: 'Cancelar'
        });
    
        if (result.isConfirmed) {
            try {
                const response = await axios.put(`${API_URL}/api/configuracion/dni-historia/toggle`);
                toast.success(`Configuración actualizada: ${response.data.nuevoValor ? 'Activado' : 'Desactivado'}`);
    
                // Puedes recargar los configs si es necesario aquí
                fetchConfigs();
            } catch (error) {
                console.error('Error al alternar configuración:', error);
                toast.error('No se pudo actualizar la configuración');
            }
        }
    };
    

    return (
        <div className='admin-panel' >
            {render ? (
                render
            ) : (
                <>
                    <h5>Opciones de Citas</h5>
                    <div className="cards">
                        <aside className="card">
                            <div>
                                <h4>Crear Especialidad</h4>
                                <p>Agrega una nueva especialidad para atención en citas.</p>
                            </div>
                            <button onClick={() => handleTab(<Especialidad onClose={handleClose} />)} >Acceder <MdOutlineViewInAr /> </button>
                        </aside>
                        <aside className="card">
                            <div>
                                <h4>Modificar Horarios</h4>
                                <p>Agrega, modifíca o elimina horarios para cada especialidad de citas.</p>
                            </div>
                            <button onClick={() => handleTab(<Horarios onCLose={handleClose} />)} >Acceder <MdOutlineViewInAr /> </button>
                        </aside>
                        <aside className="card">
                            <div>
                                <h4>Otras Configuracion</h4>
                                <p>Inactiva especialidades en citas, limpia todas las citas creadas</p>
                            </div>
                            <button onClick={() => handleTab(<Otros1 onclose={handleClose} />)} >Acceder <MdOutlineViewInAr /> </button>
                        </aside>
                    </div>
                    <hr />
                    <h5>Opciones de Personal y Turnos</h5>
                    <div className="cards">
                        <aside className="card">
                            <div>
                                <h4>Modificar Profesiones y Servicios</h4>
                                <p>Edita profesiones y servicios registrados en el sistema.</p>
                            </div>
                            <button onClick={() => handleTab(<ProfeServi onClose={handleClose} />)} >Acceder <MdOutlineViewInAr /> </button>
                        </aside>
                        <aside className="card">
                            <div>
                                <h4>Gestión de Turnos Históricos</h4>
                                <p>Elimina turnos anteriores al mes actual para optimizar el rendimiento del sistema y liberar recursos de almacenamiento.</p>
                            </div>
                            <button onClick={() => handleDeleteTurnosPasados()}>
                                Limpiar <MdOutlineCleaningServices />
                            </button>
                        </aside>

                    </div>
                    <hr />
                    <h5>PACIENTES Y ADMINSION</h5>
                    <div className="cards">
                        <aside className="card">
                            <div>
                                <h4>DNI a Historia Clínica</h4>
                                <p>{dniHistoriaValue ? 'Separar el DNI de paciente e Historia clínica.' : 'Establecer el DNI de paciente como historia clínica.'} </p>
                            </div>
                            <button onClick={() => handleDniHistoria()} >Cambiar <TbExchange /> </button>
                        </aside>
                    </div>
                </>
            )}

        </div>
    )
}

export default Panel