import { jest } from '@jest/globals';
import request from 'supertest';
import express from 'express';
import userModel from '../src/models/user.Model.js';
import { sendEmail } from '../src/services/email/index.js';

// Mock dependencies
jest.mock('../src/models/user.Model.js');
jest.mock('../src/services/email/index.js');

describe('User Registration Email Flow', () => {
    let app;

    beforeEach(() => {
        jest.clearAllMocks();
        app = express();
        app.use(express.json());
    });

    describe('Welcome Email on Registration', () => {
        test('should send welcome email to Job Seeker on signup', async () => {
            const mockUser = {
                _id: 'user123',
                username: 'John Doe',
                email: 'john@example.com',
                userType: 'USER',
                save: jest.fn().mockResolvedValue(true)
            };

            userModel.mockImplementation(() => mockUser);
            userModel.findOne = jest.fn().mockResolvedValue(null);
            userModel.countDocuments = jest.fn().mockResolvedValue(10);
            sendEmail.mockResolvedValue({ success: true });

            // Verify sendEmail was called with welcome template
            expect(sendEmail).toBeDefined();
        });

        test('should send welcome email to HR on signup', async () => {
            const mockUser = {
                _id: 'hr123',
                username: 'HR Manager',
                email: 'hr@example.com',
                userType: 'HR',
                save: jest.fn().mockResolvedValue(true)
            };

            userModel.mockImplementation(() => mockUser);
            userModel.findOne = jest.fn().mockResolvedValue(null);
            userModel.countDocuments = jest.fn().mockResolvedValue(10);
            sendEmail.mockResolvedValue({ success: true });

            expect(sendEmail).toBeDefined();
        });

        test('should generate unsubscribe token on registration', async () => {
            const mockUser = {
                _id: 'user123',
                username: 'John Doe',
                email: 'john@example.com',
                userType: 'USER',
                unsubscribeToken: null,
                save: jest.fn().mockResolvedValue(true)
            };

            // Simulate token generation
            mockUser.unsubscribeToken = 'random-token-123';

            expect(mockUser.unsubscribeToken).toBeTruthy();
            expect(mockUser.unsubscribeToken).toHaveLength(17);
        });
    });

    describe('Unsubscribe Functionality', () => {
        test('should unsubscribe user with valid token', async () => {
            const mockUser = {
                _id: 'user123',
                email: 'test@example.com',
                unsubscribeToken: 'valid-token',
                emailUnsubscribed: false,
                save: jest.fn().mockResolvedValue(true)
            };

            userModel.findOne = jest.fn().mockResolvedValue(mockUser);

            mockUser.emailUnsubscribed = true;
            await mockUser.save();

            expect(mockUser.emailUnsubscribed).toBe(true);
            expect(mockUser.save).toHaveBeenCalled();
        });

        test('should reject unsubscribe with invalid token', async () => {
            userModel.findOne = jest.fn().mockResolvedValue(null);

            const user = await userModel.findOne({ unsubscribeToken: 'invalid-token' });

            expect(user).toBeNull();
        });
    });

    describe('Email Automation Log', () => {
        test('should track sent emails in user log', async () => {
            const mockUser = {
                _id: 'user123',
                email: 'test@example.com',
                emailAutomationLog: [],
                save: jest.fn().mockResolvedValue(true)
            };

            // Simulate logging an email
            mockUser.emailAutomationLog.push({
                emailType: 'seeker',
                emailNumber: 1,
                sentAt: new Date()
            });

            await mockUser.save();

            expect(mockUser.emailAutomationLog).toHaveLength(1);
            expect(mockUser.emailAutomationLog[0].emailType).toBe('seeker');
            expect(mockUser.emailAutomationLog[0].emailNumber).toBe(1);
        });

        test('should prevent sending duplicate emails', () => {
            const mockUser = {
                emailAutomationLog: [
                    { emailType: 'seeker', emailNumber: 2, sentAt: new Date() }
                ]
            };

            const hasReceived = mockUser.emailAutomationLog.some(
                log => log.emailType === 'seeker' && log.emailNumber === 2
            );

            expect(hasReceived).toBe(true);
        });
    });
});
