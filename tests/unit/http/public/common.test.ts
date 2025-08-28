import { describe, expect, test, vi, beforeEach } from 'vitest';
import App from "../../../../src/app";
import request from "supertest";


describe("GET /ping", () => {
    const httpService = new App(4040).getHttpService();

    test("Should return 200 and Pong message", async () => {
        const response = await request(httpService).get("/ping");

        expect(response.status).toBe(200);
        expect(response.body).toEqual({ message: "Pong!" });
    });
});
