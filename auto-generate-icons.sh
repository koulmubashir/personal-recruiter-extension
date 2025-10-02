#!/bin/bash

# Personal Recruiter Extension - Icon Generator Script
# This script creates professional PNG icons for the Chrome extension

echo "🎯 Personal Recruiter - Automatic Icon Generator"
echo "=============================================="

# Check if we have the necessary tools
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Installing icons manually..."
    
    # Create a simple Python script to generate icons
    cat > generate_icons.py << 'EOF'
import base64
import os
from PIL import Image, ImageDraw, ImageFont
import io

def create_recruiter_icon(size):
    """Create a professional recruiter icon"""
    
    # Create image with transparent background
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    # Colors
    bg_color = (30, 64, 175)  # Blue background
    skin_color = (251, 191, 36)  # Skin tone
    suit_color = (55, 65, 81)  # Dark suit
    tie_color = (220, 38, 38)  # Red tie
    hair_color = (139, 69, 19)  # Brown hair
    
    # Scale factor for different sizes
    scale = size / 128.0
    
    # Background circle
    margin = int(4 * scale)
    circle_radius = (size - margin * 2) // 2
    draw.ellipse([margin, margin, size - margin, size - margin], fill=bg_color)
    
    # Body (suit)
    body_top = int(size * 0.55)
    body_width = int(size * 0.4)
    body_left = (size - body_width) // 2
    draw.rectangle([body_left, body_top, body_left + body_width, size - margin], fill=suit_color)
    
    # Shirt
    shirt_width = int(size * 0.25)
    shirt_left = (size - shirt_width) // 2
    draw.rectangle([shirt_left, body_top, shirt_left + shirt_width, size - margin], fill=(255, 255, 255))
    
    # Tie
    tie_width = int(size * 0.08)
    tie_left = (size - tie_width) // 2
    tie_height = int(size * 0.25)
    draw.rectangle([tie_left, body_top, tie_left + tie_width, body_top + tie_height], fill=tie_color)
    
    # Head
    head_radius = int(size * 0.15)
    head_center_x = size // 2
    head_center_y = int(size * 0.35)
    draw.ellipse([head_center_x - head_radius, head_center_y - head_radius, 
                  head_center_x + head_radius, head_center_y + head_radius], fill=skin_color)
    
    # Hair (simple rectangle on top)
    hair_width = int(size * 0.22)
    hair_height = int(size * 0.12)
    hair_left = (size - hair_width) // 2
    hair_top = head_center_y - head_radius - int(hair_height * 0.3)
    draw.rectangle([hair_left, hair_top, hair_left + hair_width, hair_top + hair_height], fill=hair_color)
    
    # Eyes (simple dots)
    eye_size = max(1, int(size * 0.02))
    eye_y = head_center_y - int(size * 0.02)
    eye_offset = int(size * 0.06)
    draw.ellipse([head_center_x - eye_offset - eye_size, eye_y, 
                  head_center_x - eye_offset + eye_size, eye_y + eye_size * 2], fill=(31, 41, 55))
    draw.ellipse([head_center_x + eye_offset - eye_size, eye_y, 
                  head_center_x + eye_offset + eye_size, eye_y + eye_size * 2], fill=(31, 41, 55))
    
    # Glasses (simple rectangles)
    if size >= 32:
        glasses_size = int(size * 0.08)
        glasses_thickness = max(1, int(size * 0.01))
        # Left lens
        draw.rectangle([head_center_x - eye_offset - glasses_size, eye_y - glasses_thickness,
                       head_center_x - eye_offset + glasses_size, eye_y - glasses_thickness + 1], fill=(55, 65, 81))
        draw.rectangle([head_center_x - eye_offset - glasses_size, eye_y + eye_size * 2,
                       head_center_x - eye_offset + glasses_size, eye_y + eye_size * 2 + glasses_thickness], fill=(55, 65, 81))
        draw.rectangle([head_center_x - eye_offset - glasses_size, eye_y - glasses_thickness,
                       head_center_x - eye_offset - glasses_size + glasses_thickness, eye_y + eye_size * 2 + glasses_thickness], fill=(55, 65, 81))
        draw.rectangle([head_center_x - eye_offset + glasses_size - glasses_thickness, eye_y - glasses_thickness,
                       head_center_x - eye_offset + glasses_size, eye_y + eye_size * 2 + glasses_thickness], fill=(55, 65, 81))
        
        # Right lens
        draw.rectangle([head_center_x + eye_offset - glasses_size, eye_y - glasses_thickness,
                       head_center_x + eye_offset + glasses_size, eye_y - glasses_thickness + 1], fill=(55, 65, 81))
        draw.rectangle([head_center_x + eye_offset - glasses_size, eye_y + eye_size * 2,
                       head_center_x + eye_offset + glasses_size, eye_y + eye_size * 2 + glasses_thickness], fill=(55, 65, 81))
        draw.rectangle([head_center_x + eye_offset - glasses_size, eye_y - glasses_thickness,
                       head_center_x + eye_offset - glasses_size + glasses_thickness, eye_y + eye_size * 2 + glasses_thickness], fill=(55, 65, 81))
        draw.rectangle([head_center_x + eye_offset + glasses_size - glasses_thickness, eye_y - glasses_thickness,
                       head_center_x + eye_offset + glasses_size, eye_y + eye_size * 2 + glasses_thickness], fill=(55, 65, 81))
        
        # Bridge
        draw.rectangle([head_center_x - int(size * 0.01), eye_y,
                       head_center_x + int(size * 0.01), eye_y + glasses_thickness], fill=(55, 65, 81))
    
    # Clipboard (for larger sizes)
    if size >= 48:
        clipboard_size = int(size * 0.12)
        clipboard_x = size - margin - clipboard_size - int(size * 0.05)
        clipboard_y = int(size * 0.25)
        
        # Clipboard background
        draw.rectangle([clipboard_x, clipboard_y, clipboard_x + clipboard_size, clipboard_y + int(clipboard_size * 1.2)], 
                      fill=(251, 191, 36))
        
        # Paper
        paper_margin = int(clipboard_size * 0.1)
        draw.rectangle([clipboard_x + paper_margin, clipboard_y + paper_margin, 
                       clipboard_x + clipboard_size - paper_margin, clipboard_y + int(clipboard_size * 1.2) - paper_margin], 
                      fill=(255, 255, 255))
        
        # Checkmarks (simple green dots)
        check_size = max(1, int(clipboard_size * 0.08))
        check_x = clipboard_x + paper_margin + int(clipboard_size * 0.15)
        for i in range(3):
            check_y = clipboard_y + paper_margin + int(clipboard_size * 0.2) + i * int(clipboard_size * 0.15)
            draw.ellipse([check_x, check_y, check_x + check_size, check_y + check_size], fill=(16, 185, 129))
    
    return img

def main():
    """Generate all icon sizes"""
    sizes = [16, 32, 48, 128]
    icons_dir = "icons"
    
    print("🎨 Generating PNG icons...")
    
    for size in sizes:
        print(f"  📎 Creating {size}x{size} icon...")
        icon = create_recruiter_icon(size)
        
        # Save with high quality
        icon_path = os.path.join(icons_dir, f"icon{size}.png")
        icon.save(icon_path, "PNG", optimize=True)
        print(f"    ✅ Saved: {icon_path}")
    
    print("🎉 All icons generated successfully!")
    print("\n📋 Next steps:")
    print("1. Reload your Chrome extension")
    print("2. Check that the new icons appear")
    print("3. Test the extension functionality")

if __name__ == "__main__":
    main()
EOF

    # Check if Python and PIL are available
    if command -v python3 &> /dev/null; then
        echo "🐍 Using Python to generate icons..."
        
        # Install PIL if not available
        python3 -c "from PIL import Image" 2>/dev/null || {
            echo "📦 Installing Pillow for image processing..."
            pip3 install Pillow 2>/dev/null || pip install Pillow 2>/dev/null || {
                echo "❌ Could not install Pillow. Please install manually: pip install Pillow"
                exit 1
            }
        }
        
        # Run the icon generator
        python3 generate_icons.py
        
        # Clean up
        rm generate_icons.py
        
    else
        echo "❌ Python not found. Please install Python 3 and PIL (pip install Pillow)"
        echo "📋 Manual steps:"
        echo "1. Open generate-png-icons.html in your browser"
        echo "2. Download all 4 PNG files"
        echo "3. Replace the files in icons/ folder"
        exit 1
    fi
    
else
    echo "✅ Node.js found, could use for advanced icon generation"
    echo "📱 Using Python fallback for reliable PNG generation..."
    
    # Use the Python approach even if Node is available
    python3 generate_icons.py 2>/dev/null || {
        echo "❌ Python/PIL not available. Opening browser-based generator..."
        open generate-png-icons.html 2>/dev/null || echo "Please open generate-png-icons.html manually"
    }
fi

echo ""
echo "🔄 Next: Reload your Chrome extension to see the new icons!"
echo "📍 Go to chrome://extensions/ and click the reload button"
