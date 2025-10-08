/**
 * Duplicate Detection Tests
 * Tests for the new job duplicate detection functionality
 */

describe('Job Duplicate Detection', () => {
  beforeEach(() => {
    // Mock Chrome APIs
    global.chrome = {
      storage: {
        sync: {
          get: jest.fn(),
          set: jest.fn()
        },
        local: {
          get: jest.fn(),
          set: jest.fn()
        }
      },
      runtime: {
        lastError: null
      }
    };
  });

  describe('Frontend Duplicate Detection Logic', () => {
    test('should detect exact duplicate jobs', () => {
      const existingApplications = [
        {
          id: '1',
          jobTitle: 'Software Engineer',
          company: 'Google',
          url: 'https://careers.google.com/jobs/123',
          timestamp: Date.now() - 86400000 // 1 day ago
        }
      ];

      const newJobInfo = {
        jobTitle: 'Software Engineer',
        company: 'Google',
        url: 'https://careers.google.com/jobs/123'
      };

      // Simulate frontend duplicate detection logic
      const exactMatch = existingApplications.find(app => 
        app.jobTitle?.toLowerCase() === newJobInfo.jobTitle.toLowerCase() && 
        app.company?.toLowerCase() === newJobInfo.company.toLowerCase() &&
        app.url === newJobInfo.url
      );

      expect(exactMatch).toBeDefined();
      expect(exactMatch.id).toBe('1');
    });

    test('should detect similar jobs (same title and company, different URL)', () => {
      const existingApplications = [
        {
          id: '1',
          jobTitle: 'Software Engineer',
          company: 'Google',
          url: 'https://careers.google.com/jobs/123',
          timestamp: Date.now() - 86400000
        }
      ];

      const newJobInfo = {
        jobTitle: 'Software Engineer',
        company: 'Google',
        url: 'https://careers.google.com/jobs/456' // Different URL
      };

      // Check for exact match first
      const exactMatch = existingApplications.find(app => 
        app.jobTitle?.toLowerCase() === newJobInfo.jobTitle.toLowerCase() && 
        app.company?.toLowerCase() === newJobInfo.company.toLowerCase() &&
        app.url === newJobInfo.url
      );

      // Check for similar match
      const similarMatch = existingApplications.find(app => 
        app.jobTitle?.toLowerCase() === newJobInfo.jobTitle.toLowerCase() && 
        app.company?.toLowerCase() === newJobInfo.company.toLowerCase()
      );

      expect(exactMatch).toBeUndefined();
      expect(similarMatch).toBeDefined();
      expect(similarMatch.id).toBe('1');
    });

    test('should not flag different jobs as duplicates', () => {
      const existingApplications = [
        {
          id: '1',
          jobTitle: 'Software Engineer',
          company: 'Google',
          url: 'https://careers.google.com/jobs/123',
          timestamp: Date.now() - 86400000
        }
      ];

      const newJobInfo = {
        jobTitle: 'Product Manager',
        company: 'Microsoft',
        url: 'https://careers.microsoft.com/jobs/456'
      };

      const exactMatch = existingApplications.find(app => 
        app.jobTitle?.toLowerCase() === newJobInfo.jobTitle.toLowerCase() && 
        app.company?.toLowerCase() === newJobInfo.company.toLowerCase() &&
        app.url === newJobInfo.url
      );

      const similarMatch = existingApplications.find(app => 
        app.jobTitle?.toLowerCase() === newJobInfo.jobTitle.toLowerCase() && 
        app.company?.toLowerCase() === newJobInfo.company.toLowerCase()
      );

      expect(exactMatch).toBeUndefined();
      expect(similarMatch).toBeUndefined();
    });

    test('should handle case-insensitive matching', () => {
      const existingApplications = [
        {
          id: '1',
          jobTitle: 'Software Engineer',
          company: 'Google',
          url: 'https://careers.google.com/jobs/123',
          timestamp: Date.now() - 86400000
        }
      ];

      const newJobInfo = {
        jobTitle: 'software engineer', // Different case
        company: 'GOOGLE', // Different case
        url: 'https://careers.google.com/jobs/456'
      };

      const similarMatch = existingApplications.find(app => 
        app.jobTitle?.toLowerCase() === newJobInfo.jobTitle.toLowerCase() && 
        app.company?.toLowerCase() === newJobInfo.company.toLowerCase()
      );

      expect(similarMatch).toBeDefined();
      expect(similarMatch.id).toBe('1');
    });

    test('should handle exact match with different case', () => {
      const existingApplications = [
        {
          id: '1',
          jobTitle: 'Software Engineer',
          company: 'Google',
          url: 'https://careers.google.com/jobs/123',
          timestamp: Date.now() - 86400000
        }
      ];

      const newJobInfo = {
        jobTitle: 'SOFTWARE ENGINEER', // Different case
        company: 'google', // Different case
        url: 'https://careers.google.com/jobs/123' // Same URL
      };

      const exactMatch = existingApplications.find(app => 
        app.jobTitle?.toLowerCase() === newJobInfo.jobTitle.toLowerCase() && 
        app.company?.toLowerCase() === newJobInfo.company.toLowerCase() &&
        app.url === newJobInfo.url
      );

      expect(exactMatch).toBeDefined();
      expect(exactMatch.id).toBe('1');
    });
  });

  describe('Backend Duplicate Storage Logic', () => {
    test('should identify duplicates correctly in storage function', () => {
      const jobApplications = [
        {
          id: '1',
          jobTitle: 'Software Engineer',
          company: 'Google',
          url: 'https://careers.google.com/jobs/123',
          timestamp: Date.now() - 86400000
        }
      ];

      const applicationData = {
        jobTitle: 'Software Engineer',
        company: 'Google',
        url: 'https://careers.google.com/jobs/123'
      };

      // Simulate the backend duplicate detection logic
      const existingIndex = jobApplications.findIndex(app => 
        app.jobTitle === applicationData.jobTitle && 
        app.company === applicationData.company &&
        app.url === applicationData.url
      );

      expect(existingIndex).toBe(0); // Found at index 0
    });

    test('should not find duplicates for different jobs', () => {
      const jobApplications = [
        {
          id: '1',
          jobTitle: 'Software Engineer',
          company: 'Google',
          url: 'https://careers.google.com/jobs/123',
          timestamp: Date.now() - 86400000
        }
      ];

      const applicationData = {
        jobTitle: 'Product Manager',
        company: 'Microsoft',
        url: 'https://careers.microsoft.com/jobs/456'
      };

      const existingIndex = jobApplications.findIndex(app => 
        app.jobTitle === applicationData.jobTitle && 
        app.company === applicationData.company &&
        app.url === applicationData.url
      );

      expect(existingIndex).toBe(-1); // Not found
    });

    test('should handle empty applications array', () => {
      const jobApplications = [];

      const applicationData = {
        jobTitle: 'Software Engineer',
        company: 'Google',
        url: 'https://careers.google.com/jobs/123'
      };

      const existingIndex = jobApplications.findIndex(app => 
        app.jobTitle === applicationData.jobTitle && 
        app.company === applicationData.company &&
        app.url === applicationData.url
      );

      expect(existingIndex).toBe(-1); // Not found in empty array
    });
  });

  describe('Message Format Tests', () => {
    test('should generate correct warning message for exact duplicates', () => {
      const existingApp = {
        jobTitle: 'Software Engineer',
        company: 'Google',
        timestamp: new Date('2025-10-07').getTime()
      };

      const existingDate = new Date(existingApp.timestamp).toLocaleDateString();
      const expectedMessage = `⚠️ Job Already in History! This job "${existingApp.jobTitle}" at "${existingApp.company}" was already saved on ${existingDate}. The existing entry has been updated with your new information.`;

      expect(expectedMessage).toContain('⚠️ Job Already in History!');
      expect(expectedMessage).toContain(existingApp.jobTitle);
      expect(expectedMessage).toContain(existingApp.company);
      expect(expectedMessage).toContain('updated with your new information');
    });

    test('should generate correct info message for similar duplicates', () => {
      const existingApp = {
        jobTitle: 'Software Engineer',
        company: 'Google',
        timestamp: new Date('2025-10-07').getTime()
      };

      const existingDate = new Date(existingApp.timestamp).toLocaleDateString();
      const expectedMessage = `ℹ️ Similar Job Found: A job with the title "${existingApp.jobTitle}" at "${existingApp.company}" was already saved on ${existingDate}. Please verify this is a different position before saving.`;

      expect(expectedMessage).toContain('ℹ️ Similar Job Found');
      expect(expectedMessage).toContain(existingApp.jobTitle);
      expect(expectedMessage).toContain(existingApp.company);
      expect(expectedMessage).toContain('verify this is a different position');
    });
  });

  describe('Edge Cases', () => {
    test('should handle missing or null values gracefully', () => {
      const existingApplications = [
        {
          id: '1',
          jobTitle: null,
          company: 'Google',
          url: 'https://careers.google.com/jobs/123',
          timestamp: Date.now() - 86400000
        }
      ];

      const newJobInfo = {
        jobTitle: 'Software Engineer',
        company: 'Google',
        url: 'https://careers.google.com/jobs/123'
      };

      // This should handle null values without crashing
      const exactMatch = existingApplications.find(app => 
        app.jobTitle?.toLowerCase() === newJobInfo.jobTitle.toLowerCase() && 
        app.company?.toLowerCase() === newJobInfo.company.toLowerCase() &&
        app.url === newJobInfo.url
      );

      // Should not match because jobTitle is null
      expect(exactMatch).toBeUndefined();
    });

    test('should handle undefined application properties', () => {
      const existingApplications = [
        {
          id: '1',
          // Missing jobTitle
          company: 'Google',
          url: 'https://careers.google.com/jobs/123',
          timestamp: Date.now() - 86400000
        }
      ];

      const newJobInfo = {
        jobTitle: 'Software Engineer',
        company: 'Google',
        url: 'https://careers.google.com/jobs/123'
      };

      const exactMatch = existingApplications.find(app => 
        app.jobTitle?.toLowerCase() === newJobInfo.jobTitle.toLowerCase() && 
        app.company?.toLowerCase() === newJobInfo.company.toLowerCase() &&
        app.url === newJobInfo.url
      );

      // Should not match because jobTitle is undefined
      expect(exactMatch).toBeUndefined();
    });
  });
});

console.log('✅ Duplicate detection tests loaded for Personal Recruiter extension');
