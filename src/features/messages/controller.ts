import MessageService from './service';
import type { Request, Response } from 'express';
import { createMessageSchema } from './schema';

class MessageController {
  private messageService: MessageService;

  constructor() {
    this.messageService = new MessageService();
  }

  async createMessage(req: Request, res: Response) {
    try {
      const { error } = createMessageSchema.validate(req.body);
      if (error) {
        return res.status(400).json({ message: error.message });
      }
      const message = await this.messageService.createMessage(req.body);
      res.status(201).json(message);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  async getAllMessages(req: Request, res: Response) {
    try {
      const { page, limit } = req.query;
      const data = await this.messageService.getAllMessages(
        page ? Number(page) : 1,
        limit ? Number(limit) : 20
      );
      res.status(200).json({
        data: data.messages,
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

  async getMessageById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const message = await this.messageService.getMessageById(String(id));
      if (!message) {
        return res.status(404).json({ message: 'Message not found' });
      }
      res.status(200).json(message);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  async deleteMessage(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await this.messageService.deleteMessage(String(id));
      res.status(204).send();
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }
}

export default MessageController;
