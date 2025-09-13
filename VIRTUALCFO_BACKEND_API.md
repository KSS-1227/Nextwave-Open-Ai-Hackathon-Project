# VirtualCFO Backend API Documentation

## Overview

The VirtualCFO backend is built using **Supabase + Edge Functions** to provide a complete financial tracking solution for small businesses. This includes user profiles, daily earnings tracking, automated reminders via WhatsApp & email, and comprehensive analytics.

## Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Frontend      │────│  Supabase Edge   │────│   PostgreSQL    │
│   (React)       │    │   Functions      │    │   Database      │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                │
                    ┌───────────┼───────────┐
                    │                       │
            ┌───────▼──────┐        ┌──────▼──────┐
            │   WhatsApp   │        │    SMTP     │
            │  Cloud API   │        │   Email     │
            └──────────────┘        └─────────────┘
```

## Database Schema

> **Note**: The database tables have already been created in your Supabase project. The Edge Functions are designed to work with your existing table structure.

### Expected Table Structure

### 📊 profiles table

```sql
- id (uuid, PK, references auth.users)
- business_name (text)
- owner_name (text)
- business_type (text)
- location (text)
- monthly_revenue (numeric)
- monthly_expenses (numeric)
- preferred_language (text)
- phone_number (text) → +91XXXXXXXXXX format
- notify_whatsapp (bool, default true)
- notify_email (bool, default true)
- created_at (timestamptz)
```

### 💰 earnings table

```sql
- id (uuid, PK)
- user_id (uuid, FK → auth.users.id)
- earning_date (date, NOT NULL, unique per user)
- amount (numeric, NOT NULL, ≥0)
- inventory_cost (numeric, NOT NULL, ≥0)
- file_url (text)
- doc_type (text)
- processed_text (text)
- status (text)
- created_at (timestamptz)
- updated_at (timestamptz)
```

### 🔒 Security Rules

- **Row Level Security (RLS)** enabled on all tables
- Users can only access their own data
- JWT authentication required
- Records are locked after creation (no updates/deletes)
- Future date entries are prevented

## 🚀 API Endpoints

### 1. POST `/functions/v1/earnings-add`

Add daily earnings entry for authenticated user.

**Request:**

```json
{
  "income": 5000.0,
  "inventory_cost": 3000.0,
  "date": "2025-01-15"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "user_id": "uuid",
    "date": "2025-01-15",
    "income": 5000.0,
    "inventory_cost": 3000.0,
    "profit": 2000.0,
    "locked": true,
    "created_at": "2025-01-15T10:30:00Z",
    "message": "Earnings record added successfully and locked"
  }
}
```

**Validation Rules:**

- ✅ Only past/today dates allowed
- ✅ One record per user per date
- ✅ Income & inventory_cost ≥ 0
- ✅ Auto-locked after creation

### 2. GET `/functions/v1/earnings-summary/:user_id`

Get comprehensive earnings summary and analytics.

**Response:**

```json
{
  "success": true,
  "data": {
    "user_id": "uuid",
    "summary": {
      "daily_earnings": [
        {
          "date": "2025-01-15",
          "income": 5000,
          "inventory_cost": 3000,
          "profit": 2000
        }
      ],
      "monthly_totals": [
        {
          "month": "2025-01",
          "total_income": 150000,
          "total_inventory_cost": 90000,
          "total_profit": 60000
        }
      ],
      "monthly_growth_percent": 15.5,
      "current_streak_days": 7,
      "weekly_averages": [...],
      "last_update": "2025-01-15",
      "total_entries": 30
    },
    "alerts": {
      "missing_today": false,
      "days_since_update": 0,
      "needs_reminder": false,
      "missing_days_this_month": 2
    },
    "today": {
      "has_entry": true,
      "entry": {...}
    },
    "generated_at": "2025-01-15T15:30:00Z"
  }
}
```

### 3. POST `/functions/v1/daily-reminders`

Cron job function (runs every 12 hours) to send reminders.

**Headers:**

```
Authorization: Bearer your-cron-secret
```

**Response:**

```json
{
  "success": true,
  "data": {
    "job_completed_at": "2025-01-15T09:00:00Z",
    "summary": {
      "total_users_checked": 150,
      "users_missing_today": 45,
      "users_needing_alert": 12,
      "users_notified": 57,
      "emails_sent": 34,
      "whatsapps_sent": 0,
      "total_notifications": 34
    }
  }
}
```

## 📧 Notification System

### Email Integration (SMTP)

- **Provider**: Gmail SMTP or any SMTP server
- **Configuration**: Host, Port, Username, App Password
- **Template**: Professional HTML + plain text
- **Features**: Personalized messages, business branding

### WhatsApp Integration (Disabled)

- **Status**: ❌ Temporarily disabled until hosting
- **Reason**: Requires proper hosting environment
- **Alternative**: Email notifications available
- **Future**: Will be enabled after deployment

### Reminder Logic

- ⏰ **Runs every 12 hours** (9 AM & 9 PM)
- 🎯 **Targets users** who:
  - Haven't added today's entry
  - Haven't updated for >2 days
- 📱 **Respects preferences**: `notify_email`, `notify_whatsapp`
- 🚫 **Rate limiting**: 100ms delay between notifications

## 🔧 Setup & Deployment

### 1. Environment Setup

```bash
# Copy environment template
cp .env.example .env

# Configure your values
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SMTP_USERNAME=sherigarakarthik17@gmail.com
SMTP_PASSWORD=your-app-password
WHATSAPP_ACCESS_TOKEN=your-token
# ... other variables
```

### 2. Database Migration

```bash
# Apply database migration
supabase db reset

# Or apply specific migration
supabase db push
```

### 3. Deploy Edge Functions

```bash
# Deploy all functions
supabase functions deploy earnings-add
supabase functions deploy earnings-summary
supabase functions deploy daily-reminders

# Set environment variables
supabase secrets set SMTP_USERNAME=sherigarakarthik17@gmail.com
supabase secrets set SMTP_PASSWORD=your-app-password
supabase secrets set WHATSAPP_ACCESS_TOKEN=your-token
# ... set all required secrets
```

### 4. Setup Cron Job

Configure in Supabase Dashboard or external cron service:

```bash
# Every 12 hours (9 AM & 9 PM UTC)
curl -X POST "https://your-project.supabase.co/functions/v1/daily-reminders" \
  -H "Authorization: Bearer your-cron-secret"
```

## 🔐 Security Features

### Authentication

- ✅ JWT token validation on all endpoints
- ✅ User can only access own data
- ✅ Service role key for admin operations

### Data Protection

- ✅ Row Level Security (RLS) policies
- ✅ Input validation & sanitization
- ✅ Rate limiting on API calls
- ✅ CORS properly configured

### Business Logic

- ✅ Records locked after creation
- ✅ No future date entries
- ✅ Unique constraint per user per date
- ✅ Automatic profit calculation

## 📊 Analytics Features

### Daily Tracking

- Income & inventory cost entries
- Automatic profit calculation
- Streak tracking
- Missing days alerts

### Monthly Reports

- Growth percentage vs previous month
- Total income/expenses/profit
- Weekly averages
- Visual charts data

### Insights

- Business performance trends
- Cash flow analysis
- Inventory cost optimization
- Revenue patterns

## 🧪 Testing

### API Testing

```bash
# Test earnings addition
curl -X POST "https://your-project.supabase.co/functions/v1/earnings-add" \
  -H "Authorization: Bearer your-jwt-token" \
  -H "Content-Type: application/json" \
  -d '{"income": 5000, "inventory_cost": 3000, "date": "2025-01-15"}'

# Test summary retrieval
curl "https://your-project.supabase.co/functions/v1/earnings-summary" \
  -H "Authorization: Bearer your-jwt-token"

# Test reminder system
curl -X POST "https://your-project.supabase.co/functions/v1/daily-reminders" \
  -H "Authorization: Bearer your-cron-secret"
```

### Database Testing

```sql
-- Test user data
SELECT * FROM profiles WHERE id = 'user-uuid';

-- Test earnings data
SELECT * FROM earnings WHERE user_id = 'user-uuid' ORDER BY date DESC;

-- Test summary function
SELECT * FROM get_earnings_summary('user-uuid');
```

## 🚨 Error Handling

### Common Error Codes

- `400`: Bad Request (validation errors)
- `401`: Unauthorized (invalid/missing token)
- `403`: Forbidden (access denied)
- `409`: Conflict (duplicate entry)
- `500`: Internal Server Error

### Error Response Format

```json
{
  "success": false,
  "error": "Detailed error message",
  "code": "ERROR_CODE"
}
```

## 📈 Performance

### Optimization Features

- Database indexes on frequently queried columns
- Efficient RLS policies
- Connection pooling
- Rate limiting
- Caching strategies

### Monitoring

- Function execution logs
- Database performance metrics
- Notification delivery rates
- User engagement analytics

## 🔄 Maintenance

### Regular Tasks

- Monitor function logs
- Check notification delivery rates
- Review database performance
- Update API tokens when needed
- Backup critical data

### Scaling Considerations

- Edge function concurrency limits
- Database connection limits
- SMTP rate limits
- WhatsApp rate limits
- Storage requirements

---

## 📞 Support

For technical support or questions:

- 📧 Email: support@virtualcfo.app
- 📖 Documentation: [Link to full docs]
- 🐛 Issues: [GitHub Issues]

Built with ❤️ using Supabase + Edge Functions
