import { PrismaClient, Prisma } from "@prisma/client";
import type { Post, Tag } from "@prisma/client";


import logger from "../utils/logger";
import bcrypt from "bcrypt";

export default class DatabaseService {
	constructor(private prisma: PrismaClient = new PrismaClient()) {
		this.prisma = prisma;
	}

	// Post methods

	async getPostById(params: { postId: number; withContent: boolean }): Promise<
		{ post?: Post | null; errorCode?: string } |
		{ post?: Omit<Post, "content"> | null; errorCode?: string }
	> {
		try {
			const post = await this.prisma.post.findUnique({
				where: {
					id: params.postId,
					published: true,
				},
				select: params.withContent
					? { id: true, title: true, content: true, published: true, createdAt: true, updatedAt: true }
					: { id: true, title: true, content: false, published: true, createdAt: true, updatedAt: true },
			});

			if (!post) {
				return { post: null, errorCode: "not_found" };
			}
			return { post };

		} catch (error) {
			logger.error(`Error fetching post with ID ${params.postId}:`, error);
			return { post: null, errorCode: "critical_error" };
		}
	}

	async insertPost(
		params: {
			title: string, content: string, tags: string[], published: boolean,
		}): Promise<{ post: Post | null, errorCode?: string }> {
		try {
			const { title, content, tags, published } = params;

			const post = await this.prisma.post.create({
				data: {
					title,
					content,
					published,
					tags: {
						connectOrCreate: tags.map((tag) => ({
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
				},
			});
			return { post };
		} catch (error) {
			logger.error(`Error inserting post:`, error);
			return { post: null, errorCode: "critical_error" };
		}
	}

	async deletePost(params: { postId: number }): Promise<{ post?: Post | null; errorCode?: string }> {
		try {
			const post = await this.prisma.post.delete({
				where: { id: params.postId },
			});
			if (!post) {
				return { post: null, errorCode: "not_found" };
			}
			return { post };
		} catch (error) {
			logger.error(`Error deleting post with ID ${params.postId}:`, error);
			return { post: null, errorCode: "critical_error" };
		}
	}

	async editPost(
		params: {
			postId: number, title?: string, content?: string, tags?: string[], published?: boolean,
		}): Promise<{ post?: Post | null; errorCode?: string }> {
		try {
			const { postId, title, content, tags, published } = params;

			const post = await this.prisma.post.update({
				where: { id: postId },
				data: {
					title,
					content,
					published,
					tags: tags ? {
						connectOrCreate: tags.map((tag) => ({
							where: { title: tag },
							create: { title: tag },
						})),
					} : undefined,
				},
				select: {
					id: true,
					title: true,
					content: true,
					tags: true,
					published: true,
					createdAt: true,
					updatedAt: true,
				},
			});
			if (!post) {
				return { post: null, errorCode: "not_found" };
			}

			return { post };
		} catch (error) {
			logger.error(`Error editing post with ID ${params.postId}:`, error);
			return { post: null, errorCode: "critical_error" };
		}
	}

	// Tag methods

	async insertTag(params: { title: string }): Promise<{ tag?: Tag | null; errorCode?: string }> {
		try {
			const tag = await this.prisma.tag.create({
				data: {
					title: params.title,
				},
				select: {
					id: true,
					title: true,
				}
			});
			return { tag };
		} catch (err) {
			logger.error(`Error inserting tag with title ${params.title}:`, err);
			return { tag: null, errorCode: "critical_error" };
		}
	}

	async deleteTag(params: { tagId: number }): Promise<{ tag?: Tag | null, errorCode?: string }> {
		try {
			const tag = await this.prisma.tag.delete({
				where: {
					id: params.tagId,
				},
				select: {
					id: true,
					title: true,
				}
			});
			return { tag };
		} catch (err) {
			logger.error(`Error deleting tag with ID ${params.tagId}:`, err);
			return { tag: null, errorCode: "critical_error" };
		}
	}

	/*search methods

	//** This function is meant to search for : 
		-Tag & Post via keyword
		-Post via Tag

		The concept is to make it able for user to enter keyword,
		and allow to select tags, that may interest him
	*/

	async multiSearch(params: { keyword?: string, tagId?: number })
		: Promise<{
			searchResult: { posts: Post[], tags: Tag[] } | null, errorCode?: string
		}> {
		try {
			const { keyword, tagId } = params;

			const posts = await this.prisma.post.findMany({
				where: {
					published: true,
					...(keyword && {
						title: {
							contains: keyword,
							mode: "insensitive",
						}
					}),
					...(tagId && {
						tags: {
							some: {
								id: tagId,
							}
						}
					}),
				}
			});

			if (!keyword) {
				return { searchResult: { posts, tags: [] } }
			}

			const tags = await this.prisma.tag.findMany({
				where: {
					title: {
						contains: keyword,
						mode: "insensitive",
					}
				}
			});

			return { searchResult: { posts, tags } }


		} catch (err) {
			logger.error(
				`Error using multiSearch for ${params.keyword} keyword and ${params.tagId} tagId :`, err
			);
			return { searchResult: null, errorCode: "critical_error" };
		}
	}

	//User management -> for now only for admin staff

	async registerUser(params: { login: string, password: string }) {
		const { login } = params;

		const hashedPassword = await bcrypt.hash(params.password, 10);

		const user = await this.prisma.user.create({
			data: {
				login,
				hashedPassword,
				isAdmin: true, // Currently all users are admins for simplicity
			}
		});

		return { user }
	}

	// That is job for httpService that I will add later
	// async loginUser(params: { login: string, password: string }) {
	// 	try {
	// 		const input_password_hash = await bcrypt.hash(params.password, 10);
	// 		const user = await this.prisma.user.findUnique({
	// 			where: {
	// 				login: params.login,
	// 			}
	// 		});

	// 		if (!user) {
	// 			return null;
	// 		}

	// 		if (input_password_hash === user.hashedPassword) {

	// 		}
	// 	} catch (err) {
	// 		logger.error(err);
	// 	}
	// }

	async getUserByLogin(login: string) {
		return this.prisma.user.findUnique({
			where: { login },
		});
	}

	async getUserById(userId: number) {
		return this.prisma.user.findUnique({
			where: { id: userId },
		});
	}
}

export const databaseService = new DatabaseService();