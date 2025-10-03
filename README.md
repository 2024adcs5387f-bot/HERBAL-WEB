# HERBAL-WEB
Check ur signs know the right herb to use

# 🌿 Herbal Marketplace - Complete Platform

A comprehensive web-based herbal products portal that connects herbal product sellers, buyers, and herbalists. The system features AI-powered plant identification, symptom checking, personalized recommendations, and a full e-commerce marketplace.

## ✨ Features Implemented

### 🧠 AI-Powered Core Features
- **Plant Scanner**: Computer vision tool using Plant.id API for plant identification
- **Symptom Checker**: Health condition analysis using Infermedica API
- **Recommendation Engine**: AI-powered herbal remedy suggestions using OpenAI GPT-3.5
- **Medicinal Knowledge Base**: Comprehensive plant and remedy database

### 🛒 E-commerce Marketplace
- **Product Management**: Full CRUD operations for sellers
- **Shopping Cart**: Persistent cart with localStorage
- **Secure Payments**: Stripe integration with webhook handling
- **Order Management**: Complete order lifecycle management
- **User Roles**: Buyer, Seller, and Herbalist dashboards

### 👥 User Management & Dashboards
- **Multi-Role System**: Tailored experiences for different user types
- **Seller Dashboard**: Product management, order processing, analytics
- **Herbalist Dashboard**: Knowledge contribution, plant database management
- **Buyer Dashboard**: Order history, AI tools access

### 🔒 Security & Infrastructure
- **JWT Authentication**: Secure user authentication and authorization
- **Rate Limiting**: API protection against abuse
- **Input Validation**: Comprehensive data validation and sanitization
- **Error Handling**: Centralized error management
- **File Upload**: Cloudinary integration for media storage

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- PostgreSQL database
- Stripe account (for payments)
- Plant.id API key
- Infermedica API credentials
- OpenAI API key
- Cloudinary account

### 1. Clone and Install
```bash
git clone <repository-url>
cd herbal-marketplace

# Install frontend dependencies
npm install

# Install backend dependencies
cd backend
npm install
```

### 2. Environment Setup

#### Frontend Environment
Create `.env.local` file in the root directory:

```env
# API Configuration
VITE_API_BASE_URL=http://localhost:5000
```

#### Backend Environment
Create `.env` file in the backend directory:

```env
# Server
PORT=5000
NODE_ENV=development

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=herbal_marketplace
DB_USER=your_username
DB_PASSWORD=your_password

# JWT
JWT_SECRET=your_secure_jwt_secret

# Stripe
STRIPE_SECRET_KEY=sk_test_your_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# AI APIs
PLANT_ID_API_KEY=your_plant_id_key
INFERMEDICA_APP_ID=your_app_id
INFERMEDICA_APP_KEY=your_app_key
OPENAI_API_KEY=your_openai_key

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Frontend URL
FRONTEND_URL=http://localhost:5173
```

### 3. Database Setup
```bash
cd backend
npm run migrate
npm run seed
```

### 4. Start Development Servers
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
npm run dev
```

Visit `http://localhost:5173` to see the application!

## 🏗️ Project Structure

```
herbal-marketplace/
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   │   ├── Hero/        # Landing page hero section
│   │   │   ├── Navbar/      # Navigation component
│   │   │   ├── marketplace/ # Product-related components
│   │   │   ├── PlantScanner/# AI plant identification
│   │   │   ├── SymptomChecker/ # Health symptom analysis
│   │   │   └── RecommendationEngine/ # AI recommendations
│   │   ├── pages/           # Page components
│   │   │   ├── Home/        # Landing page
│   │   │   ├── Products/    # Product catalog
│   │   │   ├── Cart/        # Shopping cart
│   │   │   ├── Dashboard/   # User dashboard
│   │   │   └── ...          # Other pages
│   │   └── styles/          # CSS and design system
│   └── public/              # Static assets
├── backend/                  # Node.js/Express backend
│   ├── config/              # Configuration files
│   ├── middleware/          # Express middleware
│   ├── models/              # Database models
│   ├── routes/              # API route handlers
│   ├── scripts/             # Database scripts
│   └── utils/               # Utility functions
└── docs/                    # Documentation
```

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/profile` - Get user profile

### Products
- `GET /api/products` - List products
- `GET /api/products/:id` - Get product details
- `POST /api/products` - Create product (seller)
- `PUT /api/products/:id` - Update product (seller)
- `DELETE /api/products/:id` - Delete product (seller)

### Orders
- `GET /api/orders` - Get user orders
- `POST /api/orders` - Create order
- `PUT /api/orders/:id/status` - Update order status
- `GET /api/orders/seller` - Get seller orders

### Payments
- `POST /api/payments/create-checkout-session` - Create Stripe checkout
- `POST /api/payments/webhook` - Stripe webhook handler
- `GET /api/payments/session/:id` - Get checkout session

### AI Features
- `POST /api/ai/plant-identify` - Plant identification
- `POST /api/ai/symptom-check` - Symptom analysis
- `POST /api/ai/recommend` - AI recommendations

## 🎯 User Roles & Permissions

### 👤 Buyer
- Browse and search products
- Add items to cart
- Complete purchases
- Access AI tools (plant scanner, symptom checker)
- View order history
- Get personalized recommendations

### 🏪 Seller
- Create and manage products
- Process orders
- View sales analytics
- Manage inventory
- Access seller dashboard

### 🌿 Herbalist
- Contribute plant knowledge
- Create remedy guides
- Verify herbal information
- Access specialized dashboard
- Manage medicinal database

## 🛡️ Security Features

- **JWT Authentication**: Secure token-based authentication
- **Role-Based Access Control**: User permission management
- **Input Validation**: Comprehensive data sanitization
- **Rate Limiting**: API abuse prevention
- **CORS Protection**: Cross-origin request security
- **SQL Injection Prevention**: Parameterized queries
- **XSS Protection**: Content security policies

## 🚀 Deployment

### Frontend (Vercel)
```bash
npm run build
vercel --prod
```

### Backend (Render/Railway)
```bash
# Set production environment variables
NODE_ENV=production
npm start
```

### Database (Supabase/Neon)
- Use managed PostgreSQL service
- Set connection string in environment variables
- Run migrations on deployment

## 📊 Performance & Scalability

- **Database Indexing**: Optimized queries with proper indexes
- **Image Optimization**: Cloudinary CDN for media delivery
- **Caching**: Redis integration for session management
- **Load Balancing**: Horizontal scaling ready
- **CDN**: Global content delivery network

## 🔍 Testing

```bash
# Frontend tests
npm run test

# Backend tests
cd backend
npm run test

# E2E tests
npm run test:e2e
```

## 📱 Mobile Responsiveness

- **Responsive Design**: Mobile-first approach
- **Touch-Friendly**: Optimized for mobile devices
- **PWA Ready**: Progressive web app capabilities
- **Cross-Browser**: Modern browser compatibility

## 🌟 Key Technologies

### Frontend
- **React 19** - Modern React with hooks
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Smooth animations
- **React Router** - Client-side routing
- **Vite** - Fast build tool

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **PostgreSQL** - Relational database
- **Sequelize** - ORM for database operations
- **JWT** - Authentication tokens
- **Stripe** - Payment processing

### AI & External APIs
- **Plant.id** - Plant identification
- **Infermedica** - Symptom analysis
- **OpenAI GPT-3.5** - AI recommendations
- **Cloudinary** - Media management

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: Check the docs folder
- **Issues**: Report bugs via GitHub issues
- **Discussions**: Join community discussions
- **Email**: support@herbalmarketplace.com

## 🎉 Acknowledgments

- Plant.id for plant identification API
- Infermedica for medical symptom analysis
- OpenAI for AI-powered recommendations
- Stripe for secure payment processing
- Cloudinary for media management

---

**Built with ❤️ for the herbal medicine community**

*This platform bridges traditional herbal wisdom with modern AI technology, creating a trusted marketplace for natural health solutions.*

