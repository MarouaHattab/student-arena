const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Project = require('./models/Project');
const Team = require('./models/Team');
const Submission = require('./models/Submission');

dotenv.config();

const firstNames = ['Yassine', 'Ines', 'Omar', 'Sarah', 'Mehdi', 'Layla', 'Sami', 'Nour', 'Adam', 'Kenza', 'Rayan', 'Lina', 'Amine', 'Myriam', 'Sofiane', 'Zeryeb', 'Maya', 'Kais', 'Salma', 'Idris'];
const lastNames = ['Trabelsi', 'Mansouri', 'Gharbi', 'Ayari', 'Brahimi', 'Rekik', 'Jendoubi', 'Hattab', 'Zouari', 'Ben Salem', 'Kallel', 'Bouaziz', 'Dridi', 'Louati', 'Feki', 'Hamdi', 'Nasri', 'Cherif', 'Masmoudi', 'Abid'];
const skills = ['React', 'Node.js', 'Python', 'Machine Learning', 'UI/UX', 'Cloud Computing', 'Cybersecurity', 'Blockchain', 'Mobile Dev', 'DevOps', 'Data Science', 'NLP'];
const projectTitles = [
  'Eco-Smart Monitor', 'AI Study Hub', 'HealthTrack Pro', 'CryptoWave Platform', 'Green Energy Ledger', 
  'Cloud Archive', 'Robo-Chef Assistant', 'Space Explorer VR', 'Social Net Zero', 'Quantum Chess',
  'Code Mentor IA', 'Bio-Shield App', 'Fintech Pulse', 'Logi-Stream AI', 'Medi-Connect',
  'Edu-Verse VR', 'Agri-Sustain App', 'Secure-Vault VPN', 'Auto-Pilot UAV', 'Emotion-Sync'
];
const teamNames = ['Neural Knights', 'Silicon Soul', 'Cloud Core', 'Void Runners', 'Cyber Sentinels', 'Binary Beasts', 'Logic Lords', 'Data Dynamos', 'Pixel Pioneers', 'Tech Titans'];

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connecté à MongoDB pour le seeding massif...');

    // Nettoyage des données
    await User.deleteMany();
    await Project.deleteMany();
    await Team.deleteMany();
    await Submission.deleteMany();
    console.log('Données existantes supprimées.');

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);

    // 1. Création de l'Admin
    const adminUser = await User.create({
      firstName: 'Admin',
      lastName: 'System',
      email: 'admin@arena.com',
      password: hashedPassword,
      userName: 'admin',
      role: 'admin',
      bio: 'Administrateur principal de Student Arena.'
    });

    // 2. Création de 50 Utilisateurs
    const usersToCreate = [];
    for (let i = 0; i < 50; i++) {
      const fName = firstNames[Math.floor(Math.random() * firstNames.length)];
      const lName = lastNames[Math.floor(Math.random() * lastNames.length)];
      const uName = `${fName.toLowerCase()}_${lName.toLowerCase()}_${i}`;
      
      usersToCreate.push({
        firstName: fName,
        lastName: lName,
        email: `${uName}@test.com`,
        password: hashedPassword,
        userName: uName,
        role: 'user',
        points: Math.floor(Math.random() * 500),
        bio: `Ingénieur passionné par ${skills[Math.floor(Math.random() * skills.length)]} et ${skills[Math.floor(Math.random() * skills.length)]}.`
      });
    }
    const createdUsers = await User.insertMany(usersToCreate);
    console.log(`${createdUsers.length} utilisateurs créés.`);

    // 3. Création de 10 Équipes
    const teamsToCreate = [];
    const usedUserIndices = new Set();

    for (let i = 0; i < 10; i++) {
      // Pick a leader who isn't already in a team
      let leaderIndex;
      do {
        leaderIndex = Math.floor(Math.random() * createdUsers.length);
      } while (usedUserIndices.has(leaderIndex));
      usedUserIndices.add(leaderIndex);

      const leader = createdUsers[leaderIndex];
      const members = [leader._id];
      
      // Add 2-4 more members
      const memberCount = Math.floor(Math.random() * 3) + 2;
      for (let j = 0; j < memberCount; j++) {
        let memberIdx;
        do {
          memberIdx = Math.floor(Math.random() * createdUsers.length);
        } while (usedUserIndices.has(memberIdx));
        usedUserIndices.add(memberIdx);
        members.push(createdUsers[memberIdx]._id);
      }

      teamsToCreate.push({
        name: teamNames[i],
        description: `L'équipe ${teamNames[i]} spécialisée dans l'innovation et la performance technologique.`,
        slogan: 'L\'innovation au service de demain',
        leaders: [leader._id],
        members: members,
        points: Math.floor(Math.random() * 1000),
        invitationCode: `TEAM-${teamNames[i].substring(0,3).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`
      });
    }

    const createdTeams = await Team.insertMany(teamsToCreate);
    
    // Mettre à jour les utilisateurs avec leurs IDs d'équipe
    for (const team of createdTeams) {
      await User.updateMany({ _id: { $in: team.members } }, { team: team._id });
      await User.findByIdAndUpdate(team.leaders[0], { isTeamLeader: true });
    }
    console.log(`${createdTeams.length} équipes créées.`);

    // 4. Création de 20 Projets
    const projectsToCreate = [];
    const statuses = ['active', 'active', 'active', 'completed', 'draft'];

    for (let i = 0; i < 20; i++) {
      const type = Math.random() > 0.5 ? 'individual' : 'team';
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      
      projectsToCreate.push({
        title: projectTitles[i % projectTitles.length] + (i >= projectTitles.length ? ` V${Math.floor(i/projectTitles.length)+1}` : ''),
        description: `Un projet ambitieux visant à révolutionner le domaine de ${skills[Math.floor(Math.random() * skills.length)]} en utilisant ${skills[Math.floor(Math.random() * skills.length)]}.`,
        type: type,
        tags: [skills[Math.floor(Math.random() * skills.length)], skills[Math.floor(Math.random() * skills.length)]],
        firstPlacePoints: 200 + Math.floor(Math.random() * 100),
        secondPlacePoints: 150 + Math.floor(Math.random() * 50),
        thirdPlacePoints: 100 + Math.floor(Math.random() * 30),
        status: status,
        startDate: new Date(Date.now() - Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000)),
        endDate: new Date(Date.now() + Math.floor(Math.random() * 60 * 24 * 60 * 60 * 1000)),
        createdBy: adminUser._id,
        participantType: type === 'individual' ? 'User' : 'Team'
      });
    }

    const createdProjects = await Project.insertMany(projectsToCreate);
    console.log(`${createdProjects.length} projets créés.`);

    // 5. Inscriptions aléatoires
    console.log('Générer des inscriptions aléatoires...');
    for (const project of createdProjects) {
        if (project.status === 'draft') continue;

        if (project.type === 'individual') {
            const numParticipants = Math.floor(Math.random() * 10) + 5;
            const participants = [];
            for (let j = 0; j < numParticipants; j++) {
                const randomUser = createdUsers[Math.floor(Math.random() * createdUsers.length)];
                if (!participants.includes(randomUser._id)) {
                    participants.push(randomUser._id);
                    await User.findByIdAndUpdate(randomUser._id, { $addToSet: { registeredProjects: project._id } });
                }
            }
            await Project.findByIdAndUpdate(project._id, { $set: { participants: participants } });
        } else {
            const numTeams = Math.floor(Math.random() * 5) + 2;
            const participants = [];
            for (let j = 0; j < numTeams; j++) {
                const randomTeam = createdTeams[Math.floor(Math.random() * createdTeams.length)];
                if (!participants.includes(randomTeam._id)) {
                    participants.push(randomTeam._id);
                    await Team.findByIdAndUpdate(randomTeam._id, { $addToSet: { registeredProjects: project._id } });
                }
            }
            await Project.findByIdAndUpdate(project._id, { $set: { participants: participants } });
        }
    }

    console.log('Seed massif terminé avec succès ! 🚀🔥');
    process.exit();
  } catch (error) {
    console.error(`Erreur lors du seed massif: ${error.message}`);
    console.error(error.stack);
    process.exit(1);
  }
};

seedData();
