import express from 'express';
import authGuard from './router.guard';
import logger from '../utils/logger';

import DatabaseService from '../services/database.service';

// This file is meant to contain function that creates router that is going to be protected by the JWT token authentication
// It is basically going to contain the dashboard routes needed to manage the service,
// such as manage posts, users and stuff like that
// There is an option of secureGuard that is meant to disable the authGuard ONLY for testing purposes

// Add the zod schema validation for the requests later


export default function createDashboardRouter(databaseService: DatabaseService, secureGuard: boolean = true) {

    const router = express.Router();

    //Secure guard middleware
    if (secureGuard && process.env.NODE_ENV !== "test") {
        router.use(authGuard);
    } else {
        console.warn(
            "Warning: Dashboard routes are not secured. This should only be used for testing purposes."
        );
    }

    router.post("/posts", async (req, res) => {
        const { title, content, tags, published } = req.body;

        try {
            const result = await databaseService.insertPost({ title, content, tags, published });

            if (result.errorCode) {
                if (result.errorCode === "critical_error") {
                    res.status(500).json({ message: "Critical error inserting post" });
                    return;
                }
                res.status(400).json({ message: "Error inserting post" });
                return;
            }

            res.status(201).json(result.post);
            return;
        } catch (err) {
            logger.error("Error in /posts route:", err);
            res.status(500);
            res.json({ message: "Critical error inserting post" });
            return;
        }

    });

    router.post("/user", async (req, res) => {
        //valid with zod later
        const { login, password } = req.body;

        try {
            const result = await databaseService.registerUser({ login, password });

            if (result.errorCode) {
                if (result.errorCode === "username_taken") {
                    res.status(409).json({ message: "Username already taken" });
                    return;
                }
                if (result.errorCode === "critical_error") {
                    res.status(500).json({ message: "Critical error inserting user" });
                    return;
                }
                res.status(400).json({ message: "Error inserting user" });
                return;
            }

            res.status(201).json(result.user);
            return;
        } catch (err) {
            logger.error("Error in /user route:", err);
            res.status(500);
            res.json({ message: "Critical error inserting user" });
            return;
        }
    });

    return router;
}