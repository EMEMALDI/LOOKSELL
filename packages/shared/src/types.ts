// User and Authentication Types
export enum UserRole {
  BUYER = 'buyer',
  CREATOR = 'creator',
  ADMIN = 'admin'
}

export enum UserStatus {
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
  DELETED = 'deleted'
}

export interface User {
  id: string;
  username: string;
  email: string;
  phone?: string;
  role: UserRole;
  status: UserStatus;
  emailVerified: boolean;
  phoneVerified: boolean;
  twoFactorEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
}

export interface UserProfile {
  id: string;
  userId: string;
  displayName: string;
  bio?: string;
  profilePhotoUrl?: string;
  bannerImageUrl?: string;
  location?: {
    city?: string;
    country?: string;
  };
  websiteUrl?: string;
  socialLinks?: {
    twitter?: string;
    instagram?: string;
    youtube?: string;
  };
  preferences?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export enum CreatorStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
  SUSPENDED = 'suspended'
}

export interface CreatorProfile {
  id: string;
  userId: string;
  creatorStatus: CreatorStatus;
  verificationBadge: boolean;
  subscriptionPrice?: number;
  subscriptionEnabled: boolean;
  commissionRate: number;
  totalSubscribers: number;
  totalRevenue: number;
  ratingAverage?: number;
  ratingCount: number;
  creatorSince: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Content Types
export enum ContentType {
  PHOTO = 'photo',
  VIDEO = 'video',
  AUDIO = 'audio',
  DOCUMENT = 'document',
  COURSE = 'course',
  BUNDLE = 'bundle'
}

export enum PricingModel {
  FREE = 'free',
  PURCHASE = 'purchase',
  SUBSCRIPTION = 'subscription',
  BOTH = 'both'
}

export enum ContentStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  SCHEDULED = 'scheduled',
  DELETED = 'deleted'
}

export enum ContentVisibility {
  PUBLIC = 'public',
  UNLISTED = 'unlisted',
  SUBSCRIBERS_ONLY = 'subscribers_only'
}

export interface Content {
  id: string;
  creatorId: string;
  title: string;
  description: string;
  contentType: ContentType;
  category: string;
  tags: string[];
  pricingModel: PricingModel;
  price?: number;
  status: ContentStatus;
  visibility: ContentVisibility;
  publishAt?: Date;
  filePaths: Record<string, string>;
  thumbnailUrl: string;
  duration?: number;
  watermarkEnabled: boolean;
  watermarkSettings?: Record<string, any>;
  commentsEnabled: boolean;
  ageRestricted: boolean;
  viewCount: number;
  purchaseCount: number;
  likeCount: number;
  version: number;
  createdAt: Date;
  updatedAt: Date;
}

// Payment Types
export enum PaymentMethod {
  STRIPE = 'stripe',
  TON = 'ton'
}

export enum TransactionStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  REFUNDED = 'refunded',
  FAILED = 'failed'
}

export interface Purchase {
  id: string;
  buyerId: string;
  contentId: string;
  creatorId: string;
  amount: number;
  platformCommission: number;
  creatorEarnings: number;
  paymentMethod: PaymentMethod;
  paymentId: string;
  status: TransactionStatus;
  discountCode?: string;
  discountAmount: number;
  purchasedAt: Date;
  refundedAt?: Date;
}

export enum SubscriptionStatus {
  ACTIVE = 'active',
  EXPIRED = 'expired',
  CANCELED = 'canceled'
}

export interface Subscription {
  id: string;
  subscriberId: string;
  creatorId: string;
  status: SubscriptionStatus;
  monthlyPrice: number;
  startDate: Date;
  expirationDate: Date;
  canceledAt?: Date;
  totalPaid: number;
  renewalCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export enum TransactionType {
  PURCHASE = 'purchase',
  SUBSCRIPTION = 'subscription',
  PAYOUT = 'payout',
  REFUND = 'refund',
  AFFILIATE = 'affiliate'
}

export interface Transaction {
  id: string;
  userId: string;
  type: TransactionType;
  amount: number;
  currency: string;
  paymentMethod: PaymentMethod | 'bank' | 'paypal';
  paymentId: string;
  status: TransactionStatus;
  metadata?: Record<string, any>;
  createdAt: Date;
}

export enum PayoutStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed'
}

export enum PayoutMethod {
  BANK = 'bank',
  PAYPAL = 'paypal',
  TON = 'ton'
}

export interface Payout {
  id: string;
  creatorId: string;
  amount: number;
  method: PayoutMethod;
  destination: string;
  status: PayoutStatus;
  requestedAt: Date;
  completedAt?: Date;
  instant: boolean;
  fee: number;
  createdAt: Date;
}

// Social Features
export interface Comment {
  id: string;
  contentId: string;
  userId: string;
  parentId?: string;
  text: string;
  likeCount: number;
  status: 'published' | 'flagged' | 'deleted';
  createdAt: Date;
  updatedAt: Date;
}

export interface Like {
  id: string;
  userId: string;
  contentId: string;
  createdAt: Date;
}

export interface Notification {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  link?: string;
  read: boolean;
  data?: Record<string, any>;
  createdAt: Date;
}

// Review System
export interface Review {
  id: string;
  reviewerId: string;
  contentId?: string;
  creatorId?: string;
  rating: number;
  reviewText?: string;
  anonymous: boolean;
  images?: string[];
  helpfulCount: number;
  verifiedPurchase: boolean;
  status: 'published' | 'flagged' | 'deleted';
  createdAt: Date;
  updatedAt: Date;
}

// Messaging
export interface Message {
  id: string;
  senderId: string;
  recipientId: string;
  messageText: string;
  attachmentUrl?: string;
  paid: boolean;
  price?: number;
  read: boolean;
  replied: boolean;
  createdAt: Date;
}

// Custom Requests
export enum RequestStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  IN_PROGRESS = 'in_progress',
  DELIVERED = 'delivered',
  COMPLETED = 'completed',
  DECLINED = 'declined',
  CANCELED = 'canceled'
}

export interface CustomRequest {
  id: string;
  buyerId: string;
  creatorId: string;
  description: string;
  budget?: number;
  deadline?: Date;
  attachments?: Record<string, any>;
  status: RequestStatus;
  agreedPrice?: number;
  agreedTimeline?: Date;
  deliveredAt?: Date;
  completedAt?: Date;
  revisionCount: number;
  createdAt: Date;
  updatedAt: Date;
}

// Affiliate System
export interface Affiliate {
  id: string;
  userId: string;
  referralCode: string;
  totalClicks: number;
  totalConversions: number;
  totalEarned: number;
  availableBalance: number;
  createdAt: Date;
}

export interface Referral {
  id: string;
  affiliateId: string;
  referredUserId: string;
  purchaseId?: string;
  commissionAmount: number;
  status: 'pending' | 'paid' | 'invalid';
  clickedAt: Date;
  convertedAt?: Date;
}

// Reports
export enum ReportType {
  SPAM = 'spam',
  ABUSE = 'abuse',
  COPYRIGHT = 'copyright',
  INAPPROPRIATE = 'inappropriate'
}

export enum ReportStatus {
  OPEN = 'open',
  IN_PROGRESS = 'in_progress',
  RESOLVED = 'resolved',
  CLOSED = 'closed'
}

export interface Report {
  id: string;
  reporterId: string;
  reportedUserId?: string;
  reportedContentId?: string;
  reportedCommentId?: string;
  type: ReportType;
  reason: string;
  status: ReportStatus;
  assignedTo?: string;
  resolution?: string;
  createdAt: Date;
  resolvedAt?: Date;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse {
  user: User;
  tokens: AuthTokens;
}
