require('dotenv').config();
const mysql = require('mysql2');

const DATABASE_URL = process.env.DATABASE_URL || '';

const pool = mysql.createPool(DATABASE_URL);
const getPromisePool = () => pool.promise();

module.exports = {
  getPromisePool,
};
