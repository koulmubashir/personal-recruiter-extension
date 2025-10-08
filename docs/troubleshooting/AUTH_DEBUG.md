# 🔧 Authentication Troubleshooting Guide

## 🚨 "Authentication failed" Error Fix

The authentication error means Google OAuth isn't properly configured. Here's how to fix it:

## Step 1: Get Your Extension ID
1. Go to `chrome://extensions/`
2. Find "Personal Recruiter" extension
3. Copy the Extension ID (looks like: `abcdefghijklmnopqrstuvwxyz123456`)

## Step 2: Update Google Cloud Console
You need to update your OAuth configuration:

1. **Go to Google Cloud Console**: https://console.cloud.google.com/
2. **Navigate to**: APIs & Services → Credentials
3. **Find your OAuth Client ID** (the one ending in .apps.googleusercontent.com)
4. **Click Edit** (pencil icon)

### Update These Settings:
- **Application type**: Should be "Chrome Extension" 
- **Item ID**: Enter your Extension ID from Step 1
- **Name**: Personal Recruiter Extension

## Step 3: Enable Required APIs
In Google Cloud Console:
1. **Go to**: APIs & Services → Library
2. **Search and Enable**:
   - Google+ API (or Google People API)
   - Chrome Web Store API (optional, for publishing)

## Step 4: Check Extension Permissions
Make sure these URLs are allowed in your OAuth settings:
- `chrome-extension://YOUR_EXTENSION_ID/*`

## Step 5: Debug Authentication
Let's check what's happening:

1. **Open Chrome DevTools**:
   - Right-click extension icon
   - Click "Inspect popup"
   - Go to Console tab

2. **Click "Sign in with Google"**
3. **Check for error messages** in console

## Common Issues:

### Issue 1: Wrong Application Type
**Fix**: Change from "Web application" to "Chrome Extension" in Google Cloud Console

### Issue 2: Missing Extension ID
**Fix**: Add your actual extension ID (not a placeholder) to OAuth settings

### Issue 3: API Not Enabled
**Fix**: Enable Google+ API in Google Cloud Console

### Issue 4: Redirect URI Issues
**Fix**: Ensure `chrome-extension://YOUR_EXTENSION_ID/` is in authorized redirect URIs

## Quick Test:
```bash
# 1. Get extension ID from chrome://extensions/
# 2. Update Google Cloud OAuth with extension ID
# 3. Reload extension in Chrome
# 4. Try authentication again
```

## Need the Exact Steps?
1. Extension ID: [Copy from chrome://extensions/]
2. Google Cloud Console: https://console.cloud.google.com/apis/credentials
3. Edit your OAuth client
4. Application type: Chrome Extension
5. Item ID: [Paste your extension ID]
6. Save changes
7. Reload extension and try again
