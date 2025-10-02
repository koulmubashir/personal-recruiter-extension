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
    this.aiMagicBtn = document.getElementById('aiMagicBtn');
    this.saveApplicationBtn = document.getElementById('saveApplicationBtn');

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
    
    // Toast container
    this.toastContainer = document.getElementById('toastContainer');
    
    // Job details modal
    this.jobDetailsModal = document.getElementById('jobDetailsModal');
    this.closeModal = document.getElementById('closeModal');
    this.modalJobTitle = document.getElementById('modalJobTitle');
    this.modalCompany = document.getElementById('modalCompany');
    this.modalStatus = document.getElementById('modalStatus');
    this.modalJobId = document.getElementById('modalJobId');
    this.modalAppliedDate = document.getElementById('modalAppliedDate');
    this.modalJobUrl = document.getElementById('modalJobUrl');
    this.modalNotes = document.getElementById('modalNotes');
    this.editJobBtn = document.getElementById('editJobBtn');
    this.deleteJobBtn = document.getElementById('deleteJobBtn');
    this.updateStatusBtn = document.getElementById('updateStatusBtn');
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
    this.aiMagicBtn.addEventListener('click', () => this.runAIMagic());
    
    // Reset save button styling when form is manually modified
    [this.jobTitle, this.company, this.jobUrl, this.jobId, this.notes].forEach(field => {
      field.addEventListener('input', () => this.resetSaveButtonStyle());
    });
    this.status.addEventListener('change', () => this.resetSaveButtonStyle());

    // Action buttons
    this.exportBtn.addEventListener('click', () => this.exportApplications());
    this.viewFullHistoryBtn.addEventListener('click', () => this.openFullHistory());

    // Filters
    this.statusFilter.addEventListener('change', () => this.filterHistory());
    this.timeFilter.addEventListener('change', () => this.filterHistory());

    // Settings
    this.autoDetectionToggle.addEventListener('change', () => this.updateSettings());
    this.notificationsToggle.addEventListener('change', () => this.updateSettings());
    
    // Modal event listeners
    this.closeModal.addEventListener('click', () => this.closeJobDetailsModal());
    this.jobDetailsModal.addEventListener('click', (e) => {
      if (e.target === this.jobDetailsModal) {
        this.closeJobDetailsModal();
      }
    });
    this.editJobBtn.addEventListener('click', () => this.editJobApplication());
    this.deleteJobBtn.addEventListener('click', () => this.deleteJobApplication());
    this.updateStatusBtn.addEventListener('click', () => this.updateJobStatus());
    
    // ESC key to close modal
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.jobDetailsModal.style.display !== 'none') {
        this.closeJobDetailsModal();
      }
    });
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
      console.log('=== SIDEPANEL: Sending authenticate message ===');
      const response = await this.sendMessage({ action: 'authenticate' });
      console.log('=== SIDEPANEL: Login response ===', response);
      
      if (response && response.success && response.data) {
        console.log('=== SIDEPANEL: Login successful ===');
        this.isAuthenticated = true;
        this.currentUser = response.data;
        this.showMainContent();
        await this.loadApplications();
      } else {
        const errorMsg = 'Login failed: ' + (response?.error || 'Unknown error');
        console.error('=== SIDEPANEL: Login failed ===', errorMsg);
        console.error('Full response:', response);
        this.showError(errorMsg);
      }
    } catch (error) {
      console.error('=== SIDEPANEL: Login exception ===', error);
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
      // Update avatar with Google profile picture
      const avatarImg = document.getElementById('userAvatar');
      const userNameEl = document.getElementById('userName');
      const userEmailEl = document.getElementById('userEmail');
      
      if (avatarImg) {
        avatarImg.src = this.currentUser.picture || 'https://via.placeholder.com/40x40.png?text=👤';
        avatarImg.alt = `${this.currentUser.name || 'User'}'s profile picture`;
      }
      
      if (userNameEl) {
        userNameEl.textContent = this.currentUser.name || 'Google User';
      }
      
      if (userEmailEl) {
        userEmailEl.textContent = this.currentUser.email || '';
      }
      
      console.log('=== SIDEPANEL: Displaying user ===', {
        name: this.currentUser.name,
        email: this.currentUser.email,
        picture: this.currentUser.picture
      });
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
        
        // Sample data creation disabled - user can add applications manually
        // if (this.applications.length === 0) {
        //   console.log('No applications found, creating sample data...');
        //   await this.createSampleData();
        // }
        
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

  async runAIMagic() {
    console.log('=== Running AI Magic ===');
    
    // Update button to loading state
    this.aiMagicBtn.textContent = '🔮 Analyzing Page...';
    this.aiMagicBtn.classList.add('loading');
    this.aiMagicBtn.disabled = true;
    
    try {
      // Get current active tab
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      
      if (!tab) {
        throw new Error('No active tab found');
      }
      
      console.log('Current tab:', tab.url);
      
      // Check if we can access the tab
      if (tab.url.startsWith('chrome://') || tab.url.startsWith('chrome-extension://') || tab.url.startsWith('moz-extension://')) {
        throw new Error('Cannot analyze Chrome internal pages or extension pages');
      }
      
      console.log('Injecting content script...');
      
      // Inject content script to extract page data
      let results;
      try {
        results = await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          func: () => {
            console.log('Content script injected, extracting data...');
            
            // Function to extract job page data - injected directly
            const data = {
              title: document.title,
              url: window.location.href,
              text: '',
              structured: {}
            };
            
            console.log('Document title:', data.title);
            
            // Get visible text content
            try {
              const walker = document.createTreeWalker(
                document.body,
                NodeFilter.SHOW_TEXT,
                {
                  acceptNode: function(node) {
                    const parent = node.parentElement;
                    if (!parent) return NodeFilter.FILTER_REJECT;
                    
                    // Skip script, style, and hidden elements
                    const tagName = parent.tagName.toLowerCase();
                    if (['script', 'style', 'noscript'].includes(tagName)) {
                      return NodeFilter.FILTER_REJECT;
                    }
                    
                    const style = window.getComputedStyle(parent);
                    if (style.display === 'none' || style.visibility === 'hidden') {
                      return NodeFilter.FILTER_REJECT;
                    }
                    
                    return NodeFilter.FILTER_ACCEPT;
                  }
                }
              );
              
              const textNodes = [];
              let node;
              while (node = walker.nextNode()) {
                const text = node.textContent.trim();
                if (text.length > 3) {
                  textNodes.push(text);
                }
              }
              
              data.text = textNodes.join(' ').substring(0, 5000); // Limit to 5000 chars
              console.log('Extracted text length:', data.text.length);
            } catch (textError) {
              console.warn('Text extraction failed:', textError);
              data.text = document.body.textContent?.substring(0, 5000) || '';
            }
            
            // Try to extract structured data
            data.structured = {
              metaTags: {},
              jsonLd: [],
              headings: [],
              links: []
            };
            
            try {
              // Meta tags
              document.querySelectorAll('meta[property], meta[name]').forEach(meta => {
                const property = meta.getAttribute('property') || meta.getAttribute('name');
                const content = meta.getAttribute('content');
                if (property && content) {
                  data.structured.metaTags[property] = content;
                }
              });
              
              // JSON-LD structured data
              document.querySelectorAll('script[type="application/ld+json"]').forEach(script => {
                try {
                  const jsonData = JSON.parse(script.textContent);
                  data.structured.jsonLd.push(jsonData);
                } catch (e) {
                  // Ignore invalid JSON
                }
              });
              
              // Headings
              document.querySelectorAll('h1, h2, h3').forEach(heading => {
                data.structured.headings.push({
                  tag: heading.tagName,
                  text: heading.textContent.trim()
                });
              });
              
              console.log('Structured data extracted:', {
                metaTagsCount: Object.keys(data.structured.metaTags).length,
                jsonLdCount: data.structured.jsonLd.length,
                headingsCount: data.structured.headings.length
              });
              
            } catch (structuredError) {
              console.warn('Structured data extraction failed:', structuredError);
            }
            
            return data;
          }
        });
      } catch (scriptError) {
        console.error('Script injection failed:', scriptError);
        throw new Error(`Failed to inject content script: ${scriptError.message}`);
      }
      
      if (!results || !results[0]) {
        throw new Error('Content script execution failed - no results returned');
      }
      
      const pageData = results[0].result;
      
      if (!pageData) {
        throw new Error('Content script returned no data');
      }
      
      console.log('Extracted page data:', pageData);
      
      // Use AI to parse the data
      const jobInfo = await this.parseJobDataWithAI(pageData, tab.url);
      console.log('Parsed job info:', jobInfo);
      
      // Fill the form with parsed data
      this.fillFormWithJobInfo(jobInfo);
      
      // Show success message
      this.showToast('✨ AI Magic completed! Form filled with extracted data.', 'success');
      
    } catch (error) {
      console.error('AI Magic error:', error);
      console.error('Error stack:', error.stack);
      this.showToast(`AI Magic failed: ${error.message}`, 'error');
    } finally {
      // Reset button
      this.aiMagicBtn.textContent = '🪄 AI Magic - Auto Fill from Page';
      this.aiMagicBtn.classList.remove('loading');
      this.aiMagicBtn.disabled = false;
    }
  }

  async parseJobDataWithAI(pageData, url) {
    // Simple rule-based AI parsing (can be enhanced with actual AI later)
    const text = pageData.text.toLowerCase();
    const title = pageData.title;
    const headings = pageData.structured.headings;
    
    const jobInfo = {
      jobTitle: '',
      company: '',
      jobId: '',
      url: url,
      notes: 'Auto-filled by AI Magic',
      confidence: 0
    };
    
    // Extract job title
    // Priority: 1. JSON-LD, 2. Meta tags, 3. Headings, 4. Title patterns
    
    // Check JSON-LD for JobPosting
    for (const ld of pageData.structured.jsonLd) {
      if (ld['@type'] === 'JobPosting' || (Array.isArray(ld) && ld.some(item => item['@type'] === 'JobPosting'))) {
        const jobPosting = Array.isArray(ld) ? ld.find(item => item['@type'] === 'JobPosting') : ld;
        if (jobPosting.title) {
          jobInfo.jobTitle = jobPosting.title;
          jobInfo.confidence += 0.4;
        }
        if (jobPosting.hiringOrganization?.name) {
          jobInfo.company = jobPosting.hiringOrganization.name;
          jobInfo.confidence += 0.4;
        }
      }
    }
    
    // Check meta tags
    const metaTags = pageData.structured.metaTags;
    if (!jobInfo.jobTitle && metaTags['og:title']) {
      jobInfo.jobTitle = metaTags['og:title'];
      jobInfo.confidence += 0.2;
    }
    
    // Extract from headings if not found
    if (!jobInfo.jobTitle && headings.length > 0) {
      // Look for job title patterns in headings
      const jobTitlePatterns = /\b(developer|engineer|manager|analyst|designer|specialist|coordinator|director|lead|senior|junior|intern)\b/i;
      
      for (const heading of headings) {
        if (jobTitlePatterns.test(heading.text)) {
          jobInfo.jobTitle = heading.text;
          jobInfo.confidence += 0.2;
          break;
        }
      }
      
      // Fallback to first heading
      if (!jobInfo.jobTitle) {
        jobInfo.jobTitle = headings[0].text;
        jobInfo.confidence += 0.1;
      }
    }
    
    // Extract company name
    if (!jobInfo.company) {
      // Look for company patterns in various places
      const companyPatterns = [
        /at ([A-Z][a-zA-Z\s&.,]+(?:Inc|LLC|Corp|Ltd|Co|Company))/i,
        /([A-Z][a-zA-Z\s&.,]+(?:Inc|LLC|Corp|Ltd|Co|Company))/i,
        /company[:\s]+([A-Z][a-zA-Z\s&.,]+)/i
      ];
      
      for (const pattern of companyPatterns) {
        const match = text.match(pattern);
        if (match) {
          jobInfo.company = match[1].trim();
          jobInfo.confidence += 0.2;
          break;
        }
      }
      
      // Try to extract from URL
      if (!jobInfo.company) {
        const urlParts = url.replace(/^https?:\/\//i, '').split('/')[0].split('.');
        if (urlParts.length >= 2) {
          const domain = urlParts[urlParts.length - 2];
          if (domain !== 'com' && domain !== 'org' && domain !== 'net') {
            jobInfo.company = domain.charAt(0).toUpperCase() + domain.slice(1);
            jobInfo.confidence += 0.1;
          }
        }
      }
    }
    
    // Extract job ID
    if (!jobInfo.jobId) {
      // First check JSON-LD for identifier or jobID
      for (const ld of pageData.structured.jsonLd) {
        if (ld['@type'] === 'JobPosting' || (Array.isArray(ld) && ld.some(item => item['@type'] === 'JobPosting'))) {
          const jobPosting = Array.isArray(ld) ? ld.find(item => item['@type'] === 'JobPosting') : ld;
          if (jobPosting.identifier) {
            jobInfo.jobId = jobPosting.identifier;
            jobInfo.confidence += 0.3;
            break;
          }
        }
      }
      
      // Look for job ID patterns in text and URL
      if (!jobInfo.jobId) {
        const jobIdPatterns = [
          // Common job ID formats
          /job[_\s]*id[:\s]*([A-Z0-9-]{3,20})/i,
          /position[_\s]*id[:\s]*([A-Z0-9-]{3,20})/i,
          /req[_\s]*(?:id|number)[:\s]*([A-Z0-9-]{3,20})/i,
          /reference[_\s]*(?:id|number)[:\s]*([A-Z0-9-]{3,20})/i,
          /posting[_\s]*id[:\s]*([A-Z0-9-]{3,20})/i,
          
          // URL patterns
          /\/jobs?\/([A-Z0-9-]{3,20})/i,
          /\/positions?\/([A-Z0-9-]{3,20})/i,
          /\/career[s]?\/([A-Z0-9-]{3,20})/i,
          /[?&](?:job|position|req)_?id=([A-Z0-9-]{3,20})/i,
          
          // General patterns in text
          /\b([A-Z]{2,4}[-_]\d{3,6})\b/,  // REQ-12345, TC-001
          /\b([A-Z]{2,6}\d{3,6})\b/,      // REQ12345, TECH001
          /\b(\d{4,8})\b/,                // Simple numbers like 123456
          
          // LinkedIn specific
          /currentJobId[:\s]*([A-Z0-9-]{3,20})/i,
          
          // Indeed specific
          /jk=([A-Za-z0-9]{10,})/,
          
          // Company-specific patterns
          /\b(JR\d+)\b/i,                 // JR123
          /\b(P\d+)\b/i,                  // P123
          /\b(R\d+)\b/i                   // R123
        ];
        
        // First try URL patterns (higher confidence)
        for (const pattern of jobIdPatterns.slice(5, 9)) {
          const match = url.match(pattern);
          if (match && match[1]) {
            jobInfo.jobId = match[1];
            jobInfo.confidence += 0.2;
            break;
          }
        }
        
        // Then try text patterns if no URL match
        if (!jobInfo.jobId) {
          const fullText = pageData.text + ' ' + pageData.title;
          for (const pattern of jobIdPatterns) {
            const match = fullText.match(pattern);
            if (match && match[1]) {
              const id = match[1];
              // Validate the job ID (not too short, not all numbers unless long enough)
              if (id.length >= 3 && (!/^\d+$/.test(id) || id.length >= 5)) {
                jobInfo.jobId = id;
                jobInfo.confidence += 0.15;
                break;
              }
            }
          }
        }
        
        // Special handling for meta tags
        if (!jobInfo.jobId) {
          const metaTags = pageData.structured.metaTags;
          const jobIdMetaKeys = ['job-id', 'position-id', 'req-id', 'posting-id', 'jobId', 'positionId'];
          
          for (const key of jobIdMetaKeys) {
            if (metaTags[key]) {
              jobInfo.jobId = metaTags[key];
              jobInfo.confidence += 0.2;
              break;
            }
          }
        }
      }
    }
    
    // Clean up extracted data
    if (jobInfo.jobTitle) {
      jobInfo.jobTitle = jobInfo.jobTitle.replace(/\s+/g, ' ').trim();
      // Remove common suffixes
      jobInfo.jobTitle = jobInfo.jobTitle.replace(/\s*[-|]\s*.*$/, '').trim();
    }
    
    if (jobInfo.company) {
      jobInfo.company = jobInfo.company.replace(/\s+/g, ' ').trim();
      // Remove common suffixes
      jobInfo.company = jobInfo.company.replace(/\s*(Inc|LLC|Corp|Ltd|Co|Company)\.?$/i, '').trim();
    }
    
    if (jobInfo.jobId) {
      jobInfo.jobId = jobInfo.jobId.replace(/\s+/g, '').trim().toUpperCase();
    }
    
    return jobInfo;
  }

  fillFormWithJobInfo(jobInfo) {
    console.log('Filling form with:', jobInfo);
    
    // Fill the form fields
    if (jobInfo.jobTitle) {
      this.jobTitle.value = jobInfo.jobTitle;
    }
    
    if (jobInfo.company) {
      this.company.value = jobInfo.company;
    }
    
    if (jobInfo.url) {
      this.jobUrl.value = jobInfo.url;
    }
    
    if (jobInfo.jobId) {
      this.jobId.value = jobInfo.jobId;
    }
    
    if (jobInfo.notes) {
      this.notes.value = jobInfo.notes;
    }
    
    // Change save button to green if we have good data
    if (jobInfo.confidence > 0.3 || (jobInfo.jobTitle && jobInfo.company)) {
      this.saveApplicationBtn.classList.add('ai-filled');
      this.saveApplicationBtn.innerHTML = '<span class="btn-icon">✨</span>Save AI-Filled Application';
    }
    
    // Focus on the first empty required field
    if (!this.jobTitle.value) {
      this.jobTitle.focus();
    } else if (!this.company.value) {
      this.company.focus();
    }
  }

  resetSaveButtonStyle() {
    this.saveApplicationBtn.classList.remove('ai-filled');
    this.saveApplicationBtn.innerHTML = '<span class="btn-icon">➕</span>Save Application';
  }

  async createSampleData() {
    // Ask user for confirmation before creating sample data
    if (!confirm('This will create 3 sample job applications for testing. Continue?')) {
      return;
    }

    const sampleApplications = [
      {
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        jobTitle: 'Senior Frontend Developer',
        company: 'TechCorp Inc.',
        status: 'Applied',
        url: 'https://example.com/job1',
        jobId: 'TC-001',
        notes: 'Applied through company website',
        manual: true
      },
      {
        id: (Date.now() + 1).toString(),
        timestamp: new Date(Date.now() - 86400000).toISOString(),
        jobTitle: 'Full Stack Engineer',
        company: 'StartupXYZ',
        status: 'In Review',
        url: 'https://example.com/job2',
        jobId: 'SXY-002',
        notes: 'Recruiter reached out on LinkedIn',
        manual: true
      },
      {
        id: (Date.now() + 2).toString(),
        timestamp: new Date(Date.now() - 172800000).toISOString(),
        jobTitle: 'React Developer',
        company: 'Digital Agency',
        status: 'Interview Scheduled',
        url: 'https://example.com/job3',
        jobId: 'DA-003',
        notes: 'Phone interview next Tuesday',
        manual: true
      }
    ];

    try {
      for (const app of sampleApplications) {
        await this.sendMessage({
          action: 'saveJobApplication',
          data: app
        });
      }
      console.log('✅ Sample data created');
      this.showToast('Sample job applications created for testing', 'success');
      
      // Reload applications
      setTimeout(() => this.loadApplications(), 500);
    } catch (error) {
      console.error('Failed to create sample data:', error);
      this.showToast('Failed to create sample data: ' + error.message, 'error');
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
      <div class="recent-item clickable" data-app-id="${app.id}" data-app='${JSON.stringify(app).replace(/'/g, "&apos;")}'>
        <div class="recent-item-header">
          <div class="recent-item-title">${app.jobTitle || 'Unknown Position'}</div>
          <span class="recent-item-status status-${(app.status || 'applied').toLowerCase().replace(' ', '-')}">
            ${app.status || 'Applied'}
          </span>
        </div>
        <div class="recent-item-company">${app.company || 'Unknown Company'}</div>
        <div class="recent-item-date">${this.formatDate(app.timestamp)}</div>
        <div class="click-hint">Click to view details</div>
      </div>
    `).join('');
    
    // Add click event listeners to recent items
    this.recentApplications.querySelectorAll('.recent-item.clickable').forEach(item => {
      item.addEventListener('click', () => {
        const appData = JSON.parse(item.getAttribute('data-app').replace(/&apos;/g, "'"));
        this.showJobDetailsModal(appData);
      });
    });
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
      <div class="history-item clickable" data-app-id="${app.id}" data-app='${JSON.stringify(app).replace(/'/g, "&apos;")}'>
        <div class="history-item-header">
          <div class="history-item-title">${app.jobTitle || 'Unknown Position'}</div>
          <span class="recent-item-status status-${(app.status || 'applied').toLowerCase().replace(' ', '-')}">
            ${app.status || 'Applied'}
          </span>
        </div>
        <div class="history-item-company">${app.company || 'Unknown Company'}</div>
        <div class="history-item-date">${this.formatDate(app.timestamp)}</div>
        <div class="click-hint">Click to view details</div>
      </div>
    `).join('');
    
    // Add click event listeners to history items
    this.historyApplications.querySelectorAll('.history-item.clickable').forEach(item => {
      item.addEventListener('click', () => {
        const appData = JSON.parse(item.getAttribute('data-app').replace(/&apos;/g, "'"));
        this.showJobDetailsModal(appData);
      });
    });
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
    this.showToast(message, 'success');
  }

  showError(message) {
    this.showToast(message, 'error');
    console.error('Error:', message);
  }

  showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    const icon = type === 'success' ? '✅' : '❌';
    
    toast.innerHTML = `
      <span class="toast-icon">${icon}</span>
      <span class="toast-message">${message}</span>
      <button class="toast-close" onclick="this.parentElement.remove()">×</button>
    `;
    
    this.toastContainer.appendChild(toast);
    
    // Trigger animation
    setTimeout(() => toast.classList.add('show'), 10);
    
    // Auto-remove after 3 seconds
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => {
        if (toast.parentElement) {
          toast.remove();
        }
      }, 300);
    }, 3000);
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

  // Job Details Modal Methods
  showJobDetailsModal(appData) {
    console.log('Showing job details for:', appData);
    
    // Store current app data for edit/delete operations
    this.currentAppData = appData;
    
    // Populate modal with data
    this.modalJobTitle.textContent = appData.jobTitle || 'Unknown Position';
    this.modalCompany.textContent = appData.company || 'Unknown Company';
    this.modalStatus.textContent = appData.status || 'Applied';
    this.modalStatus.setAttribute('data-status', appData.status || 'Applied');
    this.modalJobId.textContent = appData.jobId || '-';
    this.modalAppliedDate.textContent = this.formatDate(appData.timestamp);
    this.modalNotes.textContent = appData.notes || 'No notes available';
    
    // Handle job URL
    if (appData.url) {
      this.modalJobUrl.href = appData.url;
      this.modalJobUrl.style.display = 'inline-flex';
    } else {
      this.modalJobUrl.style.display = 'none';
    }
    
    // Show modal
    this.jobDetailsModal.style.display = 'flex';
    document.body.style.overflow = 'hidden'; // Prevent background scrolling
  }

  closeJobDetailsModal() {
    this.jobDetailsModal.style.display = 'none';
    document.body.style.overflow = 'auto';
    this.currentAppData = null;
  }

  editJobApplication() {
    if (!this.currentAppData) return;
    
    // Switch to Quick Add tab and populate form
    this.switchTab('quick');
    
    // Fill form with current data
    this.jobTitle.value = this.currentAppData.jobTitle || '';
    this.company.value = this.currentAppData.company || '';
    this.jobUrl.value = this.currentAppData.url || '';
    this.jobId.value = this.currentAppData.jobId || '';
    this.status.value = this.currentAppData.status || 'Applied';
    this.notes.value = this.currentAppData.notes || '';
    
    // Close modal
    this.closeJobDetailsModal();
    
    // Focus on first field
    this.jobTitle.focus();
    
    this.showToast('Job application loaded for editing', 'success');
  }

  async deleteJobApplication() {
    if (!this.currentAppData) return;
    
    const confirmDelete = confirm(
      `Are you sure you want to delete the application for "${this.currentAppData.jobTitle}" at "${this.currentAppData.company}"?\n\nThis action cannot be undone.`
    );
    
    if (!confirmDelete) return;
    
    try {
      const response = await this.sendMessage({
        action: 'deleteApplication',
        id: this.currentAppData.id
      });
      
      if (response && response.success) {
        this.showToast('Application deleted successfully', 'success');
        this.closeJobDetailsModal();
        
        // Reload applications
        await this.loadApplications();
      } else {
        this.showToast('Failed to delete application', 'error');
      }
    } catch (error) {
      console.error('Delete error:', error);
      this.showToast('Error deleting application', 'error');
    }
  }

  async updateJobStatus() {
    if (!this.currentAppData) return;
    
    const newStatus = prompt(
      'Update application status:\n\nCurrent status: ' + (this.currentAppData.status || 'Applied') + 
      '\n\nChoose new status:\n- Applied\n- In Review\n- Interview Scheduled\n- Rejected\n- Offer Received',
      this.currentAppData.status || 'Applied'
    );
    
    if (!newStatus || newStatus === this.currentAppData.status) return;
    
    const validStatuses = ['Applied', 'In Review', 'Interview Scheduled', 'Rejected', 'Offer Received'];
    if (!validStatuses.includes(newStatus)) {
      this.showToast('Invalid status. Please use: ' + validStatuses.join(', '), 'error');
      return;
    }
    
    try {
      // Update the current app data
      const updatedApp = { ...this.currentAppData, status: newStatus };
      
      const response = await this.sendMessage({
        action: 'saveJobApplication',
        data: updatedApp
      });
      
      if (response && response.success) {
        this.showToast(`Status updated to "${newStatus}"`, 'success');
        
        // Update modal display
        this.modalStatus.textContent = newStatus;
        this.modalStatus.setAttribute('data-status', newStatus);
        this.currentAppData.status = newStatus;
        
        // Reload applications
        await this.loadApplications();
      } else {
        this.showToast('Failed to update status', 'error');
      }
    } catch (error) {
      console.error('Status update error:', error);
      this.showToast('Error updating status', 'error');
    }
  }
}

// Initialize side panel controller when DOM is loaded
let sidePanelController;
document.addEventListener('DOMContentLoaded', () => {
  sidePanelController = new SidePanelController();
  // Make it globally accessible for debugging
  window.sidePanelController = sidePanelController;
});
