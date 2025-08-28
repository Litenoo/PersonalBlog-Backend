import DatabaseService, { databaseService } from "./services/database.service";
import HttpService, { httpService } from "./services/http.service";
import express from "express";

//all of the services are initialized in their definition files
//for example DatabaseService is a class and the databaseService is an instance of that class

export default class App {
    private dbService: DatabaseService;
    private httpService: HttpService;

    constructor(port: number) {
        this.dbService = databaseService;
        this.httpService = httpService;
        this.httpService.start(port);
    }

    getHttpService(): express.Application {
        return this.httpService.getApp();
    }
}