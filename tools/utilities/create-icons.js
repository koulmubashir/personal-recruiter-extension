#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Simple PNG creation using Canvas API simulation
function createRecruiterIcon(size) {
    // Create a simple SVG that we'll convert
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">
        <defs>
            <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style="stop-color:#1E40AF"/>
                <stop offset="100%" style="stop-color:#3B82F6"/>
            </linearGradient>
        </defs>
        
        <!-- Background -->
        <circle cx="${size/2}" cy="${size/2}" r="${(size-8)/2}" fill="url(#bgGrad)"/>
        
        <!-- Body (suit) -->
        <rect x="${size*0.3}" y="${size*0.6}" width="${size*0.4}" height="${size*0.35}" fill="#374151" rx="2"/>
        
        <!-- Shirt -->
        <rect x="${size*0.35}" y="${size*0.6}" width="${size*0.3}" height="${size*0.35}" fill="white"/>
        
        <!-- Tie -->
        <rect x="${size*0.47}" y="${size*0.6}" width="${size*0.06}" height="${size*0.25}" fill="#DC2626"/>
        
        <!-- Head -->
        <circle cx="${size/2}" cy="${size*0.4}" r="${size*0.12}" fill="#FBBF24"/>
        
        <!-- Hair -->
        <path d="M ${size*0.35} ${size*0.32} Q ${size*0.35} ${size*0.25} ${size/2} ${size*0.23} Q ${size*0.65} ${size*0.25} ${size*0.65} ${size*0.32} Z" fill="#8B4513"/>
        
        <!-- Eyes -->
        <circle cx="${size*0.45}" cy="${size*0.38}" r="${size*0.015}" fill="#1F2937"/>
        <circle cx="${size*0.55}" cy="${size*0.38}" r="${size*0.015}" fill="#1F2937"/>
        
        <!-- Glasses -->
        <circle cx="${size*0.45}" cy="${size*0.38}" r="${size*0.04}" fill="none" stroke="#374151" stroke-width="${Math.max(1, size*0.01)}"/>
        <circle cx="${size*0.55}" cy="${size*0.38}" r="${size*0.04}" fill="none" stroke="#374151" stroke-width="${Math.max(1, size*0.01)}"/>
        <line x1="${size*0.49}" y1="${size*0.38}" x2="${size*0.51}" y2="${size*0.38}" stroke="#374151" stroke-width="${Math.max(1, size*0.01)}"/>
        
        <!-- Smile -->
        <path d="M ${size*0.46} ${size*0.43} Q ${size/2} ${size*0.45} ${size*0.54} ${size*0.43}" stroke="#D97706" stroke-width="${Math.max(1, size*0.008)}" fill="none"/>
        
        <!-- Clipboard (for larger sizes) -->
        ${size >= 32 ? `
        <g transform="translate(${size*0.7}, ${size*0.25})">
            <rect x="0" y="0" width="${size*0.12}" height="${size*0.15}" rx="1" fill="#FBBF24"/>
            <rect x="${size*0.01}" y="${size*0.01}" width="${size*0.1}" height="${size*0.13}" fill="white"/>
            <rect x="${size*0.02}" y="${size*0.03}" width="${size*0.01}" height="${size*0.01}" fill="#10B981"/>
            <rect x="${size*0.04}" y="${size*0.03}" width="${size*0.05}" height="${size*0.005}" fill="#374151"/>
            <rect x="${size*0.02}" y="${size*0.05}" width="${size*0.01}" height="${size*0.01}" fill="#10B981"/>
            <rect x="${size*0.04}" y="${size*0.05}" width="${size*0.04}" height="${size*0.005}" fill="#374151"/>
        </g>
        ` : ''}
        
        <!-- AI Sparkle -->
        <g opacity="0.8">
            <path d="M ${size*0.15} ${size*0.2} L ${size*0.17} ${size*0.25} L ${size*0.22} ${size*0.27} L ${size*0.17} ${size*0.29} L ${size*0.15} ${size*0.34} L ${size*0.13} ${size*0.29} L ${size*0.08} ${size*0.27} L ${size*0.13} ${size*0.25} Z" fill="#FBBF24"/>
        </g>
    </svg>`;
    
    return svg;
}

// Create all icon sizes
const sizes = [16, 32, 48, 128];
const iconsDir = 'icons';

console.log('🎨 Generating SVG-based icons...');

sizes.forEach(size => {
    const svg = createRecruiterIcon(size);
    const filename = path.join(iconsDir, `icon${size}.svg`);
    
    fs.writeFileSync(filename, svg);
    console.log(`  ✅ Created: ${filename}`);
});

console.log('\n📝 Note: SVG icons created. For PNG conversion:');
console.log('1. Open generate-png-icons.html in browser');
console.log('2. Download PNG files');
console.log('3. Replace the icons manually');
console.log('\n🔄 For now, update manifest.json to use SVG icons temporarily...');

// Update manifest to use SVG icons as fallback
const manifestPath = 'manifest.json';
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

// Update icons to use SVG temporarily
manifest.icons = {
    "16": "icons/icon16.svg",
    "32": "icons/icon32.svg", 
    "48": "icons/icon48.svg",
    "128": "icons/icon128.svg"
};

fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
console.log('✅ Updated manifest.json to use SVG icons temporarily');
console.log('\n🚀 Reload your extension to see the new icons!');
