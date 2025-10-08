// tests/unit/background.test.js - Test background script functionality

// Mock Chrome APIs
global.chrome = {
  storage: {
    local: {
      get: jest.fn(),
      set: jest.fn(),
      remove: jest.fn()
    }
  },
  identity: {
    getAuthToken: jest.fn(),
    removeCachedAuthToken: jest.fn()
  },
  tabs: {
    query: jest.fn(),
    sendMessage: jest.fn()
  },
  runtime: {
    onMessage: {
      addListener: jest.fn()
    },
    sendMessage: jest.fn()
  }
};

describe('Background Script Functionality', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should handle OAuth authentication', async () => {
    // Mock successful OAuth
    chrome.identity.getAuthToken.mockImplementation((options, callback) => {
      callback('ya29.mock_token_12345');
    });

    // Simulate the OAuth function from your background.js
    const getOAuthToken = () => {
      return new Promise((resolve, reject) => {
        chrome.identity.getAuthToken({ interactive: true }, (token) => {
          if (token) {
            resolve(token);
          } else {
            reject(new Error('Authentication failed'));
          }
        });
      });
    };

    const token = await getOAuthToken();
    expect(token).toBe('ya29.mock_token_12345');
    expect(chrome.identity.getAuthToken).toHaveBeenCalledWith(
      { interactive: true },
      expect.any(Function)
    );
  });

  test('should store user data in chrome storage', async () => {
    chrome.storage.local.set.mockImplementation((data, callback) => {
      if (callback) callback();
    });

    const storeUserData = (userData) => {
      return new Promise((resolve) => {
        chrome.storage.local.set({ userProfile: userData }, () => {
          resolve();
        });
      });
    };

    const mockUser = {
      email: 'test@example.com',
      name: 'Test User'
    };

    await storeUserData(mockUser);
    
    expect(chrome.storage.local.set).toHaveBeenCalledWith(
      { userProfile: mockUser },
      expect.any(Function)
    );
  });

  test('should handle job application tracking', async () => {
    chrome.storage.local.get.mockImplementation((keys, callback) => {
      callback({ applications: [] });
    });

    chrome.storage.local.set.mockImplementation((data, callback) => {
      if (callback) callback();
    });

    const trackJobApplication = async (jobData) => {
      return new Promise((resolve) => {
        chrome.storage.local.get(['applications'], (result) => {
          const applications = result.applications || [];
          applications.push({
            ...jobData,
            id: Date.now().toString(),
            appliedDate: new Date().toISOString(),
            status: 'applied'
          });
          
          chrome.storage.local.set({ applications }, () => {
            resolve(applications);
          });
        });
      });
    };

    const jobData = {
      title: 'Software Engineer',
      company: 'Test Company',
      platform: 'linkedin'
    };

    const result = await trackJobApplication(jobData);
    
    expect(chrome.storage.local.get).toHaveBeenCalledWith(['applications'], expect.any(Function));
    expect(chrome.storage.local.set).toHaveBeenCalled();
    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject(jobData);
  });

  test('should validate job posting URLs', () => {
    const isJobPosting = (url) => {
      const jobPatterns = [
        /jobs\.linkedin\.com/,
        /indeed\.com\/viewjob/,
        /glassdoor\.com\/job/,
        /careers\./,
        /jobs\./
      ];
      
      return jobPatterns.some(pattern => pattern.test(url));
    };

    // Test valid job URLs
    expect(isJobPosting('https://jobs.linkedin.com/view/123456')).toBe(true);
    expect(isJobPosting('https://indeed.com/viewjob?jk=123456')).toBe(true);
    expect(isJobPosting('https://glassdoor.com/job/software-engineer-123')).toBe(true);
    expect(isJobPosting('https://careers.google.com/jobs/results/123')).toBe(true);

    // Test invalid URLs
    expect(isJobPosting('https://google.com')).toBe(false);
    expect(isJobPosting('https://linkedin.com/feed')).toBe(false);
    expect(isJobPosting('https://facebook.com')).toBe(false);
  });
});
