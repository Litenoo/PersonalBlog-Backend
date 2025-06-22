import { describe, expect, test, vi, beforeEach } from 'vitest';
import DbService from '../../src/services/database.service';

vi.mock('@prisma/client', () => ({
	PrismaClient: vi.fn().mockImplementation(() => ({
		post: {
			create: vi.fn(),
		},
	})),
}));

import { PrismaClient } from "@prisma/client";


describe(`getPostById`, async () => {
	let prisma: PrismaClient;
	let db: DbService;

	const postNoContent = {
		id: 1,
		title: 'Test Post',
		tags: [
			{ id: 1, title: 'tag1' },
			{ id: 2, title: 'tag2' },
		],
		published: true,
		createdAt: new Date(),
		updatedAt: new Date(),
	}

	const postWithContent = {
		...postNoContent,
		content: 'This is a test post content.',
	}

	beforeEach(() => {
		vi.clearAllMocks();
		prisma = new PrismaClient();
		db = new DbService(prisma);
	});

	test(`Should return post with content`, async () => {
		vi.spyOn(prisma.post, 'findUnique').mockResolvedValue(postWithContent as any);

		const result = await db.getPostById({ postId: 1, withContent: true });

		expect(prisma.post.findUnique).toHaveBeenCalledWith({
			where: { id: 1, published: true },
			select: { content: true, id: true, title: true, published: true, createdAt: true, updatedAt: true },
		});

		expect(result).toEqual({ post: postWithContent });
	});

	test(`Should return post without content`, async () => {
		vi.spyOn(prisma.post, 'findUnique').mockResolvedValue(postNoContent as any);

		const result = await db.getPostById({ postId: 1, withContent: false });

		expect(prisma.post.findUnique).toHaveBeenCalledWith({
			where: { id: 1, published: true },
			select: { id: true, title: true, published: true, createdAt: true, updatedAt: true },
		});

		expect(result).toEqual({ post: postNoContent });
	})
});


describe("insertPost", async () => {
	// It is going to always return code message if post was inserted correctly
	let prismaMock: PrismaClient;
	let db: DbService;

	beforeEach(() => {
		vi.clearAllMocks();
		prismaMock = new PrismaClient();
		db = new DbService(prismaMock);
	});

	test("Should insert post to the database", async () => {
		const mockPost = {
			id: 1,
			title: "SomeTitle",
			content: "Some content very long",
			published: true,
			tags: ["tag1"],
		}
		prismaMock.post.create.mockResolvedValue()
	});
});