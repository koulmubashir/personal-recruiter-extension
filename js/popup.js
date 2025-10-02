// Popup JavaScript for Personal Recruiter Extension
class PopupController {
  constructor() {
    this.isAuthenticated = false;
    this.userProfile = null;
    this.applications = [];
    
    this.initElements();
    this.setupEventListeners();
    this.checkAuthStatus();
  }

  initElements() {
    // Authentication elements
    this.authSection = document.getElementById('authSection');
    this.mainContent = document.getElementById('mainContent');
    this.userSection = document.getElementById('userSection');
    this.loginBtn = document.getElementById('loginBtn');
    this.logoutBtn = document.getElementById('logoutBtn');
    this.userName = document.getElementById('userName');
    this.userAvatar = document.getElementById('userAvatar');

    // Stats elements
    this.totalApplications = document.getElementById('totalApplications');
    this.thisWeekApplications = document.getElementById('thisWeekApplications');

    // Action buttons
    this.manualAddBtn = document.getElementById('manualAddBtn');
    this.historyBtn = document.getElementById('historyBtn');
    this.exportBtn = document.getElementById('exportBtn');

    // Recent applications
    this.recentApplications = document.getElementById('recentApplications');
    this.noApplications = document.getElementById('noApplications');

    // Settings
    this.autoDetectionToggle = document.getElementById('autoDetectionToggle');
    this.notificationsToggle = document.getElementById('notificationsToggle');

    // Modal elements
    this.manualAddModal = document.getElementById('manualAddModal');
    this.manualAddForm = document.getElementById('manualAddForm');
    this.closeModal = document.getElementById('closeModal');
    this.cancelAdd = document.getElementById('cancelAdd');

    // Loading overlay
    this.loadingOverlay = document.getElementById('loadingOverlay');
  }

  setupEventListeners() {
    // Authentication
    this.loginBtn.addEventListener('click', () => this.login());
    this.logoutBtn.addEventListener('click', () => this.logout());

    // Actions
    this.manualAddBtn.addEventListener('click', () => this.showManualAddModal());
    this.historyBtn.addEventListener('click', () => this.openHistoryPage());
    this.exportBtn.addEventListener('click', () => this.exportToCSV());

    // Modal
    this.closeModal.addEventListener('click', () => this.hideManualAddModal());
    this.cancelAdd.addEventListener('click', () => this.hideManualAddModal());
    this.manualAddForm.addEventListener('submit', (e) => this.saveManualApplication(e));

    // Settings
    this.autoDetectionToggle.addEventListener('change', () => this.updateSettings());
    this.notificationsToggle.addEventListener('change', () => this.updateSettings());

    // Close modal when clicking outside
    this.manualAddModal.addEventListener('click', (e) => {
      if (e.target === this.manualAddModal) {
        this.hideManualAddModal();
      }
    });
  }

  async checkAuthStatus() {
    this.showLoading();
    
    try {
      console.log('Checking authentication status...');
      
      // First check storage directly using Promise wrapper
      const storageResult = await new Promise((resolve) => {
        chrome.storage.sync.get(['isAuthenticated', 'userProfile'], (result) => {
          if (chrome.runtime.lastError) {
            console.error('Storage error:', chrome.runtime.lastError);
            resolve({});
          } else {
            resolve(result);
          }
        });
      });
      
      console.log('Storage auth status:', storageResult);
      
      if (storageResult.isAuthenticated && storageResult.userProfile) {
        console.log('Found authentication in storage');
        this.isAuthenticated = true;
        this.userProfile = storageResult.userProfile;
        this.showMainContent();
        await this.loadApplications();
        await this.loadSettings();
        return;
      }
      
      // If not in storage, check with background script
      const response = await this.sendMessage({ action: 'getAuthStatus' });
      
      if (response && response.success) {
        this.isAuthenticated = response.data.isAuthenticated;
        this.userProfile = response.data.userProfile;
        
        if (this.isAuthenticated) {
          this.showMainContent();
          await this.loadApplications();
          await this.loadSettings();
        } else {
          this.showAuthSection();
        }
      } else {
        console.log('No valid auth response, showing auth section');
        this.showAuthSection();
      }
    } catch (error) {
      console.error('Failed to check auth status:', error);
      this.showAuthSection();
    } finally {
      this.hideLoading();
    }
  }

  async login() {
    this.showLoading();
    
    try {
      console.log('Popup: Starting login process...');
      
      // Show status message
      this.showStatusMessage('Opening Google sign-in...');
      
      // Wait a bit longer for the authentication response
      const response = await this.sendMessage({ action: 'authenticate' }, 60000); // 60 second timeout
      
      console.log('Popup: Authentication response:', response);
      
      if (response && response.success && response.user) {
        console.log('Popup: Authentication successful!');
        this.isAuthenticated = true;
        this.userProfile = response.user;
        this.showMainContent();
        await this.loadApplications();
        await this.loadSettings();
        
        // Show success message briefly
        this.showSuccessMessage(`Welcome ${response.user.name || response.user.email}!`);
      } else {
        console.error('Authentication failed:', response);
        const errorMsg = response?.error || 'Authentication failed';
        
        // Wait a moment and then check storage directly
        this.showStatusMessage('Checking authentication status...');
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Check if auth actually worked despite the error
        const storageCheck = await new Promise((resolve) => {
          chrome.storage.sync.get(['isAuthenticated', 'userProfile'], (result) => {
            if (chrome.runtime.lastError) {
              console.error('Storage check error:', chrome.runtime.lastError);
              resolve({});
            } else {
              resolve(result);
            }
          });
        });
        
        if (storageCheck.isAuthenticated && storageCheck.userProfile) {
          console.log('Authentication actually succeeded, found in storage');
          this.isAuthenticated = true;
          this.userProfile = storageCheck.userProfile;
          this.showMainContent();
          await this.loadApplications();
          await this.loadSettings();
          this.showSuccessMessage(`Welcome ${storageCheck.userProfile.name || storageCheck.userProfile.email}!`);
        } else {
          this.showError(`Authentication failed: ${errorMsg}`);
        }
      }
    } catch (error) {
      console.error('Login failed:', error);
      
      // Check if user is actually authenticated despite the error
      this.showStatusMessage('Checking authentication status...');
      
      setTimeout(async () => {
        try {
          const storageCheck = await new Promise((resolve) => {
            chrome.storage.sync.get(['isAuthenticated', 'userProfile'], (result) => {
              if (chrome.runtime.lastError) {
                console.error('Storage check error:', chrome.runtime.lastError);
                resolve({});
              } else {
                resolve(result);
              }
            });
          });
          
          if (storageCheck.isAuthenticated && storageCheck.userProfile) {
            console.log('Found authentication in storage after error');
            this.isAuthenticated = true;
            this.userProfile = storageCheck.userProfile;
            this.showMainContent();
            await this.loadApplications();
            await this.loadSettings();
            this.showSuccessMessage(`Welcome ${storageCheck.userProfile.name || storageCheck.userProfile.email}!`);
          } else {
            this.showError('Authentication process failed. Please try again.');
          }
        } catch (checkError) {
          console.error('Auth check failed:', checkError);
          this.showError('Authentication process failed. Please try again.');
        }
      }, 3000);
      
    } finally {
      this.hideLoading();
    }
  }

  async logout() {
    this.showLoading();
    
    try {
      const response = await this.sendMessage({ action: 'logout' });
      
      if (response.success) {
        this.isAuthenticated = false;
        this.userProfile = null;
        this.applications = [];
        this.showAuthSection();
      }
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      this.hideLoading();
    }
  }

  showAuthSection() {
    this.authSection.style.display = 'block';
    this.mainContent.style.display = 'none';
    this.userSection.style.display = 'none';
  }

  showMainContent() {
    this.authSection.style.display = 'none';
    this.mainContent.style.display = 'block';
    this.userSection.style.display = 'flex';
    
    if (this.userProfile) {
      this.userName.textContent = this.userProfile.name || this.userProfile.email;
      this.userAvatar.src = this.userProfile.picture || '';
    }
  }

  async loadApplications() {
    try {
      const response = await this.sendMessage({ action: 'getJobApplications' });
      
      if (response.success) {
        this.applications = response.data;
        this.updateStats();
        this.updateRecentApplications();
      }
    } catch (error) {
      console.error('Failed to load applications:', error);
    }
  }

  updateStats() {
    const total = this.applications.length;
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    const thisWeek = this.applications.filter(app => 
      new Date(app.timestamp) > oneWeekAgo
    ).length;
    
    this.totalApplications.textContent = total;
    this.thisWeekApplications.textContent = thisWeek;
  }

  updateRecentApplications() {
    const recent = this.applications.slice(0, 5);
    
    if (recent.length === 0) {
      this.recentApplications.style.display = 'none';
      this.noApplications.style.display = 'block';
      return;
    }
    
    this.recentApplications.style.display = 'block';
    this.noApplications.style.display = 'none';
    
    this.recentApplications.innerHTML = recent.map(app => `
      <div class="recent-item">
        <button class="delete-btn" onclick="popupController.deleteApplication('${app.id}')" title="Delete">
          🗑️
        </button>
        <h4>${app.jobTitle || 'Unknown Position'}</h4>
        <p><strong>Company:</strong> ${app.company || 'Unknown Company'}</p>
        <p><strong>Status:</strong> ${app.status || 'Applied'}</p>
        <p class="date">${new Date(app.timestamp).toLocaleDateString()}</p>
      </div>
    `).join('');
  }

  async deleteApplication(id) {
    if (!confirm('Are you sure you want to delete this application?')) {
      return;
    }
    
    try {
      const response = await this.sendMessage({ 
        action: 'deleteApplication', 
        id: id 
      });
      
      if (response.success) {
        await this.loadApplications();
      }
    } catch (error) {
      console.error('Failed to delete application:', error);
      this.showError('Failed to delete application.');
    }
  }

  showManualAddModal() {
    // Pre-fill with current tab URL if it's a job site
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        document.getElementById('jobUrl').value = tabs[0].url;
      }
    });
    
    this.manualAddModal.style.display = 'flex';
  }

  hideManualAddModal() {
    this.manualAddModal.style.display = 'none';
    this.manualAddForm.reset();
  }

  async saveManualApplication(e) {
    e.preventDefault();
    
    const formData = new FormData(this.manualAddForm);
    const applicationData = {
      jobTitle: formData.get('jobTitle') || document.getElementById('jobTitle').value,
      company: formData.get('company') || document.getElementById('company').value,
      url: formData.get('jobUrl') || document.getElementById('jobUrl').value,
      jobId: formData.get('jobId') || document.getElementById('jobId').value,
      status: formData.get('status') || document.getElementById('status').value,
      notes: formData.get('notes') || document.getElementById('notes').value,
      manual: true
    };
    
    try {
      const response = await this.sendMessage({
        action: 'saveJobApplication',
        data: applicationData
      });
      
      if (response.success) {
        this.hideManualAddModal();
        await this.loadApplications();
      } else {
        this.showError('Failed to save application.');
      }
    } catch (error) {
      console.error('Failed to save manual application:', error);
      this.showError('Failed to save application.');
    }
  }

  openHistoryPage() {
    chrome.tabs.create({ url: chrome.runtime.getURL('history.html') });
  }

  async exportToCSV() {
    try {
      const response = await this.sendMessage({ action: 'exportToCSV' });
      
      if (response.success && response.data) {
        this.downloadCSV(response.data);
      } else {
        this.showError('No data to export or export failed.');
      }
    } catch (error) {
      console.error('Export failed:', error);
      this.showError('Failed to export data.');
    }
  }

  downloadCSV(csvContent) {
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    
    a.href = url;
    a.download = `job-applications-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  async loadSettings() {
    try {
      const result = await chrome.storage.sync.get(['settings']);
      const settings = result.settings || {};
      
      this.autoDetectionToggle.checked = settings.autoDetection !== false;
      this.notificationsToggle.checked = settings.notifications !== false;
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  }

  async updateSettings() {
    try {
      const settings = {
        autoDetection: this.autoDetectionToggle.checked,
        notifications: this.notificationsToggle.checked,
        trackingEnabled: this.autoDetectionToggle.checked
      };
      
      await chrome.storage.sync.set({ settings });
    } catch (error) {
      console.error('Failed to update settings:', error);
    }
  }

  showLoading() {
    this.loadingOverlay.style.display = 'flex';
  }

  hideLoading() {
    this.loadingOverlay.style.display = 'none';
  }

  showError(message) {
    // Create or update error message display
    let errorDiv = document.getElementById('errorMessage');
    if (!errorDiv) {
      errorDiv = document.createElement('div');
      errorDiv.id = 'errorMessage';
      errorDiv.style.cssText = `
        background: #fee;
        color: #c33;
        padding: 10px;
        border-radius: 4px;
        margin: 10px 20px;
        border: 1px solid #fcc;
        font-size: 14px;
      `;
      document.querySelector('.container').appendChild(errorDiv);
    }
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
    
    // Hide after 10 seconds
    setTimeout(() => {
      if (errorDiv) errorDiv.style.display = 'none';
    }, 10000);
  }

  showStatusMessage(message) {
    // Create or update status message display
    let statusDiv = document.getElementById('statusMessage');
    if (!statusDiv) {
      statusDiv = document.createElement('div');
      statusDiv.id = 'statusMessage';
      statusDiv.style.cssText = `
        background: #e6f3ff;
        color: #0066cc;
        padding: 10px;
        border-radius: 4px;
        margin: 10px 20px;
        border: 1px solid #b3d9ff;
        font-size: 14px;
      `;
      document.querySelector('.container').appendChild(statusDiv);
    }
    statusDiv.textContent = message;
    statusDiv.style.display = 'block';
    
    // Hide after 5 seconds
    setTimeout(() => {
      if (statusDiv) statusDiv.style.display = 'none';
    }, 5000);
  }

  showSuccessMessage(message) {
    // Create success message display
    const successDiv = document.createElement('div');
    successDiv.style.cssText = `
      background: #efe;
      color: #363;
      padding: 10px;
      border-radius: 4px;
      margin: 10px 20px;
      border: 1px solid #cfc;
      font-size: 14px;
    `;
    successDiv.textContent = message;
    document.querySelector('.container').appendChild(successDiv);
    
    // Hide after 3 seconds
    setTimeout(() => {
      if (successDiv.parentNode) {
        successDiv.parentNode.removeChild(successDiv);
      }
    }, 3000);
  }

  sendMessage(message, timeout = 10000) {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error('Message timeout'));
      }, timeout);
      
      chrome.runtime.sendMessage(message, (response) => {
        clearTimeout(timer);
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          resolve(response);
        }
      });
    });
  }
}

// Initialize popup controller when DOM is loaded
let popupController;
document.addEventListener('DOMContentLoaded', () => {
  popupController = new PopupController();
});
