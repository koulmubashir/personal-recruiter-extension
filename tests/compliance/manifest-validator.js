// tests/compliance/manifest-validator.js - Chrome Web Store compliance validation

const fs = require('fs');

function validateManifest() {
  console.log('📋 Validating Chrome Web Store Compliance...\n');

  const results = {
    passed: 0,
    failed: 0,
    warnings: 0,
    issues: []
  };

  try {
    const manifest = JSON.parse(fs.readFileSync('manifest.json', 'utf8'));

    // Test 1: Manifest V3 compliance
    console.log('1. Checking Manifest V3 compliance...');
    if (manifest.manifest_version === 3) {
      console.log('   ✅ Using Manifest V3');
      results.passed++;
    } else {
      results.issues.push('❌ CRITICAL: Must use Manifest V3');
      results.failed++;
    }

    // Test 2: Required fields
    console.log('2. Validating required fields...');
    const requiredFields = ['name', 'version', 'description', 'manifest_version'];
    
    requiredFields.forEach(field => {
      if (manifest[field]) {
        console.log(`   ✅ ${field}: "${manifest[field]}"`);
        results.passed++;
      } else {
        results.issues.push(`❌ MISSING: Required field "${field}"`);
        results.failed++;
      }
    });

    // Test 3: Description compliance
    console.log('3. Checking description compliance...');
    if (manifest.description) {
      const desc = manifest.description;
      
      // Length check
      if (desc.length <= 132) {
        console.log(`   ✅ Description length: ${desc.length}/132 characters`);
        results.passed++;
      } else {
        results.issues.push('❌ Description exceeds 132 character limit');
        results.failed++;
      }

      // Keyword spam check
      const spamIndicators = [
        /best|#1|top|amazing|incredible|revolutionary/i,
        /!{2,}/,
        /(.)\1{3,}/, // Repeated characters
        /(free|download|click|now|today){2,}/i
      ];

      let hasSpam = false;
      spamIndicators.forEach(pattern => {
        if (pattern.test(desc)) {
          hasSpam = true;
        }
      });

      if (!hasSpam) {
        console.log('   ✅ No keyword spam detected');
        results.passed++;
      } else {
        results.issues.push('❌ Potential keyword spam in description');
        results.failed++;
      }
    }

    // Test 4: Permission validation
    console.log('4. Validating permissions...');
    if (manifest.permissions) {
      console.log(`   📋 Permissions requested: ${manifest.permissions.length}`);
      
      // Check for overly broad permissions
      const problematicPerms = ['<all_urls>', 'tabs', 'cookies', 'history', 'management'];
      let hasProblematic = false;
      
      manifest.permissions.forEach(perm => {
        if (problematicPerms.includes(perm)) {
          results.issues.push(`⚠️  WARNING: Potentially problematic permission "${perm}"`);
          results.warnings++;
          hasProblematic = true;
        }
      });

      if (!hasProblematic) {
        console.log('   ✅ No problematic permissions detected');
        results.passed++;
      }

      // Required permissions for job tracker
      const requiredPerms = ['storage', 'identity'];
      requiredPerms.forEach(perm => {
        if (manifest.permissions.includes(perm)) {
          console.log(`   ✅ Required permission "${perm}" found`);
          results.passed++;
        } else {
          results.issues.push(`❌ Missing required permission "${perm}"`);
          results.failed++;
        }
      });
    }

    // Test 5: Host permissions validation
    console.log('5. Checking host permissions...');
    if (manifest.host_permissions) {
      if (manifest.host_permissions.includes('<all_urls>')) {
        results.issues.push('❌ CRITICAL: <all_urls> permission violates store policy');
        results.failed++;
      } else {
        console.log('   ✅ Host permissions are appropriately scoped');
        results.passed++;
      }

      // Check for job site specific permissions
      const jobSites = ['linkedin.com', 'indeed.com', 'glassdoor.com'];
      const hasJobSites = manifest.host_permissions.some(perm => 
        jobSites.some(site => perm.includes(site))
      );

      if (hasJobSites) {
        console.log('   ✅ Job site specific permissions found');
        results.passed++;
      } else {
        results.issues.push('⚠️  WARNING: No job site specific permissions detected');
        results.warnings++;
      }
    }

    // Test 6: Background script validation
    console.log('6. Validating background script...');
    if (manifest.background && manifest.background.service_worker) {
      console.log('   ✅ Using service worker (Manifest V3 compliant)');
      results.passed++;

      // Check if background script file exists
      if (fs.existsSync(manifest.background.service_worker)) {
        console.log('   ✅ Background script file exists');
        results.passed++;
      } else {
        results.issues.push(`❌ Background script file not found: ${manifest.background.service_worker}`);
        results.failed++;
      }
    } else {
      results.issues.push('❌ Missing or invalid background script configuration');
      results.failed++;
    }

    // Test 7: Content scripts validation
    console.log('7. Validating content scripts...');
    if (manifest.content_scripts && Array.isArray(manifest.content_scripts)) {
      console.log(`   ✅ Content scripts configured: ${manifest.content_scripts.length}`);
      results.passed++;

      // Check if content script files exist
      manifest.content_scripts.forEach((script, index) => {
        if (script.js && Array.isArray(script.js)) {
          script.js.forEach(jsFile => {
            if (fs.existsSync(jsFile)) {
              console.log(`   ✅ Content script exists: ${jsFile}`);
              results.passed++;
            } else {
              results.issues.push(`❌ Content script not found: ${jsFile}`);
              results.failed++;
            }
          });
        }
      });
    }

    // Test 8: Icons validation
    console.log('8. Checking icons...');
    if (manifest.icons) {
      const requiredSizes = ['16', '48', '128'];
      requiredSizes.forEach(size => {
        if (manifest.icons[size]) {
          if (fs.existsSync(manifest.icons[size])) {
            console.log(`   ✅ Icon ${size}x${size} exists: ${manifest.icons[size]}`);
            results.passed++;
          } else {
            results.issues.push(`❌ Icon file not found: ${manifest.icons[size]}`);
            results.failed++;
          }
        } else {
          results.issues.push(`⚠️  WARNING: Missing ${size}x${size} icon`);
          results.warnings++;
        }
      });
    } else {
      results.issues.push('❌ No icons specified in manifest');
      results.failed++;
    }

    // Test 9: Version validation
    console.log('9. Validating version...');
    if (manifest.version) {
      const versionRegex = /^\d+(\.\d+){0,3}$/;
      if (versionRegex.test(manifest.version)) {
        console.log(`   ✅ Version format valid: ${manifest.version}`);
        results.passed++;
      } else {
        results.issues.push(`❌ Invalid version format: ${manifest.version}`);
        results.failed++;
      }
    }

  } catch (error) {
    results.issues.push(`❌ CRITICAL: Cannot parse manifest.json - ${error.message}`);
    results.failed++;
  }

  // Print results
  console.log('\n📊 Compliance Test Results:');
  console.log(`✅ Passed: ${results.passed}`);
  console.log(`❌ Failed: ${results.failed}`);
  console.log(`⚠️  Warnings: ${results.warnings}`);

  if (results.issues.length > 0) {
    console.log('\n🚨 Issues Found:');
    results.issues.forEach(issue => console.log(`   ${issue}`));
  }

  const score = Math.round((results.passed / (results.passed + results.failed)) * 100);
  console.log(`\n📈 Compliance Score: ${score}%`);

  if (results.failed === 0) {
    console.log('\n🎉 Extension is Chrome Web Store compliant!');
    return true;
  } else {
    console.log('\n⚠️  Compliance issues must be fixed before store submission.');
    return false;
  }
}

// Run if called directly
if (require.main === module) {
  validateManifest();
}

module.exports = { validateManifest };
