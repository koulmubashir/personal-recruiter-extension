// Extension validation script
const fs = require('fs');
const path = require('path');

console.log('🔍 Validating Personal Recruiter Extension...\n');

// Check if all required files exist
const requiredFiles = [
  'manifest.json',
  'background.js',
  'content.js',
  'popup.html',
  'history.html',
  'css/popup.css',
  'css/history.css',
  'js/popup.js',
  'js/history.js',
  'README.md',
  'PRIVACY_POLICY.md',
  'PUBLISHING_GUIDE.md',
  'CHANGELOG.md',
  'LICENSE'
];

let missingFiles = [];
let validFiles = [];

requiredFiles.forEach(file => {
  if (fs.existsSync(file)) {
    validFiles.push(file);
    console.log(`✅ ${file}`);
  } else {
    missingFiles.push(file);
    console.log(`❌ ${file} - MISSING`);
  }
});

// Validate manifest.json
console.log('\n📋 Validating manifest.json...');
try {
  const manifest = JSON.parse(fs.readFileSync('manifest.json', 'utf8'));
  
  // Check required fields
  const requiredFields = ['manifest_version', 'name', 'version', 'description', 'permissions'];
  const manifestIssues = [];
  
  requiredFields.forEach(field => {
    if (!manifest[field]) {
      manifestIssues.push(`Missing required field: ${field}`);
    }
  });
  
  // Check specific requirements
  if (manifest.manifest_version !== 3) {
    manifestIssues.push('Should use Manifest V3');
  }
  
  if (!manifest.oauth2 || !manifest.oauth2.client_id) {
    manifestIssues.push('OAuth2 client_id needs to be configured');
  }
  
  if (manifest.oauth2 && manifest.oauth2.client_id === 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com') {
    manifestIssues.push('⚠️  Replace placeholder Google Client ID with actual value');
  }
  
  if (manifestIssues.length === 0) {
    console.log('✅ Manifest structure is valid');
  } else {
    console.log('❌ Manifest issues found:');
    manifestIssues.forEach(issue => console.log(`   - ${issue}`));
  }
  
} catch (error) {
  console.log('❌ Invalid JSON in manifest.json');
}

// Check icon files
console.log('\n🎨 Checking icons...');
const iconSizes = [16, 32, 48, 128];
const iconIssues = [];

iconSizes.forEach(size => {
  const svgPath = `icons/icon${size}.svg`;
  const pngPath = `icons/icon${size}.png`;
  const placeholderPath = `icons/icon${size}.png.placeholder`;
  
  if (fs.existsSync(pngPath)) {
    console.log(`✅ icon${size}.png found`);
  } else if (fs.existsSync(svgPath)) {
    console.log(`⚠️  icon${size}.svg found (convert to PNG for production)`);
    iconIssues.push(`Convert icon${size}.svg to PNG format`);
  } else if (fs.existsSync(placeholderPath)) {
    console.log(`⚠️  icon${size}.png.placeholder found (replace with actual PNG)`);
    iconIssues.push(`Replace placeholder with actual icon${size}.png`);
  } else {
    console.log(`❌ icon${size}.png missing`);
    iconIssues.push(`Create icon${size}.png`);
  }
});

// Check package.json
console.log('\n📦 Checking package.json...');
if (fs.existsSync('package.json')) {
  try {
    const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    console.log(`✅ Package: ${pkg.name} v${pkg.version}`);
    console.log(`✅ Description: ${pkg.description}`);
  } catch (error) {
    console.log('❌ Invalid JSON in package.json');
  }
} else {
  console.log('⚠️  package.json not found (optional for extensions)');
}

// Summary
console.log('\n📊 VALIDATION SUMMARY');
console.log('='.repeat(50));
console.log(`✅ Valid files: ${validFiles.length}/${requiredFiles.length}`);
console.log(`❌ Missing files: ${missingFiles.length}`);
console.log(`⚠️  Icon issues: ${iconIssues.length}`);

if (missingFiles.length > 0) {
  console.log('\n🚨 Missing files that need to be created:');
  missingFiles.forEach(file => console.log(`   - ${file}`));
}

if (iconIssues.length > 0) {
  console.log('\n🎨 Icon tasks for production:');
  iconIssues.forEach(issue => console.log(`   - ${issue}`));
}

console.log('\n🚀 NEXT STEPS FOR PUBLISHING:');
console.log('1. Set up Google OAuth credentials');
console.log('2. Replace OAuth client_id in manifest.json');
console.log('3. Convert SVG icons to PNG format');
console.log('4. Test extension in Chrome (chrome://extensions)');
console.log('5. Create screenshots for Chrome Web Store');
console.log('6. Review PUBLISHING_GUIDE.md for complete instructions');

// Check if ready for development testing
const isReadyForTesting = missingFiles.length === 0 && 
                         fs.existsSync('manifest.json') && 
                         fs.existsSync('background.js') && 
                         fs.existsSync('content.js');

if (isReadyForTesting) {
  console.log('\n🎉 Extension is ready for development testing!');
  console.log('   Load in Chrome via chrome://extensions -> Load unpacked');
} else {
  console.log('\n⚠️  Extension needs more work before testing');
}

console.log('\n📚 Documentation created:');
console.log('   - README.md: Complete project documentation');
console.log('   - PRIVACY_POLICY.md: Privacy policy for Chrome Web Store');
console.log('   - PUBLISHING_GUIDE.md: Step-by-step publishing instructions');
console.log('   - CHANGELOG.md: Version history and planned features');
