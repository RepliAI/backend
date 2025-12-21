import { Inject, Injectable, Logger } from '@nestjs/common';

import { CheckPlanFeatureUseCase } from 'src/application/plans/use-cases/check-plan-feature.usecase';
import { GetUserPreferencesUseCase } from 'src/application/user-preferences/use-cases/get-user-preferences.usecase';
import { ITicketRepository, TICKET_REPOSITORY } from 'src/domain/tickets/repositories/ticket.repository';
import { ID_GENERATOR, IIdGenerator } from 'src/domain/shared/services/id-generator.service';
import { OpenAiService } from 'src/infrastructure/integrations/openai/openai.service';

import { GenerateAiReplyUseCase } from './generate-ai-reply.usecase';
import { AddMessageToTicketUseCase } from './add-message.usecase';

@Injectable()
export class AutoReplyToTicketUseCase {
    private readonly logger = new Logger(AutoReplyToTicketUseCase.name);

    constructor(
        @Inject(TICKET_REPOSITORY)
        private readonly ticketRepository: ITicketRepository,
        private readonly checkPlanFeature: CheckPlanFeatureUseCase,
        private readonly getUserPreferences: GetUserPreferencesUseCase,
        private readonly generateAiReply: GenerateAiReplyUseCase,
        private readonly addMessage: AddMessageToTicketUseCase,
        private readonly openAiService: OpenAiService,
        @Inject(ID_GENERATOR)
        private readonly idGenerator: IIdGenerator,
    ) { }

    async execute(ticketId: string, userId: string): Promise<void> {
        try {
            const prefs = await this.getUserPreferences.execute(userId);
            if (!prefs.autoAiSend) {
                this.logger.debug(`Auto-reply skipped: autoAiSend disabled for user ${userId}`);
                return;
            }

            await this.checkPlanFeature.checkAutoSend(userId);

            const ticket = await this.ticketRepository.findById(ticketId, userId);
            if (!ticket) {
                this.logger.warn(`Ticket ${ticketId} not found for user ${userId}`);
                return;
            }

            const lastMessage = ticket.messages.at(-1);
            if (!lastMessage) {
                this.logger.debug(`No messages in ticket ${ticketId}`);
                return;
            }

            if (lastMessage.from === 'agent' || lastMessage.from === 'ai') {
                this.logger.debug(`Last message is from agent/ai, skipping auto-reply for ticket ${ticketId}`);
                return;
            }

            if (!lastMessage.gmailId || !lastMessage.threadId) {
                this.logger.debug(`Last message missing Gmail ID or thread ID for ticket ${ticketId}`);
                return;
            }

            const isSafe = await this.openAiService.isSafeForAutoReply(lastMessage.content);
            if (!isSafe) {
                this.logger.warn(
                    `Auto-reply blocked for ticket ${ticketId}: message content deemed unsafe for automatic response`
                );
                return;
            }

            this.logger.log(`Generating AI reply for ticket ${ticketId} (user ${userId})`);
            const aiReply = await this.generateAiReply.execute(ticketId, userId);

            const gmailMessageId = this.idGenerator.generate();
            await this.addMessage.execute({
                ticketId,
                userId,
                content: aiReply,
                gmailId: gmailMessageId,
                isAutoReply: true,
            });

            this.logger.log(`Auto-reply sent for ticket ${ticketId} (user ${userId})`);

        } catch (error) {
            this.logger.error(
                `Error in auto-reply for ticket ${ticketId} (user ${userId}): ${error.message}`,
                error.stack
            );
        }
    }
}