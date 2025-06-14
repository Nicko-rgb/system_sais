const express = require('express');
const router = express.Router();
const multer = require('multer');

// Configuración de multer para manejar archivos
const storage = multer.memoryStorage();
const upload = multer({ 
    storage: storage,
    fileFilter: (req, file, cb) => {
        // Verificar tipos de archivo permitidos
        if (file.mimetype === 'application/pdf' || 
            file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
            cb(null, true);
        } else {
            cb(null, false);
            cb(new Error('Solo se permiten archivos PDF o DOCX'));
        }
    }
});
const { 
    login,
    obtenerPersonal,
    registrarPersonal,
    getArchivoPersonal,
    deleteArchivoPersonal,
    editarPersonal,
    deletePersonal,
    obtenerSectorAsignado,
    asignarSector,
    eliminarAsignacion,
    getTurnoPersonal,
    getPersonalAll,
    getTiposTurno,
    registrarTurnoPersonal,
    deleteTurnosPasados,
    getFechasBloqueadas,
    guardarFechasBloqueadas,
    desbloquearFechaTurno,
    getProfesiones,
    getServicios,
    editProfesion,
    deleteProfesion,
    editServicio,
    deleteServicio,
    registrarProfesionServicio,
    activarInactivarPersonal
} = require('../controllers/personController')

// Login route
router.post('/login', login);
// Obtener todos los datos de personal salud
router.get('/obtener-personal-salud', obtenerPersonal);
// Registrar personal de salud
router.post('/registrar-personal', upload.single('file'), registrarPersonal);
// Obtener archivo de personal de salud
router.get('/user-get-documento/:id_personal', getArchivoPersonal);
// Eliminar archivo de personal de salud
router.put('/delete-archivo-personal/:id_personal', deleteArchivoPersonal);
// Editar personal de salud
router.put('/editar-personal', upload.single('file'), editarPersonal);
// Eliminar personal de salud
router.delete('/eliminar-personal/:id_personal', deletePersonal);
// Obtener el sector asignado de personal salud
router.get('/personal/obtener-sector-asignado', obtenerSectorAsignado);
// Ruta para asignar sector a personal)
router.post('/personal/asignar-sector', asignarSector);
// Ruta para eliminarpersonal del sector
router.delete('/personal/eliminar-sector/:id', eliminarAsignacion);
// Obtener el turno del personal
router.get('/obtener-turnos/personal', getTurnoPersonal);
//ruta para obtener todos los personales de salud para turos
router.get('/obtener-personal-for-turnos', getPersonalAll);
// Ruta para obtener los tipos de turno de personal de salud
router.get('/tipos-turno', getTiposTurno);
//ruta para guardar turnos de personal
router.post('/asignar-turno/personal', registrarTurnoPersonal);
//ruta para eliminar turnos pasados
router.delete('/eliminar-turnos-pasados', deleteTurnosPasados);
//ruta para obtner fecha bloquedad para personal de salud
router.get('/obtener-fechas-bloqueadas', getFechasBloqueadas);
//ruta para bloquear fechas de personal
router.post('/bloquear-fecha-turno', guardarFechasBloqueadas);
//Ruta para desbloquear la fecha bloqueada
router.post('/desbloquear-fecha-turno', desbloquearFechaTurno);
// Ruta para obtener todas las profesiones
router.get('/obtener/profesiones', getProfesiones);
// Ruta para obtener todos los servicios
router.get('/obtener/servicios', getServicios);
// Ruta para editar una profesión
router.put('/editar/profesion/:id', editProfesion);
// Ruta para eliminar una profesión
router.delete('/eliminar/profesion/:id', deleteProfesion);
// Ruta para editar un servicio
router.put('/editar/servicio/:id', editServicio);
// Ruta para eliminar un servicio
router.delete('/eliminar/servicio/:id', deleteServicio);
// Ruta para registrar una nueva profesión y servicio
router.post('/registrar/profesion-servicio', registrarProfesionServicio);
// Ruta para activar o inactivar un personal de salud
router.put('/personal-salud/:id_personal/estado', activarInactivarPersonal);

module.exports = router;