// tests/unit/manifest.test.js - Test your actual manifest.json

describe('Manifest Validation', () => {
  let manifest;

  beforeAll(() => {
    manifest = require('../../manifest.json');
  });

  test('should be valid Manifest V3', () => {
    expect(manifest.manifest_version).toBe(3);
  });

  test('should have required fields', () => {
    expect(manifest.name).toBeDefined();
    expect(manifest.version).toBeDefined();
    expect(manifest.description).toBeDefined();
  });

  test('should have proper Chrome Web Store compliance', () => {
    // No excessive permissions
    expect(manifest.permissions).not.toContain('<all_urls>');
    
    // Specific host permissions only
    if (manifest.host_permissions) {
      manifest.host_permissions.forEach(permission => {
        expect(permission).not.toBe('<all_urls>');
      });
    }
  });

  test('should have identity permission for OAuth', () => {
    expect(manifest.permissions).toContain('identity');
  });

  test('should have storage permission', () => {
    expect(manifest.permissions).toContain('storage');
  });

  test('should have valid background script configuration', () => {
    expect(manifest.background).toBeDefined();
    expect(manifest.background.service_worker).toBeDefined();
  });

  test('should have content scripts configured', () => {
    expect(manifest.content_scripts).toBeDefined();
    expect(Array.isArray(manifest.content_scripts)).toBe(true);
    expect(manifest.content_scripts.length).toBeGreaterThan(0);
  });

  test('should have action configuration', () => {
    expect(manifest.action).toBeDefined();
    expect(manifest.action.default_title).toBeDefined();
  });

  test('should have side panel configuration', () => {
    expect(manifest.side_panel).toBeDefined();
    expect(manifest.side_panel.default_path).toBeDefined();
  });
});
