# Runmap - Marathon Event Search Platform

A full-stack web application for discovering and managing marathon events, built with Node.js, Express, React, and Next.js.

## Features

### 🏃‍♂️ Event Management
- Search and browse marathon events
- Filter events by location and date
- Event details with descriptions, dates, and locations
- Pagination for better performance

### 👤 User System
- User registration and authentication
- Profile management with personal information
- Membership tiers (Free and Premium)
- Notification preferences

### ⭐ Premium Features
- **Email notifications** for event reminders
- **Priority support**
- **Advanced event filtering**
- **Unlimited favorites**

### 💳 Payment System
- **Stripe integration** for secure payments
- **Premium membership upgrades**
- **Real-time payment processing**
- **Webhook handling** for payment events
- **Secure card data handling**

### 🔔 Notification System
- Automated email reminders for upcoming events
- In-app notifications
- Configurable notification settings
- Cron job scheduling for reminders

### 🛡️ Security
- JWT-based authentication with refresh tokens
- Password hashing with bcrypt
- Input validation with Joi
- Protected routes with middleware
- CORS configuration

## Tech Stack

### Backend
- **Node.js** with Express.js
- **Sequelize ORM** with MySQL
- **JWT** for authentication
- **Stripe** for payments
- **Nodemailer** for emails
- **Node-cron** for scheduled tasks

### Frontend
- **Next.js** with React
- **Chakra UI** for styling
- **Stripe Elements** for payment forms
- **Axios** for API calls
- **React Query/SWR** for data fetching

## Quick Start

### Prerequisites
- Node.js (v14 or higher)
- MySQL database
- Stripe account (for payments)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Runmap
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   ```

3. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   ```

4. **Environment Configuration**
   
   Create `.env` file in `backend/`:
   ```env
   STRIPE_SECRET_KEY=sk_test_your_key_here
   STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
   ACCESS_TOKEN_SECRET=your_jwt_secret
   REFRESH_TOKEN_SECRET=your_refresh_secret
   ```
   
   Create `.env.local` file in `frontend/`:
   ```env
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_key_here
   ```

5. **Database Setup**
   ```bash
   cd backend
   npx sequelize-cli db:migrate
   ```

6. **Start the Application**
   ```bash
   # Backend (port 5000)
   cd backend && npm start
   
   # Frontend (port 3000)
   cd frontend && npm run dev
   ```

## Payment System Setup

For detailed payment system setup instructions, see [PAYMENT_SETUP.md](./PAYMENT_SETUP.md).

### Key Payment Features
- **Secure Stripe Integration**: Industry-standard payment processing
- **Real-time Processing**: Instant payment confirmation
- **Webhook Handling**: Automated membership updates
- **Test Mode**: Safe testing with Stripe test cards
- **Error Handling**: Comprehensive error management

## API Endpoints

### Authentication
- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `POST /auth/refresh` - Refresh token
- `POST /auth/logout` - User logout

### Events
- `GET /events` - List events with pagination
- `GET /events/:id` - Get event details
- `POST /events/create` - Create event (admin)
- `PUT /events/:id` - Update event (admin)
- `DELETE /events/:id` - Delete event (admin)

### User Management
- `GET /user/profile` - Get user profile
- `PUT /user/profile/update` - Update profile
- `GET /user/favorites` - Get user favorites
- `POST /user/favorites` - Add favorite
- `DELETE /user/favorites/:eventId` - Remove favorite

### Payments
- `POST /payment/create-payment-intent` - Create payment intent
- `POST /payment/confirm-payment` - Confirm payment
- `GET /payment/pricing` - Get pricing information
- `POST /payment/webhook` - Stripe webhook handler

## Database Schema

### Core Models
- **User**: username, email, password, membershipStatus, notificationEnabled
- **Event**: name, description, date, location, imageUrl
- **Favorite**: userId, eventId (many-to-many)
- **Notification**: userId, message, isRead

## Testing

### Payment Testing
Use Stripe test card numbers:
- **Success**: `4242 4242 4242 4242`
- **Decline**: `4000 0000 0000 0002`
- **Requires Authentication**: `4000 0025 0000 3155`

**Note**: Premium membership costs ¥330 per year.

## Deployment

### Environment Variables
Ensure all required environment variables are set in production:
- Stripe keys (live mode)
- Database credentials
- JWT secrets
- Email configuration

### Security Considerations
- Use HTTPS in production
- Set up proper CORS configuration
- Configure Stripe webhooks for production
- Use strong JWT secrets
- Enable rate limiting

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the ISC License.

## Support

For payment-related issues, refer to the [Payment Setup Guide](./PAYMENT_SETUP.md).
For general support, check the console logs and ensure all environment variables are properly configured.
