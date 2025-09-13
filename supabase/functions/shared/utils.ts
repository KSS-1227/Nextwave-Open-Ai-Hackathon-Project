// Shared utilities for Supabase Edge Functions
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

export const supabaseUrl = Deno.env.get('SUPABASE_URL')!
export const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

// Create Supabase client with service role key for server-side operations
export const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

// Standard API response format
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
}

export function createResponse<T>(
  data: T | null, 
  error: string | null = null, 
  status: number = 200
): Response {
  const response: ApiResponse<T> = {
    success: !error,
    ...(data && { data }),
    ...(error && { error })
  }
  
  return new Response(JSON.stringify(response), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    }
  })
}

// Error handling utility
export function handleError(error: any, context: string): Response {
  console.error(`Error in ${context}:`, error)
  const message = error.message || error.toString() || 'Internal server error'
  return createResponse(null, message, 500)
}

// Validate user authentication
export async function validateUser(request: Request): Promise<{ userId: string } | Response> {
  const authHeader = request.headers.get('Authorization')
  if (!authHeader) {
    return createResponse(null, 'Authorization header required', 401)
  }

  const token = authHeader.replace('Bearer ', '')
  const { data: { user }, error } = await supabase.auth.getUser(token)

  if (error || !user) {
    return createResponse(null, 'Invalid or expired token', 401)
  }

  return { userId: user.id }
}

// Date utilities
export function formatDate(date: Date): string {
  return date.toISOString().split('T')[0]
}

export function isValidDate(dateString: string): boolean {
  const date = new Date(dateString)
  return date instanceof Date && !isNaN(date.getTime())
}

export function isFutureDate(dateString: string): boolean {
  const inputDate = new Date(dateString)
  const today = new Date()
  today.setHours(23, 59, 59, 999) // End of today
  return inputDate > today
}

// Validation utilities
export function validateNumber(value: any, fieldName: string, min: number = 0): number {
  const num = parseFloat(value)
  if (isNaN(num) || num < min) {
    throw new Error(`${fieldName} must be a valid number >= ${min}`)
  }
  return num
}

export function validateRequired(value: any, fieldName: string): void {
  if (value === undefined || value === null || value === '') {
    throw new Error(`${fieldName} is required`)
  }
}