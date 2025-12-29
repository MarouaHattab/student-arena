require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

// Connexion à la base de données
connectDB();

const app = express();
const port = process.env.PORT ;




// Route de test
app.get('/', (req, res) => {
  res.json({ message: 'API MERN - Backend' });
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

module.exports = app;