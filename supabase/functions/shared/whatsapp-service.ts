// Shared WhatsApp service using Meta WhatsApp Cloud API
interface WhatsAppConfig {
  phoneNumberId: string
  accessToken: string
  verifyToken: string
  webhookUrl?: string
}

interface WhatsAppMessage {
  to: string
  message: string
  templateName?: string
  templateParams?: string[]
}

export class WhatsAppService {
  private config: WhatsAppConfig
  private baseUrl: string

  constructor() {
    this.config = {
      phoneNumberId: Deno.env.get('WHATSAPP_PHONE_NUMBER_ID')!,
      accessToken: Deno.env.get('WHATSAPP_ACCESS_TOKEN')!,
      verifyToken: Deno.env.get('WHATSAPP_VERIFY_TOKEN')!,
      webhookUrl: Deno.env.get('WHATSAPP_WEBHOOK_URL')
    }

    this.baseUrl = `https://graph.facebook.com/v18.0/${this.config.phoneNumberId}/messages`
  }

  async sendTextMessage(to: string, message: string): Promise<void> {
    // Remove any non-numeric characters and ensure proper format
    const cleanPhoneNumber = to.replace(/\D/g, '')
    
    // Ensure phone number starts with country code (91 for India)
    const phoneNumber = cleanPhoneNumber.startsWith('91') ? cleanPhoneNumber : `91${cleanPhoneNumber}`

    const payload = {
      messaging_product: 'whatsapp',
      to: phoneNumber,
      type: 'text',
      text: {
        body: message
      }
    }

    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        const errorData = await response.text()
        throw new Error(`WhatsApp API error: ${response.status} - ${errorData}`)
      }

      const result = await response.json()
      console.log(`WhatsApp message sent successfully to ${phoneNumber}:`, result)

    } catch (error) {
      console.error('Failed to send WhatsApp message:', error)
      throw new Error(`Failed to send WhatsApp message: ${error.message}`)
    }
  }

  async sendTemplateMessage(to: string, templateName: string, params: string[] = []): Promise<void> {
    const cleanPhoneNumber = to.replace(/\D/g, '')
    const phoneNumber = cleanPhoneNumber.startsWith('91') ? cleanPhoneNumber : `91${cleanPhoneNumber}`

    const payload = {
      messaging_product: 'whatsapp',
      to: phoneNumber,
      type: 'template',
      template: {
        name: templateName,
        language: {
          code: 'en'
        },
        components: params.length > 0 ? [
          {
            type: 'body',
            parameters: params.map(param => ({
              type: 'text',
              text: param
            }))
          }
        ] : []
      }
    }

    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        const errorData = await response.text()
        throw new Error(`WhatsApp API error: ${response.status} - ${errorData}`)
      }

      const result = await response.json()
      console.log(`WhatsApp template message sent successfully to ${phoneNumber}:`, result)

    } catch (error) {
      console.error('Failed to send WhatsApp template message:', error)
      throw new Error(`Failed to send WhatsApp template message: ${error.message}`)
    }
  }

  generateReminderMessage(fullName: string, updateUrl: string): string {
    return `📊 Hi ${fullName}! 

Hope your business is doing great today! 🚀

We noticed you haven't updated your daily earnings yet. It only takes 30 seconds to track your progress.

💡 *Why daily tracking helps:*
• Spot business trends instantly
• Make smarter decisions 
• Build a success habit
• Get accurate monthly reports

👆 *Update your earnings now:*
${updateUrl}

💪 Keep up the great work!

- Your VirtualCFO Team`
  }

  // Webhook verification for Meta WhatsApp
  verifyWebhook(mode: string, token: string, challenge: string): string | null {
    if (mode === 'subscribe' && token === this.config.verifyToken) {
      return challenge
    }
    return null
  }

  // Process incoming webhook messages
  async processWebhookMessage(body: any): Promise<void> {
    try {
      const entry = body.entry?.[0]
      const changes = entry?.changes?.[0]
      const value = changes?.value

      if (value?.messages) {
        for (const message of value.messages) {
          console.log('Received WhatsApp message:', message)
          
          // Handle different message types
          if (message.type === 'text') {
            await this.handleTextMessage(message, value.contacts?.[0])
          }
          // Add more message type handlers as needed
        }
      }

      // Mark messages as read
      if (value?.statuses) {
        for (const status of value.statuses) {
          console.log('Message status update:', status)
        }
      }

    } catch (error) {
      console.error('Error processing WhatsApp webhook:', error)
      throw error
    }
  }

  private async handleTextMessage(message: any, contact: any): Promise<void> {
    const from = message.from
    const text = message.text?.body?.toLowerCase()

    // Simple auto-responses
    if (text?.includes('help') || text?.includes('support')) {
      await this.sendTextMessage(from, 
        'Hi! I\'m your VirtualCFO assistant. You can:\n\n' +
        '• Update daily earnings through the app\n' +
        '• View your business analytics\n' +
        '• Get monthly reports\n\n' +
        'Need more help? Visit our support page or email support@virtualcfo.app'
      )
    } else if (text?.includes('stop') || text?.includes('unsubscribe')) {
      // Handle unsubscribe requests - update user preferences in database
      console.log(`User ${from} requested to stop notifications`)
    }
  }
}