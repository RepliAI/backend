import { PrismaGmailTokenRepository } from '../prisma-gmail-token.repository';
import { PrismaService } from '../../../prisma/prisma.service';

describe('PrismaGmailTokenRepository', () => {
  let repository: PrismaGmailTokenRepository;
  let prisma: jest.Mocked<PrismaService>;

  beforeEach(() => {
    prisma = {
      gmailToken: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
      },
    } as any;

    repository = new PrismaGmailTokenRepository(prisma);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('hasToken', () => {
    it('should return true when token exists', async () => {
      (prisma.gmailToken.findUnique as jest.Mock).mockResolvedValue({
        id: 'token1',
        userId: 'user1',
        accessToken: 'token',
        refreshToken: 'refresh',
        expiryDate: new Date(),
        createdAt: new Date(),
      } as any);

      const result = await repository.hasToken('user1');

      expect(result).toBe(true);
      expect(prisma.gmailToken.findUnique as jest.Mock).toHaveBeenCalledWith({
        where: { userId: 'user1' },
      });
    });

    it('should return false when token does not exist', async () => {
      (prisma.gmailToken.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await repository.hasToken('user1');

      expect(result).toBe(false);
    });
  });

  describe('findUsersEligibleForAutoImport', () => {
    it('should return users with pro plan, active status, and autoImport enabled', async () => {
      (prisma.gmailToken.findMany as jest.Mock).mockResolvedValue([
        {
          userId: 'user1',
          user: {
            subscription: {
              plan: 'pro',
              status: 'active',
            },
            preferences: {
              autoImport: true,
            },
          },
        },
        {
          userId: 'user2',
          user: {
            subscription: {
              plan: 'pro',
              status: 'active',
            },
            preferences: {
              autoImport: true,
            },
          },
        },
      ] as any);

      const result = await repository.findUsersEligibleForAutoImport('pro');

      expect(result).toEqual([
        { userId: 'user1' },
        { userId: 'user2' },
      ]);
      expect(prisma.gmailToken.findMany as jest.Mock).toHaveBeenCalledTimes(1);
    });

    it('should return users with business plan', async () => {
      (prisma.gmailToken.findMany as jest.Mock).mockResolvedValue([
        {
          userId: 'user3',
          user: {
            subscription: {
              plan: 'business',
              status: 'active',
            },
            preferences: {
              autoImport: true,
            },
          },
        },
      ] as any);

      const result = await repository.findUsersEligibleForAutoImport('business');

      expect(result).toEqual([{ userId: 'user3' }]);
    });

    it('should filter out users without subscription', async () => {
      (prisma.gmailToken.findMany as jest.Mock).mockResolvedValue([
        {
          userId: 'user1',
          user: {
            subscription: null,
            preferences: {
              autoImport: true,
            },
          },
        },
        {
          userId: 'user2',
          user: {
            subscription: {
              plan: 'pro',
              status: 'active',
            },
            preferences: {
              autoImport: true,
            },
          },
        },
      ] as any);

      const result = await repository.findUsersEligibleForAutoImport('pro');

      expect(result).toEqual([{ userId: 'user2' }]);
    });

    it('should filter out users with inactive subscription', async () => {
      (prisma.gmailToken.findMany as jest.Mock).mockResolvedValue([
        {
          userId: 'user1',
          user: {
            subscription: {
              plan: 'pro',
              status: 'canceled',
            },
            preferences: {
              autoImport: true,
            },
          },
        },
        {
          userId: 'user2',
          user: {
            subscription: {
              plan: 'pro',
              status: 'active',
            },
            preferences: {
              autoImport: true,
            },
          },
        },
      ] as any);

      const result = await repository.findUsersEligibleForAutoImport('pro');

      expect(result).toEqual([{ userId: 'user2' }]);
    });

    it('should filter out users with wrong plan', async () => {
      (prisma.gmailToken.findMany as jest.Mock).mockResolvedValue([
        {
          userId: 'user1',
          user: {
            subscription: {
              plan: 'business',
              status: 'active',
            },
            preferences: {
              autoImport: true,
            },
          },
        },
        {
          userId: 'user2',
          user: {
            subscription: {
              plan: 'pro',
              status: 'active',
            },
            preferences: {
              autoImport: true,
            },
          },
        },
      ] as any);

      const result = await repository.findUsersEligibleForAutoImport('pro');

      expect(result).toEqual([{ userId: 'user2' }]);
    });

    it('should filter out users with autoImport disabled', async () => {
      (prisma.gmailToken.findMany as jest.Mock).mockResolvedValue([
        {
          userId: 'user1',
          user: {
            subscription: {
              plan: 'pro',
              status: 'active',
            },
            preferences: {
              autoImport: false,
            },
          },
        },
        {
          userId: 'user2',
          user: {
            subscription: {
              plan: 'pro',
              status: 'active',
            },
            preferences: {
              autoImport: true,
            },
          },
        },
      ] as any);

      const result = await repository.findUsersEligibleForAutoImport('pro');

      expect(result).toEqual([{ userId: 'user2' }]);
    });

    it('should filter out users without preferences', async () => {
      (prisma.gmailToken.findMany as jest.Mock).mockResolvedValue([
        {
          userId: 'user1',
          user: {
            subscription: {
              plan: 'pro',
              status: 'active',
            },
            preferences: null,
          },
        },
        {
          userId: 'user2',
          user: {
            subscription: {
              plan: 'pro',
              status: 'active',
            },
            preferences: {
              autoImport: true,
            },
          },
        },
      ] as any);

      const result = await repository.findUsersEligibleForAutoImport('pro');

      expect(result).toEqual([{ userId: 'user2' }]);
    });

    it('should handle plan case insensitivity', async () => {
      (prisma.gmailToken.findMany as jest.Mock).mockResolvedValue([
        {
          userId: 'user1',
          user: {
            subscription: {
              plan: 'PRO',
              status: 'active',
            },
            preferences: {
              autoImport: true,
            },
          },
        },
        {
          userId: 'user2',
          user: {
            subscription: {
              plan: 'Pro',
              status: 'active',
            },
            preferences: {
              autoImport: true,
            },
          },
        },
      ] as any);

      const result = await repository.findUsersEligibleForAutoImport('pro');

      expect(result).toHaveLength(2);
      expect(result).toEqual([
        { userId: 'user1' },
        { userId: 'user2' },
      ]);
    });

    it('should return empty array when no eligible users', async () => {
      (prisma.gmailToken.findMany as jest.Mock).mockResolvedValue([
        {
          userId: 'user1',
          user: {
            subscription: {
              plan: 'free',
              status: 'active',
            },
            preferences: {
              autoImport: true,
            },
          },
        },
      ] as any);

      const result = await repository.findUsersEligibleForAutoImport('pro');

      expect(result).toEqual([]);
    });

    it('should return empty array when no tokens exist', async () => {
      (prisma.gmailToken.findMany as jest.Mock).mockResolvedValue([]);

      const result = await repository.findUsersEligibleForAutoImport('pro');

      expect(result).toEqual([]);
    });

    it('should filter multiple conditions correctly', async () => {
      (prisma.gmailToken.findMany as jest.Mock).mockResolvedValue([
        {
          userId: 'user1',
          user: {
            subscription: {
              plan: 'pro',
              status: 'canceled',
            },
            preferences: {
              autoImport: true,
            },
          },
        },
        {
          userId: 'user2',
          user: {
            subscription: {
              plan: 'business',
              status: 'active',
            },
            preferences: {
              autoImport: false,
            },
          },
        },
        {
          userId: 'user3',
          user: {
            subscription: {
              plan: 'pro',
              status: 'active',
            },
            preferences: {
              autoImport: true,
            },
          },
        },
        {
          userId: 'user4',
          user: {
            subscription: null,
            preferences: {
              autoImport: true,
            },
          },
        },
      ] as any);

      const result = await repository.findUsersEligibleForAutoImport('pro');

      expect(result).toEqual([{ userId: 'user3' }]);
    });
  });
});

