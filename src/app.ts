import DatabaseService, { databaseService } from "./services/database.service";
import HttpService, { httpService } from "./services/http.service";

export default class App {
    private dbService: DatabaseService;
    private httpService: HttpService;

    constructor(port: number) {
        this.dbService = databaseService; // It is constructed in the service file for simplicity
        this.httpService = httpService;
    }
}