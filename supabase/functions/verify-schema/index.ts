// Verify database schema and required tables
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { 
  validateUser, 
  createResponse, 
  handleError, 
  supabase
} from '../shared/utils.ts'

serve(async (req: Request) => {
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

    const verificationResults = {
      tables_verified: [],
      functions_verified: [],
      missing_components: [],
      errors: []
    }

    // Test 1: Verify monthly_summaries table exists
    try {
      const { data, error } = await supabase
        .from('monthly_summaries')
        .select('id')
        .limit(1)

      if (error) {
        verificationResults.missing_components.push('monthly_summaries table')
        verificationResults.errors.push(`monthly_summaries: ${error.message}`)
      } else {
        verificationResults.tables_verified.push('monthly_summaries')
      }
    } catch (err) {
      verificationResults.missing_components.push('monthly_summaries table')
      verificationResults.errors.push(`monthly_summaries: ${err.message}`)
    }

    // Test 2: Verify earnings table exists
    try {
      const { data, error } = await supabase
        .from('earnings')
        .select('id')
        .limit(1)

      if (error) {
        verificationResults.missing_components.push('earnings table')
        verificationResults.errors.push(`earnings: ${error.message}`)
      } else {
        verificationResults.tables_verified.push('earnings')
      }
    } catch (err) {
      verificationResults.missing_components.push('earnings table')
      verificationResults.errors.push(`earnings: ${err.message}`)
    }

    // Test 3: Verify profiles table exists
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id')
        .limit(1)

      if (error) {
        verificationResults.missing_components.push('profiles table')
        verificationResults.errors.push(`profiles: ${error.message}`)
      } else {
        verificationResults.tables_verified.push('profiles')
      }
    } catch (err) {
      verificationResults.missing_components.push('profiles table')
      verificationResults.errors.push(`profiles: ${err.message}`)
    }

    // Test 4: Verify get_month_name function exists
    try {
      const { data, error } = await supabase
        .rpc('get_month_name', { month_num: 1 })

      if (error) {
        verificationResults.missing_components.push('get_month_name function')
        verificationResults.errors.push(`get_month_name: ${error.message}`)
      } else if (data === 'January') {
        verificationResults.functions_verified.push('get_month_name')
      }
    } catch (err) {
      verificationResults.missing_components.push('get_month_name function')
      verificationResults.errors.push(`get_month_name: ${err.message}`)
    }

    const response = {
      schema_status: verificationResults.missing_components.length === 0 ? 'COMPLETE' : 'INCOMPLETE',
      verification_results: verificationResults,
      deployment_required: verificationResults.missing_components.length > 0,
      deployment_instructions: verificationResults.missing_components.length > 0 
        ? 'Please run the SQL migrations in your Supabase dashboard'
        : 'All schema components are properly deployed',
      generated_at: new Date().toISOString()
    }

    return createResponse(response)

  } catch (error) {
    return handleError(error, 'schema-verification')
  }
})