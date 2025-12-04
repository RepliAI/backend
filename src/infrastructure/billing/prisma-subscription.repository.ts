import { Injectable } from "@nestjs/common";

import { ISubscriptionRepository } from "src/domain/billing/repositories/subscription.repository";

import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class PrismaSubscriptionRepository implements ISubscriptionRepository {
  constructor(private prisma: PrismaService) {}

  async findByUserId(userId: string) {
    return this.prisma.subscription.findFirst({
      where: { userId },
    });
  }

  async findByStripeSubId(stripeSubId: string) {
    return this.prisma.subscription.findFirst({
      where: { stripeSubId },
    });
  }

  async create(data: {
    userId: string;
    plan: string;
    nextPlan?: string | null;
    stripeCustomerId?: string | null;
  }) {
    return this.prisma.subscription.create({
      data: {
        userId: data.userId,
        plan: data.plan,
        nextPlan: data.nextPlan ?? null,
        stripeCustomerId: data.stripeCustomerId ?? null,
        status: "active",
        currentPeriodEnd: new Date(),
      },
    });
  }

  async updateCustomerId(id: string, customerId: string) {
    return this.prisma.subscription.update({
      where: { id },
      data: { stripeCustomerId: customerId },
    });
  }

  async updateSubscription(id: string, data: {
    stripeSubId?: string;
    status?: string;
    plan?: string;
    nextPlan?: string | null;
    currentPeriodEnd?: Date;
  }) {
    return this.prisma.subscription.update({
      where: { id },
      data,
    });
  }

  async updateStripeSubscription(data: {
    stripeSubId: string;
    status: string;
    currentPeriodEnd: Date;
  }) {
    console.log("🚀 ~ PrismaSubscriptionRepository ~ updateStripeSubscription ~ data:", data)
    return this.prisma.subscription.update({
      where: { stripeSubId: data.stripeSubId },
      data: {
        status: data.status,
        currentPeriodEnd: data.currentPeriodEnd,
      },
    });
  }

  async updatePlanByStripeSubId(stripeSubId: string, plan: string) {
    return this.prisma.subscription.update({
      where: { stripeSubId },
      data: { plan },
    });
  } 
  
  async updateNextPlan(id: string, nextPlan: string | null) {
    return this.prisma.subscription.update({
      where: { id },
      data: { nextPlan },
    });
  }  

  async upsertFromStripe(data: {
    userId: string;
    plan: string;
    stripeCustomerId: string;
    stripeSubId: string;
    status: string;
    currentPeriodEnd: Date;
  }) {
    return this.prisma.subscription.upsert({
      where: { stripeSubId: data.stripeSubId },
      create: {
        userId: data.userId,
        plan: data.plan,
        stripeCustomerId: data.stripeCustomerId,
        stripeSubId: data.stripeSubId,
        status: data.status,
        currentPeriodEnd: data.currentPeriodEnd,
      },
      update: {
        status: data.status,
        plan: data.plan,
        stripeCustomerId: data.stripeCustomerId,
        currentPeriodEnd: data.currentPeriodEnd,
      },
    });
  }
}