// Daily reminders cron job - Runs every 12 hours to send reminders
// WhatsApp functionality disabled until hosting is available
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { 
  createResponse, 
  handleError, 
  supabase
} from '../shared/utils.ts'
import { EmailService } from '../shared/email-service.ts'
// import { WhatsAppService } from '../shared/whatsapp-service.ts' // Disabled until hosting

interface ReminderUser {
  id: string
  full_name: string
  email: string
  phone_number: string | null
  notify_email: boolean
  notify_whatsapp: boolean // Keep for future use when hosting is available
  business_name: string | null
}

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return createResponse(null, null, 200)
  }

  // Only allow POST requests (for cron jobs)
  if (req.method !== 'POST') {
    return createResponse(null, 'Method not allowed', 405)
  }

  try {
    // Verify cron job authorization (optional - add a secret header check)
    const cronSecret = req.headers.get('Authorization')
    const expectedSecret = Deno.env.get('CRON_SECRET')
    
    if (expectedSecret && cronSecret !== `Bearer ${expectedSecret}`) {
      return createResponse(null, 'Unauthorized', 401)
    }

    console.log('🕐 Starting daily reminders job at:', new Date().toISOString())

    const today = new Date().toISOString().split('T')[0]
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    
    // Get users who need email reminders (WhatsApp disabled until hosting)
    const { data: usersNeedingReminders, error: usersError } = await supabase
      .from('profiles')
      .select('id, full_name, email, phone_number, notify_email, notify_whatsapp, business_name')
      .eq('notify_email', true) // Only get users with email notifications enabled

    if (usersError) {
      throw usersError
    }

    if (!usersNeedingReminders || usersNeedingReminders.length === 0) {
      console.log('No users found with notification preferences enabled')
      return createResponse({ 
        message: 'No users to notify',
        processed: 0,
        sent_notifications: 0
      })
    }

    console.log(`📋 Found ${usersNeedingReminders.length} users with email notifications enabled`)

    // Check which users are missing today's entry
    const userIds = usersNeedingReminders.map(user => user.id)
    
    const { data: todaysEntries, error: entriesError } = await supabase
      .from('earnings')
      .select('user_id')
      .in('user_id', userIds)
      .eq('earning_date', today)  // Using your column name

    if (entriesError) {
      throw entriesError
    }

    const usersWithTodaysEntry = new Set(todaysEntries?.map(entry => entry.user_id) || [])
    const usersMissingToday = usersNeedingReminders.filter(user => !usersWithTodaysEntry.has(user.id))

    console.log(`📝 ${usersMissingToday.length} users missing today's entry`)

    // Also check for users who haven't updated for more than 2 days
    const { data: recentEntries, error: recentError } = await supabase
      .from('earnings')
      .select('user_id, earning_date')  // Using your column name
      .in('user_id', userIds)
      .gte('earning_date', new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
      .order('earning_date', { ascending: false })

    if (recentError) {
      throw recentError
    }

    // Group recent entries by user
    const recentEntriesByUser = new Map()
    recentEntries?.forEach(entry => {
      if (!recentEntriesByUser.has(entry.user_id)) {
        recentEntriesByUser.set(entry.user_id, [])
      }
      recentEntriesByUser.get(entry.user_id).push(entry.earning_date)  // Using your column name
    })

    const usersNeedingAlert = usersNeedingReminders.filter(user => {
      const userEntries = recentEntriesByUser.get(user.id) || []
      const latestEntry = userEntries.length > 0 ? Math.max(...userEntries.map(d => new Date(d).getTime())) : 0
      const daysSinceLastEntry = Math.floor((Date.now() - latestEntry) / (1000 * 60 * 60 * 24))
      return daysSinceLastEntry > 2
    })

    console.log(`⚠️ ${usersNeedingAlert.length} users need alert (>2 days without update)`)

    // Combine users who need reminders (missing today OR >2 days inactive)
    const allUsersToNotify = new Set([
      ...usersMissingToday.map(u => u.id),
      ...usersNeedingAlert.map(u => u.id)
    ])

    const usersToNotify = usersNeedingReminders.filter(user => allUsersToNotify.has(user.id))

    if (usersToNotify.length === 0) {
      console.log('✅ All users are up to date!')
      return createResponse({
        message: 'All users are up to date',
        total_users: usersNeedingReminders.length,
        users_missing_today: usersMissingToday.length,
        users_needing_alert: usersNeedingAlert.length,
        notifications_sent: 0
      })
    }

    // Initialize email service only (WhatsApp disabled)
    const emailService = new EmailService()
    // const whatsappService = new WhatsAppService() // Disabled until hosting

    let emailsSent = 0
    // let whatsappsSent = 0 // Disabled until hosting
    const errors: string[] = []

    const updateUrl = `${Deno.env.get('FRONTEND_URL') || 'https://your-app.com'}/earnings`

    // Send notifications
    for (const user of usersToNotify) {
      const userName = user.full_name || user.business_name || 'there'
      
      try {
        // Send email notification
        if (user.notify_email && user.email) {
          try {
            const emailContent = emailService.generateReminderEmail(userName, updateUrl)
            await emailService.sendEmail({
              to: user.email,
              toName: userName,
              ...emailContent
            })
            emailsSent++
            console.log(`📧 Email sent to ${user.email}`)
          } catch (emailError) {
            console.error(`Failed to send email to ${user.email}:`, emailError)
            errors.push(`Email to ${user.email}: ${emailError.message}`)
          }
        }

        // WhatsApp notifications disabled until hosting is available
        // if (user.notify_whatsapp && user.phone_number) {
        //   console.log(`📱 WhatsApp reminder skipped for ${user.phone_number} (hosting required)`)
        // }

        // Small delay between notifications to avoid rate limits
        await new Promise(resolve => setTimeout(resolve, 100))

      } catch (error) {
        console.error(`Error processing notifications for user ${user.id}:`, error)
        errors.push(`User ${user.id}: ${error.message}`)
      }
    }

    // Close email service connection
    await emailService.close()

    const result = {
      success: true,
      job_completed_at: new Date().toISOString(),
      summary: {
        total_users_checked: usersNeedingReminders.length,
        users_missing_today: usersMissingToday.length,
        users_needing_alert: usersNeedingAlert.length,
        users_notified: usersToNotify.length,
        emails_sent: emailsSent,
        whatsapps_sent: 0, // Disabled until hosting
        total_notifications: emailsSent // Only email notifications for now
      },
      errors: errors.length > 0 ? errors : undefined
    }

    console.log('✅ Daily reminders job completed:', result.summary)

    return createResponse(result)

  } catch (error) {
    return handleError(error, 'daily-reminders')
  }
})