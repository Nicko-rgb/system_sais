import React from 'react'
import { RiPlayReverseLargeFill } from "react-icons/ri";
import { Link } from "react-router-dom";
import { LuTextSearch } from "react-icons/lu";
import { FaUserPlus } from "react-icons/fa";
import { MdOutlineAssignmentTurnedIn } from "react-icons/md";
import Swal from 'sweetalert2';
import { useFichaStore } from './StoreFicha';
import { searchByDNI, searchByHisClinico } from '../Citas/StoreCita'
import {useNavigate} from 'react-router-dom'

const Cabeza = ({ data, setSearchTerm }) => {
    const totalIntegrantes = data?.pacientes?.length || 0;
    const { asignarPaciente, buscarFicha, codigo } = useFichaStore();
    const navigate = useNavigate();

    const handleAgregarNuevo = async () => {
        try {
            const { value: searchValue, isDismissed } = await Swal.fire({
                title: 'Buscar Paciente',
                input: 'text',
                inputLabel: 'Ingrese DNI o Historia Clínica',
                showCancelButton: true,
                confirmButtonText: 'Buscar',
                cancelButtonText: 'Cancelar',
                inputValidator: (value) => {
                    if (!value) {
                        return 'Debe ingresar un valor para buscar';
                    }
                }
            });

            if (isDismissed || !searchValue) return;

            let paciente = await searchByDNI(searchValue);

            if (!paciente) {
                paciente = await searchByHisClinico(searchValue);
            }

            if (!paciente) {
                await Swal.fire({
                    icon: 'error',
                    title: 'Paciente no encontrado',
                    text: 'No se encontró ningún paciente con el valor proporcionado',
                });
                return;
            }

            const result = await Swal.fire({
                title: 'Paciente Encontrado',
                html: `
                    <div>
                        <p><strong>Nombres:</strong> ${paciente.nombres.toUpperCase() }</p>
                        <p><strong>Apellidos:</strong> ${paciente.ape_paterno.toUpperCase()} ${paciente.ape_materno}</p>
                        <p><strong>DNI:</strong> ${paciente.dni}</p>
                        <p><strong>Historia Clínica:</strong> ${paciente.hist_clinico}</p>
                    </div>
                `,
                showCancelButton: true,
                confirmButtonText: 'Agregar a la Ficha',
                cancelButtonText: 'Cancelar',
                reverseButtons: true,
                allowOutsideClick: false
            });

            if (result.isConfirmed) {

                const success = await asignarPaciente(data.id_ficha, paciente.id_paciente);

                if (success) {
                    buscarFicha(codigo);
                    await Swal.fire({
                        icon: 'success',
                        title: 'Paciente agregado exitosamente',
                        showConfirmButton: false,
                        timer: 1500
                    });
                }
            }
        } catch (error) {
            console.error('Error:', error);
            await Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error.message || 'Ocurrió un error al procesar la solicitud'
            });
        }
    };

    return (
        <section className="cabecera">
            <div className="acciones">
                <Link onClick={() => navigate(-1)} className='volver_link'>
                    <RiPlayReverseLargeFill /> Back
                </Link>
                <input type="search" placeholder='Buscar miembro de familia...' onChange={(e) => setSearchTerm(e.target.value)} />
                <LuTextSearch className='ico-search' />
                <button onClick={handleAgregarNuevo}><FaUserPlus /> Agregar Nuevo </button>
                <button><MdOutlineAssignmentTurnedIn /> Asignar Jefe</button>
            </div>
            <fieldset>
                <legend>Informacion de Ficha Familiar</legend>
                <label>Manzana:
                    <span>{data?.manzana || '-'}</span>
                </label>
                <label>Vivienda:
                    <span>{data?.vivienda_numero || '-'}</span>
                </label>
                <label>
                    Familia:
                    <span>{data?.grupo_familiar || '-'}</span>
                </label>
                <label>Integrantes:
                    <span>{totalIntegrantes}</span>
                </label>
            </fieldset>
        </section>
    )
}

export default Cabeza