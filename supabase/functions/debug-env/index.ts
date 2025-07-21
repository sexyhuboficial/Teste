import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Check all environment variables
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')
    const pushInPayApiKey = Deno.env.get('PUSHINPAY_API_KEY')
    
    console.log('Environment check:')
    console.log('SUPABASE_URL:', !!supabaseUrl)
    console.log('SUPABASE_ANON_KEY:', !!supabaseAnonKey)
    console.log('PUSHINPAY_API_KEY:', !!pushInPayApiKey)
    
    if (!pushInPayApiKey) {
      return new Response(JSON.stringify({ 
        error: 'PUSHINPAY_API_KEY not found',
        env_check: {
          supabase_url: !!supabaseUrl,
          supabase_anon_key: !!supabaseAnonKey,
          pushinpay_api_key: !!pushInPayApiKey
        }
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    return new Response(JSON.stringify({ 
      success: true,
      message: 'All environment variables are configured',
      env_check: {
        supabase_url: !!supabaseUrl,
        supabase_anon_key: !!supabaseAnonKey,
        pushinpay_api_key: !!pushInPayApiKey
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    console.error('Error in debug function:', error)
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      details: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})