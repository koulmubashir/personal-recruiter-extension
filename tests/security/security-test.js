// tests/security/security-test.js - Security vulnerability checks

const fs = require('fs');
const path = require('path');

function runSecurityTests() {
  console.log('🔒 Running Security Tests...\n');

  const results = {
    passed: 0,
    failed: 0,
    issues: []
  };

  // Test 1: Check manifest for security issues
  console.log('1. Checking manifest.json security...');
  try {
    const manifest = JSON.parse(fs.readFileSync('manifest.json', 'utf8'));
    
    // Check for overly broad permissions
    if (manifest.host_permissions && manifest.host_permissions.includes('<all_urls>')) {
      results.issues.push('❌ SECURITY RISK: <all_urls> permission detected');
      results.failed++;
    } else {
      console.log('   ✅ Host permissions are appropriately scoped');
      results.passed++;
    }

    // Check for unsafe CSP
    if (manifest.content_security_policy) {
      const csp = JSON.stringify(manifest.content_security_policy);
      if (csp.includes('unsafe-inline') || csp.includes('unsafe-eval')) {
        results.issues.push('❌ SECURITY RISK: Unsafe CSP directives detected');
        results.failed++;
      } else {
        console.log('   ✅ Content Security Policy is secure');
        results.passed++;
      }
    }

  } catch (error) {
    results.issues.push('❌ ERROR: Could not read manifest.json');
    results.failed++;
  }

  // Test 2: Check for hardcoded credentials
  console.log('2. Scanning for hardcoded credentials...');
  const sensitivePatterns = [
    /api[_-]?key\s*[:=]\s*['""][\w-]{20,}/i,
    /secret\s*[:=]\s*['""][\w-]{10,}/i,
    /password\s*[:=]\s*['""][\w-]{8,}/i,
    /token\s*[:=]\s*['""][\w-]{20,}/i
  ];

  let credentialsFound = false;
  const filesToCheck = ['background.js', 'content.js', 'popup.js'];
  
  filesToCheck.forEach(file => {
    if (fs.existsSync(file)) {
      const content = fs.readFileSync(file, 'utf8');
      sensitivePatterns.forEach(pattern => {
        if (pattern.test(content)) {
          results.issues.push(`❌ SECURITY RISK: Potential hardcoded credential in ${file}`);
          credentialsFound = true;
        }
      });
    }
  });

  if (!credentialsFound) {
    console.log('   ✅ No hardcoded credentials detected');
    results.passed++;
  } else {
    results.failed++;
  }

  // Test 3: Check for XSS vulnerabilities
  console.log('3. Checking for potential XSS vulnerabilities...');
  const xssPatterns = [
    /\.innerHTML\s*=\s*(?!['"`])/,
    /document\.write\s*\(/,
    /eval\s*\(/,
    /setTimeout\s*\(\s*['""`]/,
    /setInterval\s*\(\s*['""`]/
  ];

  let xssRisks = false;
  filesToCheck.forEach(file => {
    if (fs.existsSync(file)) {
      const content = fs.readFileSync(file, 'utf8');
      xssPatterns.forEach(pattern => {
        if (pattern.test(content)) {
          results.issues.push(`❌ XSS RISK: Potentially unsafe code in ${file}`);
          xssRisks = true;
        }
      });
    }
  });

  if (!xssRisks) {
    console.log('   ✅ No obvious XSS vulnerabilities detected');
    results.passed++;
  } else {
    results.failed++;
  }

  // Test 4: Check OAuth implementation
  console.log('4. Validating OAuth security...');
  if (fs.existsSync('background.js')) {
    const content = fs.readFileSync('background.js', 'utf8');
    
    // Check if using secure OAuth flow
    if (content.includes('chrome.identity.getAuthToken')) {
      console.log('   ✅ Using secure Chrome Identity API');
      results.passed++;
    } else {
      results.issues.push('❌ OAUTH RISK: Not using Chrome Identity API');
      results.failed++;
    }

    // Check for state parameter validation (CSRF protection)
    if (content.includes('state') && content.includes('verify')) {
      console.log('   ✅ OAuth state validation detected');
      results.passed++;
    } else {
      results.issues.push('⚠️  WARNING: OAuth state validation not clearly implemented');
    }
  }

  // Print results
  console.log('\n📊 Security Test Results:');
  console.log(`✅ Passed: ${results.passed}`);
  console.log(`❌ Failed: ${results.failed}`);
  
  if (results.issues.length > 0) {
    console.log('\n🚨 Security Issues Found:');
    results.issues.forEach(issue => console.log(`   ${issue}`));
  }

  if (results.failed === 0) {
    console.log('\n🎉 All security tests passed!');
    return true;
  } else {
    console.log('\n⚠️  Security issues detected. Please review before deployment.');
    return false;
  }
}

// Run if called directly
if (require.main === module) {
  runSecurityTests();
}

module.exports = { runSecurityTests };
