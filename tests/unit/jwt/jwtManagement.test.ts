import { describe, expect, test, vi, beforeEach } from 'vitest';
import jwt from 'jsonwebtoken';

import { createJWTToken } from '../../../src/jwtManagement';

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

/**
 * This file contains unit tests for the functions inside tokenAuthentication.ts file.
 * The tests are designed to test the methods of that class exported by that file.
 */

