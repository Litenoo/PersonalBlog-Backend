import { describe, expect, test, vi, beforeEach } from 'vitest';
import request from "supertest";
import express from "express";
import DashboardRouter from "../../../../src/routes/dashboard.router";
import DatabaseService from '../../../../src/services/database.service';

const databaseServiceMock = {
    insertPost: vi.fn().mockResolvedValue({ post: { id: 1, title: "Sample Post" } }),
} as unknown as DatabaseService;

let app: express.Application;

describe("/posts", () => {

    beforeEach(() => {
        vi.clearAllMocks();
        app = express()
        app.use(express.json());
        app.use("/dashboard", DashboardRouter(databaseServiceMock, false));
    });

    test("GET /posts:id -> Should return post by id and status 200", async () => { // move to public
        const post1 = {
            id: 1,
            title: "Sample Post",
            content: "This is a sample post content.",
            tags: [{ id: 1, title: "Sample Tag" }],
            published: true,
            createdAt: String(new Date()),
            updatedAt: String(new Date()),
        }

        databaseServiceMock.getPostById = vi.fn().mockResolvedValueOnce({ post: post1 });

        const response = await request(app).get("/dashboard/posts/1");

        expect(response.status).toBe(200);
        expect(response.body).toMatchObject(
            post1,
        );
        expect(response.body).toHaveProperty("createdAt");
        expect(response.body).toHaveProperty("updatedAt");
        expect(databaseServiceMock.getPostById).toHaveBeenCalledWith({ postId: 1, withContent: true });
    });

    test("GET /posts:id -> Should return 404 if post not found", async () => {
        databaseServiceMock.getPostById = vi.fn().mockResolvedValueOnce({ post: null, errorCode: "not_found" });

        const response = await request(app).get("/dashboard/posts/999");

        expect(response.status).toBe(404);
        expect(response.body).toMatchObject({
            message: "Post not found",
        });
        expect(databaseServiceMock.getPostById).toHaveBeenCalledWith({ postId: 999, withContent: true });
    });

    test("POST /posts -> Should insert post, return it and status 200", async () => {

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

    test("DELETE /posts:id -> Should delete post by id and return it with status 200", async () => {
        const postId = 1;
        const post1 = {
            id: postId,
            title: "Sample Post",
            content: "This is a sample post content.",
            tags: [{ id: 1, title: "Sample Tag" }],
            published: true,
            createdAt: String(new Date()),
            updatedAt: String(new Date()),
        }

        databaseServiceMock.deletePost = vi.fn().mockResolvedValueOnce({ post: post1 });

        const response = await request(app).delete(`/dashboard/posts/${postId}`);

        expect(response.status).toBe(200);
        expect(response.body).toMatchObject(
            post1,
        );
        expect(response.body).toHaveProperty("createdAt");
        expect(response.body).toHaveProperty("updatedAt");
        expect(databaseServiceMock.deletePost).toHaveBeenCalledWith({ postId });
    });

    test("DELETE /posts:id -> Should return 404 if post to delete not found", async () => {
        const postId = 999;

        databaseServiceMock.deletePost = vi.fn().mockResolvedValueOnce({ post: null, errorCode: "not_found" });

        const response = await request(app).delete(`/dashboard/posts/${postId}`);

        expect(response.status).toBe(404);
        expect(response.body).toMatchObject({
            message: "Post not found",
        });
        expect(databaseServiceMock.deletePost).toHaveBeenCalledWith({ postId });
    });

    test("PUT /posts:id -> Should update the post and status 200", async () => {
        const postId = 1;
        const updatedPost = {
            id: postId,
            title: "Updated Sample Post",
            content: "This is an updated sample post content.",
            tags: [{ id: 1, title: "Sample Tag" }, { id: 2, title: "New Tag" }],
            published: false,
            createdAt: String(new Date()),
            updatedAt: String(new Date()),
        }

        databaseServiceMock.editPost = vi.fn().mockResolvedValueOnce({ post: updatedPost });

        const response = await request(app).put(`/dashboard/posts/${postId}`).send({
            title: updatedPost.title,
            content: updatedPost.content,
            tags: updatedPost.tags.map(tag => tag.id),
            published: updatedPost.published,
        });

        expect(response.status).toBe(200);
        expect(response.body).toMatchObject(
            updatedPost,
        );
        expect(response.body).toHaveProperty("createdAt");
        expect(response.body).toHaveProperty("updatedAt");
        expect(databaseServiceMock.editPost).toHaveBeenCalledWith({
            postId,
            title: updatedPost.title,
            content: updatedPost.content,
            tags: updatedPost.tags.map(tag => tag.id),
            published: updatedPost.published,
        });
    });
    test("PUT /posts:id -> Should return 404 if post to update not found", async () => {
        const postId = 999;

        databaseServiceMock.editPost = vi.fn().mockResolvedValueOnce({ post: null, errorCode: "not_found" });

        const response = await request(app).put(`/dashboard/posts/${postId}`).send({
            title: "Updated Sample Post",
            content: "This is an updated sample post content.",
            tags: [1, 2],
            published: false,
        });

        expect(response.status).toBe(404);
        expect(response.body).toMatchObject({
            message: "Post not found",
        });
        expect(databaseServiceMock.editPost).toHaveBeenCalledWith({
            postId,
            title: "Updated Sample Post",
            content: "This is an updated sample post content.",
            tags: [1, 2],
            published: false,
        });
    });
});

describe("/tags", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        app = express()
        app.use(express.json());
        app.use("/dashboard", DashboardRouter(databaseServiceMock, false));
    });

    test("POST /tags -> Should insert a tag and return it with status 201", async () => {
        const newTag = { title: "New Tag" };
        const createdTag = { id: 1, title: "New Tag" };

        databaseServiceMock.insertTag = vi.fn().mockResolvedValue({ tag: createdTag });

        const response = await request(app).post("/dashboard/tags").send(newTag);

        expect(response.status).toBe(201);
        expect(response.body).toMatchObject(createdTag);
        expect(databaseServiceMock.insertTag).toHaveBeenCalledWith(newTag);
    });

    test("POST /tags -> Should return 400 if no tag title provided", async () => {
        const response = await request(app).post("/dashboard/tags").send({});

        expect(response.status).toBe(400);
        expect(response.body).toMatchObject({
            message: "Invalid or missing tag title",
        });
    });

    test("POST /tags -> Should return 409 if tag already exists", async () => {
        const newTag = { title: "Existing Tag" };

        databaseServiceMock.insertTag = vi.fn().mockResolvedValue({ tag: null, errorCode: "tag_exists" });

        const response = await request(app).post("/dashboard/tags").send(newTag);

        expect(response.status).toBe(409);
        expect(response.body).toMatchObject({
            message: "Tag already exists",
        });
        expect(databaseServiceMock.insertTag).toHaveBeenCalledWith(newTag);
    });

    test("POST /tags -> Should return 500 on critical error", async () => {
        const newTag = { title: "Some Tag" };

        databaseServiceMock.insertTag = vi.fn().mockResolvedValue({ tag: null, errorCode: "critical_error" });

        const response = await request(app).post("/dashboard/tags").send(newTag);

        expect(response.status).toBe(500);
        expect(response.body).toMatchObject({
            message: "Critical error inserting tag",
        });
        expect(databaseServiceMock.insertTag).toHaveBeenCalledWith(newTag);
    });

    test("DELETE /tags/:id -> Should delete tag by id and return it with status 200", async () => {
        const tagId = 1;
        const deletedTag = { id: tagId, title: "Deleted Tag" };

        databaseServiceMock.deleteTag = vi.fn().mockResolvedValueOnce({ tag: deletedTag });

        const response = await request(app).delete(`/dashboard/tags/${tagId}`);

        expect(response.status).toBe(200);
        expect(response.body).toMatchObject(deletedTag);
        expect(databaseServiceMock.deleteTag).toHaveBeenCalledWith({ tagId });
    });

    test("DELETE /tags/:id -> Should return 404 if tag to delete not found", async () => {
        const tagId = 999;

        databaseServiceMock.deleteTag = vi.fn().mockResolvedValueOnce({ tag: null, errorCode: "not_found" });

        const response = await request(app).delete(`/dashboard/tags/${tagId}`);

        expect(response.status).toBe(404);
        expect(response.body).toMatchObject({
            message: "Tag not found",
        });
        expect(databaseServiceMock.deleteTag).toHaveBeenCalledWith({ tagId });
    });

    test("DELETE /tags/:id -> Should return 500 on critical error", async () => {
        const tagId = 1;

        databaseServiceMock.deleteTag = vi.fn().mockResolvedValueOnce({ tag: null, errorCode: "critical_error" });

        const response = await request(app).delete(`/dashboard/tags/${tagId}`);

        expect(response.status).toBe(500);
        expect(response.body).toMatchObject({
            message: "Critical error deleting tag",
        });
        expect(databaseServiceMock.deleteTag).toHaveBeenCalledWith({ tagId });
    });
});


// multisearch tests
describe("/search", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        app = express()
        app.use(express.json());
        app.use("/dashboard", DashboardRouter(databaseServiceMock, false));
    });

    test("GET /search?keyword=test -> Should return search results and status 200", async () => {
        const searchResult = {
            posts: [
                { id: 1, title: "Test Post 1" },
                { id: 2, title: "Another Test Post" }
            ],
            tags: [
                { id: 1, title: "Test Tag" }
            ]
        };

        databaseServiceMock.multiSearch = vi.fn().mockResolvedValue({ searchResult });

        const response = await request(app).get("/dashboard/search").send({ keyword: "test" });


        console.log(response.body);

        expect(response.status).toBe(200);
        expect(response.body).toMatchObject(searchResult);
        expect(databaseServiceMock.multiSearch).toHaveBeenCalledWith({ keyword: "test", tagId: undefined });
    });

    test("GET /search?keyword=test&tagId=1 -> Should return filtered search results and status 200", async () => {
        const searchResult = {
            posts: [
                { id: 1, title: "Test Post 1" }
            ],
            tags: [
                { id: 1, title: "Test Tag" }
            ]
        };

        databaseServiceMock.multiSearch = vi.fn().mockResolvedValue({ searchResult });

        const response = await request(app).get("/dashboard/search").send({ keyword: "test", tagId: 1 });

        expect(response.status).toBe(200);
        expect(response.body).toMatchObject(searchResult);
        expect(databaseServiceMock.multiSearch).toHaveBeenCalledWith({ keyword: "test", tagId: 1 });
    });

    test("GET /search -> Should return 500 on critical error", async () => {
        databaseServiceMock.multiSearch = vi.fn().mockResolvedValue({ searchResult: null, errorCode: "critical_error" });

        const response = await request(app).get("/dashboard/search").send({ keyword: "test" });
        expect(response.status).toBe(500);
    });
});


//user tests
describe("/user", () => {
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

    test("POST /user -> Should insert an user and return 201", async () => {

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

    test("POST /user -> Should return 409 if username is already taken", async () => {
        databaseServiceMock.registerUser = vi.fn().mockResolvedValue({ user: null, errorCode: "username_taken" });

        const response = await request(app).post("/dashboard/user").send(newUser);

        expect(response.status).toBe(409);
        expect(response.body).toMatchObject({
            message: "Username already taken",
        });
        expect(databaseServiceMock.registerUser).toHaveBeenCalledWith(newUser);
    });

    test("POST /user -> Should return 500 on critical error", async () => {
        databaseServiceMock.registerUser = vi.fn().mockResolvedValue({ user: null, errorCode: "critical_error" });

        const response = await request(app).post("/dashboard/user").send(newUser);

        expect(response.status).toBe(500);
        expect(response.body).toMatchObject({
            message: "Critical error inserting user",
        });
        expect(databaseServiceMock.registerUser).toHaveBeenCalledWith(newUser);
    });
});