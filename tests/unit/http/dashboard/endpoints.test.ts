import { describe, expect, test, vi, beforeEach } from 'vitest';
import request from "supertest";
import express from "express";
import DashboardRouter from "../../../../src/routes/dashboard.router";
import DatabaseService from '../../../../src/services/database.service';

const databaseServiceMock = {
    insertPost: vi.fn().mockResolvedValue({ post: { id: 1, title: "Sample Post" } }),
} as unknown as DatabaseService;

let app: express.Application;

describe("POST /posts", () => {

    beforeEach(() => {
        vi.clearAllMocks();
        app = express()
        app.use(express.json());
        app.use("/dashboard", DashboardRouter(databaseServiceMock, false));
    });

    test("Should return 200 and inserted post", async () => {

        const post1 = {
            id: 1,
            title: "Sample Post",
            content: "This is a sample post content.",
            tags: [{ id: 1, title: "Sample Tag" }],
            published: true,
            createdAt: String(new Date()),
            updatedAt: String(new Date()),
        }

        databaseServiceMock.insertPost = vi.fn().mockResolvedValue({ post: post1 });

        const response = await request(app).post("/dashboard/posts").send({
            title: post1.title,
            content: post1.content,
            tags: post1.tags.map(tag => tag.id),
            published: post1.published,
        }); //RESTful

        expect(response.status).toBe(201);
        expect(response.body).toMatchObject(
            post1,
        );
        expect(response.body).toHaveProperty("createdAt");
        expect(response.body).toHaveProperty("updatedAt");
    });
});

describe("POST /user", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        app = express()
        app.use(express.json());
        app.use("/dashboard", DashboardRouter(databaseServiceMock, false));
    });

    const newUser = {
        login: "logintest",
        password: "testpassword",
    };

    test("Should insert an user and return 201", async () => {

        databaseServiceMock.registerUser = vi.fn().mockResolvedValue({ user: { id: 1, login: newUser.login } });

        const response = await request(app).post("/dashboard/user").send(newUser);

        expect(response.status).toBe(201);
        expect(response.body).toMatchObject({
            id: 1,
            login: newUser.login,
        });
        expect(response.body).not.toHaveProperty("password");
        expect(databaseServiceMock.registerUser).toHaveBeenCalledWith(newUser);
    });

    test("Should return 409 if username is already taken", async () => {
        databaseServiceMock.registerUser = vi.fn().mockResolvedValue({ user: null, errorCode: "username_taken" });

        const response = await request(app).post("/dashboard/user").send(newUser);

        expect(response.status).toBe(409);
        expect(response.body).toMatchObject({
            message: "Username already taken",
        });
        expect(databaseServiceMock.registerUser).toHaveBeenCalledWith(newUser);
    });

    test("Should return 500 on critical error", async () => {
        databaseServiceMock.registerUser = vi.fn().mockResolvedValue({ user: null, errorCode: "critical_error" });

        const response = await request(app).post("/dashboard/user").send(newUser);

        expect(response.status).toBe(500);
        expect(response.body).toMatchObject({
            message: "Critical error inserting user",
        });
        expect(databaseServiceMock.registerUser).toHaveBeenCalledWith(newUser);
    });
});