// src/utils/fechaUtils.js

// Formatear fecha mostrando solo el día
export const formatearSoloDia = (fechaString) => {
    // Crear la fecha usando UTC para evitar problemas de zona horaria
    const [year, month, day] = fechaString.split('-');
    return String(parseInt(day)).padStart(2, '0');
};

// 1. Formatear fecha a dd/mm/yyyy
export const formatearFechaConSlash = (fechaString) => {
    // Parsear la fecha directamente del string YYYY-MM-DD
    const [anio, mes, dia] = fechaString.split('-');
    return `${dia}/${mes}/${anio}`;
};

// 2. Formatear fecha a dd-mm-yyyy
export const formatearFechaConGuion = (fechaString) => {
    const fecha = new Date(fechaString);
    const dia = String(fecha.getDate()).padStart(2, '0');
    const mes = String(fecha.getMonth() + 1).padStart(2, '0');
    const anio = fecha.getFullYear();
    return `${dia}-${mes}-${anio}`;
};

export const formatearFechaSlash2 = (fechaString) => {
    const fecha = new Date(fechaString);
    const dia = String(fecha.getDate()).padStart(2, '0');
    const mes = String(fecha.getMonth() + 1).padStart(2, '0');
    const anio = fecha.getFullYear();
    return `${dia}/${mes}/${anio}`;
};

// 3. Calcular edad en palabras
export const calcularEdad = (fechaNacimientoString) => {
    const nacimiento = new Date(fechaNacimientoString);
    const hoy = new Date();

    let años = hoy.getFullYear() - nacimiento.getFullYear();
    let meses = hoy.getMonth() - nacimiento.getMonth();
    let dias = hoy.getDate() - nacimiento.getDate();

    if (dias < 0) {
        meses -= 1;
        dias += new Date(hoy.getFullYear(), hoy.getMonth(), 0).getDate(); // Agrega días del mes anterior
    }

    if (meses < 0) {
        años -= 1;
        meses += 12;
    }

    if (años >= 1) {
        return `${años} ${años === 1 ? 'año' : 'años'} ${meses} ${meses === 1 ? 'mes' : 'meses'}`;
    } else {
        return `${meses} ${meses === 1 ? 'mes' : 'meses'} ${dias} ${dias === 1 ? 'día' : 'días'}`;
    }
};

// calular edad en numeros 
export const calcularEdadNum =(fechaNacimiento) => {
    const hoy = new Date();
    const nacimiento = new Date(fechaNacimiento);
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const mes = hoy.getMonth() - nacimiento.getMonth();

    // Si todavía no ha cumplido años este año, se resta 1
    if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
        edad--;
    }

    return edad;
}

//creamos una funcion para recortar un texto
export const recortarTexto = (texto, longitud) => {
    if (texto.length > longitud) {
        return texto.substring(0, longitud) + '...';
    }
    return texto
}