# UniBook - Multi-Service Booking Platform

UniBook is a comprehensive, full-stack web application designed to streamline the booking process for various services including Futsal venues, Hospitals, Restaurants, and Salons. It provides a unified interface for clients to discover services, check real-time availability, and make secure payments.

## Key Features

### Security & Authentication
- **Multi-Role RBAC**: Dedicated dashboards for Admins, Service Providers, and Clients.
- **Two-Factor Verification**: OTP-based email verification for registration and security.
- **JWT Protection**: Stateless authentication with encrypted token storage.

### Booking & Management
- **Capacity-Aware Engine**: Real-time slot availability tracking to prevent overbooking.
- **Multi-Slot Selection**: Support for single or block bookings (e.g., Futsal court hours).
- **Automated Reminders**: Background jobs for sending appointment alerts via email.

### 💳 Payment Integration
- **eSewa Secure Checkout**: Integrated cryptographic signing (HMAC-SHA256) for tamper-proof transactions.
- **Audit Ledger**: Complete history of payment statuses and transaction UUIDs.

### Business Intelligence
- **Admin Command Center**: Real-time KPI aggregation (Revenue, Growth Trends, Category Breakdown).
- **Provider Portal**: Earnings tracking, gallery management, and client rescheduling.

## Technology Stack
- **Frontend**: React.js, Tailwind CSS, Vite.
- **Backend**: Node.js, Express.js.
- **Database**: MySQL (with Auto-Migration).
- **Communications**: Nodemailer (SMTP).

## Project Structure
- `/my-react-app`: Frontend application.
- `/server`: Backend API and automation engine.
- `/uploads`: Storage for provider documents and business banners.

## Setup Instructions

### Backend
1. `cd server`
2. `npm install`
3. Configure `.env` (refer to `.env.example`)
4. `node server.js`

### Frontend
1. `cd my-react-app`
2. `npm install`
3. `npm start`

---
*Developed as a Final Year Project.*
