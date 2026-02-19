@echo off
echo Setting up CustConnect Database...

echo.
echo Step 1: Installing dependencies...
call npm run install:all

echo.
echo Step 2: Setting up environment files...
if not exist backend\.env (
    copy backend\env.example backend\.env
    echo Created backend/.env file
)

if not exist frontend\.env.local (
    copy frontend\env.local.example frontend\.env.local
    echo Created frontend/.env.local file
)

echo Step 3: Database setup...
echo Please make sure MySQL (XAMPP) is running and update the DATABASE_URL in backend/.env
echo Then run the following commands:
echo   cd backend
echo   npx prisma generate
echo   npx prisma db push
echo   npx prisma db seed

echo.
echo Step 4: Starting development servers...
echo Run: npm run dev

echo.
echo Setup complete! 
echo.
echo Default credentials:
echo   Super Admin: admin@custconnect.com / admin123
echo   Sample Students: 
echo     - student1@edu.pk / admin123
echo     - student2@edu.pk / admin123
echo     - student3@lums.edu.pk / admin123
echo.
pause