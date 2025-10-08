// tests/setup.js - Jest Setup Configuration for Personal Recruiter Extension

// Mock Chrome Extension APIs
global.chrome = {
  storage: {
    local: {
      get: jest.fn((keys, callback) => {
        const mockData = {
          applications: [],
          userProfile: null,
          settings: { autoTrack: true }
        };
        
        if (typeof keys === 'function') {
          keys(mockData);
        } else if (callback) {
          const result = keys.reduce((acc, key) => {
            acc[key] = mockData[key];
            return acc;
          }, {});
          callback(result);
        }
      }),
      
      set: jest.fn((data, callback) => {
        if (callback) callback();
      }),
      
      remove: jest.fn((keys, callback) => {
        if (callback) callback();
      }),
      
      clear: jest.fn((callback) => {
        if (callback) callback();
      })
    }
  },
  
  identity: {
    getAuthToken: jest.fn((options, callback) => {
      const mockToken = 'ya29.mock_token_for_testing';
      if (callback) callback(mockToken);
    }),
    
    removeCachedAuthToken: jest.fn((details, callback) => {
      if (callback) callback();
    })
  },
  
  tabs: {
    query: jest.fn((queryInfo, callback) => {
      const mockTabs = [{
        id: 1,
        url: 'https://jobs.linkedin.com/view/123456',
        title: 'Software Engineer - Test Company'
      }];
      if (callback) callback(mockTabs);
    }),
    
    sendMessage: jest.fn((tabId, message, callback) => {
      if (callback) callback({ success: true });
    })
  },
  
  runtime: {
    sendMessage: jest.fn((message, callback) => {
      if (callback) callback({ success: true });
    }),
    
    onMessage: {
      addListener: jest.fn(),
      removeListener: jest.fn()
    },
    
    getURL: jest.fn((path) => `chrome-extension://mock-extension-id/${path}`)
  }
};

// Mock fetch for API calls
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({}),
    text: () => Promise.resolve('')
  })
);

// Mock Google OAuth responses
global.gapi = {
  load: jest.fn((api, callback) => {
    if (callback && typeof callback.callback === 'function') {
      callback.callback();
    }
  }),
  
  auth2: {
    getAuthInstance: jest.fn(() => ({
      isSignedIn: {
        get: jest.fn(() => true)
      },
      currentUser: {
        get: jest.fn(() => ({
          getBasicProfile: jest.fn(() => ({
            getEmail: jest.fn(() => 'test@example.com'),
            getName: jest.fn(() => 'Test User')
          }))
        }))
      }
    }))
  }
};

// Mock DOM methods for extension popup/content scripts
Object.defineProperty(window, 'location', {
  value: {
    href: 'https://jobs.linkedin.com/view/123456',
    hostname: 'jobs.linkedin.com',
    pathname: '/view/123456'
  },
  writable: true
});

// Console suppression for cleaner test output
const originalConsoleError = console.error;
console.error = (...args) => {
  if (args[0]?.includes && args[0].includes('Warning: ReactDOM.render')) {
    return;
  }
  originalConsoleError.call(console, ...args);
};

// Test utilities
global.testUtils = {
  // Helper to simulate job posting pages
  mockJobPage: (platform = 'linkedin', jobData = {}) => {
    const defaultJobData = {
      title: 'Software Engineer',
      company: 'Test Company',
      location: 'Remote',
      id: '123456'
    };
    
    return { ...defaultJobData, ...jobData, platform };
  },
  
  // Helper to simulate user authentication
  mockAuthUser: (userData = {}) => {
    const defaultUser = {
      email: 'test@example.com',
      name: 'Test User',
      picture: 'https://example.com/avatar.jpg'
    };
    
    return { ...defaultUser, ...userData };
  },
  
  // Helper to wait for async operations
  waitFor: (condition, timeout = 5000) => {
    return new Promise((resolve, reject) => {
      const interval = 100;
      let elapsed = 0;
      
      const check = () => {
        if (condition()) {
          resolve();
        } else if (elapsed >= timeout) {
          reject(new Error('Timeout waiting for condition'));
        } else {
          elapsed += interval;
          setTimeout(check, interval);
        }
      };
      
      check();
    });
  }
};

// Performance testing setup
global.performance = global.performance || {
  now: jest.fn(() => Date.now()),
  mark: jest.fn(),
  measure: jest.fn()
};

// Setup for accessibility testing
global.axe = {
  run: jest.fn(() => Promise.resolve({ violations: [] }))
};

console.log('✅ Personal Recruiter test environment initialized');
