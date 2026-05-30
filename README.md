# SpringCommerce

A modern, full-stack e-commerce application featuring a React + Vite frontend and a robust Spring Boot backend. 

This project demonstrates a production-ready web application with secure JWT authentication, a fully-featured shopping cart, order management, and a zero-hardcoded-secrets deployment strategy.

## Key Features
- **Product Discovery**: Browse products with search, category filtering, and sorting capabilities.
- **Shopping Cart**: Guest cart (persisted in local storage) and authenticated user cart.
- **Checkout Flow**: Seamless conversion from cart to order, supporting address management.
- **Discount System**: Apply promotional codes at checkout (e.g., `WELCOME10` for 10% off).
- **Order Management**: Track order history, view detailed bills, and print invoices.
- **Security**: JWT-based stateless authentication, BCrypt password hashing, and clean environment-variable configuration.

## Technology Stack
- **Frontend**: React 19, Vite, React Router DOM, Axios, Vanilla CSS
- **Backend**: Java 21, Spring Boot 3.5, Spring Security, Spring Data JPA, Hibernate
- **Database**: PostgreSQL
- **Authentication**: JSON Web Tokens (JWT)
- **Deployment**: Render (Backend & Database), Vercel (Frontend)

---

## Part 1: Running the Project Locally

If you are a developer looking to download, inspect, and run this code on your local machine, follow these steps.

### Prerequisites & Software Needed
To run this project locally, ensure you have the following installed on your machine:
1. **Java 21** (JDK)
2. **Node.js** (v18 or higher) and **npm**
3. **PostgreSQL** (v14 or higher running locally)
4. **Git** (to clone the repository)

### 1. Database Setup
1. Open your PostgreSQL terminal (psql) or a tool like pgAdmin.
2. Create an empty database named `ecommerce_db`:
   ```sql
   CREATE DATABASE ecommerce_db;
   ```
*(Note: You do not need to create any tables manually. Hibernate will automatically create the tables, and Spring Boot will populate 15 dummy products via the `data.sql` file upon startup.)*

### 2. Backend Setup
1. Open a terminal and navigate to the backend directory:
   ```bash
   cd backend/ecommerce
   ```
2. Create a Run Configuration in your IDE, or export the following environment variables in your terminal before running. Provide your local PostgreSQL credentials:
   ```bash
   export DATABASE_URL=jdbc:postgresql://localhost:5432/ecommerce_db
   export DATABASE_USERNAME=postgres
   export DATABASE_PASSWORD=your_local_password
   export JWT_SECRET=your_secure_base64_jwt_secret_key_here
   ```
   Generate a secure JWT secret (base64-encoded, at least 32 bytes before encoding):
   ```bash
   openssl rand -base64 32
   ```
   Optional expiry override (milliseconds):
   ```bash
   export JWT_EXPIRATION=3600000
   ```
3. Run the Spring Boot application using Maven:
   ```bash
   ./mvnw spring-boot:run
   ```
The backend will start and listen for API requests on `http://localhost:8080`.

### 3. Frontend Setup
1. Open a *new* terminal window and navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install the required Node dependencies:
   ```bash
   npm install
   ```
3. Create a `.env.local` file in the `frontend` directory and point it to your local backend:
   ```env
   VITE_API_BASE_URL=http://localhost:8080
   ```
4. Start the frontend development server:
   ```bash
   npm run dev
   ```
The frontend will start on `http://localhost:5173`. Open this URL in your browser to interact with the local application.

---

## Part 2: Visiting the Live Application

The application is deployed and hosted in the cloud. You do not need to install any development tools to use it.

**Live Application:** https://spring-commerce-two.vercel.app/

### Requirements to Visit
- A modern web browser (Chrome, Firefox, Safari, Edge).
- An active internet connection.

### How to use the live site
1. Navigate to the Live Application URL provided above.
2. You can immediately browse products and add items to your cart as a Guest.
3. To place an order, click **Sign In** and create a new account via the **Sign Up** tab.
4. Try adding items to your cart, proceeding to checkout, and entering the discount code **`WELCOME10`** to see the logic in action.

*(Note: The backend API is hosted on a free Render tier and may take 30-50 seconds to "wake up" upon the very first request if it has been idle. Please be patient on the first page load!)*

---

## Important Developer Notes
- **Environment Variables**: The project enforces a strict "zero-hardcoded-secrets" policy. Both the frontend and backend require `.env` or system environment variables to function. Do not commit `.env` or `.env.local` files to version control.
- **JWT Secret Rotation**: Changing `JWT_SECRET` will invalidate all existing tokens. Plan for a logout/re-login window when rotating secrets.
- **Database Seeding**: The `backend/ecommerce/src/main/resources/data.sql` file contains the initial data for the store. It is set to run automatically (`spring.sql.init.mode=always`).
- **Discount Code**: There is a hardcoded promotional code in the frontend (`ProductsPage.jsx`) for demonstration purposes. Use `WELCOME10` to apply a 10% discount during checkout.
