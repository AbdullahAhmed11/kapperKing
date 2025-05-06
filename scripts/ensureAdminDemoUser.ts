import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current directory in ES module scope
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from .env file in the project root
dotenv.config({ path: path.resolve(__dirname, '../.env') });

async function ensureAdminDemoUser() {
  const email = 'admin@kapperking.com'; // Use the admin demo email
  const password = 'admin123'; // Use the admin demo password

  // Read Supabase URL and Key from process.env after loading .env
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Error: Missing Supabase environment variables (VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY) in .env file.');
    process.exit(1);
  }

  // Create a Supabase client instance specifically for this script
  const scriptSupabaseClient = createClient(supabaseUrl, supabaseAnonKey);

  console.log(`Checking for existing user: ${email}`);

  // Try to sign in first
  const { data: signInData, error: signInError } = await scriptSupabaseClient.auth.signInWithPassword({
    email: email,
    password: password,
  });

  if (signInData.user) {
    console.log(`User ${email} already exists and login successful.`);
    // User exists, no need to create.
    return; 
  }

  // Handle potential sign-in errors
  if (signInError) {
    if (signInError.message.includes('Invalid login credentials')) {
      console.warn(`User ${email} exists but password might be incorrect. Cannot proceed with creation.`);
      // Or potentially try updating the password if desired? For now, we stop.
      return;
    } else if (signInError.message.includes('Email not confirmed')) {
       console.warn(`User ${email} exists but email is not confirmed. Cannot proceed with creation.`);
       return;
    }
    // Add checks for other specific sign-in errors if needed
    
    // If error is NOT "Invalid login credentials" or "Email not confirmed", 
    // assume user might not exist and proceed to attempt sign up.
    // Note: A generic error might still hide the fact the user exists.
    console.log(`Sign in failed (Reason: ${signInError.message}). Attempting to create user ${email}...`);
  } else {
     // This case (no user, no error) shouldn't typically happen with signInWithPassword
     console.log(`Sign in attempt resulted in no user and no error. Attempting to create user ${email}...`);
  }


  // --- Attempt to Sign Up if Sign In didn't confirm existence ---
  console.log(`Attempting to create user: ${email}`);
  const { data: signUpData, error: signUpError } = await scriptSupabaseClient.auth.signUp({
    email: email,
    password: password,
    options: {
      // data: { full_name: 'Admin Demo' } // Optional metadata
    }
  });

  if (signUpError) {
    // Handle specific sign-up errors we already saw
    if (signUpError.message.includes('User already registered')) {
      console.warn(`User ${email} already exists (detected during sign up attempt).`);
    } else if (signUpError.message.includes('Database error finding user')) {
       console.error(`Error creating user ${email}: Database error finding user. Please check Supabase logs/config.`);
       process.exit(1);
    } else {
      console.error(`Error creating user ${email}:`, signUpError.message);
      process.exit(1); // Exit with error code
    }
  } else if (signUpData.user) {
    console.log(`Successfully created user: ${signUpData.user.email}`);
    console.log('User ID:', signUpData.user.id);
    // Add client record creation logic here if needed for admin user
  } else {
    console.log(`User ${email} created, but confirmation might be required (check Supabase settings).`);
  }
}

ensureAdminDemoUser();