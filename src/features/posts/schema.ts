import joi from 'joi';

export const createPostSchema = joi.object({
  title: joi.string().min(3).max(100).required(),
  content: joi.string().min(10).required(),
  authorId: joi.number().integer().required(),
});

export const addPostImageSchema = joi.object({
  postId: joi.number().integer().required(),
  imageUrl: joi.string().uri().required(),
});

export const getAllPostsSchema = joi.object({
  page: joi.number().integer().min(1).default(1),
  limit: joi.number().integer().min(1).max(100).default(20),
});
