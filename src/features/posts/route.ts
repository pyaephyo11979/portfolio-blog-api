import PostController from './controller';
import { authGuard } from '@middlewares/auth-guard';
import { Router } from 'express';
import { upload } from '@middlewares/upload-middleware';

const postController = new PostController();
const router = Router();

router.post('/', authGuard, upload.array('images'), (req, res) =>
  postController.createPost(req, res)
);
router.get('/', (req, res) => postController.getAllPosts(req, res));
router.get('/:id', (req, res) => postController.getPostById(req, res));
router.put('/:id', upload.array('images'), authGuard, (req, res) =>
  postController.updatePost(req, res)
);
router.delete('/:id', authGuard, (req, res) =>
  postController.deletePost(req, res)
);

export default router;
