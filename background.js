// Background service worker for Personal Recruiter Extension
class PersonalRecruiter {
  constructor() {
    this.jobSites = [
      // Job boards
      'linkedin.com/jobs',
      'indeed.com',
      'glassdoor.com',
      'monster.com',
      'ziprecruiter.com',
      'careerbuilder.com',
      'simplyhired.com',
      'dice.com',
      'angellist.com',
      'wellfound.com',
      'stackoverflow.com/jobs',
      'github.com/jobs',
      'remote.co',
      'weworkremotely.com',
      'flexjobs.com',
      'upwork.com',
      'freelancer.com',
      'toptal.com',
      
      // Company career pages patterns
      '/careers',
      '/jobs',
      '/employment',
      '/opportunities',
      '/join-us',
      '/work-with-us',
      '/hiring',
      '/positions',
      '/openings'
    ];
    
    this.init();
  }

  init() {
    // Set up listeners
    chrome.runtime.onInstalled.addListener(() => this.onInstalled());
    chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => this.onTabUpdated(tabId, changeInfo, tab));
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => this.onMessage(request, sender, sendResponse));
    
    // Check authentication status on startup
    this.checkAuthStatus();
  }

  async onInstalled() {
    console.log('Personal Recruiter Extension installed');
    
    // Initialize storage
    await chrome.storage.sync.set({
      jobApplications: [],
      isAuthenticated: false,
      userProfile: null,
      settings: {
        autoDetection: true,
        notifications: true,
        trackingEnabled: true
      }
    });
  }

  async onTabUpdated(tabId, changeInfo, tab) {
    if (changeInfo.status === 'complete' && tab.url) {
      await this.analyzePageForJobContent(tab);
    }
  }

  async onMessage(request, sender, sendResponse) {
    try {
      switch (request.action) {
        case 'authenticate':
          const result = await this.authenticate();
          sendResponse({ success: true, user: result });
          break;
          
        case 'logout':
          await this.logout();
          sendResponse({ success: true });
          break;
          
        case 'saveJobApplication':
          await this.saveJobApplication(request.data);
          sendResponse({ success: true });
          break;
          
        case 'getJobApplications':
          const applications = await this.getJobApplications();
          sendResponse({ success: true, data: applications });
          break;
          
        case 'exportToCSV':
          const csvData = await this.exportToCSV();
          sendResponse({ success: true, data: csvData });
          break;
          
        case 'deleteApplication':
          await this.deleteApplication(request.id);
          sendResponse({ success: true });
          break;
          
        case 'getAuthStatus':
          const authStatus = await this.getAuthStatus();
          sendResponse({ success: true, data: authStatus });
          break;
          
        default:
          sendResponse({ success: false, error: 'Unknown action' });
      }
    } catch (error) {
      console.error('Background script error:', error);
      sendResponse({ success: false, error: error.message });
    }
    
    return true; // Keep message channel open for async response
  }

  async authenticate() {
    try {
      console.log('Starting authentication...');
      
      // Clear any existing cached tokens first
      await this.clearAuthToken();
      
      // Request interactive authentication with promise wrapper for compatibility
      let token;
      try {
        token = await new Promise((resolve, reject) => {
          chrome.identity.getAuthToken({ interactive: true }, (authToken) => {
            if (chrome.runtime.lastError) {
              reject(new Error(chrome.runtime.lastError.message));
            } else {
              resolve(authToken);
            }
          });
        });
      } catch (error) {
        console.error('Token request failed:', error);
        throw new Error('Authentication failed: ' + error.message);
      }
      
      console.log('Raw token response:', token);
      console.log('Token type:', typeof token);
      
      if (!token || typeof token !== 'string') {
        throw new Error('No valid authentication token received. Got: ' + typeof token);
      }
      
      console.log('Got auth token (length:', token.length, ')');
      console.log('Token starts with:', token.substring(0, 20) + '...');
      
      // Validate token format
      if (!token.startsWith('ya29.') && !token.startsWith('Bearer ')) {
        console.warn('Unexpected token format:', token.substring(0, 50));
      }
      
      // Use the simplest possible approach - OAuth2 v1 userinfo
      const response = await fetch('https://www.googleapis.com/oauth2/v1/userinfo?alt=json', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('API Response status:', response.status);
      console.log('API Response headers:', Object.fromEntries(response.headers.entries()));
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error Response:', errorText);
        throw new Error(`Failed to fetch user profile: ${response.status} ${response.statusText}`);
      }
      
      const userProfile = await response.json();
      console.log('Got user profile:', userProfile);
      
      // Store authentication data
      await chrome.storage.sync.set({
        isAuthenticated: true,
        userProfile: userProfile,
        authToken: token
      });
      
      console.log('Authentication successful, user data stored');
      return userProfile;
      
    } catch (error) {
      console.error('Authentication failed:', error);
      
      // Clear any stored auth data on failure
      await chrome.storage.sync.set({
        isAuthenticated: false,
        userProfile: null,
        authToken: null
      });
      
      throw error;
    }
  }

  async clearAuthToken() {
    try {
      // Clear from storage first
      const { authToken } = await chrome.storage.sync.get(['authToken']);
      
      // Get current cached token using callback approach
      const cachedToken = await new Promise((resolve) => {
        chrome.identity.getAuthToken({ interactive: false }, (token) => {
          if (chrome.runtime.lastError) {
            console.log('No cached token found:', chrome.runtime.lastError.message);
            resolve(null);
          } else {
            resolve(token);
          }
        });
      });
      
      // Remove cached token if it exists and is a string
      if (cachedToken && typeof cachedToken === 'string') {
        await new Promise((resolve) => {
          chrome.identity.removeCachedAuthToken({ token: cachedToken }, () => {
            console.log('Cleared cached auth token');
            resolve();
          });
        });
      }
      
      // Remove stored token if it exists and is different from cached
      if (authToken && typeof authToken === 'string' && authToken !== cachedToken) {
        await new Promise((resolve) => {
          chrome.identity.removeCachedAuthToken({ token: authToken }, () => {
            console.log('Cleared stored auth token');
            resolve();
          });
        });
      }
      
      // Clear storage
      await chrome.storage.sync.set({
        authToken: null,
        isAuthenticated: false,
        userProfile: null
      });
      
    } catch (error) {
      console.log('Error clearing tokens:', error.message);
    }
  }

  async logout() {
    try {
      const { authToken } = await chrome.storage.sync.get(['authToken']);
      
      if (authToken) {
        await chrome.identity.removeCachedAuthToken({ token: authToken });
      }
      
      await chrome.storage.sync.set({
        isAuthenticated: false,
        userProfile: null,
        authToken: null
      });
    } catch (error) {
      console.error('Logout failed:', error);
      throw error;
    }
  }

  async analyzePageForJobContent(tab) {
    const { settings } = await chrome.storage.sync.get(['settings']);
    
    if (!settings?.autoDetection || !settings?.trackingEnabled) {
      return;
    }

    const url = tab.url.toLowerCase();
    const isJobSite = this.jobSites.some(site => url.includes(site.toLowerCase()));
    
    if (isJobSite) {
      // Inject content script to analyze the page
      try {
        await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          files: ['content.js']
        });
      } catch (error) {
        console.error('Failed to inject content script:', error);
      }
    }
  }

  async saveJobApplication(applicationData) {
    const { jobApplications = [] } = await chrome.storage.sync.get(['jobApplications']);
    
    const newApplication = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      ...applicationData
    };
    
    jobApplications.push(newApplication);
    
    await chrome.storage.sync.set({ jobApplications });
    
    // Show notification
    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'icons/icon48.png',
      title: 'Job Application Saved',
      message: `Application for "${applicationData.jobTitle}" has been tracked.`
    });
  }

  async getJobApplications() {
    const { jobApplications = [] } = await chrome.storage.sync.get(['jobApplications']);
    return jobApplications.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }

  async deleteApplication(id) {
    const { jobApplications = [] } = await chrome.storage.sync.get(['jobApplications']);
    const updatedApplications = jobApplications.filter(app => app.id !== id);
    await chrome.storage.sync.set({ jobApplications: updatedApplications });
  }

  async exportToCSV() {
    const applications = await this.getJobApplications();
    
    if (applications.length === 0) {
      return null;
    }
    
    const headers = ['Date Applied', 'Job Title', 'Company', 'Job ID', 'URL', 'Status', 'Notes'];
    const csvContent = [
      headers.join(','),
      ...applications.map(app => [
        new Date(app.timestamp).toLocaleDateString(),
        `"${app.jobTitle || ''}"`,
        `"${app.company || ''}"`,
        `"${app.jobId || ''}"`,
        `"${app.url || ''}"`,
        `"${app.status || 'Applied'}"`,
        `"${app.notes || ''}"`
      ].join(','))
    ].join('\n');
    
    return csvContent;
  }

  async getAuthStatus() {
    const { isAuthenticated, userProfile } = await chrome.storage.sync.get(['isAuthenticated', 'userProfile']);
    return { isAuthenticated, userProfile };
  }

  async checkAuthStatus() {
    try {
      const token = await chrome.identity.getAuthToken({ interactive: false });
      if (token) {
        await chrome.storage.sync.set({ isAuthenticated: true });
      }
    } catch (error) {
      await chrome.storage.sync.set({ isAuthenticated: false });
    }
  }
}

// Initialize the extension
new PersonalRecruiter();
