const express = require('express');
const router = express.Router();

const {
    getSystemController,
    toggleDniHistoriaConfig
} = require('../controllers/systemController');

router.get('/system/get-config', getSystemController);
router.put('/configuracion/dni-historia/toggle', toggleDniHistoriaConfig);

module.exports = router;