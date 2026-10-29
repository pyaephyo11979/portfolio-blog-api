import 'dotenv/config';
import PostService from './service';
import type { Request, Response } from 'express';
import { createPostSchema } from './schema';

class PostController {
  private postService: PostService;

  constructor() {
    this.postService = new PostService();
  }

  async createPost(req: Request, res: Response) {
    try {
      const { error } = createPostSchema.validate(req.body);
      if (error) {
        return res.status(400).json({ message: error.message });
      }
      const post = await this.postService.createPost(req.body);

      if (req.files && Array.isArray(req.files)) {
        for (const file of req.files as (Express.Multer.File & {
          key: string;
        })[]) {
          const imageUrl = `${process.env.BUCKET_URL}/${file.key}`;
          await this.postService.addPostImage(post.id, imageUrl);
        }
      }
      if (req.file) {
        const file = req.file as Express.Multer.File & { key: string };
        const imageUrl = `${process.env.BUCKET_URL}/${file.key}`;
        await this.postService.addPostImage(post.id, imageUrl);
      }
      res.status(201).json(post);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  async getAllPosts(req: Request, res: Response) {
    try {
      const { page, limit } = req.query;
      const data = await this.postService.getAllPosts(
        page ? Number(page) : 1,
        limit ? Number(limit) : 20
      );
      res.status(200).json({
        data: data.posts,
        meta: {
          totalCount: data.totalCount,
          currentPage: data.currentPage,
          totalPages: data.totalPages,
          limit: limit ? Number(limit) : 20,
          hasNextPage: data.currentPage < data.totalPages,
          hasPrevPage: data.currentPage > 1,
        },
      });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  async getPostById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      if (typeof id !== 'string') {
        return res.status(400).json({ message: 'Invalid post ID' });
      }
      const post = await this.postService.getPostById(id);
      if (!post) {
        return res.status(404).json({ message: 'Post not found' });
      }
      res.status(200).json(post);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  async updatePost(req: Request, res: Response) {
    try {
      const { id } = req.params;
      if (typeof id !== 'string') {
        return res.status(400).json({ message: 'Invalid post ID' });
      }
      const post = await this.postService.updatePost(id, req.body);
      res.status(200).json(post);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  async deletePost(req: Request, res: Response) {
    try {
      const { id } = req.params;
      if (typeof id !== 'string') {
        return res.status(400).json({ message: 'Invalid post ID' });
      }
      await this.postService.deletePost(id);
      res.status(204).send();
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }
}

export default PostController;
