const { generateBusinessIdeas } = require("../config/openai");
const { getAuthenticatedClient } = require("../config/supabase");
const { asyncHandler } = require("../middleware/errorHandler");

// Generate AI-powered business ideas
const getBusinessIdeas = asyncHandler(async (req, res) => {
  const { budget, field } = req.body;

  // Validate inputs
  if (!budget || !field) {
    return res.status(400).json({
      success: false,
      error: "Budget and field are required",
      data: null,
    });
  }

  // Validate budget
  const budgetNumber = parseFloat(budget);
  if (isNaN(budgetNumber) || budgetNumber <= 0) {
    return res.status(400).json({
      success: false,
      error: "Budget must be a positive number",
      data: null,
    });
  }

  if (budgetNumber > 100000000) {
    // 10 crores
    return res.status(400).json({
      success: false,
      error: "Budget too high. Please limit to ₹10 crores",
      data: null,
    });
  }

  // Validate field
  if (typeof field !== "string" || field.trim().length === 0) {
    return res.status(400).json({
      success: false,
      error: "Field must be a non-empty string",
      data: null,
    });
  }

  if (field.length > 100) {
    return res.status(400).json({
      success: false,
      error: "Field name too long. Please limit to 100 characters",
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

    // Generate business ideas
    const businessIdeas = await generateBusinessIdeas(
      budgetNumber,
      field.trim()
    );

    // Categorize budget
    let budgetCategory = "";
    if (budgetNumber < 100000) budgetCategory = "Micro Business";
    else if (budgetNumber < 1000000) budgetCategory = "Small Business";
    else if (budgetNumber < 10000000) budgetCategory = "Medium Business";
    else budgetCategory = "Large Business";

    res.json({
      success: true,
      data: {
        business_ideas: businessIdeas,
        request_parameters: {
          budget: budgetNumber,
          budget_formatted: `₹${budgetNumber.toLocaleString("en-IN")}`,
          budget_category: budgetCategory,
          field: field.trim(),
          market: "India",
        },
        user_context: {
          business_name: profile?.business_name,
          current_business_type: profile?.business_type,
          location: profile?.location || "India",
          experience_level: profile?.business_name
            ? "Experienced"
            : "New Entrepreneur",
        },
        generated_at: new Date().toISOString(),
      },
      error: null,
    });
  } catch (error) {
    console.error("Business Ideas Error:", error);

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
      error: "Business ideas service is temporarily unavailable",
      data: null,
    });
  }
});

// Get trending business sectors
const getTrendingSectors = asyncHandler(async (req, res) => {
  // Curated list of trending sectors in India
  const trendingSectors = [
    {
      name: "EdTech",
      description: "Educational Technology solutions",
      growth_rate: "High",
      investment_range: "₹50,000 - ₹50,00,000",
      market_size: "Large",
    },
    {
      name: "FinTech",
      description: "Financial Technology and digital payments",
      growth_rate: "Very High",
      investment_range: "₹1,00,000 - ₹1,00,00,000",
      market_size: "Very Large",
    },
    {
      name: "HealthTech",
      description: "Digital healthcare and telemedicine",
      growth_rate: "High",
      investment_range: "₹2,00,000 - ₹50,00,000",
      market_size: "Large",
    },
    {
      name: "AgriTech",
      description: "Agricultural technology and solutions",
      growth_rate: "Medium",
      investment_range: "₹1,00,000 - ₹25,00,000",
      market_size: "Large",
    },
    {
      name: "E-commerce",
      description: "Online retail and marketplace platforms",
      growth_rate: "High",
      investment_range: "₹50,000 - ₹10,00,000",
      market_size: "Very Large",
    },
    {
      name: "Renewable Energy",
      description: "Solar, wind, and clean energy solutions",
      growth_rate: "High",
      investment_range: "₹5,00,000 - ₹1,00,00,000",
      market_size: "Large",
    },
    {
      name: "Food Delivery",
      description: "Food delivery and cloud kitchens",
      growth_rate: "Medium",
      investment_range: "₹2,00,000 - ₹20,00,000",
      market_size: "Large",
    },
    {
      name: "Digital Services",
      description: "IT services and digital marketing",
      growth_rate: "High",
      investment_range: "₹25,000 - ₹5,00,000",
      market_size: "Large",
    },
  ];

  res.json({
    success: true,
    data: {
      trending_sectors: trendingSectors,
      market: "India",
      last_updated: new Date().toISOString(),
      note: "Data based on current market trends and growth projections",
    },
    error: null,
  });
});

// Get investment-based recommendations
const getInvestmentRecommendations = asyncHandler(async (req, res) => {
  const { budget } = req.query;

  if (!budget) {
    return res.status(400).json({
      success: false,
      error: "Budget parameter is required",
      data: null,
    });
  }

  const budgetNumber = parseFloat(budget);
  if (isNaN(budgetNumber) || budgetNumber <= 0) {
    return res.status(400).json({
      success: false,
      error: "Budget must be a positive number",
      data: null,
    });
  }

  let recommendations = [];

  if (budgetNumber < 100000) {
    recommendations = [
      "Service-based businesses (consulting, tutoring)",
      "Online content creation",
      "Small e-commerce store",
      "Digital marketing services",
      "Freelancing platforms",
    ];
  } else if (budgetNumber < 500000) {
    recommendations = [
      "Small retail business",
      "Food cart or small restaurant",
      "Digital marketing agency",
      "E-commerce with inventory",
      "Coaching institute",
    ];
  } else if (budgetNumber < 2000000) {
    recommendations = [
      "Franchise opportunities",
      "Manufacturing (small scale)",
      "Technology services company",
      "Educational institute",
      "Healthcare services",
    ];
  } else if (budgetNumber < 10000000) {
    recommendations = [
      "Manufacturing business",
      "Tech startup",
      "Multi-location retail",
      "Real estate development",
      "Import/export business",
    ];
  } else {
    recommendations = [
      "Large-scale manufacturing",
      "Technology platform",
      "Chain of businesses",
      "Real estate projects",
      "Industrial ventures",
    ];
  }

  res.json({
    success: true,
    data: {
      budget: budgetNumber,
      budget_formatted: `₹${budgetNumber.toLocaleString("en-IN")}`,
      recommendations: recommendations,
      generated_at: new Date().toISOString(),
    },
    error: null,
  });
});

module.exports = {
  getBusinessIdeas,
  getTrendingSectors,
  getInvestmentRecommendations,
};
