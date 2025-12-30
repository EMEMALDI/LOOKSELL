# LookSell - Complete Setup Guide

This guide will help you set up the LookSell digital marketplace platform from scratch.

## Table of Contents

1. [System Requirements](#system-requirements)
2. [Initial Setup](#initial-setup)
3. [Database Configuration](#database-configuration)
4. [Environment Configuration](#environment-configuration)
5. [Running the Application](#running-the-application)
6. [Development Workflow](#development-workflow)
7. [Testing](#testing)
8. [Troubleshooting](#troubleshooting)

## System Requirements

- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- **PostgreSQL**: v14 or higher
- **Redis**: v7 or higher
- **Git**: Latest version

### Optional (for full features)
- AWS Account (for S3 storage)
- Stripe Account (for payments)
- Twilio Account (for SMS/OTP)
- Docker & Docker Compose (for containerized development)

## Initial Setup

### 1. Clone and Install

```bash
# Clone the repository
git clone <repository-url>
cd LOOKSELL

# Install all dependencies (monorepo)
npm install
```

This will install dependencies for all workspaces (apps and packages).

### 2. Verify Installation

```bash
# Check Node version
node --version  # Should be 18.x or higher

# Check npm version
npm --version   # Should be 9.x or higher

# Verify monorepo structure
ls -la apps/ packages/
```

## Database Configuration

### Option 1: Local PostgreSQL

1. **Install PostgreSQL** (if not already installed):
   - macOS: `brew install postgresql@15`
   - Ubuntu: `sudo apt-get install postgresql-15`
   - Windows: Download from [postgresql.org](https://www.postgresql.org/download/)

2. **Start PostgreSQL**:
   ```bash
   # macOS (Homebrew)
   brew services start postgresql@15

   # Ubuntu
   sudo systemctl start postgresql

   # Or manually
   postgres -D /usr/local/var/postgres
   ```

3. **Create Database**:
   ```bash
   # Connect to PostgreSQL
   psql postgres

   # Create database and user
   CREATE DATABASE looksell;
   CREATE USER looksell WITH ENCRYPTED PASSWORD 'your_password_here';
   GRANT ALL PRIVILEGES ON DATABASE looksell TO looksell;
   \q
   ```

### Option 2: Docker PostgreSQL

```bash
docker run -d \
  --name looksell-postgres \
  -e POSTGRES_USER=looksell \
  -e POSTGRES_PASSWORD=looksell_password \
  -e POSTGRES_DB=looksell \
  -p 5432:5432 \
  postgres:15-alpine
```

### Redis Setup

#### Local Redis

```bash
# macOS
brew install redis
brew services start redis

# Ubuntu
sudo apt-get install redis-server
sudo systemctl start redis

# Or manually
redis-server
```

#### Docker Redis

```bash
docker run -d \
  --name looksell-redis \
  -p 6379:6379 \
  redis:7-alpine
```

## Environment Configuration

### 1. API Environment

```bash
cd apps/api
cp .env.example .env
```

Edit `apps/api/.env` and configure:

```env
# Essential (required to start)
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://looksell:looksell_password@localhost:5432/looksell
REDIS_URL=redis://localhost:6379
JWT_ACCESS_SECRET=generate-random-secret-here
JWT_REFRESH_SECRET=generate-another-random-secret-here

# Frontend
FRONTEND_URL=http://localhost:5173

# Optional (can add later)
# AWS_ACCESS_KEY_ID=
# AWS_SECRET_ACCESS_KEY=
# STRIPE_SECRET_KEY=
# TWILIO_ACCOUNT_SID=
# etc...
```

**Generate secure JWT secrets:**
```bash
# Generate random secrets
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### 2. Web Environment

```bash
cd apps/web
cp .env.example .env
```

Edit `apps/web/.env`:

```env
VITE_API_URL=http://localhost:3000/api
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...  # Optional
```

## Running the Application

### 1. Database Migrations

From the root directory:

```bash
# Generate Prisma client
npm run db:generate

# Run migrations to create tables
npm run db:migrate

# (Optional) Open Prisma Studio to view database
npm run db:studio
```

### 2. Start Development Servers

#### Option A: All Services Together

```bash
# From root directory
npm run dev
```

This starts:
- Frontend (web) at `http://localhost:5173`
- Backend (api) at `http://localhost:3000`

#### Option B: Individual Services

```bash
# Terminal 1: Backend API
cd apps/api
npm run dev

# Terminal 2: Frontend Web
cd apps/web
npm run dev
```

### 3. Verify Everything Works

1. Open browser to `http://localhost:5173`
2. You should see the LookSell homepage
3. Check API health: `http://localhost:3000/health`
4. Try registering a new account

## Development Workflow

### Project Structure

```
/LOOKSELL
  /apps
    /api          # Express backend
      /src
        /config   # Configuration files
        /controllers # Request handlers
        /services    # Business logic
        /middleware  # Express middleware
        /routes      # API routes
        /utils       # Utility functions
    /web          # React frontend
      /src
        /components  # React components
        /pages       # Page components
        /services    # API clients
        /store       # State management
        /hooks       # Custom hooks
  /packages
    /shared       # Shared types and utilities
    /database     # Prisma schema and client
```

### Common Development Tasks

#### Adding a New API Endpoint

1. Create service in `apps/api/src/services/`
2. Create controller in `apps/api/src/controllers/`
3. Add route in `apps/api/src/routes/`
4. Register route in `apps/api/src/index.ts`

#### Adding a New Database Model

1. Edit `packages/database/prisma/schema.prisma`
2. Run `npm run db:generate`
3. Create migration: `npm run db:migrate`

#### Adding a New Frontend Page

1. Create page component in `apps/web/src/pages/`
2. Add route in `apps/web/src/App.tsx`
3. Update navigation in `MainLayout.tsx`

### Code Quality

```bash
# Lint all code
npm run lint

# Format all code
npm run format

# Run tests (when implemented)
npm test
```

## Testing

### Manual Testing

1. **Register new account**: Test authentication flow
2. **Become creator**: Test creator profile creation
3. **Upload content**: Test file upload and processing
4. **Purchase content**: Test payment flow
5. **Subscribe to creator**: Test subscription system

### API Testing with curl

```bash
# Health check
curl http://localhost:3000/health

# Register user
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "Test123456"
  }'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "emailOrUsername": "testuser",
    "password": "Test123456"
  }'
```

## Docker Development

### Full Stack with Docker Compose

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Run migrations
docker-compose exec api npm run db:migrate

# Stop all services
docker-compose down

# Rebuild after code changes
docker-compose up --build
```

## Troubleshooting

### Database Connection Issues

```bash
# Check if PostgreSQL is running
pg_isready -h localhost -p 5432

# Check connection string format
# Should be: postgresql://user:password@host:port/database
```

### Redis Connection Issues

```bash
# Check if Redis is running
redis-cli ping
# Should return: PONG
```

### Port Already in Use

```bash
# Find process using port 3000
lsof -i :3000
# or
netstat -ano | grep 3000

# Kill the process
kill -9 <PID>
```

### Prisma Client Not Generated

```bash
# Regenerate Prisma client
cd packages/database
npx prisma generate
```

### Module Not Found Errors

```bash
# Clean install
npm run clean
rm -rf node_modules
npm install

# Rebuild packages
npm run build
```

### TypeScript Errors in Frontend

```bash
# Check TypeScript configuration
cd apps/web
npx tsc --noEmit

# Clear cache and restart
rm -rf node_modules/.vite
npm run dev
```

## Next Steps

1. **Configure AWS S3**: Set up file storage for uploads
2. **Configure Stripe**: Set up payment processing
3. **Configure Twilio**: Set up SMS/OTP authentication
4. **Email Service**: Configure SMTP for email notifications
5. **Deploy**: Follow deployment guide for production setup

## Additional Resources

- [React Documentation](https://react.dev/)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Stripe API Docs](https://stripe.com/docs/api)
- [Vite Documentation](https://vitejs.dev/)
- [Express.js Guide](https://expressjs.com/en/guide/routing.html)

## Getting Help

- Check existing issues on GitHub
- Review API logs: `apps/api/logs/`
- Enable debug mode: Set `NODE_ENV=development`
- Check browser console for frontend errors

---

**Happy coding! 🚀**

For questions or issues, please open a GitHub issue or contact support.
