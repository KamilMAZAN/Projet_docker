const express = require('express');
const bodyParser = require('body-parser');
const { Pool } = require('pg');
const { Client } = require('@elastic/elasticsearch');

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

// Elasticsearch configuration
const esClient = new Client({ node: 'http://elasticsearch:9200' });

// Vérifier l'existence de l'index et le créer si nécessaire
async function ensureIndexExists() {
  const { body: indexExists } = await esClient.indices.exists({ index: 'myindex' });

  if (!indexExists) {
    await esClient.indices.create({ index: 'myindex' });
  }
}


app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

// Appeler cette fonction avant de démarrer le serveur
ensureIndexExists();


app.post('/submit', async (req, res) => {
  const data = req.body.data;

  try {
    // PostgreSQL
    const pgClient = await pgPool.connect();
    await pgClient.query('INSERT INTO mytable (data) VALUES ($1)', [data]);
    pgClient.release();

    // Elasticsearch
    await esClient.index({
      index: 'myindex',
      body: { data: data },
    });

    res.send('Data Submitted Successfully to PostgreSQL and Elasticsearch!');
  } catch (error) {
    console.error(error);
    res.status(500).send('Error submitting data to databases');
  }
});

app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
});

