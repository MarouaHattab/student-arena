# Student Arena

<div align="center">
  <img src="img/logo.jpg" alt="Student Arena Logo" width="200" height="200" style="border-radius: 20px; box-shadow: 0 10px 30px rgba(0,0,0,0.2);">
  
  **Plateforme de Compétition de Projets pour Étudiants**
  
  [![React](https://img.shields.io/badge/React-19.2.0-blue.svg)](https://reactjs.org/)
  [![Node.js](https://img.shields.io/badge/Node.js-Express-green.svg)](https://nodejs.org/)
  [![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-brightgreen.svg)](https://www.mongodb.com/)
  [![AI](https://img.shields.io/badge/AI-Google%20Gemini-orange.svg)](https://ai.google.dev/)

  <br/>
  <h3>🎥 <a href="https://drive.google.com/file/d/1fv_s8S1hA-2moZWUIk4YX7g1N3uBoLXR/view?usp=sharing">Voir la Démo du Projet</a></h3>
</div>

---

## Table des Matières

- [À Propos](#à-propos)
- [Fonctionnalités](#fonctionnalités)
- [Guide d'Utilisation](#guide-dutilisation)
  - [Pour les Utilisateurs](#pour-les-utilisateurs-étudiants)
  - [Pour les Administrateurs](#pour-les-administrateurs)
  - [Pour les Visiteurs](#pour-les-visiteurs-non-connectés)
- [Installation](#installation)
- [Architecture Technique](#architecture-technique)
- [Système de Points](#système-de-points)
- [Documentation API](#documentation-api)
- [Structure du Projet](#structure-du-projet)

---

## À Propos

**Student Arena** est une plateforme web moderne et dynamique dédiée aux compétitions de projets pour étudiants. Elle permet aux utilisateurs de s'inscrire à des projets (en solo ou en équipe), de soumettre leurs travaux et de grimper dans le classement mondial grâce à un système de points innovant et des fonctionnalités boostées par l'Intelligence Artificielle.

La plateforme encourage l'excellence académique, la collaboration en équipe et l'innovation technologique à travers un système de gamification sophistiqué.

---

## Fonctionnalités

### Interface Moderne

- Design premium avec effets de glassmorphism
- Interface responsive (desktop, tablette, mobile)
- Micro-animations et transitions fluides
- Thème moderne avec gradients dynamiques

### Intelligence Artificielle (Google Gemini 1.5 Flash)

- **Générateur de Bio** : Création automatique d'une bio professionnelle
- **Recommandations de Projets** : Suggestions personnalisées basées sur l'historique
- **Assistant Chatbot** : Aide interactive pour naviguer sur la plateforme
- **Générateur d'Idées** : Génération d'idées de projets innovantes

### Système de Compétition

- Classements en temps réel (utilisateurs et équipes)
- Système de points avec bonus pour les équipes
- Attribution de podiums (1ère, 2ème, 3ème place)
- Historique des projets terminés

---

## Guide d'Utilisation

### Pour les Utilisateurs (Étudiants)

#### Inscription et Connexion

1. **Créer un Compte**

   - Accédez à la page d'inscription (`/register`)
   - Remplissez le formulaire avec :
     - Prénom et Nom
     - Email (doit être unique)
     - Nom d'utilisateur (3-30 caractères, lettres, chiffres et underscores uniquement)
     - Mot de passe (minimum 8 caractères, avec majuscule, minuscule et chiffre)
   - Cliquez sur "Créer mon compte"
   - Vous serez automatiquement connecté

2. **Se Connecter**
   - Accédez à la page de connexion (`/login`)
   - Entrez votre email ou nom d'utilisateur
   - Entrez votre mot de passe
   - Cliquez sur "Se connecter"

#### Gestion du Profil

1. **Accéder au Profil**

   - Cliquez sur votre nom dans la barre de navigation
   - Ou accédez directement à `/profile`

2. **Modifier le Profil**

   - Cliquez sur le bouton "Modifier" dans votre profil
   - Vous pouvez modifier :
     - Prénom et Nom
     - Nom d'utilisateur
     - Bio (description personnelle)
   - Cliquez sur "Sauvegarder"

3. **Générer une Bio avec l'IA**

   - Dans la section "Bio" de votre profil
   - Cliquez sur "Générer avec l'IA"
   - L'IA créera une bio professionnelle basée sur vos compétences
   - Vous pouvez l'accepter ou la modifier

4. **Changer le Mot de Passe**
   - Dans votre profil, section "Sécurité"
   - Entrez votre mot de passe actuel
   - Entrez le nouveau mot de passe (minimum 8 caractères)
   - Confirmez le nouveau mot de passe
   - Cliquez sur "Changer le mot de passe"

#### Gestion d'Équipe

1. **Créer une Équipe**

   - Accédez à la page "Équipe" (`/team`)
   - Cliquez sur "Créer une Équipe"
   - Remplissez le formulaire :
     - Nom de l'équipe (2-100 caractères)
     - Slogan (optionnel)
     - Description/Mission (optionnel)
   - Cliquez sur "Lancer l'Équipe"
   - Vous devenez automatiquement le leader de l'équipe

2. **Rejoindre une Équipe**

   - Option 1 : Via code d'invitation
     - Cliquez sur "Rejoindre via code"
     - Entrez le code d'invitation fourni par le leader
     - Cliquez sur "Vérifier le Code & Entrer"
   - Option 2 : Être ajouté par un leader
     - Le leader doit vous ajouter via votre email ou nom d'utilisateur

3. **Inviter des Membres**

   - En tant que leader, accédez à votre équipe
   - Cliquez sur "+ Ajouter Recrue"
   - Entrez l'email ou le nom d'utilisateur du membre
   - Cliquez sur "Envoyer l'ordre d'intégration"

4. **Gérer les Membres**

   - Promouvoir un membre au rang de leader (maximum 2 leaders)
   - Retirer le leadership d'un membre
   - Retirer un membre de l'équipe

5. **Quitter une Équipe**
   - Accédez à votre équipe
   - Dans la section "Quitter l'escouade"
   - Cliquez sur "Quitter"
   - Confirmez votre action
   - Attention : Si vous êtes le seul leader, vous devez nommer un autre leader avant de partir

#### Participation aux Projets

1. **Explorer les Projets**

   - Accédez à la page "Projets" (`/projects`)
   - Utilisez les filtres pour :
     - Type : Solo ou Team
     - État : En cours ou Terminé
   - Cliquez sur "Explorer" pour voir les détails d'un projet

2. **S'inscrire à un Projet Individuel**

   - Trouvez un projet de type "Solo"
   - Cliquez sur "Participer"
   - Attention : Si vous êtes dans une équipe, seul un membre de votre équipe peut participer à un projet individuel

3. **Inscrire son Équipe à un Projet**

   - Trouvez un projet de type "Team"
   - Attention : Seul le leader peut inscrire l'équipe
   - Cliquez sur "Participer"
   - Votre équipe doit avoir au moins le nombre minimum de membres requis

4. **Voir Mes Projets**
   - Cliquez sur l'onglet "Mes Inscriptions" dans la page Projets
   - Vous verrez tous les projets auxquels vous participez (individuellement ou en équipe)

#### Soumettre un Projet

1. **Préparer votre Dépôt GitHub**

   - Créez un dépôt GitHub pour votre projet
   - Assurez-vous que le dépôt est public ou accessible
   - Ajoutez un README avec la description du projet

2. **Soumettre le Lien**

   - Accédez à la page de détails du projet (`/projects/:id`)
   - Faites défiler jusqu'à la section "Soumission"
   - Entrez le lien de votre dépôt GitHub (format : `https://github.com/username/repo`)
   - Cliquez sur "Soumettre"
   - Attention : Vous ne pouvez soumettre qu'une seule fois par projet

3. **Suivre l'État de votre Soumission**
   - Dans "Mes Inscriptions", vous pouvez voir l'état de vos soumissions :
     - En attente : En cours d'évaluation
     - Approuvée : Votre soumission a été acceptée
     - Rejetée : Votre soumission a été refusée (avec feedback)

#### Consulter les Classements

1. **Classement Global**

   - Accédez à la page "Classement" (`/leaderboard`)
   - Consultez le top 10 des utilisateurs
   - Consultez le top 10 des équipes

2. **Classement d'un Projet**
   - Dans la page de détails d'un projet terminé
   - Consultez le podium (1ère, 2ème, 3ème place)
   - Voyez tous les participants classés

#### Utiliser les Fonctionnalités IA

1. **Générer une Bio**

   - Dans votre profil, section "Bio"
   - Cliquez sur "Générer avec l'IA"
   - L'IA créera une bio basée sur vos compétences

2. **Obtenir des Recommandations de Projets**

   - Accédez à la page "Assistant IA" (`/chat-assistant`)
   - Cliquez sur "Recommandations de Projets"
   - L'IA suggérera des projets adaptés à votre profil

3. **Chatter avec l'Assistant**

   - Accédez à "Assistant IA"
   - Posez des questions sur la plateforme
   - L'IA vous aidera à naviguer et comprendre les règles

4. **Générer une Idée de Projet**
   - Accédez à "Générer une Idée" (`/generate-idea`)
   - Choisissez un thème (Web, Mobile, IA, etc.)
   - Choisissez la difficulté (Facile, Moyen, Difficile)
   - Cliquez sur "Générer"
   - L'IA créera une idée de projet innovante

---

### Pour les Administrateurs

#### Accès Administrateur

1. **Premier Utilisateur = Admin**

   - Le premier utilisateur à s'inscrire devient automatiquement administrateur
   - Les utilisateurs suivants sont des utilisateurs normaux

2. **Se Connecter en tant qu'Admin**
   - Connectez-vous normalement avec votre compte admin
   - Vous verrez un onglet "Admin" dans la navigation

#### Gestion des Projets

1. **Créer un Projet**

   - Accédez à "Admin" → "Projets"
   - Cliquez sur "Créer un Projet"
   - Remplissez le formulaire :
     - **Titre** : Nom du projet (3-200 caractères)
     - **Description** : Description détaillée (minimum 10 caractères)
     - **Critères de Succès** : Ce qui sera évalué (optionnel)
     - **Tags** : Mots-clés pour la recherche (maximum 10)
     - **Type** : Individuel ou Équipe
     - **Date de Début** : Quand le projet commence
     - **Date de Fin** : Date limite d'inscription
     - **Points** :
       - 1ère place (défaut: 100)
       - 2ème place (défaut: 75)
       - 3ème place (défaut: 50)
       - Autres participants (défaut: 25)
   - Cliquez sur "Créer"
   - Le projet est créé avec le statut "Draft" (brouillon)

2. **Modifier un Projet**

   - Dans "Admin" → "Projets"
   - Cliquez sur le projet à modifier
   - Cliquez sur "Modifier"
   - Modifiez les champs souhaités
   - Cliquez sur "Sauvegarder"

3. **Changer le Statut d'un Projet**

   - **Draft** → **Active** : Le projet devient visible et ouvert aux inscriptions
   - **Active** → **Completed** : Le projet est terminé, plus d'inscriptions possibles
   - **Completed** → **Archived** : Le projet est archivé dans l'historique

4. **Supprimer un Projet**
   - Attention : Action irréversible
   - Cliquez sur "Supprimer" dans les détails du projet
   - Confirmez la suppression

#### Évaluation des Soumissions

1. **Voir les Soumissions**

   - Accédez à "Admin" → "Soumissions"
   - Vous verrez toutes les soumissions en attente d'évaluation
   - Filtrez par projet si nécessaire

2. **Évaluer une Soumission**

   - Cliquez sur une soumission
   - Consultez le lien GitHub
   - **Approuver** :
     - Cliquez sur "Approuver"
     - La soumission passe en statut "Approuvée"
   - **Rejeter** :
     - Cliquez sur "Rejeter"
     - Ajoutez un feedback expliquant pourquoi
     - La soumission est rejetée

3. **Attribuer un Rang (Podium)**
   - Une fois les soumissions approuvées, vous pouvez les classer
   - Cliquez sur "Classer" sur une soumission approuvée
   - Attribuez un rang (1, 2, 3, etc.)
   - Les points sont automatiquement distribués selon le système de points

#### Gestion des Utilisateurs

1. **Voir Tous les Utilisateurs**

   - Accédez à "Admin" → "Utilisateurs"
   - Vous verrez la liste de tous les utilisateurs
   - Filtrez par nom, email ou rôle

2. **Créer un Utilisateur**

   - Cliquez sur "Créer un Utilisateur"
   - Remplissez le formulaire
   - Choisissez le rôle (User ou Admin)
   - Cliquez sur "Créer"

3. **Modifier un Utilisateur**

   - Cliquez sur un utilisateur
   - Modifiez les informations
   - Cliquez sur "Sauvegarder"

4. **Supprimer un Utilisateur**

   - Attention : Action irréversible
   - Cliquez sur "Supprimer" sur un utilisateur
   - Confirmez la suppression

5. **Ajuster les Points Manuellement**
   - Dans "Admin" → "Utilisateurs" ou "Équipes"
   - Cliquez sur "Ajuster les Points"
   - Entrez le nombre de points à ajouter ou retirer
   - Ajoutez une raison (optionnel)
   - Cliquez sur "Appliquer"

#### Gestion des Équipes

1. **Voir Toutes les Équipes**

   - Accédez à "Admin" → "Équipes"
   - Vous verrez toutes les équipes avec leurs statistiques

2. **Voir les Membres d'une Équipe**

   - Cliquez sur une équipe
   - Cliquez sur "Voir les Membres"
   - Vous verrez tous les membres de l'équipe

3. **Ajouter un Membre à une Équipe**

   - Dans les détails d'une équipe
   - Cliquez sur "Recruter"
   - Entrez l'email ou le nom d'utilisateur
   - Cliquez sur "Recruter"

4. **Retirer un Membre d'une Équipe**

   - Dans les membres d'une équipe
   - Cliquez sur "Retirer" à côté du membre
   - Confirmez l'action

5. **Ajuster les Points d'une Équipe**
   - Cliquez sur "Ajuster les Points"
   - Entrez le nombre de points
   - Ajoutez une raison
   - Cliquez sur "Appliquer"

---

### Pour les Visiteurs (Non Connectés)

#### 🔍 Navigation Publique

1. **Explorer les Projets**

   - Accédez à la page "Projets" (`/projects`)
   - Vous pouvez voir tous les projets publics
   - Consultez les détails de chaque projet
   - Attention : Vous ne pouvez pas vous inscrire sans compte

2. **Consulter les Classements**

   - Accédez à la page "Classement" (`/leaderboard`)
   - Consultez le top 10 des utilisateurs
   - Consultez le top 10 des équipes
   - Consultez les classements des projets terminés

3. **Voir les Équipes**

   - Accédez à la page "Équipes" (si accessible)
   - Consultez les équipes publiques et leurs statistiques

4. **Voir les Détails d'un Projet**
   - Cliquez sur "Explorer" sur n'importe quel projet
   - Consultez :
     - La description complète
     - Les critères de succès
     - Les tags
     - Les dates importantes
     - Le nombre de participants
   - Attention : Vous ne pouvez pas vous inscrire sans compte

#### 🔐 Créer un Compte

1. **S'inscrire**

   - Cliquez sur "S'inscrire" dans la navigation
   - Remplissez le formulaire d'inscription
   - Créez votre compte
   - Vous serez automatiquement connecté

2. **Se Connecter**
   - Si vous avez déjà un compte
   - Cliquez sur "Se connecter"
   - Entrez vos identifiants
   - Accédez à toutes les fonctionnalités

---

## Installation

### Prérequis

- **Node.js** (version 18 ou supérieure)
- **MongoDB** (local ou MongoDB Atlas)
- **Clé API Google Gemini** ([Obtenir une clé](https://ai.google.dev/))

### Configuration

1. **Cloner le Dépôt**

   ```bash
   git clone <url-du-depot>
   cd projet-mern
   ```

2. **Configurer le Backend**

   ```bash
   cd Backend
   npm install
   ```

   Créez un fichier `.env` dans le dossier `Backend/` :

   ```env
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/student-arena
   # Ou pour MongoDB Atlas :
   # MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/student-arena
   JWT_SECRET=votre_secret_jwt_tres_securise
   GEMINI_API_KEY=votre_cle_api_google_gemini
   ```

3. **Configurer le Frontend**
   ```bash
   cd Frontend/student-arena
   npm install
   ```

### Lancement

**Backend :**

```bash
cd Backend
npm run dev
```

Le serveur backend sera accessible sur `http://localhost:5000`

**Frontend :**

```bash
cd Frontend/student-arena
npm run dev
```

L'application sera accessible sur `http://localhost:5173`

---

## Architecture Technique

### Frontend

- **React 19** : Bibliothèque UI moderne
- **Vite** : Build tool ultra-rapide
- **React Router 7** : Navigation avec routes protégées
- **Axios** : Client HTTP avec intercepteurs JWT
- **Vanilla CSS** : Styles premium avec glassmorphism

### Backend

- **Node.js & Express** : Serveur API REST
- **MongoDB & Mongoose** : Base de données NoSQL
- **JWT** : Authentification sécurisée
- **Bcrypt.js** : Hashage des mots de passe
- **Google Generative AI** : Intégration IA
- **Express Validator** : Validation des données
- **Helmet** : Sécurité HTTP
- **CORS** : Gestion des origines croisées

---

## Système de Points

### Distribution des Points

Lorsqu'un administrateur classe une soumission approuvée, les points sont distribués selon une logique de bonus :

#### Projet Individuel

- L'étudiant reçoit **100%** des points du rang (ex: 100 pts pour la 1ère place)
- Si l'étudiant appartient à une équipe, son **équipe reçoit un bonus de 50%** (50 pts) automatiquement

#### Projet en Équipe

- L'équipe reçoit **100%** des points du rang
- **Chaque membre** de l'équipe reçoit un **bonus individuel de 50%** des points

### Exemple

- Projet individuel, 1ère place (100 pts) :
  - Étudiant : 100 pts
  - Équipe (si membre) : 50 pts
- Projet équipe, 1ère place (100 pts) :
  - Équipe : 100 pts
  - Chaque membre : 50 pts

---

## Modèle de Données

```mermaid
classDiagram
    class User {
        +String firstName
        +String lastName
        +String email
        +String userName
        +String bio
        +Number points
        +String role [user, admin]
        +Boolean isTeamLeader
        +ObjectId team
        +ObjectId[] submissions
        +ObjectId[] registeredProjects
    }

    class Team {
        +String name
        +String description
        +String slogan
        +String invitationCode
        +Number points
        +String status [active, inactive, archived]
        +ObjectId[] leaders
        +ObjectId[] members
        +ObjectId[] submissions
        +ObjectId[] registeredProjects
    }

    class Project {
        +String title
        +String description
        +String type [individual, team]
        +String status [draft, active, completed, archived]
        +Date startDate
        +Date endDate
        +ObjectId createdBy
        +ObjectId[] participants
        +ObjectId[] submissions
        +Number firstPlacePoints
    }

    class Submission {
        +ObjectId project
        +ObjectId submittedByUser
        +ObjectId submittedByTeam
        +String githubLink
        +String status [pending, approved, rejected]
        +Number score
        +Number ranking
        +String feedback
        +ObjectId reviewedBy
    }

    User "0..1" -- "0..1" Team : appartient à
    User "1" -- "0..*" Project : crée (si admin)
    User "0..*" -- "0..*" Project : participe (solo)
    Team "0..*" -- "0..*" Project : participe (équipe)
    User "1" -- "0..*" Submission : soumet (solo)
    Team "1" -- "0..*" Submission : soumet (équipe)
    Project "1" -- "0..*" Submission : contient
    User "1" -- "0..*" Submission : évalue (si admin)
```

---

## Documentation API

Toutes les routes API sont préfixées par `/api`. Les routes marquées avec [AUTH] nécessitent un token JWT. Les routes marquées avec [ADMIN] nécessitent des privilèges Admin.

### Authentification (`/api/auth`)

| Méthode | Route       | Rôle   | Description                                   |
| :------ | :---------- | :----- | :-------------------------------------------- |
| `POST`  | `/register` | Public | Inscription d'un nouvel utilisateur           |
| `POST`  | `/login`    | Public | Connexion et réception du token               |
| `GET`   | `/me`       | [AUTH] | Récupérer les infos de l'utilisateur connecté |

### Utilisateurs (`/api/users`)

| Méthode  | Route           | Rôle    | Description                        |
| :------- | :-------------- | :------ | :--------------------------------- |
| `GET`    | `/profile`      | [AUTH]  | Profil complet de l'utilisateur    |
| `GET`    | `/leaderboard`  | Public  | Top 10 des utilisateurs            |
| `GET`    | `/`             | [ADMIN] | Liste de tous les utilisateurs     |
| `POST`   | `/`             | [ADMIN] | Création manuelle d'un utilisateur |
| `PUT`    | `/:id`          | [AUTH]  | Mise à jour du profil              |
| `PUT`    | `/:id/password` | [AUTH]  | Changement de mot de passe         |
| `DELETE` | `/:id`          | [ADMIN] | Suppression d'un compte            |

### Équipes (`/api/teams`)

| Méthode  | Route               | Rôle           | Description                    |
| :------- | :------------------ | :------------- | :----------------------------- |
| `POST`   | `/`                 | [AUTH]         | Créer une nouvelle équipe      |
| `GET`    | `/`                 | Public         | Lister toutes les équipes      |
| `GET`    | `/:id`              | Public         | Détails d'une équipe           |
| `POST`   | `/join`             | [AUTH]         | Rejoindre via `invitationCode` |
| `POST`   | `/:id/leave`        | [AUTH]         | Quitter l'équipe actuelle      |
| `POST`   | `/:id/add-member`   | [ADMIN]/Leader | Ajouter un membre              |
| `DELETE` | `/:id/members/:mId` | [ADMIN]/Leader | Expulser un membre             |

### Projets (`/api/projects`)

| Méthode | Route            | Rôle    | Description                     |
| :------ | :--------------- | :------ | :------------------------------ |
| `GET`   | `/`              | Public  | Liste de tous les projets       |
| `GET`   | `/active`        | Public  | Projets ouverts aux soumissions |
| `GET`   | `/my-projects`   | [AUTH]  | Projets auxquels je participe   |
| `GET`   | `/team-projects` | [AUTH]  | Projets de mon équipe           |
| `POST`  | `/`              | [ADMIN] | Créer un nouveau projet         |
| `POST`  | `/:id/register`  | [AUTH]  | S'inscrire à un projet          |
| `PUT`   | `/:id/status`    | [ADMIN] | Changer le statut               |

### Soumissions (`/api/submissions`)

| Méthode | Route             | Rôle    | Description                  |
| :------ | :---------------- | :------ | :--------------------------- |
| `POST`  | `/`               | [AUTH]  | Soumettre un lien GitHub     |
| `GET`   | `/my-submissions` | [AUTH]  | Voir mes propres soumissions |
| `GET`   | `/`               | [ADMIN] | Voir toutes les soumissions  |
| `PUT`   | `/:id/review`     | [ADMIN] | Noter et donner un feedback  |
| `PUT`   | `/:id/rank`       | [ADMIN] | Assigner un podium           |

### Intelligence Artificielle (`/api/ai`)

| Méthode | Route                    | Rôle   | Description                   |
| :------ | :----------------------- | :----- | :---------------------------- |
| `POST`  | `/generate-bio`          | [AUTH] | Générer une bio via Gemini    |
| `GET`   | `/recommend-projects`    | [AUTH] | Projets suggérés via IA       |
| `POST`  | `/chat`                  | [AUTH] | Interagir avec l'assistant IA |
| `POST`  | `/generate-project-idea` | [AUTH] | Générer une idée de projet    |

---

## Structure du Projet

```
projet-mern/
├── Backend/                    # API REST Node.js
│   ├── config/                 # Configuration DB & AI
│   │   ├── db.js              # Connexion MongoDB
│   │   └── gemini.js          # Configuration Google Gemini
│   ├── controllers/           # Logique métier
│   │   ├── authController.js
│   │   ├── userController.js
│   │   ├── teamController.js
│   │   ├── projectController.js
│   │   ├── submissionController.js
│   │   ├── leaderboardController.js
│   │   └── aiController.js
│   ├── middleware/            # Middlewares
│   │   ├── authMiddleware.js  # Protection JWT
│   │   └── validationMiddleware.js
│   ├── models/                # Schémas Mongoose
│   │   ├── User.js
│   │   ├── Team.js
│   │   ├── Project.js
│   │   ├── Submission.js
│   │   └── Leaderboard.js
│   ├── routes/                # Routes API
│   │   ├── authRoutes.js
│   │   ├── userRoutes.js
│   │   ├── teamRoutes.js
│   │   ├── projectRoutes.js
│   │   ├── submissionRoutes.js
│   │   ├── leaderboardRoutes.js
│   │   └── aiRoutes.js
│   ├── seeder.js              # Script de seed (optionnel)
│   ├── server.js              # Point d'entrée
│   └── package.json
│
├── Frontend/
│   └── student-arena/         # Application React
│       ├── src/
│       │   ├── api/
│       │   │   └── axiosConfig.js  # Configuration Axios
│       │   ├── components/
│       │   │   ├── Navbar.jsx
│       │   │   └── PrivateRoute.jsx
│       │   ├── context/
│       │   │   └── AuthContext.jsx
│       │   ├── pages/
│       │   │   ├── Home.jsx
│       │   │   ├── Login.jsx
│       │   │   ├── Register.jsx
│       │   │   ├── Profile.jsx
│       │   │   ├── Projects.jsx
│       │   │   ├── ProjectDetails.jsx
│       │   │   ├── Team.jsx
│       │   │   ├── Leaderboard.jsx
│       │   │   ├── ChatAssistant.jsx
│       │   │   ├── GenerateIdea.jsx
│       │   │   ├── AdminProjects.jsx
│       │   │   ├── AdminSubmissions.jsx
│       │   │   ├── AdminUsers.jsx
│       │   │   └── AdminTeams.jsx
│       │   ├── utils/
│       │   │   └── validation.js
│       │   ├── App.jsx
│       │   ├── App.css
│       │   ├── index.css
│       │   └── main.jsx
│       ├── index.html
│       ├── vite.config.js
│       └── package.json
│
├── img/
│   └── logo.jpg               # Logo du projet
│
└── README.md                  # Ce fichier
```

---

## Sécurité

- **JWT** : Authentification stateless sécurisée
- **Bcrypt** : Hashage des mots de passe (10 rounds)
- **Helmet** : Protection contre les vulnérabilités HTTP
- **CORS** : Configuration stricte des origines autorisées
- **Validation** : Validation stricte des données entrantes
---

## Design

- **Glassmorphism** : Effets de flou d'arrière-plan
- **Gradients Dynamiques** : Couleurs vibrantes et modernes
- **Micro-animations** : Transitions fluides
- **Responsive** : Adapté à tous les écrans
- **Dark Elements** : Réduction de la fatigue visuelle

---

## Notes Importantes

- Le premier utilisateur inscrit devient automatiquement administrateur
- Les projets en statut "Draft" ne sont pas visibles par les utilisateurs
- Un utilisateur ne peut appartenir qu'à une seule équipe à la fois
- Une équipe doit avoir au moins 1 leader et maximum 2 leaders
- Les soumissions ne peuvent être modifiées qu'avant l'évaluation
- Les points sont distribués automatiquement lors du classement

---

## Licence

Ce projet est sous licence ISC.
