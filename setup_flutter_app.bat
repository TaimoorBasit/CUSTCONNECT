@echo off
echo ==============================================
echo CustConnect - Flutter Automatic Setup
echo ==============================================

cd /d "%~dp0custconnect_mobile"

echo.
echo [1/2] Initializing native Android and iOS platform folders...
flutter create . --org com.custconnect --project-name custconnect_mobile

echo.
echo [2/2] Fetching all pubspec dependencies...
flutter pub get

echo.
echo ==============================================
echo SUCCESS! Your Flutter app is fully prepared.
echo You can now navigate to '/custconnect_mobile' and run:
echo flutter run
echo ==============================================
pause
