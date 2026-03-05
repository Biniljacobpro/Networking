# Quick Setup & Testing Guide

## Step 1: Verify Database Schema

Make sure you've run all the SQL commands from [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md) in your Neon PostgreSQL database.

---

## Step 2: Create a Super Admin User

Run this SQL in your Neon database to create a super admin:

```sql
INSERT INTO users (name, email, role) 
VALUES ('Super Admin', 'admin@example.com', 'SUPER_ADMIN');
```

---

## Step 3: Start the Server

```bash
npm run dev
```

You should see:
```
Server running on port 5000
```

---

## Step 4: Test API Endpoints

### Test 1: Health Check
```bash
curl http://localhost:5000/
```

Expected: `API is running 🚀`

### Test 2: Sync a Regular User (Firebase)
```bash
curl -X POST http://localhost:5000/api/auth/sync \
  -H "Content-Type: application/json" \
  -d '{
    "uid": "firebase123",
    "email": "user@example.com",
    "name": "John Doe"
  }'
```

### Test 3: Request Organizer Role
*(Requires Firebase JWT token)*

First, get a Firebase token from your frontend, then:

```bash
curl -X POST http://localhost:5000/api/users/request-organizer \
  -H "Authorization: Bearer YOUR_FIREBASE_TOKEN"
```

### Test 4: Super Admin - Approve Organizer
*(Get the user ID from Step 2 response)*

```bash
curl -X PATCH http://localhost:5000/api/users/admin/approve-organizer/USER_ID \
  -H "Authorization: Bearer SUPER_ADMIN_FIREBASE_TOKEN"
```

### Test 5: Create an Event
*(As Organizer)*

```bash
curl -X POST http://localhost:5000/api/events \
  -H "Authorization: Bearer ORGANIZER_FIREBASE_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Tech Conference 2026",
    "description": "Annual tech conference for networking",
    "location": "Convention Center, New York",
    "event_date": "2026-06-15",
    "tags": ["Investor", "Startup Founder", "Developer", "Designer"]
  }'
```

### Test 6: Super Admin - Approve Event
*(Get event ID from Step 5 response)*

```bash
curl -X PATCH http://localhost:5000/api/events/EVENT_ID/approve \
  -H "Authorization: Bearer SUPER_ADMIN_FIREBASE_TOKEN"
```

### Test 7: Join Event
*(As Participant - get slug from event creation response)*

```bash
curl -X POST http://localhost:5000/api/participants/join/EVENT_SLUG \
  -H "Authorization: Bearer PARTICIPANT_FIREBASE_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "join_method": "QR",
    "selected_tags": ["TAG_ID_1", "TAG_ID_2"],
    "linkedin_url": "https://linkedin.com/in/johndoe",
    "company": "Tech Corp",
    "designation": "Software Engineer"
  }'
```

### Test 8: View Event Directory
```bash
curl "http://localhost:5000/api/participants/events/EVENT_ID/directory?search=john&tags=Developer" \
  -H "Authorization: Bearer PARTICIPANT_FIREBASE_TOKEN"
```

### Test 9: Add to Favorites
```bash
curl -X POST http://localhost:5000/api/favorites/events/EVENT_ID/participants/PARTICIPANT_ID \
  -H "Authorization: Bearer YOUR_FIREBASE_TOKEN"
```

### Test 10: View Analytics
*(As Organizer)*

```bash
curl http://localhost:5000/api/analytics/events/EVENT_ID \
  -H "Authorization: Bearer ORGANIZER_FIREBASE_TOKEN"
```

---

## Step 5: Connect Frontend

Your React frontend should:

1. **Initialize Firebase Client SDK**
2. **Authenticate users with Firebase**
3. **Send Firebase ID token to your backend**
4. **Make API calls with token in Authorization header**

Example frontend API call:
```javascript
const token = await firebase.auth().currentUser.getIdToken();

const response = await fetch('http://localhost:5000/api/events/approved', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});
```

---

## Step 6: Test Full User Flow

### Participant Journey:
1. ✅ User signs up via Firebase (Frontend)
2. ✅ Frontend calls `/api/auth/sync` to create user in DB
3. ✅ User scans QR code or clicks link → Frontend redirects to `/join/:slug`
4. ✅ Frontend calls `GET /api/events/slug/:slug` to get event details
5. ✅ User fills profile and selects tags
6. ✅ Frontend calls `POST /api/participants/join/:slug`
7. ✅ User browses directory → `GET /api/participants/events/:eventId/directory`
8. ✅ User adds favorites → `POST /api/favorites/events/:eventId/participants/:participantId`
9. ✅ User views favorites → `GET /api/favorites/all`

### Organizer Journey:
1. ✅ User requests organizer role → `POST /api/users/request-organizer`
2. ✅ Super admin approves → `PATCH /api/users/admin/approve-organizer/:userId`
3. ✅ Organizer creates event → `POST /api/events`
4. ✅ Super admin approves event → `PATCH /api/events/:id/approve`
5. ✅ Organizer generates QR → `GET /api/events/:slug/qr`
6. ✅ Organizer shares link/QR code
7. ✅ Organizer views analytics → `GET /api/analytics/events/:eventId`
8. ✅ Organizer exports data → `GET /api/analytics/events/:eventId/export`

---

## Common Issues & Solutions

### Issue 1: "No token provided"
**Solution:** Make sure you're sending the Firebase token in the Authorization header:
```
Authorization: Bearer <token>
```

### Issue 2: "User not found in DB"
**Solution:** Call `/api/auth/sync` first to create the user in your database.

### Issue 3: Database connection error
**Solution:** 
- Check your `DATABASE_URL` in `.env`
- Verify Neon database is accessible
- Check if all tables are created

### Issue 4: "Access denied"
**Solution:** Check user role in database. Use correct role for endpoint:
- Super Admin endpoints need `SUPER_ADMIN` role
- Organizer endpoints need `ORGANIZER` role

### Issue 5: Firebase authentication error
**Solution:** 
- Verify `serviceAccountKey.json` is in the root directory
- Check Firebase project configuration
- Ensure token is valid and not expired

---

## Environment Variables Checklist

Make sure your `.env` has:
```env
PORT=5000
DATABASE_URL=postgresql://...
FRONTEND_URL=http://localhost:3000
```

---

## Database Quick Checks

### Check if tables exist:
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public';
```

### Check user roles:
```sql
SELECT id, name, email, role FROM users;
```

### Check events:
```sql
SELECT id, name, status, organizer_id FROM events;
```

### Check participants:
```sql
SELECT e.name as event_name, u.name as participant_name, ep.join_method
FROM event_participants ep
JOIN events e ON ep.event_id = e.id
JOIN users u ON ep.user_id = u.id;
```

---

## Postman Collection

Import this collection for easy testing: [Create a Postman collection with all endpoints]

---

## Next Steps

1. ✅ Test all API endpoints
2. ✅ Build React frontend
3. ✅ Integrate Firebase authentication
4. ✅ Implement QR code scanning
5. ✅ Deploy backend (Render, Railway, or AWS)
6. ✅ Deploy frontend (Vercel, Netlify)

---

**Happy Building! 🚀**
