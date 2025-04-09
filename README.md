# TurkShipGlobal Platform Setup

This document provides instructions for setting up the TurkShipGlobal platform for local development and testing.

## Local Development Setup

### Prerequisites

- Node.js (v14+)
- MongoDB (v4+)
- npm or yarn
- Git

### Backend Setup

1. Navigate to the backend directory:
```bash
cd /home/ubuntu/dropshipping_platform/backend
```

2. Create a `.env` file with the following content:
```
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/turkshipglobal
JWT_SECRET=dev_secret_key_change_in_production
JWT_EXPIRE=30d
```

3. Install dependencies:
```bash
npm install
```

4. Start MongoDB (if not already running):
```bash
mongod --dbpath=/data/db
```

5. Start the backend server:
```bash
node server.js
```

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd /home/ubuntu/dropshipping_platform/frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

The frontend will be available at http://localhost:3000

## Testing the Platform

### Admin Account

For testing purposes, you can use the following admin account:
- Email: admin@turkshipglobal.com
- Password: admin123

### Test Accounts

#### Supplier
- Email: supplier@test.com
- Password: supplier123

#### Dropshipper
- Email: dropshipper@test.com
- Password: dropshipper123

#### Sourcing Agent
- Email: agent@test.com
- Password: agent123

### Testing Workflow

1. Log in as a supplier and add products with variations
2. Log in as a dropshipper and import products to Shopify
3. Create test orders to verify the order processing system
4. Test the inventory management system by updating stock levels
5. Verify that notifications are sent correctly
6. Test the multilingual support by switching between English and Turkish

## Deployment

For production deployment, please refer to the [Deployment Guide](/home/ubuntu/dropshipping_platform/docs/deployment_guide.md).

## Additional Resources

- [User Guide](/home/ubuntu/dropshipping_platform/docs/user_guide.md): Comprehensive guide for using the platform
- [API Documentation](/home/ubuntu/dropshipping_platform/docs/api_docs.md): Documentation for the platform's API endpoints
- [Database Schema](/home/ubuntu/dropshipping_platform/docs/database_schema.md): Detailed database schema documentation

## Support

For any issues or questions, please contact:
- Email: support@turkshipglobal.com
- Phone: +90 123 456 7890
