const pool = require('../config/db');
require('dotenv').config();

// funcion para obtener todas las fichas familiares
const getFichasFamiliares = async (req, res) => {
    const connection = await pool.getConnection();
    try {
        const { searchTerm = '', page = 1, limit = 15 } = req.query;
        const offset = (page - 1) * limit;

        const params = [];

        let whereClause = '';
        let joinPacientes = '';
        if (searchTerm.trim()) {
            const searchTerms = searchTerm.trim().toLowerCase().split(/\s+/);
            const conditions = [];

            joinPacientes = 'LEFT JOIN pacientes p ON p.id_ficha = ff.id_ficha';

            searchTerms.forEach(term => {
                const likeTerm = `%${term}%`;
                conditions.push(`
                    (
                        LOWER(ff.codigo_ficha) LIKE ? OR
                        LOWER(p.dni) LIKE ? OR
                        LOWER(p.hist_clinico) LIKE ? OR
                        LOWER(CONCAT(p.ape_paterno, ' ', p.ape_materno, ', ', p.nombres)) LIKE ?
                    )
                `);
                params.push(likeTerm, likeTerm, likeTerm, likeTerm);
            });

            whereClause = 'WHERE ' + conditions.join(' OR ');
        }

        // 1. Obtener fichas familiares
        const fichasQuery = `
            SELECT DISTINCT ff.*
            FROM ficha_familiar ff
            ${joinPacientes}
            ${whereClause}
            ${searchTerm ? 'ORDER BY ff.id_ficha DESC' : 'ORDER BY RAND()'}
            LIMIT ? OFFSET ?
        `;

        params.push(Number(limit), Number(offset));
        const [fichas] = await connection.execute(fichasQuery, params);

        // 2. Total de fichas para la paginación
        const countParams = params.slice(0, -2); // quitar limit y offset
        const countQuery = `
            SELECT COUNT(DISTINCT ff.id_ficha) as total
            FROM ficha_familiar ff
            ${joinPacientes}
            ${whereClause}
        `;
        const [countResult] = await connection.execute(countQuery, countParams);
        const total = countResult[0].total;

        // 3. Obtener pacientes relacionados
        const fichaIds = fichas.map(f => f.id_ficha);
        let pacientesMap = {};
        if (fichaIds.length > 0) {
            const [pacientes] = await connection.query(
                `SELECT * FROM pacientes WHERE id_ficha IN (${fichaIds.map(() => '?').join(',')})`,
                fichaIds
            );

            pacientesMap = fichaIds.reduce((acc, id) => {
                acc[id] = pacientes.filter(p => p.id_ficha === id);
                return acc;
            }, {});
        }

        // 4. Asociar pacientes a cada ficha
        const fichasConFamilias = fichas.map(ficha => ({
            ...ficha,
            pacientes: pacientesMap[ficha.id_ficha] || [],
        }));

        res.json({
            data: fichasConFamilias,
            total,
            page: Number(page),
            limit: Number(limit),
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: 'Error al obtener fichas familiares',
            error: error.message,
        });
    } finally {
        connection.release();
    }
};



const registerNewFicha = async (req, res) => {
    const { manzana, vivienda_numero, grupo_familiar, codigo_ficha } = req.body;

    if (!manzana || !vivienda_numero || !grupo_familiar || !codigo_ficha) {
        return res.status(400).json({ message: 'Faltan campos obligatorios' });
    }

    try {
        // Verificar si ya existe la ficha con ese código
        const [existing] = await pool.query(
            'SELECT id_ficha FROM ficha_familiar WHERE codigo_ficha = ?',
            [codigo_ficha]
        );

        if (existing.length > 0) {
            return res.status(409).json({ message: 'Esta ficha familiar ya existe' });
        }

        const sql = `
            INSERT INTO ficha_familiar (codigo_ficha, manzana, vivienda_numero, grupo_familiar)
            VALUES (?, ?, ?, ?)
        `;
        const values = [codigo_ficha, manzana, vivienda_numero, grupo_familiar];

        await pool.query(sql, values);

        return res.status(201).json({
            message: 'Ficha Familiar registrada con éxito.',
            codigo_ficha: codigo_ficha,
        });
    } catch (error) {
        console.error('Error al registrar ficha familiar:', error);
        return res.status(500).json({ message: 'Error interno del servidor' });
    }
};

const asignarFichaFamiliar = async (req, res) => {
    const { id_ficha, id_paciente, force = false } = req.body;

    if (!id_ficha || !id_paciente) {
        return res.status(400).json({ message: 'Se requieren id_ficha e id_paciente' });
    }

    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        // Verificar si existe la ficha
        const [fichaExiste] = await connection.execute(
            'SELECT id_ficha FROM ficha_familiar WHERE id_ficha = ?',
            [id_ficha]
        );

        if (fichaExiste.length === 0) {
            await connection.rollback();
            return res.status(404).json({ message: 'Ficha familiar no encontrada' });
        }

        // Verificar si existe el paciente y su ficha actual
        const [pacienteExiste] = await connection.execute(
            'SELECT id_paciente, id_ficha, is_jefe FROM pacientes WHERE id_paciente = ?',
            [id_paciente]
        );

        if (pacienteExiste.length === 0) {
            await connection.rollback();
            return res.status(404).json({ message: 'Paciente no encontrado' });
        }

        // Verificar si el paciente ya está asignado a esta ficha
        if (pacienteExiste[0].id_ficha === id_ficha) {
            await connection.rollback();
            return res.status(409).json({
                message: 'Este paciente ya está asignado a esta ficha.',
                type: 'same_ficha'
            });
        }

        // Verificar si el paciente es jefe de familia en otra ficha
        if (pacienteExiste[0].is_jefe && pacienteExiste[0].id_ficha !== null) {
            await connection.rollback();
            return res.status(409).json({
                message: 'Este paciente es jefe de familia en otra ficha. No se puede reasignar.',
                type: 'is_jefe'
            });
        }

        // Verificar si el paciente está asignado a otra ficha
        if (pacienteExiste[0].id_ficha !== null && !force) {
            return res.status(409).json({
                message: 'Este paciente ya pertenece a otra ficha.',
                type: 'different_ficha'
            });
        }

        // Actualizar la relación
        await connection.execute(
            'UPDATE pacientes SET id_ficha = ? WHERE id_paciente = ?',
            [id_ficha, id_paciente]
        );

        await connection.commit();
        res.json({ message: 'Paciente asignado exitosamente a la ficha familiar' })

    } catch (error) {
        await connection.rollback();
        console.error('Error al asignar paciente a ficha familiar:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    } finally {
        connection.release();
    }
};

// Función para obtener una ficha familiar por su código junto con los pacientes relacionados
const getFichaFamiliarByCodigo = async (req, res) => {
    const { codigo } = req.params;

    if (!codigo) {
        return res.status(400).json({ message: 'Se requiere el código de la ficha' });
    }

    try {
        const [ficha] = await pool.query(
            'SELECT * FROM ficha_familiar WHERE codigo_ficha = ?',
            [codigo]
        );

        if (ficha.length === 0) {
            return res.status(404).json({ message: 'Ficha familiar no encontrada' });
        }

        const [pacientes] = await pool.query(
            'SELECT * FROM pacientes WHERE id_ficha = ?',
            [ficha[0].id_ficha]
        );

        const fichaConPacientes = {
            ...ficha[0],
            pacientes, // devuelves el arreglo completo
        };

        res.json(fichaConPacientes);
    } catch (error) {
        console.error('Error al obtener ficha familiar:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};

// funcion para eliminar paciente de ficha familiar
const deletePacienteFicha = async (req, res) => {
    const { id_paciente } = req.body;

    if (!id_paciente) {
        return res.status(400).json({ message: 'Se requiere id_paciente' });
    }

    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        // Verificar si existe el paciente
        const [pacienteExiste] = await connection.execute(
            'SELECT id_paciente, id_ficha, is_jefe FROM pacientes WHERE id_paciente = ?',
            [id_paciente]
        );

        if (pacienteExiste.length === 0) {
            await connection.rollback();
            return res.status(404).json({ message: 'Paciente no encontrado' });
        }

        // Verificar si el paciente es jefe de familia
        if (pacienteExiste[0].is_jefe) {
            await connection.rollback();
            return res.status(400).json({
                message: 'No se puede eliminar al jefe de familia. Asigne otro jefe primero.'
            });
        }

        // Actualizar el paciente para eliminar su asociación con la ficha
        await connection.execute(
            'UPDATE pacientes SET id_ficha = NULL WHERE id_paciente = ?',
            [id_paciente]
        );

        await connection.commit();
        res.json({ message: 'Paciente eliminado exitosamente de la ficha familiar' });

    } catch (error) {
        await connection.rollback();
        console.error('Error al eliminar paciente de ficha familiar:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    } finally {
        connection.release();
    }
};

const asignarJefeFamilia = async (req, res) => {
    const { id_ficha, id_paciente } = req.body;

    if (!id_ficha || !id_paciente) {
        return res.status(400).json({ message: 'Se requieren id_ficha e id_paciente' });
    }

    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        // Verificar si existe la ficha y el paciente
        const [fichaExiste] = await connection.execute(
            'SELECT * FROM ficha_familiar WHERE id_ficha = ?',
            [id_ficha]
        );

        if (fichaExiste.length === 0) {
            await connection.rollback();
            return res.status(404).json({ message: 'Ficha familiar no encontrada' });
        }

        const [pacienteNuevoJefe] = await connection.execute(
            'SELECT * FROM pacientes WHERE id_paciente = ? AND id_ficha = ?',
            [id_paciente, id_ficha]
        );

        if (pacienteNuevoJefe.length === 0) {
            await connection.rollback();
            return res.status(404).json({
                message: 'Paciente no encontrado o no pertenece a esta ficha familiar'
            });
        }

        // Quitar el estado de jefe al jefe anterior si existe
        await connection.execute(
            'UPDATE pacientes SET is_jefe = FALSE WHERE id_ficha = ? AND is_jefe = TRUE',
            [id_ficha]
        );

        // Asignar nuevo jefe
        await connection.execute(
            'UPDATE pacientes SET is_jefe = TRUE WHERE id_paciente = ?',
            [id_paciente]
        );

        // Actualizar datos de la ficha familiar con los datos del nuevo jefe
        const nuevoJefe = pacienteNuevoJefe[0];
        await connection.execute(
            `UPDATE ficha_familiar SET 
                direccion = ?,
                localidad = ?,
                sector = ?,
                distrito = ?,
                jefe_familia = ?
            WHERE id_ficha = ?`,
            [
                nuevoJefe.direccion,
                nuevoJefe.localidad,
                nuevoJefe.sector,
                nuevoJefe.distrito,
                `${nuevoJefe.ape_paterno} ${nuevoJefe.ape_materno}, ${nuevoJefe.nombres}`,
                id_ficha
            ]
        );

        await connection.commit();
        res.json({
            message: 'Jefe de familia asignado exitosamente',
            jefe: nuevoJefe
        });

    } catch (error) {
        await connection.rollback();
        console.error('Error al asignar jefe de familia:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    } finally {
        connection.release();
    }
}

const deleteFichaFamiliar = async (req, res) => {
    const { id_ficha } = req.body;

    if (!id_ficha) {
        return res.status(400).json({ message: 'Se requiere el ID de la ficha familiar' });
    }

    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        // Verificar si la ficha existe
        const [fichaExiste] = await connection.execute(
            'SELECT id_ficha FROM ficha_familiar WHERE id_ficha = ?',
            [id_ficha]
        );

        if (fichaExiste.length === 0) {
            await connection.rollback();
            return res.status(404).json({ message: 'Ficha familiar no encontrada' });
        }

        // Verificar si hay pacientes asociados a la ficha
        const [pacientesAsociados] = await connection.execute(
            'SELECT COUNT(*) as total FROM pacientes WHERE id_ficha = ?',
            [id_ficha]
        );

        if (pacientesAsociados[0].total > 0) {
            await connection.rollback();
            return res.status(400).json({
                message: 'No se puede eliminar la ficha porque tiene pacientes asociados. Por favor, primero elimine o reasigne los pacientes de esta ficha.'
            });
        }

        // Eliminar la ficha
        await connection.execute(
            'DELETE FROM ficha_familiar WHERE id_ficha = ?',
            [id_ficha]
        );

        await connection.commit();
        res.json({ message: 'Ficha familiar eliminada exitosamente' });

    } catch (error) {
        await connection.rollback();
        console.error('Error al eliminar ficha familiar:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    } finally {
        connection.release();
    }
};


module.exports = {
    getFichasFamiliares,
    registerNewFicha,
    asignarFichaFamiliar,
    getFichaFamiliarByCodigo,
    asignarJefeFamilia,
    deletePacienteFicha,
    deleteFichaFamiliar
};