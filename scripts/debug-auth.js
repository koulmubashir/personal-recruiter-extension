// Debug script to test authentication
// Run this in the Chrome DevTools console when the popup is open

console.log('🔍 Personal Recruiter Debug Script');

// Test 1: Check if chrome.identity is available
if (typeof chrome !== 'undefined' && chrome.identity) {
    console.log('✅ Chrome Identity API is available');
} else {
    console.log('❌ Chrome Identity API not available');
}

// Test 2: Check manifest permissions
chrome.runtime.getManifest().then ? 
    chrome.runtime.getManifest().permissions.includes('identity') ? 
        console.log('✅ Identity permission granted') : 
        console.log('❌ Identity permission missing') :
    console.log('⚠️  Could not check manifest');

// Test 3: Try to get auth token (non-interactive)
chrome.identity.getAuthToken({interactive: false}, (token) => {
    if (chrome.runtime.lastError) {
        console.log('ℹ️  No cached token:', chrome.runtime.lastError.message);
    } else {
        console.log('✅ Cached token found:', token ? 'Yes' : 'No');
    }
});

// Test 4: Check OAuth2 configuration
const manifest = chrome.runtime.getManifest();
if (manifest.oauth2) {
    console.log('✅ OAuth2 config found');
    console.log('   Client ID:', manifest.oauth2.client_id);
    console.log('   Scopes:', manifest.oauth2.scopes);
} else {
    console.log('❌ OAuth2 config missing from manifest');
}

// Test 5: Check extension ID
console.log('📋 Extension ID:', chrome.runtime.id);

console.log('\n🔧 Next Steps:');
console.log('1. Copy your Extension ID:', chrome.runtime.id);
console.log('2. Go to Google Cloud Console');
console.log('3. Update OAuth Client ID with this Extension ID');
console.log('4. Make sure Application Type is "Chrome Extension"');
console.log('5. Reload this extension and try again');

// Test 6: Test the actual authentication
console.log('\n🧪 Testing Authentication...');
chrome.runtime.sendMessage({action: 'authenticate'}, (response) => {
    if (response && response.success) {
        console.log('✅ Authentication successful!', response.user);
    } else {
        console.log('❌ Authentication failed:', response ? response.error : 'No response');
    }
});
