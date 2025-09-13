# VirtualCFO Backend Quick Start

## Prerequisites

- [Supabase CLI](https://supabase.com/docs/guides/cli) installed
- Gmail account with App Password for SMTP
- WhatsApp Business API access (Meta)
- Node.js and npm

## 🚀 Quick Setup

### 1. Environment Configuration

```bash
# Copy environment template
cp .env.example .env

# Edit .env with your actual values
nano .env
```

### 2. Gmail SMTP Setup

1. Enable 2FA on your Gmail account
2. Generate App Password: Google Account → Security → 2-Step Verification → App passwords
3. Use the generated password in `SMTP_PASSWORD`
4. Set `SMTP_USERNAME=sherigarakarthik17@gmail.com` as your sender email

### 3. WhatsApp Setup

1. Create Meta Developer account
2. Set up WhatsApp Business API
3. Get Phone Number ID and Access Token
4. Add to `.env` file

### 4. Deploy Backend (No Database Migration)

```bash
# Make deployment script executable
chmod +x deploy-backend.sh

# Run deployment (will skip database migrations)
./deploy-backend.sh
```

> **Note**: The deployment script will skip database migrations since your tables already exist in Supabase.

### 5. Set Up Cron Job

Add to your cron scheduler (every 12 hours):

```bash
0 9,21 * * * curl -X POST "https://your-project.supabase.co/functions/v1/daily-reminders" -H "Authorization: Bearer your-cron-secret"
```

## 🧪 Testing

### Test API Endpoints

```bash
# Get your project URL
supabase status

# Test earnings addition (replace with actual JWT token)
curl -X POST "https://your-project.supabase.co/functions/v1/earnings-add" \
  -H "Authorization: Bearer your-jwt-token" \
  -H "Content-Type: application/json" \
  -d '{"income": 5000, "inventory_cost": 3000, "date": "2025-01-15"}'

# Test summary
curl "https://your-project.supabase.co/functions/v1/earnings-summary" \
  -H "Authorization: Bearer your-jwt-token"
```

## 📊 Database Schema

The migration creates two main tables:

- `profiles`: User information and notification preferences
- `earnings`: Daily income/expense tracking with locked records

All tables have Row Level Security (RLS) enabled.

## 🔐 Security Features

- JWT authentication required
- User can only access own data
- Records locked after creation
- Input validation and sanitization
- Rate limiting enabled

## 📧 Notifications

- **Email**: Professional HTML templates via SMTP
- **WhatsApp**: Text messages via Meta Cloud API
- **Frequency**: Every 12 hours for missing entries
- **Targeting**: Users who haven't updated today or >2 days

## 📈 Analytics

The summary endpoint provides:

- Daily earnings data (last 30 days)
- Monthly totals and growth
- Weekly averages
- Streak tracking
- Missing days alerts

## 🛠️ Troubleshooting

### Common Issues

1. **SMTP Authentication Failed**

   - Ensure 2FA is enabled on Gmail
   - Use App Password, not regular password
   - Check SMTP settings in .env

2. **WhatsApp Not Sending**

   - Verify phone number format (+91XXXXXXXXXX)
   - Check access token validity
   - Ensure phone number is verified in Meta

3. **Database Migration Failed**
   - Check Supabase connection
   - Verify project permissions
   - Review migration SQL syntax

### Debug Commands

```bash
# Check Supabase status
supabase status

# View function logs
supabase functions logs earnings-add

# Test database connection
supabase db pull
```

## 📞 Support

- 📖 Full API Documentation: `VIRTUALCFO_BACKEND_API.md`
- 🔧 Configuration: `.env.example`
- 🚀 Deployment: `deploy-backend.sh`

Ready to power your VirtualCFO app! 🎉
