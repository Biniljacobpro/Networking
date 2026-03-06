# Frontend Development Checklist

This document outlines what your React frontend needs to implement to work with this backend.

---

## 🔥 Firebase Setup (Required)

### 1. Initialize Firebase in React
```bash
npm install firebase
```

```javascript
// src/firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  // ... other config
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
```

### 2. Authentication Functions
```javascript
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';

// Sign up
const signUp = async (email, password, name) => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const token = await userCredential.user.getIdToken();
  
  // Sync with backend
  await fetch('http://localhost:5000/api/auth/sync', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      uid: userCredential.user.uid,
      email: userCredential.user.email,
      name: name
    })
  });
};
```

---

## 📱 Required Pages/Routes

### Public Pages
- ✅ `/` - Landing page
- ✅ `/login` - Login page
- ✅ `/signup` - Registration page
- ✅ `/join/:slug` - Event join page (public, but requires login)

### Participant Pages
- ✅ `/dashboard` - User dashboard (joined events)
- ✅ `/events` - Browse all approved events
- ✅ `/events/:eventId/directory` - Event participant directory
- ✅ `/events/:eventId/participants/:participantId` - Participant profile
- ✅ `/profile` - Edit my profile
- ✅ `/favorites` - My favorites across all events

### Organizer Pages
- ✅ `/organizer/dashboard` - Organizer analytics dashboard
- ✅ `/organizer/events` - My events list
- ✅ `/organizer/events/create` - Create new event
- ✅ `/organizer/events/:eventId/edit` - Edit event
- ✅ `/organizer/events/:eventId/analytics` - Event analytics
- ✅ `/organizer/events/:eventId/qr` - View/Download QR code

### Super Admin Pages
- ✅ `/admin/dashboard` - Admin dashboard
- ✅ `/admin/events/pending` - Pending events approval
- ✅ `/admin/organizers/pending` - Pending organizer requests

---

## 🎯 Key Features to Implement

### 1. Authentication Flow
```javascript
// Create auth context
import { createContext, useContext, useEffect, useState } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
      if (firebaseUser) {
        const token = await firebaseUser.getIdToken();
        setToken(token);
        
        // Fetch user data from your backend
        const response = await fetch('http://localhost:5000/api/users/profile', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const userData = await response.json();
        setUser(userData);
      } else {
        setUser(null);
        setToken(null);
      }
    });
    
    return unsubscribe;
  }, []);
  
  return (
    <AuthContext.Provider value={{ user, token }}>
      {children}
    </AuthContext.Provider>
  );
};
```

### 2. API Helper Function
```javascript
// src/utils/api.js
const API_BASE = 'http://localhost:5000/api';

export const apiCall = async (endpoint, options = {}) => {
  const token = await auth.currentUser?.getIdToken();
  
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options.headers,
    },
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'API call failed');
  }
  
  return response.json();
};
```

### 3. QR Code Scanner
```bash
npm install react-qr-scanner
# or
npm install html5-qrcode
```

```javascript
import QrScanner from 'react-qr-scanner';

const QRCodeScanner = () => {
  const handleScan = (data) => {
    if (data) {
      // Extract slug from URL
      const slug = data.text.split('/join/')[1];
      window.location.href = `/join/${slug}`;
    }
  };
  
  return <QrScanner onScan={handleScan} />;
};
```

### 4. QR Code Display (Organizer)
```bash
npm install qrcode.react
```

```javascript
import QRCode from 'qrcode.react';

const EventQRCode = ({ eventSlug }) => {
  const joinUrl = `${window.location.origin}/join/${eventSlug}`;
  
  return (
    <div>
      <QRCode value={joinUrl} size={256} />
      <p>Scan to join event</p>
      <button onClick={() => {
        // Download QR code
        const canvas = document.querySelector('canvas');
        const url = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.download = 'event-qr.png';
        link.href = url;
        link.click();
      }}>
        Download QR Code
      </button>
    </div>
  );
};
```

---

## 📋 Component Examples

### Event Join Flow
```javascript
// pages/join/[slug].jsx
const JoinEventPage = () => {
  const { slug } = useParams();
  const { user, token } = useAuth();
  const [event, setEvent] = useState(null);
  const [tags, setTags] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [profile, setProfile] = useState({
    linkedin_url: '',
    company: '',
    designation: ''
  });
  
  useEffect(() => {
    // Fetch event details
    fetch(`http://localhost:5000/api/events/slug/${slug}`)
      .then(res => res.json())
      .then(data => {
        setEvent(data);
        setTags(data.tags);
      });
  }, [slug]);
  
  const handleJoin = async () => {
    await apiCall(`/participants/join/${slug}`, {
      method: 'POST',
      body: JSON.stringify({
        join_method: 'LINK', // or 'QR'
        selected_tags: selectedTags,
        ...profile
      })
    });
    
    // Redirect to event directory
    navigate(`/events/${event.id}/directory`);
  };
  
  return (
    <div>
      <h1>{event?.name}</h1>
      <p>{event?.description}</p>
      
      {/* Profile fields */}
      <input 
        placeholder="LinkedIn URL"
        value={profile.linkedin_url}
        onChange={(e) => setProfile({...profile, linkedin_url: e.target.value})}
      />
      
      {/* Tag selection */}
      {tags.map(tag => (
        <button
          key={tag.id}
          onClick={() => {
            if (selectedTags.includes(tag.id)) {
              setSelectedTags(selectedTags.filter(id => id !== tag.id));
            } else {
              setSelectedTags([...selectedTags, tag.id]);
            }
          }}
          className={selectedTags.includes(tag.id) ? 'selected' : ''}
        >
          {tag.name}
        </button>
      ))}
      
      <button onClick={handleJoin}>Join Event</button>
    </div>
  );
};
```

### Event Directory with Search & Filter
```javascript
// pages/events/[eventId]/directory.jsx
const EventDirectory = () => {
  const { eventId } = useParams();
  const [participants, setParticipants] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  
  useEffect(() => {
    const queryParams = new URLSearchParams();
    if (search) queryParams.append('search', search);
    if (selectedTags.length > 0) queryParams.append('tags', selectedTags.join(','));
    
    apiCall(`/participants/events/${eventId}/directory?${queryParams}`)
      .then(setParticipants);
  }, [eventId, search, selectedTags]);
  
  const toggleFavorite = async (participantId, isFavorited) => {
    if (isFavorited) {
      await apiCall(`/favorites/events/${eventId}/participants/${participantId}`, {
        method: 'DELETE'
      });
    } else {
      await apiCall(`/favorites/events/${eventId}/participants/${participantId}`, {
        method: 'POST'
      });
    }
    // Refresh list
  };
  
  return (
    <div>
      <input 
        placeholder="Search by name, company..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      
      {/* Tag filters */}
      
      <div className="participants-grid">
        {participants.map(participant => (
          <div key={participant.id} className="participant-card">
            <h3>{participant.name}</h3>
            <p>{participant.company} - {participant.designation}</p>
            <div className="tags">
              {participant.tags?.map(tag => <span key={tag}>{tag}</span>)}
            </div>
            <button onClick={() => toggleFavorite(participant.id, participant.is_favorited)}>
              {participant.is_favorited ? '★' : '☆'}
            </button>
            <a href={participant.linkedin_url} target="_blank">LinkedIn</a>
          </div>
        ))}
      </div>
    </div>
  );
};
```

### Organizer Dashboard
```javascript
const OrganizerDashboard = () => {
  const [stats, setStats] = useState(null);
  
  useEffect(() => {
    apiCall('/analytics/dashboard').then(setStats);
  }, []);
  
  return (
    <div>
      <h1>Organizer Dashboard</h1>
      <div className="stats-grid">
        <div>Total Events: {stats?.event_statistics.total}</div>
        <div>Approved: {stats?.event_statistics.approved}</div>
        <div>Pending: {stats?.event_statistics.pending}</div>
        <div>Total Participants: {stats?.total_participants_reached}</div>
      </div>
      
      <h2>Recent Events</h2>
      {stats?.recent_events.map(event => (
        <div key={event.id}>
          <h3>{event.name}</h3>
          <p>{event.participant_count} participants</p>
          <Link to={`/organizer/events/${event.id}/analytics`}>View Analytics</Link>
        </div>
      ))}
    </div>
  );
};
```

---

## 🎨 UI Libraries (Recommended)

- **UI Components:** Material-UI, Ant Design, or Chakra UI
- **Forms:** React Hook Form
- **State Management:** React Context API or Redux Toolkit
- **Routing:** React Router v6
- **Data Fetching:** React Query (optional, for caching)
- **Charts:** Recharts or Chart.js (for analytics)

---

## 🔒 Protected Routes Example

```javascript
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, token } = useAuth();
  
  if (!token) {
    return <Navigate to="/login" />;
  }
  
  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/dashboard" />;
  }
  
  return children;
};

// Usage
<Route path="/organizer/*" element={
  <ProtectedRoute allowedRoles={['ORGANIZER']}>
    <OrganizerDashboard />
  </ProtectedRoute>
} />
```

---

## 📊 State Management Structure

```javascript
// Context structure suggestion
{
  auth: {
    user: {...},
    token: "...",
    isAuthenticated: true
  },
  events: {
    myEvents: [],
    joinedEvents: [],
    approvedEvents: []
  },
  profile: {...},
  favorites: []
}
```

---

## ✅ Testing Checklist

- [ ] User can sign up and login
- [ ] User syncs with backend database
- [ ] Participant can join event via link
- [ ] Participant can scan QR code
- [ ] Directory shows all participants
- [ ] Search works correctly
- [ ] Tag filtering works
- [ ] Can add/remove favorites
- [ ] Organizer can create events
- [ ] Organizer can view analytics
- [ ] Super admin can approve events
- [ ] Super admin can approve organizers
- [ ] Profile updates work
- [ ] Role-based access control works

---

## 🚀 Deployment

### Frontend (Vercel/Netlify)
- Update API_BASE to production URL
- Set environment variables
- Deploy

### Backend (Already built!)
- Deploy to Render, Railway, or AWS
- Set environment variables
- Update FRONTEND_URL in backend .env

---

**All backend APIs are ready to use! Happy coding! 🎉**
