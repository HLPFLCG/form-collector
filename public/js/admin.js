// API Configuration
const API_BASE = window.location.origin + '/api';
let authToken = localStorage.getItem('authToken');
let currentView = 'dashboard';
let forms = [];
let currentFormId = null;

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
  if (authToken) {
    showDashboard();
    loadDashboard();
  } else {
    showLogin();
  }
});

// Authentication
function showLogin() {
  document.getElementById('loginPage').classList.remove('hidden');
  document.getElementById('dashboardPage').classList.add('hidden');
}

function showDashboard() {
  document.getElementById('loginPage').classList.add('hidden');
  document.getElementById('dashboardPage').classList.remove('hidden');
}

async function login(e) {
  e.preventDefault();
  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;
  const errorDiv = document.getElementById('loginError');

  try {
    const response = await fetch(`${API_BASE}/admin/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (response.ok) {
      authToken = data.token;
      localStorage.setItem('authToken', authToken);
      localStorage.setItem('userEmail', data.email);
      showDashboard();
      loadDashboard();
    } else {
      errorDiv.textContent = data.error || 'Login failed';
      errorDiv.classList.remove('hidden');
    }
  } catch (error) {
    errorDiv.textContent = 'Network error. Please try again.';
    errorDiv.classList.remove('hidden');
  }
}

function logout() {
  authToken = null;
  localStorage.removeItem('authToken');
  localStorage.removeItem('userEmail');
  showLogin();
}

// API Helper
async function apiRequest(endpoint, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 401 || response.status === 403) {
    logout();
    throw new Error('Authentication failed');
  }

  return response.json();
}

// Navigation
function navigateTo(view) {
  currentView = view;
  
  // Update active nav link
  document.querySelectorAll('.nav-link').forEach(link => {
    link.classList.remove('active');
  });
  event.target.closest('.nav-link').classList.add('active');

  // Load appropriate view
  switch(view) {
    case 'dashboard':
      loadDashboard();
      break;
    case 'forms':
      loadForms();
      break;
    case 'submissions':
      loadAllSubmissions();
      break;
  }
}

// Dashboard
async function loadDashboard() {
  const content = document.getElementById('mainContent');
  content.innerHTML = `
    <div class="header">
      <h1>Dashboard</h1>
    </div>
    <div id="statsContainer" class="loading">
      <div class="spinner"></div>
      <p>Loading statistics...</p>
    </div>
    <div class="card">
      <div class="card-header">
        <h2>Recent Activity</h2>
      </div>
      <div class="card-body" id="recentActivity">
        <div class="loading">
          <div class="spinner"></div>
          <p>Loading activity...</p>
        </div>
      </div>
    </div>
  `;

  try {
    const stats = await apiRequest('/admin/stats');
    const forms = await apiRequest('/admin/forms');

    document.getElementById('statsContainer').innerHTML = `
      <div class="stats-grid">
        <div class="stat-card">
          <h3>Total Forms</h3>
          <div class="value">${stats.total_forms}</div>
        </div>
        <div class="stat-card">
          <h3>Active Forms</h3>
          <div class="value">${stats.active_forms}</div>
        </div>
        <div class="stat-card">
          <h3>Total Submissions</h3>
          <div class="value">${stats.total_submissions}</div>
        </div>
        <div class="stat-card">
          <h3>Recent (7 days)</h3>
          <div class="value">${stats.recent_submissions}</div>
        </div>
      </div>
    `;

    if (forms.length > 0) {
      const recentForms = forms.slice(0, 5);
      document.getElementById('recentActivity').innerHTML = `
        <table>
          <thead>
            <tr>
              <th>Form Name</th>
              <th>Email</th>
              <th>Submissions</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            ${recentForms.map(form => `
              <tr>
                <td>${escapeHtml(form.name)}</td>
                <td>${escapeHtml(form.email)}</td>
                <td>${form.submission_count}</td>
                <td>
                  <span class="badge ${form.active ? 'badge-success' : 'badge-danger'}">
                    ${form.active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td>
                  <button class="btn btn-sm btn-primary" onclick="viewFormSubmissions('${form.id}')">
                    View Submissions
                  </button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;
    } else {
      document.getElementById('recentActivity').innerHTML = `
        <div class="empty-state">
          <h3>No forms yet</h3>
          <p>Create your first form to get started</p>
          <button class="btn btn-primary" onclick="navigateTo('forms')">Create Form</button>
        </div>
      `;
    }
  } catch (error) {
    console.error('Error loading dashboard:', error);
    document.getElementById('statsContainer').innerHTML = `
      <div class="alert alert-error">Failed to load dashboard data</div>
    `;
  }
}

// Forms Management
async function loadForms() {
  const content = document.getElementById('mainContent');
  content.innerHTML = `
    <div class="header">
      <h1>Forms</h1>
      <button class="btn btn-primary" onclick="showCreateFormModal()">
        Create New Form
      </button>
    </div>
    <div class="card">
      <div class="card-body" id="formsContainer">
        <div class="loading">
          <div class="spinner"></div>
          <p>Loading forms...</p>
        </div>
      </div>
    </div>
  `;

  try {
    forms = await apiRequest('/admin/forms');

    if (forms.length > 0) {
      document.getElementById('formsContainer').innerHTML = `
        <div class="table-container">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Submissions</th>
                <th>Status</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              ${forms.map(form => `
                <tr>
                  <td><strong>${escapeHtml(form.name)}</strong></td>
                  <td>${escapeHtml(form.email)}</td>
                  <td>${form.submission_count}</td>
                  <td>
                    <span class="badge ${form.active ? 'badge-success' : 'badge-danger'}">
                      ${form.active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>${new Date(form.created_at).toLocaleDateString()}</td>
                  <td>
                    <div class="actions">
                      <button class="btn btn-sm btn-primary" onclick="viewFormDetails('${form.id}')">
                        Details
                      </button>
                      <button class="btn btn-sm btn-secondary" onclick="viewFormSubmissions('${form.id}')">
                        Submissions
                      </button>
                      <button class="btn btn-sm btn-danger" onclick="deleteForm('${form.id}')">
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `;
    } else {
      document.getElementById('formsContainer').innerHTML = `
        <div class="empty-state">
          <h3>No forms yet</h3>
          <p>Create your first form to start collecting submissions</p>
          <button class="btn btn-primary" onclick="showCreateFormModal()">Create Form</button>
        </div>
      `;
    }
  } catch (error) {
    console.error('Error loading forms:', error);
    document.getElementById('formsContainer').innerHTML = `
      <div class="alert alert-error">Failed to load forms</div>
    `;
  }
}

function showCreateFormModal() {
  const modal = document.getElementById('formModal');
  document.getElementById('formModalTitle').textContent = 'Create New Form';
  document.getElementById('formId').value = '';
  document.getElementById('formName').value = '';
  document.getElementById('formEmail').value = '';
  document.getElementById('formRedirectUrl').value = '';
  document.getElementById('formSuccessMessage').value = 'Thank you for your submission!';
  modal.classList.add('active');
}

function closeFormModal() {
  document.getElementById('formModal').classList.remove('active');
}

async function saveForm(e) {
  e.preventDefault();
  
  const formId = document.getElementById('formId').value;
  const formData = {
    name: document.getElementById('formName').value,
    email: document.getElementById('formEmail').value,
    redirect_url: document.getElementById('formRedirectUrl').value || undefined,
    success_message: document.getElementById('formSuccessMessage').value,
  };

  try {
    if (formId) {
      await apiRequest(`/admin/forms/${formId}`, {
        method: 'PUT',
        body: JSON.stringify(formData),
      });
    } else {
      await apiRequest('/admin/forms', {
        method: 'POST',
        body: JSON.stringify(formData),
      });
    }

    closeFormModal();
    loadForms();
  } catch (error) {
    console.error('Error saving form:', error);
    alert('Failed to save form');
  }
}

async function viewFormDetails(formId) {
  try {
    const form = await apiRequest(`/admin/forms/${formId}`);
    const modal = document.getElementById('detailsModal');
    
    const submissionUrl = `${window.location.origin}/api/submit/${form.api_key}`;
    
    document.getElementById('detailsContent').innerHTML = `
      <div class="form-group">
        <label>Form Name</label>
        <input type="text" value="${escapeHtml(form.name)}" readonly>
      </div>
      <div class="form-group">
        <label>Notification Email</label>
        <input type="text" value="${escapeHtml(form.email)}" readonly>
      </div>
      <div class="form-group">
        <label>API Key</label>
        <div style="display: flex; gap: 10px;">
          <input type="text" value="${form.api_key}" readonly style="flex: 1;">
          <button class="btn btn-secondary" onclick="regenerateApiKey('${form.id}')">Regenerate</button>
        </div>
      </div>
      <div class="form-group">
        <label>Submission URL</label>
        <div class="code-block">
          <button class="copy-btn" onclick="copyToClipboard('${submissionUrl}')">Copy</button>
          ${submissionUrl}
        </div>
      </div>
      <div class="form-group">
        <label>HTML Integration Example</label>
        <div class="code-block">
          <button class="copy-btn" onclick="copyToClipboard(this.nextElementSibling.textContent)">Copy</button>
          <pre>&lt;form action="${submissionUrl}" method="POST"&gt;
  &lt;input type="text" name="name" placeholder="Your Name" required&gt;
  &lt;input type="email" name="email" placeholder="Your Email" required&gt;
  &lt;textarea name="message" placeholder="Your Message" required&gt;&lt;/textarea&gt;
  &lt;button type="submit"&gt;Submit&lt;/button&gt;
&lt;/form&gt;</pre>
        </div>
      </div>
      <div class="form-group">
        <label>JavaScript/AJAX Example</label>
        <div class="code-block">
          <button class="copy-btn" onclick="copyToClipboard(this.nextElementSibling.textContent)">Copy</button>
          <pre>fetch('${submissionUrl}', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'John Doe',
    email: 'john@example.com',
    message: 'Hello!'
  })
})
.then(res => res.json())
.then(data => console.log(data));</pre>
        </div>
      </div>
    `;
    
    modal.classList.add('active');
  } catch (error) {
    console.error('Error loading form details:', error);
    alert('Failed to load form details');
  }
}

function closeDetailsModal() {
  document.getElementById('detailsModal').classList.remove('active');
}

async function regenerateApiKey(formId) {
  if (!confirm('Are you sure? This will invalidate the current API key and break existing integrations.')) {
    return;
  }

  try {
    await apiRequest(`/admin/forms/${formId}/regenerate-key`, { method: 'POST' });
    alert('API key regenerated successfully');
    viewFormDetails(formId);
  } catch (error) {
    console.error('Error regenerating API key:', error);
    alert('Failed to regenerate API key');
  }
}

async function deleteForm(formId) {
  if (!confirm('Are you sure you want to delete this form? All submissions will also be deleted.')) {
    return;
  }

  try {
    await apiRequest(`/admin/forms/${formId}`, { method: 'DELETE' });
    loadForms();
  } catch (error) {
    console.error('Error deleting form:', error);
    alert('Failed to delete form');
  }
}

// Submissions
async function viewFormSubmissions(formId) {
  currentFormId = formId;
  const form = forms.find(f => f.id === formId);
  
  const content = document.getElementById('mainContent');
  content.innerHTML = `
    <div class="header">
      <h1>Submissions: ${escapeHtml(form.name)}</h1>
      <button class="btn btn-secondary" onclick="loadForms()">Back to Forms</button>
    </div>
    <div class="card">
      <div class="card-body" id="submissionsContainer">
        <div class="loading">
          <div class="spinner"></div>
          <p>Loading submissions...</p>
        </div>
      </div>
    </div>
  `;

  try {
    const data = await apiRequest(`/admin/forms/${formId}/submissions?limit=100`);
    
    if (data.submissions.length > 0) {
      document.getElementById('submissionsContainer').innerHTML = `
        <p style="margin-bottom: 20px; color: var(--text-light);">
          Showing ${data.submissions.length} of ${data.total} submissions
        </p>
        <div class="table-container">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Data</th>
                <th>IP Address</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              ${data.submissions.map(sub => `
                <tr>
                  <td>${new Date(sub.created_at).toLocaleString()}</td>
                  <td>
                    <button class="btn btn-sm btn-primary" onclick="viewSubmissionDetails('${sub.id}', ${escapeHtml(JSON.stringify(sub.data))})">
                      View Details
                    </button>
                  </td>
                  <td>${sub.ip_address || 'N/A'}</td>
                  <td>
                    <button class="btn btn-sm btn-danger" onclick="deleteSubmission('${sub.id}')">
                      Delete
                    </button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `;
    } else {
      document.getElementById('submissionsContainer').innerHTML = `
        <div class="empty-state">
          <h3>No submissions yet</h3>
          <p>Submissions will appear here once your form receives data</p>
        </div>
      `;
    }
  } catch (error) {
    console.error('Error loading submissions:', error);
    document.getElementById('submissionsContainer').innerHTML = `
      <div class="alert alert-error">Failed to load submissions</div>
    `;
  }
}

function viewSubmissionDetails(submissionId, data) {
  const modal = document.getElementById('submissionModal');
  
  const fields = Object.entries(data).map(([key, value]) => {
    const displayValue = typeof value === 'object' ? JSON.stringify(value, null, 2) : value;
    return `
      <div class="submission-field">
        <strong>${escapeHtml(key)}</strong>
        <span>${escapeHtml(String(displayValue))}</span>
      </div>
    `;
  }).join('');
  
  document.getElementById('submissionDetails').innerHTML = `
    <div class="submission-details">
      ${fields}
    </div>
  `;
  
  modal.classList.add('active');
}

function closeSubmissionModal() {
  document.getElementById('submissionModal').classList.remove('active');
}

async function deleteSubmission(submissionId) {
  if (!confirm('Are you sure you want to delete this submission?')) {
    return;
  }

  try {
    await apiRequest(`/admin/submissions/${submissionId}`, { method: 'DELETE' });
    viewFormSubmissions(currentFormId);
  } catch (error) {
    console.error('Error deleting submission:', error);
    alert('Failed to delete submission');
  }
}

async function loadAllSubmissions() {
  const content = document.getElementById('mainContent');
  content.innerHTML = `
    <div class="header">
      <h1>All Submissions</h1>
    </div>
    <div class="card">
      <div class="card-body">
        <p>Select a form from the Forms page to view its submissions.</p>
      </div>
    </div>
  `;
}

// Utility functions
function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return String(text).replace(/[&<>"']/g, m => map[m]);
}

function copyToClipboard(text) {
  navigator.clipboard.writeText(text).then(() => {
    alert('Copied to clipboard!');
  }).catch(err => {
    console.error('Failed to copy:', err);
  });
}