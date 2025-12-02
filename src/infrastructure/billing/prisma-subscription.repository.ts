import { Injectable } from "@nestjs/common";

import { ISubscriptionRepository } from "src/domain/billing/repositories/subscription.repository";

import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class PrismaSubscriptionRepository implements ISubscriptionRepository {
  constructor(private prisma: PrismaService) {}

  findByUserId(userId: string) {
    return this.prisma.subscription.findUnique({ where: { userId } });
  }

  create(data: any) {
    return this.prisma.subscription.create({ data });
  }

  updateCustomerId(id: string, customerId: string) {
    return this.prisma.subscription.update({
      where: { id },
      data: { stripeCustomerId: customerId },
    });
  }

  updateSubscription(id: string, data: any) {
    return this.prisma.subscription.update({
      where: { id },
      data,
    });
  }
}