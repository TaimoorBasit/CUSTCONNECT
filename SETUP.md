# CustConnect - Digital Student Hub

A comprehensive MVP web portal connecting university students across universities to share posts, access campus services, find study resources, compute GPA/CGPA, and view/post events.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- MySQL 8+ (XAMPP or a standalone MySQL server)
- npm or yarn

### 1. Clone and Install Dependencies

```bash
git clone <repository-url>
cd CustConnect

# Install all dependencies (root, frontend, and backend)
npm run install:all
```

### 2. Database Setup

```bash
# Copy environment files
cp backend/env.example backend/.env
cp frontend/env.local.example frontend/.env.local

# Edit backend/.env with your database credentials
# DATABASE_URL="mysql://username:password@localhost:3306/custconnect"

# Set up the database
cd backend
npx prisma migrate dev
npx prisma db seed
```

### 3. Start Development Servers

```bash
# From the root directory
npm run dev
```

This will start:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## 📋 Features Implemented

### ✅ Core Features
- **User Authentication**: Email verification with university domain validation
- **User Profiles**: Complete profile management with university, department, and year
- **Social Feed**: Text posts, images, videos with likes, comments, and follow system
- **Bus Service**: Real-time bus routes, schedules, and notifications
- **Cafés**: 11 campus cafés with menus and daily deals
- **Academic Resources**: Upload/download notes, past papers, assignments
- **GPA Calculator**: Semester GPA and cumulative CGPA computation
- **Events Calendar**: University and student-organized events with RSVP
- **Admin Panel**: Role-based access control for different admin types
- **Notifications**: Real-time in-app notifications

### 🎯 User Roles
- **Students**: Sign up, post content, access services, calculate GPA
- **Super Admin**: Manage all universities, admins, and moderate content
- **University Admins**: Manage university-specific content and users
- **Café Owners**: Update menus, deals, and café information
- **Bus Operators**: Update bus status and send notifications

## 🏗️ Architecture

### Frontend (Next.js 14 + TypeScript)
- **Framework**: Next.js 14 with App Router
- **Styling**: Tailwind CSS
- **State Management**: React Query + Context API
- **Real-time**: Socket.io client
- **Forms**: React Hook Form + Zod validation
- **Icons**: Heroicons + Lucide React

### Backend (Node.js + Express + TypeScript)
- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT tokens
- **Real-time**: Socket.io
- **File Uploads**: Multer
- **Email**: Nodemailer
- **Validation**: Custom validation utilities

### Database Schema
- **Users**: Complete user management with roles
- **Universities & Departments**: Multi-tenant support
- **Social Features**: Posts, comments, likes, follows
- **Bus Service**: Routes, schedules, notifications, subscriptions
- **Cafés**: Menus, deals, owner management
- **Academic**: Resources, courses, semesters
- **GPA**: Records, subjects, calculations
- **Events**: Event management with RSVP
- **Admin**: Roles, permissions, analytics

## 📁 Project Structure

```
CustConnect/
├── frontend/                 # Next.js frontend
│   ├── src/
│   │   ├── app/             # Next.js app router pages
│   │   ├── components/      # Reusable UI components
│   │   ├── contexts/        # React contexts
│   │   ├── hooks/           # Custom React hooks
│   │   ├── services/        # API service functions
│   │   ├── types/           # TypeScript definitions
│   │   └── utils/           # Utility functions
│   └── package.json
├── backend/                  # Express.js backend
│   ├── src/
│   │   ├── controllers/     # Route controllers
│   │   ├── middleware/      # Express middleware
│   │   ├── routes/          # API routes
│   │   ├── services/        # Business logic
│   │   ├── utils/           # Utility functions
│   │   └── types/           # TypeScript types
│   ├── prisma/              # Database schema and migrations
│   └── package.json
└── README.md
```

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/verify-email` - Email verification
- `GET /api/auth/me` - Get current user

### Social Feed
- `GET /api/posts` - Get posts feed
- `POST /api/posts` - Create new post
- `POST /api/posts/:id/like` - Like/unlike post
- `POST /api/posts/:id/comment` - Add comment

### Bus Service
- `GET /api/bus/routes` - Get all bus routes
- `POST /api/bus/routes/:id/subscribe` - Subscribe to route
- `PUT /api/bus/routes/:id/status` - Update route status (operator)

### Cafés
- `GET /api/cafes` - Get all cafés
- `GET /api/cafes/:id/menu` - Get café menu
- `PUT /api/cafes/:id/menu` - Update menu (owner)

### Academic Resources
- `GET /api/resources` - Get resources
- `POST /api/resources` - Upload resource
- `GET /api/resources/:id/download` - Download resource

### GPA Calculator
- `POST /api/gpa/calculate` - Calculate GPA/CGPA
- `GET /api/gpa/history` - Get GPA history

### Events
- `GET /api/events` - Get events
- `POST /api/events` - Create event
- `POST /api/events/:id/rsvp` - RSVP to event

### Admin
- `GET /api/admin/users` - Get all users (admin)
- `GET /api/admin/analytics` - Get analytics data

## 🧪 Testing

```bash
# Run all tests
npm test

# Run frontend tests
cd frontend && npm test

# Run backend tests
cd backend && npm test
```

## 🚀 Deployment

### Frontend (Vercel)
1. Connect GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Backend (Railway/Heroku)
1. Connect GitHub repository
2. Set environment variables
3. Configure PostgreSQL database
4. Deploy

### Database Migrations
```bash
cd backend
npx prisma migrate deploy
```

## 📊 Sample Data

The database is seeded with:
- 3 universities (Karachi, LUMS, NUST)
- 3 departments per university
- 1 super admin account
- 3 sample students
- 5 bus routes with schedules
- 11 campus cafés with menus and deals
- Sample courses and semesters
- Sample posts and events

## 🔐 Default Credentials

- **Super Admin**: admin@custconnect.com / admin123
- **Sample Students**: 
  - student1@edu.pk / admin123
  - student2@edu.pk / admin123
  - student3@lums.edu.pk / admin123

## 🛠️ Development

### Adding New Features
1. Create database migrations in `backend/prisma/migrations/`
2. Update Prisma schema if needed
3. Add API routes in `backend/src/routes/`
4. Create frontend components in `frontend/src/components/`
5. Add pages in `frontend/src/app/`

### Code Style
- TypeScript for type safety
- ESLint + Prettier for code formatting
- Tailwind CSS for styling
- React Query for data fetching
- Custom hooks for reusable logic

## 📝 License

MIT License - see LICENSE file for details

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## 📞 Support

For support and questions, please contact the development team or create an issue in the repository.

---

**CustConnect** - Connecting students, one campus at a time! 🎓






