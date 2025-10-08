# 🔍 Manual Authentication Test

The authentication is still having issues. Let's test it manually to see what's happening.

## Quick Manual Test

1. **Right-click the extension icon** → "Inspect popup"
2. **Go to Console tab**
3. **Copy and paste this code** to test authentication manually:

```javascript
// Test 1: Check what's in storage right now
console.log('=== TESTING AUTHENTICATION ===');
chrome.storage.sync.get(['isAuthenticated', 'userProfile', 'authToken'], (result) => {
  console.log('Current storage:', result);
});

// Test 2: Check extension ID (needed for OAuth)
console.log('Extension ID:', chrome.runtime.id);

// Test 3: Test authentication manually
console.log('Testing authentication...');
chrome.runtime.sendMessage({action: 'authenticate'}, (response) => {
  console.log('Auth response:', response);
  
  // Check storage again after auth attempt
  setTimeout(() => {
    chrome.storage.sync.get(['isAuthenticated', 'userProfile'], (result) => {
      console.log('Storage after auth:', result);
    });
  }, 2000);
});

// Test 4: Check if identity API is working
chrome.identity.getAuthToken({interactive: false}, (token) => {
  if (chrome.runtime.lastError) {
    console.log('No cached token:', chrome.runtime.lastError.message);
  } else {
    console.log('Found cached token:', token ? 'Yes' : 'No');
  }
});
```

## What to Look For

### ✅ **Good Signs:**
- Extension ID shows up (long string)
- Authentication completes without errors
- Storage shows `isAuthenticated: true` and user profile data
- Token appears in storage

### ❌ **Problem Signs:**
- "OAuth2 not granted or revoked" error
- "The OAuth 2.0 scope" error  
- Empty or null responses
- Extension ID missing

## Common Issues & Fixes

### Issue 1: OAuth Scope Error
**Error:** "The OAuth 2.0 scope 'https://www.googleapis.com/auth/userinfo.email' is not supported"
**Fix:** 
1. Go to Google Cloud Console
2. APIs & Services → Credentials  
3. Edit your OAuth Client
4. Make sure scopes are correct: `openid`, `email`, `profile`

### Issue 2: Extension ID Not Configured
**Error:** Various OAuth errors
**Fix:**
1. Copy the Extension ID from the console log
2. Update Google Cloud Console OAuth Client
3. Application type: Chrome Extension
4. Item ID: [Your Extension ID]

### Issue 3: API Not Enabled
**Error:** 403 or API errors
**Fix:**
1. Go to Google Cloud Console
2. APIs & Services → Library
3. Enable "Google+ API" or "People API"

## After Running the Test

**If authentication works in console but not in popup:**
- The issue is in the popup UI code
- Authentication itself is working

**If authentication fails in console:**
- The issue is in OAuth configuration
- Need to fix Google Cloud Console settings

**If you see your profile data in storage:**
- Authentication actually worked!
- Just need to reload the popup to see it

## Force Reload User Profile

If you see authentication data in storage but popup doesn't show it:

```javascript
// Force reload the popup interface
chrome.storage.sync.get(['isAuthenticated', 'userProfile'], (result) => {
  if (result.isAuthenticated) {
    console.log('Auth data found, reloading popup...');
    location.reload();
  }
});
```
