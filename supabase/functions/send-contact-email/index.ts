import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

console.log("Send Contact Email function booting up...");

interface ContactPayload {
  salonId: string; // To know where to send the email
  name: string;
  email: string; // Sender's email
  subject: string;
  message: string;
}

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { salonId, name, email, subject, message }: ContactPayload = await req.json();

    if (!salonId || !name || !email || !subject || !message) {
      throw new Error("Missing required fields for contact form.");
    }

    // Create Supabase client with service role key to fetch salon email
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Fetch the salon's email address
    const { data: salonData, error: salonError } = await supabaseAdmin
      .from('salons')
      .select('email')
      .eq('id', salonId)
      .single();

    if (salonError || !salonData?.email) {
      throw new Error(`Could not find recipient email for salon ID ${salonId}: ${salonError?.message}`);
    }

    const recipientEmail = salonData.email;

    // --- Email Sending Logic ---
    // Option 1: Use Supabase's built-in email (limited, requires setup)
    // This is generally NOT recommended for production contact forms due to limitations.
    /*
    const { data, error: emailError } = await supabaseAdmin.auth.admin.inviteUserByEmail(
      recipientEmail, // This is a workaround, inviteUser sends an email
      { data: { 
          sender_name: name, 
          sender_email: email, 
          email_subject: `Contact Form: ${subject}`, 
          email_message: message 
        }, 
        redirectTo: 'some-url' // Required but irrelevant here
      }
    )
    if (emailError) throw emailError;
    */

    // Option 2: Use an external email provider (e.g., Resend, SendGrid) via fetch API
    // Replace with your chosen provider's API details
    console.log(`Simulating email send to ${recipientEmail}`);
    console.log(`From: ${name} <${email}>`);
    console.log(`Subject: ${subject}`);
    console.log(`Message: ${message}`);
    // Example using fetch (replace with actual API call)
    /*
    const apiKey = Deno.env.get('YOUR_EMAIL_PROVIDER_API_KEY');
    const response = await fetch('EMAIL_PROVIDER_API_ENDPOINT', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: `"${name}" <noreply@yourdomain.com>`, // Use a verified sender
        to: [recipientEmail],
        reply_to: email,
        subject: `Contact Form: ${subject}`,
        text: message,
        // html: `<p>${message}</p>` // Optional HTML version
      }),
    });
    if (!response.ok) {
       throw new Error(`Failed to send email: ${response.statusText}`);
    }
    */
   
    // For now, just simulate success
    const emailSent = true; 
    if (!emailSent) {
       throw new Error("Email sending failed (simulation).");
    }


    return new Response(JSON.stringify({ success: true, message: "Message sent successfully." }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error("Error in send-contact-email function:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});