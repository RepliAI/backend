import { Message } from '../entities/message.entity';

export const MESSAGE_REPOSITORY = 'MESSAGE_REPOSITORY';

export interface IMessageRepository {
  findByGmailId(gmailId: string): Promise<Message | null>;
  create(message: Message): Promise<void>;
}