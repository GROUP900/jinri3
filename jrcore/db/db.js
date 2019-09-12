const mysql = require('mysql2/promise');
//数据库 换成你自己的
var pool  = mysql.createPool({
  dateStrings:true,
  connectionLimit : 20,
  host            : 'localhost',
  user            : 'xxx',
  password        : 'xxx',
  database        : 'xxx'
});

module.exports = pool
