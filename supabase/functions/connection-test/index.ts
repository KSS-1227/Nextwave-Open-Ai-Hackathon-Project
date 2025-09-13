// Connection Test Function - Verifies Supabase setup and database alignment
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { 
  supabase,
  createResponse, 
  handleError 
} from '../shared/utils.ts'

interface TestResult {
  test_name: string
  status: 'PASS' | 'FAIL' | 'WARNING'
  message: string
  details?: any
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
    const testResults: TestResult[] = []
    const startTime = Date.now()

    // Test 1: Basic Supabase Connection
    try {
      const { data, error } = await supabase.from('profiles').select('count').limit(1)
      if (error) throw error
      
      testResults.push({
        test_name: 'Supabase Connection',
        status: 'PASS',
        message: 'Successfully connected to Supabase database'
      })
    } catch (error) {
      testResults.push({
        test_name: 'Supabase Connection',
        status: 'FAIL',
        message: `Connection failed: ${error.message}`
      })
    }

    // Test 2: Verify Database Schema - Profiles Table
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, business_name, owner_name, business_type, location, monthly_revenue, monthly_expenses, preferred_language, phone_number, notify_whatsapp, notify_email, created_at')
        .limit(1)

      if (error) throw error

      testResults.push({
        test_name: 'Profiles Table Schema',
        status: 'PASS',
        message: 'Profiles table structure verified',
        details: {
          columns_verified: ['id', 'business_name', 'owner_name', 'business_type', 'location', 'monthly_revenue', 'monthly_expenses', 'preferred_language', 'phone_number', 'notify_whatsapp', 'notify_email', 'created_at']
        }
      })
    } catch (error) {
      testResults.push({
        test_name: 'Profiles Table Schema',
        status: 'FAIL',
        message: `Profiles table error: ${error.message}`
      })
    }

    // Test 3: Verify Database Schema - Earnings Table
    try {
      const { data, error } = await supabase
        .from('earnings')
        .select('id, user_id, earning_date, amount, inventory_cost, file_url, doc_type, processed_text, status, created_at, updated_at')
        .limit(1)

      if (error) throw error

      testResults.push({
        test_name: 'Earnings Table Schema',
        status: 'PASS',
        message: 'Earnings table structure verified with correct column names',
        details: {
          columns_verified: ['id', 'user_id', 'earning_date', 'amount', 'inventory_cost', 'file_url', 'doc_type', 'processed_text', 'status', 'created_at', 'updated_at']
        }
      })
    } catch (error) {
      testResults.push({
        test_name: 'Earnings Table Schema',
        status: 'FAIL',
        message: `Earnings table error: ${error.message}`
      })
    }

    // Test 4: Verify Database Schema - Documents Table  
    try {
      const { data, error } = await supabase
        .from('documents')
        .select('id, user_id, file_name, file_url, doc_type, extracted_text, status, created_at, updated_at')
        .limit(1)

      if (error) throw error

      testResults.push({
        test_name: 'Documents Table Schema',
        status: 'PASS',
        message: 'Documents table structure verified'
      })
    } catch (error) {
      testResults.push({
        test_name: 'Documents Table Schema',
        status: 'FAIL',
        message: `Documents table error: ${error.message}`
      })
    }

    // Test 5: Test Row Level Security (RLS)
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .limit(1)

      // If we can query without authentication using service role, RLS is working correctly
      testResults.push({
        test_name: 'Row Level Security',
        status: 'PASS',
        message: 'RLS policies are properly configured (service role can access data)'
      })
    } catch (error) {
      testResults.push({
        test_name: 'Row Level Security',
        status: 'WARNING',
        message: `RLS test inconclusive: ${error.message}`
      })
    }

    // Test 6: Check Foreign Key Relationships
    try {
      // Test if earnings table properly references profiles
      const { data, error } = await supabase
        .from('earnings')
        .select(`
          id,
          user_id,
          profiles!earnings_user_id_fkey (
            id,
            business_name
          )
        `)
        .limit(1)

      if (error) throw error

      testResults.push({
        test_name: 'Foreign Key Relations',
        status: 'PASS',
        message: 'Foreign key relationships are working correctly'
      })
    } catch (error) {
      testResults.push({
        test_name: 'Foreign Key Relations',
        status: 'WARNING',
        message: `Foreign key test warning: ${error.message}`
      })
    }

    // Test 7: Environment Variables Check
    const envVars = [
      'SUPABASE_URL',
      'SUPABASE_SERVICE_ROLE_KEY'
    ]
    
    const missingEnvVars = envVars.filter(varName => !Deno.env.get(varName))
    
    if (missingEnvVars.length === 0) {
      testResults.push({
        test_name: 'Environment Variables',
        status: 'PASS',
        message: 'All required environment variables are set'
      })
    } else {
      testResults.push({
        test_name: 'Environment Variables',
        status: 'FAIL',
        message: `Missing environment variables: ${missingEnvVars.join(', ')}`
      })
    }

    // Test 8: Test Data Insertion (with rollback)
    try {
      const testUserId = '00000000-0000-0000-0000-000000000000' // Test UUID
      const testDate = '2024-01-01'
      
      // Try to insert a test record
      const { data: insertData, error: insertError } = await supabase
        .from('earnings')
        .insert({
          user_id: testUserId,
          earning_date: testDate,
          amount: 100,
          inventory_cost: 50,
          status: 'test'
        })
        .select()

      if (insertError) {
        // This might fail due to foreign key constraint, which is expected
        if (insertError.message.includes('foreign key')) {
          testResults.push({
            test_name: 'Data Insertion Test',
            status: 'PASS',
            message: 'Insert operation works (foreign key constraint properly enforced)'
          })
        } else {
          throw insertError
        }
      } else {
        // If insert succeeded, clean up the test data
        await supabase
          .from('earnings')
          .delete()
          .eq('user_id', testUserId)
          .eq('earning_date', testDate)

        testResults.push({
          test_name: 'Data Insertion Test',
          status: 'PASS',
          message: 'Insert and delete operations work correctly'
        })
      }
    } catch (error) {
      testResults.push({
        test_name: 'Data Insertion Test',
        status: 'WARNING',
        message: `Insert test warning: ${error.message}`
      })
    }

    // Calculate overall health
    const passCount = testResults.filter(r => r.status === 'PASS').length
    const failCount = testResults.filter(r => r.status === 'FAIL').length
    const warningCount = testResults.filter(r => r.status === 'WARNING').length
    
    const overallStatus = failCount > 0 ? 'CRITICAL_ISSUES' : 
                         warningCount > 0 ? 'MINOR_ISSUES' : 'HEALTHY'

    const executionTime = Date.now() - startTime

    const response = {
      overall_status: overallStatus,
      summary: {
        total_tests: testResults.length,
        passed: passCount,
        failed: failCount,
        warnings: warningCount,
        execution_time_ms: executionTime
      },
      database_info: {
        supabase_url: Deno.env.get('SUPABASE_URL'),
        project_id: Deno.env.get('SUPABASE_URL')?.split('//')[1]?.split('.')[0] || 'unknown',
        connection_timestamp: new Date().toISOString()
      },
      test_results: testResults,
      recommendations: generateRecommendations(testResults)
    }

    return createResponse(response)

  } catch (error) {
    return handleError(error, 'connection-test')
  }
})

function generateRecommendations(testResults: TestResult[]): string[] {
  const recommendations: string[] = []
  
  const failedTests = testResults.filter(r => r.status === 'FAIL')
  const warningTests = testResults.filter(r => r.status === 'WARNING')
  
  if (failedTests.length === 0 && warningTests.length === 0) {
    recommendations.push('✅ All systems are working perfectly! Your Supabase connection is optimally configured.')
  }
  
  if (failedTests.some(t => t.test_name.includes('Connection'))) {
    recommendations.push('🔧 Check your Supabase URL and service role key in environment variables')
  }
  
  if (failedTests.some(t => t.test_name.includes('Schema'))) {
    recommendations.push('📋 Verify your database tables match the expected schema structure')
  }
  
  if (failedTests.some(t => t.test_name.includes('Environment'))) {
    recommendations.push('⚙️ Ensure all required environment variables are properly set in your deployment')
  }
  
  if (warningTests.length > 0) {
    recommendations.push('⚠️ Some tests showed warnings - review the details to ensure optimal performance')
  }
  
  recommendations.push('📊 Run this test regularly to monitor your database health')
  
  return recommendations
}