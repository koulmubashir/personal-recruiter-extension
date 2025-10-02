#!/bin/bash

# Personal Recruiter Extension - Chrome Web Store Package Creator
# This script creates a clean ZIP package ready for Chrome Web Store submission

echo "🎯 Personal Recruiter - Chrome Web Store Package Creator"
echo "=================================================="

# Set variables
EXTENSION_NAME="personal-recruiter-extension"
BUILD_DIR="./build"
ZIP_NAME="${EXTENSION_NAME}-v1.0.0.zip"

# Create build directory
echo "📁 Creating build directory..."
rm -rf "$BUILD_DIR"
mkdir -p "$BUILD_DIR"

# Copy essential extension files
echo "📋 Copying extension files..."

# Core files
cp manifest.json "$BUILD_DIR/"
cp background.js "$BUILD_DIR/"
cp content.js "$BUILD_DIR/"
cp sidepanel.html "$BUILD_DIR/"
cp popup.html "$BUILD_DIR/"

# JavaScript files
mkdir -p "$BUILD_DIR/js"
cp js/sidepanel.js "$BUILD_DIR/js/"

# CSS files
mkdir -p "$BUILD_DIR/css"
cp css/sidepanel.css "$BUILD_DIR/css/"

# Icons (make sure you've downloaded the new ones!)
mkdir -p "$BUILD_DIR/icons"
cp icons/icon16.png "$BUILD_DIR/icons/" 2>/dev/null || echo "⚠️  Warning: icon16.png not found - download from icon-generator.html"
cp icons/icon32.png "$BUILD_DIR/icons/" 2>/dev/null || echo "⚠️  Warning: icon32.png not found - download from icon-generator.html"
cp icons/icon48.png "$BUILD_DIR/icons/" 2>/dev/null || echo "⚠️  Warning: icon48.png not found - download from icon-generator.html"
cp icons/icon128.png "$BUILD_DIR/icons/" 2>/dev/null || echo "⚠️  Warning: icon128.png not found - download from icon-generator.html"

# Documentation (required for store)
cp README.md "$BUILD_DIR/"
cp PRIVACY_POLICY.md "$BUILD_DIR/"
cp LICENSE "$BUILD_DIR/"

# Remove any development/test files that shouldn't be in the package
echo "🧹 Cleaning up development files..."
rm -f "$BUILD_DIR"/*test*.html
rm -f "$BUILD_DIR"/*debug*.html
rm -f "$BUILD_DIR"/*guide*.html
rm -f "$BUILD_DIR"/ai-magic-guide.html
rm -f "$BUILD_DIR"/job-details-modal-guide.html

# Create ZIP package
echo "📦 Creating ZIP package..."
cd "$BUILD_DIR"
zip -r "../$ZIP_NAME" . -x "*.DS_Store" "*.git*" "*node_modules*" "*test*" "*debug*"
cd ..

# Verify package contents
echo "✅ Package contents:"
unzip -l "$ZIP_NAME"

echo ""
echo "🎉 Package created successfully!"
echo "📦 File: $ZIP_NAME"
echo "📏 Size: $(du -h "$ZIP_NAME" | cut -f1)"
echo ""
echo "📋 Next steps:"
echo "1. Download missing icons from icon-generator.html if any warnings appeared"
echo "2. Test the extension by loading the build/ folder in Chrome"
echo "3. Upload $ZIP_NAME to Chrome Web Store Developer Dashboard"
echo ""
echo "🔗 Chrome Web Store Developer Dashboard:"
echo "   https://chrome.google.com/webstore/devconsole"
echo ""
echo "📖 Full submission guide: store-assets/CHROME_WEB_STORE_GUIDE.md"
