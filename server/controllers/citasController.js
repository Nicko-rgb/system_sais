const pool = require('../config/db');
require('dotenv').config();
const moment = require('moment');


// Ruta para obtener todas la especialidades
const getEspecialiadUnica = async (req, res) => {
    try {
        const query = 'SELECT * FROM especialidades_cita';
        const [results] = await pool.query(query);

        const especialidades = results.map(row => {
            let tipoMime = 'jpeg'; // por defecto

            if (row.ico_name) {
                const ext = row.ico_name.split('.').pop().toLowerCase();
                if (ext === 'png') tipoMime = 'png';
                else if (ext === 'jpg' || ext === 'jpeg') tipoMime = 'jpeg';
            }

            return {
                ...row,
                icono: row.icono ? `data:image/${tipoMime};base64,${row.icono.toString('base64')}` : null
            };
        });

        res.json(especialidades);
    } catch (error) {
        console.error('Error al obtener especialidades:', error);
        res.status(500).json({ error: 'Error al obtener especialidades' });
    }
};

const obtenerCitas3 = async (req, res) => {
    const connection = await pool.getConnection();
    try {
        const { searchTerm = '', page = 1, limit = 15 } = req.query;

        let query = `
            SELECT c.*, p.nombres, p.ape_paterno, p.ape_materno, p.dni, p.fecha_nacimiento, p.edad
            FROM cita_ninhos c
            INNER JOIN pacientes p ON c.id_paciente = p.id_paciente
            WHERE fecha BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 3 DAY)
        `;
        const params = [];
        const countParams = [];
        const offset = (page - 1) * limit;

        if (searchTerm) {
            const searchTerms = searchTerm.trim().toLowerCase().split(/\s+/);
            const conditions = [];

            searchTerms.forEach(term => {
                conditions.push(`(LOWER(p.dni) LIKE ? OR LOWER(CONCAT(p.ape_paterno, ' ', p.ape_materno, ', ', p.nombres)) LIKE ?)`);
                params.push(`%${term}%`, `%${term}%`);
                countParams.push(`%${term}%`, `%${term}%`);
            });

            query += ' AND (' + conditions.join(' OR ') + ')';
        }

        // Contar total de registros para paginación
        let countQuery = `
            SELECT COUNT(*) as total
            FROM cita_ninhos c
            INNER JOIN pacientes p ON c.id_paciente = p.id_paciente
            WHERE fecha BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 3 DAY)
        `;
        if (searchTerm) {
            const searchTerms = searchTerm.trim().toLowerCase().split(/\s+/);
            const countConditions = [];

            searchTerms.forEach(term => {
                countConditions.push(`(LOWER(p.dni) LIKE ? OR LOWER(CONCAT(p.ape_paterno, ' ', p.ape_materno, ', ', p.nombres)) LIKE ?)`);
            });

            countQuery += ' AND (' + countConditions.join(' OR ') + ')'
        }
        const [countResult] = await connection.execute(countQuery, countParams);
        const total = countResult && countResult[0] && countResult[0].total ? Number(countResult[0].total) : 0;

        // Agregar ordenamiento y paginación
        query += ' ORDER BY fecha ASC, hora ASC LIMIT ? OFFSET ?';
        params.push(Number(limit), Number(offset));

        const [rows] = await connection.execute(query, params);

        res.json({
            data: rows,
            total,
            page: Number(page),
            limit: Number(limit)
        });
    } catch (error) {
        console.error('Error al obtener las citas:', error);
        res.status(500).json({ message: 'Error al obtener las citas', error: error.message });
    } finally {
        connection.release();
    }
}

const obtenerCitasAll = async (req, res) => {
    const query = `
        SELECT  cn.*, p.* FROM  cita_ninhos cn
        JOIN pacientes p ON cn.id_paciente = p.id_paciente;
    `;

    try {
        const [results] = await pool.query(query);
        res.json(results);
    } catch (error) {
        console.error('Error fetching appointments:', error);
        res.status(500).json({ error: error.message });
    }
}

// funcion para obtener bloqueos en citas
const getBloqueosCitas = async (req, res) => {
    try {
        const bloqueos = await pool.query('SELECT * FROM hora_cita_nino_bloqueada');
        // Ejemplo de una respuesta corregida
        res.json(bloqueos[0]);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener bloqueos', error });
    }
}
// funcion para obtener bloqueos de horas en citas
// const getBloqueoCita = async (req, res) => {
//     try {
//         const bloqueos = await pool.query('SELECT * FROM hora_cita_nino_bloqueada');
//         // Ejemplo de una respuesta corregida
//         res.json(bloqueos[0]);
//     } catch (error) {
//         res.status(500).json({ message: 'Error al obtener bloqueos', error });
//     }
// }

// funcion para obtener horarios disponibles en citas
const getHorariosCita = async (req, res) => {
    const { id_especialidad } = req.query;

    try {
        const [horarios] = await pool.execute(`
            SELECT h.*, e.especialidad, e.icono, e.ico_name
            FROM horario_cita_nino h
            INNER JOIN especialidades_cita e ON h.id_especialidad = e.id_especi
            WHERE h.id_especialidad = ?
            ORDER BY h.turno, h.hora_inicio
        `, [id_especialidad]);

        // Procesar el icono si existe
        const horariosConIcono = horarios.map(row => {
            let tipoMime = 'jpeg';
            if (row.ico_name) {
                const ext = row.ico_name.split('.').pop().toLowerCase();
                if (ext === 'png') tipoMime = 'png';
                else if (ext === 'jpg' || ext === 'jpeg') tipoMime = 'jpeg';
            }
            return {
                ...row,
                icono: row.icono ? `data:image/${tipoMime};base64,${row.icono.toString('base64')}` : null
            };
        });

        res.json(horariosConIcono);
    } catch (error) {
        console.error('Error al obtener los horarios:', error);
        res.status(500).json({ error: 'Error al obtener los horarios..' });
    }
}


// funcion para bloquear horas en citas
const bloquearHoraCita = async (req, res) => {
    const { fecha, hora_inicio, hora_fin, consultorio, especialidad } = req.body;

    try {
        await pool.query(
            'INSERT INTO hora_cita_nino_bloqueada (fecha, hora_inicio, hora_fin, consultorio, especialidad) VALUES (?, ?, ?, ?, ?)',
            [fecha, hora_inicio, hora_fin, consultorio, especialidad]
        );
        res.status(200).json({ message: 'Hora bloqueada exitosamente' });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            res.status(400).json({ message: 'Ya existe un bloqueo para esta hora' });
        } else {
            res.status(500).json({ message: 'Error al bloquear la hora', error });
        }
    }
}

// funcion para desbloquear horas en citas
const desbloquearHoraCita = async (req, res) => {
    const { fecha, hora_inicio, hora_fin, consultorio, especialidad } = req.body;

    try {
        const result = await pool.query(
            'DELETE FROM hora_cita_nino_bloqueada WHERE fecha = ? AND hora_inicio = ? AND hora_fin = ? AND consultorio = ? AND especialidad = ?',
            [fecha, hora_inicio, hora_fin, consultorio, especialidad]
        );

        // Verificar si se eliminó alguna fila
        if (result.affectedRows === 0) {
            return res.status(400).json({ message: 'No se encontró un bloqueo para esta hora' });
        }

        res.status(200).json({ message: 'Hora desbloqueada exitosamente' });
    } catch (error) {
        res.status(500).json({ message: 'Error al desbloquear la hora', error });
    }
}

// Funcion para registrar una nueva cita
const registrarCita = async (req, res) => {
    const { id_paciente, especialidad, fecha, hora, consultorio, telefono, direccion, motivoConsulta, metodo, semEmbarazo, profesional, idRespons } = req.body;

    const sql = `
        INSERT INTO cita_ninhos (
            id_paciente, especialidad, fecha, hora, consultorio, telefono, direccion_c, motivoConsulta, metodo, semEmbarazo, profesional_cita, id_responsable
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    const values = [id_paciente, especialidad, fecha, hora, consultorio, telefono, direccion || null, motivoConsulta, metodo || null, semEmbarazo || null, profesional, idRespons || null];

    try {
        const [results] = await pool.query(sql, values);
        res.status(201).json({
            message: 'Cita registrada exitosamente',
            id: results.insertId
        });
    } catch (error) {
        console.error('Error al registrar la cita:', error);
        res.status(500).json({
            error: 'Error al registrar la cita',
            details: error.message
        });
    }
}

// Funcion para editar una cita
const editarCita = async (req, res) => {
    const { id } = req.params; // ID de la cita a actualizar
    const { fecha, hora, consultorio } = req.body; // Datos enviados desde el cliente

    try {
        // Verificar si existe otra cita en el mismo horario (excluyendo la cita actual)
        const [citasExistentes] = await pool.execute(
            'SELECT * FROM cita_ninhos WHERE fecha = ? AND hora = ? AND consultorio = ?',
            [fecha, hora, consultorio]
        );

        if (citasExistentes.length > 0) {
            return res.status(400).json({
                error: 'Ya existe una cita programada para esta fecha, hora y consultorio.'
            });
        }

        // Consulta SQL para actualizar la cita en la base de datos
        const query = `UPDATE cita_ninhos SET fecha = ?, hora = ?, consultorio = ? WHERE id = ?;`;
        const values = [fecha, hora, consultorio, id];

        // Ejecutar la consulta
        const [result] = await pool.execute(query, values);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Cita no encontrada.' });
        }

        res.status(200).json({ message: 'Cita actualizada correctamente.' });
    } catch (error) {
        console.error('Error al actualizar la cita:', error);
        res.status(500).json({ error: 'Error al actualizar la cita.' });
    }
}

// funcion para borrar una cita
const borrarCita = async (req, res) => {
    const { id } = req.params;
    try {
        const query = 'DELETE FROM cita_ninhos WHERE id = ?';
        const [result] = await pool.execute(query, [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Cita no encontrada.' });
        }

        res.status(200).json({ message: 'Cita eliminada correctamente.' });
    } catch (error) {
        console.error('Error al borrar la cita:', error);
        res.status(500).json({ error: 'Error al borrar la cita.' });
    }
}

const crearEspecialidad = async (req, res) => {
    const { especialidad, consultorios } = req.body;
    const icono = req.file ? req.file.buffer : null;
    const ico_name = req.file ? req.file.originalname : null;

    try {
        const [result] = await pool.query(
            'INSERT INTO especialidades_cita (especialidad, consultorios, icono, ico_name) VALUES (?,?,?,?)',
            [especialidad.toUpperCase(), consultorios, icono, ico_name]
        );

        res.status(201).json({
            message: 'Especialidad creada exitosamente',
            id: result.insertId
        })
    } catch (error) {
        console.error('Error al crear la especialidad:', error);
        res.status(500).json({
            error: 'Error al crear la especialidad',
            details: error.message
        });
    }
}

// Función para crear un nuevo horario
const crearHorario = async (req, res) => {
    const { turno, tipo_atencion, hora_inicio, hora_fin, id_especialidad } = req.body;

    try {
        const [result] = await pool.query(
            'INSERT INTO horario_cita_nino (turno, tipo_atencion, hora_inicio, hora_fin, id_especialidad) VALUES (?, ?, ?, ?, ?)',
            [turno, tipo_atencion, hora_inicio, hora_fin, id_especialidad]
        );

        res.status(201).json({
            message: 'Horario creado exitosamente',
            id: result.insertId
        });
    } catch (error) {
        console.error('Error al crear horario:', error);
        res.status(500).json({
            error: 'Error al crear el horario',
            details: error.message
        });
    }
};

// Función para actualizar un horario existente
const actualizarHorario = async (req, res) => {
    const { id } = req.params;
    const { turno, tipo_atencion, hora_inicio, hora_fin, id_especialidad } = req.body;
    console.log(req.body) // Agrega esta línea para ver los dato

    try {
        const [result] = await pool.query(
            'UPDATE horario_cita_nino SET turno = ?, tipo_atencion = ?, hora_inicio = ?, hora_fin = ?, id_especialidad = ? WHERE id = ?',
            [turno, tipo_atencion, hora_inicio, hora_fin, id_especialidad, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Horario no encontrado' });
        }

        res.json({ message: 'Horario actualizado exitosamente' });
    } catch (error) {
        console.error('Error al actualizar horario:', error);
        res.status(500).json({
            error: 'Error al actualizar el horario',
            details: error.message
        });
    }
};

// Función para eliminar un horario
const eliminarHorario = async (req, res) => {
    const { id } = req.params;

    try {
        const [result] = await pool.query('DELETE FROM horario_cita_nino WHERE id = ?', [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Horario no encontrado' });
        }

        res.json({ message: 'Horario eliminado exitosamente' });
    } catch (error) {
        console.error('Error al eliminar horario:', error);
        res.status(500).json({
            error: 'Error al eliminar el horario',
            details: error.message
        });
    }
};

// Función para eliminar una especialidad
// Función para alternar el estado de una especialidad (activar o desactivar)
const alternarEstadoEspecialidad = async (req, res) => {
    const { id } = req.params;

    try {
        // 1. Verificar si la especialidad existe y obtener su estado actual
        const [rows] = await pool.query(
            'SELECT estado FROM especialidades_cita WHERE id_especi = ?',
            [id]
        );

        if (rows.length === 0) {
            return res.status(404).json({ error: 'Especialidad no encontrada' });
        }

        const estadoActual = rows[0].estado;

        // 2. Alternar el estado
        const nuevoEstado = !estadoActual;

        const [result] = await pool.query(
            'UPDATE especialidades_cita SET estado = ? WHERE id_especi = ?',
            [nuevoEstado, id]
        );

        if (result.affectedRows === 0) {
            return res.status(500).json({ error: 'No se pudo actualizar el estado de la especialidad' });
        }

        res.json({
            message: `Especialidad ${nuevoEstado ? 'activada' : 'desactivada'} exitosamente`,
            nuevoEstado
        });
    } catch (error) {
        console.error('Error al cambiar el estado de la especialidad:', error);
        res.status(500).json({
            error: 'Error al cambiar el estado de la especialidad',
            details: error.message,
        });
    }
};


// funcion para eliminar citas pasadas
const eliminarCitasPasadas = async (req, res) => {
    const { especialidad } = req.params;

    if (!especialidad) {
        return res.status(400).json({ message: 'Especialidad no proporcionada' });
    }

    try {
        const hoy = moment().startOf('day').format('YYYY-MM-DD');

        const [result] = await pool.query(
            `DELETE FROM cita_ninhos 
             WHERE especialidad = ? AND fecha < ?`,
            [especialidad, hoy]
        );

        return res.status(200).json({
            message: 'Citas pasadas eliminadas exitosamente',
            affectedRows: result.affectedRows
        });

    } catch (error) {
        console.error('Error al eliminar citas pasadas:', error);
        return res.status(500).json({ message: 'Error al eliminar citas pasadas' });
    }
};



module.exports = {
    getEspecialiadUnica,
    obtenerCitas3,
    obtenerCitasAll,
    getBloqueosCitas,
    getHorariosCita,
    // getBloqueoCita,
    bloquearHoraCita,
    desbloquearHoraCita,
    registrarCita,
    editarCita,
    borrarCita,
    crearEspecialidad,
    crearHorario,
    actualizarHorario,
    eliminarHorario,
    alternarEstadoEspecialidad,
    eliminarCitasPasadas
}