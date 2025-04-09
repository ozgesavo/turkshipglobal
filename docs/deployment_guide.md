# TurkShipGlobal Deployment Guide

This document provides instructions for deploying the TurkShipGlobal dropshipping platform.

## Prerequisites

- Node.js (v14+)
- MongoDB (v4+)
- npm or yarn
- Git

## Environment Setup

1. Clone the repository:
```bash
git clone https://github.com/your-organization/turkshipglobal.git
cd turkshipglobal
```

2. Create environment variables:

Create a `.env` file in the backend directory with the following variables:
```
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb://your-mongodb-uri
JWT_SECRET=your-jwt-secret
JWT_EXPIRE=30d
SHOPIFY_API_KEY=your-shopify-api-key
SHOPIFY_API_SECRET=your-shopify-api-secret
```

## Backend Deployment

1. Install dependencies:
```bash
cd backend
npm install
```

2. Build the backend:
```bash
npm run build
```

3. Start the server:
```bash
npm start
```

For production deployment, we recommend using PM2:
```bash
npm install -g pm2
pm2 start server.js --name turkshipglobal-backend
```

## Frontend Deployment

1. Install dependencies:
```bash
cd frontend
npm install
```

2. Build the frontend:
```bash
npm run build
```

3. The build folder can be served using any static file server.

## Deployment Options

### Option 1: Render

1. Create a new Web Service for the backend
   - Connect your GitHub repository
   - Set the build command: `cd backend && npm install`
   - Set the start command: `cd backend && node server.js`
   - Add environment variables

2. Create a new Static Site for the frontend
   - Connect your GitHub repository
   - Set the build command: `cd frontend && npm install && npm run build`
   - Set the publish directory: `frontend/build`

### Option 2: Vercel/Netlify + MongoDB Atlas

1. Deploy the frontend to Vercel or Netlify
   - Connect your GitHub repository
   - Set the build command: `cd frontend && npm install && npm run build`
   - Set the output directory: `frontend/build`

2. Deploy MongoDB to MongoDB Atlas
   - Create a free cluster
   - Set up database user and network access
   - Get connection string

3. Deploy the backend to a service like Render or Heroku
   - Connect your GitHub repository
   - Set the build command: `cd backend && npm install`
   - Set the start command: `cd backend && node server.js`
   - Add environment variables including the MongoDB Atlas connection string

## Post-Deployment Steps

1. Set up domain and SSL certificates
2. Configure backup strategy for the database
3. Set up monitoring and logging
4. Test all functionality in the production environment

## Troubleshooting

- If you encounter CORS issues, ensure the frontend URL is properly configured in the backend
- For database connection issues, verify your MongoDB connection string and network settings
- For Shopify integration issues, verify your API keys and scopes

## Support

For any deployment issues, please contact support@turkshipglobal.com
