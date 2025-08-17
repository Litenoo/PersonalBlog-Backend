import jwt, { JwtPayload } from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

/**
 * The JWT tokens are also going to be checked by the Traefik proxy,
 * but this can be useful as second layer of security and later as a way to
 * handle user permissions, if it will be needed to do so.
 */

export default function authGuard(req: Request, res: Response, next: NextFunction): void {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        res.status(401).json({ error: "Unauthorized" });
        return;
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
        res.status(401).json({ error: "Missing token" });
        return;
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
        req.user = decoded as JwtPayload;
        next();
    } catch (err) {
        res.status(401).json({ error: "Invalid or expired token" });
        return;
    }
}