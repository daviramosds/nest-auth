

# 🔒 Nest Auth

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen)](https://github.com/your-org/your-repo/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

A full-featured User Management REST API built with [NestJS](https://nestjs.com/) and [Prisma ORM](https://www.prisma.io/). Provides robust user authentication, secure password handling, and email workflows (such as verification and password recovery), using a MongoDB database.

---

## Table of Contents

- [Features](#features)
- [Architecture](#architecture)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Environment Setup](#environment-setup)
- [Database Migration](#database-migration)
- [Running the Server](#running-the-server)
- [Testing](#testing)
- [API Usage](#api-usage)
- [Contribution Guidelines](#contribution-guidelines)
- [License](#license)

---

## Features

- User registration, login, and JWT authentication
- Email verification & password reset workflows
- Secure password storage (bcrypt)
- Prisma data models for users and tokens
- Modular and scalable NestJS architecture

---

## Architecture

- src
  - auth/          # Authentication module (JWT, guards, strategies)
  - user/          # User management module (CRUD, profiles)
  - common/        # Shared utilities and interceptors
  - prisma/        # Database connection and Prisma schema
  - mail/          # Email service for notifications (SendGrid, SMTP, etc)
- prisma/
  - schema.prisma  # Prisma schema definitions
- .env             # Environment configuration

**Key Technologies:**  
NestJS · TypeScript · Prisma (MongoDB) · JWT · Bcrypt · Nodemailer/SendGrid

---

## Prerequisites

- [Node.js](https://nodejs.org/) v16 or higher
- [npm](https://www.npmjs.com/) v8 or higher
- [MongoDB](https://www.mongodb.com/) (local or cloud instance)
- [Prisma CLI](https://www.prisma.io/docs/reference/api-reference/command-reference) (installed via npm)
- (Optional) SMTP service or [SendGrid](https://sendgrid.com/) for email sending

---

## Installation

Clone the project and install dependencies:

git clone https://github.com/your-org/your-repo.git
cd your-repo
npm install

---

## Environment Setup

Create a `.env` file based on the provided `.env.example`:

DATABASE_URL="mongodb://localhost:27017/your-db"
JWT_SECRET="your_jwt_secret"
JWT_EXPIRES_IN="3600s"
EMAIL_USER="you@domain.com"
EMAIL_PASS="your_email_password"
EMAIL_FROM="User Management <you@domain.com>"
APP_URL="http://localhost:3000"

Update these variables with your credentials.

---

## Database Migration

Generate and apply Prisma migrations:

npx prisma generate
npx prisma db push

Populate the database or seed if required (optional):

npm run seed

---

## Running the Server

Start the API server in development mode:

npm run start:dev

For production build:

npm run build
npm run start:prod

---

## Testing

Run all tests:

npm run test

Run end-to-end (e2e) tests:

npm run test:e2e

---

## API Usage

### Register a New User

POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "yourpassword"
}

### Login

POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "yourpassword"
}

### Example Response

{
  "accessToken": "jwt.token.here",
  "user": {
    "id": "abc123",
    "email": "user@example.com"
  }
}

### Email Verification & Reset

- Upon registration, a verification email is sent
- Use the link/token from the email to verify your account
- Password reset endpoints and flows available via `/auth/forgot-password` and `/auth/reset-password`

---

## Contribution Guidelines

We welcome contributions! To get started:

1. Fork this repository
2. Create a new branch: `git checkout -b feature/your-feature`
3. Make your changes and commit: `git commit -am 'Add new feature'`
4. Push to your fork: `git push origin feature/your-feature`
5. Submit a pull request

Please include clear descriptions and ensure all tests are passing.

---

## License

This project is licensed under the [MIT License](LICENSE).

---

> _Built with ❤️ using NestJS & Prisma_
