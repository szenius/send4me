require("dotenv").config();
const mysql = require("mysql2/promise");

const DATABASE_URL = process.env.DATABASE_URL || "";

let mysqlCon = null;

const getConnection = () => {
  return mysql.createConnection(DATABASE_URL);
};

module.exports = {
  getConnection
};
