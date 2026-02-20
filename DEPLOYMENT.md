# Deploying to Vercel

This guide will help you deploy the Exam Preparation Platform API to Vercel.

## Prerequisites

1. [Vercel Account](https://vercel.com/signup)
2. [Vercel CLI](https://vercel.com/docs/cli) (optional, for local testing)
3. PostgreSQL database (Vercel Postgres, Supabase, AWS RDS, etc.)

## Step 1: Prepare Your Database

Since Vercel uses serverless functions, you need a PostgreSQL database that's accessible from the internet.

### Option A: Vercel Postgres (Recommended)
1. Go to your Vercel dashboard
2. Click on "Storage" tab
3. Create a new "Postgres" database
4. Copy the connection string

### Option B: External Database (Supabase, Railway, etc.)
1. Create a PostgreSQL database
2. Run the schema file:
   ```bash
   psql YOUR_CONNECTION_STRING -f db/schema.sql
   ```
3. (Optional) Add mock data:
   ```bash
   psql YOUR_CONNECTION_STRING -f db/insert.sql
   ```

## Step 2: Environment Variables

Add the following environment variables in your Vercel project settings:

```env
# Database
DB_HOST=your-db-host
DB_PORT=5432
DB_USERNAME=your-db-user
DB_PASSWORD=your-db-password
DB_NAME=your-db-name

# JWT
JWT_SECRET=your-super-secret-jwt-key-min-32-characters
JWT_REFRESH_SECRET=your-super-secret-refresh-key-min-32-characters

# Application
NODE_ENV=production
FRONTEND_URL=https://your-frontend-url.vercel.app

# AI (Optional)
OPENAI_API_KEY=your-openai-api-key
```

## Step 3: Deploy

### Option A: Using Vercel Dashboard

1. Push your code to GitHub/GitLab/Bitbucket
2. Go to [Vercel Dashboard](https://vercel.com/dashboard)
3. Click "Add New Project"
4. Import your repository
5. Configure:
   - **Framework Preset**: Other
   - **Build Command**: `pnpm run vercel-build`
   - **Output Directory**: `dist`
   - **Install Command**: `pnpm install`
6. Add environment variables
7. Click "Deploy"

### Option B: Using Vercel CLI

1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Login to Vercel:
   ```bash
   vercel login
   ```

3. Deploy:
   ```bash
   vercel
   ```

4. For production:
   ```bash
   vercel --prod
   ```

## Step 4: Verify Deployment

After deployment, your API will be available at:
- **API Base**: `https://your-project.vercel.app/api`
- **Documentation**: `https://your-project.vercel.app/api/docs`
- **OpenAPI Spec**: `https://your-project.vercel.app/api/docs-json`

## Important Notes

### Database Connection Pooling
Vercel uses serverless functions which can create many database connections. Consider using:
- **PgBouncer** (connection pooler)
- **Prisma Connection Pool** (if switching to Prisma)
- **Vercel Postgres** (has built-in pooling)

### Cold Starts
Serverless functions have cold starts. The first request after a period of inactivity may be slower.

### File Uploads
For file uploads (avatars, study materials), use:
- **Vercel Blob Storage**
- **AWS S3**
- **Cloudinary**
- **Uploadcare**

### WebSockets
WebSockets are not supported on Vercel's serverless platform. For real-time features:
- Use **Server-Sent Events (SSE)**
- Use **Vercel Edge Functions** with WebSockets (experimental)
- Use a separate WebSocket server (Pusher, Ably, etc.)

## Troubleshooting

### Build Failures
1. Check that `vercel-build` script exists in package.json
2. Ensure all dependencies are in `dependencies` not `devDependencies`
3. Check build logs in Vercel dashboard

### Database Connection Issues
1. Verify environment variables are set correctly
2. Ensure database allows connections from Vercel's IP ranges
3. Check if SSL is required (add `?sslmode=require` to connection string)

### 404 Errors
1. Check `vercel.json` configuration
2. Ensure routes are properly configured
3. Verify the API prefix (`/api`) is being used

### CORS Issues
Update `FRONTEND_URL` environment variable to match your frontend domain.

## Monitoring

- Check Vercel Analytics in your dashboard
- Use Vercel Logs for debugging
- Consider adding APM tools (Sentry, LogRocket, etc.)

## Support

For issues:
1. Check Vercel documentation: https://vercel.com/docs
2. Check NestJS documentation: https://docs.nestjs.com
3. Open an issue in the project repository
