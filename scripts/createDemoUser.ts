import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url'; // Import necessary function

// Get current directory in ES module scope
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from .env file in the project root
dotenv.config({ path: path.resolve(__dirname, '../.env') });

async function createDemoUser() {
  const email = 'demo@kapperking.test';
  const password = 'password123'; // Use a strong password in a real scenario

  // Read Supabase URL and Key from process.env after loading .env
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Error: Missing Supabase environment variables (VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY) in .env file.');
    process.exit(1);
  }

  // Create a Supabase client instance specifically for this script
  const scriptSupabaseClient = createClient(supabaseUrl, supabaseAnonKey);

  console.log(`Attempting to create user: ${email}`);

  const { data, error } = await scriptSupabaseClient.auth.signUp({
    email: email,
    password: password,
    options: {
      // You might want to add user metadata here if needed
      // data: { full_name: 'Demo Customer' }
    }
  });

  if (error) {
    if (error.message.includes('User already registered')) {
      console.warn(`User ${email} already exists.`);
      // Optionally, you could try to fetch the user or update their password here if needed
    } else {
      console.error('Error creating user:', error.message);
      process.exit(1); // Exit with error code
    }
  } else if (data.user) {
    console.log(`Successfully created user: ${data.user.email}`);
    console.log('User ID:', data.user.id);

    // TODO: Optionally insert into 'clients' table here if needed
    // This would require knowing the 'clients' table structure and required fields.
    // Example:
    // const { error: clientError } = await scriptSupabaseClient
    //   .from('clients')
    //   .insert({
    //     user_id: data.user.id,
    //     email: data.user.email,
    //     // Add other required client fields...
    //     // salon_id: 'some-default-salon-id' // Might need a default salon?
    //   });
    // if (clientError) {
    //   console.error('Error creating client record:', clientError.message);
    // } else {
    //   console.log('Successfully created client record.');
    // }

  } else {
    console.log('User created, but confirmation might be required (check Supabase settings).');
    // If email confirmation is enabled, the user won't be fully active yet.
  }
}

createDemoUser();