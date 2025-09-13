const { generateBusinessIdeas } = require("../config/openai");
const { getAuthenticatedClient } = require("../config/supabase");
const { asyncHandler } = require("../middleware/errorHandler");
const graphRAG = require("../config/graphRAG");
const { v4: uuidv4 } = require("uuid");

// Enhanced Business Ideas with Graph RAG
const getBusinessIdeasWithRAG = asyncHandler(async (req, res) => {
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
    const userId = req.user.id;
    const conversationId = uuidv4();

    // Get user profile for context
    const supabase = getAuthenticatedClient(req.accessToken);
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    // Step 1: Extract entities from the business ideas query
    const queryText = `Generate business ideas for ${field} industry with budget ${budgetNumber}`;
    const entities = graphRAG.extractEntities(queryText, profile || {});

    // Add budget and field as entities
    entities.push({
      entity: field.trim(),
      type: "industry",
      category: "business_domain",
      context: `target industry for business ideas`,
      confidence: 1.0,
    });

    entities.push({
      entity: `₹${budgetNumber.toLocaleString("en-IN")}`,
      type: "budget",
      category: "financial_constraint",
      context: `available investment budget`,
      confidence: 1.0,
    });

    // Step 2: Retrieve relevant knowledge from user's previous business discussions
    const relevantKnowledge = await graphRAG.retrieveRelevantKnowledge(
      userId,
      `business ideas investment opportunities ${field} startup entrepreneurship budget planning`,
      profile || {}
    );

    // Step 3: Generate enhanced prompt with graph context
    const enhancedPrompt = generateBusinessIdeasPrompt(
      budgetNumber,
      field.trim(),
      relevantKnowledge,
      profile || {}
    );

    // Step 4: Generate business ideas using enhanced prompt
    const businessIdeas = await generateBusinessIdeas(
      budgetNumber,
      enhancedPrompt
    );

    // Step 5: Extract entities from AI response for learning
    const responseEntities = graphRAG.extractEntities(
      businessIdeas,
      profile || {}
    );

    // Add business opportunity entities
    const businessOpportunityEntities = extractBusinessOpportunities(
      businessIdeas,
      field.trim(),
      budgetNumber
    );

    // Step 6: Build relationships between all entities
    const allEntities = [
      ...entities,
      ...responseEntities,
      ...businessOpportunityEntities,
    ];
    const relationships = graphRAG.buildRelationships(allEntities, {
      conversation_id: conversationId,
      query_type: "business_ideas",
      budget: budgetNumber,
      field: field.trim(),
      response_preview: businessIdeas.substring(0, 200),
    });

    // Step 7: Store knowledge in graph
    await graphRAG.storeKnowledge(
      userId,
      allEntities,
      relationships,
      conversationId
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
        knowledge_context: {
          entities_extracted: entities.length,
          knowledge_retrieved: relevantKnowledge.entities.length,
          relationships_found: relevantKnowledge.relationships.length,
          new_opportunities_identified: businessOpportunityEntities.length,
        },
        generated_at: new Date().toISOString(),
      },
      error: null,
    });
  } catch (error) {
    console.error("Business Ideas with RAG Error:", error);

    // Fallback to regular business ideas generation
    try {
      const supabase = getAuthenticatedClient(req.accessToken);
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", req.user.id)
        .single();

      const fallbackIdeas = await generateBusinessIdeas(
        budgetNumber,
        field.trim()
      );

      let budgetCategory = "";
      if (budgetNumber < 100000) budgetCategory = "Micro Business";
      else if (budgetNumber < 1000000) budgetCategory = "Small Business";
      else if (budgetNumber < 10000000) budgetCategory = "Medium Business";
      else budgetCategory = "Large Business";

      return res.json({
        success: true,
        data: {
          business_ideas: fallbackIdeas,
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
          fallback_mode: true,
        },
        error: null,
      });
    } catch (fallbackError) {
      console.error("Fallback error:", fallbackError);
    }

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

// Generate enhanced prompt for business ideas with graph context
function generateBusinessIdeasPrompt(
  budget,
  field,
  relevantKnowledge,
  userProfile
) {
  return `You are a business consultant with access to the user's entrepreneurial knowledge graph and previous business discussions.

User Business Background:
- Current Business: ${userProfile.business_name || "None"}
- Business Type: ${userProfile.business_type || "First-time entrepreneur"}
- Location: ${userProfile.location || "India"}
- Monthly Revenue: ₹${userProfile.monthly_revenue || "N/A"}

${relevantKnowledge.context}

Generate trending business ideas for the ${field} industry with a budget of ₹${budget.toLocaleString(
    "en-IN"
  )}.

Requirements:
- Budget: ₹${budget.toLocaleString("en-IN")}
- Industry: ${field}
- Market: India
- Focus: Trending global concepts adapted for Indian market
- Consider: User's existing business knowledge and experience

Provide comprehensive business ideas that:
1. Leverage insights from previous discussions
2. Build on user's existing business knowledge
3. Consider market trends and opportunities
4. Include specific implementation strategies
5. Account for the user's experience level and current business context

Please provide:
1. 3-5 specific business ideas with detailed descriptions
2. Investment breakdown for each idea
3. Market potential and target audience analysis
4. Implementation timeline and milestones
5. Expected ROI and break-even analysis
6. Risk assessment and mitigation strategies
7. How each idea connects to current market trends`;
}

// Extract business opportunities as entities
function extractBusinessOpportunities(businessIdeasText, field, budget) {
  const opportunities = [];

  // Simple keyword extraction for business opportunities
  const opportunityKeywords = [
    "franchise",
    "startup",
    "e-commerce",
    "saas",
    "marketplace",
    "subscription",
    "platform",
    "service",
    "manufacturing",
    "retail",
    "digital",
    "tech",
    "ai",
    "automation",
    "sustainability",
    "fintech",
  ];

  opportunityKeywords.forEach((keyword) => {
    if (businessIdeasText.toLowerCase().includes(keyword)) {
      opportunities.push({
        entity: `${keyword}_opportunity`,
        type: "business_opportunity",
        category: "entrepreneurship",
        context: `${keyword} opportunity in ${field} with budget ₹${budget.toLocaleString(
          "en-IN"
        )}`,
        confidence: 0.7,
      });
    }
  });

  return opportunities;
}

// Get trending sectors with RAG enhancement
const getTrendingSectorsWithRAG = asyncHandler(async (req, res) => {
  try {
    const userId = req.user.id;

    // Get user's business knowledge for personalized recommendations
    const relevantKnowledge = await graphRAG.retrieveRelevantKnowledge(
      userId,
      "trending business sectors industry growth market opportunities",
      {}
    );

    // Enhanced trending sectors based on user's knowledge graph
    const trendingSectors = [
      {
        name: "EdTech",
        description: "Educational Technology solutions",
        growth_rate: "High",
        investment_range: "₹50,000 - ₹50,00,000",
        market_size: "Large",
        personalized_note: getPersonalizedNote("EdTech", relevantKnowledge),
      },
      {
        name: "FinTech",
        description: "Financial Technology and digital payments",
        growth_rate: "Very High",
        investment_range: "₹1,00,000 - ₹1,00,00,000",
        market_size: "Massive",
        personalized_note: getPersonalizedNote("FinTech", relevantKnowledge),
      },
      {
        name: "HealthTech",
        description: "Digital health and telemedicine solutions",
        growth_rate: "High",
        investment_range: "₹2,00,000 - ₹50,00,000",
        market_size: "Large",
        personalized_note: getPersonalizedNote("HealthTech", relevantKnowledge),
      },
      {
        name: "AgriTech",
        description: "Agricultural technology and smart farming",
        growth_rate: "Medium",
        investment_range: "₹3,00,000 - ₹25,00,000",
        market_size: "Medium",
        personalized_note: getPersonalizedNote("AgriTech", relevantKnowledge),
      },
      {
        name: "CleanTech",
        description: "Clean energy and sustainability solutions",
        growth_rate: "High",
        investment_range: "₹5,00,000 - ₹1,00,00,000",
        market_size: "Large",
        personalized_note: getPersonalizedNote("CleanTech", relevantKnowledge),
      },
      {
        name: "FoodTech",
        description: "Food delivery and cloud kitchens",
        growth_rate: "Medium",
        investment_range: "₹2,00,000 - ₹20,00,000",
        market_size: "Large",
        personalized_note: getPersonalizedNote("FoodTech", relevantKnowledge),
      },
      {
        name: "Digital Services",
        description: "IT services and digital marketing",
        growth_rate: "High",
        investment_range: "₹25,000 - ₹5,00,000",
        market_size: "Large",
        personalized_note: getPersonalizedNote(
          "Digital Services",
          relevantKnowledge
        ),
      },
    ];

    res.json({
      success: true,
      data: {
        trending_sectors: trendingSectors,
        market: "India",
        knowledge_context: {
          entities_considered: relevantKnowledge.entities.length,
          personalization_applied: true,
        },
        last_updated: new Date().toISOString(),
        note: "Data based on current market trends, growth projections, and your business knowledge",
      },
      error: null,
    });
  } catch (error) {
    console.error("Error getting trending sectors with RAG:", error);

    // Fallback to static data
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
        market_size: "Massive",
      },
      {
        name: "HealthTech",
        description: "Digital health and telemedicine solutions",
        growth_rate: "High",
        investment_range: "₹2,00,000 - ₹50,00,000",
        market_size: "Large",
      },
      {
        name: "AgriTech",
        description: "Agricultural technology and smart farming",
        growth_rate: "Medium",
        investment_range: "₹3,00,000 - ₹25,00,000",
        market_size: "Medium",
      },
      {
        name: "CleanTech",
        description: "Clean energy and sustainability solutions",
        growth_rate: "High",
        investment_range: "₹5,00,000 - ₹1,00,00,000",
        market_size: "Large",
      },
      {
        name: "FoodTech",
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
        fallback_mode: true,
        last_updated: new Date().toISOString(),
        note: "Data based on current market trends and growth projections",
      },
      error: null,
    });
  }
});

// Get personalized note based on user's knowledge graph
function getPersonalizedNote(sectorName, relevantKnowledge) {
  const relatedEntities = relevantKnowledge.entities.filter(
    (entity) =>
      entity.category === "industry" ||
      entity.category === "business_domain" ||
      entity.entity_name?.toLowerCase().includes(sectorName.toLowerCase())
  );

  if (relatedEntities.length > 0) {
    return `Based on your previous interests in ${
      relatedEntities[0].entity_name || relatedEntities[0].entity
    }, this sector aligns well with your business focus.`;
  }

  return "Consider this sector based on current market trends.";
}

// Investment recommendations with RAG (unchanged for simplicity but could be enhanced)
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
  getBusinessIdeasWithRAG,
  getTrendingSectorsWithRAG,
  getInvestmentRecommendations,
  // Legacy exports for backward compatibility
  getBusinessIdeas: getBusinessIdeasWithRAG,
  getTrendingSectors: getTrendingSectorsWithRAG,
};
