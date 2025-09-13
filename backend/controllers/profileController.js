const { getAuthenticatedClient } = require("../config/supabase");
const { asyncHandler } = require("../middleware/errorHandler");
const { profileSchemas } = require("../middleware/validation");

// Get user profile
const getProfile = asyncHandler(async (req, res) => {
  const supabase = getAuthenticatedClient(req.accessToken);

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", req.user.id)
    .single();

  if (error && error.code !== "PGRST116") {
    // PGRST116 is "not found"
    console.error("Error fetching profile:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to fetch profile",
      data: null,
    });
  }

  // If profile doesn't exist, return empty profile structure
  if (!profile) {
    return res.json({
      success: true,
      data: {
        id: req.user.id,
        business_name: null,
        owner_name: req.user.user_metadata?.full_name || null,
        business_type: null,
        location: null,
        monthly_revenue: null,
        monthly_expenses: null,
        preferred_language: "English",
        created_at: null,
      },
      error: null,
    });
  }

  res.json({
    success: true,
    data: profile,
    error: null,
  });
});

// Create or update user profile
const updateProfile = asyncHandler(async (req, res) => {
  const supabase = getAuthenticatedClient(req.accessToken);

  // Validate input using Joi schema
  const { error, value } = profileSchemas.updateProfile.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      error: `Validation error: ${error.details[0].message}`,
      data: null,
    });
  }

  const {
    business_name,
    owner_name,
    business_type,
    location,
    monthly_revenue,
    monthly_expenses,
    preferred_language,
  } = value;

  // Additional business logic validation
  if (
    monthly_revenue &&
    monthly_expenses &&
    monthly_expenses > monthly_revenue
  ) {
    console.warn(
      `User ${req.user.id} attempting to set expenses (${monthly_expenses}) higher than revenue (${monthly_revenue})`
    );
  }

  const profileData = {
    id: req.user.id,
    business_name,
    owner_name,
    business_type,
    location,
    monthly_revenue: monthly_revenue ? parseFloat(monthly_revenue) : null,
    monthly_expenses: monthly_expenses ? parseFloat(monthly_expenses) : null,
    preferred_language: preferred_language || "English",
    updated_at: new Date().toISOString(),
  };

  // Use upsert to create or update profile
  const { data: profile, error: dbError } = await supabase
    .from("profiles")
    .upsert(profileData)
    .select()
    .single();

  if (dbError) {
    console.error("Database error updating profile:", dbError, {
      userId: req.user.id,
      ip: req.authContext?.ip,
      timestamp: new Date().toISOString(),
    });
    return res.status(500).json({
      success: false,
      error: "Failed to update profile",
      data: null,
    });
  }

  // Log successful profile update for audit
  console.log(
    `Profile updated successfully for user ${req.user.id} from IP ${req.authContext?.ip}`
  );

  res.json({
    success: true,
    data: profile,
    error: null,
  });
});

// Get profile statistics
const getProfileStats = asyncHandler(async (req, res) => {
  const supabase = getAuthenticatedClient(req.accessToken);

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("monthly_revenue, monthly_expenses")
    .eq("id", req.user.id)
    .single();

  if (error) {
    return res.status(500).json({
      success: false,
      error: "Failed to fetch profile statistics",
      data: null,
    });
  }

  const stats = {
    monthly_revenue: profile?.monthly_revenue || 0,
    monthly_expenses: profile?.monthly_expenses || 0,
    net_profit:
      (profile?.monthly_revenue || 0) - (profile?.monthly_expenses || 0),
    profit_margin:
      profile?.monthly_revenue > 0
        ? (
            (((profile?.monthly_revenue || 0) -
              (profile?.monthly_expenses || 0)) /
              profile.monthly_revenue) *
            100
          ).toFixed(2)
        : 0,
  };

  res.json({
    success: true,
    data: stats,
    error: null,
  });
});

module.exports = {
  getProfile,
  updateProfile,
  getProfileStats,
};
