const pool = require('../config/db');
require('dotenv').config();

// Obtener distribución de pacientes por edad, columna tipo_paciente(niño, adolescente, adulto...)
const getDistribucionTipo = async (req, res) => {
    try {
        const [results] = await pool.query('SELECT tipo_paciente, COUNT(*) as total FROM pacientes GROUP BY tipo_paciente');
        res.json(results);
    } catch (error) {
        console.error('Error al obtener distribución de pacientes:', error);
        res.status(500).json({ message: 'Error al obtener estadísticas' });
    }
};

// Obtener distribución por género
const getGeneroDistribution = async (req, res) => {
    try {
        const query = 'SELECT sexo, COUNT(*) as total FROM pacientes GROUP BY sexo';
        const [results] = await pool.query(query);
        const total = results.reduce((acc, curr) => acc + curr.total, 0);
        const data = results.map(item => ({
            ...item,
            porcentaje: ((item.total / total) * 100).toFixed(2)
        }));
        res.json({ data, total });
    } catch (error) {
        console.error('Error al obtener distribución por género:', error);
        res.status(500).json({ message: 'Error al obtener estadísticas' });
    }
};

// Obtener registros de pacientes por período de tiempo
const getPacientesPorTiempo = async (req, res) => {
    const { periodo, mes, anio } = req.query; // 'mes', 'año'
    try {
        // Obtener fechas límite
        const [limites] = await pool.query('SELECT MIN(DATE(fechaRegistro)) as min_fecha, MAX(DATE(fechaRegistro)) as max_fecha FROM pacientes');
        const fechaMinima = limites[0].min_fecha;
        const fechaMaxima = limites[0].max_fecha;

        let query;
        switch (periodo) {
            case 'mes':
                // Generar todas las fechas del mes
                const mesActual = mes || new Date().getMonth() + 1;
                const anioActual = anio || new Date().getFullYear();
                const fechaSeleccionada = new Date(anioActual, mesActual - 1, 1);
                
                // Verificar si el mes seleccionado está fuera del rango de datos
                if (fechaMinima && fechaMaxima) {
                    const minDate = new Date(fechaMinima);
                    const maxDate = new Date(fechaMaxima);
                    if (fechaSeleccionada < new Date(minDate.getFullYear(), minDate.getMonth(), 1) ||
                        fechaSeleccionada > new Date(maxDate.getFullYear(), maxDate.getMonth(), 1)) {
                        return res.json({ message: 'No hay datos disponibles para este período' });
                    }
                }
                
                const diasEnMes = new Date(anioActual, mesActual, 0).getDate();
                
                // Consulta para obtener los datos existentes
                query = 'SELECT DATE_FORMAT(fechaRegistro, "%Y-%m-%d") as fecha, COUNT(*) as total FROM pacientes WHERE MONTH(fechaRegistro) = ? AND YEAR(fechaRegistro) = ? GROUP BY DATE(fechaRegistro)';
                const [monthResults] = await pool.query(query, [mesActual, anioActual]);
                
                // Crear un objeto con todas las fechas del mes inicializadas en 0
                const todasLasFechas = {};
                for (let dia = 1; dia <= diasEnMes; dia++) {
                    const fecha = `${anioActual}-${String(mesActual).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
                    todasLasFechas[fecha] = 0;
                }
                
                // Actualizar con los datos reales
                monthResults.forEach(result => {
                    todasLasFechas[result.fecha] = result.total;
                });
                
                // Convertir a array y ordenar por fecha
                const resultadoCompleto = Object.entries(todasLasFechas).map(([fecha, total]) => ({
                    fecha,
                    total
                })).sort((a, b) => a.fecha.localeCompare(b.fecha));
                
                return res.json(resultadoCompleto);
            case 'año':
                query = 'SELECT YEAR(fechaRegistro) as año, COUNT(*) as total FROM pacientes GROUP BY YEAR(fechaRegistro) UNION SELECT YEAR(CURRENT_DATE()) as año, 0 as total WHERE YEAR(CURRENT_DATE()) > (SELECT COALESCE(MAX(YEAR(fechaRegistro)), YEAR(CURRENT_DATE())) FROM pacientes) ORDER BY año ASC';
                break;
            default:
                return res.status(400).json({ message: 'Período no válido' });
        }
        const [results] = await pool.query(query);
        res.json(results);
    } catch (error) {
        console.error('Error al obtener registros por tiempo:', error);
        res.status(500).json({ message: 'Error al obtener estadísticas' });
    }
};

// obtener numero citas registrados por periodo de tiempo, tabla cita_ninhos fechaRegistro
const getCitasPorTiempo = async (req, res) => {
    const { periodo, mes, anio } = req.query; // 'mes', 'año'
    try {
        // Obtener fechas límite
        const [limites] = await pool.query('SELECT MIN(DATE(fechaRegistro)) as min_fecha, MAX(DATE(fechaRegistro)) as max_fecha FROM cita_ninhos');
        const fechaMinima = limites[0].min_fecha;
        const fechaMaxima = limites[0].max_fecha;

        let query;
        switch (periodo) {
            case 'mes':
                // Generar todas las fechas del mes
                const mesActual = mes || new Date().getMonth() + 1;
                const anioActual = anio || new Date().getFullYear();
                const fechaSeleccionada = new Date(anioActual, mesActual - 1, 1);
                
                // Verificar si el mes seleccionado está fuera del rango de datos
                if (fechaMinima && fechaMaxima) {
                    const minDate = new Date(fechaMinima);
                    const maxDate = new Date(fechaMaxima);
                    if (fechaSeleccionada < new Date(minDate.getFullYear(), minDate.getMonth(), 1) ||
                        fechaSeleccionada > new Date(maxDate.getFullYear(), maxDate.getMonth(), 1)) {
                        return res.json({ message: 'No hay datos disponibles para este período' });
                    }
                }
                
                const diasEnMes = new Date(anioActual, mesActual, 0).getDate();
                
                // Consulta para obtener los datos existentes
                query = 'SELECT DATE_FORMAT(fechaRegistro, "%Y-%m-%d") as fecha, COUNT(*) as total FROM cita_ninhos WHERE MONTH(fechaRegistro) = ? AND YEAR(fechaRegistro) = ? GROUP BY DATE(fechaRegistro)';
                const [monthResults] = await pool.query(query, [mesActual, anioActual]);
                
                // Crear un objeto con todas las fechas del mes inicializadas en 0
                const todasLasFechas = {};
                for (let dia = 1; dia <= diasEnMes; dia++) {
                    const fecha = `${anioActual}-${String(mesActual).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
                    todasLasFechas[fecha] = 0;
                }
                
                // Actualizar con los datos reales
                monthResults.forEach(result => {
                    todasLasFechas[result.fecha] = result.total;
                });
                
                // Convertir a array y ordenar por fecha
                const resultadoCompleto = Object.entries(todasLasFechas).map(([fecha, total]) => ({
                    fecha,
                    total
                })).sort((a, b) => a.fecha.localeCompare(b.fecha));
                
                return res.json(resultadoCompleto);
            case 'año':
                query = 'SELECT YEAR(fechaRegistro) as año, COUNT(*) as total FROM cita_ninhos GROUP BY YEAR(fechaRegistro) UNION SELECT YEAR(CURRENT_DATE()) as año, 0 as total WHERE YEAR(CURRENT_DATE()) > (SELECT COALESCE(MAX(YEAR(fechaRegistro)), YEAR(CURRENT_DATE())) FROM cita_ninhos) ORDER BY año ASC';
                break;
            default:
                return res.status(400).json({ message: 'Período no válido' });
        }
        const [results] = await pool.query(query);
        res.json(results);
    } catch (error) {
        console.error('Error al obtener registros de citas por tiempo:', error);
        res.status(500).json({ message: 'Error al obtener estadísticas de citas' });
    }
};

module.exports = {
    getDistribucionTipo,
    getGeneroDistribution,
    getPacientesPorTiempo,
    getCitasPorTiempo
};
