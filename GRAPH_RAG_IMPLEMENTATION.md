# Graph RAG Implementation for Veda Finance Bot

## Overview

This document describes the Graph RAG (Retrieval-Augmented Generation) system implementation that enhances all chat interfaces in the Veda Finance Bot.

## What is Graph RAG?

Graph RAG combines:

- **Knowledge Graphs**: Structured representation of entities and relationships
- **Retrieval-Augmented Generation**: Enhanced AI responses using retrieved context
- **Entity Extraction**: NLP-based identification of financial concepts
- **Relationship Mapping**: Understanding connections between business concepts

## Implementation Architecture

### Backend Components

1. **Graph RAG Core (`backend/config/graphRAG.js`)**

   - Entity extraction using NLP
   - Relationship inference
   - Knowledge graph management
   - Context-aware prompt generation

2. **Enhanced Controllers**

   - `backend/controllers/aiControllerRAG.js` - Chat with Graph RAG
   - `backend/controllers/businessIdeasControllerRAG.js` - Business ideas with RAG

3. **Database Schema**
   - `knowledge_entities` - Stores extracted entities
   - `knowledge_relationships` - Stores entity relationships
   - `conversation_history` - Enhanced conversation logs

### Frontend Integration

- Updated API calls in `src/lib/api.ts`
- New knowledge graph visualization endpoint
- Enhanced chat history with context

## Features

### 1. Entity Extraction

Automatically identifies financial concepts from conversations:

```javascript
// Example entities extracted
{
  entity: "cash_flow",
  type: "metric",
  category: "liquidity",
  confidence: 0.9
}
```

### 2. Relationship Mapping

Understands connections between financial concepts:

```javascript
// Example relationship
{
  from: "cash_flow",
  to: "inventory",
  type: "depends_on",
  strength: 0.8
}
```

### 3. Context-Aware Responses

Uses historical knowledge to provide better advice:

- References previous conversations
- Maintains consistency across sessions
- Builds on user's business knowledge

### 4. Knowledge Graph Visualization

New endpoint `/api/chat/knowledge-graph` provides data for visualizing the user's business knowledge.

## Enhanced Endpoints

### Chat Interface (`/api/chat`)

- **POST /api/chat** - Enhanced chat with Graph RAG
- **GET /api/chat/history** - Context-rich chat history
- **GET /api/chat/insights** - RAG-enhanced financial insights
- **GET /api/chat/knowledge-graph** - Visualization data

### Business Ideas (`/api/business-ideas`)

- **POST /api/business-ideas** - Personalized business ideas
- **GET /api/business-ideas/trending** - Personalized sector recommendations

## Database Tables

### knowledge_entities

```sql
CREATE TABLE knowledge_entities (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    entity_name TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    category TEXT,
    context TEXT,
    confidence FLOAT,
    created_at TIMESTAMP
);
```

### knowledge_relationships

```sql
CREATE TABLE knowledge_relationships (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    from_entity TEXT NOT NULL,
    to_entity TEXT NOT NULL,
    relationship_type TEXT NOT NULL,
    strength FLOAT,
    context JSONB,
    created_at TIMESTAMP
);
```

### conversation_history

```sql
CREATE TABLE conversation_history (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    conversation_id UUID NOT NULL,
    message_type TEXT CHECK (message_type IN ('user', 'ai')),
    message_content TEXT NOT NULL,
    entities_extracted JSONB,
    knowledge_used JSONB,
    created_at TIMESTAMP
);
```

## Financial Domain Knowledge

The system includes pre-configured financial concepts:

### Entities

- **Metrics**: cash_flow, profit_margin, revenue, expenses
- **Assets**: inventory, equipment, property
- **Stakeholders**: supplier, customer, competitor
- **Actions**: investment, debt, growth strategies

### Relationships

- **affects**: How one metric influences another
- **depends_on**: Dependencies between concepts
- **influences**: Indirect effects
- **requires**: Prerequisites for actions

## Setup Instructions

### 1. Database Setup

```bash
# Option 1: Run migration (if Supabase CLI is configured)
npx supabase db push

# Option 2: Create tables manually in Supabase dashboard
# Use the SQL from: supabase/migrations/20250906120000_create_graph_rag_tables.sql
```

### 2. Environment Variables

Ensure your `.env` file has:

```env
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_key
OPENAI_API_KEY=your_openai_key
```

### 3. Test the System

```bash
cd backend
node test-graph-rag.js
```

## API Response Format

### Enhanced Chat Response

```json
{
  "success": true,
  "data": {
    "message": "AI response with enhanced context",
    "timestamp": "2024-01-01T00:00:00Z",
    "context_used": {
      "has_profile": true,
      "business_type": "Electronics Retail",
      "entities_extracted": 4,
      "knowledge_retrieved": 12,
      "relationships_found": 8
    },
    "conversation_id": "uuid"
  }
}
```

### Knowledge Graph Response

```json
{
  "success": true,
  "data": {
    "nodes": [
      {
        "id": "cash_flow",
        "label": "Cash Flow",
        "type": "metric",
        "category": "liquidity",
        "confidence": 0.9
      }
    ],
    "links": [
      {
        "source": "cash_flow",
        "target": "inventory",
        "type": "depends_on",
        "strength": 0.8
      }
    ],
    "stats": {
      "total_entities": 25,
      "total_relationships": 18
    }
  }
}
```

## Benefits

### For Users

- **Personalized Advice**: Based on their specific business context
- **Consistent Experience**: AI remembers previous conversations
- **Better Insights**: Connections between financial concepts
- **Learning System**: Gets smarter with each interaction

### For Developers

- **Modular Design**: Easy to extend and modify
- **Fallback Support**: Graceful degradation if RAG fails
- **Rich Analytics**: Detailed insights into user interactions
- **Scalable Architecture**: Supports multiple users efficiently

## Testing

Run the test suite to verify functionality:

```bash
cd backend
node test-graph-rag.js
```

The test covers:

- Entity extraction accuracy
- Relationship building logic
- Prompt enhancement
- Financial concept mapping
- Entity similarity calculation

## Future Enhancements

1. **Vector Embeddings**: Add semantic similarity using embeddings
2. **Graph Algorithms**: Implement pathfinding and centrality analysis
3. **Industry Knowledge**: Pre-populate with domain-specific data
4. **Real-time Learning**: Update knowledge from external sources
5. **Visualization UI**: Frontend component for knowledge graph

## Troubleshooting

### Common Issues

1. **Database Connection**: Ensure Supabase credentials are correct
2. **Missing Tables**: Run the database migration or create tables manually
3. **API Errors**: Check OpenAI API key and rate limits
4. **Entity Extraction**: Verify NLP dependencies are installed

### Fallback Behavior

If Graph RAG fails, the system automatically falls back to the original chat implementation, ensuring uninterrupted service.

## Conclusion

The Graph RAG implementation significantly enhances the chat experience by:

- Making AI responses more contextual and personalized
- Building a persistent knowledge base for each user
- Improving the quality of financial advice over time
- Maintaining consistency across all chat interfaces

This creates a more intelligent and helpful virtual CFO assistant that learns and adapts to each user's unique business needs.
