import jwt from "jsonwebtoken";
import { randomUUID } from "crypto";
import { Request, Response, NextFunction } from 'express';

export default class AuthService {
    private secretKey: string;

    constructor() {
        this.secretKey = String(process.env.JWT_SECRET);
    }

    async createAccessToken(userId: number, username: string, isAdmin: boolean = false) {
        const payload = {
            userId,
            username,
            isAdmin,
            tokenId: randomUUID(),
        }
        const token = jwt.sign(payload, this.secretKey, { expiresIn: "15m" })
        return token;
    }

    async authAccessToken(req: Request, res: Response, next: NextFunction) {
        const auth = req.headers.authorization;
        if (!auth?.startsWith('Bearer ')) return res.sendStatus(401);
        const token = auth.split(' ')[1];
        try {
            const payload = jwt.verify(token, this.secretKey);
            (req as any).user = payload;
            next();
        } catch (error) {
            console.error("JWT verification failed:", error);
            return false;
        }
    }
}