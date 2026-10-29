import { prisma } from '@utils/prisma';
import type { Post, PostImage } from '../generated/prisma/client';
export default class PostService {
  private static instance: PostService;
  constructor() {
    if (!PostService.instance) {
      PostService.instance = this;
    }
    return PostService.instance;
  }

  async createPost(data: { title: string; content: string; authorId: string }) {
    try {
      const { title, content, authorId } = data;
      const post = await prisma.post.create({
        data: {
          title,
          content,
          authorId,
        },
      });
      return post;
    } catch (error: unknown) {
      throw new Error(
        error instanceof Error ? error.message : 'Failed to create post'
      );
    }
  }

  async addPostImage(postId: string, imageUrl: string) {
    try {
      const postExists = await prisma.post.findUnique({
        where: { id: postId },
      });
      if (!postExists) {
        throw new Error('Post not found');
      }
      const postImage = await prisma.postImage.create({
        data: {
          url: imageUrl,
          post: {
            connect: { id: postId },
          },
        },
      });
      return postImage;
    } catch (error: unknown) {
      throw new Error(
        error instanceof Error ? error.message : 'Failed to add post image'
      );
    }
  }

  async getAllPosts(pg: number = 1, limit: number = 20) {
    try {
      const page = Math.max(Number(pg) || 1, 1);
      const skip = (page - 1) * limit;

      const [posts, totalCount] = await Promise.all([
        prisma.post.findMany({
          include: {
            postImages: true,
          },
          skip,
          take: limit,
        }),
        prisma.post.count(),
      ]);

      const totalPages = Math.ceil(totalCount / limit);

      return { posts, totalCount, totalPages, currentPage: page };
    } catch (error: unknown) {
      throw new Error(
        error instanceof Error ? error.message : 'Failed to get posts'
      );
    }
  }

  async getPostById(id: string) {
    try {
      const post = await prisma.post.findUnique({
        where: { id },
        include: {
          postImages: true,
        },
      });
      return post;
    } catch (error: unknown) {
      throw new Error(
        error instanceof Error ? error.message : 'Failed to get post'
      );
    }
  }

  async updatePost(id: string, data: { title?: string; content?: string }) {
    try {
      const post = await prisma.post.update({
        where: { id },
        data,
      });
      return post;
    } catch (error: unknown) {
      throw new Error(
        error instanceof Error ? error.message : 'Failed to update post'
      );
    }
  }

  async deletePost(id: string) {
    try {
      const post = await prisma.post.delete({
        where: { id },
        include: {
          postImages: true,
        },
      });
      const imageDeletionPromises = post.postImages.map((image: PostImage) =>
        prisma.postImage.delete({
          where: { id: image.id },
        })
      );
      await Promise.all(imageDeletionPromises);
      return post;
    } catch (error: unknown) {
      throw new Error(
        error instanceof Error ? error.message : 'Failed to delete post'
      );
    }
  }
}
