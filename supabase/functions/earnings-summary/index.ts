// GET /earnings/summary/:user_id - Get earnings summary and analytics
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { 
  validateUser, 
  createResponse, 
  handleError, 
  supabase
} from '../shared/utils.ts'

// Type definitions for better type safety
interface SummaryData {
  daily_earnings: Array<{
    date: string;
    income: number;
    inventory_cost: number;
    profit: number;
  }>;
  monthly_totals: Array<{
    month: string;
    month_name: string;
    year: number;
    month_number: number;
    total_income: number;
    total_inventory_cost: number;
    total_profit: number;
    days_recorded: number;
    avg_daily_income: number;
    avg_daily_profit: number;
    growth_percentage: number;
  }>;
  monthly_growth: number;
  missing_days: number;
  last_update: string | null;
}

interface WeeklyAverage {
  week: string;
  avg_income: number;
  avg_inventory_cost: number;
  avg_profit: number;
  days_recorded: number;
}

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return createResponse(null, null, 200)
  }

  if (req.method !== 'GET') {
    return createResponse(null, 'Method not allowed', 405)
  }

  try {
    // Validate user authentication
    const authResult = await validateUser(req)
    if (authResult instanceof Response) {
      return authResult
    }
    const { userId } = authResult

    // Extract user_id from URL path if provided, otherwise use authenticated user
    const url = new URL(req.url)
    const pathSegments = url.pathname.split('/')
    const targetUserId = pathSegments[pathSegments.length - 1] || userId

    // Only allow users to access their own data unless they have admin privileges
    if (targetUserId !== userId) {
      return createResponse(null, 'Access denied: You can only view your own earnings data', 403)
    }

    // Call the database function to get comprehensive summary (if it exists)
    // Otherwise, we'll build the summary manually
    let summaryData = null
    let summaryError = null
    let summary: SummaryData = {
      daily_earnings: [],
      monthly_totals: [],
      monthly_growth: 0,
      missing_days: 0,
      last_update: null
    } // Declare the summary variable with proper type
    
    try {
      const { data, error } = await supabase
        .rpc('get_earnings_summary', { target_user_id: targetUserId })
      summaryData = data
      summaryError = error
    } catch (err) {
      // Function might not exist, we'll build summary manually
      console.log('Database function not found, building summary manually')
    }

    if (summaryError && !summaryData) {
      // Get monthly summaries from stored data first
      const { data: monthlyData, error: monthlyError } = await supabase
        .from('monthly_summaries')
        .select('*')
        .eq('user_id', targetUserId)
        .order('year', { ascending: false })
        .order('month', { ascending: false })
        .limit(12) // Get last 12 months

      if (monthlyError) throw monthlyError

      // Build summary manually if database function doesn't exist
      const { data: last30Days, error: last30Error } = await supabase
        .from('earnings')
        .select('earning_date, amount, inventory_cost')  // Using your column names
        .eq('user_id', targetUserId)
        .gte('earning_date', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
        .order('earning_date', { ascending: false })

      if (last30Error) throw last30Error

      // Transform data to include calculated profit
      const dailyEarningsWithProfit = last30Days?.map(entry => ({
        date: entry.earning_date,
        income: entry.amount,  // Map amount to income for API consistency
        inventory_cost: entry.inventory_cost,
        profit: Number(entry.amount) - Number(entry.inventory_cost)
      })) || []

      // Transform monthly data to include month names
      const monthlyTotalsWithNames = monthlyData?.map(monthly => ({
        month: monthly.month_year_display, // Use full month name like "January 2025"
        month_name: monthly.month_name, // Month name only like "January"
        year: monthly.year,
        month_number: monthly.month,
        total_income: Number(monthly.total_income),
        total_inventory_cost: Number(monthly.total_inventory_cost),
        total_profit: Number(monthly.total_profit),
        days_recorded: monthly.days_recorded,
        avg_daily_income: Number(monthly.avg_daily_income),
        avg_daily_profit: Number(monthly.avg_daily_profit),
        growth_percentage: Number(monthly.growth_percentage)
      })) || []

      // Get current month growth from stored data
      const currentMonthGrowth = monthlyTotalsWithNames[0]?.growth_percentage || 0

      summary = {
        daily_earnings: dailyEarningsWithProfit,
        monthly_totals: monthlyTotalsWithNames,
        monthly_growth: currentMonthGrowth,
        missing_days: 0, // Calculate if needed
        last_update: last30Days?.[0]?.earning_date || null
      }
    } else {
      summary = summaryData?.[0] || {}
    }

    // Get additional metrics
    const today = new Date().toISOString().split('T')[0]
    
    // Check if today's entry exists
    const { data: todaysEntry, error: todayError } = await supabase
      .from('earnings')
      .select('*')
      .eq('user_id', targetUserId)
      .eq('earning_date', today)  // Using your column name
      .single()

    if (todayError && todayError.code !== 'PGRST116') {
      throw todayError
    }

    // Get streak information (consecutive days with entries)
    const { data: recentEntries, error: streakError } = await supabase
      .from('earnings')
      .select('earning_date')  // Using your column name
      .eq('user_id', targetUserId)
      .gte('earning_date', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
      .order('earning_date', { ascending: false })

    if (streakError) {
      throw streakError
    }

    // Calculate current streak
    let currentStreak = 0
    const sortedDates = recentEntries?.map(e => e.earning_date).sort((a, b) => b.localeCompare(a)) || []
    
    for (let i = 0; i < sortedDates.length; i++) {
      const expectedDate = new Date()
      expectedDate.setDate(expectedDate.getDate() - i)
      const expectedDateStr = expectedDate.toISOString().split('T')[0]
      
      if (sortedDates[i] === expectedDateStr) {
        currentStreak++
      } else {
        break
      }
    }

    // Get weekly averages for the last 4 weeks
    const { data: weeklyData, error: weeklyError } = await supabase
      .from('earnings')
      .select('earning_date, amount, inventory_cost')  // Using your column names
      .eq('user_id', targetUserId)
      .gte('earning_date', new Date(Date.now() - 28 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
      .order('earning_date', { ascending: false })

    if (weeklyError) {
      throw weeklyError
    }

    // Calculate weekly averages
    const weeklyAverages: WeeklyAverage[] = []
    for (let week = 0; week < 4; week++) {
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - (week + 1) * 7)
      const endDate = new Date()
      endDate.setDate(endDate.getDate() - week * 7)

      const weekData = weeklyData?.filter(entry => {
        const entryDate = new Date(entry.earning_date)  // Using your column name
        return entryDate >= startDate && entryDate < endDate
      }) || []

      if (weekData.length > 0) {
        const avgIncome = weekData.reduce((sum, entry) => sum + Number(entry.amount), 0) / weekData.length  // Using amount
        const avgCost = weekData.reduce((sum, entry) => sum + Number(entry.inventory_cost), 0) / weekData.length
        const avgProfit = weekData.reduce((sum, entry) => sum + (Number(entry.amount) - Number(entry.inventory_cost)), 0) / weekData.length

        weeklyAverages.push({
          week: `Week ${week + 1}`,
          avg_income: Math.round(avgIncome * 100) / 100,
          avg_inventory_cost: Math.round(avgCost * 100) / 100,
          avg_profit: Math.round(avgProfit * 100) / 100,
          days_recorded: weekData.length
        })
      }
    }

    // Determine alert status
    const daysSinceLastUpdate = summary.last_update 
      ? Math.floor((new Date().getTime() - new Date(summary.last_update).getTime()) / (1000 * 60 * 60 * 24))
      : null

    const alertStatus = {
      missing_today: !todaysEntry,
      days_since_update: daysSinceLastUpdate,
      needs_reminder: daysSinceLastUpdate !== null && daysSinceLastUpdate > 2,
      missing_days_this_month: summary.missing_days || 0
    }

    const response = {
      user_id: targetUserId,
      summary: {
        daily_earnings: summary.daily_earnings || [],
        monthly_totals: summary.monthly_totals || [],
        monthly_growth_percent: summary.monthly_growth || 0,
        current_streak_days: currentStreak,
        weekly_averages: weeklyAverages,
        last_update: summary.last_update,
        total_entries: recentEntries?.length || 0
      },
      alerts: alertStatus,
      today: {
        has_entry: !!todaysEntry,
        entry: todaysEntry || null
      },
      generated_at: new Date().toISOString()
    }

    return createResponse(response)

  } catch (error) {
    return handleError(error, 'earnings-summary')
  }
})