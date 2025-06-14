import React from 'react'
import Store from '../../../utils/storeCitaTurno';
import '../../../styles/panelAdmin.css';
import { IoCaretBackOutline } from "react-icons/io5";
import Swal from 'sweetalert2';

const ProfeServi = ({ onClose }) => {
    const { profesiones, servicios, fetchOptionsProfesServi } = Store();
    const API_URL = import.meta.env.VITE_API_URL;

    const handleEditar = async (tipo, item) => {
        const { value: nuevoNombre } = await Swal.fire({
            title: `Editar ${tipo}`,
            input: 'text',
            inputLabel: 'Nuevo nombre',
            inputValue: item.nombre_profesion || item.nombre_servicio,
            showCancelButton: true,
            confirmButtonText: 'Continuar',
            cancelButtonText: 'Cancelar',
            inputValidator: (value) => {
                if (!value) {
                    return 'El nombre no puede estar vacío';
                }
            }
        });

        if (
            nuevoNombre &&
            nuevoNombre !== item.nombre_profesion &&
            nuevoNombre !== item.nombre_servicio
        ) {
            const confirm = await Swal.fire({
                title: '¿Estás seguro?',
                html: `Esto afectará a ${item.num_asociados} personales asociados a este ${tipo}.`,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Sí, actualizar',
                cancelButtonText: 'Cancelar'
            });

            if (confirm.isConfirmed) {
                try {
                    const endpoint = tipo === 'profesión'
                        ? `${API_URL}/api/editar/profesion/`
                        : `${API_URL}/api/editar/servicio/`;
                    const id = item.id_profesion || item.id_servicio;

                    const res = await fetch(`${endpoint}${id}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ nombre: nuevoNombre }),
                    });

                    if (!res.ok) throw new Error('Error al editar');

                    Swal.fire('Editado', `${tipo} actualizada con éxito`, 'success');
                    fetchOptionsProfesServi(); // Recargar datos
                } catch (error) {
                    Swal.fire('Error', `No se pudo editar ${tipo}`, 'error');
                }
            }
        }
    };

    const handleEliminar = async (tipo, item) => {
        
        if (item.num_asociados > 0) {
            Swal.fire('No permitido', `${tipo} tiene elementos asociados y no puede ser eliminada`, 'warning');
            return;
        }   

        const confirm = await Swal.fire({
            title: `¿Eliminar ${tipo} - ${item.nombre_profesion || item.nombre_servicio} ?`,
            text: `Esta acción no se puede deshacer.`,
            html: `Esto afectará a <strong>${item.num_asociados}</strong> personales asociados, su ${tipo} se asignaran como <strong>NULO</strong>.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        });       

        if (confirm.isConfirmed) {
            try {
                const endpoint = tipo === 'profesión'
                    ? `${API_URL}/api/eliminar/profesion/`
                    : `${API_URL}/api/eliminar/servicio/`;
                const id = item.id_profesion || item.id_servicio;

                const res = await fetch(`${endpoint}${id}`, {
                    method: 'DELETE',
                });

                if (!res.ok) throw new Error('Error al eliminar');

                Swal.fire('Eliminado', `${tipo} eliminada correctamente`, 'success');
                fetchOptionsProfesServi(); // Recargar datos
            } catch (error) {
                Swal.fire('Error', `No se pudo eliminar ${tipo}`, 'error');
            }
        }
    };

    const handleBack = () => {
        onClose();
    };

    return (
        <div className="view profe-servi">
            <div className="view-content">
                <h3>Editar profesiones y servicios</h3>
                <main>
                    <section>
                        <h4>PROFESIONES</h4>
                        <table>
                            <thead>
                                <tr>
                                    <th>N°</th>
                                    <th>Nombre</th>
                                    <th>N° Asociados</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {profesiones.map((profesion, index) => (
                                    <tr key={index}>
                                        <td>{index + 1}</td>
                                        <td className="name">{profesion.nombre_profesion}</td>
                                        <td>{profesion.num_asociados}</td>
                                        <td className="actions">
                                            <div>
                                                <button onClick={() => handleEditar('profesión', profesion)}>Editar</button>
                                                <button onClick={() => handleEliminar('profesión', profesion)}>Eliminar</button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </section>
                    <section>
                        <h4>SERVICIOS</h4>
                        <table>
                            <thead>
                                <tr>
                                    <th>N°</th>
                                    <th>Nombre</th>
                                    <th>N° Asociados</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {servicios.map((servicio, index) => (
                                    <tr key={index}>
                                        <td>{index + 1}</td>
                                        <td className="name">{servicio.nombre_servicio}</td>
                                        <td>{servicio.num_asociados}</td>
                                        <td className="actions">
                                            <div>
                                                <button onClick={() => handleEditar('servicio', servicio)}>Editar</button>
                                                <button onClick={() => handleEliminar('servicio', servicio)}>Eliminar</button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </section>
                </main>
                <button className="btn-volver" onClick={handleBack}>
                    <IoCaretBackOutline />VOLVER
                </button>
            </div>
        </div>
    );
};

export default ProfeServi;
