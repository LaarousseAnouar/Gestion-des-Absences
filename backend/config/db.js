const { Client } = require('pg');

const client = new Client({
  user: 'postgres',
  host: 'localhost',
  database: 'anouar',
  password: '0000',
  port: 5432,
});

client.connect();

module.exports = client;
