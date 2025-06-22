import { describe, expect, test, vi, beforeEach, Mock } from 'vitest';
import DbService from '../../src/services/database.service';

vi.mock('@prisma/client', () => ({
	PrismaClient: vi.fn().mockImplementation(() => ({
		post: {
			create: vi.fn(),
		},
	})),
}));

import { Prisma, PrismaClient } from "@prisma/client";


describe(`getPostById`, async () => {
	let db: DbService;
	let prismaMock;

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

	const unpublishedPost = {
		...postWithContent,
		published: false,
	}

	beforeEach(() => {
		vi.clearAllMocks();
	});

	test(`Should return post`, async () => {
		prismaMock = {
			post: {
				findUnique: vi.fn().mockResolvedValue(postWithContent),
			}
		} as any;
		db = new DbService(prismaMock);

		const result = await db.getPostById({ postId: 1, withContent: true });

		expect(result).toEqual({ post: postWithContent });
		expect(prismaMock.post.findUnique).toHaveBeenCalledWith({
			where: { id: postWithContent.id, published: postWithContent.published },
			select: {
				content: true,
				id: true,
				title: true,
				published: true,
				createdAt: true,
				updatedAt: true
			},
		});

	});

	test(`Should not include content when withContent equals false`, async () => {
		prismaMock = {
			post: {
				findUnique: vi.fn().mockResolvedValue(postNoContent),
			}
		} as any;
		db = new DbService(prismaMock);

		const result = await db.getPostById({ postId: 1, withContent: false });

		expect(result).toEqual({ post: postNoContent });
		expect(prismaMock.post.findUnique).toHaveBeenCalledWith({
			where: { id: 1, published: true },
			select: {
				id: true,
				title: true,
				published: true,
				createdAt: true,
				updatedAt: true,
				content: false, // This is not needed, but just to show that we don't select content
			},
		});
	});

	test(`Shouldn't return post if it is not public`, async () => {
		prismaMock = {
			post: {
				findUnique: vi.fn().mockResolvedValue(null),
			}
		} as any;
		db = new DbService(prismaMock);

		const result = await db.getPostById({ postId: 1, withContent: true });

		expect(result).toEqual({ post: null, errorCode: "not_found" });
	});
});


describe("insertPost", async () => {
	// It is going to always return code message if post was inserted correctly
	let prismaMock: any;
	let db: DbService;

	const mockPost = {
		id: 1,
		title: "SomeTitle",
		content: "Some content, very long",
		published: true,
		tags: ["tag1"],
		createdAt: new Date(),
		updatedAt: new Date(),
	}

	beforeEach(() => {
		vi.clearAllMocks();
	});

	test("Should insert post", async () => {
		prismaMock = {
			post: {
				create: vi.fn().mockResolvedValue(mockPost),
			}
		} as any;
		db = new DbService(prismaMock);

		const result = await db.insertPost({
			title: mockPost.title,
			content: mockPost.content,
			tags: mockPost.tags,
			published: mockPost.published,
		});

		expect(result).toEqual({ post: mockPost }); // Assuming the method returns void
		expect(prismaMock.post.create).toHaveBeenCalledWith({
			data: {
				title: mockPost.title,
				content: mockPost.content,
				published: mockPost.published,
				tags: {
					connectOrCreate: mockPost.tags.map((tag) => ({
						where: { title: tag },
						create: { title: tag },
					})),
				},
			},
			select: {
				id: true,
				title: true,
				content: true,
				tags: true,
				published: true,
				createdAt: true,
				updatedAt: true,
			}
		});
	});
});

describe("deletePost", () => {
	let db: DbService;
	let prismaMock: any;

	const mockPost = {
		id: 1,
		title: "SomeTitle",
		content: "Some content, very long",
		published: true,
		tags: ["tag1"],
		createdAt: new Date(),
		updatedAt: new Date(),
	};

	beforeEach(() => {
		vi.clearAllMocks();
	});

	test("Should delete post", async () => {
		prismaMock = {
			post: {
				delete: vi.fn().mockResolvedValue(mockPost),
			}
		} as any;
		db = new DbService(prismaMock);

		const result = await db.deletePost({ postId: 1 });

		expect(result).toEqual({ post: mockPost });
		expect(prismaMock.post.delete).toHaveBeenCalledWith({
			where: { id: 1 },
		});
	});

	test("Should return error if post not found", async () => {
		prismaMock = {
			post: {
				delete: vi.fn().mockResolvedValue(null),
			}
		} as any;
		db = new DbService(prismaMock);

		const result = await db.deletePost({ postId: 1 });

		expect(result).toEqual({ post: null, errorCode: "not_found" });
	});
});

describe("updatePost", () => {
	let db: DbService;
	let prismaMock: any;

	const mockPost = {
		id: 1,
		title: "Updated Title",
		content: "Updated content",
		published: true,
		tags: ["tag1", "tag2"],
		createdAt: new Date(),
		updatedAt: new Date(),
	};

	beforeEach(() => {
		vi.clearAllMocks();
	});

	test("Should update post", async () => {
		prismaMock = {
			post: {
				update: vi.fn().mockResolvedValue(mockPost),
			}
		} as any;
		db = new DbService(prismaMock);

		const result = await db.editPost({
			postId: 1,
			title: mockPost.title,
			content: mockPost.content,
			tags: mockPost.tags,
			published: mockPost.published,
		});

		expect(result).toEqual({ post: mockPost });
		expect(prismaMock.post.update).toHaveBeenCalledWith({
			where: { id: 1 },
			data: {
				title: mockPost.title,
				content: mockPost.content,
				published: mockPost.published,
				tags: {
					connectOrCreate: mockPost.tags.map((tag) => ({
						where: { title: tag },
						create: { title: tag },
					})),
				},
			},
			select: {
				id: true,
				title: true,
				content: true,
				tags: true,
				published: true,
				createdAt: true,
				updatedAt: true,
			}
		});
	});
})
