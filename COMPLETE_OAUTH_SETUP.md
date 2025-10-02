# 🔐 Google OAuth Setup for Personal Recruiter Extension

## Extension Details
- **Extension ID:** `bohmbphdflohbembblcjnjepamcp`
- **Current Status:** Ready for OAuth configuration
- **Authentication Mode:** Real Google OAuth (mock disabled)

---

## 📋 Step-by-Step Setup

### Step 1: Google Cloud Console Setup

1. **Open Google Cloud Console**
   - Go to: https://console.cloud.google.com/

2. **Create or Select Project**
   - If new: Click "New Project"
   - Project Name: `Personal Recruiter Extension`
   - Project ID: `personal-recruiter-ext-2024` (or any unique ID)
   - Click "Create"

### Step 2: Enable Required APIs

1. **Navigate to APIs & Services > Library**
   - Search for: "Google+ API" → Click → Enable
   - Search for: "People API" → Click → Enable
   - Search for: "Identity API" → Click → Enable

### Step 3: Configure OAuth Consent Screen

1. **Go to APIs & Services > OAuth consent screen**
2. **Choose User Type:** External
3. **Fill in App Information:**
   - App name: `Personal Recruiter`
   - User support email: `[YOUR EMAIL]`
   - App logo: (optional)
   - Developer contact information: `[YOUR EMAIL]`

4. **Add Scopes:**
   - Click "Add or Remove Scopes"
   - Add these scopes:
     - `../auth/userinfo.email`
     - `../auth/userinfo.profile`
     - `openid`

5. **Test Users (if in testing mode):**
   - Add your Gmail address to test users

### Step 4: Create OAuth 2.0 Client ID

1. **Go to APIs & Services > Credentials**
2. **Click "Create Credentials" > "OAuth 2.0 Client ID"**
3. **Configure the Client:**
   - Application type: **Chrome extension**
   - Name: `Personal Recruiter Extension`
   - Application ID: **`bohmbphdflohbembblcjnjepamcp`**

4. **Click "Create"**
5. **Copy the Client ID** (format: `xxxxx-yyyy.apps.googleusercontent.com`)

### Step 5: Update Extension Configuration

1. **Open `manifest.json` in your extension folder**
2. **Replace the client_id:**

```json
"oauth2": {
  "client_id": "YOUR_NEW_CLIENT_ID.apps.googleusercontent.com",
  "scopes": ["openid", "email", "profile"]
}
```

**Example:**
```json
"oauth2": {
  "client_id": "123456789-abcdefghijklmnopqrstuvwxyz.apps.googleusercontent.com",
  "scopes": ["openid", "email", "profile"]
}
```

### Step 6: Test the Setup

1. **Reload Extension:**
   - Go to `chrome://extensions/`
   - Find "Personal Recruiter"
   - Click the refresh button

2. **Test Authentication:**
   - Open extension side panel
   - Click "Sign in with Google"
   - Should show Google OAuth popup
   - Complete authentication
   - Should show your real Google profile

---

## 🧪 Test Pages Available

You can test the extension using these URLs (after reloading):

- **Full Test Suite:** `chrome-extension://bohmbphdflohbembblcjnjepamcp/test-suite.html`
- **Auth Toggle:** `chrome-extension://bohmbphdflohbembblcjnjepamcp/auth-toggle.html`
- **History Page:** `chrome-extension://bohmbphdflohbembblcjnjepamcp/history.html`

---

## ⚠️ Troubleshooting

### If OAuth fails:
1. **Check Extension ID** - Must match exactly: `bohmbphdflohbembblcjnjepamcp`
2. **Verify Client ID** - Should be in format: `xxxxx.apps.googleusercontent.com`
3. **Check Scopes** - Must include: `openid`, `email`, `profile`
4. **Consent Screen** - Must be configured and published

### Common Issues:
- **"Error 400"** → Extension ID mismatch
- **"Access denied"** → Consent screen not configured
- **"Popup blocked"** → Allow popups for Google OAuth

### Console Debugging:
Open Chrome DevTools (F12) and check:
- Background script logs
- Side panel logs  
- Network requests to Google APIs

---

## 🎯 Expected Result

After successful setup:
- ✅ Real Google authentication popup
- ✅ Your actual profile picture displayed
- ✅ Your real name and email shown
- ✅ Google authentication badge visible
- ✅ History page with formatDate working
- ✅ All extension features functional

---

## 🔄 Alternative: Quick Mock Test

If you want to test functionality first before OAuth setup:

1. Open `background.js`
2. Change line 4: `this.useMockAuth = true;`
3. Reload extension
4. Test with fake Google user data

---

Need help? Check the test suite at: `chrome-extension://bohmbphdflohbembblcjnjepamcp/test-suite.html`
