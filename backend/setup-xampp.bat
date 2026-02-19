@echo off
echo ========================================
echo XAMPP MySQL Database Setup for CustConnect
echo ========================================
echo.

echo Step 1: Checking .env file...
if not exist .env (
    echo Creating .env file from env.example...
    copy env.example .env
    echo.
    echo IMPORTANT: Please edit .env file and set DATABASE_URL for XAMPP:
    echo DATABASE_URL="mysql://root:@localhost:3306/custconnect"
    echo.
    echo If your XAMPP MySQL has a password, use:
    echo DATABASE_URL="mysql://root:yourpassword@localhost:3306/custconnect"
    echo.
    pause
)

echo.
echo Step 2: Creating database and tables...
call npx prisma db push
if errorlevel 1 (
    echo ERROR: Failed to create database. Please check:
    echo 1. XAMPP MySQL is running
    echo 2. DATABASE_URL in .env is correct
    pause
    exit /b 1
)

echo.
echo Step 3: Seeding database with accounts...
call npm run db:seed
if errorlevel 1 (
    echo ERROR: Failed to seed database.
    pause
    exit /b 1
)

echo.
echo ========================================
echo Setup Complete!
echo ========================================
echo.
echo Account Credentials:
echo.
echo Super Admin:
echo   Email: admin@custconnect.com
echo   Password: admin123
echo.
echo Bus Owner:
echo   Email: busowner@custconnect.com
echo   Password: admin123
echo.
echo Cafe Owner:
echo   Email: cafeowner@custconnect.com
echo   Password: admin123
echo.
echo Students (8 accounts):
echo   student1@edu.pk through student8@lums.edu.pk
echo   Password: admin123
echo.
echo ========================================
echo.
echo You can now start the backend server with:
echo   npm run dev
echo.
pause

