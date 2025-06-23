import { describe, expect, test, vi, beforeEach } from 'vitest';
import DbService from '../../src/services/database.service';
import { PrismaClient } from '@prisma/client/extension';

/**
 * This file contain unit tests for the database.service.ts file. 
 * The test are designed to test the methods of that class exported by that file, 
 * according that input data is already validated by the API layer.
 */

const prismaMock = { // Define a mock for PrismaClient
	post: {
		findUnique: vi.fn(),
		create: vi.fn(),
		delete: vi.fn(),
		update: vi.fn(),
	}
} as PrismaClient; // Create a mock instance of PrismaClient,
//  to be able to pass it to database service as an argument

const db = new DbService(prismaMock);

describe(`getPostById`, () => {
	const postWithoutContent = {
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
		...postWithoutContent,
		content: 'This is a test post content.',
	}

	beforeEach(() => {
		vi.clearAllMocks();
	});

	test(`Should return post`, async () => {
		prismaMock.post.findUnique.mockResolvedValue(postWithContent); // Mock the Prisma findUnique method to return a post with content
		const result = await db.getPostById({ postId: 1, withContent: true }); // Call the method with withContent set to true

		expect(result).toEqual({ post: postWithContent }); // Expect the result to match the post with content
		expect(prismaMock.post.findUnique).toHaveBeenCalledWith({ // Check that findUnique was called with the correct parameters
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

	test(`Shouldn't include content when withContent is false`, async () => {
		prismaMock.post.findUnique.mockResolvedValue(postWithoutContent);
		const result = await db.getPostById({ postId: 1, withContent: false });

		expect(result).toEqual({ post: postWithoutContent });
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

	// It is okay to test that the post is not returned because it is not public or does not exist
	// Because postgre will return null anyway, so second test would look exactly the same
	test(`Shouldn't return post if it is not public or does not exist`, async () => {
		prismaMock.post.findUnique.mockResolvedValue(null);
		const result = await db.getPostById({ postId: 1, withContent: true });
		expect(result).toEqual({ post: null, errorCode: "not_found" });
	});
});


describe("insertPost", () => {
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
		prismaMock.post.create.mockResolvedValue(mockPost);

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
					connectOrCreate: mockPost.tags.map((tag) => ({ // SQL relationship creation or join if exists
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
		prismaMock.post.delete.mockResolvedValue(mockPost);

		const result = await db.deletePost({ postId: 1 });

		expect(result).toEqual({ post: mockPost });
		expect(prismaMock.post.delete).toHaveBeenCalledWith({
			where: { id: 1 },
		});
	});

	test(`Should return null and errorCode "not_found" if post not found`, async () => {
		prismaMock.post.delete.mockResolvedValue(null);

		const result = await db.deletePost({ postId: 1 });

		expect(result).toEqual({ post: null, errorCode: "not_found" });
	});
});

describe("updatePost", () => {
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
		prismaMock.post.update.mockResolvedValue(mockPost);

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

	test("Should return null and errorCode 'not_found' if post not found", async () => {
		prismaMock.post.update.mockResolvedValue(null);

		const result = await db.editPost({
			postId: 1,
			title: mockPost.title,
			content: mockPost.content,
			tags: mockPost.tags,
			published: mockPost.published,
		});

		expect(result).toEqual({ post: null, errorCode: "not_found" });
	});
});