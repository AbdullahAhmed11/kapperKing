// Standard CORS headers for Supabase Edge Functions
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*', // Or specific origins for production
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}