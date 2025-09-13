# VirtualCFO Backend API

A production-ready Node.js backend API for the VirtualCFO App with Supabase integration, authentication, and AI-powered features.

## 🔧 Tech Stack

- **Node.js** (JavaScript)
- **Express.js** (REST API)
- **Supabase** (Database + Authentication)
- **OpenAI API** (AI Features)
- **JWT** (Token Authentication)

## 📦 Installation

1. Navigate to the backend directory:

```bash
cd backend
```

2. Install dependencies:

```bash
npm install
```

3. Set up environment variables:

```bash
cp .env.example .env
```

4. Configure your `.env` file with the following variables:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Supabase Configuration
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key

# CORS Configuration
CORS_ORIGIN=http://localhost:5173
```

## 🚀 Running the Server

### Development Mode

```bash
npm run dev
```

### Production Mode

```bash
npm start
```

The server will start on `http://localhost:5000`

## 📊 API Endpoints

### Health Check

- `GET /health` - Server health status
- `GET /api` - API information and available endpoints

### Authentication

All API endpoints require authentication using Supabase JWT tokens.

**Headers Required:**

```
Authorization: Bearer <your_supabase_jwt_token>
```

### Profile Management

- `GET /api/profile` - Get user profile
- `POST /api/profile` - Create/update user profile
- `PUT /api/profile` - Update user profile
- `GET /api/profile/stats` - Get profile statistics

### Document Management

- `GET /api/documents` - Get all user documents
- `GET /api/documents/:id` - Get specific document
- `POST /api/documents` - Create document record
- `PUT /api/documents/:id` - Update document
- `PATCH /api/documents/:id` - Partially update document
- `DELETE /api/documents/:id` - Delete document
- `GET /api/documents/stats` - Get document statistics

### AI Chat Assistant

- `POST /api/chat` - Chat with AI financial assistant
- `GET /api/chat/history` - Get chat history (placeholder)
- `GET /api/chat/insights` - Get AI-generated financial insights

### AI Business Ideas

- `POST /api/business-ideas` - Generate business ideas
- `GET /api/business-ideas/trending` - Get trending business sectors
- `GET /api/business-ideas/recommendations` - Get investment-based recommendations

## 📋 API Request/Response Format

### Standard Response Format

```json
{
  "success": true|false,
  "data": { ... } | null,
  "error": "error message" | null
}
```

### Example Requests

#### Create Profile

```bash
POST /api/profile
Content-Type: application/json
Authorization: Bearer <token>

{
  "business_name": "Tech Solutions Pvt Ltd",
  "owner_name": "John Doe",
  "business_type": "IT Services",
  "location": "Mumbai, India",
  "monthly_revenue": 500000,
  "monthly_expenses": 350000,
  "preferred_language": "English"
}
```

#### AI Chat

```bash
POST /api/chat
Content-Type: application/json
Authorization: Bearer <token>

{
  "message": "How can I reduce my business expenses?"
}
```

#### Marketing Suggestions

```bash
POST /api/marketing
Content-Type: application/json
Authorization: Bearer <token>

{
  "field": "EdTech"
}
```

#### Business Ideas

```bash
POST /api/business-ideas
Content-Type: application/json
Authorization: Bearer <token>

{
  "budget": 500000,
  "field": "Retail"
}
```

## 🔐 Security Features

- **JWT Authentication** - Secure token-based authentication
- **Row Level Security** - Database-level access control
- **CORS Protection** - Cross-origin request filtering
- **Helmet Security** - Security headers and protection
- **Input Validation** - Request data validation
- **Error Handling** - Comprehensive error management

## 🗄️ Database Schema

### Profiles Table

- `id` (UUID) - User ID (references auth.users)
- `business_name` (TEXT) - Business name
- `owner_name` (TEXT) - Owner name
- `business_type` (TEXT) - Type of business
- `location` (TEXT) - Business location
- `monthly_revenue` (NUMERIC) - Monthly revenue
- `monthly_expenses` (NUMERIC) - Monthly expenses
- `preferred_language` (TEXT) - Preferred language
- `created_at` (TIMESTAMP) - Creation timestamp

### Documents Table

- `id` (UUID) - Document ID
- `user_id` (UUID) - User ID (references auth.users)
- `file_name` (TEXT) - File name
- `file_url` (TEXT) - File URL
- `doc_type` (TEXT) - Document type
- `extracted_text` (TEXT) - Extracted text content
- `status` (TEXT) - Processing status
- `file_size` (BIGINT) - File size in bytes
- `mime_type` (TEXT) - MIME type
- `created_at` (TIMESTAMP) - Creation timestamp
- `updated_at` (TIMESTAMP) - Last update timestamp

## 🔄 Database Migrations

Run migrations to set up the database schema:

```bash
# Apply migrations using Supabase CLI
supabase db push
```

## 🛠️ Development

### Project Structure

```
backend/
├── config/           # Configuration files
│   ├── env.js       # Environment configuration
│   ├── supabase.js  # Supabase client setup
│   └── openai.js    # OpenAI client setup
├── controllers/      # Route controllers
│   ├── profileController.js
│   ├── documentController.js
│   ├── aiController.js
│   ├── marketingController.js
│   └── businessIdeasController.js
├── middleware/       # Express middleware
│   ├── auth.js      # Authentication middleware
│   └── errorHandler.js # Error handling
├── routes/          # API routes
│   ├── profile.js
│   ├── documents.js
│   ├── chat.js
│   ├── marketing.js
│   └── business-ideas.js
├── utils/           # Utility functions
├── .env             # Environment variables
├── package.json     # Dependencies and scripts
└── index.js         # Main server file
```

### Adding New Endpoints

1. Create controller in `controllers/`
2. Create routes in `routes/`
3. Add route to `index.js`
4. Test the endpoint

### Error Handling

The API uses consistent error handling with appropriate HTTP status codes:

- `400` - Bad Request (validation errors)
- `401` - Unauthorized (authentication required)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found (resource not found)
- `429` - Too Many Requests (rate limiting)
- `500` - Internal Server Error (server errors)

## 🚀 Deployment

### Environment Variables for Production

```env
NODE_ENV=production
PORT=5000
SUPABASE_URL=your_production_supabase_url
SUPABASE_ANON_KEY=your_production_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_production_service_key
OPENAI_API_KEY=your_openai_api_key
JWT_SECRET=your_secure_jwt_secret
CORS_ORIGIN=https://your-frontend-domain.com
```

### Production Deployment Steps

1. Set up production environment variables
2. Run `npm run build` if applicable
3. Start with `npm start`
4. Set up reverse proxy (nginx)
5. Enable SSL/TLS certificates
6. Configure monitoring and logging

## 📊 Monitoring

- Health check endpoint: `/health`
- API info endpoint: `/api`
- Console logging for errors and requests
- Morgan for HTTP request logging

## 🤝 Contributing

1. Follow the existing code structure
2. Add proper error handling
3. Include input validation
4. Write meaningful commit messages
5. Test your changes

## 📄 License

This project is licensed under the ISC License.
