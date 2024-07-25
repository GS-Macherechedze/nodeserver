require('dotenv').config();
const mysql = require('mysql2/promise');

async function createDatabaseIfNotExists(connection) {
  try {
    const createDbQuery = `CREATE DATABASE IF NOT EXISTS \`${process.env.DB_DATABASE}\``;
    await connection.query(createDbQuery);
    console.log(`Database ${process.env.DB_DATABASE} created or already exists.`);
  } catch (err) {
    console.error('Error creating database:', err);
  }
}

async function createTableIfNotExists(connection) {
  try {
    await connection.query(`USE \`${process.env.DB_DATABASE}\``);

    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS admin (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        age INT NOT NULL
      )
    `;
    await connection.query(createTableQuery);
    console.log('Table `admin` created or already exists.');
  } catch (err) {
    console.error('Error creating table:', err);
  }
}

async function insertData(connection) {
  try {
    const data = { name: 'John Doe', age: 30 };

    const sql = 'INSERT INTO admin (name, age) VALUES (?, ?)';

    const [results] = await connection.execute(sql, [data.name, data.age]);
    console.log('Data inserted:', results.insertId);
  } catch (err) {
    console.error('Error inserting data:', err);
  }
}

async function fetchData(connection) {
  try {
    await connection.query(`USE \`${process.env.DB_DATABASE}\``);

    const [rows] = await connection.execute('SELECT * FROM admin');
    console.log('Fetched data:', rows);
  } catch (err) {
    console.error('Error fetching data:', err);
  }
}

async function run() {
  let connection;

  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD
    });

    console.log('Connected to the database.');

    await createDatabaseIfNotExists(connection);

    await connection.changeUser({
      database: process.env.DB_DATABASE
    });

    await createTableIfNotExists(connection);

    await insertData(connection);

    await fetchData(connection);

  } catch (err) {
    console.error('Error:', err);
  } finally {
    if (connection) {
      await connection.end();
      console.log('Connection closed.');
    }
  }
}

run();
