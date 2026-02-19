# CustConnect - Digital Student Hub

A comprehensive MVP web portal connecting university students across universities to share posts, access campus services, find study resources, compute GPA/CGPA, and view/post events.

## Features

### Core Modules
- **User Authentication**: Email verification with university domain validation
- **Social Feed**: Text posts, images, videos with likes, comments, and follow system
- **Bus Service**: Real-time bus routes, schedules, and notifications
- **Cafés**: Campus café listings with menus and daily deals
- **Academic Resources**: Upload/download notes, past papers, assignments
- **GPA Calculator**: Semester GPA and cumulative CGPA computation
- **Events Calendar**: University and student-organized events with RSVP
- **Admin Panel**: Role-based access control for different admin types

### User Roles
- **Students**: Sign up, post content, access services, calculate GPA
- **Super Admin**: Manage all universities, admins, and moderate content
- **University Admins**: Manage university-specific content and users
- **Café Owners**: Update menus, deals, and café information
- **Bus Operators**: Update bus status and send notifications

## Tech Stack

### Frontend
- Next.js 14 with TypeScript
- Tailwind CSS for styling
- React Query for data fetching
- Socket.io client for real-time features

### Backend
- Node.js with Express
- TypeScript
- MySQL database
- Prisma ORM
- Socket.io for real-time notifications
- JWT authentication
- Multer for file uploads

### Infrastructure
- Frontend: Vercel
- Backend: Railway/Heroku
- Database: MySQL (e.g., XAMPP, Railway, PlanetScale)
- File Storage: AWS S3 or Cloudinary

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MySQL 8+
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd CustConnect
```

2. Run the setup script
```bash
# For Unix/Linux/Mac
chmod +x setup.sh
./setup.sh

# For Windows
setup.bat
```

3. Or manually install:
```bash
# Install dependencies
npm run install:all

# Set up environment files
cp backend/env.example backend/.env
cp frontend/env.local.example frontend/.env.local

# Set up database
cd backend
npx prisma migrate dev
npx prisma db seed

# Start development servers
cd ..
npm run dev
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

### 🔐 Default Credentials
- **Super Admin**: admin@custconnect.com / admin123
- **Sample Students**: 
  - student1@edu.pk / admin123
  - student2@edu.pk / admin123
  - student3@lums.edu.pk / admin123

## Project Structure

```
CustConnect/
├── frontend/                 # Next.js frontend application
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/           # Next.js pages
│   │   ├── hooks/           # Custom React hooks
│   │   ├── services/        # API service functions
│   │   ├── types/           # TypeScript type definitions
│   │   └── utils/           # Utility functions
│   ├── public/              # Static assets
│   └── package.json
├── backend/                  # Express.js backend API
│   ├── src/
│   │   ├── controllers/     # Route controllers
│   │   ├── middleware/      # Express middleware
│   │   ├── models/          # Database models
│   │   ├── routes/          # API routes
│   │   ├── services/        # Business logic
│   │   ├── utils/           # Utility functions
│   │   └── types/           # TypeScript types
│   ├── prisma/              # Database schema and migrations
│   └── package.json
├── docs/                    # Documentation
└── README.md
```

## API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/verify-email` - Email verification
- `POST /api/auth/forgot-password` - Password reset request
- `POST /api/auth/reset-password` - Password reset

### User Endpoints
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `GET /api/users/:id` - Get user by ID
- `POST /api/users/follow` - Follow a user
- `DELETE /api/users/follow` - Unfollow a user

### Social Feed Endpoints
- `GET /api/posts` - Get posts feed
- `POST /api/posts` - Create new post
- `PUT /api/posts/:id` - Update post
- `DELETE /api/posts/:id` - Delete post
- `POST /api/posts/:id/like` - Like/unlike post
- `POST /api/posts/:id/comment` - Add comment
- `GET /api/posts/:id/comments` - Get post comments

### Bus Service Endpoints
- `GET /api/bus/routes` - Get all bus routes
- `GET /api/bus/routes/:id` - Get specific route
- `PUT /api/bus/routes/:id/status` - Update route status (bus operator)
- `POST /api/bus/routes/:id/subscribe` - Subscribe to route notifications
- `POST /api/bus/routes/:id/report` - Report bus issue

### Café Endpoints
- `GET /api/cafes` - Get all cafés
- `GET /api/cafes/:id` - Get specific café
- `PUT /api/cafes/:id/menu` - Update café menu (café owner)
- `PUT /api/cafes/:id/deals` - Update daily deals (café owner)

### Academic Resources Endpoints
- `GET /api/resources` - Get academic resources
- `POST /api/resources` - Upload resource
- `GET /api/resources/:id/download` - Download resource
- `DELETE /api/resources/:id` - Delete resource

### GPA Calculator Endpoints
- `POST /api/gpa/calculate` - Calculate GPA/CGPA
- `GET /api/gpa/history` - Get GPA history
- `POST /api/gpa/semester` - Add semester grades

### Events Endpoints
- `GET /api/events` - Get events
- `POST /api/events` - Create event
- `PUT /api/events/:id` - Update event
- `DELETE /api/events/:id` - Delete event
- `POST /api/events/:id/rsvp` - RSVP to event

### Admin Endpoints
- `GET /api/admin/users` - Get all users (admin)
- `PUT /api/admin/users/:id/suspend` - Suspend user (admin)
- `GET /api/admin/posts` - Get all posts for moderation (admin)
- `DELETE /api/admin/posts/:id` - Remove post (admin)

## Database Schema

### Core Tables
- `users` - User accounts and profiles
- `universities` - University information
- `departments` - Department information
- `posts` - Social media posts
- `comments` - Post comments
- `likes` - Post likes
- `follows` - User follow relationships

### Service Tables
- `bus_routes` - Bus route information
- `bus_schedules` - Bus schedules
- `bus_notifications` - Bus alerts and notifications
- `cafes` - Café information
- `cafe_menus` - Café menu items
- `cafe_deals` - Daily deals

### Academic Tables
- `courses` - Course information
- `semesters` - Semester information
- `academic_resources` - Uploaded resources
- `gpa_records` - GPA calculation history

### Event Tables
- `events` - Event information
- `event_rsvps` - Event RSVPs

### Admin Tables
- `admin_roles` - Admin role definitions
- `user_roles` - User role assignments

## Testing

### Running Tests
```bash
# Run all tests
npm test

# Run frontend tests
cd frontend && npm test

# Run backend tests
cd backend && npm test
```

### Test Coverage
- Unit tests for utility functions
- Integration tests for API endpoints
- E2E tests for critical user flows

## Deployment

### Frontend (Vercel)
1. Connect GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Backend (Railway/Heroku)
1. Connect GitHub repository
2. Set environment variables
3. Configure MySQL database
4. Deploy

### Database Migrations
```bash
cd backend
npx prisma migrate deploy
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For support and questions, please contact the development team or create an issue in the repository.
