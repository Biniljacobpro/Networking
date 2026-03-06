# Firebase Credentials Setup Guide

## 📋 Overview
This guide explains how to extract Firebase credentials from your `serviceAccountKey.json` file and configure them for local development and Render deployment.

---

## 🔑 Extract Credentials from serviceAccountKey.json

Your `serviceAccountKey.json` file (located in the `backend` folder) contains all the Firebase credentials you need.

### Step 1: Open serviceAccountKey.json

The file looks like this:
```json
{
  "type": "service_account",
  "project_id": "event-networking-platform",
  "private_key_id": "...",
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w...\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-fbsvc@event-networking-platform.iam.gserviceaccount.com",
  "client_id": "...",
  ...
}
```

### Step 2: Extract Three Values

You need to extract these three fields:

| Field in JSON | Environment Variable | Example Value |
|--------------|---------------------|---------------|
| `project_id` | `FIREBASE_PROJECT_ID` | `event-networking-platform` |
| `client_email` | `FIREBASE_CLIENT_EMAIL` | `firebase-adminsdk-fbsvc@event-networking-platform.iam.gserviceaccount.com` |
| `private_key` | `FIREBASE_PRIVATE_KEY` | `"-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"` |

---

## 🖥️ Local Development Setup

### Your .env file should look like this:

```env
# Server Configuration
PORT=5000

# Database (Neon PostgreSQL)
DATABASE_URL='postgresql://neondb_owner:npg_xxxxx@ep-xxxx.neon.tech/neondb?sslmode=require&channel_binding=require'

# Frontend URL
FRONTEND_URL=http://localhost:3000

# Firebase Configuration (from serviceAccountKey.json)
FIREBASE_PROJECT_ID=event-networking-platform
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-fbsvc@event-networking-platform.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDacnPwoU/bJbOm...\n-----END PRIVATE KEY-----\n"
```

### ⚠️ Important Notes:

1. **FIREBASE_PRIVATE_KEY must include**:
   - Opening quote: `"`
   - Complete key with `\n` characters: `-----BEGIN PRIVATE KEY-----\n...`
   - Closing quote: `"`

2. **Do NOT remove the `\n` characters** - they represent line breaks and are required!

3. **Single line format**: Even though it has `\n`, keep it all on one line in your `.env` file

---

## ☁️ Render Deployment Setup

When deploying to Render, add these as environment variables:

### 1. FIREBASE_PROJECT_ID
```
event-networking-platform
```
Just copy the `project_id` value from your JSON file.

### 2. FIREBASE_CLIENT_EMAIL
```
firebase-adminsdk-fbsvc@event-networking-platform.iam.gserviceaccount.com
```
Just copy the `client_email` value from your JSON file.

### 3. FIREBASE_PRIVATE_KEY

**This one is tricky! Follow carefully:**

1. Copy the **entire** `private_key` value from your JSON file
2. **Include the surrounding quotes** from the JSON
3. Keep all `\n` characters

**Example**:
```
"-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDacnPwoU/bJbOm\n5bpdhkpvR5uU87fTJNR/RLnMN+oAgBvtqFWPdOR4SM9VDu5aA+pb5YwsX58GoQbq\ntXTv/2zTwgYCUg0qbGPo52zrxDYT3oy+s5ziQUOc0QXKMBmaUzrPALy2G6SRE2v6\noEXEJRXC6B/1Dkwsi+pGhD6DRjJqa/w7nFdflvg5p5g7zVrAVAoT0c879cw0V1EC\nDdtnGO44JxAvpG6fns20XVmDAL20cBCpRLfuMyMz1obVDa5FnPqgCsSPIoX20q1+\nUkr7O4ul9sGMIopCWxQfPhtmKmbphXLKrQnQLJSqg33BiaCu/r6zCi+FyLxh3EMz\nk6PYJaddAgMBAAECggEAKDQHRYKSvVzvduhxx7Om8FsH9b5zFv+AwlmGLmEeBnCN\nc0xXTtsvDzorOlbQpC1zTO1uwl3o2SH6sWiq+F6Ui1Z6n6O1O5kOPDeXcr6+SyLa\n2WAaIAPt6ycG/0Kh+6aUvLNAh+2HeJHP/iTQIjzHCAOLmiDDATHQ8KB3FtbtAWu+\nBoz3rz05yWNaCxDnt11CtxzR3edOxNI0mhZVO9L4A7Je5L2YbUpCvWPo6xndcTEl\nGl0n7ubh2I4G9PJ/hKH57s27VkJorVkUNMDTVxvsJngmEKcPJZDVmmJ9G/UBV+04\nzVLw6SG5spXIHrJJwr+kkoIbce8+ZxoCc87bst7UUQKBgQD/fgdz8WpkhIuyi1mN\nzixyZGrzwjxBpxLkD1fumrAXgdt4q19aVygm+djksbPgjgvNPKV8NqswzYWAoEqL\n99KBntLhSwEvy46J9t2AUjf9qqaVWV5vaZrcVGUliiRUQV32uIjvxiaKatnPWVk+\nYLc9Y77n7ofvx1oUlxYCk2G2hQKBgQDa4ZQejAdDf1gflLvyjNRAqsuZodXiCWZP\n7Ys5mKC/ZLXkpPS1ebNSMB6X1n6HRjHeuWV23lgUimwTHy2F2CH4MpVIj35P5v3v\n+m3RQHd8/mUe3OZCas7b+xw15SXZq5zJtZYP3vzoD1h2DmaEpXYTWkuRMluxtx7/\nonV4Dmig+QKBgQCHZJg6fxLslbkaMvKQTVQMgt6SsroP6KQAK4ljrqHmszBFMDvl\nug5TKVAhUXKLa3shliP0QVxTDnbTBR68MeZiPnJuZbsJQwwUXLhhCjEVwltpBeUf\nkY05eZfoXt6Fr+ZFmuEmf5FpBNrMIQNEJSi15agDbMqo7LH1+2L0lnnPqQKBgCHn\nBNFCcTGUPOsPV5k3FP07NzQBrCZJvG4u5fyy1lsu1zmmDz04r3zQdTyhfZGoXrsX\nzk5+G/h6hEjl8GAl3QUbmKHXkAICTlzoVjAuIxPaN4FzR7sL3iSWnYT/jEBN44ge\ntzKYIGY1Ukde7aQoGMTgnInN2gQJ0CRaXoWM/cnJAoGAaQb8xcFVHvDwEuq8X2nI\nYTFdSEYqv3YKul65IitEYhw2b6aUSQVgzUSx/0kF8QFvZcdCsbTKqLxsDHd/MEJd\nn79Cv7gCQd2Vkyvh/sIL7hQVwxLRoHz5HHW3Dcl0d9Nw/mQUDncZCXrwbso4HDiw\nuPFSX0wyzBRlserjUfuHVrU=\n-----END PRIVATE KEY-----\n"
```

**Visual Check**:
- ✅ Starts with `"`
- ✅ Has `-----BEGIN PRIVATE KEY-----\n`
- ✅ Has lots of characters with `\n` in between
- ✅ Ends with `\n-----END PRIVATE KEY-----\n"`

---

## 🛠️ How to Copy in Render

### Method 1: Copy from JSON directly (Recommended)

1. Open `serviceAccountKey.json` in a text editor
2. Find the `"private_key"` field
3. Copy **everything** from the opening `"` to the closing `"`
4. Paste directly into Render's environment variable field

### Method 2: Copy from your .env file

1. Open your `.env` file
2. Find the `FIREBASE_PRIVATE_KEY=` line
3. Copy everything **after** the `=` sign (including quotes)
4. Paste into Render's environment variable field

---

## 🧪 Testing Your Configuration

### Test Locally:

```bash
cd backend
node -e "console.log('Project ID:', process.env.FIREBASE_PROJECT_ID)"
```

Expected output: Your project ID

### Test in Code:

The backend automatically loads these from environment variables. Your Firebase config in `src/config/firebase.js` should work automatically.

---

## ❌ Common Mistakes

### ❌ Missing quotes around private key
```env
FIREBASE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\n...
```
**Fix**: Add quotes at start and end

### ❌ Removed \n characters
```env
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----MIIEvQIBADANBg..."
```
**Fix**: Keep all `\n` characters from the original JSON

### ❌ Split across multiple lines
```env
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQEFAASC...
-----END PRIVATE KEY-----"
```
**Fix**: Keep it on a single line with `\n` characters

---

## 🔒 Security Reminder

- ✅ `.gitignore` includes `serviceAccountKey.json` - never commit this!
- ✅ `.gitignore` includes `.env` - never commit this!
- ✅ Use `.env.example` as a template for others
- ✅ Rotate Firebase keys periodically for production
- ✅ Never share your private key publicly

---

## 📚 Related Documentation

- [RENDER_DEPLOYMENT.md](RENDER_DEPLOYMENT.md) - Full deployment guide
- [RENDER_QUICK_START.md](RENDER_QUICK_START.md) - Quick reference
- [Firebase Admin SDK Docs](https://firebase.google.com/docs/admin/setup)

---

**Need help?** Check the troubleshooting section in [RENDER_DEPLOYMENT.md](RENDER_DEPLOYMENT.md)
