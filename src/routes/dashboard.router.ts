import express from 'express';
import authGuard from './router.guard';

// This file is meant to contain routes that are going to be protected by the JWT token authentication
// It is basically going to contain the dashboard routes needed to manage the service,
// such as manage posts, users and stuff like that

const router = express.Router();

router.use(authGuard);

router.get('/overview', (req, res) => {
    res.json({ message: 'Dashboard overview' });
});

router.get("/postsManagement", (req, res) => {
    const posts = null;
    res.json({ posts: posts });
});

export default router;