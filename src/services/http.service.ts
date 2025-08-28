import express from 'express';

import publicRouter from '../routes/public.router';
import dashboardRouter from '../routes/dashboard.router';
import { databaseService } from './database.service';

import logger from '../utils/logger';

export default class HttpService {
    private app: express.Application;

    constructor(app: express.Application) {
        this.app = app;
        this.app.use(express.json());

        this.app.use('/public', publicRouter(databaseService));
        this.app.use('/dashboard', dashboardRouter(databaseService, true));

        this.app.get('/ping', (req, res) => {
            res.status(200);
            res.json({ message: 'Pong!' });
        });
    }

    public start(port: number): void {
        this.app.listen(port, () => {
            logger.info(`HTTP Service is running on port ${port}`);
        });
    }

    getApp(): express.Application {
        return this.app;
    }
}

export const httpService = new HttpService(express());
logger.info('-> HTTP Service initialized'); //Add development/production mode log