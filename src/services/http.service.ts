import express from 'express';

import publicRouter from '../routes/public.router';
import dashboardRouter from '../routes/dashboard.router';

export default class HttpService {
    private app: express.Application;

    constructor(app: express.Application) {
        this.app = express();
        app.use(express.json());
        app.use('/public', publicRouter);
        app.use('/dashboard', dashboardRouter);
    }
}

export const httpService = new HttpService(express());