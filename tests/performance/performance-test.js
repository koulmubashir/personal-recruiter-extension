// tests/performance/performance-test.js - Performance testing

const fs = require('fs');

function runPerformanceTests() {
  console.log('⚡ Running Performance Tests...\n');

  const results = {
    passed: 0,
    failed: 0,
    metrics: {}
  };

  // Test 1: File size analysis
  console.log('1. Analyzing file sizes...');
  const filesToCheck = [
    { name: 'manifest.json', maxSize: 10 * 1024 }, // 10KB
    { name: 'background.js', maxSize: 100 * 1024 }, // 100KB
    { name: 'content.js', maxSize: 100 * 1024 }, // 100KB
    { name: 'popup.html', maxSize: 50 * 1024 }, // 50KB
    { name: 'popup.js', maxSize: 50 * 1024 } // 50KB
  ];

  let totalSize = 0;
  filesToCheck.forEach(file => {
    if (fs.existsSync(file.name)) {
      const stats = fs.statSync(file.name);
      const sizeKB = (stats.size / 1024).toFixed(2);
      totalSize += stats.size;
      
      if (stats.size <= file.maxSize) {
        console.log(`   ✅ ${file.name}: ${sizeKB}KB (within ${(file.maxSize/1024).toFixed(0)}KB limit)`);
        results.passed++;
      } else {
        console.log(`   ❌ ${file.name}: ${sizeKB}KB (exceeds ${(file.maxSize/1024).toFixed(0)}KB limit)`);
        results.failed++;
      }
      
      results.metrics[file.name] = { size: stats.size, sizeKB };
    }
  });

  const totalSizeMB = (totalSize / (1024 * 1024)).toFixed(2);
  results.metrics.totalSize = { bytes: totalSize, MB: totalSizeMB };
  console.log(`   📊 Total extension size: ${totalSizeMB}MB`);

  // Test 2: Code complexity analysis
  console.log('\n2. Analyzing code complexity...');
  const codeFiles = ['background.js', 'content.js', 'popup.js'];
  
  codeFiles.forEach(file => {
    if (fs.existsSync(file)) {
      const content = fs.readFileSync(file, 'utf8');
      
      // Count functions
      const functionMatches = content.match(/function\s+\w+|=>\s*{|\.then\s*\(/g) || [];
      const functionCount = functionMatches.length;
      
      // Count lines
      const lineCount = content.split('\n').length;
      
      // Calculate cyclomatic complexity (simplified)
      const complexityPatterns = /if\s*\(|else\s*if|while\s*\(|for\s*\(|switch\s*\(|catch\s*\(|\?\s*:|&&|\|\|/g;
      const complexityCount = (content.match(complexityPatterns) || []).length;
      
      console.log(`   📈 ${file}:`);
      console.log(`      - Lines: ${lineCount}`);
      console.log(`      - Functions: ${functionCount}`);
      console.log(`      - Complexity score: ${complexityCount}`);
      
      results.metrics[file + '_complexity'] = {
        lines: lineCount,
        functions: functionCount,
        complexity: complexityCount
      };
      
      // Performance thresholds
      if (lineCount < 1000 && complexityCount < 50) {
        console.log(`      ✅ Complexity within acceptable limits`);
        results.passed++;
      } else {
        console.log(`      ⚠️  High complexity detected`);
      }
    }
  });

  // Test 3: Memory usage estimation
  console.log('\n3. Estimating memory usage...');
  
  const estimateMemoryUsage = () => {
    let estimatedMemory = 0;
    
    // Base extension overhead
    estimatedMemory += 5; // 5MB base
    
    // Add file sizes
    estimatedMemory += totalSize / (1024 * 1024);
    
    // Estimate storage usage
    if (fs.existsSync('background.js')) {
      const content = fs.readFileSync('background.js', 'utf8');
      if (content.includes('chrome.storage')) {
        estimatedMemory += 2; // 2MB for storage overhead
      }
    }
    
    return estimatedMemory;
  };

  const estimatedMemory = estimateMemoryUsage();
  results.metrics.estimatedMemoryMB = estimatedMemory.toFixed(2);
  
  console.log(`   💾 Estimated memory usage: ${estimatedMemory.toFixed(2)}MB`);
  
  if (estimatedMemory < 50) {
    console.log(`   ✅ Memory usage within 50MB limit`);
    results.passed++;
  } else {
    console.log(`   ❌ Estimated memory usage too high`);
    results.failed++;
  }

  // Test 4: Network request optimization
  console.log('\n4. Checking network optimization...');
  
  const checkNetworkOptimization = () => {
    const files = ['background.js', 'content.js'];
    let issues = 0;
    
    files.forEach(file => {
      if (fs.existsSync(file)) {
        const content = fs.readFileSync(file, 'utf8');
        
        // Check for fetch/XHR optimization
        const fetchCount = (content.match(/fetch\s*\(/g) || []).length;
        const xhrCount = (content.match(/XMLHttpRequest/g) || []).length;
        
        console.log(`   🌐 ${file}: ${fetchCount} fetch calls, ${xhrCount} XHR calls`);
        
        // Check for rate limiting
        if (content.includes('setTimeout') || content.includes('setInterval')) {
          console.log(`   ✅ Rate limiting mechanisms detected`);
        } else if (fetchCount > 5 || xhrCount > 5) {
          console.log(`   ⚠️  High number of network calls without visible rate limiting`);
          issues++;
        }
      }
    });
    
    return issues === 0;
  };

  if (checkNetworkOptimization()) {
    results.passed++;
  } else {
    results.failed++;
  }

  // Print final results
  console.log('\n📊 Performance Test Results:');
  console.log(`✅ Passed: ${results.passed}`);
  console.log(`❌ Failed: ${results.failed}`);
  
  console.log('\n📈 Performance Metrics:');
  console.log(`   📦 Total Size: ${results.metrics.totalSize.MB}MB`);
  console.log(`   💾 Estimated Memory: ${results.metrics.estimatedMemoryMB}MB`);

  if (results.failed === 0) {
    console.log('\n🎉 All performance tests passed!');
    return true;
  } else {
    console.log('\n⚠️  Performance issues detected. Consider optimization.');
    return false;
  }
}

// Run if called directly
if (require.main === module) {
  runPerformanceTests();
}

module.exports = { runPerformanceTests };
