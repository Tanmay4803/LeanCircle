# Frontend Integration Guide

## Moving Your Existing Files

### Step 1: Create Public Directory
```bash
mkdir public
```

### Step 2: Move Your Files
```bash
# Move your existing files to the public directory
mv index.html public/
mv style.css public/
mv app.js public/frontend.js  # Rename to avoid confusion with backend app.js
```

## Updating Frontend JavaScript

Your existing `app.js` file needs to be updated to use API calls instead of localStorage. Here are the key changes needed:

### 1. Replace Storage Methods

**Old (localStorage):**
```javascript
saveToStorage(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

getFromStorage(key) {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : null;
}
```

**New (API calls):**
```javascript
// API configuration
const API_BASE_URL = 'http://localhost:3000/api';
let authToken = localStorage.getItem('authToken');

// Helper function for API calls
async function apiCall(endpoint, options = {}) {
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(authToken && { 'Authorization': `Bearer ${authToken}` })
    },
    ...options
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'API call failed');
    }
    
    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}
```

### 2. Update Authentication Methods

**Replace this:**
```javascript
handleLogin() {
  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;
  
  // Old localStorage check
  const users = this.getFromStorage('leancircle_users') || [];
  const user = users.find(u => u.email === email && u.password === password);
  
  if (user) {
    this.currentUser = user;
    sessionStorage.setItem('leancircle_user', JSON.stringify(user));
    this.showApp();
  }
}
```

**With this:**
```javascript
async handleLogin() {
  try {
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    const response = await apiCall('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    
    if (response.success) {
      authToken = response.token;
      localStorage.setItem('authToken', authToken);
      localStorage.setItem('refreshToken', response.refreshToken);
      
      this.currentUser = response.user;
      this.showNotification('Login successful!', 'success');
      this.showApp();
    }
  } catch (error) {
    this.showNotification(error.message, 'error');
  }
}
```

### 3. Update Employee Management

**Replace this:**
```javascript
loadEmployeeManagerData() {
  const employees = this.getFromStorage('leancircle_employees') || [];
  this.renderEmployeesTable(employees);
}
```

**With this:**
```javascript
async loadEmployeeManagerData() {
  try {
    const response = await apiCall('/employees');
    if (response.success) {
      this.renderEmployeesTable(response.data);
    }
  } catch (error) {
    this.showNotification('Failed to load employees', 'error');
    console.error('Load employees error:', error);
  }
}
```

### 4. Update Data Creation/Updates

**Replace this:**
```javascript
// Old method for creating employee
const employees = this.getFromStorage('leancircle_employees') || [];
const newEmployee = { id: Date.now(), ...employeeData };
employees.push(newEmployee);
this.saveToStorage('leancircle_employees', employees);
```

**With this:**
```javascript
async createEmployee(employeeData) {
  try {
    const response = await apiCall('/employees', {
      method: 'POST',
      body: JSON.stringify(employeeData)
    });
    
    if (response.success) {
      this.showNotification('Employee created successfully!', 'success');
      this.loadEmployeeManagerData(); // Refresh the list
    }
  } catch (error) {
    this.showNotification('Failed to create employee', 'error');
    console.error('Create employee error:', error);
  }
}
```

### 5. Add Authentication Check

Add this method to check if user is authenticated:
```javascript
checkAuth() {
  const token = localStorage.getItem('authToken');
  if (token) {
    authToken = token;
    this.validateToken();
  } else {
    this.showAuth();
  }
}

async validateToken() {
  try {
    const response = await apiCall('/auth/me');
    if (response.success) {
      this.currentUser = response.user;
      this.showApp();
    }
  } catch (error) {
    // Token invalid, redirect to login
    localStorage.removeItem('authToken');
    localStorage.removeItem('refreshToken');
    authToken = null;
    this.showAuth();
  }
}
```

### 6. Update All Data Loading Methods

You'll need to update all methods that currently use localStorage:

- `loadReimbursementsData()` → call `/api/reimbursements`
- `loadITDeclarationData()` → call `/api/declarations`
- `loadDocumentsData()` → call `/api/documents`
- `loadActionsData()` → call `/api/actions`

### 7. Add Error Handling for Network Issues

```javascript
// Add global error handler
window.addEventListener('online', () => {
  this.showNotification('Connection restored', 'success');
});

window.addEventListener('offline', () => {
  this.showNotification('No internet connection', 'warning');
});
```

## HTML Updates

### Update your index.html to include error handling:

```html
<!-- Add this after your existing notifications -->
<div id="networkStatus" class="network-status hidden">
  <span id="networkMessage">Checking connection...</span>
</div>
```

### Add loading states:

```html
<!-- Add loading overlay -->
<div id="loadingOverlay" class="loading-overlay hidden">
  <div class="loading-spinner">
    <div class="spinner"></div>
    <p>Loading...</p>
  </div>
</div>
```

## CSS Updates

Add these styles to your existing CSS:

```css
/* Loading overlay */
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

.loading-spinner {
  text-align: center;
  color: white;
}

.spinner {
  border: 4px solid #f3f3f3;
  border-top: 4px solid var(--color-primary);
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Network status */
.network-status {
  position: fixed;
  bottom: 20px;
  right: 20px;
  background: var(--color-warning);
  color: white;
  padding: 10px 20px;
  border-radius: 5px;
  z-index: 1000;
}

.network-status.hidden {
  display: none;
}
```

## Testing Your Integration

### 1. Start the Backend
```bash
# In your project root
npm install
npm run dev
```

### 2. Test API Endpoints
```bash
# Test health check
curl http://localhost:3000/api/health

# Test user registration
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"password123"}'
```

### 3. Open Frontend
Navigate to `http://localhost:3000` in your browser.

## Progressive Enhancement

You can implement this gradually:

1. **Phase 1**: Update authentication only
2. **Phase 2**: Update employee management
3. **Phase 3**: Update remaining features
4. **Phase 4**: Add offline support with service workers

## Next Steps

After basic integration:

1. Add proper error boundaries
2. Implement loading states
3. Add data caching
4. Implement real-time updates with WebSockets
5. Add file upload functionality
6. Implement proper logout handling
7. Add session timeout handling

This approach allows you to maintain your existing UI while gradually migrating to the new backend API.