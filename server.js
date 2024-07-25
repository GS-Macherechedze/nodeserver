require('dotenv').config();
const mysql = require('mysql2/promise');

async function createDatabaseIfNotExists(connection) {
  try {
    // Create the database if it doesn't exist
    const createDbQuery = `CREATE DATABASE IF NOT EXISTS \`${process.env.DB_DATABASE}\``;
    await connection.query(createDbQuery);
    console.log(`Database ${process.env.DB_DATABASE} created or already exists.`);
  } catch (err) {
    console.error('Error creating database:', err);
  }
}

async function createTableIfNotExists(connection) {
  try {
    // Use the database
    await connection.query(`USE \`${process.env.DB_DATABASE}\``);

    // Create the table if it doesn't exist
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        age INT NOT NULL
      )
    `;
    await connection.query(createTableQuery);
    console.log('Table `users` created or already exists.');
  } catch (err) {
    console.error('Error creating table:', err);
  }
}

async function insertData() {
  let connection;

  try {
    // Create a connection to the database (initially to check or create the database)
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD
    });

    console.log('Connected to the database.');

    // Create database if it does not exist
    await createDatabaseIfNotExists(connection);

    // Reconnect to the database, now using the specific database
    await connection.changeUser({
      database: process.env.DB_DATABASE
    });

    // Create table if it does not exist
    await createTableIfNotExists(connection);

    // Data to be inserted
    const data = { name: 'John Doe', age: 30 };

    // SQL query for insertion
    const sql = 'INSERT INTO users (name, age) VALUES (?, ?)';

    // Execute the query
    const [results] = await connection.execute(sql, [data.name, data.age]);
    console.log('Data inserted:', results.insertId);

  } catch (err) {
    console.error('Error:', err);
  } finally {
    if (connection) {
      await connection.end();
      console.log('Connection closed.');
    }
  }
}

insertData();
