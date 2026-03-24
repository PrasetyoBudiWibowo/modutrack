# 🚀 Modutrack

A fullstack application built with **Laravel 11 (API)** and **React (Frontend)**.

---

## 📌 Overview

Modutrack is a web-based system designed to manage modules, users, and related activities.
This project is built using a modern **fullstack architecture**:

* 🔧 Backend: Laravel 11 (REST API)
* 🌐 Frontend: React (Typescript)
* 🗄️ Database: PostgreSQL

---

## 🏗️ Project Structure

```
modutrack/
├── backend/         # Laravel API
├── frontend-web/    # React frontend
```

---

## ⚙️ Tech Stack

### Backend

* Laravel 11
* PHP 8.2
* PostgreSQL

### Frontend

* React (Typescript)
* Axios

---

## 🔌 API Example

### Login Endpoint

```
POST /api/login
```

Request:

```json
{
  "user_name": "admin",
  "password": "123456"
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

### 2. Setup Backend (Laravel)

```
cd backend
composer install
cp .env.example .env
php artisan key:generate
php artisan serve
```

---

### 3. Setup Frontend (React)

```
cd frontend-web
npm install
npm run dev
```

---

## 🔑 Current Features

* ✅ API setup (Laravel)
* ✅ React frontend setup
* ✅ Login API integration
* 🔄 Authentication (in progress)

---

## 📸 Preview

*(coming soon)*

---

## 🧠 Author

* **Prasetyo Budi Wibowo**

---

## 📌 Notes

This project is currently under development.
More features will be added step by step.

---
