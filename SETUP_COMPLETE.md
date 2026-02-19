# 🎉 CustConnect Database Setup Complete!

## ✅ What Has Been Set Up

### 1. Database Configuration for XAMPP
- Database: `custconnect`
- All tables created with proper relationships
- Ready for XAMPP MySQL

### 2. User Accounts Created

#### 🔑 Super Admin (Full Control)
- **Email:** `admin@custconnect.com`
- **Password:** `admin123`
- **Access:** Complete control over entire system
- **Can:**
  - Manage all users and assign roles
  - Create/manage universities
  - Moderate all content
  - View analytics
  - Assign admin access to others

#### 🚌 Bus Owner Account
- **Email:** `busowner@custconnect.com`
- **Password:** `admin123`
- **Access:** Bus management portal
- **Can:**
  - Add/update bus routes
  - Manage bus schedules
  - Send bus notifications
  - Update bus status

#### ☕ Cafe Owner Account
- **Email:** `cafeowner@custconnect.com`
- **Password:** `admin123`
- **Access:** Cafe management portal
- **Can:**
  - Manage cafe information
  - Add/update menu items
  - Create daily deals
  - Update hot selling items
  - Manage cafe hours

#### 👥 Student Accounts (8 Dummy Accounts)
All students have password: `admin123`

1. **student1@edu.pk** - Ahmed Khan (Year 3, CS)
2. **student2@edu.pk** - Sara Ali (Year 2, Business)
3. **student3@lums.edu.pk** - Hassan Raza (Year 4, Engineering)
4. **student4@edu.pk** - Fatima Ahmed (Year 1, CS)
5. **student5@edu.pk** - Ali Hassan (Year 4, Business)
6. **student6@nust.edu.pk** - Zainab Malik (Year 2, CS)
7. **student7@edu.pk** - Usman Sheikh (Year 3, CS)
8. **student8@lums.edu.pk** - Ayesha Butt (Year 1, Engineering)

## 🚀 Quick Start

### Step 1: Configure XAMPP Database

1. Make sure XAMPP MySQL is running
2. Open `backend/.env` file
3. Set DATABASE_URL:
   ```env
   DATABASE_URL="mysql://root:@localhost:3306/custconnect"
   ```
   (If XAMPP MySQL has password, use: `mysql://root:yourpassword@localhost:3306/custconnect`)

### Step 2: Run Setup Script

**Windows:**
```bash
cd backend
setup-xampp.bat
```

**Or manually:**
```bash
cd backend
npx prisma db push
npm run db:seed
```

### Step 3: Start Backend Server

```bash
cd backend
npm run dev
```

You should see:
- ✅ Database connected successfully
- 🚀 Server running on port 5000

### Step 4: Start Frontend

```bash
cd frontend
npm run dev
```

## 🎯 Admin Portal Features

### Super Admin Can:

1. **User Management**
   - View all users
   - Assign roles (Bus Owner, Cafe Owner, Student, etc.)
   - Suspend/activate users
   - Search and filter users

2. **Role Management**
   - Assign BUS_OPERATOR role to bus owners
   - Assign CAFE_OWNER role to cafe owners
   - Assign STUDENT role to students
   - Create custom roles

3. **Content Moderation**
   - View all posts
   - Remove inappropriate content
   - Moderate comments

4. **Analytics**
   - View user statistics
   - Track posts, events, cafes
   - Monitor bus routes

5. **University Management**
   - Create new universities
   - Manage departments
   - View university statistics

### Bus Owner Can:

- Access bus management dashboard
- Add new bus routes
- Update bus schedules
- Send notifications to students
- Update bus status (on-time, delayed, etc.)

### Cafe Owner Can:

- Access cafe management dashboard
- Update cafe information
- Add/edit menu items
- Create daily deals
- Mark hot selling items
- Update opening hours

## 📋 API Endpoints for Admin

### Super Admin Endpoints:
- `GET /api/admin/users` - Get all users
- `POST /api/admin/users/:id/roles` - Assign role to user
- `PUT /api/admin/users/:id/suspend` - Suspend/activate user
- `GET /api/admin/analytics` - Get analytics
- `GET /api/admin/universities` - Get all universities
- `POST /api/admin/universities` - Create university

### Bus Owner Endpoints:
- `GET /api/bus/routes` - Get bus routes
- `POST /api/bus/routes` - Create bus route
- `PUT /api/bus/routes/:id/status` - Update route status
- `POST /api/bus/routes/:id/notifications` - Send notification

### Cafe Owner Endpoints:
- `GET /api/cafes` - Get cafes
- `PUT /api/cafes/:id` - Update cafe info
- `PUT /api/cafes/:id/menu` - Update menu
- `PUT /api/cafes/:id/deals` - Update deals

## 🔐 How to Give Admin Access

### As Super Admin:

1. Login as `admin@custconnect.com`
2. Go to Admin Portal
3. Navigate to Users section
4. Find the user you want to give access to
5. Click "Assign Role"
6. Select role:
   - **BUS_OPERATOR** - For bus owners
   - **CAFE_OWNER** - For cafe owners
   - **UNIVERSITY_ADMIN** - For university admins
   - **STUDENT** - For students

## 📝 Notes

- All accounts are pre-verified (no email verification needed)
- All passwords are: `admin123`
- Cafe owner has been assigned to "Campus Coffee Corner" cafe
- Bus routes are already created for testing
- Sample posts and events are included

## 🐛 Troubleshooting

### Database Connection Error:
- Check XAMPP MySQL is running
- Verify DATABASE_URL in `.env`
- Try: `mysql://root:@localhost:3306/custconnect`

### Port Already in Use:
- Backend: Change PORT in `.env` (default: 5000)
- Frontend: Change port in `package.json` (default: 3000)

### Prisma Errors:
- Run: `npx prisma generate`
- Then: `npx prisma db push`

## 🎉 You're All Set!

Login as super admin and start managing your platform!

