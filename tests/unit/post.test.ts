import { PrismaClient } from "@prisma/client";
import { describe, expect, test, vi, beforeEach } from 'vitest';
import DbService from '../../src/services/database.service';

describe(`getPostById`, async () => {
	let prisma: PrismaClient;
	let db: DbService;

	beforeEach(() => {
		vi.clearAllMocks();
		prisma = new PrismaClient(); // Not sure if it has to be the same which is defined in the tested class
		db = new DbService(prisma);
	});

	test(`should return post with content`, async () => {

		const fakePost = {
			id: 1,
			title: 'Test Post',
			content: 'This is a test post.',
			tags: [
				{ id: 1, title: 'tag1' },
				{ id: 2, title: 'tag2' },
			],
			published: true,
			createdAt: new Date(),
			updatedAt: new Date(),
		}

		vi.spyOn(prisma.post, 'findUnique').mockResolvedValue(fakePost as any);

		const result = await db.getPostById({ postId: 1, withContent: true });

		expect(prisma.post.findUnique).toHaveBeenCalledWith({
			where: { id: 1, published: true },
		});

		expect(result).toEqual({ post: fakePost });
	});
});