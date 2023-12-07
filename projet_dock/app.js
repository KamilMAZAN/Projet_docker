const express = require('express');
const bodyParser = require('body-parser');
const { Pool } = require('pg');
const redis = require('redis');

const app = express();
const port = 80;

// PostgreSQL configuration
const pgPool = new Pool({
  user: 'user',
  host: 'postgres',
  database: 'data',
  password: 'user',
  port: 5432,
});

// Redis configuration
const redisClient = redis.createClient({ host: 'redis', port: 6379 });

app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

app.post('/submit', async (req, res) => {
  const data = req.body.data;
  console.log('Received data:', data);

  try {
    // PostgreSQL
    const pgClient = await pgPool.connect();
    await pgClient.query('INSERT INTO mytable (data) VALUES ($1)', [data]);
    pgClient.release();

    // Redis
    // Use a set instead of a list if each data entry should be unique
    redisClient.sadd('myset', data);

    console.log('Data submitted successfully!');
    res.send('Data Submitted Successfully to PostgreSQL and Redis!');
  } catch (error) {
    console.error('Error submitting data:', error);
    console.error(error);
    res.status(500).send('Error submitting data to databases');
  }
});

app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
});
