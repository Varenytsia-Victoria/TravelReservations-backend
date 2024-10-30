# Booking Platform

This project is a microservices-based booking platform, built using Node.js for backend services and includes services for user authentication, booking management, and payment processing. Each service functions as an independent microservice, facilitating scalability and maintainability, and communicates through REST APIs and Redis.

## Project Overview

- **Auth Service**: Handles user registration and login with JWT authentication.
- **Booking Service**: Manages bookings for hotels, flights, and car rentals.
- **Payment Service**: Simulates or integrates with payment providers for transaction processing.
  
Each service is containerized using Docker for simplified deployment and managed through Docker Compose.

## Features

1. **Auth Service**:
   - User registration and login.
   - JWT authentication with Redis caching.
   - Routes for user authentication, protected by JWT.
   - Data storage in PostgreSQL.
   - Passwords hashing with bcrypt

2. **Booking Service**:
   - Provides management for hotel, flight, and car rental bookings.
   - Caches search results using Redis for performance optimization.
   - Utilizes PostgreSQL for storing booking information.
   - Includes protected routes for accessing booking history and search results, ensuring that only registered users can view their bookings.

3. **Payment Service**:
   - Payment simulation
   - Transaction status tracking and storage in PostgreSQL.
   - Includes protected routes for accessing payment

## Technologies Used

- **Node.js and Express.js** for backend service development.
- **JWT** for token-based authentication.
- **Redis** for caching session tokens and search results.
- **PostgreSQL** for data storage.
- **Docker** for containerization.
- **AWS** for hosting and deployment of services
- **BCrypt** for password hashing and enhanced security.


## Getting Started

### Prerequisites

- **Node.js** (v14+)
- **Docker** and **Docker Compose**
- **Redis** and **PostgreSQL** (or Docker can be used for these services)

### Installation and Setup

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/Varenytsia-Victoria/TravelReservations-backend.git
   cd booking-platform
   ```

2. **Docker Setup**:
   - Make sure Docker is installed and running.
   - Run the following command to build and start all services:
     ```bash
     docker-compose up --build
     ```

   This will start the Auth, Booking, and Payment services along with Redis and PostgreSQL.
   

## Containerization with Docker

1. Each microservice has its own `Dockerfile` that defines:
   - Base Node.js image.
   - Installation of dependencies.
   - Exposing ports.

2. **Docker Compose** (`docker-compose.yml`):
   - Orchestrates all services (Auth, Booking, Payment, Redis, and PostgreSQL).
   - Configures networks for inter-service communication.
