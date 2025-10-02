// OAuth Debug Script
// This script helps debug OAuth issues

console.log('=== OAuth Debug Started ===');

// Check if chrome.identity is available
if (!chrome || !chrome.identity) {
    console.error('Chrome identity API not available');
} else {
    console.log('Chrome identity API available');
}

// Check manifest OAuth configuration
const manifest = chrome.runtime.getManifest();
console.log('Manifest OAuth config:', manifest.oauth2);

// Test non-interactive token first
console.log('Testing non-interactive token...');
chrome.identity.getAuthToken({ interactive: false }, (token) => {
    if (chrome.runtime.lastError) {
        console.log('No cached token:', chrome.runtime.lastError.message);
    } else {
        console.log('Cached token found:', token ? 'YES' : 'NO');
    }
    
    console.log('Testing interactive token...');
    chrome.identity.getAuthToken({ interactive: true }, (interactiveToken) => {
        if (chrome.runtime.lastError) {
            console.error('Interactive auth failed:', chrome.runtime.lastError.message);
        } else {
            console.log('Interactive token:', interactiveToken ? 'SUCCESS' : 'FAILED');
            if (interactiveToken) {
                console.log('Token length:', interactiveToken.length);
                console.log('Token preview:', interactiveToken.substring(0, 50) + '...');
            }
        }
    });
});
