# Render Deployment - Quick Reference

## 🚀 Quick Setup Commands

### 1. Prepare for Deployment
```bash
cd backend
npm install
git add .
git commit -m "Ready for Render deployment"
git push origin main
```

### 2. Essential Environment Variables

Copy these to Render:
```env
NODE_ENV=production
PORT=5000
DATABASE_URL=<your-neon-connection-string>
FRONTEND_URL=https://your-frontend.vercel.app
FIREBASE_PROJECT_ID=<from-serviceAccountKey.json>
FIREBASE_CLIENT_EMAIL=<from-serviceAccountKey.json>
FIREBASE_PRIVATE_KEY="<from-serviceAccountKey.json-with-\n>"
```

**Extract Firebase values from `serviceAccountKey.json`**:
- `project_id` → FIREBASE_PROJECT_ID
- `client_email` → FIREBASE_CLIENT_EMAIL
- `private_key` → FIREBASE_PRIVATE_KEY (include quotes and `\n` characters!)

### 3. Render Configuration

**Web Service:**
- Build Command: `npm install`
- Start Command: `npm start`
- Health Check: `/health`
- Root Directory: `backend`

**Database:**
- Using **Neon PostgreSQL** (external)
- Get connection string from [neon.tech](https://console.neon.tech)
- No database creation needed on Render

## 🔄 Keep-Alive Setup

**Automatic!** The keep-alive service starts automatically when:
- `NODE_ENV=production`
- `RENDER_EXTERNAL_URL` is set (auto-set by Render)

Check logs for: `✅ Keep-alive ping successful`

## 📝 Important URLs

- **Health Check**: `https://your-app.onrender.com/health`
- **API Base**: `https://your-app.onrender.com/api`
- **Root**: `https://your-app.onrender.com/`

## ⚡ Ping Schedule

- Interval: Every **14 minutes**
- Purpose: Prevent cold starts (free tier sleeps after 15 min)
- First ping: 1 minute after startup
- Endpoint: `/health`

## 🎯 Deployment Checklist

- [ ] Push code to GitHub
- [ ] Get Neon PostgreSQL connection string from [neon.tech](https://console.neon.tech)
- [ ] Extract Firebase credentials from `serviceAccountKey.json`
- [ ] Create Web Service on Render
- [ ] Set all environment variables (especially DATABASE_URL with Neon)
- [ ] Deploy and wait for "Your service is live"
- [ ] Verify database schema exists in Neon
- [ ] Test `/health` endpoint
- [ ] Verify keep-alive logs
- [ ] Update frontend API URL
- [ ] Test end-to-end functionality

## 🐛 Common Issues

| Problem | Solution |
|---------|----------|
| Module not found | Set Root Directory to `backend` |
| DB connection failed | Check DATABASE_URL from Neon, verify Neon DB is active |
| Firebase auth fails | Check env vars, include quotes in PRIVATE_KEY |
| CORS errors | Verify FRONTEND_URL matches actual URL |
| Still going to sleep | Check keep-alive logs, verify ENV vars |
| Neon DB suspended | Normal behavior, auto-resumes on query |

## 📊 Monitor Your App

```bash
# Test health endpoint
curl https://your-app.onrender.com/health

# Check if API is running
curl https://your-app.onrender.com/

# View logs
# Go to Render Dashboard → Your Service → Logs
```

## 🔐 Security Reminders

- ✅ Never commit `.env` or `serviceAccountKey.json`
- ✅ Use `.env.example` as template
- ✅ Rotate Firebase keys periodically
- ✅ Enable 2FA on Render

## 💡 Pro Tips

1. **Neon + Render**: Perfect combo for free tier deployment
2. **Monitor Logs**: Check for keep-alive pings regularly
3. **Neon Auto-Suspend**: Normal behavior, resumes automatically on query
4. **External Monitoring**: Use UptimeRobot for extra monitoring
5. **Database Backups**: Use Neon's built-in backups or export regularly
6. **Neon Free Tier**: Database deleted after 7 days of inactivity - log in weekly!

## 📚 Full Documentation

For detailed step-by-step instructions, see:
- [RENDER_DEPLOYMENT.md](RENDER_DEPLOYMENT.md) - Complete deployment guide
- [API_DOCUMENTATION.md](API_DOCUMENTATION.md) - API reference
- [DATABASE_SCHEMA.md](DATABASE_SCHEMA.md) - Database structure

## 🆘 Need Help?

1. Check [RENDER_DEPLOYMENT.md](RENDER_DEPLOYMENT.md) troubleshooting section
2. Review Render logs for errors
3. Visit [community.render.com](https://community.render.com)
4. Check [status.render.com](https://status.render.com)

---

**Ready to deploy? Follow [RENDER_DEPLOYMENT.md](RENDER_DEPLOYMENT.md) for complete instructions!**
