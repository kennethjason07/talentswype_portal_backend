# Email Automation Test Suite

This directory contains comprehensive tests for the TalentSwype email automation system.

## Test Files

### 1. `emailTemplates.test.js`

Tests all email template rendering functions:

- **Candidate Templates**: Welcome, Day 3 Application Push, Day 7 Engagement
- **HR Templates**: Welcome, Day 3 Job Posting Tips, Day 7 Best Practices
- Validates dynamic content rendering
- Ensures personalization tokens work correctly

### 2. `scheduler.test.js`

Tests the cron job scheduler logic:

- Day 3 and Day 7 trigger conditions
- Email filtering based on user activity
- Unsubscribe status checking
- Email logging to prevent duplicates
- Timezone handling (10 AM IST)

### 3. `userRegistration.test.js`

Tests the user registration email flow:

- Welcome email sending on signup
- Unsubscribe token generation
- Email automation log tracking
- Unsubscribe functionality

## Running Tests

```bash
# Run all tests
npm test

# Run specific test file
npm test -- emailTemplates.test.js

# Run with coverage
npm test -- --coverage

# Run in watch mode
npm test -- --watch
```

## Test Coverage Goals

- **Email Templates**: 100% (all template functions)
- **Scheduler Logic**: 80%+ (core automation logic)
- **User Registration**: 90%+ (critical path)

## Mocking Strategy

We mock external dependencies to isolate unit tests:

- `sendEmail` - Email sending service
- `userModel` - Database queries
- `jobModel` - Job queries
- `jobApplicationModel` - Application queries

## Notes

- Tests use Jest with ESM support
- All tests are isolated and can run in parallel
- Database operations are mocked to avoid external dependencies
- Tests validate both success and failure scenarios
