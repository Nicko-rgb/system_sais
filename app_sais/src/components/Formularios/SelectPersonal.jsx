import React, { useState, useEffect } from 'react';
import { IoAddCircle } from "react-icons/io5";
import Swal from 'sweetalert2';

const SelectPersonal = ({ onProfesionChange, onServicioChange }) => {
    const [profesiones, setProfesiones] = useState([]);
    const [servicios, setServicios] = useState([]);
    const [selectedProfesion, setSelectedProfesion] = useState('');
    const [selectedServicio, setSelectedServicio] = useState('');
    const API_URL = import.meta.env.VITE_API_URL;

    // Función para cargar profesiones y servicios
    const fetchOptions = async () => {
        try {
            const profesionResponse = await fetch(`${API_URL}/api/obtener/profesiones`);
            const servicioResponse = await fetch(`${API_URL}/api/obtener/servicios`);

            if (profesionResponse.ok && servicioResponse.ok) {
                const profesionesData = await profesionResponse.json();
                const serviciosData = await servicioResponse.json();
                setProfesiones(profesionesData);
                setServicios(serviciosData);
            } else {
                console.error("Error al cargar profesiones o servicios.");
            }
        } catch (error) {
            console.error("Error de red:", error);
        }
    };

    useEffect(() => {
        fetchOptions();
    }, []);
    

    const handleProfesionChange = (event) => {
        const selectedOption = event.target.value;
        setSelectedProfesion(selectedOption);
        const profesionObj = profesiones.find((prof) => prof.id_profesion === parseInt(selectedOption));
        if (profesionObj) onProfesionChange(profesionObj);
    };

    const handleServicioChange = (event) => {
        const selectedOption = event.target.value;
        setSelectedServicio(selectedOption);
        const servicioObj = servicios.find((serv) => serv.id_servicio === parseInt(selectedOption));
        if (servicioObj) onServicioChange(servicioObj);
    };

    const handleAddProfesion = async () => {
        const { value: nuevaProfesion } = await Swal.fire({
            title: 'Nueva Profesión',
            input: 'text',
            inputLabel: 'Ingrese la nueva profesión',
            showCancelButton: true,
            inputValidator: (value) => {
                if (!value) {
                    return 'Debe ingresar una profesión';
                }
            }
        });

        if (nuevaProfesion) {
            const profesionMayus = nuevaProfesion.toUpperCase();
            
            // Mostrar confirmación
            const confirmResult = await Swal.fire({
                title: '¿Los datos son correctos?',
                html: `Profesión a registrar: <strong>${profesionMayus}</strong>`,
                icon: 'question',
                showCancelButton: true,
                confirmButtonText: 'Guardar',
                cancelButtonText: 'Cancelar'
            });

            if (confirmResult.isConfirmed) {
                try {
                    const response = await fetch(`${API_URL}/api/registrar/profesion-servicio`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ profesion: profesionMayus })
                    });

                    if (response.ok) {
                        const nuevaProfesionData = await response.json();
                        setProfesiones([...profesiones, nuevaProfesionData]);
                        setSelectedProfesion(nuevaProfesionData.id_profesion);
                        onProfesionChange(nuevaProfesionData);
                        Swal.fire('¡Éxito!', 'Profesión agregada correctamente', 'success');
                    } else {
                        Swal.fire('Error', 'No se pudo agregar la profesión', 'error');
                    }
                    fetchOptions();
                } catch (error) {
                    console.error("Error de red:", error);
                    Swal.fire('Error', 'Error de red al agregar la profesión', 'error');
                }
            }
        }
    };

    const handleAddServicio = async () => {
        const { value: nuevoServicio } = await Swal.fire({
            title: 'Nuevo Servicio',
            input: 'text',
            inputLabel: 'Ingrese el nuevo servicio',
            showCancelButton: true,
            inputValidator: (value) => {
                if (!value) {
                    return 'Debe ingresar un servicio';
                }
            }
        });

        if (nuevoServicio) {
            const servicioEnMayusculas = nuevoServicio.toUpperCase();
            
            // Mostrar confirmación
            const confirmResult = await Swal.fire({
                title: '¿Los datos son correctos?',
                html: `Servicio a registrar: <strong>${servicioEnMayusculas}</strong>`,
                icon: 'question',
                showCancelButton: true,
                confirmButtonText: 'Guardar',
                cancelButtonText: 'Cancelar'
            });

            if (confirmResult.isConfirmed) {
                try {
                    const response = await fetch(`${API_URL}/api/registrar/profesion-servicio`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ servicio: servicioEnMayusculas })
                    });

                    if (response.ok) {
                        const nuevoServicioData = await response.json();
                        setServicios([...servicios, nuevoServicioData]);
                        setSelectedServicio(nuevoServicioData.id_servicio);
                        onServicioChange(nuevoServicioData);
                        Swal.fire('¡Éxito!', 'Servicio agregado correctamente', 'success');
                    } else {
                        Swal.fire('Error', 'No se pudo agregar el servicio', 'error');
                    }
                    fetchOptions();
                } catch (error) {
                    console.error("Error de red:", error);
                    Swal.fire('Error', 'Error de red al agregar el servicio', 'error');
                }
            }
        }
    };

    return (
        <div className="selected-per">
            <label>
                Profesión:
                <IoAddCircle className='ico-mas' onClick={handleAddProfesion} />
                <select className={`${selectedProfesion ?'activo' : '' }`} value={selectedProfesion} onChange={handleProfesionChange}>
                    <option value="">--Ninguno--</option>
                    {profesiones.map((prof) => (
                        <option key={prof.id_profesion} value={prof.id_profesion}>
                            {prof.nombre_profesion}
                        </option>
                    ))}
                </select>
            </label>

            <label>
                Servicio:
                <IoAddCircle className='ico-mas' onClick={handleAddServicio} />
                <select className={`${selectedServicio ?'activo' : '' }`} value={selectedServicio} onChange={handleServicioChange}>
                    <option value="">--Ninguno--</option>
                    {servicios.map((serv) => (
                        <option key={serv.id_servicio} value={serv.id_servicio}>
                            {serv.nombre_servicio}
                        </option>
                    ))}
                </select>
            </label>
        </div>
    );
};

export default SelectPersonal;
