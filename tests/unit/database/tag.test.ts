import { describe, expect, test, vi, beforeEach } from 'vitest';
import DbService from '../../../src/services/database.service';
import { PrismaClient } from '@prisma/client/extension';

const prismaMock = {
    tag: {
        create: vi.fn(),
        findUnique: vi.fn(),
        delete: vi.fn(),
    }
} as PrismaClient;

const db = new DbService(prismaMock);

describe(`insertTag`, async () => {
    beforeEach(() => {
        vi.resetAllMocks();
    });

    test(`Should insert a tag`, async () => {
        const tag1 = {
            id: 1,
            title: "tag1",
        }
        prismaMock.tag.create.mockResolvedValue(tag1);


        const result = await db.insertTag({ title: "tag1" });

        expect(result).toEqual({ tag: tag1 });
        expect(prismaMock.tag.create).toHaveBeenCalledWith({
            data: {
                title: "tag1",
            },
            select: {
                id: true,
                title: true,
            }
        });
    });
});

describe(`deleteTag`, async () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });


    test("Should return deleted tag", async () => {
        const tag1 = {
            id: 1,
            title: "tag1",
        }

        prismaMock.tag.delete.mockResolvedValue(tag1);

        const result = await db.deleteTag({ tagId: 1 });

        expect(result).toEqual({ tag: tag1 });

        expect(prismaMock.tag.delete).toHaveBeenCalledWith({
            where: {
                id: tag1.id,
            },
            select: {
                id: true,
                title: true,
            }
        });
    });
});