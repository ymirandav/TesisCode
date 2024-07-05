const express = require('express');
const router = express.Router();
const db = require('../db');

// Endpoint para obtener las rutas
router.get('/routes', async (req, res) => {
    try {
        const { rows } = await db.query('SELECT * FROM rutas');
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

module.exports = router;
