#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔍 Testing Chrome Extension Manifest...');

try {
    // Read the production manifest
    const manifestPath = './production-package/manifest.json';
    const manifestContent = fs.readFileSync(manifestPath, 'utf8');
    const manifest = JSON.parse(manifestContent);
    
    console.log('✅ Manifest JSON is valid');
    console.log(`📦 Extension: ${manifest.name}`);
    console.log(`🔢 Version: ${manifest.version}`);
    console.log(`📝 Manifest Version: ${manifest.manifest_version}`);
    
    // Check web_accessible_resources
    if (manifest.web_accessible_resources) {
        console.log('🌐 Web Accessible Resources:');
        manifest.web_accessible_resources.forEach((resource, index) => {
            console.log(`   ${index + 1}. Resources: ${resource.resources.join(', ')}`);
            console.log(`      Matches: ${resource.matches.length} patterns`);
            
            // Validate match patterns
            let validPatterns = 0;
            let invalidPatterns = [];
            
            resource.matches.forEach(pattern => {
                // Basic validation - should start with https:// and have proper format
                if (pattern.startsWith('https://') && pattern.includes('/*')) {
                    validPatterns++;
                } else {
                    invalidPatterns.push(pattern);
                }
            });
            
            if (invalidPatterns.length > 0) {
                console.log(`   ❌ Invalid patterns found: ${invalidPatterns.join(', ')}`);
            } else {
                console.log(`   ✅ All ${validPatterns} match patterns are valid`);
            }
        });
    }
    
    // Check if referenced files exist
    console.log('📁 Checking referenced files...');
    const productionDir = './production-package';
    
    // Check icons
    if (manifest.icons) {
        Object.entries(manifest.icons).forEach(([size, iconPath]) => {
            const fullPath = path.join(productionDir, iconPath);
            if (fs.existsSync(fullPath)) {
                console.log(`   ✅ Icon ${size}x${size}: ${iconPath}`);
            } else {
                console.log(`   ❌ Missing icon: ${iconPath}`);
            }
        });
    }
    
    // Check web accessible resources files
    if (manifest.web_accessible_resources) {
        manifest.web_accessible_resources.forEach(resource => {
            resource.resources.forEach(resourcePath => {
                const fullPath = path.join(productionDir, resourcePath);
                if (fs.existsSync(fullPath)) {
                    console.log(`   ✅ Web resource: ${resourcePath}`);
                } else {
                    console.log(`   ❌ Missing web resource: ${resourcePath}`);
                }
            });
        });
    }
    
    // Check service worker
    if (manifest.background && manifest.background.service_worker) {
        const swPath = path.join(productionDir, manifest.background.service_worker);
        if (fs.existsSync(swPath)) {
            console.log(`   ✅ Service worker: ${manifest.background.service_worker}`);
        } else {
            console.log(`   ❌ Missing service worker: ${manifest.background.service_worker}`);
        }
    }
    
    console.log('\n🎉 Manifest validation complete!');
    
} catch (error) {
    console.error('❌ Manifest validation failed:', error.message);
    process.exit(1);
}
