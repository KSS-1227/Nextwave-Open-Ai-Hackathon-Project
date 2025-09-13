// POST /earnings/add - Add daily earnings entry
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { 
  validateUser, 
  createResponse, 
  handleError, 
  supabase,
  validateNumber,
  validateRequired,
  isValidDate,
  isFutureDate
} from '../shared/utils.ts'

interface AddEarningsRequest {
  amount: number  // Changed from 'income' to match your DB
  inventory_cost: number
  earning_date: string  // Changed from 'date' to match your DB
}

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return createResponse(null, null, 200)
  }

  if (req.method !== 'POST') {
    return createResponse(null, 'Method not allowed', 405)
  }

  try {
    // Validate user authentication
    const authResult = await validateUser(req)
    if (authResult instanceof Response) {
      return authResult
    }
    const { userId } = authResult

    // Parse request body
    const body = await req.json() as AddEarningsRequest
    
    // Validate required fields
    validateRequired(body.amount, 'amount')
    validateRequired(body.inventory_cost, 'inventory_cost')
    validateRequired(body.earning_date, 'earning_date')

    // Validate data types and constraints
    const amount = validateNumber(body.amount, 'amount', 0)
    const inventory_cost = validateNumber(body.inventory_cost, 'inventory_cost', 0)
    
    if (!isValidDate(body.earning_date)) {
      return createResponse(null, 'Invalid date format. Use YYYY-MM-DD', 400)
    }

    if (isFutureDate(body.earning_date)) {
      return createResponse(null, 'Cannot add earnings for future dates', 400)
    }

    // Check if record already exists for this date
    const { data: existingRecord, error: checkError } = await supabase
      .from('earnings')
      .select('id')
      .eq('user_id', userId)
      .eq('earning_date', body.earning_date)  // Changed from 'date' to 'earning_date'
      .single()

    if (checkError && checkError.code !== 'PGRST116') { // PGRST116 = no rows found
      throw checkError
    }

    if (existingRecord) {
      return createResponse(null, 'Record already exists for this date', 409)
    }

    // Insert new earnings record (works with existing table structure)
    const { data: newRecord, error: insertError } = await supabase
      .from('earnings')
      .insert({
        user_id: userId,
        earning_date: body.earning_date,  // Using your column name
        amount,  // Using your column name
        inventory_cost
      })
      .select('*')
      .single()

    if (insertError) {
      throw insertError
    }

    // Calculate profit (this should be auto-calculated by the database)
    const profit = amount - inventory_cost

    return createResponse({
      id: newRecord.id,
      user_id: newRecord.user_id,
      earning_date: newRecord.earning_date,  // Using your column name
      amount: newRecord.amount,  // Using your column name
      inventory_cost: newRecord.inventory_cost,
      profit,
      created_at: newRecord.created_at,
      message: 'Earnings record added successfully'
    }, null, 201)

  } catch (error) {
    return handleError(error, 'earnings-add')
  }
})