import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CheckoutRequest {
  service_id: string;
  creator_id: string;
  amount: number;
  currency?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    // Get authenticated user
    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;

    if (!user) {
      throw new Error("User not authenticated");
    }

    const { service_id, creator_id, amount, currency = "BRL" }: CheckoutRequest = await req.json();

    // Create order in database
    const { data: order, error: orderError } = await supabaseClient
      .from('orders')
      .insert({
        user_id: user.id,
        creator_id,
        service_id,
        amount: Math.round(amount * 100), // Convert to cents
        currency,
        order_type: 'service',
        payment_gateway: 'pushinpay',
        payment_status: 'pending'
      })
      .select()
      .single();

    if (orderError) throw orderError;

    // PushinPay integration - Mock implementation
    // In a real implementation, you would integrate with PushinPay API here
    const pushinPayResponse = {
      payment_url: `https://app.pushinpay.com.br/checkout/${order.id}`,
      reference_id: order.id,
      status: 'pending'
    };

    // Update order with payment reference
    await supabaseClient
      .from('orders')
      .update({ payment_reference: pushinPayResponse.reference_id })
      .eq('id', order.id);

    return new Response(
      JSON.stringify({
        success: true,
        payment_url: pushinPayResponse.payment_url,
        order_id: order.id
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );

  } catch (error) {
    console.error("Error creating checkout:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});