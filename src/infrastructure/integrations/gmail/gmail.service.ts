import { Injectable } from '@nestjs/common';
import { google } from 'googleapis';

import { IGmailService, GmailMessage } from 'src/domain/gmail/service/gmail.service';

import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class GmailService implements IGmailService {
    private oauth2Client: any;

    constructor(private readonly prisma: PrismaService) {
        this.oauth2Client = new google.auth.OAuth2(
            process.env.GOOGLE_CLIENT_ID,
            process.env.GOOGLE_CLIENT_SECRET,
            process.env.GOOGLE_REDIRECT_URI,
        );
    }

    generateAuthUrl(userId: string): string {
        const scopes = [
            'https://www.googleapis.com/auth/gmail.readonly',
            'https://www.googleapis.com/auth/gmail.send',
            'https://www.googleapis.com/auth/gmail.modify',
            'openid',
            'email',
        ];

        return this.oauth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: scopes,
            prompt: 'consent',
            state: userId,
        });
    }

    async handleOAuthCallback(code: string, userId: string): Promise<void> {
        const { tokens } = await this.oauth2Client.getToken(code);

        if (!tokens.access_token || !tokens.refresh_token || !tokens.expiry_date) {
            throw new Error('Invalid Gmail tokens');
        }

        await this.prisma.gmailToken.upsert({
            where: { userId },
            update: {
                accessToken: tokens.access_token,
                refreshToken: tokens.refresh_token,
                expiryDate: new Date(tokens.expiry_date),
            },
            create: {
                userId,
                accessToken: tokens.access_token,
                refreshToken: tokens.refresh_token,
                expiryDate: new Date(tokens.expiry_date),
            },
        });
    }

    private async getClient(
        userId: string
    ) {
        const token = await this.prisma.gmailToken.findUnique({
            where: { userId },
        });

        if (!token) throw new Error('No Gmail token saved');

        this.oauth2Client.setCredentials({
            access_token: token.accessToken,
            refresh_token: token.refreshToken,
            expiry_date: token.expiryDate.getTime(),
        });

        return google.gmail({ version: 'v1', auth: this.oauth2Client });
    }

    async fetchRecentMessages(
        userId: string,
        maxResults = 10,
    ): Promise<GmailMessage[]> {
        const client = await this.getClient(userId);

        const list = await client.users.messages.list({
            userId: 'me',
            maxResults,
            q: 'in:inbox',
        });

        if (!list.data.messages) return [];

        const messages: GmailMessage[] = [];

        for (const msg of list.data.messages) {
            const full = await client.users.messages.get({
                userId: 'me',
                id: msg.id!,
            });

            const headers = full.data.payload?.headers ?? [];

            const getHeader = (name: string) =>
                headers.find((h) => h.name?.toLowerCase() === name.toLowerCase())
                    ?.value ?? '';

            const body = extractEmailBody(full.data.payload);

            messages.push({
                id: msg.id!,
                threadId: full.data.threadId!,
                from: htmlDecode(getHeader('From')),
                to: htmlDecode(getHeader('To')),
                subject: htmlDecode(getHeader('Subject')),
                date: new Date(getHeader('Date') || new Date()),
                content: htmlDecode(body),
            });
        }

        return messages;
    }

    async sendReply(params: {
        userId: string;
        threadId: string;
        to: string;
        subject: string;
        content: string;
    }): Promise<string> {
    
        const token = await this.getToken(params.userId);

        if (!token.accessToken || !token.refreshToken) {
            throw new Error('NO_GMAIL_TOKEN');
        }
        
        this.oauth2Client.setCredentials({
            access_token: token.accessToken,
            refresh_token: token.refreshToken,
        });
    
        const gmail = google.gmail({ version: 'v1', auth: this.oauth2Client });
    
        const raw = this.buildRawEmail({
            to: params.to,
            subject: params.subject,
            content: params.content,
        });
    
        const res = await gmail.users.messages.send({
            userId: 'me',
            requestBody: {
                raw,
                threadId: params.threadId,
            },
        });
    
        return res.data.id!;
    }

    private buildRawEmail({ to, subject, content }: { to: string; subject: string; content: string }) {
        const encodedSubject = this.encodeHeader(subject);
        const str =
          `To: ${to}\r\n` +
          `Subject: ${encodedSubject}\r\n` +
          `Content-Type: text/plain; charset="UTF-8"\r\n\r\n` +
          content;
      
        return Buffer.from(str)
          .toString('base64')
          .replace(/\+/g, '-')
          .replace(/\//g, '_');
    }
    private async getToken(userId: string): Promise<{
        accessToken: string;
        refreshToken: string;
        expiryDate: Date;
      }> {
        const token = await this.prisma.gmailToken.findUnique({
          where: { userId },
        });
      
        if (!token) {
          throw new Error('No Gmail token found for this user');
        }
      
        const isExpired = token.expiryDate.getTime() < Date.now();
      
        if (!isExpired) {
          return {
            accessToken: token.accessToken,
            refreshToken: token.refreshToken,
            expiryDate: token.expiryDate,
          };
        }
      
        const refreshed = await this.oauth2Client.refreshToken(token.refreshToken);
        const newToken = refreshed.tokens;
      
        await this.prisma.gmailToken.update({
          where: { userId },
          data: {
            accessToken: newToken.access_token!,
            expiryDate: new Date(Date.now() + (newToken.expires_in ?? 3600) * 1000),
          },
        });
      
        return {
          accessToken: newToken.access_token!,
          refreshToken: token.refreshToken,
          expiryDate: new Date(Date.now() + (newToken.expires_in ?? 3600) * 1000),
        };
    }
    private encodeHeader(value: string): string {
        const base64 = Buffer.from(value, 'utf8').toString('base64');
        return `=?UTF-8?B?${base64}?=`;
    }
    async getAllConnectedUsers() {
        return this.prisma.gmailToken.findMany({
          select: { userId: true },
        });
    }  

}

const htmlDecode = (input: string): string =>  {
    if (!input) return '';
    return input
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&#x2F;/g, '/');
}

const decodeGmailBase64 = (str: string): string => {
    const normalized = str.replace(/-/g, '+').replace(/_/g, '/');
    const buff = Buffer.from(normalized, 'base64');
    return buff.toString('utf8');
}

function extractTopReply(text: string): string {
    if (!text) return '';

    const patterns = [
        /^On .* wrote:/mi,
        /^Le .* a écrit ?:?/mi,
        /^-----Original Message-----/mi,
    ];

    let cutIndex = -1;

    for (const p of patterns) {
        const match = text.match(p);
        if (match) {
            cutIndex = match.index!;
            break;
        }
    }

    if (cutIndex !== -1) {
        return text.substring(0, cutIndex).trim();
    }

    // fallback : remove quote lines
    return text
        .split('\n')
        .filter(line => !line.trim().startsWith('>'))
        .join('\n')
        .trim();
}

const extractEmailBody = (payload: any): string => {
    if (!payload) return '';

    let text = '';

    if (!payload.parts) {
        text = payload.body?.data
            ? decodeGmailBase64(payload.body.data)
            : '';
    } else {
        for (const part of payload.parts) {
            if (part.mimeType === 'text/plain' && part.body?.data) {
                text = decodeGmailBase64(part.body.data);
                break;
            }
        }

        if (!text) {
            for (const part of payload.parts) {
                if (part.mimeType === 'text/html' && part.body?.data) {
                    const html = decodeGmailBase64(part.body.data);
                    text = cleanHtml(html);
                    break;
                }
            }
        }
    }

    return extractTopReply(text);
};

const cleanHtml = (html: string): string => {
    let text = html;

    text = text.replace(/<br\s*\/?>/gi, '\n');
    text = text.replace(/<\/p>/gi, '\n');
    text = text.replace(/<p[^>]*>/gi, '');
    text = text.replace(/<[^>]+>/g, '');

    return text;
}