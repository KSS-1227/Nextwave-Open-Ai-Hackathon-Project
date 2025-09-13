// Shared email service using SMTP
import { SMTPClient } from 'https://deno.land/x/denomailer@1.6.0/mod.ts'

interface EmailConfig {
  host: string
  port: number
  username: string
  password: string
  secure: boolean
}

interface EmailMessage {
  to: string
  toName?: string
  subject: string
  html: string
  text?: string
}

export class EmailService {
  private client: SMTPClient
  private config: EmailConfig

  constructor() {
    this.config = {
      host: Deno.env.get('SMTP_HOST') || 'smtp.gmail.com',
      port: parseInt(Deno.env.get('SMTP_PORT') || '465'),
      username: Deno.env.get('SMTP_USERNAME')!,
      password: Deno.env.get('SMTP_PASSWORD')!,
      secure: Deno.env.get('SMTP_SECURE') === 'true' || true
    }

    this.client = new SMTPClient({
      connection: {
        hostname: this.config.host,
        port: this.config.port,
        tls: this.config.secure,
        auth: {
          username: this.config.username,
          password: this.config.password,
        },
      },
    })
  }

  async sendEmail(message: EmailMessage): Promise<void> {
    try {
      await this.client.send({
        from: this.config.username,
        to: message.to,
        subject: message.subject,
        content: message.text || '',
        html: message.html,
      })
      
      console.log(`Email sent successfully to ${message.to}`)
    } catch (error) {
      console.error('Failed to send email:', error)
      throw new Error(`Failed to send email: ${error.message}`)
    }
  }

  generateReminderEmail(fullName: string, updateUrl: string): { subject: string, html: string, text: string } {
    const subject = 'VirtualCFO - Update Your Daily Earnings'
    
    const html = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>${subject}</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #2563eb; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f8fafc; padding: 30px; border-radius: 0 0 8px 8px; }
            .button { display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
            .stats { background: white; padding: 20px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #2563eb; }
            .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #666; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>📊 VirtualCFO Daily Reminder</h1>
            </div>
            <div class="content">
                <h2>Hi ${fullName}! 👋</h2>
                
                <p>Hope your business is doing well today! We noticed you haven't updated your daily earnings yet.</p>
                
                <div class="stats">
                    <h3>🎯 Why daily tracking matters:</h3>
                    <ul>
                        <li>📈 Spot trends and patterns in your business</li>
                        <li>💡 Make data-driven decisions</li>
                        <li>🏆 Maintain your tracking streak</li>
                        <li>📊 Get accurate monthly reports</li>
                    </ul>
                </div>
                
                <p>It only takes 30 seconds to update your earnings and inventory costs:</p>
                
                <div style="text-align: center;">
                    <a href="${updateUrl}" class="button">🚀 Update Now</a>
                </div>
                
                <p><strong>Quick tip:</strong> Set a daily reminder on your phone for the same time each day to build a consistent habit!</p>
                
                <div class="footer">
                    <p>Best regards,<br>Your VirtualCFO Team</p>
                    <p>📱 Need help? Reply to this email or contact support</p>
                </div>
            </div>
        </div>
    </body>
    </html>
    `

    const text = `
    Hi ${fullName}!

    Hope your business is doing well today! We noticed you haven't updated your daily earnings yet.

    Why daily tracking matters:
    - Spot trends and patterns in your business
    - Make data-driven decisions  
    - Maintain your tracking streak
    - Get accurate monthly reports

    Update your earnings now: ${updateUrl}

    Quick tip: Set a daily reminder on your phone for the same time each day to build a consistent habit!

    Best regards,
    Your VirtualCFO Team
    `

    return { subject, html, text }
  }

  async close(): Promise<void> {
    try {
      await this.client.close()
    } catch (error) {
      console.error('Error closing SMTP connection:', error)
    }
  }
}