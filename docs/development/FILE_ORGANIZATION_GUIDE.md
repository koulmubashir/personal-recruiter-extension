# File Organization Guide

## Overview
This document describes the organized file structure of the Personal Recruiter Chrome Extension project.

## Directory Structure

### Root Level (Essential Files Only)
- `manifest.json` - Chrome extension manifest
- `background.js` - Service worker
- `content.js` - Content script
- `sidepanel.html` - Main interface
- `popup.html` - Quick actions
- `history.html` - Job history interface
- `package.json` - Main package configuration
- `package-lock.json` - Dependency lock file

### Organized Directories

#### `/tools/`
Development and maintenance tools organized by function:

- **`/tools/scripts/`** - Shell scripts for automation
  - `build-production-package.sh` - Production build script
  - `check-links.sh` - Link validation
  - `auto-generate-icons.sh` - Icon generation automation
  - `create-compliant-package.sh` - Compliance package creation
  - `package-for-store.sh` - Store package preparation

- **`/tools/utilities/`** - JavaScript utilities and tools
  - `create-icons.js` - Icon creation utility
  - `validate-manifest.js` - Manifest validation
  - `icon-generator.html` - Icon generation interface
  - `generate-png-icons.html` - PNG icon generation
  - `clear-data.html` - Data management utility
  - `storage-quota-fix.html` - Storage management

- **`/tools/debug/`** - Debug and testing tools
  - `debug-oauth.js` - OAuth debugging
  - `mock-auth.js` - Authentication mocking
  - `debug.html` - General debug interface
  - `auth-debug-tool.html` - Auth debugging interface
  - `auth-toggle.html` - Auth state toggle
  - `oauth-setup-helper.html` - OAuth setup assistance

#### `/tests/`
Testing infrastructure organized by type:

- **`/tests/html/`** - HTML test files
  - `ai-magic-test.html` - AI Magic feature testing
  - `chrome-test.html` - Chrome API testing
  - `extension-test.html` - Extension functionality
  - `job-id-test-page.html` - Job ID testing
  - `test-auth.html` - Authentication testing
  - `test-history.html` - History feature testing
  - `test-job-page.html` - Job page testing
  - `test-suite.html` - Complete test suite

- **`/tests/unit/`** - Jest unit tests
- **`/tests/compliance/`** - Store compliance tests
- **`/tests/performance/`** - Performance testing
- **`/tests/security/`** - Security testing
- **`/tests/quality/`** - Code quality tests

#### `/config/`
Configuration files:
- `package.test.json` - Test environment configuration

#### `/packages/`
Built packages and archives:
- All `.zip` extension packages
- Version-specific builds

#### `/docs/`
Documentation organized by category:
- `/docs/development/` - Development guides
- `/docs/features/` - Feature documentation
- `/docs/testing/` - Testing documentation
- `/docs/authentication/` - Auth documentation
- `/docs/fixes/` - Bug fix documentation
- `/docs/reports/` - Status reports
- `/docs/legal/` - Legal documents (LICENSE)
- `/docs/publishing/` - Publishing guides

## Reference Updates Made

### Package Configuration
- Updated `package.json` script references:
  - `create-icons` now points to `tools/utilities/create-icons.js`
- Updated `config/package.test.json` script references:
  - `validate:manifest` → `tools/utilities/validate-manifest.js`
  - `check:privacy` → `tools/utilities/privacy-check.js`
  - `audit:store` → `tools/utilities/store-readiness.js`
  - `package` → `tools/scripts/create-package.js`
  - `validate:package` → `tools/scripts/validate-package.js`

### Documentation References
- Updated `docs/development/CHROME_WEB_STORE_DEPLOYMENT_GUIDE.md`:
  - Build script reference: `./tools/scripts/build-production-package.sh`

## Benefits of Organization

1. **Clear Separation**: Core extension files remain in root for easy access
2. **Categorized Tools**: Development tools organized by function
3. **Logical Testing**: Test files grouped by type and purpose
4. **Maintainable**: Easy to locate and update specific functionality
5. **Version Control**: Cleaner git history with organized structure
6. **Documentation**: Related docs grouped by category

## Migration Notes

- All file references have been updated to reflect new locations
- Core extension functionality remains unchanged
- Build scripts and tools continue to work with updated paths
- No impact on Chrome extension operation or store submission

## Future Maintenance

When adding new files:
1. Place core extension files in root
2. Organize tools by function in `/tools/`
3. Group tests by type in `/tests/`
4. Categorize documentation in `/docs/`
5. Update any references in configuration files
6. Document changes in this guide
