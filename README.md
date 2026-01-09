# Student Arena

<div align="center">
  <img src="img/logo.jpg" alt="Student Arena Logo" width="500" height="300" style="border-radius: 20px; box-shadow: 0 10px 30px rgba(0,0,0,0.2);">
  
  **Student Project Competition Platform**
  
  [![React](https://img.shields.io/badge/React-19.2.0-blue.svg)](https://reactjs.org/)
  [![Node.js](https://img.shields.io/badge/Node.js-Express-green.svg)](https://nodejs.org/)
  [![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-brightgreen.svg)](https://www.mongodb.com/)
  [![AI](https://img.shields.io/badge/AI-Google%20Gemini-orange.svg)](https://ai.google.dev/)

  <br/>

  <h3>🎥 <a href="https://drive.google.com/file/d/1fv_s8S1hA-2moZWUIk4YX7g1N3uBoLXR/view?usp=sharing">Watch Project Demo</a></h3>

</div>

---

## Table of Contents

- [About](#about)
- [Features](#features)
- [User Guide](#user-guide)
  - [For Users](#for-users-students)
  - [For Administrators](#for-administrators)
  - [For Visitors](#for-visitors-not-logged-in)
- [Installation](#installation)
- [Technical Architecture](#technical-architecture)
- [Points System](#points-system)
- [API Documentation](#api-documentation)
- [Project Structure](#project-structure)

---

## About

**Student Arena** is a modern and dynamic web platform dedicated to student project competitions. It allows users to register for projects (solo or in teams), submit their work, and climb the global leaderboard through an innovative points system and features powered by Artificial Intelligence.

The platform encourages academic excellence, team collaboration, and technological innovation through a sophisticated gamification system.

---

## Features

### Modern Interface

- Premium design with glassmorphism effects
- Responsive interface (desktop, tablet, mobile)
- Smooth micro-animations and transitions
- Modern theme with dynamic gradients

### Artificial Intelligence (Google Gemini 1.5 Flash)

- **Bio Generator**: Automatic creation of professional bios
- **Project Recommendations**: Personalized suggestions based on history
- **Chatbot Assistant**: Interactive help for navigating the platform
- **Idea Generator**: Generation of innovative project ideas

### Competition System

- Real-time leaderboards (users and teams)
- Points system with team bonuses
- Podium awards (1st, 2nd, 3rd place)
- Completed projects history

---

## User Guide

### For Users (Students)

#### Registration and Login

1. **Create an Account**

   - Go to the registration page (`/register`)
   - Fill out the form with:
     - First and Last Name
     - Email (must be unique)
     - Username (3-30 characters, letters, numbers and underscores only)
     - Password (minimum 8 characters, with uppercase, lowercase and number)
   - Click "Create my account"
   - You will be automatically logged in

2. **Log In**
   - Go to the login page (`/login`)
   - Enter your email or username
   - Enter your password
   - Click "Log in"

#### Profile Management

1. **Access Profile**

   - Click on your name in the navigation bar
   - Or go directly to `/profile`

2. **Edit Profile**

   - Click the "Edit" button in your profile
   - You can modify:
     - First and Last Name
     - Username
     - Bio (personal description)
   - Click "Save"

3. **Generate Bio with AI**

   - In the "Bio" section of your profile
   - Click "Generate with AI"
   - AI will create a professional bio based on your skills
   - You can accept or modify it

4. **Change Password**
   - In your profile, "Security" section
   - Enter your current password
   - Enter new password (minimum 8 characters)
   - Confirm new password
   - Click "Change password"

#### Team Management

1. **Create a Team**

   - Go to the "Team" page (`/team`)
   - Click "Create a Team"
   - Fill out the form:
     - Team name (2-100 characters)
     - Slogan (optional)
     - Description/Mission (optional)
   - Click "Launch Team"
   - You automatically become the team leader

2. **Join a Team**

   - Option 1: Via invitation code
     - Click "Join via code"
     - Enter the invitation code provided by the leader
     - Click "Verify Code & Enter"
   - Option 2: Be added by a leader
     - The leader must add you via your email or username

3. **Invite Members**

   - As a leader, go to your team
   - Click "+ Add Recruit"
   - Enter the member's email or username
   - Click "Send Integration Order"

4. **Manage Members**

   - Promote a member to leader rank (maximum 2 leaders)
   - Remove leadership from a member
   - Remove a member from the team

5. **Leave a Team**
   - Go to your team
   - In the "Leave Squad" section
   - Click "Leave"
   - Confirm your action
   - Warning: If you are the only leader, you must appoint another leader before leaving

#### Project Participation

1. **Explore Projects**

   - Go to the "Projects" page (`/projects`)
   - Use filters for:
     - Type: Solo or Team
     - Status: Active or Completed
   - Click "Explore" to see project details

2. **Register for Individual Project**

   - Find a "Solo" type project
   - Click "Participate"
   - Note: If you are in a team, only one team member can participate in an individual project

3. **Register Team for Project**

   - Find a "Team" type project
   - Note: Only the leader can register the team
   - Click "Participate"
   - Your team must have at least the minimum required number of members

4. **View My Projects**
   - Click the "My Registrations" tab on the Projects page
   - You will see all projects you are participating in (individually or as a team)

#### Submit a Project

1. **Prepare Your GitHub Repository**

   - Create a GitHub repository for your project
   - Ensure the repository is public or accessible
   - Add a README with project description

2. **Submit the Link**

   - Go to the project details page (`/projects/:id`)
   - Scroll to the "Submission" section
   - Enter your GitHub repository link (format: `https://github.com/username/repo`)
   - Click "Submit"
   - Note: You can only submit once per project

3. **Track Your Submission Status**
   - In "My Registrations", you can see your submission status:
     - Pending: Under evaluation
     - Approved: Your submission has been accepted
     - Rejected: Your submission has been declined (with feedback)

#### View Leaderboards

1. **Global Leaderboard**

   - Go to the "Leaderboard" page (`/leaderboard`)
   - View top 10 users
   - View top 10 teams

2. **Project Leaderboard**
   - On a completed project details page
   - View the podium (1st, 2nd, 3rd place)
   - See all ranked participants

#### Use AI Features

1. **Generate Bio**

   - In your profile, "Bio" section
   - Click "Generate with AI"
   - AI will create a bio based on your skills

2. **Get Project Recommendations**

   - Go to "AI Assistant" page (`/chat-assistant`)
   - Click "Project Recommendations"
   - AI will suggest projects suited to your profile

3. **Chat with Assistant**

   - Go to "AI Assistant"
   - Ask questions about the platform
   - AI will help you navigate and understand the rules

4. **Generate Project Idea**
   - Go to "Generate Idea" (`/generate-idea`)
   - Choose a theme (Web, Mobile, AI, etc.)
   - Choose difficulty (Easy, Medium, Hard)
   - Click "Generate"
   - AI will create an innovative project idea

---

### For Administrators

#### Administrator Access

1. **First User = Admin**

   - The first user to register automatically becomes administrator
   - Subsequent users are normal users

2. **Log In as Admin**
   - Log in normally with your admin account
   - You will see an "Admin" tab in the navigation

#### Project Management

1. **Create a Project**

   - Go to "Admin" → "Projects"
   - Click "Create a Project"
   - Fill out the form:
     - **Title**: Project name (3-200 characters)
     - **Description**: Detailed description (minimum 10 characters)
     - **Success Criteria**: What will be evaluated (optional)
     - **Tags**: Keywords for search (maximum 10)
     - **Type**: Individual or Team
     - **Start Date**: When the project begins
     - **End Date**: Registration deadline
     - **Points**:
       - 1st place (default: 100)
       - 2nd place (default: 75)
       - 3rd place (default: 50)
       - Other participants (default: 25)
   - Click "Create"
   - Project is created with "Draft" status

2. **Edit a Project**

   - In "Admin" → "Projects"
   - Click on the project to edit
   - Click "Edit"
   - Modify desired fields
   - Click "Save"

3. **Change Project Status**

   - **Draft** → **Active**: Project becomes visible and open for registration
   - **Active** → **Completed**: Project is finished, no more registrations
   - **Completed** → **Archived**: Project is archived in history

4. **Delete a Project**
   - Warning: Irreversible action
   - Click "Delete" in project details
   - Confirm deletion

#### Submission Evaluation

1. **View Submissions**

   - Go to "Admin" → "Submissions"
   - You will see all submissions pending evaluation
   - Filter by project if needed

2. **Evaluate a Submission**

   - Click on a submission
   - Review the GitHub link
   - **Approve**:
     - Click "Approve"
     - Submission status changes to "Approved"
   - **Reject**:
     - Click "Reject"
     - Add feedback explaining why
     - Submission is rejected

3. **Assign Rank (Podium)**
   - Once submissions are approved, you can rank them
   - Click "Rank" on an approved submission
   - Assign a rank (1, 2, 3, etc.)
   - Points are automatically distributed according to the points system

#### User Management

1. **View All Users**

   - Go to "Admin" → "Users"
   - You will see the list of all users
   - Filter by name, email or role

2. **Create a User**

   - Click "Create a User"
   - Fill out the form
   - Choose role (User or Admin)
   - Click "Create"

3. **Edit a User**

   - Click on a user
   - Modify information
   - Click "Save"

4. **Delete a User**

   - Warning: Irreversible action
   - Click "Delete" on a user
   - Confirm deletion

5. **Manually Adjust Points**
   - In "Admin" → "Users" or "Teams"
   - Click "Adjust Points"
   - Enter the number of points to add or remove
   - Add a reason (optional)
   - Click "Apply"

#### Team Management

1. **View All Teams**

   - Go to "Admin" → "Teams"
   - You will see all teams with their statistics

2. **View Team Members**

   - Click on a team
   - Click "View Members"
   - You will see all team members

3. **Add Member to Team**

   - In team details
   - Click "Recruit"
   - Enter email or username
   - Click "Recruit"

4. **Remove Member from Team**

   - In team members
   - Click "Remove" next to the member
   - Confirm action

5. **Adjust Team Points**
   - Click "Adjust Points"
   - Enter number of points
   - Add a reason
   - Click "Apply"

---

### For Visitors (Not Logged In)

#### 🔍 Public Navigation

1. **Explore Projects**

   - Go to the "Projects" page (`/projects`)
   - You can see all public projects
   - View details of each project
   - Note: You cannot register without an account

2. **View Leaderboards**

   - Go to the "Leaderboard" page (`/leaderboard`)
   - View top 10 users
   - View top 10 teams
   - View completed project leaderboards

3. **View Teams**

   - Go to the "Teams" page (if accessible)
   - View public teams and their statistics

4. **View Project Details**
   - Click "Explore" on any project
   - View:
     - Full description
     - Success criteria
     - Tags
     - Important dates
     - Number of participants
   - Note: You cannot register without an account

#### 🔐 Create an Account

1. **Sign Up**

   - Click "Sign Up" in the navigation
   - Fill out the registration form
   - Create your account
   - You will be automatically logged in

2. **Log In**
   - If you already have an account
   - Click "Log In"
   - Enter your credentials
   - Access all features

---

## Installation

### Prerequisites

- **Node.js** (version 18 or higher)
- **MongoDB** (local or MongoDB Atlas)
- **Google Gemini API Key** ([Get a key](https://ai.google.dev/))

### Configuration

1. **Clone the Repository**

   ```bash
   git clone <repository-url>
   cd projet-mern
   ```

2. **Configure Backend**

   ```bash
   cd Backend
   npm install
   ```

   Create a `.env` file in the `Backend/` folder:

   ```env
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/student-arena
   # Or for MongoDB Atlas:
   # MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/student-arena
   JWT_SECRET=your_very_secure_jwt_secret
   GEMINI_API_KEY=your_google_gemini_api_key
   ```

3. **Configure Frontend**
   ```bash
   cd Frontend/student-arena
   npm install
   ```

### Launch

**Backend:**

```bash
cd Backend
npm run dev
```

The backend server will be accessible at `http://localhost:5000`

**Frontend:**

```bash
cd Frontend/student-arena
npm run dev
```

The application will be accessible at `http://localhost:5173`

---

## Technical Architecture

### Frontend

- **React 19**: Modern UI library
- **Vite**: Ultra-fast build tool
- **React Router 7**: Navigation with protected routes
- **Axios**: HTTP client with JWT interceptors
- **Vanilla CSS**: Premium styles with glassmorphism

### Backend

- **Node.js & Express**: REST API server
- **MongoDB & Mongoose**: NoSQL database
- **JWT**: Secure authentication
- **Bcrypt.js**: Password hashing
- **Google Generative AI**: AI integration
- **Express Validator**: Data validation
- **Helmet**: HTTP security
- **CORS**: Cross-origin management

---

## Points System

### Points Distribution

When an administrator ranks an approved submission, points are distributed according to a bonus logic:

#### Individual Project

- The student receives **100%** of the rank points (e.g., 100 pts for 1st place)
- If the student belongs to a team, their **team receives a 50% bonus** (50 pts) automatically

#### Team Project

- The team receives **100%** of the rank points
- **Each member** of the team receives an **individual bonus of 50%** of the points

### Example

- Individual project, 1st place (100 pts):
  - Student: 100 pts
  - Team (if member): 50 pts
- Team project, 1st place (100 pts):
  - Team: 100 pts
  - Each member: 50 pts

---

## Data Model

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

    User "0..1" -- "0..1" Team : belongs to
    User "1" -- "0..*" Project : creates (if admin)
    User "0..*" -- "0..*" Project : participates (solo)
    Team "0..*" -- "0..*" Project : participates (team)
    User "1" -- "0..*" Submission : submits (solo)
    Team "1" -- "0..*" Submission : submits (team)
    Project "1" -- "0..*" Submission : contains
    User "1" -- "0..*" Submission : evaluates (if admin)
```

---

## API Documentation

All API routes are prefixed with `/api`. Routes marked with [AUTH] require a JWT token. Routes marked with [ADMIN] require Admin privileges.

### Authentication (`/api/auth`)

| Method | Route       | Role   | Description                     |
| :----- | :---------- | :----- | :------------------------------ |
| `POST` | `/register` | Public | Register a new user             |
| `POST` | `/login`    | Public | Login and receive token         |
| `GET`  | `/me`       | [AUTH] | Get logged-in user information  |

### Users (`/api/users`)

| Method   | Route           | Role    | Description                  |
| :------- | :-------------- | :------ | :--------------------------- |
| `GET`    | `/profile`      | [AUTH]  | Full user profile            |
| `GET`    | `/leaderboard`  | Public  | Top 10 users                 |
| `GET`    | `/`             | [ADMIN] | List of all users            |
| `POST`   | `/`             | [ADMIN] | Manually create a user       |
| `PUT`    | `/:id`          | [AUTH]  | Update profile               |
| `PUT`    | `/:id/password` | [AUTH]  | Change password              |
| `DELETE` | `/:id`          | [ADMIN] | Delete account               |

### Teams (`/api/teams`)

| Method   | Route               | Role           | Description                |
| :------- | :------------------ | :------------- | :------------------------- |
| `POST`   | `/`                 | [AUTH]         | Create a new team          |
| `GET`    | `/`                 | Public         | List all teams             |
| `GET`    | `/:id`              | Public         | Team details               |
| `POST`   | `/join`             | [AUTH]         | Join via `invitationCode`  |
| `POST`   | `/:id/leave`        | [AUTH]         | Leave current team         |
| `POST`   | `/:id/add-member`   | [ADMIN]/Leader | Add a member               |
| `DELETE` | `/:id/members/:mId` | [ADMIN]/Leader | Remove a member            |

### Projects (`/api/projects`)

| Method | Route            | Role    | Description                    |
| :----- | :--------------- | :------ | :----------------------------- |
| `GET`  | `/`              | Public  | List of all projects           |
| `GET`  | `/active`        | Public  | Projects open for submissions  |
| `GET`  | `/my-projects`   | [AUTH]  | Projects I'm participating in  |
| `GET`  | `/team-projects` | [AUTH]  | My team's projects             |
| `POST` | `/`              | [ADMIN] | Create a new project           |
| `POST` | `/:id/register`  | [AUTH]  | Register for a project         |
| `PUT`  | `/:id/status`    | [ADMIN] | Change status                  |

### Submissions (`/api/submissions`)

| Method | Route             | Role    | Description                  |
| :----- | :---------------- | :------ | :--------------------------- |
| `POST` | `/`               | [AUTH]  | Submit a GitHub link         |
| `GET`  | `/my-submissions` | [AUTH]  | View my own submissions      |
| `GET`  | `/`               | [ADMIN] | View all submissions         |
| `PUT`  | `/:id/review`     | [ADMIN] | Grade and give feedback      |
| `PUT`  | `/:id/rank`       | [ADMIN] | Assign a podium rank         |

### Artificial Intelligence (`/api/ai`)

| Method | Route                    | Role   | Description                |
| :----- | :----------------------- | :----- | :------------------------- |
| `POST` | `/generate-bio`          | [AUTH] | Generate bio via Gemini    |
| `GET`  | `/recommend-projects`    | [AUTH] | AI-suggested projects      |
| `POST` | `/chat`                  | [AUTH] | Interact with AI assistant |
| `POST` | `/generate-project-idea` | [AUTH] | Generate project idea      |

---

## Project Structure

```
projet-mern/
├── Backend/                    # Node.js REST API
│   ├── config/                 # DB & AI Configuration
│   │   ├── db.js              # MongoDB Connection
│   │   └── gemini.js          # Google Gemini Configuration
│   ├── controllers/           # Business Logic
│   │   ├── authController.js
│   │   ├── userController.js
│   │   ├── teamController.js
│   │   ├── projectController.js
│   │   ├── submissionController.js
│   │   ├── leaderboardController.js
│   │   └── aiController.js
│   ├── middleware/            # Middlewares
│   │   ├── authMiddleware.js  # JWT Protection
│   │   └── validationMiddleware.js
│   ├── models/                # Mongoose Schemas
│   │   ├── User.js
│   │   ├── Team.js
│   │   ├── Project.js
│   │   ├── Submission.js
│   │   └── Leaderboard.js
│   ├── routes/                # API Routes
│   │   ├── authRoutes.js
│   │   ├── userRoutes.js
│   │   ├── teamRoutes.js
│   │   ├── projectRoutes.js
│   │   ├── submissionRoutes.js
│   │   ├── leaderboardRoutes.js
│   │   └── aiRoutes.js
│   ├── seeder.js              # Seed Script (optional)
│   ├── server.js              # Entry Point
│   └── package.json
│
├── Frontend/
│   └── student-arena/         # React Application
│       ├── src/
│       │   ├── api/
│       │   │   └── axiosConfig.js  # Axios Configuration
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
│   └── logo.jpg               # Project Logo
│
└── README.md                  # This File
```

---

## Security

- **JWT**: Secure stateless authentication
- **Bcrypt**: Password hashing (10 rounds)
- **Helmet**: Protection against HTTP vulnerabilities
- **CORS**: Strict configuration of allowed origins
- **Validation**: Strict validation of incoming data

---

## Design

- **Glassmorphism**: Backdrop blur effects
- **Dynamic Gradients**: Vibrant and modern colors
- **Micro-animations**: Smooth transitions
- **Responsive**: Adapted to all screens
- **Dark Elements**: Reduced visual fatigue

---

## Important Notes

- The first registered user automatically becomes administrator
- Projects in "Draft" status are not visible to users
- A user can only belong to one team at a time
- A team must have at least 1 leader and maximum 2 leaders
- Submissions can only be modified before evaluation
- Points are automatically distributed during ranking
