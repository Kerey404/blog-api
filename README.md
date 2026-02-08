# 🎯 QuizMaster – Interactive Quiz Platform

**Student:** Bakytzhan Kassymgali

**Subject:** Web Development Final Project 

**Grade Goal:** Full Marks (Criteria Compliance) 

---

## 📖 Project Overview

**QuizMaster** is a full-stack web application that allows users to create, share, and play interactive quizzes. Inspired by platforms like Kahoot, it features real-time scoring, game sessions, and a comprehensive user dashboard.

The project follows a **Client-Server architecture**, where the backend provides a RESTful API and the frontend serves a dynamic user interface.

---

## 🛠 Project Setup (10 Points)

The project is built using **Node.js** and **Express.js**. It follows a strictly **modular structure** for better maintainability and scalability:

* 
**`/controllers`**: Logic for handling API requests (Auth, Quiz, Game).


* 
**`/models`**: Data schemas for MongoDB.


* 
**`/routes`**: API endpoint definitions.


* 
**`/middleware`**: Security and error handling scripts.


* **`/public`**: Static frontend files (HTML, CSS, JS).

---

## 🗄 Database & Models (10 Points)

The application uses **MongoDB Atlas** as the primary database with **Mongoose** for modeling. There are four core collections:

1. **User**: Stores username, email, hashed passwords, and game statistics.
2. **Quiz**: Stores quiz metadata (title, category, difficulty) and author references.
3. **Question**: Stores individual questions, options, and correct answers.
4. **GameSession**: Tracks active and completed games, scores, and accuracy.

---

## 📡 API Documentation (20 Points)

### 1. Authentication (Public Endpoints)

| Method | Endpoint | Description |
| --- | --- | --- |
| **POST** | `/api/auth/register` | Register a new user with hashed password.

 |
| **POST** | `/api/auth/login` | Authenticate user and return JWT.

 |

### 2. User & Profile (Private Endpoints)

| Method | Endpoint | Description |
| --- | --- | --- |
| **GET** | `/api/auth/profile` | Get logged-in user profile & stats. |

### 3. Quiz Management (Private Endpoints)

| Method | Endpoint | Description |
| --- | --- | --- |
| **POST** | `/api/quizzes` | Create a new quiz resource.

 |
| **GET** | `/api/quizzes` | Get all available quizzes.

 |
| **GET** | `/api/quizzes/:id` | Get specific quiz details.

 |
| **DELETE** | `/api/quizzes/:id` | Delete a quiz resource.

 |

### 4. Game Logic (Private Endpoints)

| Method | Endpoint | Description |
| --- | --- | --- |
| **POST** | `/api/game/start/:id` | Initialize a new game session. |
| **POST** | `/api/game/:id/finish` | Complete session and update user level. |

---

## 🔐 Authentication & Security (10 Points)

* 
**JWT (JSON Web Tokens)**: Used for secure user authentication across private endpoints.


* 
**Bcrypt**: Used for hashing user passwords before storing them in MongoDB.


* **CORS**: Configured to only allow requests from the official Netlify frontend to prevent unauthorized access.

---

## ⚠️ Validation & Error Handling (5 Points)

* 
**Global Middleware**: A centralized error-handling middleware manages all server errors and returns meaningful JSON responses.


* 
**Status Codes**: Appropriate HTTP status codes are used (e.g., 400 for bad requests, 401 for unauthorized, 404 for not found, 500 for server errors).



---

## 🌍 Deployment (10 Points)

The project is fully deployed and accessible:

* 
**Backend (Render)**: [https://quizland-xyy3.onrender.com](https://quizland-xyy3.onrender.com) 


* **Frontend (Netlify)**: [https://quizland1.netlify.app](https://quizland1.netlify.app)

---

---

**Would you like me to prepare a list of potential questions and answers for your project defense as well?**
