# Mini CRM - Client Lead Management System

A modern, full-stack CRM application for capturing, organizing, and tracking potential customer inquiries (Leads) generated from a company's website.

---

## 📋 Table of Contents

- [Project Objective](#project-objective)
- [Core Functionalities](#core-functionalities)
- [Workflow](#workflow)
- [User Roles](#user-roles)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [API Endpoints](#api-endpoints)
- [Lead Management](#lead-management)
- [Security Features](#security-features)
- [License](#license)

---

## 🎯 Project Objective

The primary goal of the Mini CRM (Client Lead Management System) is to provide a centralized platform for:

- **Capturing** leads from website contact forms
- **Organizing** all potential client information in one place
- **Tracking** follow-ups and communication history
- **Improving** the efficiency of converting interested visitors into actual paying customers
- **Admin Control** - Centralized management of agents and lead distribution
- **Security** - Secure authentication with 2FA, password reset, and account protection

This system streamlines the entire lead management process from initial inquiry to final conversion.

---

## ⚡ Core Functionalities

| Feature | Description |
|---------|-------------|
| **Automated Lead Capture** | Seamlessly receives and records data submitted by users through website contact forms |
| **Admin Assignment** | Admin reviews incoming leads and assigns them to appropriate agents |
| **Centralized Dashboard** | Provides a single, organized view of all potential clients with charts |
| **Status Management** | Categorize leads based on sales process stage |
| **Communication Logging** | Record notes and details from every conversation |
| **Lead Source Tracking** | Track where leads come from (website, referral, social media, etc.) |
| **Performance Tracking** | Monitor conversion rates with visual charts and metrics |
| **Agent Management** | Admin can manage all agents (edit profile, change password, change role) |
| **User Profile Management** | Users can update their own profile and password |
| **Security** | 2FA, password reset, account locking, login tracking |
| **Notifications** | Real-time alerts for new leads and assignments |
| **Admin Approval** | New agents require admin approval before login |
| **CSV Export** | Export leads data to CSV for analysis |

---

## 🔄 Step-by-Step Workflow

```
┌─────────────────────────────────────────────────────────────────────┐
│                        LEAD MANAGEMENT FLOW                          │
└─────────────────────────────────────────────────────────────────────┘

Stage 1: Lead Submission
├── Visitor fills contact form on website
├── Name, Email, Phone, Requirements captured
├── Lead saved to database (status: pending_admin)
└── Admin receives notification

Stage 2: Admin Review
├── Admin reviews new leads in Admin Panel
├── Admin assigns lead to specific agent (approved)
└── Agent receives notification

Stage 3: Agent Work
├── Agent views assigned leads on dashboard
├── Agent contacts lead (phone/email)
├── Updates status to "Contacted"
└── Adds relevant notes

Stage 4: Closing
├── Lead agrees to purchase
├── Status updated to "Converted"
└── Conversion tracked in charts
```

---

## 👥 User Roles and Responsibilities

### 1. Lead (Potential Customer)
- **Role:** Primary data source for the system
- **Tasks:**
  - Visits company website
  - Submits contact form with their information
  - Expresses interest in products/services
  - **Does NOT login** to the system

### 2. Sales Agent / User
- **Role:** Manages leads assigned to them
- **Responsibilities:**
  - Register and wait for admin approval
  - Login to CRM dashboard
  - View assigned leads
  - Update lead status (New → Contacted → Converted)
  - Add notes for each interaction
  - Follow up with potential customers
  - Optional: Enable 2FA for extra security

### 3. Administrator
- **Role:** Full system management
- **Responsibilities:**
  - All permissions of Sales Agent
  - View ALL leads from ALL agents
  - Assign leads from public form to agents
  - Delete leads when necessary
  - Manage agent profiles (edit name, email, password, role)
  - Approve/reject new agent registrations
  - Monitor team performance via dashboard charts
  - Export leads to CSV

---

## ✨ Features

### For Website Visitors (Public Form)
- Easy-to-use contact form with glassmorphism design
- Fields: Name, Email, Phone, Photo, Requirements, Source
- Photo upload from device (max 2MB)
- Confirmation on submission
- Responsive design (mobile-friendly)
- Animated background with company info
- Tabbed sections (About, Features, Why Us, Contact)

### For Agents (Dashboard)
- **Dashboard**
  - Lead statistics overview (4 stat cards)
  - Conversion pipeline visualization
  - **Charts**: Bar chart (monthly trends) + Pie chart (source distribution)
  - Recent leads list with photos
  - Performance metrics with conversion rate

- **Lead Management**
  - View all assigned leads with photos
  - Add new leads with photo upload
  - Edit lead information
  - Update lead status
  - Add communication notes
  - Search and filter leads

- **Profile & Security**
  - Profile photo upload
  - Update profile (username, email)
  - Change password
  - Enable/disable 2FA with QR code
  - View session info

### For Admin (Admin Panel)
- **User Management**
  - View all registered agents with photos
  - Approve/reject new registrations (pending approval system)
  - Edit agent profiles (username, email, password, photo)
  - Change agent roles (agent ↔ admin)
  - Delete agents

- **Lead Assignment**
  - View leads pending admin assignment (with photos)
  - Assign leads to specific agents
  - View each agent's leads separately
  - Export all leads to CSV (including photo URLs)

- **Notifications**
  - Real-time alerts for new leads
  - Alert when lead assigned to agent
  - Bell icon with unread count
  - Mark as read / Mark all as read

### System Features
- **Dark/Light Mode** - Toggle between themes (persists in localStorage)
- **Responsive Design** - Works on all devices
- **Photo Upload** - Select photos from device (max 2MB, JPG/PNG)
- **Security**
  - Two-Factor Authentication (2FA) with QR code
  - Token-based password reset
  - Account locking (5 failed attempts)
  - Login attempt tracking
- **Notifications** - Bell icon with unread count
- **CSV Export** - Admin can export all leads

---

## 🛠 Tech Stack

### Frontend
- **React** - UI framework
- **Tailwind CSS** - Modern styling
- **Axios** - HTTP client
- **React Router** - Navigation
- **Lucide React** - Icons
- **React Hot Toast** - Notifications

### Backend
- **Node.js** - Runtime environment
- **Express** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM (Object Data Modeling)
- **JSON Web Token (JWT)** - Authentication
- **bcryptjs** - Password hashing
- **speakeasy** - 2FA (TOTP)

### Database
- **MongoDB Atlas** - Cloud database

---

## 📁 Project Structure

```
mini-crm/
├── client/                         # React Frontend
│   ├── public/
│   ├── src/
│   │   ├── components/            # Reusable UI components
│   │   │   ├── Layout.js          # Main layout with sidebar, notifications, theme toggle
│   │   │   └── PrivateRoute.js    # Route protection (auth required)
│   │   ├── context/
│   │   │   ├── AuthContext.js     # Authentication context (login, register, logout)
│   │   │   └── ThemeContext.js    # Dark/Light mode context
│   │   ├── pages/
│   │   │   ├── Login.js           # Agent login (supports 2FA)
│   │   │   ├── Register.js        # Agent registration (requires approval)
│   │   │   ├── Dashboard.js       # Main dashboard with stats & charts
│   │   │   ├── Leads.js           # Leads list with filters, search, CSV export
│   │   │   ├── LeadDetail.js      # Lead details, edit, notes
│   │   │   ├── PublicLeadForm.js  # Website contact form
│   │   │   ├── Profile.js         # User profile settings
│   │   │   ├── AdminPanel.js      # Admin management panel
│   │   │   ├── ForgotPassword.js  # Password reset page
│   │   │   └── SecuritySettings.js# 2FA setup & security
│   │   ├── services/
│   │   │   └── api.js             # API service layer (auth, leads, notifications)
│   │   ├── App.js                 # Main app component with routes
│   │   └── index.js               # Entry point
│   └── package.json
│
├── server/                       # Node.js Backend
│   ├── middleware/
│   │   └── auth.js              # JWT auth, protect middleware, admin check
│   ├── models/
│   │   ├── Lead.js              # Lead schema (name, email, phone, status, notes, etc.)
│   │   ├── User.js              # User schema (username, email, password, role, photo, 2FA, isApproved)
│   │   └── Notification.js      # Notification schema (type, title, message, isRead)
│   ├── routes/
│   │   ├── authRoutes.js         # Auth, 2FA, password reset, user management
│   │   ├── leadRoutes.js         # Lead CRUD, assignment, notes
│   │   └── notificationRoutes.js # Notifications (get, mark read, delete)
│   ├── .env                     # Environment variables
│   ├── server.js                 # Server entry point + seed-admin endpoint
│   └── package.json
│
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB Atlas account
- npm or yarn

### Installation

1. **Clone and install server dependencies:**
```bash
cd server
npm install
```

2. **Install client dependencies:**
```bash
cd client
npm install
```

### Configuration

1. **Set up MongoDB Atlas:**
   - Create account at [MongoDB Atlas](https://www.mongodb.com/atlas)
   - Create a free cluster
   - Create database user with read/write permissions
   - Add IP to whitelist (0.0.0.0/0 for development)

2. **Configure environment variables:**

Edit `server/.env`:
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secure_secret_key
JWT_EXPIRE=7d
```

### Running the Application

1. **Start the backend server:**
```bash
cd server
npm start
```

2. **Start the frontend (in a new terminal):**
```bash
cd client
npm start
```

3. **Create admin account (first time only):**
```bash
curl -X POST http://localhost:5000/api/seed-admin
```

Or use Postman/Insomnia to send a POST request to:
```
http://localhost:5000/api/seed-admin
```

Default admin credentials:
- Email: admin@crm.com
- Password: admin123

4. **Open your browser:**
- Public form: http://localhost:3000
- Agent login: http://localhost:3000/login
- Dashboard: http://localhost:3000/dashboard (after login)
- Admin Panel: http://localhost:3000/admin (admin only)
- Security: http://localhost:3000/security
- Profile: http://localhost:3000/profile

---

### First-Time Setup

1. Create admin account using seed endpoint
2. Login as admin (admin@crm.com / admin123)
3. Go to Admin Panel → Review pending agent registrations
4. Approve agents before they can login
5. Configure 2FA in Security settings (optional but recommended)
6. Test the public form at http://localhost:3000

---

## 📡 API Endpoints

### Public API (Website Contact Form)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/leads/public` | Submit lead from website |

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new agent (requires admin approval) |
| POST | `/api/auth/login` | Agent login (supports 2FA) |
| POST | `/api/auth/forgot-password` | Request password reset token |
| POST | `/api/auth/reset-password` | Reset password with token |
| POST | `/api/auth/enable-2fa` | Generate 2FA secret (returns QR code URL) |
| POST | `/api/auth/verify-2fa` | Verify 2FA code during login |
| POST | `/api/auth/confirm-2fa` | Confirm & enable 2FA |
| POST | `/api/auth/disable-2fa` | Disable 2FA |
| GET | `/api/auth/2fa-status` | Get 2FA status |
| GET | `/api/auth/me` | Get current user |
| GET | `/api/auth/users` | Admin: Get all users |
| GET | `/api/auth/users/:id` | Admin: Get single user |
| PUT | `/api/auth/users/:id` | Admin: Update user |
| PUT | `/api/auth/users/:id/approve` | Admin: Approve/reject user |
| DELETE | `/api/auth/users/:id` | Admin: Delete user |
| PUT | `/api/auth/profile` | Update own profile |

### Notifications
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/notifications` | Get user's notifications |
| GET | `/api/notifications/unread-count` | Get unread count |
| PUT | `/api/notifications/:id/read` | Mark as read |
| PUT | `/api/notifications/read-all` | Mark all as read |
| DELETE | `/api/notifications/:id` | Delete notification |

### Lead Management
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/leads` | Get leads (admin: all, agent: own) |
| GET | `/api/leads/:id` | Get single lead |
| POST | `/api/leads` | Create new lead |
| PUT | `/api/leads/:id` | Update lead |
| DELETE | `/api/leads/:id` | Delete lead (admin only) |
| POST | `/api/leads/:id/notes` | Add note to lead |
| PUT | `/api/leads/:id/assign` | Admin: Assign lead to agent |
| PUT | `/api/leads/:id/respond` | Agent: Accept/reject lead |
| GET | `/api/leads/by-agent/:userId` | Admin: Get leads by agent |

---

## 📊 Lead Management

### Lead Statuses
| Status | Description | Stage |
|--------|-------------|-------|
| `pending_admin` | New lead waiting for admin to assign | Awaiting assignment |
| `new` | Assigned to agent, awaiting contact | Awaiting first contact |
| `contacted` | Agent has reached out | In progress |
| `converted` | Lead became a customer | Successfully closed |
| `rejected` | Lead rejected by agent | Not pursuing |

### Lead Sources
| Source | Description |
|--------|-------------|
| `website` | From company website form |
| `referral` | Referred by existing customer |
| `social_media` | From social media platforms |
| `email_campaign` | From email marketing |
| `other` | Other sources |

### Lead Fields
| Field | Type | Description |
|-------|------|-------------|
| name | String | Lead's full name |
| email | String | Lead's email address |
| phone | String | Lead's phone number (optional) |
| photo | String | Base64 photo or image URL (optional) |
| requirements | String | What they're looking for |
| source | String | Where they found us |
| status | String | Current stage in pipeline |
| notes | Array | Communication history |
| assignedTo | String | Agent username |
| fromPublicForm | Boolean | Lead source indicator |
| assignedBy | String | Who assigned the lead |

---

## 🔐 Security Features

### Authentication & Authorization
- JWT-based authentication with token expiration
- Password hashing with bcrypt (12 rounds)
- Protected API routes with middleware
- User-specific data filtering (agents see only own leads)
- Admin-only endpoints for sensitive operations

### Advanced Security Features
- **Admin Approval** - New agents require admin approval before they can login
- **Password Reset** - Token-based password reset with 30-minute expiry
- **Two-Factor Authentication (2FA)** - TOTP-based (Google Authenticator, Authy, Microsoft Authenticator)
- **Account Locking** - 5 failed login attempts → 30-minute lockout
- **Login Tracking** - Tracks failed attempts, successful logins, last login time

### Input Validation
- Server-side validation with express-validator
- Email format validation
- Password length requirements
- Username validation (alphanumeric + underscore)

### Additional Security
- All passwords hidden from API responses
- Password fields not returned in user queries
- Role-based access control (RBAC)
- Protected routes with token verification

---

## 📄 License

This project is for educational and demonstration purposes.

---

## 👨‍💻 Author

Created for demonstration of full-stack CRM functionality with modern security features.

---

**© 2026 Mini CRM. Client Lead Management System.**
