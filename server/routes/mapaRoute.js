const express = require('express');
const router = express.Router();
const { 
    deleteAllAsignadosMz, 
    deleteAllNotasMz,
    getNotasMz,
    registrarNotaMz,
    eliminarNotaMz,
    getFichasMz
} = require('../controllers/mapaController')

// ruta para eliminar todos los personales asignados a una manzana
router.delete('/map/eliminar-todos-asignados', deleteAllAsignadosMz);
// ruta para eliminar todas las notas de una manzana
router.delete('/map/eliminar-todas-notas', deleteAllNotasMz);
// Ruta para obtener notas de las manzanas 
router.get('/map/notas-manzana', getNotasMz);
// Ruta para registrar un nota de las manzanas del mapa
router.post('/map/registrar-nota-manzana', registrarNotaMz);
// Ruta para eliminar una nota por ID
router.delete('/map/eliminar-nota-manzana/:id', eliminarNotaMz);
// Ruta para obtener fichas por manzana
router.get('/map/fichas-manzana/:mz', getFichasMz);


module.exports = router;