require("dotenv").config();
const mysql = require("mysql");

const DATABASE_URL = process.env.DATABASE_URL || "";

let mysqlCon = null;

const connect = () => {
  mysqlCon = mysql.createConnection(DATABASE_URL);
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
