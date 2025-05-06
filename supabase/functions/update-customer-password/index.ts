import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

console.log("Update Customer Password function booting up...");

interface UpdatePasswordPayload {
  newPassword: string;
  // Current password verification should ideally happen client-side first
  // by attempting a login with the current password before calling this function.
  // Alternatively, pass currentPassword here, but it's less secure.
}

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { newPassword }: UpdatePasswordPayload = await req.json();
    if (!newPassword || newPassword.length < 6) { // Add Supabase password length requirement check
      throw new Error("New password is required and must be at least 6 characters.");
    }

    // Create Supabase client using the user's JWT
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) throw new Error("Missing authorization header.");

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '', // Use anon key
      { global: { headers: { Authorization: authHeader } } } // Pass user's auth header
    );

    // Update the user's password in Supabase Auth
    const { data, error } = await supabase.auth.updateUser({
       password: newPassword
    });

    if (error) throw error;

    return new Response(JSON.stringify({ success: true, message: "Password updated successfully." }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error("Error in update-customer-password function:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400, // Use 401 for auth errors if distinguishable
    });
  }
});