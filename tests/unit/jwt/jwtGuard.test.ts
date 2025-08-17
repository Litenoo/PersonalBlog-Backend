import { describe, expect, test, vi, beforeEach } from 'vitest';
import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

import authGuard from "../../../src/routes/router.guard";

const defaultEnv = process.env;

describe("Route guard", () => {

    let req: Partial<Request>;
    let res: Partial<Response>;
    let next: NextFunction;

    beforeEach(() => {
        process.env.JWT_SECRET = 'test_secret';

        req = { headers: {} }
        res = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn(),
        };
        next = vi.fn();
    });

    test("Should return 401 if the auth header is missing", () => {
        authGuard(req as Request, res as Response, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ error: "Unauthorized" });
        expect(next).not.toHaveBeenCalled();
    });

    test("Should return 401 if token is missing", () => {
        req.headers = { authorization: "Bearer" };

        authGuard(req as Request, res as Response, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ error: "Missing token" });
        expect(next).not.toHaveBeenCalled();
    });

    test("Should return 401 if token is invalid", () => {
        req.headers = { authorization: "Bearer invalid_token" }

        authGuard(req as Request, res as Response, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ error: "Invalid or expired token" });
        expect(next).not.toHaveBeenCalled();

    });

    test("Should call the next function and attach decoded token if token is valid", () => {
        const payload = {
            userId: 10,
            username: "SomeUsername",
            isAdmin: true,
            tokenId: 2137,
        }
        const token = jwt.sign(payload, process.env.JWT_SECRET as string);
        req.headers = { authorization: `Bearer ${token}` }

        authGuard(req as Request, res as Response, next);

        expect(next).toHaveBeenCalled();
        expect((req as any).user).toMatchObject(payload);
    });

    test("Should return 401 if the token is expired", () => {
        const payload = {
            userId: 10,
            username: "SomeUsername",
            isAdmin: true,
            tokenId: 2137,
        }
        const token = jwt.sign(payload, process.env.JWT_SECRET as string, { expiresIn: -1 });
        req.headers = { authorization: `Bearer ${token}` }

        authGuard(req as Request, res as Response, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ error: "Invalid or expired token" });
        expect(next).not.toHaveBeenCalled();
    });
});