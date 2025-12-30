# LookSell - Digital Content Marketplace

A comprehensive digital marketplace platform enabling content creators to sell various digital products (photos, videos, music, PDFs, courses, etc.) to buyers. Similar to OnlyFans but broader and suitable for all content types, with special focus on music streaming and secure content delivery.

## Features

### 👤 For Users (Buyers)
- Multiple authentication methods (Email, Phone/SMS, Google OAuth)
- Browse and discover creators and content
- Purchase individual content or subscribe to creators
- Secure streaming of videos and music
- Download purchased files
- Music player with playlists and favorites
- Like and comment on content
- Purchase history and library management
- Push notifications for new content

### 🎨 For Creators
- Professional creator profiles
- Upload multiple content types (photos, videos, music, documents, courses)
- Flexible pricing (free, one-time purchase, subscription, or both)
- Content scheduling
- Advanced analytics dashboard
- Revenue tracking and payouts
- Subscriber management
- Discount codes and promotions
- Watermark settings

### 💳 Payment System
- Stripe integration for card payments
- TON blockchain support for crypto payments
- Manual subscription renewal system
- Creator payouts (weekly automatic or instant)
- Secure escrow and commission system
- Discount codes and bundles

### 🎧 Media Features
- Secure HLS video streaming
- Protected audio streaming with Howler.js
- Watermarking system
- Adaptive bitrate streaming
- Resume playback tracking
- Playlist management

### 🛡️ Security & Moderation
- Content moderation queue
- User reporting system
- Admin dashboard
- Rate limiting
- Encrypted storage
- DMCA compliance

## Tech Stack

### Frontend
- **React 19** - Modern React with latest features
- **Vite** - Fast build tool
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS
- **React Router** - Client-side routing
- **TanStack Query** - Server state management
- **Zustand** - Client state management
- **Howler.js** - Audio player
- **HLS.js** - Video streaming
- **Stripe Elements** - Payment UI

### Backend
- **Node.js & TypeScript** - Server runtime
- **Express.js** - Web framework
- **Prisma ORM** - Database toolkit
- **PostgreSQL** - Primary database
- **Redis** - Caching and sessions
- **Bull** - Job queue processing
- **Socket.io** - Real-time features
- **JWT** - Authentication
- **Bcrypt** - Password hashing
- **Zod** - Validation

### Infrastructure
- **Docker & Docker Compose** - Containerization
- **AWS S3** - File storage
- **CloudFront** - CDN
- **Stripe** - Payment processing
- **Twilio** - SMS/OTP
- **Nodemailer** - Email service

## Project Structure

```
/LOOKSELL
  /apps
    /web          # React PWA frontend
    /api          # Node.js Express backend
    /admin        # Admin dashboard (future)
  /packages
    /shared       # Shared types and utilities
    /database     # Prisma schema and client
  /services
    /media        # Media processing service (future)
    /notifications # Notification service (future)
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm 9+
- PostgreSQL 14+
- Redis 7+
- AWS Account (for S3)
- Stripe Account
- (Optional) Twilio Account for SMS

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd LOOKSELL
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**

Copy the example env files and fill in your credentials:

```bash
# API
cp apps/api/.env.example apps/api/.env

# Edit apps/api/.env with your actual values
```

4. **Set up the database**

Create a PostgreSQL database and update your `DATABASE_URL` in `.env`:

```bash
# Generate Prisma client
npm run db:generate

# Run migrations
npm run db:migrate

# (Optional) Seed database
cd packages/database && npm run seed
```

5. **Start Redis**

```bash
redis-server
# Or with Docker:
docker run -d -p 6379:6379 redis:7-alpine
```

6. **Start development servers**

```bash
# Start all services in development mode
npm run dev
```

This will start:
- Frontend at `http://localhost:5173`
- API at `http://localhost:3000`

### Environment Variables

#### Backend API (.env)

```env
# Server
NODE_ENV=development
PORT=3000
API_URL=http://localhost:3000

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/looksell

# Redis
REDIS_URL=redis://localhost:6379

# JWT
JWT_ACCESS_SECRET=your-secret-here
JWT_REFRESH_SECRET=your-refresh-secret-here

# AWS S3
AWS_ACCESS_KEY_ID=your-aws-key
AWS_SECRET_ACCESS_KEY=your-aws-secret
AWS_REGION=us-east-1
S3_BUCKET=your-bucket-name
CLOUDFRONT_URL=https://your-cdn.cloudfront.net

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PUBLISHABLE_KEY=pk_test_...

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
EMAIL_FROM=noreply@looksell.com

# SMS (Twilio)
TWILIO_ACCOUNT_SID=ACxxxx
TWILIO_AUTH_TOKEN=your-token
TWILIO_PHONE_NUMBER=+1234567890

# Google OAuth
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_CALLBACK_URL=http://localhost:3000/api/auth/google/callback

# Frontend
FRONTEND_URL=http://localhost:5173
```

#### Frontend (.env)

```env
VITE_API_URL=http://localhost:3000/api
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

## Development

### Available Scripts

```bash
# Development
npm run dev              # Start all services in dev mode
npm run dev:api          # Start API only
npm run dev:web          # Start frontend only

# Building
npm run build            # Build all packages
npm run build:api        # Build API only
npm run build:web        # Build frontend only

# Database
npm run db:generate      # Generate Prisma client
npm run db:migrate       # Run database migrations
npm run db:studio        # Open Prisma Studio

# Linting & Formatting
npm run lint             # Lint all packages
npm run format           # Format all files with Prettier

# Testing
npm test                 # Run all tests
```

### Database Schema

The database uses Prisma ORM with PostgreSQL. Key models:

- **User** - User accounts with authentication
- **UserProfile** - User profile information
- **CreatorProfile** - Creator-specific data
- **Content** - Digital content items
- **Purchase** - One-time purchases
- **Subscription** - Creator subscriptions
- **Transaction** - Payment transactions
- **Payout** - Creator payouts
- **Like, Comment, Review** - Social features
- **Notification** - User notifications
- **Message** - Direct messages
- **CustomRequest** - Commission requests
- **Affiliate, Referral** - Affiliate program
- **Report** - Content/user reports

See `packages/database/prisma/schema.prisma` for the complete schema.

## API Documentation

### Authentication

```
POST /api/auth/register
POST /api/auth/login
POST /api/auth/refresh
POST /api/auth/phone/send-otp
POST /api/auth/phone/verify-otp
POST /api/auth/google
GET  /api/auth/me
POST /api/auth/become-creator
POST /api/auth/logout
```

### Content

```
GET    /api/content
GET    /api/content/:id
POST   /api/content (Creator only)
PATCH  /api/content/:id (Creator only)
DELETE /api/content/:id (Creator only)
POST   /api/content/:id/like
GET    /api/content/:id/stream
```

### Payments

```
POST   /api/payments/purchase
POST   /api/payments/subscribe
POST   /api/payments/subscriptions/:id/cancel
POST   /api/payments/subscriptions/:id/renew
```

### User

```
GET    /api/users/:username
PATCH  /api/users/me
GET    /api/users/me/library
GET    /api/users/me/purchases
GET    /api/users/me/subscriptions
```

### Creator Dashboard

```
GET    /api/creator/dashboard
GET    /api/creator/analytics
GET    /api/creator/earnings
POST   /api/creator/payout
GET    /api/creator/subscribers
```

## Deployment

### Docker Deployment

1. Build Docker images:
```bash
docker-compose build
```

2. Start services:
```bash
docker-compose up -d
```

3. Run migrations:
```bash
docker-compose exec api npm run db:migrate
```

### Production Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Use strong JWT secrets
- [ ] Configure production database (managed PostgreSQL)
- [ ] Set up Redis cluster
- [ ] Configure S3 bucket with proper permissions
- [ ] Set up CloudFront distribution
- [ ] Configure Stripe webhooks
- [ ] Set up email service (SES or SendGrid)
- [ ] Enable HTTPS/SSL
- [ ] Configure CORS for production domain
- [ ] Set up monitoring and logging
- [ ] Configure backups
- [ ] Set up CI/CD pipeline

## Architecture Decisions

### Payment System
- **Manual subscription renewal** instead of auto-billing to give users full control
- **7-day holding period** for creator earnings to protect against chargebacks
- **15% platform commission** (configurable per creator)

### Content Delivery
- **Signed URLs** with 1-hour expiration for secure streaming
- **HLS streaming** for adaptive video quality
- **Watermarking** optional per content item
- **No direct downloads** for protected content

### Authentication
- **JWT tokens** with 15-minute access and 7-day refresh
- **Multiple auth methods** for user convenience
- **Redis sessions** for fast authentication checks

## Contributing

Contributions are welcome! Please read our contributing guidelines and code of conduct.

## License

[Add your license here]

## Support

For issues and questions:
- Create an issue on GitHub
- Email: support@looksell.com

---

**Built with ❤️ for content creators**
