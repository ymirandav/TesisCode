const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../db');

const router = express.Router();
const saltRounds = 10;
const jwtSecret = 'my_super_secret_key_123!';  // Cambia esto por tu clave secreta generada

// Función para validar email
function validateEmail(email) {
    const re = /\S+@\S+\.\S+/;
    return re.test(email);
}

// Registro
router.post('/register', async (req, res) => {
    const { nombres, apellidos, email, password, dni } = req.body;

    // Verificar que todos los campos estén presentes
    if (!nombres || !apellidos || !email || !password || !dni) {
        return res.status(400).send('Todos los campos son requeridos');
    }

    // Validar email
    if (!validateEmail(email)) {
        return res.status(400).send('Email no válido');
    }

    // Validar longitud de la contraseña
    if (password.length < 6) {
        return res.status(400).send('La contraseña debe tener al menos 6 caracteres');
    }

    try {
        // Hashear la contraseña
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        const { rows } = await db.query(
            'INSERT INTO usuarios (nombres, apellidos, email, password, dni) VALUES ($1, $2, $3, $4, $5) RETURNING id, nombres, apellidos, email, dni',
            [nombres, apellidos, email, hashedPassword, dni]
        );
        const user = rows[0];
        res.status(201).json(user);
    } catch (err) {
        console.error(err);
        res.status(500).send('Error en el servidor');
    }
});

// Login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    // Verificar que todos los campos estén presentes
    if (!email || !password) {
        return res.status(400).send('Email y contraseña son requeridos');
    }

    try {
        const { rows } = await db.query('SELECT * FROM usuarios WHERE email = $1', [email]);
        const user = rows[0];

        // Comparar la contraseña hasheada
        if (user && await bcrypt.compare(password, user.password)) {
            const token = jwt.sign({ userId: user.id }, jwtSecret, { expiresIn: '1h' });
            res.json({ token });
        } else {
            res.status(401).send('Credenciales inválidas');
        }
    } catch (err) {
        console.error(err);
        res.status(500).send('Error en el servidor');
    }
});



module.exports = router;
