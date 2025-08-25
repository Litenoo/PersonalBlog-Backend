import express from 'express';

import publicRouter from '../routes/public.router';
import dashboardRouter from '../routes/dashboard.router';

import logger from '../utils/logger';

export default class HttpService {
    private app: express.Application;

    constructor(app: express.Application) {
        this.app = express();
        this.app.use(express.json());
        this.app.use('/public', publicRouter);
        this.app.use('/dashboard', dashboardRouter);

        this.app.get('/ping', (req, res) => {
            res.json({ message: 'Pong!' });
        });
    }

    public start(port: number): void {
        this.app.listen(port, () => {
            logger.info(`HTTP Service is running on port ${port}`);
        });
    }
}

export const httpService = new HttpService(express());
logger.info('-> HTTP Service initialized'); //Add development/production mode log