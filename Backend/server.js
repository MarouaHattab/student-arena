require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

// Import des routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const teamRoutes = require('./routes/teamRoutes');
const projectRoutes = require('./routes/projectRoutes');
const submissionRoutes = require('./routes/submissionRoutes');
const leaderboardRoutes = require('./routes/leaderboardRoutes');
const teamInvitationRoutes = require('./routes/teamInvitationRoutes');
const aiRoutes = require('./routes/aiRoutes');

// Connexion à la base de données
connectDB();

const app = express();
const port = process.env.PORT || 5000;

// CORS Configuration
app.use(cors({
    origin: 'http://localhost:5173', 
    credentials: true 
}));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes API
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/submissions', submissionRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/invitations', teamInvitationRoutes);
app.use('/api/ai', aiRoutes);

// Route de test
app.get('/', (req, res) => {
  res.json({ 
    message: 'API MERN - Backend',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      users: '/api/users',
      teams: '/api/teams',
      projects: '/api/projects',
      submissions: '/api/submissions',
      leaderboard: '/api/leaderboard',
      invitations: '/api/invitations'
    }
  });
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

module.exports = app;