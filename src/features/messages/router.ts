import MessageController from './controller';
import { Router } from 'express';
import { authGuard } from '@middlewares/auth-guard';

const messageController = new MessageController();

const router = Router();

router.post('/', messageController.createMessage.bind(messageController));
router.get(
  '/',
  authGuard,
  messageController.getAllMessages.bind(messageController)
);
router.get(
  '/:id',
  authGuard,
  messageController.getMessageById.bind(messageController)
);
router.delete(
  '/:id',
  authGuard,
  messageController.deleteMessage.bind(messageController)
);

export default router;
