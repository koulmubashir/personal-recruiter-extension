// Background service worker for Personal Recruiter Extension
class PersonalRecruiter {
  constructor() {
    // Set to false for real Google OAuth authentication
    this.useMockAuth = false; // REAL GOOGLE AUTH ENABLED
    
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
    console.log('=== Personal Recruiter Background Script Initializing ===');
    
    // Set up listeners
    chrome.runtime.onInstalled.addListener(() => this.onInstalled());
    chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => this.onTabUpdated(tabId, changeInfo, tab));
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => this.onMessage(request, sender, sendResponse));
    
    // Only add click listener if side panel doesn't auto-open
    chrome.action.onClicked.addListener(() => this.onActionClick());
    
    console.log('✅ Event listeners set up');
    console.log('Chrome version info:', navigator.userAgent);
    console.log('SidePanel API available:', !!chrome.sidePanel);
    
    // Check authentication status on startup
    this.checkAuthStatus();
  }

  async onActionClick() {
    console.log('=== Extension icon clicked ===');
    
    try {
      // Get the current active tab
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      console.log('Current tab:', tab.id);
      
      // Try to enable and open the side panel
      if (chrome.sidePanel && chrome.sidePanel.open) {
        console.log('Attempting to open side panel...');
        
        // First try to set the panel for this tab (in case it's not enabled)
        try {
          await chrome.sidePanel.setOptions({
            tabId: tab.id,
            path: 'sidepanel.html',
            enabled: true
          });
        } catch (e) {
          console.log('SetOptions not available or failed:', e.message);
        }
        
        // Then try to open it
        await chrome.sidePanel.open({ tabId: tab.id });
        console.log('✅ Side panel opened successfully');
        
      } else {
        throw new Error('SidePanel API not available');
      }
      
    } catch (error) {
      console.error('❌ Failed to open side panel:', error);
      console.log('Opening fallback tab...');
      
      // Fallback: open in a new tab but with better sizing
      const newTab = await chrome.tabs.create({
        url: chrome.runtime.getURL('sidepanel.html'),
        active: true
      });
      
      // Try to resize the window to be more side-panel-like
      try {
        const window = await chrome.windows.get(newTab.windowId);
        await chrome.windows.update(newTab.windowId, {
          width: Math.min(1400, window.width),
          height: window.height
        });
      } catch (e) {
        console.log('Could not resize window:', e.message);
      }
    }
  }

  async onInstalled() {
    console.log('Extension installed/updated');
    
    // Set up side panel for all tabs
    try {
      if (chrome.sidePanel && chrome.sidePanel.setPanelBehavior) {
        await chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });
        console.log('✅ Side panel behavior set to open on action click');
      }
    } catch (error) {
      console.log('Could not set panel behavior:', error.message);
    }
    
    // Initialize storage with default settings
    const defaultSettings = {
      autoDetection: true,
      notifications: true
    };
    
    chrome.storage.sync.get(['settings'], (result) => {
      if (!result.settings) {
        chrome.storage.sync.set({ settings: defaultSettings });
      }
    });
  }

  async onTabUpdated(tabId, changeInfo, tab) {
    if (changeInfo.status === 'complete' && tab.url) {
      await this.analyzePageForJobContent(tab);
    }
  }

  onMessage(request, sender, sendResponse) {
    console.log('Background received message:', request);
    
    // Handle async responses with proper promise chain
    const handleAsync = async () => {
      try {
        switch (request.action || request.type) {
          case 'ping':
            console.log('Ping received, sending pong');
            return { success: true, message: 'pong', timestamp: Date.now() };
            
          case 'authenticate':
            console.log('=== BACKGROUND: Processing authenticate request ===');
            const result = await this.authenticate();
            console.log('=== BACKGROUND: Sending auth result to sidepanel ===');
            return { success: true, data: result };
            
          case 'logout':
            await this.logout();
            return { success: true };
            
          case 'saveJobApplication':
            console.log('Processing saveJobApplication request');
            const saveResult = await this.saveJobApplication(request.data);
            return { success: true, data: saveResult };
            
          case 'JOB_DETECTED':
            console.log('Job detected from content script:', request.data);
            await this.storeDetectedJob(request.data);
            return { success: true };
            
          case 'getJobApplications':
            console.log('Processing getJobApplications request');
            const jobApplications = await this.getJobApplications();
            return { success: true, data: jobApplications };
            
          case 'exportToCSV':
            const csvData = await this.exportToCSV();
            return { success: true, data: csvData };
            
          case 'deleteApplication':
            await this.deleteApplication(request.id);
            return { success: true };
            
          case 'getAuthStatus':
            const authStatus = await this.getAuthStatus();
            return { success: true, data: authStatus };
            
          default:
            return { success: false, error: 'Unknown action' };
        }
      } catch (error) {
        console.error('=== BACKGROUND: Message handler error ===');
        console.error('Action:', request.action || request.type);
        console.error('Error details:', {
          message: error.message,
          stack: error.stack,
          name: error.name
        });
        return { success: false, error: error.message, details: error.stack };
      }
    };
    
    // Execute async handler and send response
    handleAsync()
      .then(response => {
        console.log('=== BACKGROUND: Sending response ===', response);
        sendResponse(response);
      })
      .catch(error => {
        console.error('=== BACKGROUND: Handler error ===', error);
        sendResponse({ success: false, error: error.message, details: error.stack });
      });
    
    return true; // Keep message channel open for async response
  }

  async authenticate() {
    // Mock authentication for testing (remove after OAuth setup)
    if (this.useMockAuth) {
      console.log('=== MOCK AUTH: Using test authentication ===');
      
      const mockUser = {
        id: 'test-user-123',
        email: 'test@example.com',
        name: 'Test User',
        picture: 'https://via.placeholder.com/96x96.png?text=TU'
      };
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      await chrome.storage.sync.set({
        isAuthenticated: true,
        userProfile: mockUser,
        authToken: 'mock-token-' + Date.now()
      });
      
      console.log('=== MOCK AUTH: Test authentication successful ===');
      return mockUser;
    }
    
    // Real OAuth authentication
    try {
      console.log('=== BACKGROUND: Starting authentication ===');
      
      // Clear any existing cached tokens first
      await this.clearAuthToken();
      
      // Request interactive authentication with promise wrapper for compatibility
      let token;
      try {
        console.log('Requesting auth token...');
        token = await new Promise((resolve, reject) => {
          chrome.identity.getAuthToken({ interactive: true }, (authToken) => {
            if (chrome.runtime.lastError) {
              console.error('Chrome identity error:', chrome.runtime.lastError);
              reject(new Error(chrome.runtime.lastError.message));
            } else {
              console.log('Token received successfully');
              resolve(authToken);
            }
          });
        });
      } catch (error) {
        console.error('Token request failed:', error);
        console.error('Error details:', {
          message: error.message,
          stack: error.stack,
          name: error.name
        });
        throw new Error('Token request failed: ' + error.message);
      }
      
      console.log('Raw token response:', token);
      console.log('Token type:', typeof token);
      
      if (!token || typeof token !== 'string') {
        const errorMsg = 'No valid authentication token received. Got: ' + typeof token + ' value: ' + String(token);
        console.error(errorMsg);
        throw new Error(errorMsg);
      }
      
      console.log('Got auth token (length:', token.length, ')');
      console.log('Token starts with:', token.substring(0, 20) + '...');
      
      // Validate token format
      if (!token.startsWith('ya29.') && !token.startsWith('Bearer ')) {
        console.warn('Unexpected token format:', token.substring(0, 50));
      }
      
      // Use the simplest possible approach - OAuth2 v1 userinfo
      console.log('Making API request to Google...');
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
        const errorMsg = `Failed to fetch user profile: ${response.status} ${response.statusText} - ${errorText}`;
        throw new Error(errorMsg);
      }
      
      const userProfile = await response.json();
      console.log('Got user profile:', userProfile);
      
      // Store authentication data
      console.log('Storing authentication data...');
      await chrome.storage.sync.set({
        isAuthenticated: true,
        userProfile: userProfile,
        authToken: token
      });
      
      console.log('=== BACKGROUND: Authentication successful ===');
      return userProfile;
      
    } catch (error) {
      console.error('=== BACKGROUND: Authentication failed ===');
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name,
        cause: error.cause
      });
      
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
      console.log('=== BACKGROUND: Starting logout ===');
      
      if (this.useMockAuth) {
        console.log('=== MOCK AUTH: Mock logout ===');
        await chrome.storage.sync.set({
          isAuthenticated: false,
          userProfile: null,
          authToken: null
        });
        return;
      }
      
      // Real OAuth logout
      const { authToken } = await chrome.storage.sync.get(['authToken']);
      
      if (authToken && authToken !== 'mock-token') {
        await chrome.identity.removeCachedAuthToken({ token: authToken });
      }
      
      await chrome.storage.sync.set({
        isAuthenticated: false,
        userProfile: null,
        authToken: null
      });
      
      console.log('=== BACKGROUND: Logout successful ===');
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
    console.log('=== BACKGROUND: Saving job application ===', applicationData);
    
    return new Promise((resolve, reject) => {
      // Add a small delay to prevent quota issues
      setTimeout(() => {
        chrome.storage.sync.get(['jobApplications'], (result) => {
          if (chrome.runtime.lastError) {
            console.error('Storage get error:', chrome.runtime.lastError);
            
            // Try local storage as fallback
            chrome.storage.local.get(['jobApplications'], (localResult) => {
              if (chrome.runtime.lastError) {
                reject(new Error('Storage quota exceeded. Please export your data and clear some applications.'));
                return;
              }
              this.saveToStorage(localResult.jobApplications || [], applicationData, resolve, reject, 'local');
            });
            return;
          }
          
          this.saveToStorage(result.jobApplications || [], applicationData, resolve, reject, 'sync');
        });
      }, 50); // Small delay to prevent rate limiting
    });
  }

  saveToStorage(jobApplications, applicationData, resolve, reject, storageType = 'sync') {
    // Check for duplicates to prevent excessive storage usage
    const existingIndex = jobApplications.findIndex(app => 
      app.jobTitle === applicationData.jobTitle && 
      app.company === applicationData.company &&
      app.url === applicationData.url
    );
    
    const newApplication = {
      id: Date.now().toString(),
      timestamp: Date.now(), // Use timestamp for better sorting
      dateCreated: new Date().toISOString(),
      ...applicationData
    };
    
    if (existingIndex !== -1) {
      // Update existing application instead of creating duplicate
      jobApplications[existingIndex] = { ...jobApplications[existingIndex], ...newApplication };
      console.log('Updated existing application to prevent duplicate');
    } else {
      jobApplications.push(newApplication);
    }
    
    const storage = storageType === 'sync' ? chrome.storage.sync : chrome.storage.local;
    
    storage.set({ jobApplications }, () => {
      if (chrome.runtime.lastError) {
        console.error(`${storageType} storage set error:`, chrome.runtime.lastError);
        
        if (storageType === 'sync') {
          // Fallback to local storage
          console.log('Trying local storage as fallback...');
          chrome.storage.local.set({ jobApplications }, () => {
            if (chrome.runtime.lastError) {
              reject(new Error('Storage quota exceeded. Please export your data and clear some applications.'));
            } else {
              console.log('✅ Application saved to local storage');
              resolve(newApplication);
            }
          });
        } else {
          reject(new Error('Storage quota exceeded. Please export your data and clear some applications.'));
        }
      } else {
        console.log(`✅ Application saved to ${storageType} storage. Total:`, jobApplications.length);
        resolve(newApplication);
      }
    });
  }

  async storeDetectedJob(jobData) {
    console.log('Storing detected job for potential tracking:', jobData);
    
    // Store the detected job temporarily for user to potentially save
    await chrome.storage.local.set({ 
      lastDetectedJob: {
        ...jobData,
        detectedAt: new Date().toISOString()
      }
    });
  }

  async getJobApplications() {
    console.log('=== BACKGROUND: Getting job applications ===');
    return new Promise((resolve) => {
      chrome.storage.sync.get(['jobApplications'], (result) => {
        if (chrome.runtime.lastError) {
          console.warn('Sync storage error, trying local storage:', chrome.runtime.lastError);
          // Fallback to local storage
          chrome.storage.local.get(['jobApplications'], (localResult) => {
            if (chrome.runtime.lastError) {
              console.error('Both storage types failed:', chrome.runtime.lastError);
              resolve([]);
            } else {
              const applications = localResult.jobApplications || [];
              console.log('✅ Retrieved applications from local storage:', applications.length);
              const sorted = applications.sort((a, b) => {
                const timestampA = typeof a.timestamp === 'string' ? new Date(a.timestamp).getTime() : a.timestamp;
                const timestampB = typeof b.timestamp === 'string' ? new Date(b.timestamp).getTime() : b.timestamp;
                return timestampB - timestampA;
              });
              resolve(sorted);
            }
          });
        } else {
          const applications = result.jobApplications || [];
          console.log('✅ Retrieved applications from sync storage:', applications.length);
          const sorted = applications.sort((a, b) => {
            const timestampA = typeof a.timestamp === 'string' ? new Date(a.timestamp).getTime() : a.timestamp;
            const timestampB = typeof b.timestamp === 'string' ? new Date(b.timestamp).getTime() : b.timestamp;
            return timestampB - timestampA;
          });
          resolve(sorted);
        }
      });
    });
  }

  async deleteApplication(id) {
    console.log('Deleting application:', id);
    return new Promise((resolve, reject) => {
      chrome.storage.sync.get(['jobApplications'], (result) => {
        if (chrome.runtime.lastError) {
          console.error('Storage get error:', chrome.runtime.lastError);
          reject(chrome.runtime.lastError);
          return;
        }
        
        const jobApplications = result.jobApplications || [];
        const updatedApplications = jobApplications.filter(app => app.id !== id);
        
        chrome.storage.sync.set({ jobApplications: updatedApplications }, () => {
          if (chrome.runtime.lastError) {
            console.error('Storage set error:', chrome.runtime.lastError);
            reject(chrome.runtime.lastError);
          } else {
            console.log('Application deleted successfully');
            resolve();
          }
        });
      });
    });
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
    return { 
      isAuthenticated: isAuthenticated || false, 
      user: userProfile,
      userProfile: userProfile  // Keep both for compatibility
    };
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
