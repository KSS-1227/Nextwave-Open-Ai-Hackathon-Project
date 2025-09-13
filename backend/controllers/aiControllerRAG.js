const { generateFinancialAdvice } = require("../config/openai");
const { getAuthenticatedClient } = require("../config/supabase");
const { asyncHandler } = require("../middleware/errorHandler");
const graphRAG = require("../config/graphRAG");
const { v4: uuidv4 } = require("uuid");

// Enhanced AI Chat Assistant with Graph RAG
const chatAssistantWithRAG = asyncHandler(async (req, res) => {
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
    const userId = req.user.id;
    const conversationId = uuidv4();

    // Get user profile for context
    const supabase = getAuthenticatedClient(req.accessToken);
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    // Step 1: Extract entities from user message
    const entities = graphRAG.extractEntities(message.trim(), profile || {});

    // Step 2: Retrieve relevant knowledge from graph
    const relevantKnowledge = await graphRAG.retrieveRelevantKnowledge(
      userId,
      message.trim(),
      profile || {}
    );

    // Step 3: Generate enhanced prompt with graph context
    const enhancedPrompt = graphRAG.generateEnhancedPrompt(
      message.trim(),
      relevantKnowledge,
      profile || {}
    );

    // Step 4: Generate AI response using enhanced prompt
    const aiResponse = await generateFinancialAdvice(
      enhancedPrompt,
      profile || {}
    );

    // Step 5: Extract entities from AI response for learning
    const responseEntities = graphRAG.extractEntities(
      aiResponse,
      profile || {}
    );

    // Step 6: Build relationships between entities
    const allEntities = [...entities, ...responseEntities];
    const relationships = graphRAG.buildRelationships(allEntities, {
      conversation_id: conversationId,
      query: message.trim(),
      response: aiResponse.substring(0, 200), // First 200 chars for context
    });

    // Step 7: Store knowledge in graph
    await graphRAG.storeKnowledge(
      userId,
      allEntities,
      relationships,
      conversationId
    );

    // Step 8: Store conversation history with analytics
    const tokenAnalytics = graphRAG.getTokenAnalytics(relevantKnowledge);
    await storeConversationHistory(
      userId,
      conversationId,
      message.trim(),
      aiResponse,
      allEntities,
      relevantKnowledge,
      tokenAnalytics
    );

    // Step 9: Periodic cleanup (every 50th request)
    if (Math.random() < 0.02) {
      // 2% chance
      graphRAG.cleanupOldKnowledge(userId, 30).catch(console.error);
    }

    res.json({
      success: true,
      data: {
        message: aiResponse,
        timestamp: new Date().toISOString(),
        context_used: {
          has_profile: !!profile,
          business_type: profile?.business_type || null,
          has_revenue_data: !!profile?.monthly_revenue,
          entities_extracted: entities.length,
          knowledge_retrieved: relevantKnowledge.entities.length,
          relationships_found: relevantKnowledge.relationships.length,
          token_efficiency:
            relevantKnowledge.optimization?.token_efficiency || "N/A",
          optimization_stats: relevantKnowledge.optimization,
        },
        conversation_id: conversationId,
        token_analytics: tokenAnalytics,
      },
      error: null,
    });
  } catch (error) {
    console.error("Graph RAG Chat Error:", error);

    // Fallback to regular AI response
    try {
      const supabase = getAuthenticatedClient(req.accessToken);
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", req.user.id)
        .single();

      const fallbackResponse = await generateFinancialAdvice(
        message.trim(),
        profile || {}
      );

      return res.json({
        success: true,
        data: {
          message: fallbackResponse,
          timestamp: new Date().toISOString(),
          context_used: {
            has_profile: !!profile,
            business_type: profile?.business_type || null,
            has_revenue_data: !!profile?.monthly_revenue,
            fallback_mode: true,
          },
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
      error: "AI assistant is temporarily unavailable",
      data: null,
    });
  }
});

// Enhanced conversation history storage with token analytics
async function storeConversationHistory(
  userId,
  conversationId,
  userMessage,
  aiResponse,
  entities,
  knowledgeUsed,
  tokenAnalytics
) {
  try {
    const supabase = getAuthenticatedClient();

    // Store user message with entity metadata
    await supabase.from("conversation_history").insert({
      user_id: userId,
      conversation_id: conversationId,
      message_type: "user",
      message_content: userMessage,
      entities_extracted: {
        count: entities.length,
        high_confidence: entities.filter((e) => e.confidence > 0.8).length,
        extraction_methods: [
          ...new Set(entities.map((e) => e.extraction_method)),
        ],
      },
      knowledge_used: null,
    });

    // Store AI response with optimization metrics
    await supabase.from("conversation_history").insert({
      user_id: userId,
      conversation_id: conversationId,
      message_type: "ai",
      message_content: aiResponse,
      entities_extracted: null,
      knowledge_used: {
        entities_count: knowledgeUsed.entities.length,
        relationships_count: knowledgeUsed.relationships.length,
        context_summary: knowledgeUsed.context.substring(0, 500),
        token_analytics: tokenAnalytics,
        optimization_applied: !!knowledgeUsed.optimization,
      },
    });
  } catch (error) {
    console.error("Error storing conversation history:", error);
  }
}

// Get enhanced chat history with knowledge context
const getChatHistoryWithRAG = asyncHandler(async (req, res) => {
  try {
    const userId = req.user.id;
    const { limit = 10, conversation_id } = req.query;

    const supabase = getAuthenticatedClient(req.accessToken);

    let query = supabase
      .from("conversation_history")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(parseInt(limit));

    if (conversation_id) {
      query = query.eq("conversation_id", conversation_id);
    }

    const { data: history } = await query;

    // Get user's knowledge graph summary
    const { data: entitiesCount } = await supabase
      .from("knowledge_entities")
      .select("id", { count: "exact" })
      .eq("user_id", userId);

    const { data: relationshipsCount } = await supabase
      .from("knowledge_relationships")
      .select("id", { count: "exact" })
      .eq("user_id", userId);

    res.json({
      success: true,
      data: {
        history: history || [],
        knowledge_graph_stats: {
          entities: entitiesCount?.length || 0,
          relationships: relationshipsCount?.length || 0,
        },
        message:
          history?.length > 0
            ? "Chat history retrieved with knowledge context"
            : "No chat history found",
      },
      error: null,
    });
  } catch (error) {
    console.error("Error getting chat history:", error);
    res.status(500).json({
      success: false,
      error: "Failed to retrieve chat history",
      data: null,
    });
  }
});

// Get financial insights with Graph RAG enhancement
const getFinancialInsightsWithRAG = asyncHandler(async (req, res) => {
  try {
    const userId = req.user.id;

    // Get user profile
    const supabase = getAuthenticatedClient(req.accessToken);
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (!profile || !profile.monthly_revenue || !profile.monthly_expenses) {
      return res.status(400).json({
        success: false,
        error: "Complete business profile required for financial insights",
        data: null,
      });
    }

    // Get relevant knowledge from user's graph
    const relevantKnowledge = await graphRAG.retrieveRelevantKnowledge(
      userId,
      "financial insights business analysis performance metrics",
      profile
    );

    // Generate insights prompt with graph context
    const insightsQuery = `Provide comprehensive financial insights and recommendations for my business based on current data and historical knowledge.`;

    const enhancedPrompt = graphRAG.generateEnhancedPrompt(
      insightsQuery,
      relevantKnowledge,
      profile
    );

    const aiInsights = await generateFinancialAdvice(enhancedPrompt, profile);

    // Extract and store new insights as entities
    const conversationId = uuidv4();
    const insightEntities = graphRAG.extractEntities(aiInsights, profile);
    const relationships = graphRAG.buildRelationships(insightEntities, {
      conversation_id: conversationId,
      type: "financial_insights",
      generated_at: new Date().toISOString(),
    });

    await graphRAG.storeKnowledge(
      userId,
      insightEntities,
      relationships,
      conversationId
    );

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
        knowledge_context: {
          entities_used: relevantKnowledge.entities.length,
          relationships_used: relevantKnowledge.relationships.length,
          new_entities_extracted: insightEntities.length,
        },
        generated_at: new Date().toISOString(),
      },
      error: null,
    });
  } catch (error) {
    console.error("Financial Insights with RAG Error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to generate enhanced financial insights",
      data: null,
    });
  }
});

// Get knowledge graph visualization data
const getKnowledgeGraph = asyncHandler(async (req, res) => {
  try {
    const userId = req.user.id;
    const { limit = 50 } = req.query;

    const supabase = getAuthenticatedClient(req.accessToken);

    // Get entities
    const { data: entities } = await supabase
      .from("knowledge_entities")
      .select("*")
      .eq("user_id", userId)
      .order("confidence", { ascending: false })
      .limit(parseInt(limit));

    // Get relationships
    const { data: relationships } = await supabase
      .from("knowledge_relationships")
      .select("*")
      .eq("user_id", userId)
      .order("strength", { ascending: false })
      .limit(parseInt(limit));

    // Format for graph visualization
    const nodes =
      entities?.map((entity) => ({
        id: entity.entity_name,
        label: entity.entity_name,
        type: entity.entity_type,
        category: entity.category,
        confidence: entity.confidence,
        size: Math.max(10, entity.confidence * 30),
      })) || [];

    const links =
      relationships?.map((rel) => ({
        source: rel.from_entity,
        target: rel.to_entity,
        type: rel.relationship_type,
        strength: rel.strength,
        width: Math.max(1, rel.strength * 5),
      })) || [];

    res.json({
      success: true,
      data: {
        nodes,
        links,
        stats: {
          total_entities: entities?.length || 0,
          total_relationships: relationships?.length || 0,
          categories: [...new Set(entities?.map((e) => e.category) || [])],
          relationship_types: [
            ...new Set(relationships?.map((r) => r.relationship_type) || []),
          ],
        },
      },
      error: null,
    });
  } catch (error) {
    console.error("Error getting knowledge graph:", error);
    res.status(500).json({
      success: false,
      error: "Failed to retrieve knowledge graph",
      data: null,
    });
  }
});

module.exports = {
  chatAssistantWithRAG,
  getChatHistoryWithRAG,
  getFinancialInsightsWithRAG,
  getKnowledgeGraph,
  // Legacy exports for backward compatibility
  chatAssistant: chatAssistantWithRAG,
  getChatHistory: getChatHistoryWithRAG,
  getFinancialInsights: getFinancialInsightsWithRAG,
};
