import { PrismaClient } from "@prisma/client";
import type { Post } from "@prisma/client";

export default class DatabaseService {
	constructor(private prisma: PrismaClient = new PrismaClient()) {
		this.prisma = prisma;
	}

	async getPostById(params: { postId: number, withContent: boolean })
		: Promise<{ post?: Post | null, errorCode?: string }> {
		try {
			const post: Post | null = await this.prisma.post.findUnique({
				where: {
					id: params.postId,
					published: true,
				},
			});
			console.log("Post ID : ", params.postId, "Post fetched:", post);
			return { post };
		} catch (error) {
			return { errorCode: "critical_error" };
		}
	}
};