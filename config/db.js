var mysql = require('mysql2'); 
var mysqlPool = mysql.createPool({ 
    connectionLimit: 10,  
    host: 'localhost',
    user: 'root', 
    password: '', 
    database: 'construction_app_admin', 
    waitForConnections: true,
    debug    :  false,   
    queueLimit: 30,
    connectTimeout:40000,
    multipleStatements: true
  });   

  // Attempt to catch disconnects 
  mysqlPool.on('connection', function (connection) {
  console.log('DB Connection established');

  mysqlPool.on('error', function (err) {
    console.error( 'MySQL error', err.code);
  }); 
  mysqlPool.on('close', function (err) {
    console.error(  'MySQL close', err); 
  }); 
 
});
mysqlPool.on('error', function (connection) {
  console.error( 'MySQL error', err.code); 
}); 
module.exports = mysqlPool; 

// var mysql = require('mysql2'); 
// var mysqlPool = mysql.createPool({
//     connectionLimit : 100,
//     host: 'localhost',
//     user: 'root',
//     password: '', 
//     database: 'dealingapp',
//   }); 
 
// module.exports = mysqlPool;



