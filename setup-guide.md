# LeanCircle HR Management System - Node.js & MongoDB Setup Guide

## Step 1: Initial Setup & Project Structure

### 1.1 Create Project Directory
```bash
mkdir leancircle-hr-backend
cd leancircle-hr-backend
```

### 1.2 Initialize Node.js Project
```bash
npm init -y
```

### 1.3 Install Required Dependencies
```bash
# Core dependencies
npm install express mongoose dotenv cors bcryptjs jsonwebtoken express-rate-limit helmet compression morgan

# Development dependencies
npm install --save-dev nodemon concurrently
```

### 1.4 Create Project Structure
```
leancircle-hr-backend/
├── src/
│   ├── config/
│   │   ├── database.js
│   │   └── auth.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Employee.js
│   │   ├── Reimbursement.js
│   │   ├── ITDeclaration.js
│   │   ├── Document.js
│   │   └── Action.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── employees.js
│   │   ├── reimbursements.js
│   │   ├── declarations.js
│   │   ├── documents.js
│   │   └── actions.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── employeeController.js
│   │   ├── reimbursementController.js
│   │   ├── declarationController.js
│   │   ├── documentController.js
│   │   └── actionController.js
│   ├── middleware/
│   │   ├── auth.js
│   │   └── validation.js
│   ├── utils/
│   │   ├── helpers.js
│   │   └── seedData.js
│   └── app.js
├── public/
│   ├── index.html (your existing HTML)
│   ├── style.css (your existing CSS)
│   └── app.js (renamed to frontend.js)
├── server.js
├── .env
├── .gitignore
└── package.json
```

## Step 2: Environment Configuration

### 2.1 Create .env File
```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Database Configuration
MONGODB_URI=mongodb://127.0.0.1:27017/leancircle-hr
MONGODB_TEST_URI=mongodb://127.0.0.1:27017/leancircle-hr-test

# JWT Configuration
JWT_SECRET=your-super-secure-jwt-secret-key-here
JWT_EXPIRE=7d
JWT_REFRESH_EXPIRE=30d

# Application Configuration
FRONTEND_URL=http://localhost:3000
BCRYPT_SALT_ROUNDS=12

# File Upload Configuration
MAX_FILE_SIZE=10485760
ALLOWED_FILE_TYPES=pdf,doc,docx,jpg,jpeg,png
```

### 2.2 Create .gitignore File
```gitignore
node_modules/
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
npm-debug.log*
yarn-debug.log*
yarn-error.log*
.DS_Store
uploads/
dist/
build/
*.log
```

## Step 3: Database Configuration & Models

### 3.1 Update package.json Scripts
```json
{
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "dev:frontend": "live-server public",
    "dev:both": "concurrently \"npm run dev\" \"npm run dev:frontend\"",
    "seed": "node src/utils/seedData.js",
    "test": "echo \"Error: no test specified\" && exit 1"
  }
}
```

## Step 4: MongoDB Installation

### 4.1 Install MongoDB Community Edition

#### On Windows:
1. Download MongoDB from https://www.mongodb.com/try/download/community
2. Run the installer and follow the installation wizard
3. Start MongoDB service from Services or run: `mongod`

#### On macOS:
```bash
# Using Homebrew
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb/brew/mongodb-community
```

#### On Linux (Ubuntu/Debian):
```bash
# Install MongoDB
sudo apt update
sudo apt install -y mongodb

# Start MongoDB service
sudo systemctl start mongodb
sudo systemctl enable mongodb
```

### 4.2 Verify MongoDB Installation
```bash
# Check if MongoDB is running
mongosh
# You should see MongoDB shell prompt

# Create your database
use leancircle-hr
# Database created when you first store data
```

## Step 5: Backend Implementation

### 5.1 Main Server File (server.js)
Create this in your project root - the code is provided in the backend files.

### 5.2 Express App Configuration (src/app.js)
This sets up Express middleware, routes, and error handling.

### 5.3 Database Configuration (src/config/database.js)
Handles MongoDB connection with Mongoose.

### 5.4 Mongoose Models
Each model corresponds to your current localStorage data structures.

### 5.5 Authentication System
JWT-based authentication with bcrypt password hashing.

### 5.6 API Routes & Controllers
RESTful API endpoints for all features.

## Step 6: Frontend Integration

### 6.1 Update Frontend JavaScript
Replace localStorage calls with API calls using fetch or axios.

### 6.2 Serve Static Files
Your existing HTML/CSS will be served from the public directory.

## Step 7: Running the Application

### 7.1 Start MongoDB
Make sure MongoDB is running on your system.

### 7.2 Seed the Database (Optional)
```bash
npm run seed
```

### 7.3 Start Development Server
```bash
# Backend only
npm run dev

# Frontend only (if using live-server)
npm install -g live-server
npm run dev:frontend

# Both together
npm run dev:both
```

### 7.4 Access the Application
- Backend API: http://localhost:3000
- Frontend: http://localhost:3000 (served by Express)

## Step 8: Testing API Endpoints

### 8.1 Authentication
```bash
# Register new user
POST http://localhost:3000/api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com", 
  "password": "password123"
}

# Login
POST http://localhost:3000/api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

### 8.2 Employee Management
```bash
# Get all employees (requires authentication)
GET http://localhost:3000/api/employees
Authorization: Bearer your-jwt-token

# Create employee
POST http://localhost:3000/api/employees
Authorization: Bearer your-jwt-token
Content-Type: application/json

{
  "name": "Jane Smith",
  "email": "jane@company.com",
  "position": "Developer",
  "department": "Engineering"
}
```

## Step 9: Security Considerations

1. **Environment Variables**: Never commit .env file
2. **Password Security**: Using bcrypt with salt rounds
3. **JWT Security**: Secure secret keys and appropriate expiration
4. **Rate Limiting**: Implemented to prevent abuse
5. **CORS**: Configured for your frontend domain
6. **Input Validation**: Validate all user inputs
7. **Error Handling**: Don't expose sensitive information

## Step 10: Production Deployment

### 10.1 Environment Setup
- Use environment variables for all configuration
- Use a cloud MongoDB service (MongoDB Atlas)
- Set NODE_ENV=production

### 10.2 Security Hardening
- Use HTTPS in production
- Implement proper logging
- Use a reverse proxy (nginx)
- Regular security updates

## Troubleshooting

### Common Issues:

1. **MongoDB Connection Failed**
   - Check if MongoDB service is running
   - Verify connection string in .env file

2. **CORS Errors**
   - Check CORS configuration in app.js
   - Verify frontend URL in environment variables

3. **JWT Token Issues**
   - Check JWT secret in .env file
   - Verify token format and expiration

4. **Port Already in Use**
   - Change PORT in .env file
   - Kill process using the port: `lsof -ti:3000 | xargs kill -9`

## Next Steps

After completing this setup, you can:
1. Add more advanced features (email notifications, file uploads)
2. Implement role-based permissions
3. Add comprehensive testing
4. Set up CI/CD pipeline
5. Deploy to cloud services (AWS, Azure, Google Cloud)