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
    const { creatorId, amount, message = '' } = await req.json()
    console.log('Received payment request:', { creatorId, amount, message })

    // Validate required fields
    if (!creatorId || typeof creatorId !== 'string') {
      console.error('Missing or invalid creatorId in request')
      return new Response(JSON.stringify({ error: 'creatorId é obrigatório e deve ser uma string válida' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Validate amount (should be in reais, minimum R$ 1.00)
    if (!amount || typeof amount !== 'number' || amount < 1 || amount > 10000) {
      console.error('Invalid amount:', amount)
      return new Response(JSON.stringify({ error: 'Valor inválido. Mínimo: R$ 1,00, Máximo: R$ 10.000,00' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Get auth header
    const authHeader = req.headers.get('Authorization')
    console.log('Auth header present:', !!authHeader)
    
    if (!authHeader) {
      console.error('Missing Authorization header')
      return new Response(JSON.stringify({ error: 'Authorization header missing' }), {
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
    if (userError || !user) {
      console.error('User authentication failed:', userError)
      return new Response(JSON.stringify({ error: 'Usuário não autenticado' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    console.log('User authenticated:', user.id)

    // Get creator info
    const { data: creator, error: creatorError } = await supabaseClient
      .from('creators')
      .select('display_name, user_id')
      .eq('id', creatorId)
      .single()

    if (creatorError || !creator) {
      console.error('Creator not found:', creatorError)
      return new Response(JSON.stringify({ error: 'Criador não encontrado' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    console.log('Creator found:', creator.display_name)

    // Prevent self-payment
    if (creator.user_id === user.id) {
      console.error('User trying to send mimo to themselves')
      return new Response(JSON.stringify({ error: 'Você não pode enviar um mimo para si mesmo' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Get user profile
    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('full_name, display_name')
      .eq('user_id', user.id)
      .single()

    // Create mimo record (convert amount to cents for storage)
    const amountInCents = Math.round(amount * 100)
    console.log('Creating mimo record:', { client_id: user.id, creator_id: creatorId, amount: amountInCents, message })
    
    const { data: mimo, error: mimoError } = await supabaseClient
      .from('mimos')
      .insert({
        client_id: user.id,
        creator_id: creatorId,
        amount: amountInCents, // Amount in cents
        message: message.trim() || null,
        payment_status: 'pending'
      })
      .select()
      .single()

    if (mimoError) {
      console.error('Error creating mimo:', mimoError)
      return new Response(JSON.stringify({ error: 'Falha ao criar mimo: ' + (mimoError.message || 'Erro desconhecido') }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }
    
    console.log('Mimo created successfully:', mimo.id)

    // Check PushInPay API key
    const pushInPayApiKey = Deno.env.get('PUSHINPAY_API_KEY')
    console.log('PushInPay API key exists:', !!pushInPayApiKey)
    
    if (!pushInPayApiKey) {
      console.error('PushInPay API key not configured')
      
      // Update mimo status to failed
      await supabaseClient
        .from('mimos')
        .update({ payment_status: 'failed' })
        .eq('id', mimo.id)
      
      return new Response(JSON.stringify({ error: 'Gateway de pagamento não configurado. Verifique as variáveis de ambiente.' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const customerName = profile?.full_name || profile?.display_name || 'Cliente'
    const description = `Mimo para ${creator.display_name}${message ? `: ${message}` : ''}`

    // PushInPay API call
    const pushInPayPayload = {
      value: amount, // Amount in reais
      description: description,
      customer: {
        name: customerName,
        email: user.email || 'cliente@sexyhub.com'
      },
      external_id: mimo.id,
      redirect_url: `${req.headers.get('origin') || 'https://sexyhub.com'}/mimos/success`,
      webhook_url: `${Deno.env.get('SUPABASE_URL')}/functions/v1/pushinpay-webhook`
    }

    console.log('Making PushInPay request with payload:', JSON.stringify(pushInPayPayload, null, 2))

    let pushInPayResponse;
    try {
      pushInPayResponse = await fetch('https://app.pushinpay.com.br/api/pix', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${pushInPayApiKey}`
        },
        body: JSON.stringify(pushInPayPayload)
      })
    } catch (fetchError) {
      console.error('Network error calling PushInPay:', fetchError)
      
      // Update mimo status to failed
      await supabaseClient
        .from('mimos')
        .update({ payment_status: 'failed' })
        .eq('id', mimo.id)

      return new Response(JSON.stringify({ 
        error: 'Erro de conexão com o gateway de pagamento',
        details: 'Tente novamente em alguns instantes'
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    console.log('PushInPay response status:', pushInPayResponse.status)
    console.log('PushInPay response headers:', Object.fromEntries(pushInPayResponse.headers.entries()))
    
    let pushInPayData;
    let responseText = '';
    
    try {
      responseText = await pushInPayResponse.text();
      console.log('PushInPay raw response:', responseText);
      
      if (responseText.trim()) {
        pushInPayData = JSON.parse(responseText);
      } else {
        pushInPayData = { error: 'Empty response from PushInPay' };
      }
    } catch (parseError) {
      console.error('Error parsing PushInPay response as JSON:', parseError);
      pushInPayData = { 
        error: 'Invalid JSON response from payment gateway', 
        raw: responseText,
        parseError: parseError.message 
      };
    }
    
    console.log('PushInPay parsed data:', pushInPayData)

    if (!pushInPayResponse.ok) {
      console.error('PushInPay error response:', {
        status: pushInPayResponse.status,
        statusText: pushInPayResponse.statusText,
        data: pushInPayData
      })
      
      // Update mimo status to failed
      await supabaseClient
        .from('mimos')
        .update({ payment_status: 'failed' })
        .eq('id', mimo.id)

      // Return more specific error based on status code
      let errorMessage = 'Falha na criação do pagamento';
      if (pushInPayResponse.status === 401) {
        errorMessage = 'Chave de API inválida ou expirada';
      } else if (pushInPayResponse.status === 400) {
        errorMessage = 'Dados de pagamento inválidos';
      } else if (pushInPayResponse.status >= 500) {
        errorMessage = 'Erro temporário no gateway de pagamento';
      }

      return new Response(JSON.stringify({ 
        error: errorMessage,
        details: typeof pushInPayData === 'object' ? pushInPayData : { message: pushInPayData },
        status_code: pushInPayResponse.status
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Validate PushInPay response structure
    if (!pushInPayData || typeof pushInPayData !== 'object') {
      console.error('Invalid PushInPay response structure:', pushInPayData)
      
      await supabaseClient
        .from('mimos')
        .update({ payment_status: 'failed' })
        .eq('id', mimo.id)

      return new Response(JSON.stringify({ 
        error: 'Resposta inválida do gateway de pagamento',
        details: 'Estrutura de dados inesperada'
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Update mimo with payment info
    const updateData: any = {
      payment_status: 'processing'
    }

    if (pushInPayData.id) {
      updateData.payment_id = pushInPayData.id
    }
    if (pushInPayData.payment_url) {
      updateData.payment_url = pushInPayData.payment_url
    }

    await supabaseClient
      .from('mimos')
      .update(updateData)
      .eq('id', mimo.id)

    console.log('Payment created successfully')

    return new Response(JSON.stringify({
      success: true,
      mimo_id: mimo.id,
      payment_url: pushInPayData.payment_url || null,
      pix_code: pushInPayData.pix_code || null
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    console.error('Error in create-mimo-payment:', error)
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

