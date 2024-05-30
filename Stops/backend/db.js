const { Pool } = require('pg');

// Configura la conexión a la base de datos
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'SIT',
    password: '1786',
    port: 5432,
});

module.exports = {
    query: (text, params) => pool.query(text, params),
};