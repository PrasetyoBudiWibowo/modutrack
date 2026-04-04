# 🚀 Modutrack

A fullstack application built with **Laravel 11 (API)**, **Next.js (Web)**, and **React Native (Mobile)**.

---

## 📌 Overview

Modutrack is a fullstack system designed to manage modules, users, and related activities across **web and mobile platforms**.

This project follows a **multi-platform architecture**:

* 🔧 Backend: Laravel 11 (REST API + Session-based Auth)
* 🌐 Frontend Web: Next.js
* 📱 Frontend Mobile: React Native (Expo)
* 🗄️ Database: PostgreSQL

---

## 🏗️ Project Structure

```
modutrack/
├── backend/           # 🔧 Laravel API
├── frontend-web/      # 🌐 Next.js (Web)
├── frontend-mobile/   # 📱 React Native (Expo)
```

---

## ⚙️ Tech Stack

### 🔧 Backend

* Laravel 11
* PHP 8.2
* PostgreSQL
* Session-based Authentication

---

### 🌐 Web Frontend

* Next.js
* React
* Axios

---

### 📱 Mobile Frontend

* React Native
* Expo Router
* Axios

---

## 🔌 API Example

### 🔐 Login

```
POST /api/login
```

Request:

```json
{
  "user_name": "admin",
  "password": "123"
}
```

Response (Success):

```json
{
  "status": "success",
  "message": "Login berhasil",
  "user": {
    "user_name": "ADMIN"
  }
}
```

---

## 🚀 Getting Started

### 1. Clone Repository

```
git clone https://github.com/PrasetyoBudiWibowo/modutrack.git
cd modutrack
```

---

## 🔧 Backend Setup (Laravel)

```
cd backend
composer install
cp .env.example .env
php artisan key:generate
php artisan serve
```

Default:

```
http://localhost:8000
```

---

## 🌐 Frontend Web (Next.js)

```
cd frontend-web
npm install
npm run dev
```

---

## 📱 Frontend Mobile (React Native - Expo)

```
cd frontend-mobile
npm install
npm start
```

Run on Android Emulator:

```
Press "a"
```

---

## ⚠️ Important Notes (Mobile)

If using Android Emulator:

```
http://10.0.2.2:8000
```

👉 Used instead of `localhost` to access backend API.

---

## 🔑 Current Features

### ✅ Completed

* API Authentication (Laravel)
* Login (Web)
* Login (Mobile - React Native)
* Session-based Authentication
* API Integration (Axios)

### 🔄 In Progress

* Auto Login (check-session)
* Logout (Mobile)
* Route Protection
* User Management Module

---

## 📸 Preview

*(coming soon)*

---

## 🧠 Author

* **Prasetyo Budi Wibowo**

---

## 📌 Notes

This project is under active development and follows a **step-by-step implementation approach**:

* No over-engineering
* Clean architecture
* Reusable API services

---
