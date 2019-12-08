require("dotenv").config();
const mysql = require("mysql");

const DB_HOST = process.env.MYSQL_HOST || "localhost";
const DB_USER = process.env.MYSQL_USER || "root";
const DB_PASSWORD = process.env.MYSQL_PASSWORD || "";
const DB_NAME = process.env.MYSQL_DATABASE || "";

let mysqlCon = null;

const connect = () => {
  mysqlCon = mysql.createConnection({
    host: DB_HOST,
    user: DB_USER,
    password: DB_PASSWORD,
    database: DB_NAME
  });
  mysqlCon.connect(err => {
    if (err) throw err;
    console.log("Connected!");
  });
};

const getConnection = () => {
  if (mysqlCon) {
    return mysqlCon;
  }
  throw new Error("MySQL connection not established!");
};

module.exports = {
  connect,
  getConnection
};
