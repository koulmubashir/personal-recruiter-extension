// tests/unit/auth.test.js - Authentication Module Unit Tests

describe('Authentication Module', () => {
  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
  });

  describe('OAuth Token Management', () => {
    test('should retrieve valid OAuth token', async () => {
      // Mock successful token retrieval
      const mockToken = 'ya29.valid_token_123';
      chrome.identity.getAuthToken.mockImplementation((options, callback) => {
        callback(mockToken);
      });

      // Import the auth module (this would be your actual auth code)
      const { getAuthToken } = require('../../src/auth/oauth');
      
      const token = await getAuthToken();
      
      expect(token).toBe(mockToken);
      expect(chrome.identity.getAuthToken).toHaveBeenCalledWith(
        { interactive: true },
        expect.any(Function)
      );
    });

    test('should handle authentication errors gracefully', async () => {
      // Mock authentication failure
      chrome.identity.getAuthToken.mockImplementation((options, callback) => {
        callback(null); // Null indicates failure
      });

      const { getAuthToken } = require('../../src/auth/oauth');
      
      try {
        await getAuthToken();
        fail('Should have thrown an error');
      } catch (error) {
        expect(error.message).toContain('Authentication failed');
      }
    });

    test('should validate token format', () => {
      const { validateTokenFormat } = require('../../src/auth/oauth');
      
      // Valid Google OAuth token format
      expect(validateTokenFormat('ya29.a0ARrdaM-valid_token')).toBe(true);
      
      // Invalid formats
      expect(validateTokenFormat('invalid_token')).toBe(false);
      expect(validateTokenFormat('')).toBe(false);
      expect(validateTokenFormat(null)).toBe(false);
    });

    test('should refresh expired tokens', async () => {
      const { refreshToken } = require('../../src/auth/oauth');
      
      // Mock token refresh
      chrome.identity.removeCachedAuthToken.mockImplementation((details, callback) => {
        callback();
      });
      
      chrome.identity.getAuthToken.mockImplementation((options, callback) => {
        callback('ya29.new_refreshed_token');
      });

      const newToken = await refreshToken('expired_token');
      
      expect(chrome.identity.removeCachedAuthToken).toHaveBeenCalledWith(
        { token: 'expired_token' },
        expect.any(Function)
      );
      expect(newToken).toBe('ya29.new_refreshed_token');
    });
  });

  describe('User Profile Management', () => {
    test('should extract user info from token', async () => {
      // Mock Google API response
      global.gapi.auth2.getAuthInstance.mockReturnValue({
        currentUser: {
          get: () => ({
            getBasicProfile: () => ({
              getEmail: () => 'test@example.com',
              getName: () => 'Test User',
              getImageUrl: () => 'https://example.com/avatar.jpg'
            })
          })
        }
      });

      const { getUserProfile } = require('../../src/auth/profile');
      const profile = await getUserProfile();
      
      expect(profile).toEqual({
        email: 'test@example.com',
        name: 'Test User',
        picture: 'https://example.com/avatar.jpg'
      });
    });

    test('should store user profile in local storage', async () => {
      const { saveUserProfile } = require('../../src/auth/profile');
      const mockProfile = testUtils.mockAuthUser();
      
      await saveUserProfile(mockProfile);
      
      expect(chrome.storage.local.set).toHaveBeenCalledWith(
        { userProfile: mockProfile },
        expect.any(Function)
      );
    });

    test('should clear user data on logout', async () => {
      const { logout } = require('../../src/auth/oauth');
      
      await logout();
      
      expect(chrome.storage.local.remove).toHaveBeenCalledWith(
        ['userProfile', 'authToken'],
        expect.any(Function)
      );
    });
  });
});

// tests/unit/job-extraction.test.js - Job Data Extraction Tests

describe('Job Extraction Module', () => {
  beforeEach(() => {
    // Reset DOM before each test
    document.body.innerHTML = '';
  });

  describe('LinkedIn Job Extraction', () => {
    test('should extract job details from LinkedIn posting', () => {
      // Mock LinkedIn job page DOM structure
      document.body.innerHTML = `
        <div class="jobs-unified-top-card">
          <h1 class="jobs-unified-top-card__job-title">Senior Software Engineer</h1>
          <div class="jobs-unified-top-card__company-name">
            <a href="/company/test-company">Test Company</a>
          </div>
          <div class="jobs-unified-top-card__bullet">San Francisco, CA</div>
        </div>
      `;

      const { extractLinkedInJob } = require('../../src/extractors/linkedin');
      const jobData = extractLinkedInJob();
      
      expect(jobData).toEqual({
        title: 'Senior Software Engineer',
        company: 'Test Company',
        location: 'San Francisco, CA',
        platform: 'linkedin',
        url: window.location.href
      });
    });

    test('should handle missing job elements gracefully', () => {
      // Empty DOM
      document.body.innerHTML = '<div>No job content</div>';

      const { extractLinkedInJob } = require('../../src/extractors/linkedin');
      const jobData = extractLinkedInJob();
      
      expect(jobData).toEqual({
        title: 'Unknown Position',
        company: 'Unknown Company',
        location: 'Unknown Location',
        platform: 'linkedin',
        url: window.location.href
      });
    });
  });

  describe('Indeed Job Extraction', () => {
    test('should extract job details from Indeed posting', () => {
      document.body.innerHTML = `
        <div class="jobsearch-JobInfoHeader">
          <h1 class="jobsearch-JobInfoHeader-title">Frontend Developer</h1>
          <div class="jobsearch-InlineCompanyRating">
            <span class="jobsearch-JobInfoHeader-companyName">Tech Startup Inc</span>
          </div>
        </div>
        <div class="jobsearch-JobInfoHeader-subtitle">
          <div>New York, NY</div>
        </div>
      `;

      const { extractIndeedJob } = require('../../src/extractors/indeed');
      const jobData = extractIndeedJob();
      
      expect(jobData).toEqual({
        title: 'Frontend Developer',
        company: 'Tech Startup Inc',
        location: 'New York, NY',
        platform: 'indeed',
        url: window.location.href
      });
    });
  });

  describe('Generic Job Extraction', () => {
    test('should detect job posting patterns across sites', () => {
      const { isJobPosting } = require('../../src/extractors/generic');
      
      // Test with job-related URLs
      window.location.href = 'https://jobs.company.com/position/123';
      expect(isJobPosting()).toBe(true);
      
      window.location.href = 'https://careers.startup.io/roles/engineer';
      expect(isJobPosting()).toBe(true);
      
      // Test with non-job URLs
      window.location.href = 'https://company.com/about';
      expect(isJobPosting()).toBe(false);
      
      window.location.href = 'https://news.website.com/article';
      expect(isJobPosting()).toBe(false);
    });
  });
});

// tests/unit/storage.test.js - Data Storage Tests

describe('Storage Module', () => {
  describe('Application Data Management', () => {
    test('should save job application data', async () => {
      const { saveApplication } = require('../../src/storage/applications');
      const mockApplication = {
        id: 'app_123',
        jobTitle: 'Software Engineer',
        company: 'Test Company',
        status: 'applied',
        appliedDate: new Date().toISOString(),
        platform: 'linkedin'
      };

      await saveApplication(mockApplication);
      
      expect(chrome.storage.local.set).toHaveBeenCalledWith(
        expect.objectContaining({
          applications: expect.arrayContaining([mockApplication])
        }),
        expect.any(Function)
      );
    });

    test('should retrieve all applications', async () => {
      const mockApplications = [
        testUtils.mockJobPage('linkedin', { status: 'applied' }),
        testUtils.mockJobPage('indeed', { status: 'interviewing' })
      ];

      chrome.storage.local.get.mockImplementation((keys, callback) => {
        callback({ applications: mockApplications });
      });

      const { getAllApplications } = require('../../src/storage/applications');
      const applications = await getAllApplications();
      
      expect(applications).toEqual(mockApplications);
      expect(applications).toHaveLength(2);
    });

    test('should update application status', async () => {
      const { updateApplicationStatus } = require('../../src/storage/applications');
      
      await updateApplicationStatus('app_123', 'interviewing');
      
      expect(chrome.storage.local.get).toHaveBeenCalled();
      expect(chrome.storage.local.set).toHaveBeenCalled();
    });

    test('should export applications to CSV format', () => {
      const { exportToCSV } = require('../../src/storage/export');
      const mockApplications = [
        {
          jobTitle: 'Software Engineer',
          company: 'Test Company',
          status: 'applied',
          appliedDate: '2025-01-15',
          platform: 'linkedin'
        }
      ];

      const csvData = exportToCSV(mockApplications);
      
      expect(csvData).toContain('Job Title,Company,Status,Applied Date,Platform');
      expect(csvData).toContain('Software Engineer,Test Company,applied,2025-01-15,linkedin');
    });
  });
});

console.log('✅ Sample unit tests loaded for Personal Recruiter extension');
