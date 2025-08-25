// src/utils/seedData.js - Database seeding utility
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Import models
const User = require('../models/User');
const Employee = require('../models/Employee');
const Reimbursement = require('../models/Reimbursement');
const ITDeclaration = require('../models/ITDeclaration');
const Document = require('../models/Document');
const Action = require('../models/Action');

// Connect to database
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB Connected for seeding');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    process.exit(1);
  }
};

// Sample data
const sampleUsers = [
  {
    name: "Akshit Batra",
    email: "admin@leancircle.com",
    password: "Admin@123",
    role: "Administrator",
    status: "Active"
  },
  {
    name: "HR Manager",
    email: "hr@leancircle.com", 
    password: "hr123456",
    role: "HR Manager",
    status: "Active"
  },
  {
    name: "John Manager",
    email: "manager@leancircle.com",
    password: "manager123",
    role: "Manager", 
    status: "Active"
  }
];

const sampleEmployees = [
  {
    firstName: "Anne",
    lastName: "Richard",
    email: "anne@example.com",
    employeeId: "#2345578",
    position: "Director",
    department: "Human Resources",
    status: "Active",
    role: "Employee",
    salary: 95000,
    ctc: 3568,
    incentives: 127686,
    bonus: 36100,
    joinDate: new Date("2020-01-15"),
    phone: "+1-555-0123",
    address: "123 HR Street, Business City",
    bloodGroup: "O+",
    pfNumber: "PF123456",
    gender: "Female",
    portfolio: "75%"
  },
  {
    firstName: "David",
    lastName: "Harrison", 
    email: "david@example.com",
    employeeId: "#2345579",
    position: "Co-founder",
    department: "All departments",
    status: "Pending",
    role: "Employee",
    salary: 120000,
    joinDate: new Date("2019-03-20"),
    gender: "Male",
    portfolio: "45%"
  },
  {
    firstName: "Tony",
    lastName: "Cook",
    email: "tony@example.com", 
    employeeId: "#2345580",
    position: "Project Manager",
    department: "Engineering",
    status: "Active",
    role: "Employee", 
    salary: 85000,
    joinDate: new Date("2021-01-10"),
    gender: "Male",
    portfolio: "89%"
  },
  {
    firstName: "Bob",
    lastName: "Dean",
    email: "bob@example.com",
    employeeId: "#2345581",
    position: "Designer", 
    department: "Design",
    status: "Suspended",
    role: "Employee",
    salary: 70000,
    joinDate: new Date("2020-06-15"),
    gender: "Male",
    portfolio: "80%"
  },
  {
    firstName: "Rachel",
    lastName: "Doe",
    email: "rachel@example.com",
    employeeId: "#2345582", 
    position: "Seller",
    department: "Finance",
    status: "Active",
    role: "Employee",
    salary: 65000,
    joinDate: new Date("2021-08-01"),
    gender: "Female",
    portfolio: "100%"
  }
];

const sampleReimbursements = [
  {
    employeeId: "#12345667",
    employeeName: "Vijay Parmar",
    category: "Travel",
    amount: 8686,
    date: new Date("2021-04-13"),
    status: "Pending",
    invoices: 343,
    description: "Business travel expenses"
  },
  {
    employeeId: "#12345668", 
    employeeName: "Madhur K Bhandari",
    category: "Food & Beverages",
    amount: 5500,
    date: new Date("2021-04-14"),
    status: "Approved",
    invoices: 225,
    description: "Client dinner expenses"
  },
  {
    employeeId: "#12345669",
    employeeName: "John Smith",
    category: "Utilities", 
    amount: 3200,
    date: new Date("2021-04-15"),
    status: "Declined",
    invoices: 112,
    description: "Office utilities"
  }
];

const sampleDeclarations = [
  {
    employeeId: "#12345667",
    employeeName: "Vijay Parmar",
    financialYear: "2024-2025",
    section: "80C",
    investmentType: "Life Insurance Policy",
    amount: 50000,
    totalAmount: 50000,
    status: "Pending",
    documents: ["policy.pdf"],
    description: "Annual life insurance premium"
  },
  {
    employeeId: "#12345668",
    employeeName: "Madhur K Bhandari", 
    financialYear: "2024-2025",
    section: "80D",
    investmentType: "Health Insurance",
    amount: 25000,
    totalAmount: 25000,
    status: "Completed",
    documents: ["health_policy.pdf"],
    description: "Health insurance premium"
  }
];

const sampleDocuments = [
  {
    name: "Employee Handbook.pdf",
    formattedSize: "2.5 MB",
    type: "PDF",
    folder: "my-drive",
    isFolder: false,
    category: "HR Documents",
    description: "Employee handbook and policies"
  },
  {
    name: "HR Documents",
    type: "Folder",
    folder: "my-drive", 
    isFolder: true,
    itemCount: 5,
    category: "HR Documents"
  },
  {
    name: "Payroll Reports",
    type: "Folder",
    folder: "my-drive",
    isFolder: true,
    itemCount: 12,
    category: "Reports"
  },
  {
    name: "Shared Policy.docx",
    formattedSize: "1.8 MB",
    type: "DOCX",
    folder: "shared",
    isFolder: false,
    category: "Policies"
  }
];

const sampleActions = [
  {
    type: "Lock Salary",
    target: "January 2025",
    description: "Lock salary for January processing",
    category: "payroll",
    status: "Pending",
    priority: "High"
  },
  {
    type: "Generate Report",
    target: "Monthly Report",
    description: "Generate monthly HR report",
    category: "reports", 
    status: "Completed",
    priority: "Medium"
  }
];

// Clear existing data
const clearDatabase = async () => {
  try {
    await User.deleteMany({});
    await Employee.deleteMany({});
    await Reimbursement.deleteMany({});
    await ITDeclaration.deleteMany({});
    await Document.deleteMany({});
    await Action.deleteMany({});
    console.log('🗑️  Cleared existing data');
  } catch (error) {
    console.error('Error clearing database:', error);
  }
};

// Seed functions
const seedUsers = async () => {
  try {
    const users = await User.create(sampleUsers);
    console.log(`👥 Created ${users.length} users`);
    return users;
  } catch (error) {
    console.error('Error seeding users:', error);
    return [];
  }
};

const seedEmployees = async (users) => {
  try {
    const adminUser = users.find(u => u.role === 'Administrator');

    const employeesWithCreator = sampleEmployees.map(emp => ({
      ...emp,
      createdBy: adminUser ? adminUser._id : null,
      updatedBy: adminUser ? adminUser._id : null
    }));

    const employees = await Employee.create(employeesWithCreator);
    console.log(`👨‍💼 Created ${employees.length} employees`);
    return employees;
  } catch (error) {
    console.error('Error seeding employees:', error);
    return [];
  }
};

const seedReimbursements = async (employees, users) => {
  try {
    const adminUser = users.find(u => u.role === 'Administrator');

    const reimbursementsWithRefs = sampleReimbursements.map(reimb => ({
      ...reimb,
      employee: employees[0] ? employees[0]._id : null,
      submittedBy: adminUser ? adminUser._id : null,
      createdBy: adminUser ? adminUser._id : null
    }));

    const reimbursements = await Reimbursement.create(reimbursementsWithRefs);
    console.log(`💰 Created ${reimbursements.length} reimbursements`);
    return reimbursements;
  } catch (error) {
    console.error('Error seeding reimbursements:', error);
    return [];
  }
};

const seedDeclarations = async (employees, users) => {
  try {
    const adminUser = users.find(u => u.role === 'Administrator');

    const declarationsWithRefs = sampleDeclarations.map(decl => ({
      ...decl,
      employee: employees[0] ? employees[0]._id : null,
      submittedBy: adminUser ? adminUser._id : null,
      createdBy: adminUser ? adminUser._id : null
    }));

    const declarations = await ITDeclaration.create(declarationsWithRefs);
    console.log(`📋 Created ${declarations.length} IT declarations`);
    return declarations;
  } catch (error) {
    console.error('Error seeding declarations:', error);
    return [];
  }
};

const seedDocuments = async (users) => {
  try {
    const adminUser = users.find(u => u.role === 'Administrator');

    const documentsWithUploader = sampleDocuments.map(doc => ({
      ...doc,
      uploadedBy: adminUser ? adminUser._id : null
    }));

    const documents = await Document.create(documentsWithUploader);
    console.log(`📄 Created ${documents.length} documents`);
    return documents;
  } catch (error) {
    console.error('Error seeding documents:', error);
    return [];
  }
};

const seedActions = async (users) => {
  try {
    const adminUser = users.find(u => u.role === 'Administrator');

    const actionsWithCreator = sampleActions.map(action => ({
      ...action,
      createdBy: adminUser ? adminUser._id : null,
      assignedTo: adminUser ? adminUser._id : null
    }));

    const actions = await Action.create(actionsWithCreator);
    console.log(`⚡ Created ${actions.length} actions`);
    return actions;
  } catch (error) {
    console.error('Error seeding actions:', error);
    return [];
  }
};

// Main seeding function
const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seeding...');

    await connectDB();
    await clearDatabase();

    const users = await seedUsers();
    const employees = await seedEmployees(users);
    const reimbursements = await seedReimbursements(employees, users);
    const declarations = await seedDeclarations(employees, users);
    const documents = await seedDocuments(users);
    const actions = await seedActions(users);

    console.log('\n✅ Database seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`   Users: ${users.length}`);
    console.log(`   Employees: ${employees.length}`);
    console.log(`   Reimbursements: ${reimbursements.length}`);
    console.log(`   IT Declarations: ${declarations.length}`);
    console.log(`   Documents: ${documents.length}`);
    console.log(`   Actions: ${actions.length}`);

    console.log('\n🔐 Login Credentials:');
    console.log('   Admin: admin@leancircle.com / Admin@123');
    console.log('   HR: hr@leancircle.com / hr123456');
    console.log('   Manager: manager@leancircle.com / manager123');

  } catch (error) {
    console.error('❌ Database seeding failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Database connection closed');
    process.exit(0);
  }
};

// Handle command line arguments
const args = process.argv.slice(2);

if (args.includes('--clear-only')) {
  // Only clear the database
  (async () => {
    await connectDB();
    await clearDatabase();
    console.log('✅ Database cleared successfully');
    await mongoose.disconnect();
    process.exit(0);
  })();
} else {
  // Run full seed
  seedDatabase();
}

module.exports = { seedDatabase };
