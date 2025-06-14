const express = require('express');
const router = express.Router();
const { 
    obtenerPacientes, 
    obtenerPacientePorTipo, 
    registrarPaciente,
    getPacienteHistoria,
    getPacienteDni,
    actualizarPaciente,
    getHistoriasDisponibles
} = require('../controllers/pacienteController')

// Feching paciente
router.get('/obtener-pacientes', obtenerPacientes);
// Feching paciente by type
router.get('/obtener-pacientes-por-tipo', obtenerPacientePorTipo);
// Registrar paciente
router.post('/registrar-paciente', registrarPaciente);
// Feching paciente by historia
router.get('/obtener-paciente-historia/:historia', getPacienteHistoria);
// Feching paciente by dni
router.get('/obtener-paciente-dni/:dni', getPacienteDni);
// Actualizar paciente
router.put('/actualizar-paciente/:id', actualizarPaciente);

// Obtener historias clínicas disponibles
router.get('/historias-disponibles', getHistoriasDisponibles);

module.exports = router;