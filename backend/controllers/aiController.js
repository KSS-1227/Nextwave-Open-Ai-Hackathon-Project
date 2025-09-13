const { generateFinancialAdvice } = require("../config/openai");
const { getAuthenticatedClient } = require("../config/supabase");
const { asyncHandler } = require("../middleware/errorHandler");

// AI Chat Assistant for financial advice
const chatAssistant = asyncHandler(async (req, res) => {
  const { message } = req.body;

  // Validate input
  if (!message || typeof message !== "string" || message.trim().length === 0) {
    return res.status(400).json({
      success: false,
      error: "Message is required and must be a non-empty string",
      data: null,
    });
  }

  if (message.length > 1000) {
    return res.status(400).json({
      success: false,
      error: "Message too long. Please limit to 1000 characters",
      data: null,
    });
  }

  try {
    // Get user profile for context
    const supabase = getAuthenticatedClient(req.accessToken);
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", req.user.id)
      .single();

    // Generate AI response
    const aiResponse = await generateFinancialAdvice(
      message.trim(),
      profile || {}
    );

    // Log the interaction (optional - for analytics)
    const chatLog = {
      user_id: req.user.id,
      user_message: message.trim(),
      ai_response: aiResponse,
      created_at: new Date().toISOString(),
    };

    res.json({
      success: true,
      data: {
        message: aiResponse,
        timestamp: new Date().toISOString(),
        context_used: {
          has_profile: !!profile,
          business_type: profile?.business_type || null,
          has_revenue_data: !!profile?.monthly_revenue,
        },
      },
      error: null,
    });
  } catch (error) {
    console.error("AI Chat Error:", error);

    // Handle specific OpenAI errors
    if (error.message.includes("API key")) {
      return res.status(500).json({
        success: false,
        error: "AI service configuration error",
        data: null,
      });
    }

    if (error.message.includes("rate limit")) {
      return res.status(429).json({
        success: false,
        error: "AI service is busy. Please try again in a moment",
        data: null,
      });
    }

    res.status(500).json({
      success: false,
      error: "AI assistant is temporarily unavailable",
      data: null,
    });
  }
});

// Get chat history (if we want to implement this later)
const getChatHistory = asyncHandler(async (req, res) => {
  // For now, return empty history
  // This could be implemented by storing chat logs in the database
  res.json({
    success: true,
    data: {
      history: [],
      message: "Chat history feature not yet implemented",
    },
    error: null,
  });
});

// Get financial insights based on user profile
const getFinancialInsights = asyncHandler(async (req, res) => {
  try {
    // Get user profile
    const supabase = getAuthenticatedClient(req.accessToken);
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", req.user.id)
      .single();

    if (!profile || !profile.monthly_revenue || !profile.monthly_expenses) {
      return res.status(400).json({
        success: false,
        error: "Complete business profile required for financial insights",
        data: null,
      });
    }

    // Generate insights prompt
    const insightsPrompt = `Provide key financial insights and recommendations for my business:
    
    Business Type: ${profile.business_type}
    Monthly Revenue: ₹${profile.monthly_revenue}
    Monthly Expenses: ₹${profile.monthly_expenses}
    Location: ${profile.location}
    
    Please provide:
    1. Financial health assessment
    2. Key performance indicators
    3. Cost optimization opportunities
    4. Revenue growth strategies
    5. Cash flow management tips`;

    const aiInsights = await generateFinancialAdvice(insightsPrompt, profile);

    res.json({
      success: true,
      data: {
        insights: aiInsights,
        metrics: {
          monthly_revenue: profile.monthly_revenue,
          monthly_expenses: profile.monthly_expenses,
          net_profit: profile.monthly_revenue - profile.monthly_expenses,
          profit_margin: (
            ((profile.monthly_revenue - profile.monthly_expenses) /
              profile.monthly_revenue) *
            100
          ).toFixed(2),
        },
        generated_at: new Date().toISOString(),
      },
      error: null,
    });
  } catch (error) {
    console.error("Financial Insights Error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to generate financial insights",
      data: null,
    });
  }
});

module.exports = {
  chatAssistant,
  getChatHistory,
  getFinancialInsights,
};
