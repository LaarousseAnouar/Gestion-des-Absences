const { Client } = require('pg');
require('dotenv').config();

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

client.connect()
  .then(() => console.log('📡 Connected to Render PostgreSQL!'))
  .catch(err => console.error('❌ Connection error', err.stack));

module.exports = client;

