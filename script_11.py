# Create the authentication routes (src/routes/auth.js)
auth_routes_content = '''// src/routes/auth.js - Authentication routes
const express = require('express');
const {
  register,
  login,
  getMe,
  refreshToken,
  forgotPassword,
  resetPassword,
  changePassword,
  logout
} = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);
router.post('/refresh', refreshToken);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// Protected routes
router.get('/me', authenticate, getMe);
router.put('/change-password', authenticate, changePassword);
router.post('/logout', authenticate, logout);

module.exports = router;
'''

# Create routes directory and write auth.js
os.makedirs('src/routes', exist_ok=True)

with open('src/routes/auth.js', 'w') as f:
    f.write(auth_routes_content)

# Create sample package.json
package_json_content = '''{
  "name": "leancircle-hr-backend",
  "version": "1.0.0",
  "description": "LeanCircle HR Management System - Backend API with Node.js and MongoDB",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "dev:frontend": "live-server public --port=3001",
    "dev:both": "concurrently \\"npm run dev\\" \\"npm run dev:frontend\\"",
    "seed": "node src/utils/seedData.js",
    "test": "echo \\"Error: no test specified\\" && exit 1"
  },
  "keywords": [
    "hr",
    "management",
    "nodejs",
    "express",
    "mongodb",
    "mongoose",
    "api",
    "jwt",
    "authentication"
  ],
  "author": "Your Name",
  "license": "ISC",
  "dependencies": {
    "express": "^4.18.2",
    "mongoose": "^8.0.0",
    "dotenv": "^16.3.1",
    "cors": "^2.8.5",
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.0.2",
    "express-rate-limit": "^7.1.0",
    "helmet": "^7.1.0",
    "compression": "^1.7.4",
    "morgan": "^1.10.0"
  },
  "devDependencies": {
    "nodemon": "^3.0.1",
    "concurrently": "^8.2.2"
  },
  "engines": {
    "node": ">=16.0.0"
  }
}'''

with open('package.json', 'w') as f:
    f.write(package_json_content)

# Create sample .env file
env_content = '''# Server Configuration
PORT=3000
NODE_ENV=development

# Database Configuration
MONGODB_URI=mongodb://127.0.0.1:27017/leancircle-hr
MONGODB_TEST_URI=mongodb://127.0.0.1:27017/leancircle-hr-test

# JWT Configuration
JWT_SECRET=your-super-secure-jwt-secret-key-change-this-in-production
JWT_EXPIRE=7d
JWT_REFRESH_EXPIRE=30d

# Application Configuration
FRONTEND_URL=http://localhost:3000
BCRYPT_SALT_ROUNDS=12

# File Upload Configuration
MAX_FILE_SIZE=10485760
ALLOWED_FILE_TYPES=pdf,doc,docx,jpg,jpeg,png

# Email Configuration (for production)
# EMAIL_FROM=noreply@leancircle.com
# SMTP_HOST=your-smtp-host
# SMTP_PORT=587
# SMTP_USER=your-smtp-username
# SMTP_PASS=your-smtp-password
'''

with open('.env.example', 'w') as f:
    f.write(env_content)

print("✅ Created src/routes/auth.js")
print("✅ Created package.json")
print("✅ Created .env.example")