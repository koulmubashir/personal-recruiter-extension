#!/bin/bash

# Personal Recruiter - Automated Screen Recording Script
# This script sets up automated screen recording for the promotional video

echo "🎬 Personal Recruiter - Automated Video Creation"
echo "=================================================="

# Configuration
RECORDING_DIR="video-recordings"
FINAL_VIDEO="personal-recruiter-promo-30s.mp4"
TEMP_DIR="temp-recordings"

# Create directories
mkdir -p "$RECORDING_DIR"
mkdir -p "$TEMP_DIR"

echo "📁 Created recording directories"

# Check for required tools
check_tool() {
    if ! command -v $1 &> /dev/null; then
        echo "❌ $1 is required but not installed"
        return 1
    else
        echo "✅ $1 is available"
        return 0
    fi
}

echo ""
echo "🔧 Checking required tools..."

# Check for screen recording tools
if check_tool "ffmpeg"; then
    RECORDER="ffmpeg"
elif check_tool "screencapture"; then
    RECORDER="screencapture"
else
    echo "❌ No screen recording tool found. Please install ffmpeg or use macOS screencapture"
    exit 1
fi

# Generate the recording script
cat > "${RECORDING_DIR}/record-scenes.sh" << 'EOF'
#!/bin/bash

echo "🎥 Starting automated screen recordings..."

# Scene 1: Problem Hook (3 seconds)
echo "Recording Scene 1: Problem Hook"
open "https://www.linkedin.com/jobs/search/"
sleep 2
# Record chaotic job search simulation
screencapture -v -T 3 -V 3 "scene1-problem-hook.mov"

# Scene 2: Solution Introduction (4 seconds)  
echo "Recording Scene 2: Solution Introduction"
# Open Chrome with extension
open -a "Google Chrome" --args --new-window
sleep 2
screencapture -v -T 4 -V 4 "scene2-solution-intro.mov"

# Scene 3: AI Magic Demo (6 seconds)
echo "Recording Scene 3: AI Magic Demo"
# Navigate to job posting and demonstrate AI Magic
open "https://www.linkedin.com/jobs/view/3000000000/"
sleep 3
screencapture -v -T 6 -V 6 "scene3-ai-magic.mov"

# Scene 4: Organization Features (6 seconds)
echo "Recording Scene 4: Organization Features"
# Show side panel dashboard
screencapture -v -T 6 -V 6 "scene4-organization.mov"

# Scene 5: Security & Trust (4 seconds)
echo "Recording Scene 5: Security Features"
screencapture -v -T 4 -V 4 "scene5-security.mov"

# Scene 6: Call to Action (2 seconds)
echo "Recording Scene 6: Call to Action"
open "https://chrome.google.com/webstore/category/extensions"
sleep 1
screencapture -v -T 2 -V 2 "scene6-cta.mov"

echo "✅ All scenes recorded!"
EOF

chmod +x "${RECORDING_DIR}/record-scenes.sh"

# Generate FFmpeg compilation script
cat > "${RECORDING_DIR}/compile-video.sh" << 'EOF'
#!/bin/bash

echo "🎬 Compiling promotional video with FFmpeg..."

# Create file list for concatenation
cat > filelist.txt << FILELIST
file 'scene1-problem-hook.mov'
file 'scene2-solution-intro.mov'
file 'scene3-ai-magic.mov'
file 'scene4-organization.mov'
file 'scene5-security.mov'
file 'scene6-cta.mov'
FILELIST

# Concatenate all scenes
ffmpeg -f concat -safe 0 -i filelist.txt \
       -c:v libx264 -preset medium -crf 23 \
       -vf "scale=1280:720,fps=30" \
       -c:a aac -b:a 128k \
       -movflags +faststart \
       personal-recruiter-raw.mp4

# Add voiceover (if voiceover.wav exists)
if [ -f "voiceover.wav" ]; then
    echo "🎙️ Adding voiceover..."
    ffmpeg -i personal-recruiter-raw.mp4 -i voiceover.wav \
           -c:v copy -c:a aac -b:a 128k \
           -shortest \
           personal-recruiter-with-audio.mp4
else
    echo "⚠️ No voiceover.wav found, creating silent video"
    cp personal-recruiter-raw.mp4 personal-recruiter-with-audio.mp4
fi

# Add title cards and text overlays
ffmpeg -i personal-recruiter-with-audio.mp4 \
       -vf "drawtext=text='Personal Recruiter':fontsize=48:fontcolor=white:x=(w-text_w)/2:y=100:enable='between(t,4,8)',
            drawtext=text='AI-Powered Job Tracking':fontsize=32:fontcolor=yellow:x=(w-text_w)/2:y=150:enable='between(t,4,8)',
            drawtext=text='✨ AI Magic Extraction':fontsize=36:fontcolor=white:x=(w-text_w)/2:y=100:enable='between(t,9,15)',
            drawtext=text='📊 Smart Organization':fontsize=36:fontcolor=white:x=(w-text_w)/2:y=100:enable='between(t,16,22)',
            drawtext=text='🔐 Secure & Private':fontsize=36:fontcolor=white:x=(w-text_w)/2:y=100:enable='between(t,23,27)',
            drawtext=text='Download Today!':fontsize=48:fontcolor=white:x=(w-text_w)/2:y=100:enable='between(t,28,30)'" \
       -c:a copy \
       personal-recruiter-final.mp4

echo "✅ Video compilation complete: personal-recruiter-final.mp4"
EOF

chmod +x "${RECORDING_DIR}/compile-video.sh"

# Generate voiceover script
cat > "${RECORDING_DIR}/voiceover-script.txt" << 'EOF'
Personal Recruiter - 30-Second Voiceover Script
==============================================

[0-3s] "Tired of losing track of job applications?"
[4-8s] "Meet Personal Recruiter - your AI-powered job tracking assistant"
[9-15s] "AI Magic instantly extracts job details from any posting"
[16-22s] "Track applications, manage interviews, and stay organized"
[23-27s] "Secure, private, with Google authentication"
[28-30s] "Download Personal Recruiter today!"

Recording Instructions:
- Speak clearly and professionally
- Pace: 3.2 words per second average
- Tone: Confident, friendly, enthusiastic
- Save as: voiceover.wav (48kHz, 16-bit)
EOF

# Generate setup instructions
cat > "${RECORDING_DIR}/setup-instructions.md" << 'EOF'
# Personal Recruiter Video Recording Setup

## Prerequisites
1. **Personal Recruiter extension** installed and working
2. **Demo job postings** bookmarked
3. **Clean browser profile** with no distractions
4. **Sample data** in extension for demonstration

## Recording Environment
- **Screen resolution**: 1280x720 or higher
- **Browser window**: Consistent size throughout
- **Notification settings**: Disabled
- **Desktop**: Clean, professional background

## Manual Recording Steps

### Scene 1: Problem Hook (0-3s)
1. Open multiple job search tabs (LinkedIn, Indeed, etc.)
2. Show Excel spreadsheet with job data
3. Display scattered sticky notes
4. Record the chaos for 3 seconds

### Scene 2: Solution Introduction (4-8s)
1. Close chaotic windows
2. Open clean Chrome browser
3. Show Personal Recruiter extension icon
4. Open side panel smoothly

### Scene 3: AI Magic Demo (9-15s)
1. Navigate to job posting page
2. Hover over "AI Magic" button
3. Click button and show extraction
4. Demonstrate data flowing to side panel

### Scene 4: Organization Features (16-22s)
1. Show populated job dashboard
2. Demonstrate status filtering
3. Show search and organization features
4. Highlight progress tracking

### Scene 5: Security & Trust (23-27s)
1. Show Google OAuth login
2. Display privacy settings
3. Highlight local storage
4. Show security badges

### Scene 6: Call to Action (28-30s)
1. Navigate to Chrome Web Store
2. Show extension listing
3. Highlight "Free" and "Download"
4. Add pulsing effect (post-production)

## Post-Production Checklist
- [ ] Color correction for consistency
- [ ] Text overlays for each scene
- [ ] Smooth transitions between scenes
- [ ] Background music (optional)
- [ ] Final quality check
EOF

# Generate thumbnail creation script
cat > "${RECORDING_DIR}/create-thumbnail.sh" << 'EOF'
#!/bin/bash

echo "🖼️ Creating YouTube thumbnail..."

# Create thumbnail with ImageMagick (if available)
if command -v convert &> /dev/null; then
    convert -size 1280x720 \
            gradient:"#1a73e8-#34a853" \
            -pointsize 48 -fill white -gravity center \
            -annotate +0-100 "PERSONAL RECRUITER" \
            -pointsize 32 -fill "#ffd700" \
            -annotate +0-50 "AI Job Tracker" \
            -pointsize 24 -fill white \
            -annotate +0+50 "FREE Chrome Extension" \
            thumbnail.jpg
    
    echo "✅ Thumbnail created: thumbnail.jpg"
else
    echo "⚠️ ImageMagick not found. Create thumbnail manually using provided HTML template."
fi
EOF

chmod +x "${RECORDING_DIR}/create-thumbnail.sh"

echo ""
echo "🎉 Automated video creation setup complete!"
echo ""
echo "📂 Created files in '${RECORDING_DIR}':"
echo "   ├── record-scenes.sh          (Automated screen recording)"
echo "   ├── compile-video.sh          (FFmpeg video compilation)"
echo "   ├── voiceover-script.txt      (Recording script)"
echo "   ├── setup-instructions.md     (Manual setup guide)"
echo "   └── create-thumbnail.sh       (Thumbnail generation)"
echo ""
echo "🚀 Next steps:"
echo "1. cd ${RECORDING_DIR}"
echo "2. Record voiceover: voiceover.wav"
echo "3. Run: ./record-scenes.sh"
echo "4. Run: ./compile-video.sh"
echo "5. Upload to YouTube with generated thumbnail"
echo ""
echo "💡 Alternative: Use the HTML video generator for a fully automated approach"
