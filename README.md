# Film Mania 🎬

An open-source subscription-based movie streaming platform designed to serve a diverse audience with multi-language content support and AI-powered subtitle translation.

## 🌟 Overview

Film Mania is a modern, production-ready streaming platform that enables users to watch films from various languages including Tamil, Malayalam, Hindi, English, Korean, Japanese, and Anime. The platform features AI-powered English-to-Sinhala subtitle translation, making content accessible to a broader audience.

### Key Features

- 🎥 **Multi-Language Content**: Support for Tamil, Malayalam, Hindi, English, Korean, Japanese, and Anime
- 🤖 **AI Subtitle Translation**: Automatic English-to-Sinhala subtitle conversion using AI models
- 💳 **Subscription Management**: Flexible monthly/yearly subscription plans via Stripe
- 🔐 **Secure Authentication**: JWT-based authentication with refresh tokens
- 📊 **Admin Dashboard**: Admin tools for funding user subscriptions and managing API credits
- 🎯 **Content Discovery**: Advanced search, filtering, and categorization
- 🌐 **Self-Hosted**: Full Docker Compose setup for easy deployment
- 📱 **Responsive Design**: Modern UI built with Next.js and React

## 🏗️ Architecture

### Tech Stack

**Frontend:**
- Next.js 14+ (App Router)
- React 18+
- TypeScript
- Tailwind CSS (optional)

**Backend:**
- Node.js 18+
- Express.js
- TypeScript
- PostgreSQL with Sequelize ORM
- JWT Authentication
- Stripe Integration

**Infrastructure:**
- Docker & Docker Compose
- Nginx Reverse Proxy
- PostgreSQL Database
- NX Monorepo

**External Services:**
- Stripe (Payment Processing)
- TMDB (Movie Metadata)
- VidAPI/StreamAPI (Streaming Links)
- AI Model (Subtitle Translation)

## 📁 Project Structure

```
film-mania/
├── apps/
│   ├── api/                    # Backend API (Express/TypeScript)
│   │   ├── src/
│   │   │   ├── config/        # Configuration (app.config.ts, database.ts)
│   │   │   ├── controllers/    # API controllers
│   │   │   ├── middleware/    # Auth, validation, error handling
│   │   │   ├── models/        # Sequelize database models
│   │   │   ├── routes/        # API routes (auth, movies, subscriptions, etc.)
│   │   │   ├── services/      # Business logic (auth, stripe, movie)
│   │   │   └── main.ts        # Application entry point
│   │   └── Dockerfile
│   │
│   └── web/                    # Frontend (Next.js/React)
│       ├── src/
│       │   ├── app/           # Next.js App Router pages
│       │   ├── components/    # React components
│       │   └── lib/           # Utilities and API client
│       └── Dockerfile
│
├── libs/
│   └── shared/                 # Shared TypeScript types and interfaces
│       └── src/
│           ├── interfaces/    # TypeScript interfaces (IMovie, etc.)
│           ├── dtos/          # Data Transfer Objects
│           └── enums/         # Enumerations
│
├── database/
│   └── schema.sql             # PostgreSQL database schema
│
├── docker/
│   └── nginx/                 # Nginx configuration
│       └── nginx.conf
│
├── docs/
│   ├── requirements.md        # Detailed requirements document
│   └── technical-feasibility.md # Technical architecture document
│
├── scripts/                   # Deployment and utility scripts
│   ├── deploy.sh
│   ├── setup-vps.sh
│   └── ...
│
├── docker-compose.yml        # Docker Compose configuration
├── nx.json                   # NX configuration
└── package.json              # Root package.json
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18.x or higher
- Yarn 4.x (via Corepack)
- Docker and Docker Compose
- PostgreSQL 14+ (or use Docker)
- Git

### Local Development Setup

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd film-mania
   ```

2. **Enable Corepack and install dependencies**
   ```bash
   corepack enable
   yarn install
   ```

3. **Set up environment variables**
   
   Create `apps/api/.env`:
   ```env
   NODE_ENV=development
   PORT=3000
   
   # Database
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=film_mania
   DB_USERNAME=postgres
   DB_PASSWORD=postgres
   
   # JWT
   JWT_SECRET=your-secret-key-change-in-production
   JWT_REFRESH_SECRET=your-refresh-secret-key-change-in-production
   JWT_EXPIRY=24h
   JWT_REFRESH_EXPIRY=7d
   
   # Stripe
   STRIPE_SECRET_KEY=sk_test_...
   STRIPE_WEBHOOK_SECRET=whsec_...
   
   # TMDB
   TMDB_API_KEY=your-tmdb-api-key
   
   # CORS
   CORS_ORIGIN=http://localhost:3001,http://localhost:3000
   ```

   Create `apps/web/.env.local`:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:3000
   ```

4. **Set up the database**
   ```bash
   # Start PostgreSQL with Docker
   docker-compose up -d postgres
   
   # Or use your existing PostgreSQL instance
   # Then run the schema
   psql -U postgres -d film_mania -f database/schema.sql
   ```

5. **Start the development servers**

   In one terminal, start the API:
   ```bash
   yarn api:dev
   ```
   API will run on http://localhost:3000

   In another terminal, start the web app:
   ```bash
   yarn web:dev
   ```
   Web app will run on http://localhost:3001

6. **Access the application**
   - Frontend: http://localhost:3001
   - API: http://localhost:3000
   - Health Check: http://localhost:3000/health

## 🐳 Docker Deployment

### Quick Start with Docker Compose

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down
```

The application will be available at:
- API: http://localhost:3000
- Web: http://localhost:3001
- Nginx (if configured): http://localhost

## 📚 API Documentation

### Authentication Endpoints

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/refresh` - Refresh access token
- `GET /api/auth/me` - Get current user info

### Movie Endpoints

- `GET /api/movies` - Get movies list (with filters)
- `GET /api/movies/:id` - Get movie details
- `GET /api/movies/categories/list` - Get available categories
- `GET /api/movies/category/:category` - Get movies by category
- `GET /api/movies/search/:query` - Search movies

### Subscription Endpoints

- `GET /api/subscriptions/current` - Get current subscription
- `POST /api/subscriptions/create` - Create subscription
- `POST /api/subscriptions/cancel` - Cancel subscription

### Admin Endpoints

- `POST /api/admin/fund-subscription` - Fund user subscription (3 months)
- `GET /api/admin/api-credits` - Get API credits
- `POST /api/admin/api-credits` - Add API credits
- `GET /api/admin/funding/stats` - Get funding statistics

## 🔧 Configuration

### Environment Variables

See `apps/api/env.example` for all available environment variables.

### Database Schema

The database schema includes:
- Users and authentication
- Subscriptions and payments
- Movies and categories
- Subtitles
- API credits and usage tracking
- Admin funding records

See `database/schema.sql` for the complete schema.

## 🎯 Features Roadmap

- [x] User authentication and authorization
- [x] Subscription management with Stripe
- [x] Movie catalog with multi-language support
- [x] Admin dashboard for funding subscriptions
- [x] API credit tracking
- [ ] AI subtitle translation (English to Sinhala)
- [ ] Video player with subtitle support
- [ ] User watchlist and favorites
- [ ] Movie recommendations
- [ ] Advanced search filters
- [ ] Mobile app (React Native)
- [ ] Social features (reviews, ratings)

## 🛡️ Security Features

- ✅ JWT-based authentication with refresh tokens
- ✅ Password hashing with bcrypt
- ✅ Helmet.js for security headers
- ✅ CORS configuration
- ✅ Input validation and sanitization
- ✅ Rate limiting (via Nginx)
- ✅ SQL injection prevention (Sequelize ORM)
- ✅ Environment variable management

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Ensure all tests pass and linting is clean
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

### Development Guidelines

- Follow TypeScript best practices
- Write meaningful commit messages
- Update documentation for new features
- Add tests for new functionality
- Ensure code passes ESLint checks

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- TMDB for movie metadata API
- Stripe for payment processing
- The open-source community for amazing tools and libraries

## 📧 Support

For issues, questions, or contributions:
- Open an issue on GitHub
- Check the [documentation](docs/) folder for detailed information
- Review the [requirements document](docs/requirements.md)

## 🌍 Live Demo

Coming soon! The application will be deployed and available for public access.

---

**Built with ❤️ using NX Monorepo, TypeScript, and modern web technologies**
