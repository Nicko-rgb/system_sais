require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cron = require('node-cron');
const pool = require('./config/db');
const personRoutes = require('./routes/personRoute');
const pacienteRoutes = require('./routes/pacienteRoute')
const citaRoute = require('./routes/citaRoute');
const mapaRoutes = require('./routes/mapaRoute');
const fichasFamiRoute = require('./routes/fichaFamilyRoute')
const stadistRoutes = require('./routes/stadistRoute');
const systemRoutes = require('./routes/systemRoute');

const app = express();

// Middleware
app.use(cors());
// Aumentar el límite de tamaño permitido
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));


// Routes
app.use('/api', personRoutes);

app.use('/api', pacienteRoutes);

app.use('/api', citaRoute);

app.use('/api', mapaRoutes);

app.use('/api', fichasFamiRoute)

app.use('/api', stadistRoutes)

app.use('/api', systemRoutes)


// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Algo salió mal!' });
});





//********************************************************************************************* */

// Ruta para actualizar todos los pacientes 
app.put('/api/pacientes/actualizar-todos', async (req, res) => {
    const query = `
        UPDATE pacientes 
        SET 
            edad = YEAR(CURDATE()) - YEAR(fecha_nacimiento) - (DATE_FORMAT(CURDATE(), '%m%d') < DATE_FORMAT(fecha_nacimiento, '%m%d')),
            tipo_paciente = CASE 
                WHEN YEAR(CURDATE()) - YEAR(fecha_nacimiento) - (DATE_FORMAT(CURDATE(), '%m%d') < DATE_FORMAT(fecha_nacimiento, '%m%d')) <= 11 THEN 'Niño'
                WHEN YEAR(CURDATE()) - YEAR(fecha_nacimiento) - (DATE_FORMAT(CURDATE(), '%m%d') < DATE_FORMAT(fecha_nacimiento, '%m%d')) >= 12 AND YEAR(CURDATE()) - YEAR(fecha_nacimiento) - (DATE_FORMAT(CURDATE(), '%m%d') < DATE_FORMAT(fecha_nacimiento, '%m%d')) < 18 THEN 'Adolescente'
                WHEN YEAR(CURDATE()) - YEAR(fecha_nacimiento) - (DATE_FORMAT(CURDATE(), '%m%d') < DATE_FORMAT(fecha_nacimiento, '%m%d')) >= 18 AND YEAR(CURDATE()) - YEAR(fecha_nacimiento) - (DATE_FORMAT(CURDATE(), '%m%d') < DATE_FORMAT(fecha_nacimiento, '%m%d')) <= 29 THEN 'Joven'
                WHEN YEAR(CURDATE()) - YEAR(fecha_nacimiento) - (DATE_FORMAT(CURDATE(), '%m%d') < DATE_FORMAT(fecha_nacimiento, '%m%d')) >= 30 AND YEAR(CURDATE()) - YEAR(fecha_nacimiento) - (DATE_FORMAT(CURDATE(), '%m%d') < DATE_FORMAT(fecha_nacimiento, '%m%d')) <= 59 THEN 'Adulto'
                ELSE 'Adulto Mayor'
            END
    `;

    try {
        await pool.query(query); // Usar promesas aquí
        res.json({ message: 'Datos de todos los pacientes actualizados correctamente' });
    } catch (error) {
        console.error('Error al actualizar los datos de los pacientes:', error);
        return res.status(500).json({ error: 'Error al actualizar los datos de los pacientes' });
    }
});

// Programar el cron job para que se ejecute diariamente a medianoche
cron.schedule('0 0 * * *', async () => {
    console.log('Actualizando datos de todos los pacientes...');
    try {
        await pool.query(`UPDATE pacientes SET 
            edad = YEAR(CURDATE()) - YEAR(fecha_nacimiento) - (DATE_FORMAT(CURDATE(), '%m%d') < DATE_FORMAT(fecha_nacimiento, '%m%d')),
            tipo_paciente = CASE 
                WHEN YEAR(CURDATE()) - YEAR(fecha_nacimiento) - (DATE_FORMAT(CURDATE(), '%m%d') < DATE_FORMAT(fecha_nacimiento, '%m%d')) <= 11 THEN 'Niño'
                WHEN YEAR(CURDATE()) - YEAR(fecha_nacimiento) - (DATE_FORMAT(CURDATE(), '%m%d') < DATE_FORMAT(fecha_nacimiento, '%m%d')) >= 12 AND YEAR(CURDATE()) - YEAR(fecha_nacimiento) - (DATE_FORMAT(CURDATE(), '%m%d') < DATE_FORMAT(fecha_nacimiento, '%m%d')) < 18 THEN 'Adolescente'
                WHEN YEAR(CURDATE()) - YEAR(fecha_nacimiento) - (DATE_FORMAT(CURDATE(), '%m%d') < DATE_FORMAT(fecha_nacimiento, '%m%d')) >= 18 AND YEAR(CURDATE()) - YEAR(fecha_nacimiento) - (DATE_FORMAT(CURDATE(), '%m%d') < DATE_FORMAT(fecha_nacimiento, '%m%d')) <= 29 THEN 'Joven'
                WHEN YEAR(CURDATE()) - YEAR(fecha_nacimiento) - (DATE_FORMAT(CURDATE(), '%m%d') < DATE_FORMAT(fecha_nacimiento, '%m%d')) >= 30 AND YEAR(CURDATE()) - YEAR(fecha_nacimiento) - (DATE_FORMAT(CURDATE(), '%m%d') < DATE_FORMAT(fecha_nacimiento, '%m%d')) <= 59 THEN 'Adulto'
                ELSE 'Adulto Mayor'
            END`);
        console.log('Datos de todos los pacientes actualizados correctamente.');
    } catch (error) {
        console.error('Error al actualizar los datos de los pacientes:', error);
    }
});

const PORT = process.env.PORT || 5030;
app.listen(PORT, () => {
});

app.listen(PORT, '0.0.0.0', () => {
    console.log('Servidor Express escuchando en todas las IPs locales, puerto ', PORT);
    console.log(`http://localhost:5030`);
});  