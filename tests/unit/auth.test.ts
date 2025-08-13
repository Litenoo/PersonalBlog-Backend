import { describe, expect, test, vi, beforeEach } from 'vitest';
import { PrismaClient } from '@prisma/client/extension';
import jwt from 'jsonwebtoken';

import { createJWTToken, authJWTToken } from '../../src/tokenAuthentication';

const DEFAULT_ENV = process.env;

describe(`createJWTToken`, () => {

    beforeEach(() => {
        process.env = { ...DEFAULT_ENV };
        process.env.JWT_SECRET = "test_secret";
    });

    test(`Should create a JWT token with the correct payload`, () => {
        const userId = 1;
        const username = 'testuser';
        const isAdmin = true;

        const token = createJWTToken(userId, username, isAdmin);
        const decoded = jwt.verify(token, process.env.JWT_SECRET || '');

        expect(decoded).toMatchObject({
            userId,
            username,
            isAdmin,
            tokenId: expect.any(String),
        });
    });
});

describe(`authJWTToken`, () => {
    beforeEach(() => {
        process.env = { ...DEFAULT_ENV };
        process.env.JWT_SECRET = "test_secret";
    });

    const getMockResponse = () => {
        const res = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn(),
        }
        return res;
    }

    test('Should call next() for valid token', () => {
        const token = jwt.sign({ userId: 1, username: 'test' }, process.env.JWT_SECRET || '', { expiresIn: '1h' });
        const req = {
            headers: {
                authorization: `Bearer ${token}`,
            },
        } as any;

        const res = getMockResponse();
        const next = vi.fn();

        authJWTToken(req, res as any, next);

        expect(req.user).toBeDefined();
        expect(req.user.userId).toBe(1);
        expect(next).toHaveBeenCalledOnce();
    });


    test('Should return 401 if token is missing', () => {
        const req = {
            headers: {},
        } as any;

        const res = getMockResponse();
        const next = vi.fn();

        authJWTToken(req, res as any, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(next).not.toHaveBeenCalled();
    });

    test('should return 403 for invalid token', () => {
        const req = {
            headers: {
                authorization: 'Bearer invalid.token.here',
            },
        } as any;

        const res = getMockResponse();
        const next = vi.fn();

        authJWTToken(req, res as any, next);

        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.json).toHaveBeenCalledWith("Invalid token");
        expect(next).not.toHaveBeenCalled();
    });

    test('should throw error if JWT_SECRET is undefined', () => {
        delete process.env.JWT_SECRET;

        const req = {
            headers: {
                authorization: 'Bearer something',
            },
        } as any;

        const res = getMockResponse();
        const next = vi.fn();

        authJWTToken(req, res as any, next)

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith("Internal server error");
    });
});

/**
 * This file contains unit tests for the functions inside tokenAuthentication.ts file.
 * The tests are designed to test the methods of that class exported by that file.
 */

