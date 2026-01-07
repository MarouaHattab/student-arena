const Leaderboard = require('../models/Leaderboard');
const User = require('../models/User');
const Team = require('../models/Team');
const Submission = require('../models/Submission');

// Get users leaderboard
// GET /api/leaderboard/users
const getUsersLeaderboard = async (req, res) => {
  try {
    const users = await User.find()
      .select('firstName lastName userName points')
      .sort({ points: -1 })
      .limit(50);

    const leaderboard = users.map((user, index) => ({
      position: index + 1,
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      userName: user.userName,
      points: user.points || 0
    }));

    res.json(leaderboard);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// Get teams leaderboard
// GET /api/leaderboard/teams
const getTeamsLeaderboard = async (req, res) => {
  try {
    const teams = await Team.find({ status: 'active' })
      .select('name points members')
      .populate('members', 'firstName lastName')
      .sort({ points: -1 })
      .limit(50);

    const leaderboard = teams.map((team, index) => ({
      position: index + 1,
      _id: team._id,
      name: team.name,
      points: team.points || 0,
      memberCount: team.members.length
    }));

    res.json(leaderboard);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// Get project leaderboard
// GET /api/leaderboard/project/:projectId
const getProjectLeaderboard = async (req, res) => {
  try {
    const { projectId } = req.params;

    const submissions = await Submission.find({
      project: projectId,
      status: 'approved'
    })
      .populate('submittedByUser', 'firstName lastName userName')
      .populate('submittedByTeam', 'name')
      .sort({ score: -1, submittedAt: 1 });

    const leaderboard = submissions.map((submission, index) => ({
      position: index + 1,
      _id: submission._id,
      participant: submission.submittedByUser 
        ? {
            type: 'user',
            name: `${submission.submittedByUser.firstName} ${submission.submittedByUser.lastName}`,
            userName: submission.submittedByUser.userName
          }
        : {
            type: 'team',
            name: submission.submittedByTeam?.name
          },
      score: submission.score,
      ranking: submission.ranking,
      pointsAwarded: submission.pointsAwarded
    }));

    res.json(leaderboard);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// Get global leaderboard(users + teams)
// GET /api/leaderboard
const getGlobalLeaderboard = async (req, res) => {
  try {
    const { type, limit = 20 } = req.query;

    let result = {};

    if (!type || type === 'users') {
      const users = await User.find()
        .select('firstName lastName userName points')
        .sort({ points: -1 })
        .limit(parseInt(limit));

      result.users = users.map((user, index) => ({
        position: index + 1,
        _id: user._id,
        name: `${user.firstName} ${user.lastName}`,
        userName: user.userName,
        points: user.points || 0,
        type: 'user'
      }));
    }

    if (!type || type === 'teams') {
      const teams = await Team.find({ status: 'active' })
        .select('name points')
        .sort({ points: -1 })
        .limit(parseInt(limit));

      result.teams = teams.map((team, index) => ({
        position: index + 1,
        _id: team._id,
        name: team.name,
        points: team.points || 0,
        type: 'team'
      }));
    }

    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// Update leaderboard
// POST /api/leaderboard/update
const updateLeaderboard = async (req, res) => {
  try {
    // Get all users and update leaderboard
    const users = await User.find().sort({ points: -1 });

    // Delete old leaderboard entries
    await Leaderboard.deleteMany({ project: null });

    // Create new leaderboard entries for users
    const userEntries = users.map((user, index) => ({
      project: null, // Global leaderboard
      position: index + 1,
      user: user._id,
      points: user.points || 0,
      lastUpdated: new Date(),
      createdAt: new Date()
    }));

    // Get all teams and update leaderboard
    const teams = await Team.find({ status: 'active' }).sort({ points: -1 });

    const teamEntries = teams.map((team, index) => ({
      project: null, // Global leaderboard
      position: index + 1,
      team: team._id,
      points: team.points || 0,
      lastUpdated: new Date(),
      createdAt: new Date()
    }));

    // Insert all entries
    await Leaderboard.insertMany([...userEntries, ...teamEntries]);

    res.json({ message: 'Leaderboard updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// Get user position
// GET /api/leaderboard/user/:userId/position
const getUserPosition = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId).select('firstName lastName userName points');
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    // Compter combien d'utilisateurs ont plus de points
    const usersAhead = await User.countDocuments({ points: { $gt: user.points || 0 } });
    const position = usersAhead + 1;

    res.json({
      _id: user._id,
      name: `${user.firstName} ${user.lastName}`,
      userName: user.userName,
      points: user.points || 0,
      position
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// Get team position
// GET /api/leaderboard/team/:teamId/position
const getTeamPosition = async (req, res) => {
  try {
    const { teamId } = req.params;

    const team = await Team.findById(teamId).select('name points');
    if (!team) {
      return res.status(404).json({ message: 'Équipe non trouvée' });
    }

    // Compter combien d'équipes ont plus de points
    const teamsAhead = await Team.countDocuments({
      status: 'active',
      points: { $gt: team.points || 0 }
    });
    const position = teamsAhead + 1;

    res.json({
      _id: team._id,
      name: team.name,
      points: team.points || 0,
      position
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

module.exports = {
  getUsersLeaderboard,
  getTeamsLeaderboard,
  getProjectLeaderboard,
  getGlobalLeaderboard,
  updateLeaderboard,
  getUserPosition,
  getTeamPosition
};
