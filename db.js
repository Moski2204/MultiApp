// db.js
const mysql = require('mysql');
const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config({ path: './.env' });

// Create a connection to the database using environment variables
const db = mysql.createConnection({
  host: process.env.DATABASE_HOST,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE
});

// Connect to the database
db.connect((error) => {
  if (error) {
    console.error('Database connection error:', error);
  } else {
    console.log('MySQL Connected...');
  }
});

// Export the db connection for use in other files
module.exports = db;
