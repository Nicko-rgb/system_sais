const express = require('express');
const router = express.Router();
const { 
    getPacientesPorTiempo,
    getDistribucionTipo,
    getGeneroDistribution,
    getCitasPorTiempo
} = require('../controllers/stadistController');

router.get('/stadist/registros-por-tiempo', getPacientesPorTiempo);
router.get('/stadist/distribucion-tipo', getDistribucionTipo);
router.get('/stadist/distribucion-genero', getGeneroDistribution);
router.get('/stadist/citas-por-tiempo', getCitasPorTiempo);

module.exports = router;