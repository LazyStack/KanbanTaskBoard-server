# TaskBoard — Backend API

REST API for TaskBoard, a Trello-style Kanban app. Built with Node.js, Express, and MongoDB.

## Tech Stack

- **Runtime:** Node.js
- **Framework:** Express
- **Database:** MongoDB + Mongoose
- **Auth:** JWT (jsonwebtoken) + bcrypt for password hashing
- **Validation:** express-validator

## Getting Started

### Prerequisites

- Node.js 18+
- A MongoDB connection string (local instance or [MongoDB Atlas](https://www.mongodb.com/atlas) free tier)

### Installation

```bash
npm install
```

### Environment Variables

Create a `.env` file in the root (see `.env.example`):

```
PORT=5001
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/taskboard?retryWrites=true&w=majority
JWT_SECRET=your_long_random_secret_string
```

### Run

```bash
npm run dev    # development with nodemon (auto-restart)
npm start      # production
```

Server runs on `http://localhost:5001` by default.

## API Endpoints

| Method | Endpoint              | Auth | Description                  |
|--------|-----------------------|------|-------------------------------|
| POST   | `/api/auth/register`  | No   | Register a new user           |
| POST   | `/api/auth/login`     | No   | Login, returns JWT            |
| GET    | `/api/auth/me`        | Yes  | Get current logged-in user    |
| GET    | `/api/tasks`          | Yes  | Get all tasks for the user    |
| POST   | `/api/tasks`          | Yes  | Create a new task             |
| PUT    | `/api/tasks/:id`      | Yes  | Update a task                 |
| DELETE | `/api/tasks/:id`      | Yes  | Delete a task                 |
| PUT    | `/api/tasks/reorder`  | Yes  | Bulk update task positions/status (drag-and-drop) |
| GET    | `/api/health`         | No   | Health check                  |

Protected routes require a header:

```
Authorization: Bearer <jwt_token>
```

## Project Structure

```
server/
├── config/
│   └── db.js              # MongoDB connection
├── controllers/
│   ├── authController.js  # Register, login, get current user
│   └── taskController.js  # Task CRUD + reorder
├── middleware/
│   └── auth.js            # JWT verification middleware
├── models/
│   ├── User.js            # User schema (hashed password)
│   └── Task.js             # Task schema (status, priority, position)
├── routes/
│   ├── auth.js
│   └── tasks.js
├── index.js                # App entry point
└── .env.example
```

## Data Models

**User**
- `name`, `email` (unique), `password` (hashed, not returned by default)

**Task**
- `title`, `description`, `status` (`todo` | `in-progress` | `done`), `priority` (`low` | `medium` | `high`), `position`, `user` (reference)

## Notes

- Passwords are hashed with bcrypt before saving via a Mongoose `pre("save")` hook.
- JWTs expire after 7 days.
- All task routes are scoped to the authenticated user — users can only access their own tasks.

## License

MIT
