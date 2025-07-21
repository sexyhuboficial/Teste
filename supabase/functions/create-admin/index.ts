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
    console.log('Iniciando criação do usuário admin...')
    
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    console.log('Cliente Supabase criado')

    // Primeiro, verificar se o usuário já existe
    const { data: existingUsers, error: listError } = await supabaseAdmin.auth.admin.listUsers()
    
    if (listError) {
      console.error('Erro ao listar usuários:', listError)
      throw listError
    }

    const existingUser = existingUsers.users.find(u => u.email === 'danielm2021d@gmail.com')
    let userId = existingUser?.id

    if (!existingUser) {
      console.log('Usuário não existe, criando...')
      // Criar o usuário admin no auth
      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email: 'danielm2021d@gmail.com',
        password: '28051982D',
        email_confirm: true,
        user_metadata: {
          full_name: 'Administrador',
          role: 'admin'
        }
      })

      if (authError) {
        console.error('Erro ao criar usuário:', authError)
        throw authError
      }

      userId = authData?.user?.id
      console.log('Usuário criado com ID:', userId)
    } else {
      console.log('Usuário já existe com ID:', userId)
    }

    if (!userId) {
      throw new Error('Não foi possível obter o ID do usuário')
    }

    // Criar ou atualizar o perfil como admin
    console.log('Criando/atualizando perfil admin...')
    const { data: profileData, error: profileError } = await supabaseAdmin
      .from('profiles')
      .upsert({
        user_id: userId,
        email: 'danielm2021d@gmail.com',
        full_name: 'Administrador',
        role: 'admin'
      }, {
        onConflict: 'user_id'
      })

    if (profileError) {
      console.error('Erro ao criar perfil:', profileError)
      throw profileError
    }

    console.log('Perfil criado/atualizado:', profileData)

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Usuário admin criado/atualizado com sucesso',
        userId: userId,
        userExists: !!existingUser
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )

  } catch (error) {
    console.error('Erro na função create-admin:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message,
        details: error
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})