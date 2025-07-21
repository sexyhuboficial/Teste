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
    const { serviceId } = await req.json()
    console.log('Received service payment request for service:', serviceId)

    // Validate serviceId
    if (!serviceId || typeof serviceId !== 'string') {
      console.error('Missing or invalid serviceId in request')
      return new Response(JSON.stringify({ error: 'serviceId é obrigatório e deve ser uma string válida' }), {
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

    // Get service info
    console.log('Looking for service with ID:', serviceId)
    
    const { data: service, error: serviceError } = await supabaseClient
      .from('creator_services')
      .select(`
        *,
        creators (
          id,
          display_name,
          user_id
        )
      `)
      .eq('id', serviceId)
      .single()

    if (serviceError || !service) {
      console.error('Service not found:', serviceError)
      return new Response(JSON.stringify({ error: 'Serviço não encontrado' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }
    
    console.log('Service found:', service.title, 'by', service.creators.display_name)

    // Validate service price
    if (!service.price || service.price <= 0) {
      console.error('Invalid service price:', service.price)
      return new Response(JSON.stringify({ error: 'Preço do serviço inválido' }), {
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

    // Create service payment record
    console.log('Creating payment record:', { 
      client_id: user.id, 
      creator_id: service.creator_id, 
      service_id: serviceId, 
      amount: service.price,
      service_type: service.service_type
    })
    
    const { data: payment, error: paymentError } = await supabaseClient
      .from('service_payments')
      .insert({
        client_id: user.id,
        creator_id: service.creator_id,
        service_id: serviceId,
        amount: service.price,
        service_type: service.service_type,
        payment_status: 'pending',
        expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString() // 30 minutes
      })
      .select()
      .single()

    if (paymentError) {
      console.error('Error creating service payment:', paymentError)
      return new Response(JSON.stringify({ error: 'Falha ao criar pagamento: ' + (paymentError.message || 'Erro desconhecido') }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }
    
    console.log('Payment record created:', payment.id)

    // Check PushInPay API key
    const pushInPayApiKey = Deno.env.get('PUSHINPAY_API_KEY')
    console.log('PushInPay API key exists:', !!pushInPayApiKey)
    
    if (!pushInPayApiKey) {
      console.error('PushInPay API key not configured')
      // Update payment status to failed
      await supabaseClient
        .from('service_payments')
        .update({ payment_status: 'failed' })
        .eq('id', payment.id)
      
      return new Response(JSON.stringify({ error: 'Gateway de pagamento não configurado. Verifique as variáveis de ambiente.' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const customerName = profile?.full_name || profile?.display_name || 'Cliente'
    const description = `${service.title} - ${service.creators.display_name}`

    // Convert price from cents to reais consistently
    const priceInReais = service.price / 100

    // PushInPay API call
    const pushInPayPayload = {
      value: priceInReais,
      description: description,
      customer: {
        name: customerName,
        email: user.email || 'cliente@sexyhub.com'
      },
      external_id: payment.id,
      redirect_url: `${req.headers.get('origin') || 'https://sexyhub.com'}/chat?service_payment=${payment.id}`,
      webhook_url: `${Deno.env.get('SUPABASE_URL')}/functions/v1/pushinpay-webhook`
    }

    console.log('Making PushInPay request with payload:', JSON.stringify(pushInPayPayload, null, 2))

    let pushInPayResponse;
    try {
      pushInPayResponse = await fetch("https://api.pushinpay.com.br/api/pix/cashIn", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${pushInPayApiKey}`
        },
        body: JSON.stringify(pushInPayPayload)
      })
    } catch (fetchError) {
      console.error('Network error calling PushInPay:', fetchError)
      
      // Update payment status to failed
      await supabaseClient
        .from('service_payments')
        .update({ payment_status: 'failed' })
        .eq('id', payment.id)

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
      console.log("PushInPay raw response:", responseText);
      if (responseText.trim()) {
        try {
          pushInPayData = JSON.parse(responseText);
        } catch (jsonParseError) {
          console.error("Error parsing PushInPay response as JSON:", jsonParseError);
          pushInPayData = { 
            error: "Invalid JSON response from payment gateway",
            raw: responseText,
            parseError: jsonParseError.message
          };
        }
      } else {
        pushInPayData = { error: "Empty response from PushinPay" };
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
      
      // Update payment status to failed
      await supabaseClient
        .from('service_payments')
        .update({ payment_status: 'failed' })
        .eq('id', payment.id)

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
        .from('service_payments')
        .update({ payment_status: 'failed' })
        .eq('id', payment.id)

      return new Response(JSON.stringify({ 
        error: 'Resposta inválida do gateway de pagamento',
        details: 'Estrutura de dados inesperada'
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    console.log('PushInPay response success')

    // Update payment with PushInPay info
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
      .from('service_payments')
      .update(updateData)
      .eq('id', payment.id)

    console.log('Payment created successfully')

    return new Response(JSON.stringify({
      success: true,
      payment_id: payment.id,
      payment_url: pushInPayData.payment_url || null,
      pix_code: pushInPayData.pix_code || null,
      service: {
        title: service.title,
        creator: service.creators.display_name,
        type: service.service_type
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    console.error('Error in create-service-payment:', error)
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

