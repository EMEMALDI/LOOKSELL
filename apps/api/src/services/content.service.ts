import { prisma } from '@looksell/database';
import { ContentType, PricingModel, ContentStatus, ContentVisibility } from '@looksell/shared';
import { AppError } from '../middleware/errorHandler';

export class ContentService {
  async createContent(creatorId: string, data: {
    title: string;
    description: string;
    contentType: ContentType;
    category: string;
    tags: string[];
    pricingModel: PricingModel;
    price?: number;
    visibility?: ContentVisibility;
    watermarkEnabled?: boolean;
    commentsEnabled?: boolean;
    ageRestricted?: boolean;
  }) {
    // Validate creator
    const creator = await prisma.creatorProfile.findUnique({
      where: { userId: creatorId },
    });

    if (!creator || creator.creatorStatus !== 'active') {
      throw new AppError(403, 'Active creator status required');
    }

    // Validate pricing
    if (data.pricingModel === 'purchase' || data.pricingModel === 'both') {
      if (!data.price || data.price < 1) {
        throw new AppError(400, 'Price must be at least $1');
      }
    }

    const content = await prisma.content.create({
      data: {
        creatorId,
        title: data.title,
        description: data.description,
        contentType: data.contentType,
        category: data.category,
        tags: data.tags,
        pricingModel: data.pricingModel,
        price: data.price,
        visibility: data.visibility || 'public',
        watermarkEnabled: data.watermarkEnabled ?? false,
        commentsEnabled: data.commentsEnabled ?? true,
        ageRestricted: data.ageRestricted ?? false,
        status: 'draft',
        filePaths: {},
        thumbnailUrl: '',
      },
    });

    return content;
  }

  async getContent(contentId: string, userId?: string) {
    const content = await prisma.content.findUnique({
      where: { id: contentId },
      include: {
        creator: {
          include: {
            profile: true,
            creatorProfile: true,
          },
        },
        _count: {
          select: {
            likes: true,
            comments: true,
          },
        },
      },
    });

    if (!content) {
      throw new AppError(404, 'Content not found');
    }

    // Check if user has access
    const hasAccess = await this.checkAccess(contentId, userId);

    return {
      ...content,
      hasAccess,
      isLiked: userId ? await this.isLiked(contentId, userId) : false,
    };
  }

  async listContent(filters: {
    category?: string;
    contentType?: ContentType;
    tags?: string[];
    priceMin?: number;
    priceMax?: number;
    creatorId?: string;
    page?: number;
    pageSize?: number;
    sort?: string;
  }) {
    const {
      category,
      contentType,
      tags,
      priceMin,
      priceMax,
      creatorId,
      page = 1,
      pageSize = 24,
      sort = 'createdAt:desc',
    } = filters;

    const where: any = {
      status: 'published',
      visibility: 'public',
    };

    if (category) where.category = category;
    if (contentType) where.contentType = contentType;
    if (tags && tags.length > 0) where.tags = { hasSome: tags };
    if (creatorId) where.creatorId = creatorId;

    if (priceMin !== undefined || priceMax !== undefined) {
      where.price = {};
      if (priceMin !== undefined) where.price.gte = priceMin;
      if (priceMax !== undefined) where.price.lte = priceMax;
    }

    const [field, order] = sort.split(':');
    const orderBy = { [field]: order || 'desc' };

    const [items, total] = await Promise.all([
      prisma.content.findMany({
        where,
        include: {
          creator: {
            include: {
              profile: true,
            },
          },
          _count: {
            select: {
              likes: true,
            },
          },
        },
        orderBy,
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.content.count({ where }),
    ]);

    return {
      items,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  async updateContent(contentId: string, creatorId: string, data: Partial<{
    title: string;
    description: string;
    tags: string[];
    price: number;
    watermarkEnabled: boolean;
    commentsEnabled: boolean;
  }>) {
    const content = await prisma.content.findUnique({
      where: { id: contentId },
    });

    if (!content) {
      throw new AppError(404, 'Content not found');
    }

    if (content.creatorId !== creatorId) {
      throw new AppError(403, 'Not authorized to update this content');
    }

    return prisma.content.update({
      where: { id: contentId },
      data,
    });
  }

  async deleteContent(contentId: string, creatorId: string) {
    const content = await prisma.content.findUnique({
      where: { id: contentId },
    });

    if (!content) {
      throw new AppError(404, 'Content not found');
    }

    if (content.creatorId !== creatorId) {
      throw new AppError(403, 'Not authorized to delete this content');
    }

    return prisma.content.update({
      where: { id: contentId },
      data: { status: 'deleted' },
    });
  }

  async checkAccess(contentId: string, userId?: string): Promise<boolean> {
    if (!userId) return false;

    const content = await prisma.content.findUnique({
      where: { id: contentId },
    });

    if (!content) return false;

    // Creator has access to their own content
    if (content.creatorId === userId) return true;

    // Free content
    if (content.pricingModel === 'free') return true;

    // Check if purchased
    if (content.pricingModel === 'purchase' || content.pricingModel === 'both') {
      const purchase = await prisma.purchase.findFirst({
        where: {
          contentId,
          buyerId: userId,
          status: 'completed',
        },
      });
      if (purchase) return true;
    }

    // Check if subscribed
    if (content.pricingModel === 'subscription' || content.pricingModel === 'both') {
      const subscription = await prisma.subscription.findFirst({
        where: {
          subscriberId: userId,
          creatorId: content.creatorId,
          status: 'active',
          expirationDate: {
            gte: new Date(),
          },
        },
      });
      if (subscription) return true;
    }

    return false;
  }

  async likeContent(contentId: string, userId: string) {
    const existing = await prisma.like.findUnique({
      where: {
        userId_contentId: {
          userId,
          contentId,
        },
      },
    });

    if (existing) {
      // Unlike
      await prisma.like.delete({
        where: { id: existing.id },
      });

      await prisma.content.update({
        where: { id: contentId },
        data: { likeCount: { decrement: 1 } },
      });

      return { liked: false };
    } else {
      // Like
      await prisma.like.create({
        data: {
          userId,
          contentId,
        },
      });

      await prisma.content.update({
        where: { id: contentId },
        data: { likeCount: { increment: 1 } },
      });

      return { liked: true };
    }
  }

  async isLiked(contentId: string, userId: string): Promise<boolean> {
    const like = await prisma.like.findUnique({
      where: {
        userId_contentId: {
          userId,
          contentId,
        },
      },
    });
    return !!like;
  }

  async incrementViewCount(contentId: string) {
    await prisma.content.update({
      where: { id: contentId },
      data: { viewCount: { increment: 1 } },
    });
  }
}
