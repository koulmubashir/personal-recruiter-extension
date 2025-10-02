// Script to create extension icons
const fs = require('fs');
const path = require('path');

// Create simple SVG icons and convert to PNG (placeholder for now)
const createIconSVG = (size) => `
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#764ba2;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="${size}" height="${size}" rx="${size * 0.2}" fill="url(#grad1)"/>
  <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" 
        font-family="Arial, sans-serif" font-size="${size * 0.5}" fill="white" font-weight="bold">📋</text>
</svg>`;

// Create icons directory if it doesn't exist
const iconsDir = path.join(__dirname, '..', 'icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Create SVG files for different sizes
const sizes = [16, 32, 48, 128];
sizes.forEach(size => {
  const svgContent = createIconSVG(size);
  const svgPath = path.join(iconsDir, `icon${size}.svg`);
  fs.writeFileSync(svgPath, svgContent);
  console.log(`Created icon${size}.svg`);
});

console.log('Icons created successfully!');
console.log('Note: For production, convert SVG files to PNG format using an image editor or online converter.');
console.log('The SVG files are provided as templates.');
