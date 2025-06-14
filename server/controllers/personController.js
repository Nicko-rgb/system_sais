const pool = require('../config/db');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const login = async (req, res) => {
    try {
        const { dni, password } = req.body;

        // Consulta con JOIN para obtener la profesión y servicio por nombre
        const query = `
            SELECT 
                ps.id_personal, ps.nombres, ps.paterno, ps.materno, ps.correo, ps.dni, 
                ps.tipo_user, ps.tipo_personal, ps.celular,
                pr.nombre_profesion AS profesion,
                se.nombre_servicio AS servicio,
                ps.especial_cita, ps.num_consultorio, ps.condicion,
                ps.file, ps.file_name, ps.estado, ps.fechaRegistro
            FROM 
                personal_salud ps
            LEFT JOIN 
                profesiones pr ON ps.id_profesion = pr.id_profesion
            LEFT JOIN 
                servicios se ON ps.id_servicio = se.id_servicio
            WHERE 
                ps.dni = ? AND ps.contrasena = ?;
        `;

        const [results] = await pool.execute(query, [dni, password]);

        if (results.length === 0) {
            return res.status(401).json({
                success: false,
                message: 'DNI o contraseña incorrectos'
            });
        }

        const user = results[0];

        // Generar token JWT
        const token = jwt.sign(
            { userId: user.id_personal, dni: user.dni },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        // Enviar respuesta
        res.json({
            success: true,
            user: {
                id: user.id_personal,
                nombres: user.nombres,
                apellidos: `${user.paterno} ${user.materno}`,
                correo: user.correo,
                celular: user.celular,
                dni: user.dni,
                tipo_user: user.tipo_user,
                tipo_personal: user.tipo_personal,
                profesion: user.profesion,
                servicio: user.servicio,
                consultorio: user.especial_cita,
                num_consultorio: user.num_consultorio,
                condicion: user.condicion,
                documento: user.file,
                doc_name: user.file_name,
                estado: user.estado,
                fecha_registro: user.fechaRegistro,
            },
            token
        });

    } catch (error) {
        console.error('Error en login:', error);
        res.status(500).json({
            success: false,
            message: 'Error en el servidor'
        });
    }
};

// funcion para obtener personal de salud por paginacion y busqueda// función para obtener personal de salud con paginación, búsqueda y JOINs a profesiones y servicios
const obtenerPersonal = async (req, res) => {
    const connection = await pool.getConnection();
    try {
        const { searchTerm = '', page = 1, limit = 15, estado = 'todos' } = req.query;

        const offset = (page - 1) * limit;
        const params = [];
        const conditions = [];

        let baseQuery = `
            FROM personal_salud ps
            LEFT JOIN profesiones p ON ps.id_profesion = p.id_profesion
            LEFT JOIN servicios s ON ps.id_servicio = s.id_servicio
        `;

        // Filtro por estado
        if (estado !== 'todos') {
            conditions.push('ps.estado = ?');
            params.push(estado);
        }

        // Filtro por término de búsqueda
        if (searchTerm) {
            const searchTerms = searchTerm.trim().toLowerCase().split(/\s+/);
            const searchConditions = [];

            searchTerms.forEach(term => {
                searchConditions.push(`
                    (LOWER(ps.dni) LIKE ? 
                    OR LOWER(CONCAT(ps.paterno, ' ', ps.materno, ', ', ps.nombres)) LIKE ?)
                `);
                params.push(`%${term}%`, `%${term}%`);
            });

            conditions.push(`(${searchConditions.join(' OR ')})`);
        }

        // Construcción del WHERE si hay condiciones
        const whereClause = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '';

        // Contar total de resultados
        const countQuery = `SELECT COUNT(*) as total ${baseQuery} ${whereClause}`;
        const [countResult] = await connection.execute(countQuery, params);
        const total = countResult[0].total;

        // Consulta principal con paginación
        const mainQuery = `
            SELECT 
                ps.*, 
                p.nombre_profesion AS profesion, 
                s.nombre_servicio AS servicio 
            ${baseQuery} 
            ${whereClause} 
            ORDER BY ps.id_personal DESC 
            LIMIT ? OFFSET ?
        `;
        params.push(Number(limit), Number(offset));

        const [rows] = await connection.execute(mainQuery, params);

        res.json({ data: rows, total, page: Number(page), limit: Number(limit) });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al obtener los personales', error: error.message });
    } finally {
        connection.release();
    }
};


// Funcion para registrar personal de salud
const registrarPersonal = async (req, res) => {
    const dataPersonal = req.body;
    const archivo = req.file; // Obtener el archivo del request
    // Validar el tipo de archivo si se ha subido uno
    if (archivo) {
        const tipoPermitido = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
        if (!tipoPermitido.includes(archivo.mimetype)) {
            return res.status(400).json({ message: 'Solo se permiten archivos PDF o DOCX.' });
        }
    }

    const connection = await pool.getConnection(); // Usar el pool de conexiones
    try {
        await connection.beginTransaction(); // Iniciar transacción

        // Consulta SQL para verificar si el correo ya está registrado
        const checkEmailQuery = 'SELECT * FROM personal_salud WHERE correo = ?';
        const [results] = await connection.query(checkEmailQuery, [dataPersonal.correo]);

        // Si se encuentra un resultado, significa que el correo ya está registrado
        if (results.length > 0) {
            return res.status(400).json({ message: 'El correo electrónico ya está registrado.' });
        }

        // Consulta SQL para insertar los datos en la tabla personal_salud
        const insertQuery = `
        INSERT INTO personal_salud 
        (dni, paterno, materno, nombres, tipo_user, tipo_personal, id_profesion, id_servicio, especial_cita, num_consultorio, condicion, celular, correo, contrasena, file, file_name)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

        // Convertir a mayúsculas antes de insertar
        const paternoMayus = dataPersonal.paterno.toUpperCase();
        const maternoMayus = dataPersonal.materno.toUpperCase();
        const nombresMayus = dataPersonal.nombres.toUpperCase();

        const [insertResult] = await connection.query(insertQuery, [
            dataPersonal.dni,
            paternoMayus,
            maternoMayus,
            nombresMayus,
            dataPersonal.tipoUser === 'null' ? null : dataPersonal.tipoUser,
            dataPersonal.tipoPersonal,
            dataPersonal.profesion,
            dataPersonal.servicio === 'null' ? null : dataPersonal.servicio,
            dataPersonal.especialidad === 'null' ? null : dataPersonal.especialidad,
            dataPersonal.consultorio === 'null' ? null : dataPersonal.consultorio,
            dataPersonal.condicion,
            dataPersonal.celular,
            dataPersonal.correo,
            dataPersonal.contrasena,
            archivo ? archivo.buffer : null,
            archivo ? archivo.originalname : null
        ]);

        await connection.commit(); // Confirmar la transacción

        res.status(201).json({ message: 'Registro exitoso', id_personal: insertResult.insertId });
    } catch (error) {
        console.error('Error:', error);
        await connection.rollback(); // Revertir la transacción en caso de error
        return res.status(500).json({ message: 'Error al registrar el personal. Intenta nuevamente.' });
    } finally {
        connection.release(); // Liberar la conexión al pool
    }
}

// En tu archivo controller o ruta
const getArchivoPersonal = async (req, res) => {
    const { id_personal } = req.params;

    try {
        const [result] = await pool.query('SELECT file, file_name FROM personal_salud WHERE id_personal = ?', [id_personal]);

        if (result.length === 0 || !result[0].file) {
            return res.status(404).json({ message: 'Archivo no encontrado' });
        }

        const { file, file_name } = result[0];
        const extension = file_name.split('.').pop().toLowerCase();

        if (extension === 'pdf') {
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', 'inline; filename=' + file_name); // para abrir en navegador
        } else {
            res.setHeader('Content-Type', 'application/octet-stream');
            res.setHeader('Content-Disposition', 'attachment; filename=' + file_name); // para descargar
        }

        res.send(file);
    } catch (error) {
        console.error('Error al obtener archivo:', error);
        res.status(500).json({ message: 'Error al obtener archivo' });
    }
};

const deleteArchivoPersonal = async (req, res) => {
    const { id_personal } = req.params;

    try {
        const [result] = await pool.query('SELECT file_name FROM personal_salud WHERE id_personal = ?', [id_personal]);
        if (result.length === 0) {
            return res.status(404).json({ message: 'Personal no encontrado' });
        }

        await pool.query('UPDATE personal_salud SET file = NULL, file_name = NULL WHERE id_personal = ?', [id_personal]);

        res.json({ message: 'Archivo eliminado correctamente' });
    } catch (error) {
        console.error('Error al eliminar archivo:', error);
        res.status(500).json({ message: 'Error al eliminar archivo' });
    }
};



const editarPersonal = async (req, res) => {
    const { id_personal, dni, paterno, materno, nombres, tipo_user, tipo_personal, id_profesion, id_servicio, especial_cita, num_consultorio, condicion, celular, correo, contrasena, estado } = req.body;

    const archivo = req.file;

    // Validar archivo si existe
    if (archivo) {
        const tipoPermitido = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
        if (!tipoPermitido.includes(archivo.mimetype)) {
            return res.status(400).json({ message: 'Solo se permiten archivos PDF o DOCX.' });
        }
    }

    // Normalizar valores: convertir string "null" a null real
    const tipoUser = tipo_user === 'null' ? null : tipo_user;
    const tipoPersonal = tipo_personal === 'null' ? null : tipo_personal;
    const especialidadCita = especial_cita === 'null' ? null : especial_cita;
    const consultorio = especialidadCita === null ? null : (num_consultorio === 'null' ? null : num_consultorio);
    const condicionn = condicion === 'null' ? null : condicion;
    const cel1 = celular === 'null' ? null : celular;

    try {
        const [result] = await pool.query(`
            UPDATE personal_salud 
            SET dni = ?, paterno = ?, materno = ?, nombres = ?, tipo_user = ?, tipo_personal = ?, id_profesion = ?, id_servicio = ?, especial_cita = ?, num_consultorio = ?, condicion = ?, celular = ?, correo = ?, contrasena = ?, estado = ?, file = ?, file_name = ?
            WHERE id_personal = ?
        `, [
            dni,
            paterno,
            materno,
            nombres,
            tipoUser,
            tipoPersonal,
            id_profesion,
            id_servicio,
            especialidadCita,
            consultorio,
            condicionn,
            cel1,
            correo,
            contrasena,
            estado,
            archivo ? archivo.buffer : null,
            archivo ? archivo.originalname : null,
            id_personal
        ]);

        if (result.affectedRows > 0) {
            res.json({ success: true });
        } else {
            res.json({ success: false });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error en el servidor' });
    }
};


const deletePersonal = async (req, res) => {
    const { id_personal } = req.params;

    try {
        const [result] = await pool.query('DELETE FROM personal_salud WHERE id_personal =?', [id_personal]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Personal no encontrado.' });
        }
        res.status(200).json({ message: 'Personal eliminado.' });
    } catch (error) {
        console.error('Error al eliminar el personal:', error);
        res.status(500).json({ message: 'Error al eliminar el personal.' });
    }
}


const obtenerSectorAsignado = async (req, res) => {
    try {
        const query = `
            SELECT sp.*,
                   p.id_personal, p.nombres, p.paterno, p.materno, p.dni,
                   pr.nombre_profesion AS profesion,
                   se.nombre_servicio AS servicio,
                   p.estado
            FROM sector_personal sp
            JOIN personal_salud p ON sp.id_personal = p.id_personal
            LEFT JOIN profesiones pr ON p.id_profesion = pr.id_profesion
            LEFT JOIN servicios se ON p.id_servicio = se.id_servicio
        `;

        const [results] = await pool.query(query);
        res.status(200).json(results);
    } catch (error) {
        console.error("Error al obtener el personal asignado:", error);
        res.status(500).json({ message: 'Error al obtener los datos del personal.', error });
    }
};


// Funcion para aignar sector al personal de salud
const asignarSector = async (req, res) => {
    const { id_sector, manzana, codigo, numero, descripcion, id_personal } = req.body;

    // Consulta SQL para verificar si la combinación de id_sector e id_personal ya existe
    const checkQuery = `
        SELECT * FROM sector_personal 
        WHERE id_sector = ? AND id_personal = ?
    `;

    const checkValues = [id_sector, id_personal];

    try {
        const [existingRecords] = await pool.query(checkQuery, checkValues);

        // Si ya existe un registro con esa combinación, devuelve un mensaje
        if (existingRecords.length > 0) {
            return res.status(201).json({ message: 'No se puede asignar dos veces al personal.' });
        }

        // Consulta SQL para insertar los datos en la tabla sector_personal
        const insertQuery = `
            INSERT INTO sector_personal (id_sector, manzana, codigo, numero, descripcion, id_personal)
            VALUES (?, ?, ?, ?, ?, ?)
        `;

        const values = [id_sector, manzana, codigo, numero, descripcion || '', id_personal];

        const [results] = await pool.query(insertQuery, values);
        res.status(201).json({ message: 'Datos guardados correctamente', data: results });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al guardar los datos', error });
    }
}

// Funcion para eliminar asignacion de sector 
const eliminarAsignacion = async (req, res) => {
    const { id } = req.params;

    try {
        const [result] = await pool.query('DELETE FROM sector_personal WHERE id_sector_personal = ?', [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Personal no encontrado.' });
        }

        res.status(200).json({ message: 'Personal borrado del sector.' });
    } catch (error) {
        console.error('Error al eliminar el personal:', error);
        res.status(500).json({ message: 'Error al eliminar el personal.' });
    }
}

//funcion para obtener los turnos de de los personales
const getTurnoPersonal = async (req, res) => {
    try {
        const query = `
            SELECT 
                tp.id_turno,
                tp.fecha,
                tp.id_turno_tipo,
                ttp.turno AS turno,
                ttp.clave_turno AS clave_turno,
                ps.id_personal,
                ps.dni,
                ps.paterno,
                ps.materno,
                ps.nombres,
                ps.tipo_user,
                pr.nombre_profesion AS profesion,
                se.nombre_servicio AS servicio,
                ps.especial_cita,
                ps.num_consultorio,
                ps.condicion,
                ps.estado
            FROM 
                turnos_personal tp
            INNER JOIN 
                personal_salud ps ON tp.id_personal = ps.id_personal
            INNER JOIN 
                tipos_turno_personal ttp ON tp.id_turno_tipo = ttp.id_turno_tipo
            LEFT JOIN 
                profesiones pr ON ps.id_profesion = pr.id_profesion
            LEFT JOIN 
                servicios se ON ps.id_servicio = se.id_servicio
            WHERE 
                ps.estado = 'activo';
        `;
        const [data] = await pool.query(query);
        res.json(data);
    } catch (e) {
        console.error('Error al obtener los turnos del personal:', e);
        res.status(500).json({ error: 'Error al obtener los turnos del personal' });
    }
};


// funcion para obtener todos los personal de salud para turnos
const getPersonalAll = async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT 
                ps.*, 
                p.nombre_profesion AS profesion, 
                s.nombre_servicio AS servicio
            FROM personal_salud ps
            LEFT JOIN profesiones p ON ps.id_profesion = p.id_profesion
            LEFT JOIN servicios s ON ps.id_servicio = s.id_servicio
        `);
        res.json(rows);
    } catch (error) {
        console.error('Error al obtener el personal:', error);
        res.status(500).json({ message: 'Error al obtener el personal.' });
    }
};


// Funcion para obtener los tipos de turno de personal de salud
const getTiposTurno = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM tipos_turno_personal');
        res.json(rows);
    } catch (error) {
        console.error('Error al obtener los tipos de turno:', error);
        res.status(500).json({ message: 'Error al obtener los tipos de turno.' });
    }
}

// Funcion para registrar turnos de personal de salud
const registrarTurnoPersonal = async (req, res) => {
    const { id_personal, fecha, id_turno_tipo } = req.body;

    try {
        // Inserta o actualiza el turno en la base de datos
        await pool.query(
            `INSERT INTO turnos_personal (id_personal, fecha, id_turno_tipo)
            VALUES (?, ?, ?)
            ON DUPLICATE KEY UPDATE id_turno_tipo = VALUES(id_turno_tipo)`,
            [id_personal, id_turno_tipo, fecha]
        );

        res.status(200).json({ message: 'Turno asignado correctamente' });
    } catch (error) {
        console.error('Error al asignar turno:', error);
        res.status(500).json({ error: 'Error al asignar turno' });
    }
}

const deleteTurnosPasados = async (req, res) => {
    try {
        const fechaActual = new Date();

        // Calcular el primer día del mes actual
        const primerDiaMesActual = new Date(fechaActual.getFullYear(), fechaActual.getMonth(), 1);

        // Eliminar todos los turnos anteriores al primer día del mes actual
        const [result] = await pool.query(
            'DELETE FROM turnos_personal WHERE fecha < ?',
            [primerDiaMesActual]
        );

        if (result.affectedRows === 0) {
            return res.status(200).json({ message: 'No hay turnos pasados para eliminar.' });
        }

        return res.status(200).json({
            message: 'Turnos anteriores eliminados correctamente.',
            turnosEliminados: result.affectedRows
        });

    } catch (error) {
        console.error('Error al eliminar turnos:', error);
        return res.status(500).json({
            message: 'Error al eliminar los turnos anteriores.',
            error: error.message
        });
    }
}


// Funcion para obtener fechas bloqueadas de turnos
const getFechasBloqueadas = async (req, res) => {
    try {
        const [results] = await pool.query('SELECT fecha FROM dias_bloqueados WHERE bloqueado = TRUE');
        res.json(results);
    } catch (error) {
        console.error('Error al obtener las fechas bloqueadas:', error);
        res.status(500).json({ error: 'Error al obtener las fechas bloqueadas' });
    }
}
// Funcion para guardar fechas bloqueadas
const guardarFechasBloqueadas = async (req, res) => {
    const { fecha } = req.body;

    try {
        const query = 'INSERT INTO dias_bloqueados (fecha, bloqueado) VALUES (?, TRUE) ON DUPLICATE KEY UPDATE bloqueado = TRUE';
        const [results] = await pool.query(query, [fecha]);
        res.status(200).json({ message: 'Fecha bloqueada con éxito' });
    } catch (error) {
        console.error('Error al bloquear la fecha:', error);
        res.status(500).json({ error: 'Error al bloquear la fecha' });
    }
}
// funcion para desbloquear fechas de turnos
const desbloquearFechaTurno = async (req, res) => {
    const { fecha } = req.body;

    try {
        const query = 'UPDATE dias_bloqueados SET bloqueado = FALSE WHERE fecha = ?';
        const [results] = await pool.query(query, [fecha]);
        res.status(200).json({ message: 'Fecha desbloqueada con éxito' });
    } catch (error) {
        console.error('Error al desbloquear la fecha:', error);
        res.status(500).json({ error: 'Error al desbloquear la fecha' });
    }
}

// funcion para obtener profesiones 
const getProfesiones = async (req, res) => {
    try {
        const query = `
            SELECT p.id_profesion, p.nombre_profesion, COUNT(ps.id_personal) AS num_asociados
            FROM profesiones p
            LEFT JOIN personal_salud ps ON ps.id_profesion = p.id_profesion
            GROUP BY p.id_profesion, p.nombre_profesion
            ORDER BY p.nombre_profesion ASC
        `;
        const [result] = await pool.query(query);
        res.json(result);
    } catch (error) {
        console.error('Error al obtener profesiones', error);
        res.status(500).json({ message: 'Error al obtener profesiones.' });
    }
};


// funcion para obtener servicios
const getServicios = async (req, res) => {
    try {
        const query = `
            SELECT s.id_servicio, s.nombre_servicio, COUNT(ps.id_personal) AS num_asociados
            FROM servicios s
            LEFT JOIN personal_salud ps ON ps.id_servicio = s.id_servicio
            GROUP BY s.id_servicio, s.nombre_servicio
            ORDER BY s.nombre_servicio ASC
        `;
        const [result] = await pool.query(query);
        res.json(result);
    } catch (error) {
        console.error('Error al obtener servicios', error);
        res.status(500).json({ message: 'Error al obtener servicios.' });
    }
};

// EDITAR profesión
const editProfesion = async (req, res) => {
    const { id } = req.params;
    const { nombre } = req.body;
    const nameMayus = nombre.toUpperCase()
    try {
        await pool.query('UPDATE profesiones SET nombre_profesion = ? WHERE id_profesion = ?', [nameMayus, id]);
        res.json({ message: 'Profesión actualizada' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al editar profesión' });
    }
};

// ELIMINAR profesión
const deleteProfesion = async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query('DELETE FROM profesiones WHERE id_profesion = ?', [id]);
        res.json({ message: 'Profesión eliminada' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al eliminar profesión' });
    }
};

// EDITAR servicio
const editServicio = async (req, res) => {
    const { id } = req.params;
    const { nombre } = req.body;
    const nombreMayus = nombre.toUpperCase()
    try {
        await pool.query('UPDATE servicios SET nombre_servicio = ? WHERE id_servicio = ?', [nombreMayus, id]);
        res.json({ message: 'Servicio actualizada' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al editar profesión' });
    }
};

// ELIMINAR profesión
const deleteServicio = async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query('DELETE FROM servicios WHERE id_servicio = ?', [id]);
        res.json({ message: 'Servicio eliminada' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al eliminar profesión' });
    }
};

// Funcion para registrar profesiones y servicios
const registrarProfesionServicio = async (req, res) => {
    const { profesion, servicio } = req.body;

    const connection = await pool.getConnection(); // Obtener conexión
    try {
        await connection.beginTransaction(); // Iniciar transacción

        // Si se proporciona una profesión
        if (profesion) {
            // Verificar si la profesión ya existe
            const checkProfQuery = 'SELECT COUNT(*) AS count FROM profesiones WHERE nombre_profesion = ?';
            const [checkProfResult] = await connection.query(checkProfQuery, [profesion]);

            if (checkProfResult[0].count === 0) {
                // Insertar nueva profesión solo si no existe
                const insertProfQuery = 'INSERT INTO profesiones (nombre_profesion) VALUES (?)';
                await connection.query(insertProfQuery, [profesion]);
            }
        }

        // Si se proporciona un servicio
        if (servicio) {
            // Verificar si el servicio ya existe
            const checkServQuery = 'SELECT COUNT(*) AS count FROM servicios WHERE nombre_servicio = ?';
            const [checkServResult] = await connection.query(checkServQuery, [servicio]);

            if (checkServResult[0].count === 0) {
                // Insertar nuevo servicio solo si no existe
                const insertServQuery = 'INSERT INTO servicios (nombre_servicio) VALUES (?)';
                await connection.query(insertServQuery, [servicio]);
            }
        }

        await connection.commit(); // Confirmar transacción
        res.status(200).json({ message: 'Profesión y/o servicio añadidos (si no existían).' });
    } catch (error) {
        console.error('Error al añadir profesión o servicio', error);
        await connection.rollback(); // Revertir transacción en caso de error
        res.status(500).json({ message: 'Error al añadir profesión o servicio.' });
    } finally {
        if (connection) connection.release(); // Liberar conexión
    }
}

// Funcion para Activas/Inactivas personal de salud
const activarInactivarPersonal = async (req, res) => {
    const { estado } = req.body; // Obtenemos el nuevo estado del cuerpo de la solicitud
    const id = req.params.id_personal;

    // Validar el estado y el id
    if (!['activo', 'inactivo'].includes(estado)) {
        return res.status(400).send('Estado inválido');
    }

    if (!id) {
        console.log('ID requerido');
        return res.status(400).send('ID requerido');
    }

    let connection;
    try {
        // Obtener una conexión del pool
        connection = await pool.getConnection();
        const [result] = await connection.execute('UPDATE personal_salud SET estado = ? WHERE id_personal = ?', [estado, id]);

        if (result.affectedRows === 0) {
            return res.status(404).send('Personal no encontrado');
        }

        res.send('Estado actualizado con éxito');
    } catch (err) {
        console.error('Error al actualizar el estado:', err);
        res.status(500).send('Error al actualizar el estado');
    } finally {
        if (connection) connection.release(); // Liberar la conexión en lugar de cerrarla
    }
}


module.exports = {
    login,
    obtenerPersonal,
    registrarPersonal,
    getArchivoPersonal,
    deleteArchivoPersonal,
    editarPersonal,
    deletePersonal,
    obtenerSectorAsignado,
    asignarSector,
    eliminarAsignacion,
    getTurnoPersonal,
    getPersonalAll,
    getTiposTurno,
    registrarTurnoPersonal,
    deleteTurnosPasados,
    getFechasBloqueadas,
    guardarFechasBloqueadas,
    desbloquearFechaTurno,
    getProfesiones,
    getServicios,
    editProfesion,
    deleteProfesion,
    editServicio,
    deleteServicio,
    registrarProfesionServicio,
    activarInactivarPersonal
};