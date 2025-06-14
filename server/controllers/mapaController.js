const pool = require('../config/db');
require('dotenv').config();

// funcion para eliminar todas las notas de una manzana
const deleteAllNotasMz = async () => {
    try {
        const query = 'DELETE FROM notas_manzana';
        const result = await pool.query(query);
        return result;
    } catch (error) {
        console.error('Error al eliminar las notas de manzanas:', error);
        throw error;
    }
}

// funcion para eliminar todos los personales asignados a una manzana
const deleteAllAsignadosMz = async () => {
    try {
        const query = 'DELETE FROM sector_personal';
        const result = await pool.query(query);
        return result;
    } catch (error) {
        console.error('Error al eliminar las asignados de manzanas:', error);
        throw error;
    }
}

// funcion para obtener todas las notas de una manzana
const getNotasMz = async (req, res) => {
    try {
        const sql = 'SELECT * FROM notas_manzana ORDER BY fecha_recordatorio ASC';
        const [results] = await pool.query(sql);

        res.status(200).json(results);
    } catch (error) {
        console.error('Error al obtener notas:', error);
        res.status(500).json({ message: 'Error al obtener las notas.' });
    }
}

// funcion para registrar una nota en una manzana
const registrarNotaMz = async (req, res) => {
    const { id_manzana, codigo, manzana, nota, fechaRecordar } = req.body;

    // Consulta SQL para insertar los datos
    const sql = `
        INSERT INTO notas_manzana (id_manzana, codigo, manzana, nota, fecha_recordatorio) VALUES (?, ?, ?, ?, ?)`;

    try {
        await pool.query(sql, [id_manzana, codigo, manzana, nota, fechaRecordar || null]);
        res.status(201).json({ message: 'Nota registrada exitosamente.' });
    } catch (error) {
        console.error('Error al insertar los datos:', error);
        res.status(500).json({ message: 'Error al registrar la notaaa.' });
    }
}

// funcion para eliminar una nota de una manzana
const eliminarNotaMz = async (req, res) => {
    const { id } = req.params;

    try {
        const sql = 'DELETE FROM notas_manzana WHERE id_notas_manzana = ?';
        await pool.query(sql, [id]);

        res.status(200).json({ message: 'Nota eliminada con éxitooo.' });
    } catch (error) {
        console.error('Error al eliminar la nota:', error);
        res.status(500).json({ message: 'Error al eliminar la nota.' });
    }
}

// obtener fichas codigo ficha familiar para manzana
const getFichasMz = async (req, res) => {
    const connection = await pool.getConnection();
    try {
        const { mz } = req.params;
        const [rows] = await connection.execute(
            'SELECT codigo_ficha, jefe_familia FROM ficha_familiar WHERE manzana = ? ORDER BY codigo_ficha ASC',
            [mz]
        );
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al obtener fichas familiares' });
    } finally {
        connection.release();
    }
}

module.exports = {
    deleteAllNotasMz,
    deleteAllAsignadosMz,
    getNotasMz,
    registrarNotaMz,
    eliminarNotaMz,
    getFichasMz
}