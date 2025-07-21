import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('Test function called')
    
    // Get auth header
    const authHeader = req.headers.get('Authorization')
    console.log('Auth header present:', !!authHeader)
    
    if (!authHeader) {
      return new Response(JSON.stringify({ 
        error: 'No auth header',
        headers: Object.fromEntries(req.headers.entries())
      }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    )

    // Get user
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser()
    console.log('User data:', user ? { id: user.id, email: user.email } : 'null')
    console.log('User error:', userError)
    
    if (userError || !user) {
      return new Response(JSON.stringify({ 
        error: 'Auth failed',
        userError: userError,
        user: user
      }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Check environment variables
    const pushInPayApiKey = Deno.env.get('PUSHINPAY_API_KEY')
    
    return new Response(JSON.stringify({
      success: true,
      user: {
        id: user.id,
        email: user.email
      },
      environment: {
        supabase_url: !!Deno.env.get('SUPABASE_URL'),
        supabase_anon_key: !!Deno.env.get('SUPABASE_ANON_KEY'),
        pushinpay_api_key: !!pushInPayApiKey
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    console.error('Error in test function:', error)
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      details: error.message,
      stack: error.stack
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})