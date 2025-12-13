import { GmailMessage } from "src/domain/gmail/service/gmail.service";

export function createMockGmailEmail(
  overrides: Partial<GmailMessage> = {}
): GmailMessage {
  return {
    id: overrides.id ?? "gmail-default-id",
    from: overrides.from ?? "client@example.com",
    to: overrides.to ?? "support@replyia.com",
    subject: overrides.subject ?? "Sujet par défaut",
    date: overrides.date ?? new Date("2024-01-01T10:00:00Z"),
    content: overrides.content ?? "Contenu par défaut",
    threadId: overrides.threadId ?? "threadId",
  };
}