const pool = require('../config/db');
require('dotenv').config();

const getSystemController = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM config_system');
        res.json(rows); // aquí se envía el array directamente
    } catch (error) {
        console.error('Error retrieving system data:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

const toggleDniHistoriaConfig = async (req, res) => {
    try {
        // Obtener el valor actual (usando `?` para MySQL)
        const [result] = await pool.query(
            'SELECT valorBln FROM config_system WHERE nombre_config = ?',
            ['dni_historia']
        );

        if (result.length === 0) {
            return res.status(404).json({ error: 'Configuración no encontrada' });
        }

        const valorActual = result[0].valorBln;
        const nuevoValor = !valorActual;

        // Actualizar con el valor invertido
        await pool.query(
            'UPDATE config_system SET valorBln = ? WHERE nombre_config = ?',
            [nuevoValor, 'dni_historia']
        );

        res.json({
            message: 'Configuración actualizada correctamente',
            nuevoValor
        });
    } catch (error) {
        console.error('Error al alternar configuración:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

module.exports = {
    getSystemController,
    toggleDniHistoriaConfig
};
