import express from 'express';

const router = express.Router();

router.get('/', (req, res) => {
    res.json({ message: 'Public routes accessible without authentication' });
});

export default router;