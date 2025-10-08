# 🔐 Google OAuth Setup for Extension ID: bohmbphdflohbembblcjnjepamcp

## ⚠️ IMPORTANT: This is required for real Google authentication!

The extension is now configured to use **real Google OAuth** instead of mock authentication. You need to set up a Google OAuth client for your extension.

## 📋 Step-by-Step Setup:

### 1. Google Cloud Console Setup

1. **Go to [Google Cloud Console](https://console.cloud.google.com/)**
2. **Create a new project** (or select existing one):
   - Project name: `Personal Recruiter Extension`
   - Project ID: `personal-recruiter-ext` (or any unique ID)

### 2. Enable APIs

1. **Go to APIs & Services > Library**
2. **Search and enable**:
   - Google+ API (for user profile)
   - Google Identity API

### 3. Create OAuth 2.0 Client ID

1. **Go to APIs & Services > Credentials**
2. **Click "Create Credentials" > "OAuth 2.0 Client ID"**
3. **Configure OAuth consent screen** (if first time):
   - User Type: **External**
   - App name: **Personal Recruiter**
   - User support email: **Your email**
   - Developer contact: **Your email**
   - Scopes: Add `../auth/userinfo.email`, `../auth/userinfo.profile`, `openid`

4. **Create OAuth Client**:
   - Application type: **Chrome extension**
   - Name: **Personal Recruiter Extension**
   - Application ID: **`bohmbphdflohbembblcjnjepamcp`**

### 4. Update manifest.json

After creating the OAuth client, you'll get a Client ID like:
`123456789-abcdefghijklmnopqrstuvwxyz.apps.googleusercontent.com`

**Replace in manifest.json:**
```json
"oauth2": {
  "client_id": "YOUR_NEW_CLIENT_ID.apps.googleusercontent.com",
  "scopes": ["openid", "email", "profile"]
}
```

### 5. Test the Setup

1. **Reload extension** in `chrome://extensions/`
2. **Open side panel**
3. **Click "Sign in with Google"**
4. **Should show Google OAuth popup**
5. **After authentication, should show your real Google profile**

## 🎯 Expected Result:

After setup, the extension will:
- ✅ Show **your real Google profile picture**
- ✅ Display **your actual name and email**
- ✅ Show **Google authentication badge**
- ✅ Work with **real Google OAuth**

## 🔄 Alternative: Quick Test Setup

If you want to test immediately, I can temporarily re-enable mock authentication:

1. **Open `background.js`**
2. **Change line 4**: `this.useMockAuth = true;`
3. **Reload extension**

But for production use, you **must** set up real OAuth!

## 📞 Need Help?

If you encounter any issues:
1. Check browser console for error messages
2. Verify extension ID matches exactly: `bohmbphdflohbembblcjnjepamcp`
3. Ensure OAuth client is configured for Chrome Extension type
4. Make sure all required scopes are enabled

The extension UI is now designed to show your real Google profile beautifully! 🎨
