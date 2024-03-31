const sql = require('mysql2');
const connection = sql.createConnection({ 
   host : 'localhost',
   user : 'root',
   password : '',
   database : 'craft_db'

})


module.exports = connection;