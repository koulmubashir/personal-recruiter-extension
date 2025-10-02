// Debug script for Personal Recruiter Extension
// Run this in the browser console to check what's happening

console.log('=== Personal Recruiter Extension Debug ===');

// 1. Check if extension is loaded
chrome.runtime.getManifest ? 
  console.log('✅ Extension loaded, version:', chrome.runtime.getManifest().version) :
  console.log('❌ Extension not loaded');

// 2. Check storage data
chrome.storage.sync.get(null, (data) => {
  console.log('📦 Storage data:', data);
  console.log('Authentication status:', data.isAuthenticated);
  console.log('User profile:', data.userProfile);
  console.log('Job applications count:', (data.jobApplications || []).length);
  console.log('Job applications:', data.jobApplications);
});

// 3. Test message sending to background script
async function testBackgroundCommunication() {
  try {
    console.log('🔄 Testing background script communication...');
    
    // Test auth status
    const authResponse = await new Promise((resolve, reject) => {
      chrome.runtime.sendMessage({ action: 'getAuthStatus' }, (response) => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          resolve(response);
        }
      });
    });
    console.log('Auth status response:', authResponse);
    
    // Test getting applications
    const appsResponse = await new Promise((resolve, reject) => {
      chrome.runtime.sendMessage({ action: 'getJobApplications' }, (response) => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          resolve(response);
        }
      });
    });
    console.log('Applications response:', appsResponse);
    
  } catch (error) {
    console.error('❌ Background communication failed:', error);
  }
}

// 4. Test manual application save
async function testManualSave() {
  const testApp = {
    jobTitle: 'Test Developer Position',
    company: 'Test Company',
    url: 'https://example.com/job',
    jobId: 'test-123',
    status: 'Applied',
    notes: 'Test application',
    manual: true
  };
  
  try {
    console.log('🔄 Testing manual application save...');
    const response = await new Promise((resolve, reject) => {
      chrome.runtime.sendMessage({
        action: 'saveJobApplication',
        data: testApp
      }, (response) => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          resolve(response);
        }
      });
    });
    console.log('Save response:', response);
  } catch (error) {
    console.error('❌ Manual save failed:', error);
  }
}

// 5. Check content script injection
async function checkContentScript() {
  try {
    console.log('🔄 Checking content script...');
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    const currentTab = tabs[0];
    console.log('Current tab:', currentTab.url);
    
    // Try to send message to content script
    chrome.tabs.sendMessage(currentTab.id, { type: 'CHECK_STATUS' }, (response) => {
      if (chrome.runtime.lastError) {
        console.log('❌ Content script not injected or not responding');
      } else {
        console.log('✅ Content script responding:', response);
      }
    });
  } catch (error) {
    console.error('❌ Content script check failed:', error);
  }
}

// Run all tests
testBackgroundCommunication();
setTimeout(testManualSave, 1000);
setTimeout(checkContentScript, 2000);

console.log('=== Debug script completed ===');
console.log('Check the console messages above for diagnostic information');
