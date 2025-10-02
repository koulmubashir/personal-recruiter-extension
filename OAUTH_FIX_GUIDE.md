# OAuth Setup Fix for Extension ID: bohmbphdflohbembblcjnjepamcp

## IMMEDIATE STEPS TO FIX THE LOGIN ERROR:

### Step 1: Update Google Cloud Console OAuth Configuration

1. **Go to Google Cloud Console**: https://console.cloud.google.com/apis/credentials

2. **Find the existing OAuth 2.0 Client ID** or create a new one

3. **Configure it as Chrome Extension with these EXACT values**:
   - **Application type**: Chrome Extension
   - **Name**: Personal Recruiter Extension
   - **Item ID**: `bohmbphdflohbembblcjnjepamcp`

4. **Copy the new Client ID** (format: xxxxx-yyyy.apps.googleusercontent.com)

### Step 2: Update manifest.json

Replace the current client_id in manifest.json:

**FROM:**
```json
"client_id": "728714090261-hqhfnujmbl8s2cgbr65cqard6lnfksub.apps.googleusercontent.com"
```

**TO:**
```json
"client_id": "YOUR_NEW_CLIENT_ID.apps.googleusercontent.com"
```

### Step 3: Reload Extension

1. Go to `chrome://extensions/`
2. Click the refresh button on your extension
3. Test the login

## ALTERNATIVE: Test with Mock Authentication

If you want to test the extension functionality without setting up OAuth right now, you can temporarily use mock authentication:

1. Open `background.js`
2. Find the `authenticate()` method
3. Temporarily replace it with:

```javascript
async authenticate() {
  console.log('=== MOCK AUTH: Using test authentication ===');
  
  const mockUser = {
    id: 'test-user-123',
    email: 'test@example.com',
    name: 'Test User',
    picture: 'https://via.placeholder.com/96x96.png?text=TU'
  };
  
  await chrome.storage.sync.set({
    isAuthenticated: true,
    userProfile: mockUser,
    authToken: 'mock-token-' + Date.now()
  });
  
  return mockUser;
}
```

This will let you test all other functionality while you set up the real OAuth.

## Why This Happens:

The OAuth client ID `728714090261-hqhfnujmbl8s2cgbr65cqard6lnfksub.apps.googleusercontent.com` was configured for a different extension ID. Chrome extensions must have their OAuth client specifically configured for their exact extension ID.

Your extension ID is: `bohmbphdflohbembblcjnjepamcp`
But the OAuth client is configured for a different extension ID.

## Current Extension Info:
- **Extension ID**: bohmbphdflohbembblcjnjepamcp
- **Current OAuth Client**: 728714090261-hqhfnujmbl8s2cgbr65cqard6lnfksub.apps.googleusercontent.com
- **Status**: OAuth client not configured for this extension ID

Once you update the OAuth configuration in Google Cloud Console, the login should work perfectly!
