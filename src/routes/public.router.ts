import express from 'express';

import DatabaseService from '../services/database.service';

export default function createPublicRouter(databaseService?: DatabaseService) {
    const router = express.Router();

    router.get('/', (req, res) => {
        res.json({ message: 'Public routes accessible without authentication' });
    });

    return router;
}