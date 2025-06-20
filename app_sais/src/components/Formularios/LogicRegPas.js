import { useState, useEffect } from 'react';
import { calcularEdadNum } from '../../utils/dateUtils';
import { useFormResponsable } from './LogicRegRes';
import { obtenerCategoriaPorEdad } from '../../viewDash/StoreDash'
import { toast } from 'react-toastify'
import { useNavigate } from 'react-router-dom';
import { useConfig } from '../../context/ConfigContext';

export const useFormPaciente = () => {
    const { dniHistoriaValue } = useConfig()
    const API_URL = import.meta.env.VITE_API_URL;
    const navigate = useNavigate();
    const [msg, setMsg] = useState('');
    const [loading, setLoading] = useState(false);
    // Estados para los campos del formulario
    const [formData, setFormData] = useState({
        dni: '',
        cnv: '',
        histClinico: '',
        apePaterno: '',
        apeMaterno: '',
        nombres: '',
        fechaNacimiento: '',
        edad: '',
        tipoPaciente: '',
        sexo: '',
        discapacidad: false,
        tipoDiscapacidad: '',
        celular1: '',
        celular2: '',
        localidad: '',
        sector: '',
        direccion: '',
        tieneResponsable: false,
        departamento: '',
        provincia: '',
        distrito: ''
    });

    // Efecto para actualizar tipoPaciente cuando cambia la edad
    useEffect(() => {
        if (formData.edad) {
            setFormData(prev => ({
                ...prev,
                tipoPaciente: obtenerCategoriaPorEdad(formData.edad)
            }));
        }
    }, [formData.edad]);

    // Estado para errores de validación
    const [errors, setErrors] = useState({});

    // Efecto para limpiar los errores después de 2 segundos
    useEffect(() => {
        if (Object.keys(errors).length > 0) {
            const timer = setTimeout(() => {
                setErrors({});
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [errors]);

    // Efecto para calcular la edad cuando cambia la fecha de nacimiento
    useEffect(() => {
        if (formData.fechaNacimiento) {
            const edadCalculada = calcularEdadNum(formData.fechaNacimiento);
            setFormData(prev => ({
                ...prev,
                edad: edadCalculada,
                tieneResponsable: edadCalculada < 18
            }));
        }
    }, [formData.fechaNacimiento]);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;

        // Si el campo es "dni", solo permitir números
        if (name === 'dni') {
            // Eliminar todo lo que no sea dígito
            const numericValue = value.replace(/\D/g, '');
            setFormData(prev => ({
                ...prev,
                [name]: numericValue
            }));
            return; // Salimos para evitar el setFormData duplicado abajo
        }

        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));

        // Si se desactiva el checkbox de tieneResponsable, limpiar el formulario del responsable
        if (name === 'tieneResponsable' && !checked) {
            resetFormRes();
        }
    };


    // Validación de campos
    const validateForm = () => {
        const newErrors = {};

        if (dniHistoriaValue) {
            formData.histClinico = formData.dni
        }

        // Validación de DNI
        if (!formData.dni) {
            newErrors.dni = 'El DNI es obligatorio';
        } else if (!/^\d{8}$/.test(formData.dni)) {
            newErrors.dni = 'El DNI debe tener 8 dígitos';
        }

        // Validar historia clínico
        if (!dniHistoriaValue) {
            if (formData.histClinico.length !== 5) {
                newErrors.histClinico = 'Debe tener 5 digitos';
            }
        }
        if (!formData.histClinico) {
            newErrors.histClinico = 'Este campo es obligatorio'
        }

        // Validación de nombres y apellidos
        if (!formData.apePaterno) newErrors.apePaterno = 'El apellido paterno es obligatorio';
        if (!formData.apeMaterno) newErrors.apeMaterno = 'El apellido materno es obligatorio';
        if (!formData.nombres) newErrors.nombres = 'El nombre es obligatorio';

        // Validación de fecha de nacimiento
        if (!formData.fechaNacimiento) {
            newErrors.fechaNacimiento = 'La fecha de nacimiento es obligatoria';
        }

        // Validación de sexo
        if (!formData.sexo) newErrors.sexo = 'El sexo es obligatorio';

        // if(formData.edad > 18 ) {

        //     // Validación de ubicación
        //     if (!formData.localidad) newErrors.localidad = 'La localidad es obligatoria';
        //     if (!formData.sector) newErrors.sector = 'El sector es obligatorio';
        //     if (!formData.direccion) newErrors.direccion = 'La dirección es obligatoria';
        // }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Inicializar el formulario del responsable
    const { formDataRes, errorsRes, handleInputChangeRes, handleUbicacionChangeRes, validateFormRes, resetFormRes } = useFormResponsable();

    // Manejador de envío del formulario
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const idToast = toast.loading('Guardando...');
        setMsg('');
        const isPacienteValid = validateForm();
        let isResponsableValid = true;
        if(!isPacienteValid) {
            toast.dismiss(idToast);
            setLoading(false);
        }

        if (formData.tieneResponsable) {
            isResponsableValid = validateFormRes();
        }

        if (isPacienteValid && isResponsableValid) {
            try {
                const datosCompletos = {
                    paciente: {
                        ...formData,
                        edad: parseInt(formData.edad)
                    },
                    responsable: formData.tieneResponsable ? formDataRes : null
                };

                // Aquí iría la lógica para enviar los datos al servidor
                const response = await fetch(`${API_URL}/api/registrar-paciente`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(datosCompletos)
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || 'Error al guardar los datos');
                }
                const responseData = await response.json();
                toast.success(responseData.message || 'Datos guardados correctamente');
                navigate(`/admision/${formData.histClinico}`);
                setLoading(false);
                toast.dismiss(idToast);
                return true;
            } catch (error) {
                console.error('Error al guardar:', error);
                toast.error(error.message || 'Error al guardar los datos: Server.');
                setMsg(error.message || 'Error al guardar los datos');
                setErrors(prev => ({ ...prev, submit: error.message || 'Error al guardar los datos' }));
                setLoading(false);
                toast.dismiss(idToast);
                return false;
            }
        }
        return false;
    };

    // Manejadores para la ubicación
    const handleUbicacionChange = (tipo, valor) => {
        setFormData(prev => ({ ...prev, [tipo]: valor }));
    };

    return {
        formData,
        errors,
        handleInputChange,
        handleSubmit,
        handleUbicacionChange,
        // Exportar los datos y manejadores del responsable
        formDataRes,
        errorsRes,
        handleInputChangeRes,
        handleUbicacionChangeRes,
        msg,
        loading
    };
};