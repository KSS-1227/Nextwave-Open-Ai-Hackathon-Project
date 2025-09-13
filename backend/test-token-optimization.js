#!/usr/bin/env node

const graphRAG = require("./config/graphRAG");

// Test token optimization features
async function testTokenOptimization() {
  console.log("🚀 Testing Token-Optimized Graph RAG System\n");

  // Test 1: Token Estimation
  console.log("Test 1: Token Estimation");
  const testTexts = [
    "I need help with cash flow management for my electronics retail business.",
    "Our monthly revenue is ₹5,00,000 and expenses are ₹4,50,000. How can we improve profit margins?",
    "What strategies should we implement for inventory management during seasonal fluctuations?",
  ];

  testTexts.forEach((text, i) => {
    const tokens = graphRAG.tokenOptimizer.estimateTokens(text);
    console.log(
      `  Text ${i + 1}: ${tokens} tokens - "${text.substring(0, 50)}..."`
    );
  });

  // Test 2: Entity Extraction with Tiers
  console.log("\nTest 2: Hierarchical Entity Extraction");
  const testProfile = {
    business_type: "Electronics Retail",
    monthly_revenue: 500000,
    monthly_expenses: 450000,
    location: "Mumbai",
  };

  const entities = graphRAG.extractEntities(testTexts[1], testProfile);
  console.log("  Extracted Entities by Tier:");
  [1, 2, 3].forEach((tier) => {
    const tierEntities = entities.filter((e) => e.tier === tier);
    console.log(
      `    Tier ${tier} (${tierEntities.length}): ${tierEntities
        .map((e) => e.entity)
        .join(", ")}`
    );
  });

  // Test 3: Context Pruning
  console.log("\nTest 3: Context Pruning and Optimization");

  // Create mock stored knowledge
  const mockStoredEntities = [
    {
      entity_name: "cash_flow",
      category: "liquidity",
      confidence: 0.9,
      tier: 1,
      context: "Previously discussed cash flow issues with seasonal inventory",
      created_at: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
    },
    {
      entity_name: "profit_margin",
      category: "profitability",
      confidence: 0.8,
      tier: 1,
      context: "Need to improve margins by reducing operational costs",
      created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    },
    {
      entity_name: "seasonality",
      category: "trends",
      confidence: 0.6,
      tier: 3,
      context: "Electronics sales peak during festivals",
      created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
    },
  ];

  const mockRelationships = [
    {
      from_entity: "cash_flow",
      to_entity: "inventory",
      relationship_type: "depends_on",
      strength: 0.8,
      context: { discussion: "inventory affects cash flow" },
    },
  ];

  const queryTerms = ["cash", "flow", "management", "business"];
  const optimizedKnowledge = graphRAG.findOptimizedRelevantKnowledge(
    entities,
    mockStoredEntities,
    mockRelationships,
    queryTerms,
    new Date()
  );

  console.log("  Optimization Results:");
  console.log(
    `    Entities selected: ${optimizedKnowledge.entities.length}/${mockStoredEntities.length}`
  );
  console.log(
    `    Relationships selected: ${optimizedKnowledge.relationships.length}/${mockRelationships.length}`
  );
  console.log(
    `    Token efficiency: ${optimizedKnowledge.optimization.token_efficiency}`
  );
  console.log(`    Context length: ${optimizedKnowledge.context.length} chars`);

  // Test 4: Clustering Similar Entities
  console.log("\nTest 4: Entity Clustering for Deduplication");

  const duplicateEntities = [
    { entity: "cash_flow", confidence: 0.9, context: "main discussion" },
    { entity: "cash flow", confidence: 0.7, context: "secondary mention" },
    { entity: "cashflow", confidence: 0.6, context: "variant spelling" },
    { entity: "revenue", confidence: 0.8, context: "income discussion" },
  ];

  const clusteredEntities =
    graphRAG.contextPruner.clusterSimilarEntities(duplicateEntities);
  console.log(`  Original entities: ${duplicateEntities.length}`);
  console.log(`  After clustering: ${clusteredEntities.length}`);
  console.log(
    "  Kept entities:",
    clusteredEntities.map((e) => `${e.entity} (${e.confidence})`)
  );

  // Test 5: Prompt Generation Comparison
  console.log("\nTest 5: Prompt Generation Token Efficiency");

  const oldStylePrompt = generateOldStylePrompt(
    testTexts[0],
    optimizedKnowledge,
    testProfile
  );
  const newStylePrompt = graphRAG.generateEnhancedPrompt(
    testTexts[0],
    optimizedKnowledge,
    testProfile
  );

  const oldTokens = graphRAG.tokenOptimizer.estimateTokens(oldStylePrompt);
  const newTokens = graphRAG.tokenOptimizer.estimateTokens(newStylePrompt);
  const savings = Math.round(((oldTokens - newTokens) / oldTokens) * 100);

  console.log(`  Old prompt: ${oldTokens} tokens`);
  console.log(`  New prompt: ${newTokens} tokens`);
  console.log(`  Token savings: ${savings}%`);

  // Test 6: Temporal Relevance
  console.log("\nTest 6: Temporal Relevance Decay");

  const testDates = [
    new Date(), // Now
    new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
    new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 1 week ago
    new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 1 month ago
  ];

  testDates.forEach((date, i) => {
    const relevance = graphRAG.contextPruner.calculateTemporalRelevance(
      date,
      new Date()
    );
    console.log(
      `  ${["Now", "1 day ago", "1 week ago", "1 month ago"][i]}: ${(
        relevance * 100
      ).toFixed(1)}% relevance`
    );
  });

  console.log("\n✅ Token Optimization Tests Complete");
  console.log("\n📊 Summary of Optimizations:");
  console.log("  • Intelligent context pruning with token limits");
  console.log("  • Hierarchical entity importance scoring (3 tiers)");
  console.log("  • Temporal relevance decay for knowledge freshness");
  console.log("  • Semantic clustering for duplicate reduction");
  console.log("  • Compressed prompt generation");
  console.log("  • Database query optimization with indexes");
  console.log("  • Automatic cleanup of low-value knowledge");

  return {
    tokenSavings: savings,
    optimizationStats: optimizedKnowledge.optimization,
    clusteredEntities: clusteredEntities.length,
    originalEntities: duplicateEntities.length,
  };
}

// Old style prompt for comparison
function generateOldStylePrompt(query, knowledge, profile) {
  return `You are a Virtual CFO assistant with access to the user's business knowledge graph.
    
User Business Context:
- Business Name: ${profile.business_name || "Not specified"}
- Business Type: ${profile.business_type || "Not specified"} 
- Location: ${profile.location || "India"}
- Monthly Revenue: ₹${profile.monthly_revenue || "Not specified"}
- Monthly Expenses: ₹${profile.monthly_expenses || "Not specified"}

${knowledge.context}

User Query: "${query}"

Provide a comprehensive response that:
1. Uses the relevant knowledge from previous conversations
2. Makes connections between related financial concepts
3. Provides specific, actionable advice
4. References past insights when relevant
5. Maintains consistency with previous recommendations

Response:`;
}

// Run tests if called directly
if (require.main === module) {
  testTokenOptimization()
    .then((results) => {
      console.log("\n🎯 Test Results:", results);
      process.exit(0);
    })
    .catch((error) => {
      console.error("❌ Test failed:", error);
      process.exit(1);
    });
}

module.exports = { testTokenOptimization };
