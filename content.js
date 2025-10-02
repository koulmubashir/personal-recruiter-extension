// Content script for detecting job applications and job-related content
class JobDetector {
  constructor() {
    this.jobKeywords = [
      'apply now', 'submit application', 'apply for this job', 'apply online',
      'job application', 'send resume', 'submit resume', 'apply today',
      'quick apply', 'easy apply', 'one-click apply', 'apply with linkedin',
      'submit your application', 'apply for position', 'join our team'
    ];
    
    this.jobTitleSelectors = [
      // LinkedIn
      '.top-card-layout__title', '.jobs-unified-top-card__job-title', 
      '.job-details-jobs-unified-top-card__job-title', 'h1.t-24.t-bold.inline',
      // Indeed
      '.jobsearch-JobInfoHeader-title', '.jobsearch-JobInfoHeader-title span[title]',
      'h1[data-jk]', '.jobsearch-JobInfoHeader h1',
      // Glassdoor
      '[data-test="job-title"]', '.job-title', 'h1[data-test="job-title"]',
      // Workday
      'h1[data-automation-id="jobPostingHeader"]', '[data-automation-id="jobPostingHeader"]',
      // Generic selectors
      'h1.job-title', 'h1.position-title', 'h1.role-title', '.job-title h1',
      '[data-testid="job-title"]', '[data-test="job-title"]',
      '.job-header h1', '.job-details h1', '.posting-headline h1',
      // Meta and document title fallbacks
      'meta[property="og:title"]', 'title'
    ];
    
    this.companySelectors = [
      // LinkedIn
      '.topcard__org-name-link', '.jobs-unified-top-card__company-name', 
      '.job-details-jobs-unified-top-card__company-name', 'a[data-control-name="job_details_topcard_company_url"]',
      // Indeed
      '.jobsearch-InlineCompanyRating', '.jobsearch-CompanyInfoContainer', 
      '[data-jk] .companyName', '.jobsearch-InlineCompanyRating .companyName',
      // Glassdoor
      '[data-test="employer-name"]', '[data-test="company-name"]', '.employer-name',
      // Workday
      '[data-automation-id="jobPostingCompany"]', '[data-automation-id="company"]',
      // Generic selectors
      '.company-name', '.company_name', '.employer-name', '.company-title',
      '[data-testid="company-name"]', '[data-test="employer-name"]',
      '.job-company', '.employer-title', '.hiring-company',
      // Fallback patterns
      'a[href*="/company/"]', 'a[href*="/companies/"]', 'a[href*="/employer/"]'
    ];
    
    this.init();
  }

  init() {
    this.detectJobPage();
    this.setupApplicationTracking();
    this.setupMutationObserver();
  }

  detectJobPage() {
    const url = window.location.href;
    const pageText = document.body.innerText.toLowerCase();
    
    // Check if this looks like a job posting page
    const hasJobKeywords = this.jobKeywords.some(keyword => 
      pageText.includes(keyword.toLowerCase())
    );
    
    const hasJobTitle = this.jobTitleSelectors.some(selector => 
      document.querySelector(selector)
    );
    
    if (hasJobKeywords || hasJobTitle) {
      this.isJobPage = true;
      this.extractJobInfo();
    }
  }

  extractJobInfo() {
    console.log('=== Extracting job information ===');
    console.log('Page URL:', window.location.href);
    console.log('Page title:', document.title);
    
    const jobInfo = {
      url: window.location.href,
      timestamp: new Date().toISOString(),
      jobTitle: this.extractJobTitle(),
      company: this.extractCompany(),
      jobId: this.extractJobId(),
      description: this.extractJobDescription(),
      detected: true
    };
    
    console.log('=== Extracted job information ===');
    console.log('Job Title:', jobInfo.jobTitle);
    console.log('Company:', jobInfo.company);
    console.log('Job ID:', jobInfo.jobId);
    console.log('Description length:', jobInfo.description.length);
    console.log('=====================================');
    
    // Validate that we have meaningful data
    if (!jobInfo.jobTitle || jobInfo.jobTitle === 'Job Position') {
      console.warn('Warning: Job title extraction may have failed');
    }
    if (!jobInfo.company || jobInfo.company === 'Company') {
      console.warn('Warning: Company extraction may have failed');
    }
    if (!jobInfo.jobId) {
      console.warn('Warning: Job ID extraction may have failed');
    }
    
    // Store the detected job info for potential application tracking
    this.currentJobInfo = jobInfo;
    
    // Send to background script for processing
    chrome.runtime.sendMessage({
      type: 'JOB_DETECTED',
      data: jobInfo
    }).catch(error => {
      console.log('Failed to send job info to background:', error);
    });
    
    // Show subtle indicator that job was detected
    this.showJobDetectionIndicator();
  }

  extractJobTitle() {
    console.log('Extracting job title...');
    
    for (const selector of this.jobTitleSelectors) {
      try {
        const element = document.querySelector(selector);
        if (element) {
          let title = '';
          
          // Handle different element types
          if (selector === 'meta[property="og:title"]') {
            title = element.content;
          } else if (selector === 'title') {
            title = element.textContent || element.innerText;
          } else {
            title = element.innerText || element.textContent;
          }
          
          if (title && title.trim()) {
            title = title.trim();
            console.log('Found job title:', title, 'with selector:', selector);
            return title;
          }
        }
      } catch (error) {
        console.log('Error with selector:', selector, error);
      }
    }
    
    // Enhanced fallback: parse page title more intelligently
    const pageTitle = document.title;
    console.log('Page title:', pageTitle);
    
    // Remove common suffixes from job sites
    const cleanTitle = pageTitle
      .replace(/\s*\|\s*.*/g, '') // Remove everything after |
      .replace(/\s*-\s*(Indeed|LinkedIn|Glassdoor|Monster|ZipRecruiter|Jobs).*$/i, '') // Remove site names
      .replace(/\s*at\s+.*$/i, '') // Remove "at Company"
      .replace(/\s*jobs?\s*$/i, '') // Remove trailing "job" or "jobs"
      .trim();
    
    console.log('Extracted job title (fallback):', cleanTitle);
    return cleanTitle || 'Job Position';
  }

  extractCompany() {
    console.log('Extracting company name...');
    
    for (const selector of this.companySelectors) {
      try {
        const element = document.querySelector(selector);
        if (element) {
          let company = element.innerText || element.textContent;
          if (company && company.trim()) {
            company = company.trim();
            console.log('Found company:', company, 'with selector:', selector);
            return company;
          }
        }
      } catch (error) {
        console.log('Error with company selector:', selector, error);
      }
    }
    
    // Enhanced fallback: try to extract from URL or page content
    const url = window.location.hostname;
    console.log('Current hostname:', url);
    
    // Check for company career pages
    if (url.includes('careers.') || url.includes('jobs.')) {
      const domain = url.replace(/^(careers\.|jobs\.)/, '').split('.')[0];
      if (domain && domain.length > 2) {
        const company = domain.charAt(0).toUpperCase() + domain.slice(1);
        console.log('Extracted company from URL:', company);
        return company;
      }
    }
    
    // Try to extract from meta tags
    const metaCompany = document.querySelector('meta[property="og:site_name"]');
    if (metaCompany && metaCompany.content) {
      console.log('Found company in meta:', metaCompany.content);
      return metaCompany.content;
    }
    
    // Final fallback: extract from URL domain
    const urlParts = url.split('.');
    if (urlParts.length >= 2) {
      const domain = urlParts[urlParts.length - 2];
      const company = domain.charAt(0).toUpperCase() + domain.slice(1);
      console.log('Extracted company from domain:', company);
      return company;
    }
    
    console.log('No company found, using default');
    return 'Company';
  }

  extractJobId() {
    console.log('Extracting job ID...');
    const url = window.location.href;
    console.log('Current URL:', url);
    
    // Enhanced job ID patterns for different sites
    const patterns = [
      // LinkedIn
      /linkedin\.com\/jobs\/view\/(\d+)/i,
      // Indeed
      /indeed\.com\/.*[?&]jk=([a-f0-9]+)/i,
      /indeed\.com\/jobs\/.*-([a-f0-9]+)$/i,
      // Glassdoor
      /glassdoor\.com\/.*JV_IC\d+_KO\d+,\d+_IL\.\d+,\d+_IN\d+\.htm\?jl=(\d+)/i,
      /glassdoor\.com\/job-listing\/.*-JV_IC\d+_KO\d+,\d+_IN\d+\.htm\?jl=(\d+)/i,
      // Workday
      /myworkdayjobs\.com\/.*\/job\/.*\/([A-Z0-9-]+)/i,
      // Generic patterns
      /job[_-]?id[=:]([a-z0-9-]+)/i,
      /jobs?[\/]([a-z0-9-]+)/i,
      /posting[\/]([a-z0-9-]+)/i,
      /position[\/]([a-z0-9-]+)/i,
      /req[_-]?id[=:]([a-z0-9-]+)/i,
      /[?&]id[=]([a-z0-9-]+)/i,
      /apply[\/]([a-z0-9-]+)/i,
      // Catch-all for paths ending with ID-like strings
      /\/([a-z0-9]{8,})[\/]?$/i,
      /\/([0-9]{5,})[\/]?$/i
    ];
    
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        console.log('Found job ID:', match[1], 'with pattern:', pattern);
        return match[1];
      }
    }
    
    // Try to extract from data attributes
    const jobElement = document.querySelector('[data-job-id], [data-jk], [data-posting-id]');
    if (jobElement) {
      const jobId = jobElement.getAttribute('data-job-id') || 
                   jobElement.getAttribute('data-jk') || 
                   jobElement.getAttribute('data-posting-id');
      if (jobId) {
        console.log('Found job ID in data attribute:', jobId);
        return jobId;
      }
    }
    
    // Generate a simple ID from URL hash
    const urlHash = btoa(url).replace(/[^a-zA-Z0-9]/g, '').substring(0, 12);
    console.log('Generated job ID from URL:', urlHash);
    return urlHash;
  }

  extractJobDescription() {
    const descriptionSelectors = [
      '.job-description', '.job_description', '.job-details',
      '.posting-content', '.job-content', '.description',
      '[data-automation-id="jobPostingDescription"]'
    ];
    
    for (const selector of descriptionSelectors) {
      const element = document.querySelector(selector);
      if (element) {
        return element.innerText.trim().substring(0, 500) + '...';
      }
    }
    
    return '';
  }

  setupApplicationTracking() {
    // Track clicks on application buttons
    const applyButtons = this.findApplyButtons();
    
    applyButtons.forEach(button => {
      button.addEventListener('click', () => {
        this.trackJobApplication();
      });
    });
    
    // Track form submissions that might be job applications
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
      if (this.isJobApplicationForm(form)) {
        form.addEventListener('submit', () => {
          this.trackJobApplication();
        });
      }
    });
  }

  findApplyButtons() {
    const buttons = [];
    const buttonSelectors = [
      'button', 'a[href*="apply"]', 'input[type="submit"]',
      '[data-automation-id*="apply"]', '[class*="apply"]',
      '[id*="apply"]', '[data-test*="apply"]'
    ];
    
    buttonSelectors.forEach(selector => {
      document.querySelectorAll(selector).forEach(element => {
        const text = element.innerText.toLowerCase();
        if (this.jobKeywords.some(keyword => text.includes(keyword))) {
          buttons.push(element);
        }
      });
    });
    
    return buttons;
  }

  isJobApplicationForm(form) {
    const formText = form.innerText.toLowerCase();
    const hasResumeUpload = form.querySelector('input[type="file"]');
    const hasJobKeywords = this.jobKeywords.some(keyword => 
      formText.includes(keyword)
    );
    
    return hasResumeUpload || hasJobKeywords;
  }

  trackJobApplication() {
    if (!this.currentJobInfo) {
      this.extractJobInfo();
    }
    
    // Send to background script
    chrome.runtime.sendMessage({
      action: 'saveJobApplication',
      data: {
        ...this.currentJobInfo,
        status: 'Applied',
        appliedAt: new Date().toISOString()
      }
    });
    
    this.showApplicationTrackedNotification();
  }

  showJobDetectionIndicator() {
    console.log('=== SHOWING JOB DETECTION INDICATOR ===');
    console.log('Creating inline indicator (NOT a system notification)');
    
    // Create a subtle indicator that the job was detected
    const indicator = document.createElement('div');
    indicator.id = 'personal-recruiter-indicator';
    indicator.innerHTML = `
      <div style="
        position: fixed;
        top: 20px;
        right: 20px;
        background: #4CAF50;
        color: white;
        padding: 8px 16px;
        border-radius: 4px;
        font-size: 12px;
        z-index: 10000;
        box-shadow: 0 2px 8px rgba(0,0,0,0.2);
        opacity: 0.9;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        pointer-events: none;
      ">
        📋 Job detected by Personal Recruiter
      </div>
    `;
    
    document.body.appendChild(indicator);
    console.log('✅ Inline indicator added to page');
    
    // Remove after 3 seconds
    setTimeout(() => {
      if (indicator && indicator.parentElement) {
        indicator.remove();
        console.log('✅ Inline indicator removed');
      }
    }, 3000);
  }

  showApplicationTrackedNotification() {
    const notification = document.createElement('div');
    notification.innerHTML = `
      <div style="
        position: fixed;
        top: 20px;
        right: 20px;
        background: #2196F3;
        color: white;
        padding: 12px 20px;
        border-radius: 4px;
        font-size: 14px;
        z-index: 10000;
        box-shadow: 0 2px 8px rgba(0,0,0,0.2);
        opacity: 0.95;
      ">
        ✅ Job application tracked successfully!
      </div>
    `;
    
    document.body.appendChild(notification);
    
    // Remove after 4 seconds
    setTimeout(() => {
      notification.remove();
    }, 4000);
  }

  setupMutationObserver() {
    // Watch for dynamic content changes (SPAs)
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
          // Re-check for job content when page changes
          setTimeout(() => {
            this.detectJobPage();
            this.setupApplicationTracking();
          }, 1000);
        }
      });
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }
}

// Initialize job detection when page loads
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new JobDetector();
  });
} else {
  new JobDetector();
}
