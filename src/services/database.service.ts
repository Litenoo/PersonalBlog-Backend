import { PrismaClient } from "@prisma/client";
import type { Post, Tag } from "@prisma/client";
import logger from "../utils/logger";

export default class DatabaseService {
	constructor(private prisma: PrismaClient = new PrismaClient()) {
		this.prisma = prisma;
	}

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
					: { id: true, title: true, published: true, createdAt: true, updatedAt: true },
			});

			if (!post) {
				return { post: null, errorCode: "not_found" };
			}
			return { post, errorCode: undefined };

		} catch (error) {
			logger.error(`Error fetching post with ID ${params.postId}:`, error);
			return { errorCode: "critical_error" };
		}
	}

	async insertPost(
		params: {
			title: string,
			content: string,
			tags: string[], //if no tags exist decide what to do
			published: boolean,
		}): Promise<
			void
		> {

	}
};