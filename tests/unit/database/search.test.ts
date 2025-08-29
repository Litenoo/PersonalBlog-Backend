import { describe, expect, test, vi, beforeEach } from 'vitest';
import DbService from '../../../src/services/database.service';
import { PrismaClient } from '@prisma/client/extension';

const prismaMock = { // Define a mock for PrismaClient
    post: {
        findMany: vi.fn(),
    },
    tag: {
        findMany: vi.fn(),
    }
} as PrismaClient;

const db = new DbService(prismaMock);

describe("multiSearch", () => {
    beforeEach(() => {
        vi.resetAllMocks();
    });

    test("multiSearch via keyword", async () => {
        const post1 = {
            id: 1,
            title: "Post about Typescript",
            tags: [
                { id: 1, title: "tag1" },
                { id: 2, title: "someTag" },
            ],
            published: true,
            createdAt: new Date(),
            updatedAt: new Date(),
        }
        const tag1 = {
            id: 1,
            tag: "TypeScript",
        }
        const expectedResult = {
            searchResult: {
                posts: [
                    post1,
                ],
                tags: [
                    tag1,
                ]
            }
        }

        prismaMock.post.findMany.mockResolvedValue(expectedResult.searchResult.posts);
        prismaMock.tag.findMany.mockResolvedValue(expectedResult.searchResult.tags);

        const result = await db.multiSearch({ keyword: "typescript" });

        expect(prismaMock.post.findMany).toHaveBeenCalledWith({
            where: {
                title: {
                    contains: "typescript",
                    mode: "insensitive"
                },
                published: true,
            }
        });
        expect(prismaMock.tag.findMany).toHaveBeenCalledWith({
            where: {
                title: {
                    contains: "typescript",
                    mode: "insensitive",
                }
            }
        });
        expect(result).toEqual(expectedResult);
    });

    test("multiSearch via tag", async () => {
        const expectedResult = {
            searchResult: {
                posts: [{
                    id: 1,
                    title: "Post about Typescript",
                    tags: [
                        { id: 1, title: "tag1" },
                        { id: 2, title: "python" },
                    ],
                    published: true,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                }],
                tags: [],
            }
        }

        prismaMock.post.findMany.mockResolvedValue(expectedResult.searchResult.posts);
        const result = await db.multiSearch({ tagId: 1 });

        expect(result).toEqual(expectedResult);
        expect(prismaMock.post.findMany).toHaveBeenCalledWith({
            where: {
                tags: {
                    some: {
                        id: 1,
                    }
                },
                published: true,
            }
        });
    });

    test("multiSearch excludes repeating same post (tag+keyword) matching", async () => {
        const post1 = {
            id: 1,
            title: "Post about Typescript",
            tags: [
                { id: 1, title: "tag1" },
                { id: 2, title: "someTag" }
            ],
            published: true,
            createdAt: new Date(),
            updatedAt: new Date(),
        }
        const expectedResult = {
            searchResult: {
                posts: [
                    post1,
                ],
            }
        }

        prismaMock.post.findMany.mockResolvedValue(expectedResult.searchResult.posts);

        const result = await db.multiSearch({ keyword: "typescript", tagId: 1 });

        expect(prismaMock.post.findMany).toHaveBeenCalledWith({
            where: {
                tags: {
                    some: {
                        id: 1,
                    }
                },
                title: {
                    contains: "typescript",
                    mode: "insensitive",
                },
                published: true,
            }
        });

        expect(prismaMock.tag.findMany).toHaveBeenCalledWith({
            where: {
                title: {
                    contains: "typescript",
                    mode: "insensitive",
                }
            }
        });

        expect(result).toEqual(expectedResult);
    });

    test("Should return all of the posts if no keyword provided", async () => {
        const expectedResult = {
            searchResult: {
                posts: [{
                    id: 1,
                    title: "Post about Typescript",
                    tags: [
                        { id: 1, title: "tag1" },
                        { id: 2, title: "python" },
                    ],
                    published: true,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                }],
                tags: [],
            }
        }

        prismaMock.post.findMany.mockResolvedValue(expectedResult.searchResult.posts);
        const result = await db.multiSearch({});

        expect(result).toEqual(expectedResult);
        expect(prismaMock.post.findMany).toHaveBeenCalledWith({
            where: {
                published: true,
            }
        });
    });
});