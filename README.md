# Learning Management System (LMS)

A modern, multi-tenant Learning Management System built with the MERN stack. This monorepo contains a production-ready backend API (Node.js/Express/MongoDB) and a modern frontend client (React/TypeScript/Vite).

## Architecture

This is a **monorepo** containing two main applications:

- **`lms-server/`** - Backend API (Node.js, Express, MongoDB)
- **`lms-client/`** - Frontend Application (React, TypeScript, Vite)

### Multi-Tenancy

The system supports multiple tenants (organizations/schools) with complete data isolation. Each tenant can:
- Configure their own grade scales (1-5, 1-10, 6-10)
- Set attendance rules and requirements
- Manage their own users, courses, and enrollments
- Configure currency and locale settings

## Tech Stack

### Backend (`lms-server/`)

- **Runtime**: Node.js
- **Framework**: Express.js 5.x
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (Access + Refresh tokens)
- **Security**: Helmet, CORS, Rate Limiting, Bcrypt
- **Email**: Mailjet integration
- **Documentation**: Swagger/OpenAPI 3.0
- **Testing**: Jest + Supertest + MongoMemoryServer

### Frontend (`lms-client/`)

- **Framework**: React 19 with TypeScript
- **Build Tool**: Vite 7
- **Styling**: Tailwind CSS 4
- **State Management**: Zustand
- **Data Fetching**: TanStack React Query
- **Forms**: React Hook Form + Zod validation
- **Routing**: React Router DOM 7
- **UI Components**: Headless UI
- **Notifications**: Sonner
- **Video**: Stream.io Video SDK

## Project Structure

```
dunp-faks-mern-monorepo/
├── lms-server/                 # Backend API
│   ├── src/
│   │   ├── __tests__/         # E2E test suite
│   │   ├── config/            # Configuration (DB, env)
│   │   ├── controllers/       # Request handlers
│   │   ├── docs/              # Swagger/OpenAPI docs
│   │   ├── middleware/        # Express middlewares
│   │   ├── models/            # Mongoose schemas
│   │   ├── routes/            # API route definitions
│   │   ├── utils/             # Helper functions
│   │   ├── app.js             # Express app setup
│   │   └── server.js          # Server entry point
│   ├── jest.config.js
│   └── package.json
│
├── lms-client/                 # Frontend Application
│   ├── src/
│   │   ├── assets/            # Static assets
│   │   ├── components/        # Reusable components
│   │   │   ├── ui/            # UI primitives (Button, Card, etc.)
│   │   │   └── ...            # Layout & feature components
│   │   ├── pages/             # Page components
│   │   │   ├── admin/         # Admin dashboard pages
│   │   │   ├── professor/     # Professor dashboard pages
│   │   │   ├── student/       # Student dashboard pages
│   │   │   └── ...            # Public pages (Login, Signup, etc.)
│   │   ├── lib/               # Utilities & API clients
│   │   │   ├── api/           # API client functions
│   │   │   └── utils.ts       # Helper functions
│   │   ├── store/             # Zustand stores
│   │   ├── types/             # TypeScript type definitions
│   │   ├── routes/            # Route configuration
│   │   ├── App.tsx            # Root component
│   │   ├── main.tsx           # Entry point
│   │   └── index.css          # Global styles
│   ├── public/                # Public assets
│   ├── index.html
│   ├── vite.config.ts
│   ├── tsconfig.json
│   └── package.json
│
└── README.md                   # This file
```

### Backend Structure (`lms-server/src/`)

```
src/
├── config/
│   ├── db.js              # MongoDB connection & pooling
│   └── env.js             # Environment variables
│
├── middleware/
│   ├── auth.js            # JWT authentication
│   ├── tenant.js          # Tenant scoping & isolation
│   ├── role.js            # Role-based access control
│   ├── error.js           # Centralized error handling
│   └── rateLimit.js       # Rate limiting (API, auth, etc.)
│
├── models/
│   ├── User.js            # Users (admin, professor, student)
│   ├── Tenant.js          # Organizations/schools
│   ├── Department.js      # Academic departments
│   ├── Course.js          # Courses
│   ├── Lesson.js          # Course lessons
│   ├── LessonMaterial.js  # Lesson materials (PDFs, videos, links)
│   ├── Enrollment.js      # Student enrollments
│   ├── Exam.js            # Exams and assessments
│   ├── ExamSubscription.js # Student exam subscriptions
│   ├── Grade.js            # Grades with history tracking
│   ├── Point.js            # Point assignments
│   ├── Attendance.js       # Attendance records
│   ├── BankAccount.js      # Tenant bank accounts
│   └── ActivityLog.js      # System activity logs
│
├── controllers/
│   ├── authController.js   # Login, register, password reset
│   ├── userController.js   # User CRUD, approval
│   ├── tenantController.js # Tenant management
│   ├── departmentController.js # Department management
│   ├── courseController.js # Course CRUD
│   ├── lessonController.js # Lesson CRUD
│   ├── lessonMaterialController.js # Lesson material management
│   ├── enrollmentController.js # Enrollment & payments
│   ├── examController.js   # Exam management
│   ├── examSubscriptionController.js # Exam subscription & grading
│   ├── gradeController.js  # Grade management
│   ├── pointController.js  # Point assignment management
│   ├── attendanceController.js # Attendance tracking
│   ├── bankAccountController.js # Bank account management
│   ├── activityLogController.js # Activity log queries & stats
│   └── uploadController.js # File upload handling
│
├── routes/
│   ├── authRoutes.js      # Public auth endpoints
│   ├── userRoutes.js      # User endpoints
│   ├── tenantRoutes.js    # Tenant endpoints
│   ├── departmentRoutes.js # Department endpoints
│   ├── courseRoutes.js    # Course endpoints
│   ├── lessonRoutes.js    # Lesson endpoints
│   ├── lessonMaterialRoutes.js # Lesson material endpoints
│   ├── enrollmentRoutes.js # Enrollment endpoints
│   ├── examRoutes.js      # Exam endpoints
│   ├── examSubscriptionRoutes.js # Exam subscription endpoints
│   ├── gradeRoutes.js     # Grade endpoints
│   ├── pointRoutes.js     # Point endpoints
│   ├── attendanceRoutes.js # Attendance endpoints
│   ├── bankAccountRoutes.js # Bank account endpoints
│   ├── activityLogRoutes.js # Activity log endpoints
│   ├── uploadRoutes.js    # File upload endpoints
│   └── docsRoutes.js      # Swagger UI
│
└── utils/
    ├── async.js           # Async handler wrapper
    ├── jwt.js             # JWT token generation/verification
    ├── validators.js      # Input validation & sanitization
    ├── email.js           # Mailjet email service
    └── logger.js          # Security & auth logging
```

## Setup & Installation

### Prerequisites

- **Node.js** 18+ (recommended: LTS version)
- **MongoDB** 6+ (local or remote instance)
- **npm** or **yarn**

### Backend Setup

1. **Navigate to server directory:**
   ```bash
   cd lms-server
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create `.env` file:**
   ```bash
   cp .env.example .env  # If exists, or create manually
   ```

4. **Configure environment variables** (see [Environment Variables](#environment-variables))

5. **Start MongoDB** (if running locally):
   ```bash
   mongod
   ```

6. **Run the server:**
   ```bash
   # Development (with auto-reload)
   npm run dev

   # Production
   npm start
   ```

   Server will start on `http://localhost:8000`

### Frontend Setup

1. **Navigate to client directory:**
   ```bash
   cd lms-client
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure API endpoint** (if different from default):
   - Update API base URL in your API client configuration
   - Default: `http://localhost:8000/api`

4. **Run the development server:**
   ```bash
   npm run dev
   ```

   Frontend will start on `http://localhost:5173`

5. **Build for production:**
   ```bash
   npm run build
   ```

## Environment Variables

### Backend (`lms-server/.env`)

```env
# Server Configuration
NODE_ENV=development
PORT=8000

# Database
MONGO_URI=mongodb://127.0.0.1:27017/lms

# JWT Secrets (CHANGE IN PRODUCTION!)
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-in-production

# CORS
CORS_ORIGIN=*

# Tenant Signup
ALLOW_TENANT_SIGNUP=true

# Frontend URL (for email links)
FRONTEND_URL=http://localhost:5173

# Mailjet Email Service
MJ_APIKEY_PUBLIC=your-mailjet-public-key
MJ_APIKEY_PRIVATE=your-mailjet-private-key
MAIL_FROM_EMAIL=your-email@example.com
MAIL_FROM_NAME=Your Name
```

### Frontend (`lms-client/.env`)

Create `.env` file if needed:

```env
VITE_API_URL=http://localhost:8000/api
```

## API Documentation

### Swagger UI

Interactive API documentation is available at:

**http://localhost:8000/api-docs**

Features:
- Test endpoints directly from the browser
- View request/response schemas
- Authentication support (JWT tokens)
- Complete endpoint documentation

### API Endpoints Overview

#### Authentication (Public)
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/tenant-signup` - Create tenant + admin
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password
- `POST /api/auth/refresh-token` - Refresh access token
- `GET /api/auth/search-tenants` - Search tenants

#### Users (Authenticated)
- `GET /api/users` - List users (filtered by tenant)
- `POST /api/users` - Create user (admin only)
- `GET /api/users/:id` - Get user details
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user
- `PATCH /api/users/:id/approve` - Approve pending user

#### Tenants (Admin only)
- `GET /api/tenants` - List tenants (paginated)
- `POST /api/tenants` - Create tenant
- `GET /api/tenants/:id` - Get tenant details
- `PUT /api/tenants/:id` - Update tenant
- `DELETE /api/tenants/:id` - Soft delete tenant

#### Departments (Admin only)
- `GET /api/departments` - List departments
- `POST /api/departments` - Create department
- `GET /api/departments/:id` - Get department details
- `PUT /api/departments/:id` - Update department
- `DELETE /api/departments/:id` - Soft delete department

#### Courses
- `GET /api/courses` - List courses
- `POST /api/courses` - Create course
- `GET /api/courses/:id` - Get course details
- `PUT /api/courses/:id` - Update course
- `DELETE /api/courses/:id` - Soft delete course

#### Enrollments
- `GET /api/enrollments` - List enrollments
- `POST /api/enrollments` - Create enrollment
- `GET /api/enrollments/:id` - Get enrollment details
- `PUT /api/enrollments/:id` - Update enrollment (Admin, Professor)
- `DELETE /api/enrollments/:id` - Soft delete enrollment (Admin)
- `POST /api/enrollments/:id/payments` - Add payment

#### Exams (Admin, Professor)
- `GET /api/exams` - List exams
- `POST /api/exams` - Create exam
- `GET /api/exams/:id` - Get exam details
- `PUT /api/exams/:id` - Update exam
- `DELETE /api/exams/:id` - Delete exam

#### Exam Subscriptions
- `GET /api/exam-subscriptions` - List exam subscriptions
- `GET /api/exam-subscriptions/:id` - Get subscription details
- `POST /api/exam-subscriptions/exam/:examId/subscribe` - Subscribe to exam
- `DELETE /api/exam-subscriptions/:id` - Unsubscribe from exam
- `POST /api/exam-subscriptions/:id/grade` - Grade exam (Admin, Professor)

#### Lessons
- `GET /api/lessons` - List lessons
- `POST /api/lessons` - Create lesson
- `GET /api/lessons/:id` - Get lesson details
- `PUT /api/lessons/:id` - Update lesson
- `DELETE /api/lessons/:id` - Delete lesson

#### Lesson Materials (Admin, Professor)
- `GET /api/lesson-materials` - List lesson materials
- `POST /api/lesson-materials` - Create lesson material
- `GET /api/lesson-materials/:id` - Get lesson material details
- `PUT /api/lesson-materials/:id` - Update lesson material
- `DELETE /api/lesson-materials/:id` - Delete lesson material

#### Grades
- `GET /api/grades` - List grades
- `POST /api/grades` - Create grade
- `GET /api/grades/:id` - Get grade details
- `PUT /api/grades/:id` - Update grade (tracks history)
- `DELETE /api/grades/:id` - Delete grade

#### Attendance (Admin, Professor)
- `GET /api/attendance` - List attendance records
- `POST /api/attendance` - Record attendance
- `GET /api/attendance/:id` - Get attendance details
- `PUT /api/attendance/:id` - Update attendance
- `DELETE /api/attendance/:id` - Delete attendance

#### Points (Admin, Professor)
- `GET /api/points` - List point assignments
- `POST /api/points` - Create point assignment
- `GET /api/points/:id` - Get point details
- `PUT /api/points/:id` - Update point assignment
- `DELETE /api/points/:id` - Delete point assignment

#### Bank Accounts (Admin only)
- `GET /api/bank-accounts` - List bank accounts
- `POST /api/bank-accounts` - Create bank account
- `GET /api/bank-accounts/:id` - Get bank account details
- `PUT /api/bank-accounts/:id` - Update bank account
- `DELETE /api/bank-accounts/:id` - Soft delete bank account

#### Activity Logs (Admin only)
- `GET /api/activity-logs` - List activity logs (paginated, filtered)
- `GET /api/activity-logs/stats` - Get activity log statistics
- `GET /api/activity-logs/:id` - Get activity log details

#### File Uploads
- `GET /api/uploads/signed-url` - Get signed URL for file upload

#### Health Check
- `GET /health` - API and database status

## Security Features

### Backend Security

- **JWT Authentication** - Access tokens (15min) + Refresh tokens (7d)
- **Password Hashing** - Bcrypt with salt rounds
- **Rate Limiting** - Protection against brute-force attacks
- **Input Validation** - Comprehensive validation & sanitization
- **CORS** - Configurable origin restrictions
- **Helmet** - Security headers
- **Multi-Tenant Isolation** - Automatic tenant scoping
- **Role-Based Access Control** - Admin, Professor, Student roles
- **Password Complexity** - Enforced rules (uppercase, lowercase, numbers, special chars)
- **Hashed Reset Tokens** - Secure password reset flow
- **Audit Logging** - Security event tracking

### Password Requirements

- Minimum 8 characters
- Maximum 128 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character

## Testing

### Backend Tests

Run the E2E test suite:

```bash
cd lms-server
npm test
```

Watch mode:
```bash
npm run test:watch
```

Test coverage includes:
- Authentication flows (login, register, password reset)
- User CRUD operations
- Department management
- Course management
- Lesson and lesson material management
- Enrollment & payments
- Exam and exam subscription management
- Grade management
- Point assignments
- Attendance tracking
- Bank account management
- Activity logging
- Tenant isolation
- Role-based access control

Tests use:
- **Jest** - Test framework
- **Supertest** - HTTP assertions
- **MongoMemoryServer** - In-memory MongoDB for testing

## Development Workflow

### Running Both Applications

**Terminal 1 - Backend:**
```bash
cd lms-server
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd lms-client
npm run dev
```

### Code Structure Guidelines

#### Backend
- **Controllers** - Handle request/response logic
- **Models** - Define Mongoose schemas with validation
- **Routes** - Define API endpoints and middleware chain
- **Middleware** - Reusable Express middleware functions
- **Utils** - Pure utility functions (no Express dependencies)

#### Frontend
- **Pages**: Organized by role (admin, professor, student) and feature
- **Components**: Reusable UI components in `components/ui/`
- **API Layer**: Centralized API client functions in `lib/api/`
- **State Management**: 
  - React Query for server state (caching, mutations, invalidation)
  - Zustand for client state (auth, theme, etc.)
- **Forms**: React Hook Form + Zod validation
- **Routing**: Protected routes with role-based access control
- **TypeScript**: Full type safety with shared types
- **Error Handling**: Consistent error messages and loading states
- **Responsive Design**: Mobile-first approach with Tailwind CSS

## Key Features

### Multi-Tenancy
- Complete data isolation per tenant
- Tenant-specific configurations (grade scales, attendance rules)
- Automatic tenant scoping on all requests

### User Management
- Three roles: Admin, Professor, Student
- User approval workflow
- Password reset via email
- Account status management (active, pending, disabled)
- Department assignment

### Department Management
- Create and manage academic departments
- Organize courses by department
- Department-based filtering and reporting

### Course Management
- Create courses with professors
- Schedule management
- Pricing support
- Student enrollment tracking
- Department assignment

### Lesson Management
- Create and schedule lessons
- Link lessons to courses
- Lesson date and time tracking
- Professor assignment

### Lesson Materials
- Upload and manage lesson materials
- Support for multiple file types (PDF, video, presentation, images, documents, links)
- File upload with signed URLs
- Material organization by lesson and course

### Exam Management
- Create exams with questions and answers
- Set exam dates and durations
- Configure passing grades
- Link exams to courses

### Exam Subscriptions
- Students subscribe to exams
- Track subscription status
- Exam grading workflow
- Grade assignment after exam completion

### Grade System
- Tenant-configurable grade scales
- Grade history tracking
- Multiple attempt support
- Comments on grades
- Link grades to exams or assignments

### Point System
- Assign points to students for activities
- Track points by course
- Point-based grading alternative
- Professor and admin point management

### Attendance Tracking
- Multiple status types (present, absent, late, excused)
- Duplicate prevention
- Course and lesson-linked attendance
- Date-based tracking

### Payment Management
- Track payments per enrollment
- Payment status tracking (pending, paid)
- Multiple payment support
- Payment approval workflow for admins
- Automatic payment status updates

### Activity Logging
- Comprehensive audit trail
- Track all system actions (create, update, delete)
- User activity monitoring
- IP address tracking
- Severity levels (low, medium, high, critical)
- Activity statistics and reporting

## Frontend Pages

### Admin Dashboard
Complete administrative interface with full CRUD operations for all entities:

**User Management:**
- Users List, Create, Detail, Edit

**Organization:**
- Tenants List, Detail, Edit
- Departments List, Create, Detail, Edit

**Academics:**
- Courses List, Create, Detail, Edit
- Lessons List, Create, Detail, Edit
- Lesson Materials List, Detail, Edit
- Exams List, Create, Detail, Edit
- Exam Subscriptions List, Detail
- Grades List, Create, Detail, Edit
- Points List, Create, Detail, Edit

**Attendance & Tracking:**
- Attendance List, Create, Detail, Edit
- Activity Logs List, Detail

**Finance:**
- Enrollments List, Create, Detail, Edit
- Enrollment Payment Approval
- Bank Accounts List, Create, Detail, Edit

### Professor Dashboard
Role-specific interface for professors to manage their courses and students:

**My Courses:**
- Courses List, Detail
- Lessons List, Detail, Edit
- Lesson Materials List, Detail, Edit

**Exams & Grading:**
- Exams List, Detail, Edit
- Exam Subscriptions List, Detail
- Grades List, Detail, Edit

**Student Management:**
- Points List, Detail, Edit
- Attendance List, Create, Detail, Edit

### Student Dashboard
Student-facing interface for viewing courses, materials, and progress:

**My Learning:**
- Courses List, Detail
- Lessons List, Detail
- Lesson Materials (via lesson detail)
- Exams List, Detail
- Enrollments List, Detail

**Progress:**
- Grades List, Detail
- Points List, Detail

### Public Pages
- Landing Page
- Login
- Signup (Individual & Tenant)
- Forgot Password
- Reset Password
- Pending Approval
- Unauthorized
- Not Found

## Deployment

### Backend Deployment Checklist

1. Set `NODE_ENV=production`
2. Change `JWT_SECRET` and `JWT_REFRESH_SECRET`
3. Configure `CORS_ORIGIN` to specific domain(s)
4. Set `MONGO_URI` to production database
5. Configure Mailjet API keys
6. Set `FRONTEND_URL` to production frontend URL
7. Review rate limiting settings
8. Enable database indexes
9. Set up monitoring/logging
10. Configure SSL/TLS

### Frontend Deployment

1. Build the application:
   ```bash
   cd lms-client
   npm run build
   ```

2. Deploy `dist/` folder to your hosting service (Vercel, Netlify, etc.)

3. Configure environment variables on your hosting platform

## License

MIT License - See LICENSE file for details

## Contributing

1. Create a feature branch
2. Make your changes
3. Write/update tests
4. Ensure all tests pass
5. Submit a pull request

## Support

For issues, questions, or contributions, please open an issue on the repository.

---

**Built with ❤️ using the MERN stack**
