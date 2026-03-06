# Render Deployment Guide

## 📋 Overview
This guide will walk you through deploying the Event-Based Networking Platform backend to Render with Neon PostgreSQL database and automatic keep-alive functionality to prevent cold starts.

---

## 🚀 Prerequisites

1. **Render Account**: Sign up at [render.com](https://render.com)
2. **GitHub Repository**: Your code should be pushed to a GitHub repository
3. **Neon PostgreSQL Database**: Already set up at [neon.tech](https://neon.tech)
4. **Firebase Service Account**: Your `serviceAccountKey.json` file (located in backend folder)

---

## 📦 Deployment Steps

### Step 1: Prepare Your Repository

1. **Commit all changes**:
   ```bash
   git add .
   git commit -m "Prepare for Render deployment"
   git push origin main
   ```

2. **Verify files are in place**:
   - ✅ `render.yaml` (in backend folder)
   - ✅ `package.json` with `"start": "node src/server.js"` script
   - ✅ `src/utils/keepAlive.js` (auto-ping utility)
   - ✅ `src/server.js` with `/health` endpoint

---

### Step 2: Prepare Neon PostgreSQL Connection String

1. **Go to Neon Console**: [console.neon.tech](https://console.neon.tech)

2. **Select Your Project**: `event-networking-platform` (or your project name)

3. **Get Connection String**:
   - Go to **Dashboard** or **Connection Details**
   - Copy the **Connection String** (starts with `postgresql://`)
   - Example format: `postgresql://user:password@host.neon.tech/database?sslmode=require`
   - **Important**: Keep this secure! You'll use it in Render environment variables

4. **Verify Database Schema**:
   - Make sure all tables are created (users, events, tags, etc.)
   - If not, run the SQL from `DATABASE_SCHEMA.md` in Neon SQL Editor

---

### Step 3: Extract Firebase Credentials

You need to extract three values from your `serviceAccountKey.json` file:

**📖 See detailed guide**: [FIREBASE_CREDENTIALS_GUIDE.md](FIREBASE_CREDENTIALS_GUIDE.md)

**Quick Summary**:

1. **Open** `backend/serviceAccountKey.json`

2. **Extract these fields**:
   ```json
   {
     "project_id": "event-networking-platform",  ← FIREBASE_PROJECT_ID
     "client_email": "firebase-adminsdk-xxxxx@event-networking-platform.iam.gserviceaccount.com",  ← FIREBASE_CLIENT_EMAIL
     "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"  ← FIREBASE_PRIVATE_KEY
   }
   ```

3. **Copy these values** - you'll paste them into Render environment variables:
   - `project_id` → **FIREBASE_PROJECT_ID**
   - `client_email` → **FIREBASE_CLIENT_EMAIL**
   - `private_key` → **FIREBASE_PRIVATE_KEY** (keep quotes and `\n` characters!)

**⚠️ Important for FIREBASE_PRIVATE_KEY**:
- Include the double quotes at the start and end
- Keep all `\n` newline characters in the string
- Copy the entire value: `"-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"`

**Need help?** See [FIREBASE_CREDENTIALS_GUIDE.md](FIREBASE_CREDENTIALS_GUIDE.md) for detailed instructions with examples.

---

### Step 4: Create Backend Web Service

1. **Go to Render Dashboard** → Click **"New +"** → Select **"Web Service"**

2. **Connect Repository**:
   - Click **"Connect account"** to link your GitHub
   - Select your repository
   - Click **"Connect"**

3. **Configure Web Service**:

   | Setting | Value |
   |---------|-------|
   | **Name** | `event-networking-backend` |
   | **Region** | Same as database (e.g., Oregon) |
   | **Branch** | `main` |
   | **Root Directory** | `backend` |
   | **Environment** | `Node` |
   | **Build Command** | `npm install` |
   | **Start Command** | `npm start` |
   | **Plan** | **Free** (or Starter for production) |

4. **Advanced Settings** (click to expand):
   - **Health Check Path**: `/health`
   - **Auto-Deploy**: ✅ Yes (recommended)

---

### Step 5: Configure Environment Variables

Click **"Add Environment Variable"** and add the following:

#### Required Variables:

```bash
NODE_ENV=production
PORT=5000
FRONTEND_URL=https://your-frontend-url.vercel.app
```

#### Database URL (Neon PostgreSQL):

Paste your **Neon connection string** that you copied earlier:

```bash
DATABASE_URL=postgresql://neondb_owner:your_password@ep-xxx-xxx.neon.tech/neondb?sslmode=require
```

**Example from Neon**:
```bash
DATABASE_URL=postgresql://neondb_owner:npg_xxxxxxxxxxxxx@ep-floral-credit-ak6yctkb-pooler.c-3.us-west-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require
```

#### Firebase Credentials:

Paste the three values you extracted from `serviceAccountKey.json` in Step 3:

```bash
FIREBASE_PROJECT_ID=event-networking-platform
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-fbsvc@event-networking-platform.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDacnPwoU/bJbOm...\n-----END PRIVATE KEY-----\n"
```

**⚠️ Critical for FIREBASE_PRIVATE_KEY**:
- Copy the **entire** `private_key` value from serviceAccountKey.json
- **Include the surrounding double quotes**: `"-----BEGIN...`
- **Keep all `\n` characters** - they're important for line breaks
- The value should start with `"` and end with `\n"`

---

### Step 6: Deploy

1. Click **"Create Web Service"**
2. Render will start building and deploying your app
3. Monitor the logs in real-time
4. Wait for: **"Your service is live 🎉"** message (~5 minutes)

---

### Step 7: Verify Database Schema (Neon)

Your Neon database should already have all tables created. Let's verify:

1. **Go to Neon Console**: [console.neon.tech](https://console.neon.tech)

2. **Open SQL Editor**:
   - Select your project
   - Click **"SQL Editor"** or **"Query"**

3. **Verify Tables Exist**:
   
   Run this query to check if tables are created:
   ```sql
   SELECT table_name 
   FROM information_schema.tables 
   WHERE table_schema = 'public' 
   ORDER BY table_name;
   ```
   
   You should see: `users`, `events`, `tags`, `event_participants`, `participant_tags`, `favorites`

4. **If Tables Don't Exist**, run the full schema from `DATABASE_SCHEMA.md`:
   
   Execute the SQL from `DATABASE_SCHEMA.md`:

   ```sql
   -- Enable UUID extension
   CREATE EXTENSION IF NOT EXISTS "pgcrypto";

   -- Create users table
   CREATE TABLE users (
       id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
       name VARCHAR(100) NOT NULL,
       email VARCHAR(150) UNIQUE NOT NULL,
       role VARCHAR(20) CHECK (
           role IN ('SUPER_ADMIN', 'ORGANIZER', 'ORGANIZER_PENDING', 'PARTICIPANT')
       ) DEFAULT 'PARTICIPANT',
       linkedin_url TEXT,
       company VARCHAR(150),
       designation VARCHAR(150),
       created_at TIMESTAMP DEFAULT NOW(),
       updated_at TIMESTAMP DEFAULT NOW()
   );

   -- Create events table
   CREATE TABLE events (
       id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
       organizer_id UUID REFERENCES users(id) ON DELETE CASCADE,
       name VARCHAR(200) NOT NULL,
       description TEXT,
       location VARCHAR(200),
       event_date DATE,
       status VARCHAR(20) CHECK (
           status IN ('PENDING', 'APPROVED', 'REJECTED', 'ARCHIVED')
       ) DEFAULT 'PENDING',
       slug VARCHAR(255) UNIQUE NOT NULL,
       created_at TIMESTAMP DEFAULT NOW(),
       updated_at TIMESTAMP DEFAULT NOW()
   );

   -- Create tags table
   CREATE TABLE tags (
       id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
       event_id UUID REFERENCES events(id) ON DELETE CASCADE,
       name VARCHAR(100) NOT NULL,
       created_at TIMESTAMP DEFAULT NOW()
   );

   -- Create event_participants table
   CREATE TABLE event_participants (
       id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
       event_id UUID REFERENCES events(id) ON DELETE CASCADE,
       user_id UUID REFERENCES users(id) ON DELETE CASCADE,
       join_method VARCHAR(10) CHECK (join_method IN ('QR', 'LINK')),
       is_organizer BOOLEAN DEFAULT FALSE,
       joined_at TIMESTAMP DEFAULT NOW(),
       UNIQUE(event_id, user_id)
   );

   -- Create participant_tags table
   CREATE TABLE participant_tags (
       id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
       event_id UUID REFERENCES events(id) ON DELETE CASCADE,
       user_id UUID REFERENCES users(id) ON DELETE CASCADE,
       tag_id UUID REFERENCES tags(id) ON DELETE CASCADE
   );

   -- Create favorites table
   CREATE TABLE favorites (
       id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
       event_id UUID REFERENCES events(id) ON DELETE CASCADE,
       user_id UUID REFERENCES users(id) ON DELETE CASCADE,
       favorited_user_id UUID REFERENCES users(id) ON DELETE CASCADE,
       created_at TIMESTAMP DEFAULT NOW(),
       UNIQUE(event_id, user_id, favorited_user_id)
   );

   -- Create indexes
   CREATE INDEX idx_events_slug ON events(slug);
   CREATE INDEX idx_event_participants_event ON event_participants(event_id);
   CREATE INDEX idx_participant_tags_event ON participant_tags(event_id);
   CREATE INDEX idx_favorites_event ON favorites(event_id);

   -- Create view
   CREATE VIEW event_participant_count AS
   SELECT event_id, COUNT(*) as total_participants
   FROM event_participants
   GROUP BY event_id;
   ```

---

### Step 8: Test Your Deployment

1. **Test Health Endpoint**:
   ```bash
   curl https://your-app.onrender.com/health
   ```
   Expected response:
   ```json
   {
     "status": "OK",
     "timestamp": "2026-03-06T10:00:00.000Z",
     "uptime": 123.456
   }
   ```

2. **Test Root Endpoint**:
   ```bash
   curl https://your-app.onrender.com/
   ```
   Expected: `API is running 🚀`

3. **Check Logs**:
   - Go to your web service on Render
   - Click **"Logs"** tab
   - Look for: `✅ Keep-alive ping successful`
   - This confirms the auto-ping is working

---

### Step 9: Update Frontend Configuration

Update your frontend environment variables:

```bash
VITE_API_URL=https://your-app.onrender.com/api
```

Redeploy your frontend (Vercel):
```bash
vercel --prod
```

---

## 🔄 Keep-Alive Mechanism (No Cold Starts!)

### How It Works:

1. **Automatic Ping**: When deployed on Render, the backend automatically pings itself every 14 minutes
2. **Free Tier Limit**: Render free tier spins down after 15 minutes of inactivity
3. **Stay Active**: Our keep-alive service prevents this by pinging `/health` endpoint
4. **Smart Detection**: Only activates in production when `RENDER_EXTERNAL_URL` is set

### Monitor Keep-Alive:

Check logs for these messages:
```
🔄 Starting keep-alive service for https://your-app.onrender.com
📍 Ping interval: 14 minutes
✅ Keep-alive ping successful at 2026-03-06T10:14:00.000Z
```

### Disable Keep-Alive (Optional):

If you upgrade to a paid plan and don't need keep-alive:

1. Remove `RENDER_EXTERNAL_URL` from environment variables, OR
2. Set `NODE_ENV` to something other than `production`

---

## 🎯 Post-Deployment Checklist

- ✅ Database schema created successfully
- ✅ Health endpoint returns 200 OK
- ✅ Keep-alive logs show successful pings
- ✅ Frontend can connect to backend API
- ✅ Firebase authentication works
- ✅ CORS configured correctly (check frontend URL in env vars)
- ✅ Environment variables are all set

---

## 🛠️ Troubleshooting

### Issue: "Module not found" error

**Solution**: Check `Root Directory` is set to `backend` in Render settings

### Issue: Database connection failed

**Solution**: 
1. Verify `DATABASE_URL` is correct (from Neon console)
2. Check Neon database is active (not suspended)
3. Ensure connection string includes `?sslmode=require`
4. Verify Neon project is not paused (free tier auto-pauses after inactivity)

### Issue: Firebase authentication not working

**Solution**:
1. Verify all three Firebase env vars are set correctly
2. Check `FIREBASE_PRIVATE_KEY` has quotes and `\n` characters
3. Restart the service after updating env vars

### Issue: CORS errors from frontend

**Solution**: 
1. Verify `FRONTEND_URL` env var matches your actual frontend URL
2. Check CORS configuration in `server.js`
3. Ensure frontend is using HTTPS (not HTTP)

### Issue: Service keeps going to sleep

**Solution**:
1. Check logs for "Keep-alive ping successful" messages
2. Verify `NODE_ENV=production` is set
3. Add `RENDER_EXTERNAL_URL` manually:
   ```
   RENDER_EXTERNAL_URL=https://your-app.onrender.com
   ```

### Issue: Build fails

**Solution**:
1. Check `package.json` has all dependencies
2. Verify Node version compatibility (Render uses Node 20 by default)
3. Review build logs for specific errors

---

## 📊 Monitoring & Maintenance

### View Logs:
1. Go to your web service on Render
2. Click **"Logs"** tab
3. Real-time logs show all requests and errors

### Monitor Uptime:
1. Use Render's built-in metrics (Dashboard → Service → Metrics)
2. Set up UptimeRobot for external monitoring (free): [uptimerobot.com](https://uptimerobot.com)

### Database Backups:
- **Free Plan**: Manual exports only
- **Paid Plan**: Automatic daily backups
- Export manually: Dashboard → Database → Settings → Export

---

## 🔐 Security Best Practices

1. **Never commit** `serviceAccountKey.json` to GitHub
2. **Use environment variables** for all secrets
3. **Rotate Firebase keys** periodically
4. **Enable 2FA** on Render account
5. **Whitelist IPs** for database access (paid feature)

---

## 💰 Pricing & Limits

### Render Web Services (Free Tier):
- ✅ 750 hours/month (enough for 1 service 24/7)
- ✅ Spins down after 15 minutes (keep-alive prevents this)
- ❌ Cold start on first request after sleep (~30 seconds)
- **Upgrade**: Starter plan ($7/month) for no cold starts

### Neon PostgreSQL (Free Tier):
- ✅ 512 MB storage
- ✅ 3 GB data transfer/month
- ✅ Unlimited projects
- ⚠️ Auto-suspends after 5 minutes of inactivity
- ⚠️ **Database deleted after 7 days of inactivity** on free tier
- **Upgrade**: Launch plan ($19/month) for always-active database

**💡 Keep Neon Active**: 
- Run queries regularly (our keep-alive pings the API, not the DB)
- Neon will auto-suspend between requests (this is normal)
- To prevent deletion, log into Neon console weekly, OR upgrade to paid plan

---

## 🎓 Additional Resources

- [Render Documentation](https://render.com/docs)
- [PostgreSQL on Render](https://render.com/docs/databases)
- [Node.js Deployment](https://render.com/docs/deploy-node-express-app)
- [Environment Variables](https://render.com/docs/environment-variables)

---

## 🆘 Need Help?

1. **Check Render Status**: [status.render.com](https://status.render.com)
2. **Render Community**: [community.render.com](https://community.render.com)
3. **Review Backend Logs**: Look for error messages
4. **Check API Documentation**: Refer to `API_DOCUMENTATION.md`

---

**🎉 Congratulations! Your backend is now live on Render with automatic keep-alive!**

Your API Base URL: `https://your-app.onrender.com/api`
