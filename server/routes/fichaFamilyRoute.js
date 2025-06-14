const express = require('express');
const router = express.Router();
const {
    getFichasFamiliares,
    registerNewFicha,
    asignarFichaFamiliar,
    getFichaFamiliarByCodigo,
    asignarJefeFamilia,
    deletePacienteFicha,
    deleteFichaFamiliar
} = require('../controllers/fichaFamilyController')

// ruta para obtener fichas familiares 
router.get('/ficha/get-fichas-familiares', getFichasFamiliares);
// ruta reistrar nueva ficha
router.post('/ficha/register-ficha', registerNewFicha)
// ruta para asignar paciente a ficha familiar
router.post('/ficha/asignar-paciente', asignarFichaFamiliar);
// ruta para obtener ficha familiar por codigo
router.get('/ficha/get-ficha-familiar/:codigo', getFichaFamiliarByCodigo);
// ruta para asignar jefe de familia
router.post('/ficha/asing-jefe-familia', asignarJefeFamilia);
// ruta para eliminar paciente de ficha
router.post('/ficha/delete-paciente-ficha', deletePacienteFicha);
// ruta para eliminar ficha familiar
router.delete('/ficha/delete-ficha', deleteFichaFamiliar);

module.exports = router;