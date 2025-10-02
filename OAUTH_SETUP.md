# OAuth Setup Helper

## Your Extension ID
After loading your extension in Chrome, your Extension ID will look like:
`abcdefghijklmnopqrstuvwxyz123456`

## Google Cloud Console Form
When creating OAuth 2.0 Client ID, use these values:

**Application type:** Chrome Extension
**Name:** Personal Recruiter Extension
**Item ID:** [Your Extension ID from chrome://extensions/]

## After Getting Client ID
Replace this line in manifest.json:

FROM:
"client_id": "YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com"

TO:
"client_id": "your-actual-client-id.apps.googleusercontent.com"

## Quick Commands
# Load extension to get ID:
chrome://extensions/

# Enable Developer mode, then "Load unpacked"
# Copy the Extension ID that appears

## Example
If your extension ID is: abcdefghijklmnopqrstuvwxyz123456
Then in Google Cloud Console:
- Name: Personal Recruiter Extension  
- Item ID: abcdefghijklmnopqrstuvwxyz123456

After getting OAuth client ID (like: 123456789-abcdef.apps.googleusercontent.com)
Update manifest.json:
"client_id": "123456789-abcdef.apps.googleusercontent.com"
