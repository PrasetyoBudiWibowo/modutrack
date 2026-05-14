# 🚀 Modutrack

Fullstack application built with **Laravel 11 (API)**, **Next.js (Web)**, and **React Native (Mobile)**.

---

# 📌 Overview

Modutrack is a fullstack system designed to manage users, modules, and activity tracking across web and mobile platforms.

This project uses a multi-platform architecture:

- 🔧 Backend API: Laravel 11 + Sanctum
- 🌐 Frontend Web: Next.js 16 + TypeScript
- 📱 Frontend Mobile: React Native (Expo)
- 🗄️ Database: PostgreSQL

---

# 🏗️ Project Structure

```bash
modutrack/
├── backend/           # Laravel API
├── frontend-web/      # Next.js Web
├── frontend-mobile/   # React Native Expo


⚙️ Tech Stack
🔧 Backend
Laravel 11
PHP 8.2+
Laravel
PostgreSQL
REST API Authentication

🌐 Frontend Web
Next.js
React
TypeScript
Tailwind CSS
Axios
SweetAlert2

📱 Frontend Mobile
React Native
Expo
Expo Router
Axios

🔐 Authentication Flow

Authentication uses:

Laravel Sanctum Token
Protected API Route
Auto Session Check
Auto Logout Session Timeout
Multi Login Protection

🔥 Current Features
✅ Completed
Backend API
Login API
Register API
Check Session API
Logout API
User Authentication with Sanctum
Session Timeout Validation
Auto Delete Expired Token
Single Active Login Per User
Frontend Web
Login Page
Register Page
Dashboard Layout
Sidebar Navigation
Navbar
Route Protection
Auto Redirect Login
Session Checker
Auto Logout when Session Expired
Modular API Services

🔧 Backend Setup (Laravel)
cd backend

Install dependency:

composer install

Copy env:

cp .env.example .env

Generate key:

php artisan key:generate

Run migration:

php artisan migrate

Run server:

php artisan serve

Backend default URL:

http://localhost:8000
🌐 Frontend Web Setup (Next.js)
cd frontend-web

Install dependency:

npm install

Run development server:

npm run dev

Frontend URL:

http://localhost:3000
📱 Frontend Mobile Setup (Expo)
cd frontend-mobile

Install dependency:

npm install

Start Expo:

npm start

Run Android Emulator:

Press "a"
⚠️ Important Notes
Android Emulator API URL

If using Android Emulator:

http://10.0.2.2:8000

because Android Emulator cannot access localhost.

🔒 Session Timeout

Session timeout currently implemented:

Auto logout after inactivity
Token automatically deleted from personal_access_tokens
Super Admin excluded from timeout
Only inactive user token will be deleted
🧠 Development Notes

This project follows:

Clean architecture
Reusable services
Step-by-step implementation
Minimal over-engineering
Modular frontend structure
📸 Preview

Coming soon...

👨‍💻 Author
Prasetyo Budi Wibowo