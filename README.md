# 🏨 Hotel Booking System

A production-oriented **Hotel Booking Aggregator** built with **NestJS**, integrating with **Hotelbeds** for hotel content, room availability, rates, booking, and cancellation.

The system is designed around real-world booking workflows, payment processing, asynchronous jobs, event-driven architecture, CQRS, GraphQL, caching, idempotency, rate limiting, and external provider integration.

---

##  Tech Stack

<p align="center">
  <img src="https://skillicons.dev/icons?i=nestjs,ts,prisma,postgres,redis,mongodb,docker,graphql" />
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Hotelbeds-Provider-0B7285?style=for-the-badge" />
  <img src="https://img.shields.io/badge/Stripe-Payments-635BFF?style=for-the-badge&logo=stripe&logoColor=white" />
  <img src="https://img.shields.io/badge/BullMQ-Queues-EF4444?style=for-the-badge" />
  <img src="https://img.shields.io/badge/n8n-Automation-EA4B71?style=for-the-badge&logo=n8n&logoColor=white" />
</p>

### Core Technologies

| Technology | Purpose |
|---|---|
| **NestJS** | Backend framework |
| **TypeScript** | Application language |
| **PostgreSQL** | Primary relational database |
| **Prisma** | ORM and database access |
| **MongoDB / Mongoose** | Document-oriented data |
| **Redis** | Caching and fast-access data |
| **BullMQ** | Background jobs and asynchronous processing |
| **GraphQL** | API layer |
| **DataLoader** | N+1 query optimization |
| **Hotelbeds** | Hotel content, availability, rates, booking and cancellation |
| **Stripe** | Payment processing and refunds |
| **n8n** | Workflow automation |
| **Socket.IO** | Real-time notifications |
| **Docker** | Containerization |
| **Docker Compose** | Development environment orchestration |

---

# 📌 Overview

This project is a backend system for searching and booking hotels through an external hotel provider.

Hotel content is synchronized from **Hotelbeds** into the local database and used for efficient searching and filtering.

Live operations such as:

- Room availability
- Rate checking
- Booking
- Cancellation

are handled through the Hotelbeds provider integration.

The system also provides:

- Payment processing with Stripe
- Booking expiration
- Automatic cancellation
- Idempotency
- Rate limiting
- CQRS
- Domain events
- GraphQL
- DataLoader
- Redis caching
- BullMQ background processing
- Real-time notifications
- Email automation through n8n
- Transactional database operations
- Dockerized development environment

---

# 🏗️ Architecture

```text
                              ┌──────────────────┐
                              │      Client      │
                              └────────┬─────────┘
                                       │
                                       ▼
                              ┌──────────────────┐
                              │     NestJS       │
                              │ GraphQL / Socket │
                              └────────┬─────────┘
                                       │
             ┌─────────────────────────┼─────────────────────────┐
             │                         │                         │
             ▼                         ▼                         ▼
      ┌──────────────┐          ┌──────────────┐         ┌──────────────┐
      │ PostgreSQL   │          │    Redis     │         │   MongoDB    │
      │    Prisma    │          │    Cache     │         │   Mongoose   │
      └───────┬──────┘          └──────────────┘         └──────────────┘
              │
              │
              ▼
      ┌─────────────────┐
      │    Hotelbeds    │
      │     Provider    │
      └─────────────────┘


                    ┌─────────────────────────┐
                    │          BullMQ         │
                    │                         │
                    │ Booking Timeout         │
                    │ Auto Cancellation       │
                    │ Email Jobs              │
                    │ Background Processing   │
                    └────────────┬────────────┘
                                 │
                                 ▼
                              ┌───────┐
                              │  n8n  │
                              └───────┘


                    ┌─────────────────────────┐
                    │         Stripe          │
                    │                         │
                    │ PaymentIntent            │
                    │ Refund                   │
                    │ Webhooks                 │
                    └─────────────────────────┘
✨ Main Features

🔎 Hotel Search

The system provides hotel and room searching using locally synchronized hotel content.

Search capabilities
Hotel search
Room search
Filtering
Price filtering
Location filtering
Availability-related search
Rate information
Cursor pagination
Offset pagination
Optimized SQL queries

Performance-critical search operations use Prisma Raw Queries / SQL when necessary.

🏨 Hotelbeds Integration

The application integrates with Hotelbeds for:

Hotel content
Hotel data synchronization
Room availability
Rate checking
Hotel booking
Booking cancellation
Provider references

The external provider is isolated behind a provider abstraction to keep provider-specific logic separated from the core application.

Application
     │
     ▼
Hotel Provider Interface
     │
     ▼
Hotelbeds Provider
     │
     ├── Search
     ├── Availability
     ├── Check Rates
     ├── Create Booking
     └── Cancel Booking

This abstraction also makes it easier to replace or add another provider in the future.

🔄 Hotel Content Synchronization

Hotel content is synchronized periodically from Hotelbeds into PostgreSQL.

A scheduled synchronization process runs using a Cron Job and processes the provider data in batches.

                    Hotelbeds
                        │
                        ▼
                   Cron Job
                        │
                        ▼
                 Batch Processing
                        │
                        ▼
                   PostgreSQL
                        │
                        ▼
                  Local Search

The local content database provides a fast source for hotel searching and filtering without requiring every search request to retrieve the complete content from the external provider.

🧾 Booking System

The booking system implements a real-world booking lifecycle.

                 ┌──────────────┐
                 │    PENDING   │
                 └──────┬───────┘
                        │
             ┌──────────┴──────────┐
             │                     │
             ▼                     ▼
       Payment Success          15 Minutes
             │                     │
             ▼                     ▼
       ┌───────────┐         ┌────────────┐
       │ CONFIRMED │         │ CANCELLED  │
       └───────────┘         └────────────┘
Booking rules

New bookings start in a pending state.
Users have 15 minutes to complete payment.
Pending bookings are automatically cancelled after the timeout.
Cancellation is processed asynchronously through BullMQ.
Provider cancellation is handled through Hotelbeds.
Bookings that have already started cannot be cancelled.
Same-day check-in bookings cannot be cancelled.
Critical booking operations use database transactions.
Idempotency keys protect against duplicate booking requests.
Rate limiting is applied to sensitive operations.
⏱️ Booking Timeout

A delayed BullMQ job is created when a booking enters the pending state.

Create Booking
      │
      ▼
   PENDING
      │
      ▼
BullMQ Delayed Job
      │
      │ 15 Minutes
      ▼
Check Booking Status
      │
      ├───────────────┐
      │               │
      ▼               ▼
   PAID/PENDING      PENDING
      │               │
      ▼               ▼
   Do Nothing      Cancel Booking
                       │
                       ▼
                  Hotelbeds

This prevents unpaid bookings from remaining active indefinitely.

💳 Stripe Payment System

Stripe is integrated using PaymentIntent.

Supported operations
PaymentIntent creation
Payment processing
Payment failure handling
Stripe webhooks
Refund processing
Booking/payment state synchronization

The payment flow is designed to be resilient to duplicate requests and asynchronous webhook delivery.

🔔 Stripe Webhooks

Webhook processing verifies the current booking state before applying state changes.

For example:

Stripe Webhook
      │
      ▼
Find Booking
      │
      ├── Booking Pending
      │       │
      │       ▼
      │    Process Event
      │
      └── Already Confirmed
              │
              ▼
           Ignore

This prevents duplicate or outdated webhook events from incorrectly changing an already processed booking.

🔐 Idempotency

Idempotency keys are implemented for critical operations.

Examples include:

Booking creation
Cancellation
Payment-related operations
Client Request
      │
      │ Idempotency-Key
      ▼
   Backend
      │
      ├── Already processed?
      │        │
      │        └── Yes → Return previous result
      │
      └── No → Process operation

This protects the system against duplicate requests and repeated operations.

🚦 Rate Limiting

Rate limiting is applied to sensitive operations such as:

Booking
Cancellation
Other abuse-sensitive operations

This helps protect the application and external provider from excessive or malicious requests.

🔄 Failure Handling

External provider operations are wrapped with structured error handling.

The system handles scenarios where an external provider succeeds but the local database operation fails.

Example:

Hotelbeds Booking
       │
       ▼
    SUCCESS
       │
       ▼
Local DB Update
       │
       └──────► FAILED
                   │
                   ▼
          Log Provider Reference
                   │
                   ▼
             Recovery /
            Investigation

Provider references are logged when available to help investigate and recover from inconsistent states between the external provider and the local system.

🧠 CQRS

The Booking module uses CQRS (Command Query Responsibility Segregation).

Commands and queries are separated according to their responsibilities.

                Booking Request
                       │
                       ▼
                  Command
                       │
                       ▼
               Command Handler
                       │
                       ▼
                Booking Logic
                       │
                       ▼
                    Event

Queries are handled separately from commands to keep read and write responsibilities isolated.

📣 Domain Events

Booking operations emit events for asynchronous side effects.

Booking Operation
       │
       ▼
     Event
       │
       ├── Notification
       ├── BullMQ Job
       ├── Email
       └── Other Side Effects

This prevents secondary operations from unnecessarily blocking the main booking request.

⚡ Redis

Redis is used for fast-access data and caching.

It helps reduce unnecessary database operations and improves application performance where caching is beneficial.

📨 BullMQ

BullMQ is used for asynchronous and background processing.

Main use cases
Booking expiration
Automatic cancellation
Email jobs
Background processing
Retryable operations

BullMQ keeps long-running or delayed operations outside the main HTTP request lifecycle.

📧 n8n Automation

n8n is integrated into the application as a workflow automation service.

Email-related workflows use:

Application
     │
     ▼
BullMQ
     │
     ▼
n8n
     │
     ▼
Email Workflow

This allows email processing and automation to be handled asynchronously without blocking the main application flow.

🔔 Real-Time Notifications

Real-time notifications are implemented using WebSockets.

Examples include:

Payment status updates
Booking status changes
Cancellation notifications
Backend Event
      │
      ▼
   Socket
      │
      ▼
Connected Client

🚀 GraphQL

GraphQL is used as an API layer for querying and interacting with:

Hotels
Bookings
Booking details

The project uses DataLoader to solve the N+1 query problem when resolving nested GraphQL data.

GraphQL Query
      │
      ▼
 Resolver
      │
      ▼
 DataLoader
      │
      ▼
 Batched Database Query

⚡ DataLoader & N+1 Optimization

Without DataLoader:

Get Hotels
   │
   ├── Get Room → Query
   ├── Get Room → Query
   ├── Get Room → Query
   ├── Get Room → Query
   └── ...

With DataLoader:

Get Hotels
     │
     ▼
DataLoader
     │
     ▼
Single Batched Query

This significantly reduces unnecessary database calls for nested GraphQL queries.

🗃️ Database

PostgreSQL

PostgreSQL is the primary relational database.

It is used for:

Hotel content
Rooms
Bookings
Payment-related data
Application state
Relational business data

Prisma is used for normal database operations, while raw SQL is used for performance-sensitive search operations.

MongoDB

MongoDB is integrated through Mongoose for document-oriented data where a document model is more suitable.

🔒 Database Transactions

Database transactions are used for critical business operations where multiple changes must remain consistent.

Examples include:

Booking state transitions
Payment-related updates
Critical booking operations
BEGIN TRANSACTION
       │
       ├── Operation 1
       ├── Operation 2
       ├── Operation 3
       │
       ▼
     COMMIT

If a critical operation fails:

ROLLBACK

🔍 Database Search

For performance-sensitive hotel and room searching, the application uses Prisma Raw Queries / SQL.

This allows more control over:

Filtering
Sorting
Pagination
Complex search conditions
Query performance

📄 Pagination

The project supports both Cursor-based Pagination and Offset Pagination.

Cursor Pagination

Used for efficient pagination over large datasets.

Page 1
   │
   ▼
Cursor
   │
   ▼
Page 2
   │
   ▼
Cursor
Offset Pagination

Used where traditional page-based navigation is more suitable, such as administrative interfaces.

🧩 Design Patterns & Architecture

The project uses several architectural and design patterns:

CQRS
Factory Pattern
Provider Abstraction
Event-Driven Architecture
DataLoader
Repository / Service Abstractions
Transactional Operations
Asynchronous Processing

Patterns are used where they provide a clear architectural or maintainability benefit.

🐳 Docker

The project uses Docker to provide a consistent development environment.

Multi-Stage Dockerfile

The application uses a multi-stage Dockerfile to separate build dependencies from the runtime environment.

┌─────────────────────┐
│     Build Stage     │
├─────────────────────┤
│ Install Dependencies│
│ Prisma Generate     │
│ Build NestJS        │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│    Runtime Stage    │
├─────────────────────┤
│ Production Files    │
│ Runtime Dependencies│
│ NestJS Application  │
└─────────────────────┘

This keeps build tooling separate from the final runtime image.

🐳 Docker Compose Development Environment

The development environment is orchestrated using Docker Compose.

The development setup includes the required infrastructure services such as:

┌─────────────────────────────────────────┐
│          Docker Compose                 │
├─────────────────────────────────────────┤
│                                         │
│  NestJS Application                     │
│  PostgreSQL                             │
│  Redis                                  │
│  MongoDB                                │
│  n8n                                    │
│                                         │
└─────────────────────────────────────────┘
Start Development Environment
docker compose -f docker-compose-dev.yml up --build -d
Stop Development Environment
docker compose -f docker-compose-dev.yml down
View Logs
docker compose -f docker-compose-dev.yml logs -f


🔄 Complete Booking Flow
                       User
                        │
                        ▼
                  Search Hotels
                        │
                        ▼
                 Search Rooms
                        │
                        ▼
                   Check Rates
                        │
                        ▼
                 Create Booking
                        │
                        ▼
                     PENDING
                        │
             ┌──────────┴──────────┐
             │                     │
             ▼                     ▼
        PaymentIntent          15 Minutes
             │                     │
             ▼                     ▼
        Stripe Webhook        BullMQ Job
             │                     │
             ▼                     ▼
          CONFIRMED            CANCELLED
             │                     │
             │                     ▼
             │                Hotelbeds
             │                Cancellation
             │
             ▼
       Real-Time Notification

🛡️ Reliability & Resilience

The system implements multiple mechanisms to improve reliability:

Idempotency keys
Rate limiting
Database transactions
Request timeouts
Provider error handling
Booking expiration
Asynchronous processing
BullMQ delayed jobs
Webhook state validation
Provider reference logging
Retryable background operations
Separation between local state and external provider operations

🎯 Engineering Goals

The project focuses on solving real-world backend engineering problems rather than implementing simple CRUD operations.

Main goals
Reliable booking workflows
External provider integration
Payment consistency
Idempotent operations
Asynchronous processing
Efficient database searching
GraphQL performance optimization
Event-driven architecture
Fault handling
Transactional consistency
Scalable application architecture

🛠️ Future Improvements
 Complete Admin Module
 Add provider failure/recovery tests
 Add payment workflow tests
 Add CI/CD pipeline
 Add production deployment configuration
 Add observability and monitoring
 Add distributed tracing

👨‍💻 Author

Mohamed Awad

Backend Developer

Focused on building backend systems using:

NestJS · TypeScript · PostgreSQL · Prisma · Redis · GraphQL · BullMQ · CQRS · Event-Driven Architecture · External APIs · Payment Systems

⭐ Project Highlights
🏨 Hotelbeds Integration
🔎 Advanced Hotel & Room Search
🔄 Automated Content Synchronization
🧾 Real-World Booking Lifecycle
⏱️ 15-Minute Booking Expiration
💳 Stripe PaymentIntent & Refund
🔐 Idempotency
🚦 Rate Limiting
🧠 CQRS
📣 Domain Events
⚡ Redis
📨 BullMQ
📧 n8n Automation
🔔 Real-Time Notifications
🚀 GraphQL + DataLoader
🗃️ PostgreSQL + Prisma
🍃 MongoDB + Mongoose
🐳 Docker Multi-Stage Builds
🐳 Docker Compose Development Environment
📌 Project Status

🚧 Actively under development

The core hotel search, provider integration, booking, payment, asynchronous processing, notification, and synchronization workflows have been implemented.

The Admin Module is currently under development.