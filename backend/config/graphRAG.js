const {
  getAuthenticatedClient,
  supabaseAdmin,
  supabase,
} = require("./supabase");
const compromise = require("compromise");
const natural = require("natural");
const stopword = require("stopword");
const { v4: uuidv4 } = require("uuid");

// Token Optimization Utility
class TokenOptimizer {
  constructor() {
    this.tokenEstimate = {
      // Rough token estimation (1 token ≈ 0.75 words)
      wordsPerToken: 0.75,
      avgWordsPerEntity: 8,
      avgWordsPerRelationship: 12,
    };
  }

  estimateTokens(text) {
    const words = text.split(/\s+/).length;
    return Math.ceil(words / this.tokenEstimate.wordsPerToken);
  }

  calculateEntityTokenCost(entity) {
    const contextWords = entity.context
      ? entity.context.split(/\s+/).length
      : 0;
    const nameWords = entity.entity_name
      ? entity.entity_name.split(/\s+/).length
      : 2;
    return Math.ceil(
      (contextWords + nameWords + 4) / this.tokenEstimate.wordsPerToken
    );
  }

  calculateRelationshipTokenCost(relationship) {
    const contextStr =
      typeof relationship.context === "object"
        ? JSON.stringify(relationship.context).substring(0, 100)
        : relationship.context || "";
    const words = contextStr.split(/\s+/).length + 6; // Base relationship description
    return Math.ceil(words / this.tokenEstimate.wordsPerToken);
  }
}

// Context Pruning with Advanced Algorithms
class ContextPruner {
  constructor() {
    this.maxContextLength = 1500; // Max chars for context
    this.relevanceWeights = {
      recency: 0.3,
      importance: 0.4,
      similarity: 0.3,
    };
  }

  // Calculate temporal relevance with exponential decay
  calculateTemporalRelevance(entityTimestamp, currentTime, decayHours = 72) {
    const timeDiff =
      (currentTime - new Date(entityTimestamp)) / (1000 * 60 * 60); // hours
    return Math.exp(-timeDiff / decayHours);
  }

  // Calculate semantic similarity using advanced string matching
  calculateSemanticSimilarity(queryTerms, entityName, entityContext) {
    const normalizeText = (text) =>
      text
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, "")
        .trim();

    const queryText = normalizeText(queryTerms.join(" "));
    const entityText = normalizeText(`${entityName} ${entityContext || ""}`);

    // Jaccard similarity for better semantic matching
    const querySet = new Set(queryText.split(/\s+/));
    const entitySet = new Set(entityText.split(/\s+/));

    const intersection = new Set([...querySet].filter((x) => entitySet.has(x)));
    const union = new Set([...querySet, ...entitySet]);

    return intersection.size / union.size;
  }

  // Advanced relevance scoring with multiple factors
  calculateRelevanceScore(entity, queryTerms, currentTime) {
    const importance = entity.confidence || entity.importance || 0.5;
    const temporal = this.calculateTemporalRelevance(
      entity.created_at || new Date(),
      currentTime
    );
    const semantic = this.calculateSemanticSimilarity(
      queryTerms,
      entity.entity_name || entity.entity,
      entity.context
    );

    return (
      this.relevanceWeights.importance * importance +
      this.relevanceWeights.recency * temporal +
      this.relevanceWeights.similarity * semantic
    );
  }

  // Intelligent entity clustering to reduce duplicates
  clusterSimilarEntities(entities, similarityThreshold = 0.8) {
    const clusters = [];
    const processed = new Set();

    entities.forEach((entity, i) => {
      if (processed.has(i)) return;

      const cluster = [entity];
      processed.add(i);

      entities.forEach((otherEntity, j) => {
        if (i !== j && !processed.has(j)) {
          const similarity = this.calculateSemanticSimilarity(
            [entity.entity_name || entity.entity],
            otherEntity.entity_name || otherEntity.entity,
            otherEntity.context
          );

          if (similarity > similarityThreshold) {
            cluster.push(otherEntity);
            processed.add(j);
          }
        }
      });

      // Keep the highest confidence entity from each cluster
      const bestEntity = cluster.reduce((best, current) =>
        (current.confidence || 0) > (best.confidence || 0) ? current : best
      );

      clusters.push(bestEntity);
    });

    return clusters;
  }
}

// Graph RAG Configuration with Token Optimization
class GraphRAG {
  constructor() {
    this.knowledge_graph = new Map(); // In-memory graph for quick access
    this.entity_relationships = new Map();
    this.conversation_history = new Map();
    this.financial_concepts = this.initializeFinancialConcepts();
    this.tokenOptimizer = new TokenOptimizer();
    this.contextPruner = new ContextPruner();
    this.MAX_CONTEXT_TOKENS = 2000; // Configurable token limit
    this.RELEVANCE_THRESHOLD = 0.6; // Minimum relevance score
    this.TEMPORAL_DECAY_HOURS = 72; // Hours for temporal decay
  }

  // Helper to get the best available Supabase client
  getSupabaseClient() {
    // Check if service role key is properly configured
    const config = require("./env");
    if (
      config.supabase.serviceRoleKey &&
      config.supabase.serviceRoleKey !== "your_service_role_key_here"
    ) {
      return supabaseAdmin;
    }
    // Fallback to regular client
    return supabase;
  }
  // Initialize financial domain knowledge with hierarchical importance
  initializeFinancialConcepts() {
    return {
      entities: {
        // Tier 1: Critical financial metrics (highest importance)
        cash_flow: {
          type: "metric",
          category: "liquidity",
          importance: 0.95,
          tier: 1,
        },
        profit_margin: {
          type: "metric",
          category: "profitability",
          importance: 0.95,
          tier: 1,
        },
        revenue: {
          type: "metric",
          category: "income",
          importance: 0.9,
          tier: 1,
        },
        expenses: {
          type: "metric",
          category: "cost",
          importance: 0.9,
          tier: 1,
        },

        // Tier 2: Important business metrics
        growth: {
          type: "metric",
          category: "performance",
          importance: 0.85,
          tier: 2,
        },
        customer: {
          type: "stakeholder",
          category: "revenue",
          importance: 0.8,
          tier: 2,
        },
        debt: {
          type: "liability",
          category: "financing",
          importance: 0.75,
          tier: 2,
        },
        inventory: {
          type: "asset",
          category: "working_capital",
          importance: 0.75,
          tier: 2,
        },

        // Tier 3: Supporting concepts
        supplier: {
          type: "stakeholder",
          category: "operations",
          importance: 0.65,
          tier: 3,
        },
        investment: {
          type: "action",
          category: "growth",
          importance: 0.7,
          tier: 3,
        },
        competition: {
          type: "external",
          category: "market",
          importance: 0.6,
          tier: 3,
        },
        seasonality: {
          type: "pattern",
          category: "trends",
          importance: 0.55,
          tier: 3,
        },
      },
      relationships: {
        // High-priority relationships
        critical: ["affects", "depends_on", "determines"],
        important: ["influences", "requires", "improves"],
        supporting: ["relates_to", "threatens", "enables"],
      },
    };
  }

  // Enhanced entity extraction with deduplication and ranking
  extractEntities(text, userProfile = {}) {
    const entities = [];
    const extractedTerms = new Set(); // Prevent duplicates

    // Use compromise for NLP parsing
    const doc = compromise(text);
    const words = text.toLowerCase().split(/\s+/);

    // Extract financial terms with context-aware scoring
    const financialTerms = Object.keys(this.financial_concepts.entities);
    financialTerms.forEach((term) => {
      const termPattern = term.replace("_", " ");
      if (
        text.toLowerCase().includes(termPattern) &&
        !extractedTerms.has(term)
      ) {
        const concept = this.financial_concepts.entities[term];
        entities.push({
          entity: term,
          type: concept.type,
          category: concept.category,
          context: this.extractOptimizedContext(text, termPattern, 40), // Reduced context
          confidence: concept.importance,
          tier: concept.tier,
          extraction_method: "financial_domain",
        });
        extractedTerms.add(term);
      }
    });

    // Extract monetary values with improved pattern matching
    const currencyPattern =
      /(?:₹|rupees?|lakhs?|crores?)\s*([\d,]+(?:\.\d+)?)/gi;
    let match;
    while (
      (match = currencyPattern.exec(text)) !== null &&
      !extractedTerms.has(match[0])
    ) {
      entities.push({
        entity: match[0],
        type: "amount",
        category: "financial_value",
        context: this.extractOptimizedContext(text, match[0], 25),
        confidence: 0.9,
        tier: 1,
        extraction_method: "currency_pattern",
      });
      extractedTerms.add(match[0]);
    }

    // Extract business context from user profile (high confidence)
    if (
      userProfile.business_type &&
      !extractedTerms.has(userProfile.business_type)
    ) {
      entities.push({
        entity: userProfile.business_type,
        type: "business_context",
        category: "industry",
        context: "user_business_profile",
        confidence: 1.0,
        tier: 1,
        extraction_method: "user_profile",
      });
      extractedTerms.add(userProfile.business_type);
    }

    // Extract key business metrics from numbers
    const numberPattern = /\b\d+(?:,\d{3})*(?:\.\d+)?\b/g;
    const numbers = text.match(numberPattern) || [];
    numbers.slice(0, 3).forEach((num, index) => {
      // Limit to top 3 numbers
      if (!extractedTerms.has(`metric_${num}`)) {
        entities.push({
          entity: `metric_${num}`,
          type: "numeric_metric",
          category: "quantitative_data",
          context: this.extractOptimizedContext(text, num, 20),
          confidence: 0.6,
          tier: 3,
          extraction_method: "numeric_pattern",
        });
        extractedTerms.add(`metric_${num}`);
      }
    });

    // Sort by importance and tier, limit results
    return entities
      .sort((a, b) => {
        if (a.tier !== b.tier) return a.tier - b.tier;
        return b.confidence - a.confidence;
      })
      .slice(0, 15); // Limit to top 15 entities
  }

  // Optimized context extraction with character limits
  extractOptimizedContext(text, entity, maxChars = 40) {
    const words = text.split(" ");
    const entityIndex = words.findIndex((word) =>
      word.toLowerCase().includes(entity.toLowerCase().replace("_", " "))
    );

    if (entityIndex === -1) return "";

    const start = Math.max(0, entityIndex - 2);
    const end = Math.min(words.length, entityIndex + 3);
    const context = words.slice(start, end).join(" ");

    // Truncate to character limit
    return context.length > maxChars
      ? context.substring(0, maxChars) + "..."
      : context;
  }

  // Legacy context extraction (kept for backward compatibility)
  extractContext(text, entity) {
    return this.extractOptimizedContext(text, entity, 60);
  }

  // Build relationships between entities
  buildRelationships(entities, conversationContext = {}) {
    const relationships = [];

    for (let i = 0; i < entities.length; i++) {
      for (let j = i + 1; j < entities.length; j++) {
        const entity1 = entities[i];
        const entity2 = entities[j];

        // Check if entities have known relationships
        const relationshipType = this.inferRelationship(entity1, entity2);

        if (relationshipType) {
          relationships.push({
            from: entity1.entity,
            to: entity2.entity,
            type: relationshipType,
            strength: this.calculateRelationshipStrength(entity1, entity2),
            context: conversationContext,
          });
        }
      }
    }

    return relationships;
  }

  // Infer relationship type between two entities
  inferRelationship(entity1, entity2) {
    const category1 = entity1.category;
    const category2 = entity2.category;

    // Financial relationship rules
    if (category1 === "income" && category2 === "profitability")
      return "affects";
    if (category1 === "cost" && category2 === "profitability") return "reduces";
    if (category1 === "liquidity" && category2 === "working_capital")
      return "depends_on";
    if (category1 === "operations" && category2 === "cost") return "influences";
    if (category1 === "market" && category2 === "revenue") return "affects";
    if (category1 === "growth" && category2 === "financing") return "requires";

    // Generic relationships
    if (entity1.type === "metric" && entity2.type === "action")
      return "improved_by";
    if (entity1.type === "stakeholder" && entity2.type === "metric")
      return "influences";

    return null;
  }

  // Calculate relationship strength
  calculateRelationshipStrength(entity1, entity2) {
    const baseStrength = (entity1.confidence + entity2.confidence) / 2;

    // Boost strength for important financial relationships
    if (
      entity1.category === "profitability" ||
      entity2.category === "profitability"
    ) {
      return Math.min(1.0, baseStrength + 0.2);
    }

    return baseStrength;
  }

  // Token-aware knowledge storage with deduplication
  async storeKnowledge(userId, entities, relationships, conversationId) {
    try {
      // Apply deduplication and optimization before storage
      const optimizedEntities = this.contextPruner
        .clusterSimilarEntities(entities)
        .filter((entity) => entity.confidence >= 0.5)
        .slice(0, 20); // Limit storage

      const optimizedRelationships = relationships
        .filter((rel) => rel.strength >= 0.5)
        .slice(0, 15); // Limit storage

      // Store in Supabase for persistence
      const supabase = this.getSupabaseClient();

      // Store entities with enhanced metadata
      for (const entity of optimizedEntities) {
        await supabase.from("knowledge_entities").upsert({
          id: uuidv4(),
          user_id: userId,
          conversation_id: conversationId,
          entity_name: entity.entity,
          entity_type: entity.type,
          category: entity.category,
          context: entity.context?.substring(0, 200) || "", // Limit context length
          confidence: entity.confidence,
          tier: entity.tier || 3,
          extraction_method: entity.extraction_method || "unknown",
          created_at: new Date().toISOString(),
        });
      }

      // Store relationships with metadata
      for (const rel of optimizedRelationships) {
        await supabase.from("knowledge_relationships").upsert({
          id: uuidv4(),
          user_id: userId,
          conversation_id: conversationId,
          from_entity: rel.from,
          to_entity: rel.to,
          relationship_type: rel.type,
          strength: rel.strength,
          context: JSON.stringify(rel.context).substring(0, 500), // Limit context
          created_at: new Date().toISOString(),
        });
      }

      // Update in-memory cache
      this.updateMemoryGraph(userId, optimizedEntities, optimizedRelationships);

      console.log(
        `[Graph RAG] Stored ${optimizedEntities.length} entities, ${optimizedRelationships.length} relationships`
      );
    } catch (error) {
      console.error("Error storing knowledge:", error);
      // Fallback to memory-only storage
      this.updateMemoryGraph(userId, entities, relationships);
    }
  }

  // Update in-memory graph with optimization
  updateMemoryGraph(userId, entities, relationships) {
    if (!this.knowledge_graph.has(userId)) {
      this.knowledge_graph.set(userId, { entities: [], relationships: [] });
    }

    const userGraph = this.knowledge_graph.get(userId);

    // Apply clustering to prevent memory bloat
    const allEntities = [...userGraph.entities, ...entities];
    userGraph.entities = this.contextPruner
      .clusterSimilarEntities(allEntities)
      .slice(0, 100); // Limit memory usage

    userGraph.relationships.push(...relationships);

    // Keep only recent relationships
    userGraph.relationships = userGraph.relationships.slice(-50); // Keep last 50 relationships
  }

  // Cleanup old knowledge for database optimization
  async cleanupOldKnowledge(userId, daysToKeep = 30) {
    try {
      const supabase = this.getSupabaseClient();
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

      // Delete old entities with low confidence
      await supabase
        .from("knowledge_entities")
        .delete()
        .eq("user_id", userId)
        .lt("created_at", cutoffDate.toISOString())
        .lt("confidence", 0.3);

      // Delete old weak relationships
      await supabase
        .from("knowledge_relationships")
        .delete()
        .eq("user_id", userId)
        .lt("created_at", cutoffDate.toISOString())
        .lt("strength", 0.4);

      console.log(`[Graph RAG] Cleaned up old knowledge for user ${userId}`);
    } catch (error) {
      console.error("Error cleaning up knowledge:", error);
    }
  }

  // Get token usage analytics
  getTokenAnalytics(relevantKnowledge) {
    return {
      context_tokens: this.tokenOptimizer.estimateTokens(
        relevantKnowledge.context || ""
      ),
      max_tokens: this.MAX_CONTEXT_TOKENS,
      efficiency: relevantKnowledge.tokenCount
        ? Math.round(
            (relevantKnowledge.tokenCount / this.MAX_CONTEXT_TOKENS) * 100
          )
        : 0,
      entities_count: relevantKnowledge.entities.length,
      relationships_count: relevantKnowledge.relationships.length,
    };
  }

  // Token-aware knowledge retrieval with intelligent pruning
  async retrieveRelevantKnowledge(userId, query, userProfile = {}) {
    try {
      const currentTime = new Date();
      const queryTerms = query
        .toLowerCase()
        .split(/\s+/)
        .filter((word) => word.length > 2);

      // Extract entities from current query
      const queryEntities = this.extractEntities(query, userProfile);

      // Get stored knowledge from database with optimized queries
      const supabase = this.getSupabaseClient();

      // Get entities with improved filtering
      const { data: storedEntities } = await supabase
        .from("knowledge_entities")
        .select("*")
        .eq("user_id", userId)
        .gte("confidence", this.RELEVANCE_THRESHOLD)
        .order("confidence", { ascending: false })
        .limit(50); // Increased limit for better selection

      const { data: storedRelationships } = await supabase
        .from("knowledge_relationships")
        .select("*")
        .eq("user_id", userId)
        .gte("strength", this.RELEVANCE_THRESHOLD)
        .order("strength", { ascending: false })
        .limit(30);

      // Apply intelligent pruning and clustering
      const relevantKnowledge = this.findOptimizedRelevantKnowledge(
        queryEntities,
        storedEntities || [],
        storedRelationships || [],
        queryTerms,
        currentTime
      );

      return relevantKnowledge;
    } catch (error) {
      console.error("Error retrieving knowledge:", error);

      // Fallback to memory-based retrieval
      const userGraph = this.knowledge_graph.get(userId);
      if (!userGraph)
        return { entities: [], relationships: [], context: "", tokenCount: 0 };

      const queryEntities = this.extractEntities(query, userProfile);
      const queryTerms = query
        .toLowerCase()
        .split(/\s+/)
        .filter((word) => word.length > 2);

      return this.findOptimizedRelevantKnowledge(
        queryEntities,
        userGraph.entities,
        userGraph.relationships,
        queryTerms,
        new Date()
      );
    }
  }

  // Advanced knowledge finding with token optimization
  findOptimizedRelevantKnowledge(
    queryEntities,
    storedEntities,
    storedRelationships,
    queryTerms,
    currentTime
  ) {
    const relevantEntities = [];
    const relevantRelationships = [];
    let currentTokenCount = 0;

    // Score and rank entities by relevance
    const scoredEntities = storedEntities.map((entity) => ({
      ...entity,
      relevanceScore: this.contextPruner.calculateRelevanceScore(
        entity,
        queryTerms,
        currentTime
      ),
      tokenCost: this.tokenOptimizer.calculateEntityTokenCost(entity),
    }));

    // Cluster similar entities to reduce redundancy
    const clusteredEntities =
      this.contextPruner.clusterSimilarEntities(scoredEntities);

    // Select entities within token budget
    clusteredEntities
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .forEach((entity) => {
        if (
          currentTokenCount + entity.tokenCost <= this.MAX_CONTEXT_TOKENS &&
          entity.relevanceScore >= this.RELEVANCE_THRESHOLD
        ) {
          relevantEntities.push(entity);
          currentTokenCount += entity.tokenCost;
        }
      });

    // Find relevant relationships for selected entities
    const entityNames = relevantEntities.map((e) => e.entity_name || e.entity);
    const candidateRelationships = storedRelationships.filter(
      (rel) =>
        entityNames.includes(rel.from_entity) ||
        entityNames.includes(rel.to_entity)
    );

    // Score and select relationships within token budget
    candidateRelationships
      .map((rel) => ({
        ...rel,
        tokenCost: this.tokenOptimizer.calculateRelationshipTokenCost(rel),
      }))
      .sort((a, b) => b.strength - a.strength)
      .forEach((rel) => {
        if (currentTokenCount + rel.tokenCost <= this.MAX_CONTEXT_TOKENS) {
          relevantRelationships.push(rel);
          currentTokenCount += rel.tokenCost;
        }
      });

    // Build optimized context string
    const context = this.buildOptimizedContextString(
      relevantEntities.slice(0, 10), // Limit entities
      relevantRelationships.slice(0, 8) // Limit relationships
    );

    return {
      entities: relevantEntities,
      relationships: relevantRelationships,
      context,
      tokenCount: currentTokenCount,
      optimization: {
        entities_considered: storedEntities.length,
        entities_selected: relevantEntities.length,
        relationships_considered: storedRelationships.length,
        relationships_selected: relevantRelationships.length,
        token_efficiency: `${Math.round(
          (currentTokenCount / this.MAX_CONTEXT_TOKENS) * 100
        )}%`,
      },
    };
  }

  // Calculate similarity between entities
  calculateEntitySimilarity(entity1, entity2) {
    const name1 = entity1.entity || entity1.entity_name;
    const name2 = entity2.entity || entity2.entity_name;

    // Exact match
    if (name1 === name2) return 1.0;

    // Category match
    if (entity1.category === entity2.category) return 0.7;

    // Type match
    if (entity1.type === entity2.type) return 0.5;

    // String similarity using Levenshtein distance
    const distance = natural.LevenshteinDistance(name1, name2);
    const maxLength = Math.max(name1.length, name2.length);
    return 1 - distance / maxLength;
  }

  // Build optimized context string with token awareness
  buildOptimizedContextString(entities, relationships) {
    if (!entities.length && !relationships.length) {
      return "No relevant financial knowledge available.";
    }

    let context = "💼 KEY FINANCIAL INSIGHTS\n========================\n\n";

    // Add high-priority entities first with better formatting
    const priorityEntities = entities
      .filter((e) => (e.tier || 3) <= 2)
      .slice(0, 8);

    if (priorityEntities.length > 0) {
      context += "📊 CORE METRICS & INSIGHTS\n";
      context += "-------------------------\n";

      priorityEntities.forEach((entity) => {
        const name = entity.entity || entity.entity_name;
        const shortContext =
          entity.context && entity.context.length > 50
            ? entity.context.substring(0, 50) + "..."
            : entity.context || "Key financial insight";

        context += `🔹 ${name.toUpperCase()}\n`;
        context += `   Category: ${entity.category}\n`;
        context += `   Confidence: ${(entity.confidence * 100).toFixed(0)}%\n`;
        context += `   Insight: ${shortContext}\n\n`;
      });
    }

    // Add critical relationships with enhanced formatting
    const criticalRelationships = relationships
      .filter((rel) => rel.strength >= 0.7)
      .slice(0, 5);

    if (criticalRelationships.length > 0) {
      context += "🔗 KEY RELATIONSHIPS\n";
      context += "-------------------\n";

      criticalRelationships.forEach((rel) => {
        context += `⚡ ${rel.from_entity} → ${rel.to_entity}\n`;
        context += `   Type: ${rel.relationship_type}\n`;
        context += `   Strength: ${(rel.strength * 100).toFixed(0)}%\n\n`;
      });
    }

    // Add summary statistics
    if (entities.length > 0 || relationships.length > 0) {
      context += "📈 KNOWLEDGE GRAPH SUMMARY\n";
      context += "-------------------------\n";
      context += `Total Entities Analyzed: ${entities.length}\n`;
      context += `Key Relationships Found: ${relationships.length}\n`;
      context += `Confidence Level: High\n\n`;
    }

    return context;
  }

  // Legacy context builder (kept for compatibility)
  buildContextString(entities, relationships) {
    let context = "💼 RELEVANT FINANCIAL KNOWLEDGE\n";
    context += "=============================\n\n";

    // Add entity information with better formatting
    if (entities.length > 0) {
      context += "📊 FINANCIAL ENTITIES\n";
      context += "--------------------\n";

      entities.forEach((entity) => {
        const name = entity.entity || entity.entity_name;
        context += `🔹 ${name}\n`;
        context += `   Category: ${entity.category}\n`;
        context += `   Context: ${entity.context || "Previous discussion"}\n\n`;
      });
    }

    // Add relationship information with better formatting
    if (relationships.length > 0) {
      context += "🔗 RELATIONSHIPS\n";
      context += "---------------\n";

      relationships.forEach((rel) => {
        context += `⚡ ${rel.from_entity} ${rel.relationship_type} ${rel.to_entity}\n`;
        context += `   Strength: ${rel.strength}\n\n`;
      });
    }

    return context;
  }

  // Generate token-optimized enhanced prompt with better structure
  generateEnhancedPrompt(originalQuery, relevantKnowledge, userProfile = {}) {
    const contextTokens = this.tokenOptimizer.estimateTokens(
      relevantKnowledge.context || ""
    );
    const hasRelevantContext =
      contextTokens > 0 && relevantKnowledge.entities.length > 0;

    // Build efficient business context
    const businessContext = this.buildBusinessContext(userProfile);

    let basePrompt;

    if (hasRelevantContext) {
      // Full context prompt for users with knowledge graph
      basePrompt = `🤖 VIRTUAL CFO ASSISTANT
====================

💼 YOUR BUSINESS CONTEXT
${businessContext}

🧠 RELEVANT INSIGHTS
${relevantKnowledge.context}

❓ YOUR QUESTION
"${originalQuery}"

🎯 INSTRUCTIONS
Provide specific, actionable financial advice using the context above. 
Reference relevant insights when applicable.
Format your response with:
- Clear section headers using emojis (📊, 💡, 🔍, etc.)
- Bullet points for key recommendations
- Highlight important metrics with bold text
- Keep explanations concise but comprehensive
- Include specific numbers when relevant`;
    } else {
      // Simplified prompt for new users or when no relevant context
      basePrompt = `🤖 VIRTUAL CFO ASSISTANT
====================

💼 YOUR BUSINESS CONTEXT
${businessContext}

❓ YOUR QUESTION
"${originalQuery}"

🎯 INSTRUCTIONS
Provide comprehensive financial advice tailored to this business profile.
Format your response with:
- Clear section headers using emojis (📊, 💡, 🔍, etc.)
- Bullet points for key recommendations
- Highlight important metrics with bold text
- Keep explanations concise but comprehensive
- Include specific numbers when relevant`;
    }

    // Add token efficiency metadata
    if (relevantKnowledge.tokenCount) {
      console.log(
        `[Graph RAG] Context tokens: ${relevantKnowledge.tokenCount}/${this.MAX_CONTEXT_TOKENS}`
      );
    }

    return basePrompt;
  }

  // Build concise business context with enhanced formatting
  buildBusinessContext(userProfile) {
    const essentials = [];

    if (userProfile.business_type)
      essentials.push(`🏢 Industry: ${userProfile.business_type}`);
    if (userProfile.monthly_revenue)
      essentials.push(
        `💰 Revenue: ₹${userProfile.monthly_revenue.toLocaleString()}`
      );
    if (userProfile.monthly_expenses)
      essentials.push(
        `💸 Expenses: ₹${userProfile.monthly_expenses.toLocaleString()}`
      );
    if (userProfile.location)
      essentials.push(`📍 Location: ${userProfile.location}`);

    if (essentials.length > 0) {
      return (
        "📋 YOUR BUSINESS PROFILE\n" +
        "=====================\n" +
        essentials.join("\n")
      );
    } else {
      return (
        "📋 YOUR BUSINESS PROFILE\n" +
        "=====================\n" +
        "Business: Profile incomplete\n" +
        "Please update your profile for personalized insights"
      );
    }
  }
}

// Export singleton instance
const graphRAG = new GraphRAG();
module.exports = graphRAG;
