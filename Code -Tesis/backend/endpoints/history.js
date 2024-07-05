const express = require('express');
const router = express.Router();
const db = require('../db');
const jwt = require('jsonwebtoken');

const jwtSecret = 'my_super_secret_key_123!';  // Clave secreta para JWT

// Middleware para verificar el token
function verifyToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    if (!authHeader) return res.status(403).send('Token requerido');

    const token = authHeader.split(' ')[1];
    if (!token) return res.status(403).send('Token requerido');

    jwt.verify(token, jwtSecret, (err, decoded) => {
        if (err) {
            console.error('Token inválido:', err);
            return res.status(500).send('Token inválido');
        }
        req.userId = decoded.userId;
        next();
    });
}

// Endpoint para guardar una ruta en el historial
router.post('/history', verifyToken, async (req, res) => {
    const { origen, destino, precio } = req.body;

    console.log('Datos recibidos:', { origen, destino, precio, userId: req.userId });

    try {
        const { rows } = await db.query(
            'INSERT INTO historial (usuario_id, origen, destino, precio) VALUES ($1, $2, $3, $4) RETURNING *',
            [req.userId, origen, destino, precio]
        );
        res.status(201).json(rows[0]);
    } catch (err) {
        console.error('Error en el servidor:', err);
        res.status(500).send('Error en el servidor');
    }
});

// Endpoint para obtener el historial de rutas de un usuario
router.get('/history', verifyToken, async (req, res) => {
    try {
        const { rows } = await db.query(
            'SELECT * FROM historial WHERE usuario_id = $1 ORDER BY fecha DESC',
            [req.userId]
        );
        res.json(rows);
    } catch (err) {
        console.error('Error en el servidor:', err);
        res.status(500).send('Error en el servidor');
    }
});

module.exports = router;
