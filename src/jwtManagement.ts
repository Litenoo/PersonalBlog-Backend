import jwt from "jsonwebtoken";
import { randomUUID } from "crypto";

// Extend Express Request interface to include user, which is used to store user's data
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
    const token = jwt.sign(payload, secretKey, { expiresIn: "15m" });
    return token;
}