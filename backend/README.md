# Event-Based Networking & Smart Participant Directory Platform

A comprehensive backend system for event networking that enables organizers to create events and participants to connect meaningfully through QR codes or direct links.

## 🚀 Features

### For Super Admins
- ✅ Approve/Reject events
- ✅ Approve/Reject organizer requests
- ✅ Platform oversight

### For Organizers
- ✅ Create and manage events
- ✅ Define custom tags for events
- ✅ Generate QR codes and shareable links
- ✅ View comprehensive analytics
- ✅ Export participant data
- ✅ Track engagement metrics

### For Participants
- ✅ Join events via QR code or link
- ✅ Create and update profile
- ✅ Select relevant tags
- ✅ Browse event directory
- ✅ Search and filter participants
- ✅ Add favorites
- ✅ Access past events

## 🛠️ Tech Stack

- **Backend:** Node.js + Express.js
- **Database:** PostgreSQL (Neon)
- **Authentication:** Firebase Admin SDK
- **QR Generation:** qrcode package
- **Security:** Helmet, CORS

## 📦 Installation

1. Clone the repository
```bash
git clone <your-repo-url>
cd Networking
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables

Create a `.env` file in the root directory:
```env
PORT=5000
DATABASE_URL=your_postgresql_connection_string
FRONTEND_URL=http://localhost:3000
```

4. Set up Firebase

Place your `serviceAccountKey.json` in the root directory.

5. Set up the database

Run the SQL commands from [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md) in your PostgreSQL database.

6. Start the development server
```bash
npm run dev
```

Server will run on `http://localhost:5000`

## 📁 Project Structure

```
src/
├── config/
│   ├── db.js              # PostgreSQL connection
│   └── firebase.js        # Firebase Admin SDK setup
├── controllers/
│   ├── authController.js       # User sync
│   ├── eventController.js      # Event CRUD
│   ├── userController.js       # User management
│   ├── participantController.js # Event joining & directory
│   ├── tagController.js        # Tag management
│   ├── favoriteController.js   # Favorites system
│   └── analyticsController.js  # Analytics & reporting
├── middlewares/
│   ├── authMiddleware.js       # JWT verification
│   └── roleMiddleware.js       # Role-based access control
├── routes/
│   ├── authRoutes.js
│   ├── eventRoutes.js
│   ├── userRoutes.js
│   ├── participantRoutes.js
│   ├── tagRoutes.js
│   ├── favoriteRoutes.js
│   └── analyticsRoutes.js
├── utils/
│   └── generateSlug.js    # Unique slug generation
└── server.js              # Express app setup
```

## 📚 Documentation

- [Database Schema](./DATABASE_SCHEMA.md) - Complete database structure
- [API Documentation](./API_DOCUMENTATION.md) - All API endpoints
- [Firebase Credentials Guide](./FIREBASE_CREDENTIALS_GUIDE.md) - How to extract and configure Firebase credentials
- [Render Deployment Guide](./RENDER_DEPLOYMENT.md) - Step-by-step deployment to Render
- [Quick Start Guide](./RENDER_QUICK_START.md) - Quick reference for deployment

## 🚀 Deployment to Render

This project is ready for deployment on Render with automatic keep-alive functionality to prevent cold starts.

**Quick Start:**
1. See [RENDER_QUICK_START.md](./RENDER_QUICK_START.md) for a quick reference
2. Follow [RENDER_DEPLOYMENT.md](./RENDER_DEPLOYMENT.md) for detailed step-by-step instructions

**Key Features:**
- ✅ Automatic keep-alive ping (prevents cold starts)
- ✅ PostgreSQL database included
- ✅ Health check endpoint at `/health`
- ✅ Environment variable configuration
- ✅ One-click deployment from GitHub

## 🔐 Authentication

All protected endpoints require a Firebase JWT token:

```
Authorization: Bearer <firebase_token>
```

## 👥 User Roles

1. **SUPER_ADMIN** - Platform administrator
2. **ORGANIZER** - Event creators
3. **ORGANIZER_PENDING** - Awaiting approval
4. **PARTICIPANT** - Event attendees (default)

## 🎯 Core Workflows

### Event Creation Flow
1. User requests organizer role
2. Super admin approves request
3. Organizer creates event with tags
4. Super admin approves event
5. Event becomes accessible via QR/Link

### Event Join Flow
1. Participant scans QR or clicks link
2. Redirected to event page
3. Completes profile and selects tags
4. Joins event
5. Gains access to event directory

### Networking Flow
1. Browse event directory
2. Search by name/company
3. Filter by tags
4. View profiles
5. Add to favorites
6. Connect via LinkedIn

## 📊 Analytics Features

- Total participant count
- Join method distribution (QR vs Link)
- Tag distribution
- Engagement metrics (favorites)
- Profile completion rates
- Join timeline
- Export capability

## 🔒 Security Features

- Firebase JWT authentication
- Role-based access control
- Event-based data isolation
- SQL injection protection (parameterized queries)
- CORS enabled
- Helmet security headers
- UUID primary keys

## 📝 API Endpoints Overview

- **Auth:** `/api/auth`
- **Users:** `/api/users`
- **Events:** `/api/events`
- **Participants:** `/api/participants`
- **Tags:** `/api/tags`
- **Favorites:** `/api/favorites`
- **Analytics:** `/api/analytics`

See [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) for details.

## 🚦 Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

## 🧪 Testing

```bash
# Start dev server
npm run dev

# Test API
curl http://localhost:5000/
```

## 📄 License

ISC

## 👨‍💻 Author

Your Name

## 🤝 Contributing

Contributions welcome! Please read the contribution guidelines first.

## 📞 Support

For support, email your-email@example.com

---

**Built for meaningful professional connections at events** 🎯

