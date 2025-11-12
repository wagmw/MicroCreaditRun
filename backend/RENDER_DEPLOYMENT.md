# Render.com Deployment Guide

## Required Environment Variables

Set these in your Render dashboard (Environment → Environment Variables):

1. **DATABASE_URL** - Your PostgreSQL connection string

   ```
   postgresql://user:password@host:port/database?sslmode=require
   ```

2. **NODE_ENV** (optional)

   ```
   production
   ```

3. **PORT** (optional, Render sets this automatically)

   ```
   10000
   ```

4. **SMS_API_TOKEN** - Your SMS service token

   ```
   your-sms-api-token
   ```

5. **SMS_SENDER_ID** - Your SMS sender ID
   ```
   YourSenderID
   ```

## Build Command

```bash
npm install && npm run build
```

This will:

- Install dependencies
- Generate Prisma client
- Run database migrations

## Start Command

```bash
npm start
```

## Common Issues & Solutions

### 1. "Database connection failed"

- ✅ Verify DATABASE_URL is set correctly in Render environment variables
- ✅ Ensure your database allows connections from Render's IP addresses
- ✅ Check that the database exists and is accessible

### 2. "Prisma Client not generated"

- ✅ Ensure `postinstall` script runs: `prisma generate`
- ✅ Check build logs for any errors during `npm install`

### 3. "500 Internal Server Error"

- ✅ Check Render logs for detailed error messages
- ✅ Verify all environment variables are set
- ✅ Test the `/health` endpoint to check database connectivity

### 4. "502 Bad Gateway" Error

**This usually means the server isn't starting properly. Check:**

- ✅ **Build logs** - Look for errors during `npm install` or `prisma generate`
- ✅ **Runtime logs** - Check if server is actually starting
- ✅ **DATABASE_URL** - Verify it's set and valid
- ✅ **Prisma Client** - Ensure it was generated during build
- ✅ **Cold Start** - First request after idle can take 30-60 seconds

**Quick fixes:**

```bash
# In Render Shell, check if Prisma client exists
ls -la node_modules/.prisma/client

# Manually generate if missing
npx prisma generate

# Check environment variables
env | grep DATABASE_URL
```

### 5. "503 Service Unavailable"

- ✅ Service is starting up (wait 30-60 seconds)
- ✅ Check Render dashboard for deployment status
- ✅ Verify the service is not suspended (free tier idles after 15 min)

## Testing Deployment

After deployment, test these endpoints:

1. **Health Check**

   ```
   GET https://your-app.onrender.com/health
   ```

   Should return: `{"ok": true, "database": "connected"}`

2. **Dashboard Stats**
   ```
   GET https://your-app.onrender.com/api/dashboard/stats
   ```
   Should return dashboard statistics

## Debugging

View logs in Render dashboard:

1. Go to your service
2. Click "Logs" tab
3. Look for error messages, especially:
   - Database connection errors
   - Prisma client errors
   - Environment variable issues

## Database Migrations

To run migrations manually on Render:

1. Add a Shell to your service
2. Run:
   ```bash
   npx prisma migrate deploy
   ```

## Performance Considerations

- Render free tier has cold starts (10-30 seconds)
- Increase timeout in frontend to 30+ seconds
- Consider upgrading to a paid plan for better performance
