import { Controller, Get, Query, Res } from "@nestjs/common";
import { Response } from "express";
import Stripe from "stripe";

@Controller("billing/redirect")
export class BillingRedirectController {
  private stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2025-11-17.clover",
  });

  @Get("success")
  async handleSuccess(
    @Query("session_id") sessionId: string,
    @Res() res: Response
  ) {
    try {
      const session = await this.stripe.checkout.sessions.retrieve(sessionId);

      // Vérifier que Stripe a bien créé la subscription
      if (!session.subscription) {
        return res.redirect(`${process.env.FRONTEND_URL}/billing/error?reason=no-sub`);
      }

      return res.redirect(`${process.env.FRONTEND_URL}/billing/success`);
    } catch (e) {
      return res.redirect(`${process.env.FRONTEND_URL}/billing/error?reason=exception`);
    }
  }

  @Get("cancel")
  async handleCancel(
    @Res() res: Response
  ) {

    return res.redirect(`${process.env.FRONTEND_URL}/billing/cancel`);
  }
}