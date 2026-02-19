# XAMPP MySQL Setup Guide

## Step 1: Configure Database Connection

Update `backend/.env` file with XAMPP MySQL settings:

```env
DATABASE_URL="mysql://root:@localhost:3306/custconnect"
```

**Note:** 
- If your XAMPP MySQL has a password, use: `mysql://root:yourpassword@localhost:3306/custconnect`
- Default XAMPP MySQL usually has no password (empty after the colon)

## Step 2: Create Database and Tables

```bash
cd backend
npx prisma db push
```

## Step 3: Seed Database with All Accounts

```bash
npm run db:seed
```

This will create:
- **Super Admin**: admin@custconnect.com / admin123
- **Bus Owner**: busowner@custconnect.com / admin123
- **Cafe Owner**: cafeowner@custconnect.com / admin123
- **Multiple Student Accounts**: student1@edu.pk, student2@edu.pk, etc. / admin123

## Step 4: Start Backend Server

```bash
npm run dev
```

## Step 5: Login and Access Admin Portal

1. Login as Super Admin: admin@custconnect.com / admin123
2. Navigate to Admin Portal (usually at /dashboard/admin or /admin)
3. From there you can:
   - Assign roles to users
   - Manage bus owners
   - Manage cafe owners
   - View all users
   - Manage content

## Account Details

### Super Admin
- Email: admin@custconnect.com
- Password: admin123
- Full control over entire system

### Bus Owner
- Email: busowner@custconnect.com
- Password: admin123
- Can manage bus routes, schedules, and notifications

### Cafe Owner
- Email: cafeowner@custconnect.com
- Password: admin123
- Can manage cafe menus, deals, and cafe information

### Student Accounts
- student1@edu.pk / admin123
- student2@edu.pk / admin123
- student3@lums.edu.pk / admin123
- student4@edu.pk / admin123
- student5@edu.pk / admin123

