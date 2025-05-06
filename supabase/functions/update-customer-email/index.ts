import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

console.log("Update Customer Email function booting up...");

interface UpdateEmailPayload {
  newEmail: string;
  // Password verification might be better handled client-side before calling this,
  // or passed here, but passing passwords to functions has security implications.
  // Supabase updateUser itself doesn't require current password for email change if JWT is valid.
}

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { newEmail }: UpdateEmailPayload = await req.json();
    if (!newEmail) throw new Error("New email is required.");

    // Create Supabase client using the user's JWT
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) throw new Error("Missing authorization header.");

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '', // Use anon key
      { global: { headers: { Authorization: authHeader } } } // Pass user's auth header
    );

    // Update the user's email in Supabase Auth
    // This will typically trigger a confirmation email to the new address.
    const { data, error } = await supabase.auth.updateUser({
       email: newEmail
       // You might need to configure email change confirmation in Supabase settings
       // options: { emailRedirectTo: 'your-site-url/profile' } 
    });

    if (error) throw error;

    // Optional: Update email in your public 'clients' table if needed,
    // but usually rely on the auth user email as the source of truth.
    // const userId = data.user?.id;
    // if (userId) {
    //    const supabaseAdmin = createClient( ... service_role_key ... );
    //    await supabaseAdmin.from('clients').update({ email: newEmail }).eq('user_id', userId);
    // }

    return new Response(JSON.stringify({ success: true, message: "Email update initiated. Please check your new email address for confirmation." }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error("Error in update-customer-email function:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400, // Use 401 for auth errors if distinguishable
    });
  }
});