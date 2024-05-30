const express = require('express');
const router = express.Router();
const db = require('../db');

// Endpoint para obtener todas las paradas de una ruta específica
router.get('/stops/:routeId/:direction?', async (req, res) => {
    const routeId = req.params.routeId;
    const direction = req.params.direction; // 'ida', 'vuelta' o undefined

    let query = `
        SELECT p.nombre, p.latitud, p.longitud
        FROM Paradas p
        JOIN ParadasDeRuta pr ON p.parada_id = pr.parada_id
        WHERE pr.ruta_id = $1
    `;
    let queryParams = [routeId];

    if (direction) {
        query += ` AND pr.direccion = $2 ORDER BY pr.orden ASC;`;
        queryParams.push(direction);
    } else {
        query += ` ORDER BY pr.orden ASC;`;
    }

    try {
        const { rows } = await db.query(query, queryParams);
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

module.exports = router;
