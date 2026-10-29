import { prisma } from '@utils/prisma';
export default class MessageService {
  private static instance: MessageService;
  constructor() {
    if (!MessageService.instance) {
      MessageService.instance = this;
    }
    return MessageService.instance;
  }

  async createMessage(data: { name: string; email: string; message: string }) {
    try {
      const { name, email, message } = data;
      const contactMessage = await prisma.contactMessage.create({
        data: {
          name,
          email,
          message,
        },
      });
      return contactMessage;
    } catch (error: unknown) {
      throw new Error(
        error instanceof Error ? error.message : 'Failed to create message'
      );
    }
  }

  async getAllMessages(pg: number = 1, limit: number = 20) {
    try {
      const page = Math.max(Number(pg) || 1, 1);
      const skip = (page - 1) * limit;

      const [messages, totalCount] = await Promise.all([
        prisma.contactMessage.findMany({
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
        }),
        prisma.contactMessage.count(),
      ]);

      return {
        messages,
        totalCount,
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
      };
    } catch (error: unknown) {
      throw new Error(
        error instanceof Error ? error.message : 'Failed to get messages'
      );
    }
  }

  async getMessageById(id: string) {
    try {
      const message = await prisma.contactMessage.findUnique({
        where: { id },
      });
      return message;
    } catch (error: unknown) {
      throw new Error(
        error instanceof Error ? error.message : 'Failed to get message'
      );
    }
  }

  async deleteMessage(id: string) {
    try {
      await prisma.contactMessage.delete({
        where: { id },
      });
    } catch (error: unknown) {
      throw new Error(
        error instanceof Error ? error.message : 'Failed to delete message'
      );
    }
  }
}
