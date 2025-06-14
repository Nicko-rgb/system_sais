import { useState, useEffect } from 'react';

export const useFormResponsable = () => {
    // Estados para los campos del formulario
    const [formDataRes, setFormData] = useState({
        dni: '',
        tipoResponsable: '',
        apePaterno: '',
        apeMaterno: '',
        nombres: '',
        celular1: '',
        celular2: '',
        localidad: '',
        sector: '',
        direccion: '',
        departamento: '',
        provincia: '',
        distrito: ''
    });

    // Estado para errores de validación
    const [errorsRes, setErrors] = useState({});

    // Efecto para limpiar los errores después de 2 segundos
    useEffect(() => {
        if (Object.keys(errorsRes).length > 0) {
            const timer = setTimeout(() => {
                setErrors({});
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [errorsRes]);

    // Manejador de cambios en los campos
    const handleInputChangeRes = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    // Validación de campos
    const validateFormRes = () => {
        const newErrors = {};

        // Validación de DNI
        if (!formDataRes.dni) {
            newErrors.dni = 'El DNI es obligatorio';
        } else if (!/^\d{8}$/.
            test(formDataRes.dni)) {
            newErrors.dni = 'El DNI debe tener 8 dígitos';
        }

        // Validación de tipo de responsable
        if (!formDataRes.tipoResponsable) {
            newErrors.tipoResponsable = 'El tipo de responsable es obligatorio';
        }

        // Validación de nombres y apellidos
        if (!formDataRes.apePaterno) newErrors.apePaterno = 'El apellido paterno es obligatorio';
        if (!formDataRes.apeMaterno) newErrors.apeMaterno = 'El apellido materno es obligatorio';
        if (!formDataRes.nombres) newErrors.nombres = 'El nombre es obligatorio';

        // Validación de celular
        // if (!formDataRes.celular1) {
        //     newErrors.celular1 = 'El celular es obligatorio';
        // } else if (!/^9\d{8}$/.test(formDataRes.celular1)) {
        //     newErrors.celular1 = 'El número de celular debe empezar con 9 y tener 9 dígitos';
        // }

        // // Validación de ubicación
        // if (!formDataRes.localidad) newErrors.localidad = 'La localidad es obligatoria';
        // if (!formDataRes.direccion) newErrors.direccion = 'La dirección es obligatoria';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Manejadores para la ubicación
    const handleUbicacionChangeRes = (tipo, valor) => {
        setFormData(prev => ({ ...prev, [tipo]: valor }));
    };

    // Función para resetear el formulario
    const resetFormRes = () => {
        setFormData({
            dni: '',
            tipoResponsable: '',
            apePaterno: '',
            apeMaterno: '',
            nombres: '',
            celular1: '',
            celular2: '',
            localidad: '',
            sector: '',
            direccion: '',
            departamento: '',
            provincia: '',
            distrito: ''
        });
        setErrors({});
    };

    return {
        formDataRes,
        errorsRes,
        handleInputChangeRes,
        validateFormRes,
        handleUbicacionChangeRes,
        resetFormRes
    };
};