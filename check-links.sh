#!/bin/bash

# Link verification script for Personal Recruiter documentation
cd "/Users/mubashirkoul/Library/Mobile Documents/com~apple~CloudDocs/Development/PersonalRecruiter"

echo "🔍 Checking all documentation links..."
echo "=================================="

# Function to check if file exists
check_file() {
    local file_path="$1"
    local source_file="$2"
    
    if [[ -f "$file_path" ]]; then
        echo "✅ $file_path (referenced in $source_file)"
    else
        echo "❌ MISSING: $file_path (referenced in $source_file)"
    fi
}

echo ""
echo "📄 Checking README.md links..."
echo "------------------------------"

# Links from README.md
check_file "docs/index.md" "README.md"
check_file "docs/setup/QUICK_START.md" "README.md"
check_file "docs/development/CONTRIBUTING.md" "README.md"
check_file "docs/publishing/PUBLISHING_GUIDE.md" "README.md"
check_file "docs/legal/PRIVACY_POLICY.md" "README.md"

echo ""
echo "📚 Checking docs/index.md links..."
echo "-----------------------------------"

# Setup section links
check_file "docs/setup/QUICK_START.md" "docs/index.md"
check_file "docs/setup/OAUTH_SETUP.md" "docs/index.md"
check_file "docs/setup/GOOGLE_OAUTH_SETUP.md" "docs/index.md"
check_file "docs/setup/COMPLETE_OAUTH_SETUP.md" "docs/index.md"
check_file "docs/setup/GITHUB_SETUP.md" "docs/index.md"

# Development section links
check_file "docs/development/CONTRIBUTING.md" "docs/index.md"
check_file "docs/development/TESTING_COMPLIANCE_CHECKLIST.md" "docs/index.md"
check_file "docs/development/CHANGELOG.md" "docs/index.md"
check_file "docs/development/PROJECT_COMPLETE.md" "docs/index.md"

# Publishing section links
check_file "docs/publishing/PUBLISHING_GUIDE.md" "docs/index.md"
check_file "docs/publishing/COMPLETE_COMPLIANCE_AUDIT.md" "docs/index.md"
check_file "docs/publishing/COMPLIANCE_CHECKLIST.md" "docs/index.md"
check_file "docs/publishing/KEYWORD_SPAM_FIX.md" "docs/index.md"

# Troubleshooting section links
check_file "docs/troubleshooting/AUTH_DEBUG.md" "docs/index.md"
check_file "docs/troubleshooting/AUTH_FIX.md" "docs/index.md"
check_file "docs/troubleshooting/AUTH_DISPLAY_FIX.md" "docs/index.md"
check_file "docs/troubleshooting/AI_MAGIC_FIX.md" "docs/index.md"
check_file "docs/troubleshooting/PERFORMANCE_FIX.md" "docs/index.md"
check_file "docs/troubleshooting/OAUTH_FIX_GUIDE.md" "docs/index.md"
check_file "docs/troubleshooting/MANUAL_AUTH_TEST.md" "docs/index.md"
check_file "docs/troubleshooting/TESTING_COMPLETE.md" "docs/index.md"

# Legal section links
check_file "docs/legal/PRIVACY_POLICY.md" "docs/index.md"
check_file "docs/legal/PRIVACY_POLICY_COMPLETE.md" "docs/index.md"

# Assets section links
check_file "docs/assets/screenshots/SCREENSHOT_CONVERSION_COMPLETE.md" "docs/index.md"

echo ""
echo "🔗 Checking for any other markdown files..."
echo "--------------------------------------------"

# List all actual markdown files
echo "All markdown files found:"
find docs/ -name "*.md" | sort

echo ""
echo "📊 Summary"
echo "----------"
echo "Link verification complete!"
