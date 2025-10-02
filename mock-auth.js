// Temporary Mock Authentication for Testing
// This allows testing the extension without OAuth setup

class MockAuth {
  constructor() {
    this.mockUser = {
      id: 'test-user-123',
      email: 'test@example.com',
      name: 'Test User',
      picture: 'https://via.placeholder.com/96x96.png?text=TU'
    };
  }

  async authenticate() {
    console.log('=== MOCK AUTH: Starting mock authentication ===');
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Store mock authentication data
    await chrome.storage.sync.set({
      isAuthenticated: true,
      userProfile: this.mockUser,
      authToken: 'mock-token-' + Date.now()
    });
    
    console.log('=== MOCK AUTH: Mock authentication successful ===');
    return this.mockUser;
  }

  async logout() {
    console.log('=== MOCK AUTH: Mock logout ===');
    await chrome.storage.sync.set({
      isAuthenticated: false,
      userProfile: null,
      authToken: null
    });
  }

  async getAuthStatus() {
    const data = await chrome.storage.sync.get(['isAuthenticated', 'userProfile']);
    return {
      isAuthenticated: data.isAuthenticated || false,
      userProfile: data.userProfile || null
    };
  }
}

// Export for use in background.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = MockAuth;
} else if (typeof window !== 'undefined') {
  window.MockAuth = MockAuth;
}
