import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import { searchByDNI, searchByHisClinico } from '../Citas/StoreCita';
import { useParams } from 'react-router-dom';
const API_URL = import.meta.env.VITE_API_URL;

export const useFichaStore = () => {
    const { codigo } = useParams();
    const [fichas, setFichas] = useState([]);
    // const [ficha, setFicha] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);
    const [activeCreate, setActiveCreate] = useState(false);
    const [activeAdd, setActiveAdd] = useState(false);
    const [fichaEncontrada, setFichaEncontrada] = useState(null);
    const [pacienteSearch, setPacienteSearch] = useState('');
    const [pacienteEncontrado, setPacienteEncontrado] = useState(null);

    const limit = 15;

    const fetchFichas = async (search = '', pageNumber = 1) => {
        setLoading(true);
        try {
            const res = await axios.get(`${API_URL}/api/ficha/get-fichas-familiares`, {
                params: { searchTerm: search, page: pageNumber, limit }
            });
            setFichas(res.data.data);
            setTotal(res.data.total);
        } catch (error) {
            console.error('Error al obtener fichas familiares', error);
            toast.error('Error al obtener fichas familiares');
        } finally {
            setLoading(false);
        }
    };

    // const fetchFicha = async () => {
    //     try {
    //         const fichaData = await buscarFicha(codigo);
    //         setFicha(fichaData);
    //         setLoading(false);
    //     } catch (error) {
    //         console.error('Error al obtener la ficha:', error);
    //         setLoading(false);
    //     }
    // }
    useEffect(() => {
        buscarFicha(codigo);
    }, [codigo]);

    const buscarPaciente = async (value) => {
        setFichaEncontrada(null);
        if (!value.trim()) {
            toast.warning('Por favor ingrese un DNI o Historia Clínica');
            return;
        }

        try {
            let resultado = await searchByDNI(value);
            if (!resultado) resultado = await searchByHisClinico(value);

            resultado ? setPacienteEncontrado(resultado) : toast.error('Paciente no encontrado');
        } catch (error) {
            console.error('Error al buscar paciente:', error);
            toast.error('Error al buscar paciente');
        }
    };

    const buscarFicha = async (codigo) => {
        if (!codigo) {
            // toast.warning('Por favor ingrese un código de ficha');
            return;
        }
        try {
            const response = await axios.get(`${API_URL}/api/ficha/get-ficha-familiar/${codigo}`);
            setFichaEncontrada(response.data);
            return response.data;
        } catch (error) {
            if (error.response?.status === 404) {
                toast.error('Ficha no encontrada');
            } else {
                console.error('Error al buscar ficha:', error);
                toast.error('Error al buscar la ficha');
            }
            setFichaEncontrada(null);
        }
    };

    const asignarPaciente = async (id_ficha, id_paciente) => {
        if (!id_ficha) {
            toast.error('Por favor busque y seleccione una ficha primero');
            return;
        }

        const toastId = toast.loading('Verificando datos...', { position: 'top-center' });
        setLoading(true);

        try {
            const response = await axios.post(`${API_URL}/api/ficha/asignar-paciente`, {
                id_ficha,
                id_paciente
            });
            toast.success(response.data.message);
            fetchFichas()
            buscarFicha(codigo)
            return true;
        } catch (error) {
            const errorData = error.response?.data;
            if (errorData?.type === 'same_ficha') {
                toast.error(errorData.message);
            } else if (errorData?.type === 'different_ficha') {
                const result = await Swal.fire({
                    title: '¿Actualizar asignación?',
                    text: errorData.message,
                    icon: 'warning',
                    showCancelButton: true,
                    confirmButtonText: 'Sí, actualizar',
                    cancelButtonText: 'Cancelar',
                    reverseButtons: true
                });

                if (result.isConfirmed) {
                    try {
                        const updateResponse = await axios.post(`${API_URL}/api/ficha/asignar-paciente`, {
                            id_ficha,
                            id_paciente,
                            force: true
                        });
                        toast.success(updateResponse.data.message);
                        fetchFichas()
                        buscarFicha(codigo)
                        return true;
                    } catch (updateError) {
                        console.error('Error al actualizar asignación:', updateError);
                        toast.error('Error al actualizar la asignación');
                    }
                }
            } else if (errorData?.type === 'is_jefe') {
                Swal.fire({
                    title: 'No se puede asignar.',
                    text: errorData.message,
                    icon: 'info'
                })
            } else {
                toast.error(errorData?.message || 'Error al asignar paciente a la ficha');
            }
            return false;
        } finally {
            setLoading(false);
            toast.dismiss(toastId);
        }
    };

    const deletePacienteFicha = async (id_paciente) => {
        const toastId = toast.loading('Eliminando...', { position: 'top-center' });
        try {
            const response = await axios.post(`${API_URL}/api/ficha/delete-paciente-ficha`, {
                id_paciente
            });
            toast.success(response.data.message);
            buscarFicha(codigo)
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Error al eliminar paciente de la ficha';
            toast.error(errorMessage);
        } finally {
            toast.dismiss(toastId);
        }
    }

    const handleAsignarJefe = async (id_paciente, id_ficha) => {
        setLoading(true)
        try {
            const response = await fetch(`${API_URL}/api/ficha/asing-jefe-familia`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ id_paciente, id_ficha })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message);
            }

            toast.success(data.message);
            buscarFicha(codigo)
        } catch (err) {
            toast.error(err.message || 'Error al asignar jefe de familia');
            console.log('Erro: ', err);
        } finally {
            setLoading(false)
        }
    }

    const deleteFichaFamiliar = async (id_ficha) => {
        const result = await Swal.fire({
            title: '¿Eliminar ficha familiar?',
            text: '¿Estás seguro de eliminar esta ficha?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar',
            reverseButtons: true
        });

        if (result.isConfirmed) {
            await confirmarEliminacion(id_ficha);
        }
    };

    const confirmarEliminacion = async (id_ficha) => {
        const toastId = toast.loading('Eliminando ficha...', { position: 'top-center' });
        try {
            const response = await axios.delete(`${API_URL}/api/ficha/delete-ficha`, {
                data: { id_ficha }
            });
            toast.success(response.data.message);
            fetchFichas();
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Error al eliminar la ficha familiar';
            // toast.error(errorMessage);
            Swal.fire({
                title: 'No se puede eleminar Ficha',
                text: errorMessage,
                icon: 'info'

            });
        } finally {
            toast.dismiss(toastId);
        }
    };

    const resetState = () => {
        setPacienteSearch('');
        setSearchTerm('');
        setFichaEncontrada(null);
        setPacienteEncontrado(null);
        setActiveCreate(false);
        setActiveAdd(false);
    };

    return {
        fichas,
        codigo,
        searchTerm,
        setSearchTerm,
        page,
        setPage,
        total,
        loading,
        activeCreate,
        setActiveCreate,
        activeAdd,
        setActiveAdd,
        limit,
        // fetchFicha,
        fetchFichas,
        // ficha,
        pacienteSearch,
        setPacienteSearch,
        pacienteEncontrado,
        fichaEncontrada,
        buscarPaciente,
        buscarFicha,
        handleAsignarJefe,
        asignarPaciente,
        deletePacienteFicha,
        resetState,
        totalPages: Math.ceil(total / limit),

        deleteFichaFamiliar
    };
};