// src/routes/employees.js - Employee management routes
const express = require('express');
const {
  getEmployees,
  getEmployee,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  getEmployeesByDepartment,
  searchEmployees,
  getEmployeeStats
} = require('../controllers/employeeController');
const { authenticate, authorize, canAccessEmployee } = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Public employee routes (for all authenticated users)
router.get('/stats', getEmployeeStats);
router.get('/search/:term', searchEmployees);
router.get('/department/:department', getEmployeesByDepartment);
router.get('/', getEmployees);
router.get('/:id', canAccessEmployee, getEmployee);

// Admin/HR only routes
router.post('/', authorize('Administrator', 'HR Manager'), createEmployee);
router.put('/:id', authorize('Administrator', 'HR Manager'), updateEmployee);

// Admin only routes
router.delete('/:id', authorize('Administrator'), deleteEmployee);

module.exports = router;
