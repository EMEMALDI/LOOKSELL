import Stripe from 'stripe';
import { prisma } from '@looksell/database';
import { env } from '../config/env';
import { AppError } from '../middleware/errorHandler';
import { calculateCommission } from '@looksell/shared';

const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
});

export class PaymentService {
  async createPurchase(data: {
    buyerId: string;
    contentId: string;
    paymentMethod: 'stripe' | 'ton';
    paymentMethodId?: string; // Stripe payment method ID
    discountCode?: string;
  }) {
    // Get content and validate
    const content = await prisma.content.findUnique({
      where: { id: data.contentId },
      include: {
        creator: {
          include: {
            creatorProfile: true,
          },
        },
      },
    });

    if (!content) {
      throw new AppError(404, 'Content not found');
    }

    if (content.pricingModel === 'free') {
      throw new AppError(400, 'This content is free');
    }

    if (content.pricingModel === 'subscription') {
      throw new AppError(400, 'This content requires a subscription');
    }

    if (!content.price) {
      throw new AppError(400, 'Content price not set');
    }

    // Check if already purchased
    const existingPurchase = await prisma.purchase.findFirst({
      where: {
        buyerId: data.buyerId,
        contentId: data.contentId,
        status: 'completed',
      },
    });

    if (existingPurchase) {
      throw new AppError(400, 'Content already purchased');
    }

    let amount = parseFloat(content.price.toString());
    let discountAmount = 0;

    // Apply discount code if provided
    if (data.discountCode) {
      // TODO: Implement discount code logic
      // For now, just ignore it
    }

    const finalAmount = amount - discountAmount;

    // Calculate platform commission
    const commissionRate = content.creator.creatorProfile?.commissionRate || env.PLATFORM_COMMISSION_RATE;
    const platformCommission = calculateCommission(finalAmount, parseFloat(commissionRate.toString()));
    const creatorEarnings = finalAmount - platformCommission;

    if (data.paymentMethod === 'stripe') {
      // Process Stripe payment
      if (!data.paymentMethodId) {
        throw new AppError(400, 'Payment method ID required for Stripe');
      }

      try {
        const paymentIntent = await stripe.paymentIntents.create({
          amount: Math.round(finalAmount * 100), // Convert to cents
          currency: 'usd',
          payment_method: data.paymentMethodId,
          confirm: true,
          automatic_payment_methods: {
            enabled: true,
            allow_redirects: 'never',
          },
          metadata: {
            buyerId: data.buyerId,
            contentId: data.contentId,
            creatorId: content.creatorId,
          },
        });

        // Create purchase record
        const purchase = await prisma.purchase.create({
          data: {
            buyerId: data.buyerId,
            contentId: data.contentId,
            creatorId: content.creatorId,
            amount: finalAmount,
            platformCommission,
            creatorEarnings,
            paymentMethod: 'stripe',
            paymentId: paymentIntent.id,
            status: paymentIntent.status === 'succeeded' ? 'completed' : 'pending',
            discountCode: data.discountCode,
            discountAmount,
          },
        });

        // Increment purchase count
        await prisma.content.update({
          where: { id: data.contentId },
          data: { purchaseCount: { increment: 1 } },
        });

        // Update creator revenue
        if (purchase.status === 'completed') {
          await prisma.creatorProfile.update({
            where: { userId: content.creatorId },
            data: {
              totalRevenue: { increment: creatorEarnings },
            },
          });
        }

        // Create transaction record
        await prisma.transaction.create({
          data: {
            userId: data.buyerId,
            type: 'purchase',
            amount: finalAmount,
            currency: 'USD',
            paymentMethod: 'stripe',
            paymentId: paymentIntent.id,
            status: purchase.status,
            metadata: {
              contentId: data.contentId,
              purchaseId: purchase.id,
            },
          },
        });

        return {
          purchase,
          paymentIntent: {
            id: paymentIntent.id,
            status: paymentIntent.status,
            clientSecret: paymentIntent.client_secret,
          },
        };
      } catch (error: any) {
        throw new AppError(400, `Payment failed: ${error.message}`);
      }
    } else if (data.paymentMethod === 'ton') {
      // TODO: Implement TON payment
      throw new AppError(501, 'TON payments not yet implemented');
    }

    throw new AppError(400, 'Invalid payment method');
  }

  async createSubscription(data: {
    subscriberId: string;
    creatorId: string;
    paymentMethod: 'stripe' | 'ton';
    paymentMethodId?: string;
  }) {
    // Get creator and validate
    const creator = await prisma.user.findUnique({
      where: { id: data.creatorId },
      include: {
        creatorProfile: true,
      },
    });

    if (!creator || !creator.creatorProfile) {
      throw new AppError(404, 'Creator not found');
    }

    if (!creator.creatorProfile.subscriptionEnabled) {
      throw new AppError(400, 'Creator does not offer subscriptions');
    }

    if (!creator.creatorProfile.subscriptionPrice) {
      throw new AppError(400, 'Subscription price not set');
    }

    // Check if already subscribed
    const existingSubscription = await prisma.subscription.findFirst({
      where: {
        subscriberId: data.subscriberId,
        creatorId: data.creatorId,
        status: 'active',
        expirationDate: {
          gte: new Date(),
        },
      },
    });

    if (existingSubscription) {
      throw new AppError(400, 'Already subscribed to this creator');
    }

    const monthlyPrice = parseFloat(creator.creatorProfile.subscriptionPrice.toString());

    if (data.paymentMethod === 'stripe') {
      if (!data.paymentMethodId) {
        throw new AppError(400, 'Payment method ID required for Stripe');
      }

      try {
        // Create payment intent for first month
        const paymentIntent = await stripe.paymentIntents.create({
          amount: Math.round(monthlyPrice * 100),
          currency: 'usd',
          payment_method: data.paymentMethodId,
          confirm: true,
          automatic_payment_methods: {
            enabled: true,
            allow_redirects: 'never',
          },
          metadata: {
            subscriberId: data.subscriberId,
            creatorId: data.creatorId,
            type: 'subscription',
          },
        });

        // Create subscription record
        const expirationDate = new Date();
        expirationDate.setDate(expirationDate.getDate() + 30);

        const subscription = await prisma.subscription.create({
          data: {
            subscriberId: data.subscriberId,
            creatorId: data.creatorId,
            status: paymentIntent.status === 'succeeded' ? 'active' : 'expired',
            monthlyPrice,
            startDate: new Date(),
            expirationDate,
            totalPaid: monthlyPrice,
            renewalCount: 0,
          },
        });

        // Update creator subscriber count
        if (subscription.status === 'active') {
          await prisma.creatorProfile.update({
            where: { userId: data.creatorId },
            data: {
              totalSubscribers: { increment: 1 },
              totalRevenue: { increment: monthlyPrice },
            },
          });
        }

        // Create transaction record
        await prisma.transaction.create({
          data: {
            userId: data.subscriberId,
            type: 'subscription',
            amount: monthlyPrice,
            currency: 'USD',
            paymentMethod: 'stripe',
            paymentId: paymentIntent.id,
            status: subscription.status === 'active' ? 'completed' : 'pending',
            metadata: {
              subscriptionId: subscription.id,
              creatorId: data.creatorId,
            },
          },
        });

        return {
          subscription,
          paymentIntent: {
            id: paymentIntent.id,
            status: paymentIntent.status,
          },
        };
      } catch (error: any) {
        throw new AppError(400, `Subscription payment failed: ${error.message}`);
      }
    } else if (data.paymentMethod === 'ton') {
      throw new AppError(501, 'TON payments not yet implemented');
    }

    throw new AppError(400, 'Invalid payment method');
  }

  async cancelSubscription(subscriptionId: string, userId: string) {
    const subscription = await prisma.subscription.findUnique({
      where: { id: subscriptionId },
    });

    if (!subscription) {
      throw new AppError(404, 'Subscription not found');
    }

    if (subscription.subscriberId !== userId) {
      throw new AppError(403, 'Not authorized to cancel this subscription');
    }

    if (subscription.status !== 'active') {
      throw new AppError(400, 'Subscription is not active');
    }

    // Update subscription status (keeps access until expiration)
    const updated = await prisma.subscription.update({
      where: { id: subscriptionId },
      data: {
        status: 'canceled',
        canceledAt: new Date(),
      },
    });

    return updated;
  }

  async renewSubscription(subscriptionId: string, userId: string, paymentMethodId: string) {
    const subscription = await prisma.subscription.findUnique({
      where: { id: subscriptionId },
      include: {
        creator: {
          include: {
            creatorProfile: true,
          },
        },
      },
    });

    if (!subscription) {
      throw new AppError(404, 'Subscription not found');
    }

    if (subscription.subscriberId !== userId) {
      throw new AppError(403, 'Not authorized to renew this subscription');
    }

    const monthlyPrice = parseFloat(subscription.monthlyPrice.toString());

    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(monthlyPrice * 100),
        currency: 'usd',
        payment_method: paymentMethodId,
        confirm: true,
        automatic_payment_methods: {
          enabled: true,
          allow_redirects: 'never',
        },
        metadata: {
          subscriptionId: subscription.id,
          type: 'renewal',
        },
      });

      if (paymentIntent.status === 'succeeded') {
        const newExpirationDate = new Date();
        newExpirationDate.setDate(newExpirationDate.getDate() + 30);

        const renewed = await prisma.subscription.update({
          where: { id: subscriptionId },
          data: {
            status: 'active',
            expirationDate: newExpirationDate,
            totalPaid: { increment: monthlyPrice },
            renewalCount: { increment: 1 },
            canceledAt: null,
          },
        });

        return { subscription: renewed, paymentIntent };
      } else {
        throw new Error('Payment not successful');
      }
    } catch (error: any) {
      throw new AppError(400, `Renewal payment failed: ${error.message}`);
    }
  }

  async requestPayout(creatorId: string, data: {
    amount: number;
    method: 'bank' | 'paypal' | 'ton';
    destination: string;
    instant?: boolean;
  }) {
    // Get creator profile
    const creator = await prisma.creatorProfile.findUnique({
      where: { userId: creatorId },
    });

    if (!creator) {
      throw new AppError(404, 'Creator profile not found');
    }

    // Check minimum payout
    if (data.amount < env.MINIMUM_PAYOUT) {
      throw new AppError(400, `Minimum payout is $${env.MINIMUM_PAYOUT}`);
    }

    // TODO: Check available balance (need to implement earnings tracking)

    const fee = data.instant ? data.amount * 0.02 : 0;

    const payout = await prisma.payout.create({
      data: {
        creatorId,
        amount: data.amount,
        method: data.method,
        destination: data.destination,
        status: 'pending',
        instant: data.instant || false,
        fee,
      },
    });

    // TODO: Actually process payout (integrate with Stripe Connect or other payout system)

    return payout;
  }
}
