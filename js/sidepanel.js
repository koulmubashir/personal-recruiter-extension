// Side Panel JavaScript for Personal Recruiter Extension
class SidePanelController {
  constructor() {
    this.isAuthenticated = false;
    this.currentUser = null;
    this.applications = [];
    this.activeTab = 'quick';
    
    this.initElements();
    this.setupEventListeners();
    this.checkAuthStatus();
  }

  initElements() {
    // Auth elements
    this.authSection = document.getElementById('authSection');
    this.loginBtn = document.getElementById('loginBtn');
    this.userSection = document.getElementById('userSection');
    this.userAvatar = document.getElementById('userAvatar');
    this.userName = document.getElementById('userName');
    this.logoutBtn = document.getElementById('logoutBtn');

    // Main content
    this.mainContent = document.getElementById('mainContent');
    this.totalApplications = document.getElementById('totalApplications');
    this.thisWeekApplications = document.getElementById('thisWeekApplications');

    // Tab elements
    this.tabButtons = document.querySelectorAll('.tab-btn');
    this.tabPanels = document.querySelectorAll('.tab-panel');

    // Quick add form
    this.quickAddForm = document.getElementById('quickAddForm');
    this.jobTitle = document.getElementById('jobTitle');
    this.company = document.getElementById('company');
    this.jobUrl = document.getElementById('jobUrl');
    this.jobId = document.getElementById('jobId');
    this.status = document.getElementById('status');
    this.notes = document.getElementById('notes');

    // Recent and history
    this.recentApplications = document.getElementById('recentApplications');
    this.noApplications = document.getElementById('noApplications');
    this.historyApplications = document.getElementById('historyApplications');
    this.statusFilter = document.getElementById('statusFilter');
    this.timeFilter = document.getElementById('timeFilter');

    // Action buttons
    this.exportBtn = document.getElementById('exportBtn');
    this.viewFullHistoryBtn = document.getElementById('viewFullHistoryBtn');

    // Settings
    this.autoDetectionToggle = document.getElementById('autoDetectionToggle');
    this.notificationsToggle = document.getElementById('notificationsToggle');

    // Loading
    this.loadingOverlay = document.getElementById('loadingOverlay');
  }

  setupEventListeners() {
    // Auth
    this.loginBtn.addEventListener('click', () => this.login());
    this.logoutBtn.addEventListener('click', () => this.logout());

    // Tabs
    this.tabButtons.forEach(btn => {
      btn.addEventListener('click', () => this.switchTab(btn.dataset.tab));
    });

    // Quick add form
    this.quickAddForm.addEventListener('submit', (e) => this.saveQuickApplication(e));

    // Action buttons
    this.exportBtn.addEventListener('click', () => this.exportApplications());
    this.viewFullHistoryBtn.addEventListener('click', () => this.openFullHistory());

    // Filters
    this.statusFilter.addEventListener('change', () => this.filterHistory());
    this.timeFilter.addEventListener('change', () => this.filterHistory());

    // Settings
    this.autoDetectionToggle.addEventListener('change', () => this.updateSettings());
    this.notificationsToggle.addEventListener('change', () => this.updateSettings());
  }

  async checkAuthStatus() {
    console.log('=== SIDEPANEL: Checking auth status ===');
    this.showLoading();
    
    try {
      const response = await this.sendMessage({ action: 'getAuthStatus' });
      console.log('Auth status response:', response);
      
      if (response && response.success) {
        if (response.data && response.data.isAuthenticated) {
          this.isAuthenticated = true;
          this.currentUser = response.data.user;
          this.showMainContent();
          await this.loadApplications();
        } else {
          this.showAuthSection();
        }
      } else {
        console.error('Failed to get auth status:', response);
        this.showAuthSection();
      }
    } catch (error) {
      console.error('Auth check error:', error);
      this.showAuthSection();
    } finally {
      this.hideLoading();
    }
  }

  async login() {
    console.log('=== SIDEPANEL: Starting login ===');
    this.showLoading();
    
    try {
      const response = await this.sendMessage({ action: 'authenticate' });
      console.log('Login response:', response);
      
      if (response && response.success && response.data) {
        this.isAuthenticated = true;
        this.currentUser = response.data;
        this.showMainContent();
        await this.loadApplications();
      } else {
        this.showError('Login failed: ' + (response?.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Login error:', error);
      this.showError('Login failed: ' + error.message);
    } finally {
      this.hideLoading();
    }
  }

  async logout() {
    console.log('=== SIDEPANEL: Logging out ===');
    this.showLoading();
    
    try {
      const response = await this.sendMessage({ action: 'logout' });
      console.log('Logout response:', response);
      
      this.isAuthenticated = false;
      this.currentUser = null;
      this.applications = [];
      this.showAuthSection();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      this.hideLoading();
    }
  }

  showAuthSection() {
    this.authSection.style.display = 'flex';
    this.userSection.style.display = 'none';
    this.mainContent.style.display = 'none';
  }

  showMainContent() {
    this.authSection.style.display = 'none';
    this.userSection.style.display = 'block';
    this.mainContent.style.display = 'flex';
    
    if (this.currentUser) {
      this.userAvatar.src = this.currentUser.picture || '';
      this.userName.textContent = this.currentUser.name || this.currentUser.email || 'User';
    }
  }

  switchTab(tabName) {
    // Update tab buttons
    this.tabButtons.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tab === tabName);
    });

    // Update tab panels
    this.tabPanels.forEach(panel => {
      panel.classList.toggle('active', panel.id === `${tabName}Tab`);
    });

    this.activeTab = tabName;

    // Load data for the active tab
    if (tabName === 'recent' || tabName === 'history') {
      this.loadApplications();
    }
  }

  async saveQuickApplication(e) {
    e.preventDefault();
    console.log('=== SIDEPANEL: Saving quick application ===');
    
    const applicationData = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      jobTitle: this.jobTitle.value.trim(),
      company: this.company.value.trim(),
      url: this.jobUrl.value.trim(),
      jobId: this.jobId.value.trim(),
      status: this.status.value,
      notes: this.notes.value.trim(),
      manual: true
    };

    console.log('Application data:', applicationData);
    
    try {
      const response = await this.sendMessage({
        action: 'saveJobApplication',
        data: applicationData
      });
      
      console.log('Save response:', response);
      
      if (response && response.success) {
        console.log('✅ Application saved successfully');
        this.quickAddForm.reset();
        this.showSuccess('Application saved successfully!');
        await this.loadApplications();
      } else {
        console.error('❌ Failed to save application:', response);
        this.showError('Failed to save application: ' + (response?.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('❌ Save error:', error);
      this.showError('Failed to save application: ' + error.message);
    }
  }

  async loadApplications() {
    console.log('=== SIDEPANEL: Loading applications ===');
    
    try {
      const response = await this.sendMessage({ action: 'getJobApplications' });
      console.log('Applications response:', response);
      
      if (response && response.success) {
        this.applications = response.data || [];
        console.log('✅ Loaded applications:', this.applications.length);
        this.updateStats();
        this.renderRecentApplications();
        this.renderHistoryApplications();
      } else {
        console.error('❌ Failed to load applications:', response);
      }
    } catch (error) {
      console.error('❌ Load applications error:', error);
    }
  }

  updateStats() {
    const total = this.applications.length;
    this.totalApplications.textContent = total;

    // This week count
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    const thisWeek = this.applications.filter(app => {
      const appDate = new Date(app.timestamp);
      return appDate >= oneWeekAgo;
    }).length;
    
    this.thisWeekApplications.textContent = thisWeek;
  }

  renderRecentApplications() {
    const recentApps = this.applications
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 5);

    if (recentApps.length === 0) {
      this.recentApplications.style.display = 'none';
      this.noApplications.style.display = 'block';
      return;
    }

    this.recentApplications.style.display = 'block';
    this.noApplications.style.display = 'none';

    this.recentApplications.innerHTML = recentApps.map(app => `
      <div class="recent-item">
        <div class="recent-item-header">
          <div class="recent-item-title">${app.jobTitle || 'Unknown Position'}</div>
          <span class="recent-item-status status-${(app.status || 'applied').toLowerCase().replace(' ', '-')}">
            ${app.status || 'Applied'}
          </span>
        </div>
        <div class="recent-item-company">${app.company || 'Unknown Company'}</div>
        <div class="recent-item-date">${this.formatDate(app.timestamp)}</div>
      </div>
    `).join('');
  }

  renderHistoryApplications() {
    let filteredApps = [...this.applications];

    // Apply status filter
    if (this.statusFilter.value) {
      filteredApps = filteredApps.filter(app => app.status === this.statusFilter.value);
    }

    // Apply time filter
    if (this.timeFilter.value) {
      const now = new Date();
      let cutoffDate;
      
      switch (this.timeFilter.value) {
        case 'week':
          cutoffDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'month':
          cutoffDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        case 'quarter':
          cutoffDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
          break;
      }
      
      if (cutoffDate) {
        filteredApps = filteredApps.filter(app => new Date(app.timestamp) >= cutoffDate);
      }
    }

    // Sort by most recent
    filteredApps.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    // Take first 10 for the side panel
    const displayApps = filteredApps.slice(0, 10);

    this.historyApplications.innerHTML = displayApps.map(app => `
      <div class="history-item">
        <div class="history-item-header">
          <div class="history-item-title">${app.jobTitle || 'Unknown Position'}</div>
          <span class="recent-item-status status-${(app.status || 'applied').toLowerCase().replace(' ', '-')}">
            ${app.status || 'Applied'}
          </span>
        </div>
        <div class="history-item-company">${app.company || 'Unknown Company'}</div>
        <div class="history-item-date">${this.formatDate(app.timestamp)}</div>
      </div>
    `).join('');
  }

  filterHistory() {
    this.renderHistoryApplications();
  }

  async exportApplications() {
    try {
      const response = await this.sendMessage({ action: 'exportToCSV' });
      
      if (response && response.success && response.data) {
        this.downloadCSV(response.data);
        this.showSuccess('Applications exported successfully!');
      } else {
        this.showError('No data to export or export failed');
      }
    } catch (error) {
      console.error('Export failed:', error);
      this.showError('Failed to export data');
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

  openFullHistory() {
    chrome.tabs.create({ url: chrome.runtime.getURL('history.html') });
  }

  updateSettings() {
    const settings = {
      autoDetection: this.autoDetectionToggle.checked,
      notifications: this.notificationsToggle.checked
    };

    chrome.storage.sync.set({ settings }, () => {
      if (chrome.runtime.lastError) {
        console.error('Failed to save settings:', chrome.runtime.lastError);
      } else {
        console.log('Settings saved:', settings);
      }
    });
  }

  formatDate(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      return 'Today';
    } else if (diffDays === 2) {
      return 'Yesterday';
    } else if (diffDays <= 7) {
      return `${diffDays - 1} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  }

  showLoading() {
    this.loadingOverlay.style.display = 'flex';
  }

  hideLoading() {
    this.loadingOverlay.style.display = 'none';
  }

  showSuccess(message) {
    // Simple alert for now - could be enhanced with a toast notification
    alert('✅ ' + message);
  }

  showError(message) {
    alert('❌ ' + message);
    console.error('Error:', message);
  }

  sendMessage(message) {
    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage(message, (response) => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          resolve(response);
        }
      });
    });
  }
}

// Initialize side panel controller when DOM is loaded
let sidePanelController;
document.addEventListener('DOMContentLoaded', () => {
  sidePanelController = new SidePanelController();
  // Make it globally accessible for debugging
  window.sidePanelController = sidePanelController;
});
