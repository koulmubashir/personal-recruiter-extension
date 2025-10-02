# Personal Recruiter - Job Application Tracker

A powerful Chrome browser extension that automatically tracks your job applications across various job boards and company career pages with Google account integration.

## 🚀 Features

### Core Functionality
- **Google Authentication**: Secure login with your Google account
- **Automatic Job Detection**: Intelligently detects job postings and applications across multiple platforms
- **Application Tracking**: Automatically tracks when you submit job applications
- **Manual Entry**: Add applications manually for jobs applied through other channels
- **History Management**: Comprehensive history of all your job applications
- **CSV Export**: Export your application data for external analysis
- **Status Tracking**: Track application status from "Applied" to "Offer Received"

### Supported Platforms
- LinkedIn Jobs
- Indeed
- Glassdoor
- Monster
- ZipRecruiter
- AngelList/Wellfound
- Stack Overflow Jobs
- GitHub Jobs
- Remote.co
- Company career pages (automatic detection)
- And many more...

### Smart Detection
The extension uses advanced algorithms to:
- Detect job posting pages automatically
- Extract job titles, company names, and job IDs
- Monitor application submissions
- Track browser history for job-related activities

## 📦 Installation

### For Users (Chrome Web Store)
1. Visit the Chrome Web Store (link will be available after publishing)
2. Click "Add to Chrome"
3. Grant necessary permissions
4. Sign in with your Google account

### For Developers (Manual Installation)
1. Clone this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top right
4. Click "Load unpacked" and select the extension directory
5. The extension should now appear in your extensions list

## 🔧 Setup and Configuration

### Prerequisites
- Chrome browser (version 88 or higher)
- Google account for authentication
- Active internet connection

### Google OAuth Setup (For Developers)
1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API
4. Create OAuth 2.0 credentials
5. Add your Chrome extension ID to authorized origins
6. Update the `client_id` in `manifest.json`

### Configuration Steps
1. Install the extension
2. Click the extension icon in the Chrome toolbar
3. Sign in with your Google account
4. Configure your preferences in the settings
5. Start browsing job sites - the extension will automatically begin tracking

## 🎯 How It Works

### Automatic Detection
The extension monitors your browsing activity and:
1. Detects when you visit job posting pages
2. Extracts relevant job information (title, company, ID)
3. Monitors for application submission actions
4. Automatically saves application data when you apply

### Manual Tracking
For applications submitted outside the browser:
1. Click the extension icon
2. Select "Add Job Application"
3. Fill in the job details
4. Save the application

### Data Management
- All data is stored locally in Chrome's sync storage
- Data syncs across your Chrome instances when signed in
- Export functionality allows data backup and analysis
- Full control over your data with delete/edit capabilities

## 📊 Usage

### Viewing Your Applications
1. **Popup View**: Click the extension icon for a quick overview
2. **History Page**: Click "View History" for detailed management
3. **Export Data**: Download CSV for external analysis

### Updating Application Status
1. Open the history page
2. Click "Edit" on any application
3. Update the status (Applied, In Review, Interview Scheduled, etc.)
4. Add notes about the application process

### Filtering and Search
- Filter by application status
- Filter by date range
- Search by job title, company, or keywords
- Sort by any column

## 🔒 Privacy and Security

### Data Protection
- All data is stored locally in your Chrome browser
- No data is sent to external servers (except Google for authentication)
- You have full control over your data
- Data can be exported or deleted at any time

### Permissions Explained
- **Storage**: To save your application data locally
- **Active Tab**: To detect job postings on current page
- **History**: To analyze browsing patterns for job sites
- **Identity**: For Google authentication
- **All URLs**: To detect job postings across different websites

## 🛠️ Development

### Project Structure
```
personal-recruiter/
├── manifest.json          # Extension manifest
├── background.js          # Service worker
├── content.js            # Content script for page analysis
├── popup.html            # Extension popup interface
├── history.html          # Full history page
├── css/                  # Stylesheets
│   ├── popup.css
│   └── history.css
├── js/                   # JavaScript files
│   ├── popup.js
│   └── history.js
├── icons/               # Extension icons
└── scripts/            # Build scripts
```

### Building the Extension
```bash
# Install dependencies
npm install

# Create icons
npm run create-icons

# Validate manifest
npm run validate

# Package for distribution
npm run package
```

### Testing
1. Load the extension in developer mode
2. Test on various job sites
3. Verify data persistence
4. Test export functionality
5. Validate Google authentication

## 📋 Publishing Checklist

### Pre-Publishing Requirements
- [ ] Google OAuth credentials configured
- [ ] Icons created in required sizes (16x16, 32x32, 48x48, 128x128)
- [ ] Manifest.json properly configured
- [ ] Privacy policy created
- [ ] Extension tested on multiple job sites
- [ ] Data export/import functionality tested
- [ ] Error handling implemented
- [ ] User documentation completed

### Chrome Web Store Submission
1. **Prepare Assets**:
   - Extension package (.zip)
   - Screenshots (1280x800 or 640x400)
   - Promotional images
   - Detailed description
   - Privacy policy

2. **Store Listing**:
   - Compelling title and description
   - Relevant keywords for SEO
   - Clear feature list
   - Professional screenshots
   - Privacy policy link

3. **Submission Process**:
   - Create Chrome Web Store developer account ($5 fee)
   - Upload extension package
   - Fill out store listing details
   - Submit for review
   - Respond to any review feedback

### Marketing Preparation
- Website or landing page
- Privacy policy
- Terms of service
- User support documentation
- Social media presence
- Press kit with screenshots and descriptions

## 🆘 Support

### Common Issues
1. **Authentication Problems**: Clear browser cache and re-authenticate
2. **Detection Not Working**: Ensure the site is supported and permissions are granted
3. **Data Not Syncing**: Check Chrome sync settings
4. **Export Issues**: Ensure popup blocker is disabled

### Getting Help
- Create an issue on GitHub
- Contact support via email
- Check the FAQ section
- Review troubleshooting guide

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📈 Roadmap

### Upcoming Features
- Integration with ATS systems
- Email tracking for application responses
- Application deadline reminders
- Interview scheduling integration
- Salary tracking and analysis
- Application statistics and insights
- Team collaboration features
- Mobile companion app

### Version History
- **v1.0.0**: Initial release with core functionality
- **v1.1.0**: Enhanced detection algorithms (planned)
- **v1.2.0**: Advanced analytics dashboard (planned)

## 🙏 Acknowledgments

- Google Chrome Extensions team for excellent documentation
- Job seekers community for feature suggestions
- Open source contributors

---

**Made with ❤️ for job seekers everywhere**
