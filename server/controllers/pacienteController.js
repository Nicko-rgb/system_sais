const pool = require('../config/db');
require('dotenv').config();

// Función para actualizar paciente
const actualizarPaciente = async (req, res) => {
    const { id } = req.params;
    const datos = req.body;

    try {
        // Verificar si el DNI ya existe en otro paciente
        const [dniExistente] = await pool.query(
            'SELECT id_paciente FROM pacientes WHERE dni = ? AND id_paciente != ?',
            [datos.dni, id]
        );

        if (dniExistente.length > 0) {
            return res.status(400).json({ message: 'El DNI ya está registrado en otro paciente.' });
        }

        const paternoMayus = datos.ape_paterno.toUpperCase();
        const maternoMayus = datos.ape_materno.toUpperCase();
        const nombreMaysu = datos.nombres.toUpperCase();

        const [resultado] = await pool.query(`
            UPDATE pacientes SET 
                dni = ?, 
                ape_paterno = ?, 
                ape_materno = ?, 
                nombres = ?, 
                fecha_nacimiento = ?, 
                edad = ?, 
                sexo = ?, 
                celular1 = ?, 
                celular2 = ?, 
                direccion = ?, 
                sector = ?, 
                localidad = ?, 
                departamento = ?, 
                provincia = ?, 
                distrito = ?, 
                tipo_paciente = ?, 
                discapacidad = ?
            WHERE id_paciente = ?
        `, [
            datos.dni,
            paternoMayus,
            maternoMayus,
            nombreMaysu,
            // datos.ape_paterno,
            // datos.ape_materno,
            // datos.nombres,
            datos.fecha_nacimiento,
            datos.edad,
            datos.sexo,
            datos.celular1,
            datos.celular2,
            datos.direccion,
            datos.sector,
            datos.localidad,
            datos.departamento,
            datos.provincia,
            datos.distrito,
            datos.tipo_paciente,
            datos.discapacidad,
            id
        ]);

        if (resultado.affectedRows === 0) {
            return res.status(404).json({ message: 'Paciente no encontrado' });
        }

        res.status(200).json({ message: 'Paciente actualizado correctamente' });

    } catch (error) {
        console.error('Error al actualizar paciente:', error);
        res.status(500).json({ message: 'Error del servidor al actualizar paciente' });
    }
};

// Función auxiliar para buscar paciente por campo específico
const buscarPacientePor = async (campo, valor, connection) => {
    const [rows] = await connection.execute(
        `SELECT * FROM pacientes WHERE ${campo} = ?`,
        [valor]
    );
    if (rows.length === 0) {
        throw new Error(`No se encontró paciente con ${campo}: ${valor}`);
    }
    return rows[0];
};

const obtenerPacientes = async (req, res) => {
    const connection = await pool.getConnection();
    try {
        const { searchTerm = '', page = 1, limit = 15 } = req.query;

        const offset = (page - 1) * limit;
        const params = [];

        let baseQuery = `
            FROM pacientes p
            LEFT JOIN ficha_familiar f ON p.id_ficha = f.id_ficha
        `;

        let whereClause = '';
        if (searchTerm) {
            // const searchTerms = searchTerm.trim().toLowerCase().split(/\s+/);
            const searchTerms = searchTerm.trim().toLowerCase().split(/\s+/).slice(0, 5); // Máx. 5 términos
            const conditions = [];

            searchTerms.forEach(term => {
                conditions.push(`
                    (LOWER(p.dni) LIKE ? OR
                     LOWER(p.hist_clinico) LIKE ? OR
                     LOWER(CONCAT(p.ape_paterno, ' ', p.ape_materno, ', ', p.nombres)) LIKE ? OR
                     LOWER(f.codigo_ficha) LIKE ?)
                `);
                params.push(`%${term}%`, `%${term}%`, `%${term}%`, `%${term}%`);
            });

            whereClause = 'WHERE ' + conditions.join(' OR ');
        }

        const countQuery = `SELECT COUNT(*) as total ${baseQuery} ${whereClause}`;
        const [countResult] = await connection.execute(countQuery, params);
        const total = countResult[0].total;

        const dataQuery = `
            SELECT 
                p.*, 
                f.codigo_ficha 
            ${baseQuery} 
            ${whereClause}
            ORDER BY p.id_paciente DESC
            LIMIT ? OFFSET ?
            `;
            // ORDER BY RAND()
            
        params.push(Number(limit), Number(offset));

        const [rows] = await connection.execute(dataQuery, params);

        res.json({ data: rows, total, page: Number(page), limit: Number(limit) });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al obtener los pacientes', error: error.message });
    } finally {
        connection.release();
    }
};



const obtenerPacientePorTipo  = async (req, res) => {
    const { tipo } = req.query;

    const connection = await pool.getConnection();
    try {
        const [rows] = await connection.execute(
            `
            SELECT 
                p.*, 
                r.* -- Selecciona todas las columnas de la tabla responsable_de_paciente
            FROM pacientes p
            LEFT JOIN responsable_de_paciente r ON p.id_responsable = r.id_responsable  
            WHERE p.tipo_paciente = ?
            `,
            [tipo]
        );

        res.json(rows); // Devolver los pacientes filtrados junto con los datos del responsable
    } catch (error) {
        console.error('Error al obtener pacientes:', error);
        res.status(500).json({ message: 'Error al obtener pacientes', error: error.message });
    } finally {
        connection.release(); // Liberar la conexión
    } 
}

const registrarPaciente = async (req, res) => {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        const { paciente, responsable } = req.body;

        // Validar campos obligatorios del paciente
        const camposObligatoriosPaciente = ['dni', 'histClinico', 'apePaterno', 'apeMaterno', 'nombres', 'fechaNacimiento', 'edad', 'sexo', 'tipoPaciente'];
        for (const campo of camposObligatoriosPaciente) {
            if (!paciente[campo]) {
                return res.status(400).json({ message: `El campo ${campo} es obligatorio para el paciente` });
            }
        }

        // Verificar si el DNI ya existe
        const [dniExistente] = await connection.execute(
            'SELECT id_paciente FROM pacientes WHERE dni = ?',
            [paciente.dni]
        );
        if (dniExistente.length > 0) {
            res.status(400).json({
                message: 'Ya existe un paciente registrado con este DNI'
            });
        }

        // Verificar si la historia clínica ya existe
        const [historiaExistente] = await connection.execute(
            'SELECT id_paciente FROM pacientes WHERE hist_clinico = ?',
            [paciente.histClinico]
        );
        if (historiaExistente.length > 0) {
            res.status(400).json({
                message: 'La historia clínica ingresada ya está en uso'
            });
        }

        let id_responsable = null;
        // Si hay responsable, validar e insertarlo primero
        if (responsable) {
            const camposObligatoriosResponsable = ['dni', 'tipoResponsable', 'apePaterno', 'apeMaterno', 'nombres'];
            for (const campo of camposObligatoriosResponsable) {
                if (!responsable[campo]) {
                    throw new Error(`El campo ${campo} es obligatorio para el responsable`);
                }
            }

            const paternoMayus = responsable.apePaterno.toUpperCase();
            const maternoMayus = responsable.apeMaterno.toUpperCase();
            const nombresMayus = responsable.nombres.toUpperCase();


            const [resultResponsable] = await connection.execute(
                `INSERT INTO responsable_de_paciente (
                    dni_res, tipo_res, ape_paterno_res, ape_materno_res, nombres_res,
                    celular1_res, celular2_res, localidad_res, sector_res, direccion_res,
                    departamento_res, provincia_res, distrito_res
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    responsable.dni,
                    responsable.tipoResponsable,
                    paternoMayus,
                    maternoMayus,
                    nombresMayus,
                    // responsable.apePaterno,
                    // responsable.apeMaterno,
                    // responsable.nombres,
                    responsable.celular1 || null,
                    responsable.celular2 || null,
                    responsable.localidad || null,
                    responsable.sector || null,
                    responsable.direccion || null,
                    responsable.departamento || null,
                    responsable.provincia || null,
                    responsable.distrito || null
                ]
            );
            id_responsable = resultResponsable.insertId;
        }

        // Insertar paciente con validación de campos nulos

        // Convertir a mayúsculas antes de insertar
        const paternoMayus = paciente.apePaterno.toUpperCase();
        const maternoMayus = paciente.apeMaterno.toUpperCase();
        const nombresMayus = paciente.nombres.toUpperCase();

        const [resultPaciente] = await connection.execute(
            `INSERT INTO pacientes (
                dni, cnv_linea, hist_clinico, ape_paterno, ape_materno, nombres,
                fecha_nacimiento, edad, sexo, discapacidad, celular1, celular2,
                localidad, sector, direccion, departamento, provincia, distrito,
                tipo_paciente, id_responsable
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                paciente.dni,
                paciente.cnv || null,
                paciente.histClinico,
                paternoMayus,
                maternoMayus,
                nombresMayus,
                // paciente.apePaterno,
                // paciente.apeMaterno,
                // paciente.nombres,
                paciente.fechaNacimiento,
                paciente.edad,
                paciente.sexo,
                paciente.tipoDiscapacidad || null,
                paciente.celular1 || null,
                paciente.celular2 || null,
                paciente.localidad || null,
                paciente.sector || null,
                paciente.direccion || null,
                paciente.departamento || null,
                paciente.provincia || null,
                paciente.distrito || null,
                paciente.tipoPaciente,
                id_responsable
            ]
        );

        await connection.commit();
        res.status(201).json({
            message: 'Paciente registrado exitosamente',
            pacienteId: resultPaciente.insertId,
            responsableId: id_responsable
        });
    } catch (error) {
        await connection.rollback();
        console.error('Error al registrar paciente:', error);
        res.status(500).json({
            message: 'Error al registrar paciente',
            error: error.message
        });
    } finally {
        connection.release();
    }
};

// función para obtener paciente por historia clínica, junto con ficha familiar y responsable si existen
const getPacienteHistoria = async (req, res) => {
    const { historia } = req.params;
    const connection = await pool.getConnection();

    try {
        // 1. Obtener paciente y ficha familiar
        const [rows] = await connection.execute(
            `SELECT p.*, f.*
             FROM pacientes p
             LEFT JOIN ficha_familiar f ON p.id_ficha = f.id_ficha
             WHERE p.hist_clinico = ?`,
            [historia]
        );

        if (rows.length === 0) {
            throw new Error(`No se encontró paciente con historia clínica: ${historia}`);
        }

        const paciente = rows[0];

        // 2. Preparar ficha familiar si existe
        const fichaFamiliar = paciente.id_ficha ? {
            id_ficha: paciente.id_ficha,
            codigo_ficha: paciente.codigo_ficha,
            manzana: paciente.manzana,
            vivienda_numero: paciente.vivienda_numero,
            grupo_familiar: paciente.grupo_familiar,
            jefe_familia: paciente.jefe_familia,
        } : null;

        // 3. Obtener datos del responsable si existe
        let responsable = null;
        if (paciente.id_responsable) {
            const [responsableRows] = await connection.execute(
                `SELECT * FROM responsable_de_paciente WHERE id_responsable = ?`,
                [paciente.id_responsable]
            );
            if (responsableRows.length > 0) {
                responsable = responsableRows[0];
            }
        }

        // 4. Obtener pacientes de la misma familia (misma id_ficha)
        let familiares = [];
        if (paciente.id_ficha) {
            const [familiaRows] = await connection.execute(
                `SELECT * FROM pacientes WHERE id_ficha = ? AND id_paciente != ?`,
                [paciente.id_ficha, paciente.id_paciente]
            );
            familiares = familiaRows;
        }

        // 5. Enviar respuesta completa
        res.json({
            ...paciente,
            ficha_familiar: fichaFamiliar,
            responsable_paciente: responsable,
            familiares_asociados: familiares
        });

    } catch (error) {
        console.error(error);
        res.status(404).json({ message: error.message });
    } finally {
        connection.release();
    }
};



// funcion para obtener paciente por dni
const getPacienteDni = async (req, res) => {
    const { dni } = req.params;
    const connection = await pool.getConnection();
    try {
        const paciente = await buscarPacientePor('dni', dni, connection);
        res.json(paciente);
    } catch (error) {
        console.error(error);
        res.status(404).json({ message: error.message });
    } finally {
        connection.release();
    }
}

// funcion para obtener historias clinicas disponibles
const getHistoriasDisponibles = async (req, res) => {
    const connection = await pool.getConnection();
    try {
        // Obtener todas las historias clínicas existentes
        const [historias] = await connection.execute(
            'SELECT hist_clinico FROM pacientes WHERE hist_clinico REGEXP "^[0-9]{5}$" ORDER BY hist_clinico'
        );

        // Convertir las historias existentes a un conjunto para búsqueda eficiente
        const historiasExistentes = new Set(historias.map(h => h.hist_clinico));

        // Encontrar las próximas 5 historias disponibles
        const historiasDisponibles = [];
        let numeroActual = 1;

        // Encontrar las próximas 5 historias disponibles empezando desde 00001
        while (historiasDisponibles.length < 5 && numeroActual <= 99999) {
            const historiaFormateada = numeroActual.toString().padStart(5, '0');
            if (!historiasExistentes.has(historiaFormateada)) {
                historiasDisponibles.push(historiaFormateada);
            }
            numeroActual++;
        }

        res.json(historiasDisponibles);
    } catch (error) {
        console.error('Error al obtener historias clínicas disponibles:', error);
        res.status(500).json({
            message: 'Error al obtener historias clínicas disponibles',
            error: error.message
        });
    } finally {
        connection.release();
    }
}

module.exports = {
    actualizarPaciente,
    obtenerPacientes,
    obtenerPacientePorTipo,
    registrarPaciente,
    getPacienteHistoria,
    getPacienteDni,
    getHistoriasDisponibles
}