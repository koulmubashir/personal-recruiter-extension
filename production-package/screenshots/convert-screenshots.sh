#!/bin/bash

# Chrome Web Store Screenshot Converter
# Converts screenshots to required format: 1280x800 or 640x400, JPEG/PNG without alpha

echo "🎯 Converting screenshots for Chrome Web Store..."

# Create converted directory
mkdir -p converted

# Function to convert image with proper Chrome Web Store format
convert_screenshot() {
    local input="$1"
    local output="$2"
    local width="$3"
    local height="$4"
    
    echo "Converting $input to ${width}x${height}..."
    
    # Use sips (macOS built-in tool) to convert images
    # 1. Resize to target dimensions
    # 2. Remove alpha channel 
    # 3. Convert to high-quality PNG
    
    sips -z $height $width \
         -s format png \
         -s hasAlpha no \
         "$input" --out "$output"
}

# Convert each screenshot to 1280x800 (preferred size)
echo "📸 Converting to 1280x800 (Chrome Web Store preferred)..."

convert_screenshot "Screenshot 2025-10-02 at 1.04.02 PM.png" "converted/screenshot-1-sidepanel-main-1280x800.png" 1280 800
convert_screenshot "Screenshot 2025-10-02 at 1.04.38 PM.png" "converted/screenshot-2-job-details-1280x800.png" 1280 800  
convert_screenshot "Screenshot 2025-10-02 at 1.05.03 PM.png" "converted/screenshot-3-ai-magic-1280x800.png" 1280 800

# Also create 640x400 versions as backup
echo "📱 Creating 640x400 backup versions..."

convert_screenshot "Screenshot 2025-10-02 at 1.04.02 PM.png" "converted/screenshot-1-sidepanel-main-640x400.png" 640 400
convert_screenshot "Screenshot 2025-10-02 at 1.04.38 PM.png" "converted/screenshot-2-job-details-640x400.png" 640 400
convert_screenshot "Screenshot 2025-10-02 at 1.05.03 PM.png" "converted/screenshot-3-ai-magic-640x400.png" 640 400

echo "✅ Screenshot conversion complete!"
echo "📁 Converted files are in the 'converted' directory"
echo "🎯 Use the 1280x800 versions for Chrome Web Store (preferred)"

# Show final file info
echo ""
echo "📊 Final Screenshot Details:"
file converted/*.png
