// tests/quality/basic-lint.js - Basic code quality checks

const fs = require('fs');

function runBasicLint() {
  console.log('🔍 Running Basic Code Quality Checks...\n');

  const results = {
    passed: 0,
    failed: 0,
    warnings: 0,
    issues: []
  };

  const filesToCheck = ['background.js', 'content.js', 'popup.js'];

  filesToCheck.forEach(file => {
    if (fs.existsSync(file)) {
      console.log(`📄 Checking ${file}...`);
      const content = fs.readFileSync(file, 'utf8');

      // Check for console.log (should be removed in production)
      const consoleLogCount = (content.match(/console\.(log|info|warn|error)/g) || []).length;
      if (consoleLogCount > 0) {
        results.issues.push(`⚠️  ${file}: ${consoleLogCount} console statements found`);
        results.warnings++;
      } else {
        console.log(`   ✅ No console statements`);
        results.passed++;
      }

      // Check for proper error handling
      const tryBlocks = (content.match(/try\s*{/g) || []).length;
      const catchBlocks = (content.match(/catch\s*\(/g) || []).length;
      if (tryBlocks === catchBlocks && tryBlocks > 0) {
        console.log(`   ✅ Proper error handling (${tryBlocks} try/catch blocks)`);
        results.passed++;
      } else if (tryBlocks === 0) {
        results.issues.push(`⚠️  ${file}: No error handling detected`);
        results.warnings++;
      } else {
        results.issues.push(`❌ ${file}: Unmatched try/catch blocks`);
        results.failed++;
      }

      // Check for proper async/await usage
      const asyncCount = (content.match(/async\s+function|async\s*\(/g) || []).length;
      const awaitCount = (content.match(/await\s+/g) || []).length;
      if (asyncCount > 0 && awaitCount > 0) {
        console.log(`   ✅ Proper async/await usage`);
        results.passed++;
      } else if (asyncCount > 0) {
        results.issues.push(`⚠️  ${file}: async functions without await`);
        results.warnings++;
      }

      // Check for proper function naming
      const functionDeclarations = content.match(/function\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/g) || [];
      let badNaming = false;
      functionDeclarations.forEach(func => {
        const funcName = func.replace('function ', '');
        if (!/^[a-z][a-zA-Z0-9]*$/.test(funcName)) {
          badNaming = true;
        }
      });

      if (!badNaming && functionDeclarations.length > 0) {
        console.log(`   ✅ Proper function naming conventions`);
        results.passed++;
      } else if (badNaming) {
        results.issues.push(`⚠️  ${file}: Some functions don't follow camelCase naming`);
        results.warnings++;
      }

    }
  });

  // Overall assessment
  console.log('\n📊 Code Quality Results:');
  console.log(`✅ Passed: ${results.passed}`);
  console.log(`❌ Failed: ${results.failed}`);
  console.log(`⚠️  Warnings: ${results.warnings}`);

  if (results.issues.length > 0) {
    console.log('\n📝 Quality Issues:');
    results.issues.forEach(issue => console.log(`   ${issue}`));
  }

  if (results.failed === 0) {
    console.log('\n🎉 Basic code quality checks passed!');
    return true;
  } else {
    console.log('\n⚠️  Code quality issues detected.');
    return false;
  }
}

// Run if called directly
if (require.main === module) {
  runBasicLint();
}

module.exports = { runBasicLint };
