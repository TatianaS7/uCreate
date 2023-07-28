// dbConfig.js

const mysql = require('mysql2');

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'process.env.DB_PASSWORD',
  database: 'uCreate',
};

const pool = mysql.createPool(dbConfig);

module.exports = pool;
