const { createClient } = require("@supabase/supabase-js");
const config = require("./env");

// Create Supabase client for general operations
const supabase = createClient(config.supabase.url, config.supabase.anonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: false, // Server-side, we don't need persistent sessions
  },
});

// Create Supabase admin client for administrative operations
const supabaseAdmin = createClient(
  config.supabase.url,
  config.supabase.serviceRoleKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

// Helper function to get authenticated supabase client with user token
const getAuthenticatedClient = (accessToken) => {
  return createClient(config.supabase.url, config.supabase.anonKey, {
    global: {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
};

module.exports = {
  supabase,
  supabaseAdmin,
  getAuthenticatedClient,
};
