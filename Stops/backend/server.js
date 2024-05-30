const cors = require('cors');
const express = require('express');
const path = require('path');
const routesEndpoints = require('./endpoints/routes');
const stopsEndpoints = require('./endpoints/stops');
const authEndpoints = require('./endpoints/auth');
const historyEndpoints = require('./endpoints/history');

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

// Usar endpoints
app.use('/api', routesEndpoints);
app.use('/api', stopsEndpoints);
app.use('/api', authEndpoints);
app.use('/api', historyEndpoints);

app.use(express.static(path.join(__dirname, 'frontend')));

// Rutas adicionales
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend', 'test.html'));
});

app.get('/selectRoute', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend', 'consultRoute.html'));
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
