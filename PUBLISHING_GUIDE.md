# Publishing Guide for Personal Recruiter Extension

This guide provides step-by-step instructions for publishing the Personal Recruiter extension to the Chrome Web Store.

## Pre-Publishing Checklist

### 1. Technical Requirements
- [ ] Extension tested in Chrome browser
- [ ] All features working correctly
- [ ] No console errors or warnings
- [ ] Icons created in all required sizes (16x16, 32x32, 48x48, 128x128)
- [ ] Manifest.json properly configured
- [ ] Privacy policy created and accessible
- [ ] Google OAuth credentials set up

### 2. Google OAuth Setup
1. **Create Google Cloud Project**:
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing one
   - Name: "Personal Recruiter Extension"

2. **Enable APIs**:
   - Go to "APIs & Services" > "Library"
   - Search for and enable "Google+ API"
   - Enable "Chrome Web Store API" (for publishing)

3. **Create OAuth Credentials**:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth 2.0 Client IDs"
   - Application type: "Chrome Extension"
   - Name: "Personal Recruiter Extension"
   - Add your extension ID to authorized JavaScript origins

4. **Update manifest.json**:
   ```json
   "oauth2": {
     "client_id": "YOUR_ACTUAL_CLIENT_ID.apps.googleusercontent.com",
     "scopes": ["openid", "email", "profile"]
   }
   ```

### 3. Asset Preparation

#### Required Assets
1. **Extension Package** (ZIP file containing all extension files)
2. **Icons**:
   - 16x16 pixel PNG (extension icon)
   - 32x32 pixel PNG (extension icon)
   - 48x48 pixel PNG (extension icon)
   - 128x128 pixel PNG (Chrome Web Store listing)

3. **Screenshots**:
   - At least 1 screenshot (max 5)
   - Size: 1280x800 or 640x400 pixels
   - Format: PNG or JPEG
   - Show key features of the extension

4. **Promotional Images** (optional but recommended):
   - Small promotional tile: 440x280 pixels
   - Large promotional tile: 920x680 pixels
   - Marquee promotional tile: 1400x560 pixels

#### Creating Screenshots
Recommended screenshots to take:
1. **Authentication screen**: Show Google sign-in process
2. **Main popup**: Display application tracking interface
3. **History page**: Show comprehensive application management
4. **Auto-detection**: Extension detecting a job posting
5. **Export feature**: CSV export functionality

## Chrome Web Store Submission Process

### Step 1: Developer Account Setup
1. Go to [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole/)
2. Sign in with your Google account
3. Pay the one-time $5 developer registration fee
4. Complete developer account verification

### Step 2: Create Store Listing

#### Basic Information
- **Name**: Personal Recruiter - Job Application Tracker
- **Summary**: Track job applications automatically across job boards with Google account integration
- **Description**: (Use the detailed description below)
- **Category**: Productivity
- **Language**: English

#### Detailed Description
```
Automatically track your job applications across all major job boards and company career pages with Personal Recruiter.

🚀 KEY FEATURES:
✅ Google Account Integration - Secure authentication with your Google account
✅ Automatic Detection - Intelligently detects job postings on 20+ platforms
✅ Application Tracking - Automatically saves when you submit applications  
✅ Comprehensive History - View, edit, and manage all your applications
✅ CSV Export - Download your data for external analysis
✅ Status Management - Track from "Applied" to "Offer Received"
✅ Manual Entry - Add applications from any source

🎯 SUPPORTED PLATFORMS:
• LinkedIn Jobs
• Indeed
• Glassdoor  
• Monster
• ZipRecruiter
• AngelList/Wellfound
• Stack Overflow Jobs
• GitHub Jobs
• Remote.co
• Company career pages (auto-detected)
• And many more...

📊 SMART FEATURES:
• Automatic job posting detection
• Application submission tracking
• Browser history analysis for job sites
• Intelligent data extraction (job title, company, ID)
• Response rate analytics
• Application deadline tracking

🔒 PRIVACY & SECURITY:
• All data stored locally in your browser
• No data sent to external servers
• Full control over your information
• Google OAuth 2.0 security
• Export/delete data anytime

Perfect for job seekers who want to stay organized and track their application progress without manual data entry.

Get started in seconds - just install, sign in with Google, and start browsing job sites!
```

#### Store Listing Details
- **Support URL**: https://github.com/yourusername/personal-recruiter-extension
- **Homepage URL**: https://yourwebsite.com/personal-recruiter (optional)

### Step 3: Upload Extension Package

#### Package Preparation
1. **Remove Development Files**:
   ```bash
   # Create a clean directory
   mkdir release
   cp -r . release/
   cd release
   
   # Remove unnecessary files
   rm -rf .git node_modules scripts package*.json
   rm README.md PRIVACY_POLICY.md PUBLISHING_GUIDE.md
   
   # Create zip package
   zip -r personal-recruiter-extension.zip . -x "*.DS_Store*"
   ```

2. **Upload Package**:
   - Go to Developer Dashboard
   - Click "Add new item"
   - Upload the ZIP file
   - Wait for package analysis

### Step 4: Configure Publishing Options

#### Visibility
- **Public**: Visible to all users (recommended)
- **Unlisted**: Only accessible via direct link
- **Trusted testers**: Limited access for testing

#### Distribution
- **Regions**: Select all regions or specific countries
- **Mature content**: Mark as appropriate
- **Content rating**: General audiences

### Step 5: Submit for Review

#### Review Process
1. **Initial Review**: Google reviews for policy compliance (1-3 days)
2. **Technical Review**: Automated security and functionality checks
3. **Manual Review**: Human review if flagged (additional 1-7 days)
4. **Publication**: Goes live if approved

#### Common Review Issues
- **Permissions**: Ensure all permissions are justified
- **Privacy Policy**: Must be accessible and comprehensive
- **Functionality**: Extension must work as described
- **Metadata**: Description must match actual functionality

## Post-Publishing Tasks

### 1. Monitor Reviews and Ratings
- Respond to user feedback promptly
- Address reported issues quickly
- Update extension based on user suggestions

### 2. Analytics Setup
- Monitor usage statistics in Developer Dashboard
- Track user acquisition and retention
- Analyze crash reports and errors

### 3. Update Strategy
- Plan regular updates for bug fixes
- Add new features based on user feedback
- Keep up with Chrome extension API changes

### 4. Marketing and Promotion
- Share on social media
- Create blog posts about features
- Engage with job seeker communities
- Consider partnerships with career services

## Update Process

### For Future Updates
1. **Version Management**:
   - Update version number in manifest.json
   - Follow semantic versioning (e.g., 1.0.1, 1.1.0, 2.0.0)

2. **Update Submission**:
   - Upload new package to Developer Dashboard
   - Update store listing if needed
   - Submit for review (faster than initial review)

3. **User Communication**:
   - Use extension update notifications
   - Maintain changelog
   - Communicate breaking changes clearly

## Troubleshooting Common Issues

### Authentication Problems
- Verify OAuth client ID is correct
- Check redirect URIs configuration
- Ensure proper scopes are requested

### Store Listing Rejection
- Review Chrome Web Store policies
- Ensure privacy policy compliance
- Verify all permissions are necessary

### Technical Issues
- Test in fresh Chrome profile
- Verify manifest.json syntax
- Check console for errors

## Support and Resources

### Official Documentation
- [Chrome Web Store Developer Documentation](https://developer.chrome.com/docs/webstore/)
- [Chrome Extension Development Guide](https://developer.chrome.com/docs/extensions/)
- [Chrome Web Store Policies](https://developer.chrome.com/docs/webstore/program-policies/)

### Community Resources
- Chrome Extensions Google Group
- Stack Overflow Chrome Extension tag
- Reddit r/chrome_extensions

---

**Ready to publish? Double-check this entire guide and ensure all steps are completed before submission!**
