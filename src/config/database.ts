import mysql from 'mysql2/promise'

// MySQL Connection
const db = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '123456',
  database: 'notes',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});



  
 export default db  