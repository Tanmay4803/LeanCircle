# LeanCircle

**Comprehensive HR Management System built with Node.js, Express, and MongoDB**

---

## Table of Contents

- [About](#about)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Installation](#installation)
- [Usage](#usage)
- [Project Structure](#project-structure)
- [Sample Data](#sample-data)
- [Contributing](#contributing)
- [License](#license)

---

## About

LeanCircle is a full-featured human resources management platform supporting employee records, payroll, reimbursements, IT declarations, and document workflows. Designed for extensibility and security, it streamlines HR operations with real-time dashboards and role-based access.

---

## Features

- Employee management (onboarding, records, roles)
- Secure JWT-based authentication and role-based authorization
- Payroll and salary automation with reporting
- Reimbursements and IT tax declaration workflow
- Organization-wide document management and sharing
- Action/task tracking for HR and payroll processes
- Dashboard and analytics for admins and staff
- Data migration from browser storage to persistent MongoDB backend

---

## Tech Stack

- **Backend:** Node.js, Express.js, MongoDB (Mongoose)
- **Frontend:** HTML, CSS, Vanilla JS (served from `/public`)
- **Auth:** JWT (JSON Web Token)
- **Other:** bcrypt, dotenv, helmet, rate-limiter, CORS

---

## Installation

### Prerequisites

- Node.js (v16+)
- MongoDB server (local or cloud)

### Setup Steps

1. **Clone the repository:**
   ```sh
   git clone https://github.com/your-username/leancircle-hr-backend.git
   cd leancircle-hr-backend
   ```

2. **Install backend dependencies:**
   ```sh
   npm install
   ```

3. **Configure environment variables:**
   - Copy `.env.example` to `.env` and fill in your MongoDB URI and JWT secret:
     ```
     cp .env.example .env
     ```

4. **Seed the database (optional, for starter data):**
   ```sh
   npm run seed
   ```

5. **Run the backend server:**
   ```sh
   npm run dev
   ```

6. **Open your browser and visit:**
   ```
   http://localhost:3000
   ```

---

## Usage

- **Admin login:**  
  Default credentials after seeding:  
  `admin@leancircle.com` / `Admin@123`

- **API endpoints:**  
  - `/api/auth` (register, login, etc.)
  - `/api/employees` (CRUD)
  - `/api/reimbursements`, `/api/declarations`, `/api/documents`, `/api/actions`  
  (see code for full set)

- **Frontend** is served from the `/public` folder—use the dashboard to add/view users, run payroll, submit reimbursements, and manage documents.

---

## Project Structure

```
leancircle-hr-backend/
├── src/
│   ├── config/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   ├── utils/
│   ├── app.js
│   └── server.js
├── public/
├── scripts/
├── .env
├── package.json
└── README.md
```

---

## Sample Data

Run `npm run seed` to add demo users and employees for immediate testing.

---

## Contributing

Pull requests are welcome! For major changes, please open an issue first to discuss your ideas.

1. Fork the repo
2. Create a branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -am 'Add new feature'`)
4. Push to the branch (`git push origin feature/your-feature`)
5. Create a Pull Request

---

## License

[MIT](LICENSE)

---

> **LeanCircle** is built for learning and growing teams. Feedback and suggestions always welcome!
