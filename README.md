# Auth System — Next.js + Spring Boot

A full authentication system with a Next.js (App Router) frontend and a Spring Boot backend. Supports Google OAuth2, email OTP, and email/password login — all issuing a JWT that's stored in an httpOnly cookie on the frontend.

## Features

- **Google OAuth2 login** — handled entirely by Spring Security on the backend
- **Email OTP login** — enter email, receive a 6-digit code, verify to sign in (auto-creates the account if new)
- **Email + password login** — for users who've set a password
- **Password management** — set/change password from the dashboard (requires current password to change)
- **Protected routes** — `/dashboard` gated via Next.js middleware + server-side session check
- **Account deletion** — self-service delete-account button
- **User info display** — name, email, and profile photo on the dashboard (with graceful fallback for OTP-only users who have no name/photo)
- **JWT stored in an httpOnly cookie** — never exposed to client-side JS
- **Toast notifications** — via shadcn/sonner
- **Resend OTP with a 60-second cooldown timer**

## Tech Stack

**Frontend**
- Next.js (App Router)
- TypeScript
- Tailwind CSS
- shadcn/ui
- Lucide icons

**Backend**
- Spring Boot 3.x
- Spring Security + OAuth2 Client
- Spring Data JPA
- Lombok
- JJWT (JSON Web Tokens)
- BCrypt password hashing
- Spring Mail (for OTP emails)

**Database**
- Any JPA-compatible relational database (PostgreSQL used in examples)

## Architecture

```
┌─────────────────┐         ┌──────────────────┐         ┌────────────┐
│  Next.js         │ ──────▶ │  Spring Boot       │ ──────▶ │  Database   │
│  (frontend)       │         │  (backend, :8080)  │         │            │
│  :3000            │ ◀────── │                    │ ◀────── │            │
└─────────────────┘         └──────────────────┘         └────────────┘
        │
        ▼
  httpOnly cookie
  (auth_token / JWT)
```

- The frontend never talks to the database directly — everything goes through the Spring Boot API.
- The JWT is issued by the backend and stored as an httpOnly cookie **on the frontend's own domain**, set via a Next.js Route Handler. This avoids cross-origin cookie issues and keeps the token inaccessible to client-side JS (XSS-resistant).
- API calls from Next.js server components/route handlers attach the token as an `Authorization: Bearer` header when calling the backend.

## Authentication Flows

### 1. Google OAuth
1. User clicks "Continue with Google" → redirected to `{BACKEND_URL}/oauth2/authorization/google`
2. Google handles consent, redirects back to Spring Boot
3. Backend finds-or-creates the user, issues a JWT, redirects to `{FRONTEND_URL}/api/auth/callback?token=...`
4. Frontend route handler sets the httpOnly cookie and redirects to `/dashboard`

### 2. OTP Login/Signup
1. User enters email → `POST /api/auth/otp/request` → backend generates a 6-digit code, emails it, stores it (10-min expiry, max 5 attempts)
2. User enters the code → `POST /api/auth/otp/verify` → backend verifies, finds-or-creates the user, issues a JWT
3. Frontend sets the cookie, redirects to `/dashboard`

### 3. Email + Password Login
1. User enters email + password → `POST /api/auth/login`
2. Backend checks the BCrypt hash → issues a JWT if valid
3. Frontend sets the cookie, redirects to `/dashboard`

### 4. Setting/Changing Password
- Done from the dashboard, not during signup
- `PUT /api/user/me/password` — requires current password if one is already set

## Project Structure

```
backend/
├── entity/
│   ├── User.java
│   └── OtpToken.java
├── repository/
│   ├── UserRepository.java
│   └── OtpTokenRepository.java
├── service/
│   ├── UserService.java
│   └── OtpService.java
├── security/
│   ├── JwtService.java
│   ├── JwtAuthFilter.java
│   └── OAuth2LoginSuccessHandler.java
├── controller/
│   ├── AuthController.java
│   └── UserController.java
├── config/
│   └── SecurityConfig.java
└── exception/
    └── GlobalExceptionHandler.java

frontend/
├── app/
│   ├── sign-in/page.tsx
│   ├── dashboard/page.tsx
│   ├── api/
│   │   ├── auth/
│   │   │   ├── callback/route.ts
│   │   │   ├── login/route.ts
│   │   │   ├── logout/route.ts
│   │   │   ├── session/route.ts
│   │   │   └── otp/
│   │   │       ├── request/route.ts
│   │   │       └── verify/route.ts
│   │   ├── account/route.ts
│   │   └── user/password/route.ts
│   └── layout.tsx
├── components/
│   ├── SignInCard.tsx
│   ├── otpVerificationCard.tsx
│   ├── UserInfoCard.tsx
│   ├── PasswordForm.tsx
│   └── DeleteAccountButton.tsx
├── lib/
│   └── getUser.ts
└── middleware.ts
```

## Setup

### Prerequisites
- Java 21+ (or your target JDK version)
- Node.js 18+
- A relational database (PostgreSQL recommended)
- A Google Cloud OAuth2 Client ID/Secret
- An SMTP provider for sending OTP emails (Gmail SMTP for dev; SendGrid/Resend/SES for production)

### Backend

1. Add the required dependencies to `pom.xml`: `spring-boot-starter-oauth2-client`, `spring-boot-starter-security`, `spring-boot-starter-web`, `spring-boot-starter-data-jpa`, `spring-boot-starter-mail`, `io.jsonwebtoken:jjwt-*`, `org.projectlombok:lombok`, your DB driver.

2. Set environment variables:
   ```
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret
   JWT_SECRET=your-random-256-bit-secret
   MAIL_USERNAME=your-email@gmail.com
   MAIL_APP_PASSWORD=your-gmail-app-password
   DB_PASSWORD=your-db-password
   ```

3. Configure `application.properties`:
   ```properties
   server.port=8080

   spring.security.oauth2.client.registration.google.client-id=${GOOGLE_CLIENT_ID}
   spring.security.oauth2.client.registration.google.client-secret=${GOOGLE_CLIENT_SECRET}
   spring.security.oauth2.client.registration.google.scope=email,profile

   app.jwt.secret=${JWT_SECRET}
   app.jwt.expiration-ms=86400000
   app.frontend.url=http://localhost:3000

   spring.datasource.url=jdbc:postgresql://localhost:5432/yourdb
   spring.datasource.username=youruser
   spring.datasource.password=${DB_PASSWORD}
   spring.jpa.hibernate.ddl-auto=update

   spring.mail.host=smtp.gmail.com
   spring.mail.port=587
   spring.mail.username=${MAIL_USERNAME}
   spring.mail.password=${MAIL_APP_PASSWORD}
   spring.mail.properties.mail.smtp.auth=true
   spring.mail.properties.mail.smtp.starttls.enable=true
   ```

4. In [Google Cloud Console](https://console.cloud.google.com/) → OAuth Client, set the authorized redirect URI to:
   ```
   http://localhost:8080/login/oauth2/code/google
   ```

5. Run the backend:
   ```bash
   ./mvnw spring-boot:run
   ```

### Frontend

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create `.env.local`:
   ```
   NEXT_PUBLIC_BACKEND_URL=http://localhost:8080
   BACKEND_URL=http://localhost:8080
   ```

3. Allow Google's profile photo domain in `next.config.ts`:
   ```ts
   images: {
     remotePatterns: [{ protocol: "https", hostname: "lh3.googleusercontent.com" }],
   }
   ```

4. Run the dev server:
   ```bash
   npm run dev
   ```

5. Visit `http://localhost:3000`

## API Reference

| Method | Endpoint | Auth required | Description |
|---|---|---|---|
| GET | `/oauth2/authorization/google` | No | Starts Google OAuth flow |
| POST | `/api/auth/otp/request` | No | Sends a 6-digit OTP to the given email |
| POST | `/api/auth/otp/verify` | No | Verifies OTP, logs in (creates account if new) |
| POST | `/api/auth/login` | No | Email + password login |
| GET | `/api/user/me` | Yes | Returns the current user's profile |
| PUT | `/api/user/me/password` | Yes | Sets or changes the current user's password |
| DELETE | `/api/user/me` | Yes | Deletes the current user's account |

## Security Notes

- The JWT is stored in an **httpOnly, secure (in production), SameSite=Lax cookie** — never accessible to client-side JavaScript.
- Passwords are hashed with **BCrypt** before storage.
- OTPs expire after **10 minutes** and are capped at **5 verification attempts**.
- CORS is locked to the configured frontend origin only, with credentials allowed.
- Authentication failures return **JSON** (not Spring's default HTML error page) via a custom `AuthenticationEntryPoint`, so the frontend can handle errors gracefully.

## Known Limitations / Next Steps

- No rate limiting yet on OTP requests (recommended: cap requests per email per time window in production)
- No "forgot password" flow (OTP login can currently serve as a substitute)
- No admin/role system currently implemented
- Consider moving OTP storage to Redis for production (auto-expiry, better performance at scale)
