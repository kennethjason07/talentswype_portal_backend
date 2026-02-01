
import { welcomeEmailTemplate, firstApplicationPushTemplate, engagementTipsTemplate } from '../src/services/email/candidateTemplates.js';
import { welcomeHRTemplate, jobPostingTipsTemplate, hiringBestPracticesTemplate } from '../src/services/email/hrTemplates.js';

describe('Candidate Email Templates', () => {
    test('welcomeEmailTemplate should return email object with subject, text, and html', () => {
        const result = welcomeEmailTemplate('John');
        
        expect(result).toHaveProperty('subject');
        expect(result).toHaveProperty('text');
        expect(result).toHaveProperty('html');
        expect(result.subject).toContain('John');
        expect(result.html).toContain('John');
    });

    test('firstApplicationPushTemplate should include user name', () => {
        const result = firstApplicationPushTemplate('Jane');
        
        expect(result.subject).toContain('Jane');
        expect(result.html).toContain('Jane');
    });

    test('engagementTipsTemplate should include stats', () => {
        const result = engagementTipsTemplate('John', 5, 10);
        
        expect(result.html).toContain('5'); // applicationsCount
        expect(result.html).toContain('10'); // newMatchesCount
    });
});

describe('HR Email Templates', () => {
    test('welcomeHRTemplate should return complete email object', () => {
        const result = welcomeHRTemplate('Sarah');
        
        expect(result).toHaveProperty('subject');
        expect(result).toHaveProperty('text');
        expect(result).toHaveProperty('html');
        expect(result.subject).toContain('Sarah');
    });

    test('jobPostingTipsTemplate should show different content based on job status', () => {
        const withJob = jobPostingTipsTemplate('HR Partner', true);
        const withoutJob = jobPostingTipsTemplate('HR Partner', false);
        
        expect(withJob.html).toContain('screening');
        expect(withoutJob.html).toContain('Post Your First Job');
    });

    test('hiringBestPracticesTemplate should include activity stats', () => {
        const stats = { jobsPosted: 2, candidatesInReview: 5, profilesShortlisted: 1 };
        const result = hiringBestPracticesTemplate('HR Partner', true, stats);
        
        expect(result.html).toContain('2');
        expect(result.html).toContain('5');
        expect(result.html).toContain('1');
    });
});
