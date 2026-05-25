# SpringCommerce

Full-stack ecommerce app with a React + Vite frontend and a Spring Boot backend.

## Features
- Product listing, cart, and checkout flow
- Auth-protected routes
- Discount code support (WELCOME10, case-insensitive)
- Order history with bill view and print

## Tech Stack
- Frontend: React 19, Vite, React Router, Axios
- Backend: Spring Boot 3.5, Spring Security, JPA/Hibernate
- Database: PostgreSQL
- Auth: JWT

## Project Structure
- backend/ecommerce: Spring Boot API
- frontend: React app

## Getting Started

### Prerequisites
- Java 21
- Node 18+ and npm
- PostgreSQL

### Backend
```bash
cd backend/ecommerce
./mvnw spring-boot:run
```

Configure these environment variables as needed (see backend/ecommerce/src/main/resources/application.properties):
- DATABASE_URL
- DATABASE_USERNAME
- DATABASE_PASSWORD
- JWT_SECRET
- JWT_EXPIRATION
- CORS_ALLOWED_ORIGINS

Backend runs on http://localhost:8080 by default.

### Frontend
```bash
cd frontend
npm install
npm run dev
```

Frontend runs on http://localhost:5173 by default.

## Notes
- Seed data lives in data.sql.
- Test discount code is WELCOME10.
