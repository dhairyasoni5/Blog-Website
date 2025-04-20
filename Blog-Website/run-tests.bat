@echo off
echo Installing server dependencies...
cd server
call npm install
echo.

echo Creating test environment file...
echo # Test Environment Configuration > .env.test
echo PORT=8000 >> .env.test
echo ACCESS_SECRET_KEY=test_access_secret_key >> .env.test
echo REFRESH_SECRET_KEY=test_refresh_secret_key >> .env.test
echo TEST_DATABASE_URI=mongodb+srv://gamerdhairya535:dhairya88@cluster0.nishonp.mongodb.net/?retryWrites=true^&w=majority^&appName=Cluster0 >> .env.test
echo DB_USERNAME=Cluster0 >> .env.test
echo DB_PASSWORD=dhairya88 >> .env.test
echo CLIENT_URL=http://localhost:3000 >> .env.test
echo.

echo Running server tests...
set NODE_ENV=test
call npm test
if %ERRORLEVEL% NEQ 0 (
  echo Server tests failed!
  exit /b 1
)
echo.

echo Installing client dependencies...
cd ../client
call npm install
echo.

echo Running client tests...
call npm test -- --watchAll=false
if %ERRORLEVEL% NEQ 0 (
  echo Client tests failed!
  exit /b 1
)
echo.

echo All tests completed successfully!
echo You can now deploy your application.