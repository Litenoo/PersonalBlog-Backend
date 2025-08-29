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

    // posts management endpoints
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

    router.get("/posts/:id", async (req, res) => {
        const postId = parseInt(req.params.id, 10);

        if (!postId || isNaN(postId)) {
            res.status(400).json({ message: "Invalid post ID" });
            return;
        }

        try {
            const result = await databaseService.getPostById({ postId, withContent: true });

            if (!result.post || result.errorCode == "not_found") {
                res.status(404).json({ message: "Post not found" });
                return;
            }
            res.status(200).json(result.post);
            return;
        } catch (err) {
            logger.error("Error in /posts/:id route:", err);
            res.status(500).json({ message: "Critical error fetching post" });
            return;
        }
    });


    router.delete("/posts/:id", async (req, res) => {
        const postId = parseInt(req.params.id, 10);

        if (!postId || isNaN(postId)) {
            res.status(400).json({ message: "Invalid post ID" });
            return;
        }

        try {
            const result = await databaseService.deletePost({ postId });

            if (!result.post || result.errorCode === "not_found") {
                res.status(404).json({ message: "Post not found" });
                return;
            }
            res.status(200).json(result.post);
            return;
        } catch (err) {
            logger.error("Error in /posts/:id route:", err);
            res.status(500).json({ message: "Critical error while removing post" });
            return;
        }
    });

    router.put("/posts/:id", async (req, res) => {
        const postId = parseInt(req.params.id, 10);
        const { title, content, tags, published } = req.body;

        if (!postId || isNaN(postId)) {
            res.status(400).json({ message: "Invalid post ID" });
            return;
        }

        try {
            const result = await databaseService.editPost({ postId, title, content, tags, published });

            if (result.errorCode) {
                if (result.errorCode === "not_found") {
                    res.status(404).json({ message: "Post not found" });
                    return;
                }
                if (result.errorCode === "critical_error") {
                    res.status(500).json({ message: "Critical error updating post" });
                    return;
                }
                res.status(400).json({ message: "Error updating post" });
                return;
            }

            res.status(200).json(result.post);
            return;
        } catch (err) {
            logger.error("Error in /posts/:id route:", err);
            res.status(500);
            res.json({ message: "Critical error updating post" });
            return;
        }
    });

    //user management endpoints 

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

    router.post("/tags", async (req, res) => {
        const { title } = req.body;

        if (!title || typeof title !== "string" || title.trim() === "") {
            res.status(400).json({ message: "Invalid or missing tag title" });
            return;
        }

        try {
            const result = await databaseService.insertTag({ title });

            if (result.errorCode) {
                if (result.errorCode === "tag_exists") {
                    res.status(409).json({ message: "Tag already exists" });
                    return;
                }
                if (result.errorCode === "critical_error") {
                    res.status(500).json({ message: "Critical error inserting tag" });
                    return;
                }
                res.status(400).json({ message: "Error inserting tag" });
                return;
            }

            res.status(201).json(result.tag);
            return;
        } catch (err) {
            logger.error("Error in /tags route:", err);
            res.status(500).json({ message: "Critical error inserting tag" });
            return;
        }
    });

    router.delete("/tags/:id", async (req, res) => {
        const tagId = parseInt(req.params.id, 10);

        if (!tagId || isNaN(tagId)) {
            res.status(400).json({ message: "Invalid or missing tag ID" });
            return;
        }

        try {
            const result = await databaseService.deleteTag({ tagId });

            if (result.errorCode) {
                if (result.errorCode === "not_found") {
                    res.status(404).json({ message: "Tag not found" });
                    return;
                }
                if (result.errorCode === "critical_error") {
                    res.status(500).json({ message: "Critical error deleting tag" });
                    return;
                }
                res.status(400).json({ message: "Error deleting tag" });
                return;
            }

            res.status(200).json(result.tag);
            return;
        } catch (err) {
            logger.error("Error in /tags/:id route:", err);
            res.status(500).json({ message: "Critical error deleting tag" });
            return;
        }
    });

    //multiSearch endpoint
    // Accepts keyword and optional tagId in the request body
    // Returns posts and tags matching the criteria
    // If keyword is not provided, returns all posts (optionally filtered by tagId) dev AT LEAST SHOULD
    // IMPORTANT ^ 

    router.get("/search", async (req, res) => {
        const { keyword, tagId } = req.body;

        try {
            const result = await databaseService.multiSearch({ keyword, tagId });

            if (result.errorCode == "critical_error") {
                res.status(500).json({ message: "Critical error searching" });
                return;
            }

            res.status(200).json({
                posts: result.searchResult?.posts || [],
                tags: result.searchResult?.tags || [],
            });

            return;
        } catch (err) {
            logger.error("Error in /search route:", err);
            res.status(500).json({ message: "Critical error searching" });
            return;
        }
    });

    return router;
}