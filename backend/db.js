const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'infs7205_practice2',
  password: '200218',
  port: 5432
});

module.exports = pool;