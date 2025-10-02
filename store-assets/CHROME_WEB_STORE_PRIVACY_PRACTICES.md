# Chrome Web Store Privacy Practices - Complete Justifications

## 📋 **Required Privacy Practice Justifications**

### 🎯 **Single Purpose Description**
```
Personal Recruiter is a job application tracking extension that helps users organize and manage their job search process. The extension provides AI-powered extraction of job details from web pages, secure storage of application information, and comprehensive tracking of job application status across multiple job boards and career websites.
```

### 🔒 **Permission Justifications**

#### **1. activeTab Permission**
**Justification:**
```
The activeTab permission is required to inject content scripts into job posting pages when users click the "AI Magic" button. This allows the extension to extract job details (company name, position, salary, requirements) from the currently active job posting page. The permission is used only when explicitly triggered by user action and only accesses the content of job-related pages to parse structured data.
```

#### **2. history Permission** 
**Justification:**
```
The history permission is used to automatically detect when users visit job posting pages and display relevant tracking options in the side panel. This enables seamless job application tracking without requiring users to manually identify job pages. The extension only reads URLs to identify job-related domains and does not store or transmit browsing history data.
```

#### **3. host_permissions ("<all_urls>")**
**Justification:**
```
Host permissions for all URLs are necessary because job postings exist across thousands of different websites including LinkedIn, Indeed, company career pages, and job boards worldwide. The extension needs to access these diverse job posting sites to extract job information when users explicitly request it via the AI Magic feature. Data extraction only occurs on user-initiated actions and is limited to job-related content.
```

#### **4. identity Permission**
**Justification:**
```
The identity permission enables secure Google OAuth authentication, allowing users to sign in with their Google account. This provides a secure, industry-standard authentication method without requiring users to create additional passwords. The extension only accesses basic profile information (name, email) for user identification and does not access other Google services or data.
```

#### **5. scripting Permission**
**Justification:**
```
The scripting permission is used to inject content scripts into web pages for AI-powered job data extraction. When users click "AI Magic" on a job posting, the extension injects a script to parse job details from the page structure. This enables automatic extraction of job information without manual data entry. Scripts are only injected on user request and only parse job-related content.
```

#### **6. sidePanel Permission**
**Justification:**
```
The sidePanel permission provides the main user interface for the job tracking extension. The side panel displays the user's job application dashboard, application history, and tracking tools without interrupting the user's browsing experience. This creates a persistent, organized workspace for managing job applications while browsing job sites.
```

#### **7. storage Permission**
**Justification:**
```
The storage permission is essential for saving job application data, user preferences, and tracking information locally on the user's device. All job details, application status, and user settings are stored securely using Chrome's storage API. Data remains private to the user and is not transmitted to external servers except for the user's explicit export actions.
```

#### **8. tabs Permission**
**Justification:**
```
The tabs permission allows the extension to identify job-related websites and provide contextual tracking options in the side panel. It enables the extension to detect when users are on job posting pages and offer relevant features. The extension only reads tab URLs to identify job sites and does not access tab content without additional explicit user permission.
```

### 🛡️ **Remote Code Justification**
```
This extension does not use any remote code. All functionality is contained within the extension package. The extension does not load external scripts, make dynamic code requests, or execute remotely hosted code. All code is statically included in the extension bundle and reviewed during the Chrome Web Store submission process.
```

### 📧 **Data Usage Compliance Certification**

#### **Data Collection:**
- ✅ **User Profile**: Basic Google profile info (name, email) for authentication only
- ✅ **Job Data**: Job posting details extracted only when user clicks "AI Magic"
- ✅ **Application Status**: User-entered job application tracking information
- ✅ **User Preferences**: Extension settings and customizations

#### **Data Storage:**
- ✅ **Local Storage**: All data stored locally using Chrome's secure storage API
- ✅ **No External Servers**: No data transmitted to third-party servers
- ✅ **User Control**: Users can export or delete all data at any time
- ✅ **Secure Authentication**: Google OAuth 2.0 for secure sign-in

#### **Data Usage:**
- ✅ **Single Purpose**: All data used exclusively for job application tracking
- ✅ **No Sharing**: Data is never shared with third parties
- ✅ **No Selling**: Data is never sold or monetized
- ✅ **User Privacy**: Complete user control over personal data

#### **Compliance Statement:**
```
Personal Recruiter extension complies with all Chrome Web Store Developer Program Policies. The extension:
- Uses permissions only for stated purposes
- Does not collect unnecessary user data
- Stores all data locally with user control
- Provides clear privacy practices
- Implements secure authentication
- Operates transparently with users
- Respects user privacy and data protection rights
```

---

## 🚀 **Privacy Practices Tab Completion Steps**

### **Step 1: Single Purpose**
Paste the Single Purpose Description above

### **Step 2: Permission Justifications**
Add each permission justification in the corresponding field

### **Step 3: Remote Code**
Confirm "No remote code" and add justification if prompted

### **Step 4: Data Usage**
- Select appropriate data collection categories
- Specify local storage only
- Confirm no data sharing/selling
- Certify compliance with policies

### **Step 5: Contact Information**
- Add your contact email on Account tab
- Verify email address
- Complete developer verification

---

### **Step 6: Privacy Policy**
- **Privacy Policy URL**: You need to host the privacy policy online and provide the URL
- **Options**:
  1. Host the `privacy-policy.html` file on your website/GitHub Pages
  2. Create a GitHub Gist with the privacy policy content
  3. Use the provided HTML file and host it anywhere publicly accessible

#### **Quick GitHub Pages Setup**:
1. Go to your GitHub repository settings
2. Enable GitHub Pages
3. Upload the `privacy-policy.html` file
4. Use URL: `https://yourusername.github.io/personal-recruiter-extension/privacy-policy.html`

---

## ✅ **Final Checklist Before Publishing**

- [ ] Single purpose description added
- [ ] All 9 permission justifications completed
- [ ] Remote code section completed  
- [ ] Data usage practices specified
- [ ] Compliance certification checked
- [ ] Contact email added and verified
- [ ] Developer account verified
- [ ] Extension ZIP uploaded
- [ ] Screenshots uploaded (1280x800 JPEG)
- [ ] Small promo tile uploaded (440x280)
- [ ] Store description added (under 16,000 chars)
- [ ] **Privacy policy hosted online and URL added**

**Your extension is ready for Chrome Web Store publication!** 🎯
