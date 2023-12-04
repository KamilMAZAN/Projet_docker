const express = require('express');
const bodyParser = require('body-parser');
const { Pool } = require('pg');
const { MongoClient } = require('mongodb');

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

// MongoDB configuration
const mongoUri = 'mongodb://mongodb:27017';
const mongoClient = new MongoClient(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });

app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

app.post('/submit', async (req, res) => {
  const data = req.body.data;

  try {
    // PostgreSQL
    const pgClient = await pgPool.connect();
    await pgClient.query('INSERT INTO mytable (data) VALUES ($1)', [data]);
    pgClient.release();

    // MongoDB
    await mongoClient.connect();
    const mongoDatabase = mongoClient.db('data');
    const mongoCollection = mongoDatabase.collection('mycollection');
    await mongoCollection.insertOne({ data: data });

    res.send('Data Submitted Successfully to PostgreSQL and MongoDB!');
  } catch (error) {
    console.error(error);
    res.status(500).send('Error submitting data to databases');
  } finally {
    await mongoClient.close();
  }
});

app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
});

