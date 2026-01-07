const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// generate token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE
  });
};

// register
//POST /api/auth/register
const register = async (req, res) => {
  try {
    const { firstName, lastName, email, password, userName } = req.body;

    // verifier si l'utilisateur existe deja
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'Cet email est déjà utilisé' });
    }

    // verifier si le nom d'utilisateur existe deja
    const userNameExists = await User.findOne({ userName });
    if (userNameExists) {
      return res.status(400).json({ message: 'Ce nom d\'utilisateur est déjà pris' });
    }

    // determine user role
    // first user becomes admin automatically
    let role = 'user';
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      role = 'admin';
    }

    // hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // create user
    const user = await User.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      userName,
      role,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        userName: user.userName,
        role: user.role,
        points: user.points || 0,
        registeredProjects: user.registeredProjects || [],
        createdAt: user.createdAt,
        token: generateToken(user._id)
      });
    } else {
      res.status(400).json({ message: 'Donnees utilisateur invalides' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// login
//POST /api/auth/login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // verifier si l'utilisateur existe
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
    }

    // Vérifier le mot de passe
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
    }

    res.json({
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      userName: user.userName,
      role: user.role,
      isTeamLeader: user.isTeamLeader,
      team: user.team,
      points: user.points,
      registeredProjects: user.registeredProjects || [],
      createdAt: user.createdAt,
      token: generateToken(user._id)
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// logout
//POST /api/auth/logout
const logout = async (req, res) => {
  try {
    // Côté serveur, on ne peut pas invalider un JWT
    // La déconnexion se fait côté client en supprimant le token
    res.json({ message: 'Déconnexion réussie' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// get me
//GET /api/auth/me
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select('-password')
      .populate('team', 'name')
      .populate('submissions');

    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// refresh token
//POST /api/auth/refresh-token
const refreshToken = async (req, res) => {
  try {
    const token = generateToken(req.user._id);
    res.json({ token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

module.exports = {
  register,
  login,
  logout,
  getMe,
  refreshToken
};
