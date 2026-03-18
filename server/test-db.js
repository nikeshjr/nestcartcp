const mysql = require('mysql2/promise');
require('dotenv').config();

async function testConnection() {
  const url = process.env.DATABASE_URL;
  console.log('Testing connection to:', url);
  try {
    const connection = await mysql.createConnection(url);
    console.log('Connection successful!');
    const [rows] = await connection.execute('SELECT 1 + 1 AS solution');
    console.log('Query successful! Solution:', rows[0].solution);
    await connection.end();
  } catch (error) {
    console.error('Connection failed:', error.message);
  }
}

testConnection();
