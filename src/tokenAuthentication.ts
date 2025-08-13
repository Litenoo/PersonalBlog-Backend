import jwt from "jsonwebtoken";
import { randomUUID } from "crypto";
import { Request, Response, NextFunction } from 'express';

// Extend Express Request interface to include 'user', which is used to store user's data
declare global {
    namespace Express {
        interface Request {
            user?: any;
        }
    }
}

export function createJWTToken(userId: number, username: string, isAdmin: boolean = false) {
    const secretKey = process.env.JWT_SECRET;
    if (!secretKey) {
        throw new Error("JWT_SECRET environment variable is not defined");
    }
    const payload = {
        userId,
        username,
        isAdmin,
        tokenId: randomUUID(),
    }
    const token = jwt.sign(payload, secretKey, { expiresIn: "15m" })
    return token;
}

export function authJWTToken(req: Request, res: Response, next: NextFunction) {
    const token = req.headers.authorization?.split(' ')[1];

    const jwtSecret = process.env.JWT_SECRET;

    try {
        if (!jwtSecret) {
            console.error("JWT_SECRET environment variable is not defined");
            return res.status(500).json("Internal server error");
        }
        if (!token) {
            return res.status(401).json("Token required");
        }
        const decoded = jwt.verify(token || '', jwtSecret);

        req.user = decoded;

        next();
    } catch (err) {
        console.error("Error in authJWTToken:", err);
        if (typeof err === 'object' && err !== null && 'name' in err) {
            if ((err as { name: string }).name === 'TokenExpiredError') {
                return res.status(401).json("Token expired");
            }
            if ((err as { name: string }).name === 'JsonWebTokenError') {
                return res.status(403).json("Invalid token");
            }
        }
        return res.status(401).json("Unauthorized");
    }
}