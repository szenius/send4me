require("dotenv").config();
const mysql = require("mysql");

const DATABASE_URL = process.env.DATABASE_URL || "";

let mysqlCon = null;

const connect = () => {
  mysqlCon = mysql.createConnection(DATABASE_URL);
  mysqlCon.connect(err => {
    if (err) throw err;
    console.log("Connected to MySQL db server");
  });
};

const getConnection = () => {
  mysqlCon.on("error", function(err) {
    if (err.code === "PROTOCOL_CONNECTION_LOST") {
      console.log("Lost MySQL db server connection, reconnecting...");
      connect();
      return mysqlCon;
    } else {
      throw err;
    }
  });

  if (mysqlCon) {
    return mysqlCon;
  }
  throw new Error("Could not connect to MySQL db server");
};

module.exports = {
  connect,
  getConnection
};
