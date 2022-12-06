const mysql = require('mysql')
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "Mysql@1010",
  database: "crud-operations"
});

 module.exports = db;


