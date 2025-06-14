const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer();
const { 
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
    alternarEstadoEspecialidad,
    crearHorario,
    actualizarHorario,
    eliminarHorario,
    eliminarCitasPasadas
} = require('../controllers/citasController');

// Ruta para obtener especialidades únicas
router.get('/nino/especialidad-unico-nino', getEspecialiadUnica)
// ruta para obtener citas próximas a 3 días
router.get('/obtener-citas-3', obtenerCitas3);
// Route para obtener todas las citas de los niños con datos del paciente
router.get('/filtrar-todas-citas-ninho', obtenerCitasAll);
//api para consultar si el horario (hora) es bloqueda en cita niño
router.get('/nino/verificar-bloqueos-cita', getBloqueosCitas);
//ruta para obtner horarios de cita de niños
router.get('/nino/horarios-cita', getHorariosCita);
//ruta para consultar si el horario (hora) es bloqueda en cita niño
// router.get('/nino/verificar-bloqueos-cita', getBloqueoCita);
// ruta para bloquear hora en cita niño
router.post('/nino/bloquear-hora-cita', bloquearHoraCita);
// ruta para desbloquear hora en cita niño
router.delete('/nino/desbloquear-hora-cita', desbloquearHoraCita);
//ruta para registrar cita niño
router.post('/nino/registrar-cita', registrarCita);
//ruta para editar cita niño
router.put('/nino/edit-cita/:id', editarCita);
//ruta para borrar cita niño
router.delete('/nino/delete-cita/:id', borrarCita);
// ruta para crear nueva especialidad
router.post('/nino/crear-especialidad', upload.single('icono'), crearEspecialidad);
// ruta para eliminar especialidad
router.put('/nino/estado-especialidad/:id', alternarEstadoEspecialidad);

// rutas para gestión de horarios
router.post('/nino/crear-horario', crearHorario);
router.put('/nino/actualizar-horario/:id', actualizarHorario);
router.delete('/nino/eliminar-horario/:id', eliminarHorario);
// Ruta para eliminar citas pasadas
router.delete('/nino/eliminar-citas-pasadas/:especialidad', eliminarCitasPasadas);

module.exports = router;