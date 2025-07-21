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
    console.log('PushInPay webhook received')
    
    const webhookData = await req.json()
    console.log('Webhook data:', JSON.stringify(webhookData, null, 2))

    // Create Supabase client with service role key for full access
    const supabaseService = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Extract payment info from webhook
    const { id: paymentId, external_id, status, value } = webhookData
    
    if (!external_id) {
      console.error('Missing external_id in webhook data')
      return new Response('Missing external_id', { status: 400 })
    }

    console.log('Processing payment update:', { paymentId, external_id, status, value })

    // Try to update mimos table first
    const { data: mimoData, error: mimoError } = await supabaseService
      .from('mimos')
      .select('id, client_id, creator_id, amount')
      .eq('id', external_id)
      .maybeSingle()

    if (mimoData && !mimoError) {
      console.log('Found mimo record, updating status')
      
      const updateData: any = {
        payment_id: paymentId,
        payment_status: status === 'approved' || status === 'paid' ? 'completed' : 
                       status === 'pending' ? 'processing' : 
                       status === 'cancelled' ? 'cancelled' : 'failed'
      }

      if (status === 'approved' || status === 'paid') {
        updateData.completed_at = new Date().toISOString()
      }

      const { error: updateError } = await supabaseService
        .from('mimos')
        .update(updateData)
        .eq('id', external_id)

      if (updateError) {
        console.error('Error updating mimo:', updateError)
        return new Response('Error updating mimo', { status: 500 })
      }

      console.log('Mimo updated successfully')

      // If completed, send notification to creator
      if (status === 'approved' || status === 'paid') {
        const { data: creator } = await supabaseService
          .from('creators')
          .select('user_id')
          .eq('id', mimoData.creator_id)
          .single()

        if (creator) {
          await supabaseService
            .from('notifications')
            .insert({
              user_id: creator.user_id,
              title: 'Novo Mimo Recebido!',
              message: `Você recebeu um mimo de R$ ${(mimoData.amount / 100).toFixed(2)}`,
              type: 'mimo'
            })
        }
      }
    } else {
      // Try to update service_payments table
      const { data: serviceData, error: serviceError } = await supabaseService
        .from('service_payments')
        .select('id, client_id, creator_id, amount, service_id')
        .eq('id', external_id)
        .maybeSingle()

      if (serviceData && !serviceError) {
        console.log('Found service payment record, updating status')
        
        const updateData: any = {
          payment_id: paymentId,
          payment_status: status === 'approved' || status === 'paid' ? 'completed' : 
                         status === 'pending' ? 'processing' : 
                         status === 'cancelled' ? 'cancelled' : 'failed'
        }

        const { error: updateError } = await supabaseService
          .from('service_payments')
          .update(updateData)
          .eq('id', external_id)

        if (updateError) {
          console.error('Error updating service payment:', updateError)
          return new Response('Error updating service payment', { status: 500 })
        }

        console.log('Service payment updated successfully')

        // If completed, create conversation and send notification
        if (status === 'approved' || status === 'paid') {
          // Get service info
          const { data: service } = await supabaseService
            .from('creator_services')
            .select('title, service_type')
            .eq('id', serviceData.service_id)
            .single()

          // Get creator info
          const { data: creator } = await supabaseService
            .from('creators')
            .select('user_id')
            .eq('id', serviceData.creator_id)
            .single()

          // Create or find conversation
          const { data: existingConv } = await supabaseService
            .from('conversations')
            .select('id')
            .eq('client_id', serviceData.client_id)
            .eq('creator_id', serviceData.creator_id)
            .maybeSingle()

          let conversationId = existingConv?.id

          if (!conversationId) {
            const { data: newConv } = await supabaseService
              .from('conversations')
              .insert({
                client_id: serviceData.client_id,
                creator_id: serviceData.creator_id,
                last_message: 'Serviço pago - conversa iniciada',
                last_message_at: new Date().toISOString()
              })
              .select('id')
              .single()

            conversationId = newConv?.id
          }

          if (conversationId && service) {
            // Add conversation tag for paid service
            await supabaseService
              .from('conversation_tags')
              .insert({
                conversation_id: conversationId,
                tag_type: 'paid_service',
                tag_value: service.service_type,
                service_payment_id: serviceData.id
              })
          }

          // Notify creator
          if (creator && service) {
            await supabaseService
              .from('notifications')
              .insert({
                user_id: creator.user_id,
                title: 'Novo Serviço Pago!',
                message: `Cliente pagou por: ${service.title}`,
                type: 'service_payment'
              })
          }
        }
      } else {
        console.error('No matching payment record found for external_id:', external_id)
        return new Response('Payment record not found', { status: 404 })
      }
    }

    // Send success response to PushInPay
    return new Response(JSON.stringify({ status: 'success' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    })

  } catch (error) {
    console.error('Webhook error:', error)
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      details: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})