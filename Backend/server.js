require('dotenv').config();
const express = require('express');
const connectDB = require('./config/db');

// Connexion à la base de données
connectDB();

const app = express();
const port = process.env.PORT || 3000;

// CORS Configuration
app.use(cors({
    origin: 'http://localhost:5173', 
    credentials: true 
}));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Route de test
app.get('/', (req, res) => {
  res.json({ message: 'API MERN TP5 - Gestion de cours' });
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});