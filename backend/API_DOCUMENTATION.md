# API Documentation

Base URL: `http://localhost:5000/api`

## Authentication

All protected routes require a Bearer token in the Authorization header:
```
Authorization: Bearer <firebase_token>
```

---

## 1. Authentication Routes

### POST `/auth/sync`
**Description:** Sync user from Firebase to database  
**Auth Required:** No  
**Body:**
```json
{
  "uid": "firebase_uid",
  "email": "user@example.com",
  "name": "John Doe"
}
```

---

## 2. User Routes

### GET `/users/profile`
**Description:** Get current user profile  
**Auth Required:** Yes  
**Response:**
```json
{
  "id": "uuid",
  "name": "John Doe",
  "email": "user@example.com",
  "role": "PARTICIPANT",
  "linkedin_url": "https://linkedin.com/in/johndoe",
  "company": "Tech Corp",
  "designation": "Software Engineer"
}
```

### PUT `/users/profile`
**Description:** Update user profile  
**Auth Required:** Yes  
**Body:**
```json
{
  "name": "John Doe",
  "linkedin_url": "https://linkedin.com/in/johndoe",
  "company": "Tech Corp",
  "designation": "Software Engineer"
}
```

### GET `/users/joined-events`
**Description:** Get all events user has joined  
**Auth Required:** Yes

### POST `/users/request-organizer`
**Description:** Request organizer role  
**Auth Required:** Yes  
**Role:** PARTICIPANT

### GET `/users/admin/pending-organizers`
**Description:** Get pending organizer requests  
**Auth Required:** Yes  
**Role:** SUPER_ADMIN

### PATCH `/users/admin/approve-organizer/:userId`
**Description:** Approve organizer request  
**Auth Required:** Yes  
**Role:** SUPER_ADMIN

---

## 3. Event Routes

### POST `/events`
**Description:** Create new event  
**Auth Required:** Yes  
**Role:** ORGANIZER  
**Body:**
```json
{
  "name": "Tech Conference 2026",
  "description": "Annual tech conference",
  "location": "Convention Center",
  "event_date": "2026-06-15",
  "tags": ["Investor", "Startup Founder", "Developer"]
}
```

### GET `/events/slug/:slug`
**Description:** Get event details by slug (Public)  
**Auth Required:** No

### GET `/events/:id`
**Description:** Get event by ID  
**Auth Required:** Yes

### GET `/events/approved`
**Description:** Get all approved events  
**Auth Required:** Yes

### GET `/events/my-events`
**Description:** Get organizer's events  
**Auth Required:** Yes  
**Role:** ORGANIZER

### PUT `/events/:id`
**Description:** Update event  
**Auth Required:** Yes  
**Role:** ORGANIZER (must own event)  
**Body:**
```json
{
  "name": "Updated Event Name",
  "description": "Updated description",
  "location": "New Location",
  "event_date": "2026-07-20"
}
```

### PATCH `/events/:id/archive`
**Description:** Archive event  
**Auth Required:** Yes  
**Role:** ORGANIZER (must own event)

### GET `/events/:slug/qr`
**Description:** Generate QR code for event  
**Auth Required:** Yes

### GET `/events/admin/pending`
**Description:** Get pending events for approval  
**Auth Required:** Yes  
**Role:** SUPER_ADMIN

### PATCH `/events/:id/approve`
**Description:** Approve event  
**Auth Required:** Yes  
**Role:** SUPER_ADMIN

### PATCH `/events/:id/reject`
**Description:** Reject event  
**Auth Required:** Yes  
**Role:** SUPER_ADMIN

---

## 4. Participant Routes

### POST `/participants/join/:slug`
**Description:** Join event via QR or link  
**Auth Required:** Yes  
**Body:**
```json
{
  "join_method": "QR",
  "selected_tags": ["tag_id_1", "tag_id_2"],
  "linkedin_url": "https://linkedin.com/in/johndoe",
  "company": "Tech Corp",
  "designation": "Software Engineer"
}
```

### GET `/participants/events/:eventId/directory`
**Description:** Get event directory (participants only)  
**Auth Required:** Yes  
**Query Params:**
- `search`: Search by name, company, or designation
- `tags`: Filter by tags (comma-separated)

**Example:** `/participants/events/123/directory?search=john&tags=Developer,Investor`

### GET `/participants/events/:eventId/participants/:participantId`
**Description:** Get participant profile in event  
**Auth Required:** Yes

### PUT `/participants/events/:eventId/my-tags`
**Description:** Update my tags for an event  
**Auth Required:** Yes  
**Body:**
```json
{
  "tag_ids": ["tag_id_1", "tag_id_2"]
}
```

---

## 5. Tag Routes

### GET `/tags/events/:eventId`
**Description:** Get all tags for an event  
**Auth Required:** Yes

### POST `/tags/events/:eventId`
**Description:** Create tags for event  
**Auth Required:** Yes  
**Role:** ORGANIZER (must own event)  
**Body:**
```json
{
  "tags": ["Investor", "Startup Founder", "Developer", "Designer"]
}
```

### PUT `/tags/:tagId`
**Description:** Update tag name  
**Auth Required:** Yes  
**Role:** ORGANIZER (must own event)  
**Body:**
```json
{
  "name": "Updated Tag Name"
}
```

### DELETE `/tags/:tagId`
**Description:** Delete tag  
**Auth Required:** Yes  
**Role:** ORGANIZER (must own event)

### GET `/tags/events/:eventId/distribution`
**Description:** Get tag distribution analytics  
**Auth Required:** Yes  
**Role:** ORGANIZER (must own event)

---

## 6. Favorites Routes

### POST `/favorites/events/:eventId/participants/:participantId`
**Description:** Add participant to favorites  
**Auth Required:** Yes

### DELETE `/favorites/events/:eventId/participants/:participantId`
**Description:** Remove from favorites  
**Auth Required:** Yes

### GET `/favorites/events/:eventId`
**Description:** Get favorites for specific event  
**Auth Required:** Yes

### GET `/favorites/all`
**Description:** Get all favorites across all events  
**Auth Required:** Yes

---

## 7. Analytics Routes

### GET `/analytics/dashboard`
**Description:** Get organizer dashboard statistics  
**Auth Required:** Yes  
**Role:** ORGANIZER  
**Response:**
```json
{
  "event_statistics": {
    "pending": 2,
    "approved": 5,
    "rejected": 0,
    "archived": 1,
    "total": 8
  },
  "total_participants_reached": 450,
  "most_popular_event": {
    "id": "event_id",
    "name": "Tech Conference",
    "participant_count": 200
  },
  "recent_events": []
}
```

### GET `/analytics/events/:eventId`
**Description:** Get detailed event analytics  
**Auth Required:** Yes  
**Role:** ORGANIZER (must own event)  
**Response:**
```json
{
  "total_participants": 150,
  "join_method_distribution": [
    { "join_method": "QR", "count": 100 },
    { "join_method": "LINK", "count": 50 }
  ],
  "tag_distribution": [],
  "engagement": {
    "users_who_favorited": 80,
    "total_favorites": 250
  },
  "profile_completion": {
    "with_linkedin": 120,
    "with_company": 140,
    "with_designation": 135,
    "total": 150
  },
  "recent_joins": [],
  "joins_over_time": []
}
```

### GET `/analytics/events/:eventId/export`
**Description:** Export event participants data  
**Auth Required:** Yes  
**Role:** ORGANIZER (must own event)

---

## User Roles

1. **SUPER_ADMIN** - Platform administrator
2. **ORGANIZER** - Can create and manage events
3. **ORGANIZER_PENDING** - Requested organizer role
4. **PARTICIPANT** - Default role for attendees

---

## Event Status

1. **PENDING** - Awaiting approval
2. **APPROVED** - Active event
3. **REJECTED** - Rejected by admin
4. **ARCHIVED** - Archived by organizer

---

## Join Methods

1. **QR** - Joined by scanning QR code
2. **LINK** - Joined via direct link

---

## Error Responses

All endpoints return standard error responses:

```json
{
  "error": "Error message",
  "message": "Detailed description"
}
```

**Common Status Codes:**
- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 500: Internal Server Error

---

## Event Flow

1. **Organizer** requests organizer role → **SUPER_ADMIN** approves
2. **Organizer** creates event with tags → Status: PENDING
3. **SUPER_ADMIN** approves event → Status: APPROVED
4. **Organizer** generates QR code/link
5. **Participants** scan QR or click link → Join event
6. **Participants** complete profile and select tags
7. **Participants** browse event directory, search, filter
8. **Participants** add others to favorites
9. **Organizer** views analytics and exports data
