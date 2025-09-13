-- Knowledge Entities Table with Optimization Features
CREATE TABLE
  IF NOT EXISTS knowledge_entities (
    id UUID DEFAULT gen_random_uuid () PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
    conversation_id UUID,
    entity_name TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    category TEXT,
    context TEXT,
    confidence FLOAT DEFAULT 0.5,
    tier INTEGER DEFAULT 3, -- Hierarchical importance (1=high, 2=medium, 3=low)
    extraction_method TEXT, -- Track how entity was extracted
    token_cost INTEGER, -- Estimated token cost for this entity
    last_accessed TIMESTAMP
    WITH
      TIME ZONE DEFAULT NOW (),
      created_at TIMESTAMP
    WITH
      TIME ZONE DEFAULT NOW (),
      updated_at TIMESTAMP
    WITH
      TIME ZONE DEFAULT NOW ()
  );

-- Knowledge Relationships Table with Enhanced Features
CREATE TABLE
  IF NOT EXISTS knowledge_relationships (
    id UUID DEFAULT gen_random_uuid () PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
    conversation_id UUID,
    from_entity TEXT NOT NULL,
    to_entity TEXT NOT NULL,
    relationship_type TEXT NOT NULL,
    strength FLOAT DEFAULT 0.5,
    context JSONB,
    priority_level INTEGER DEFAULT 3, -- 1=critical, 2=important, 3=supporting
    token_cost INTEGER, -- Estimated token cost
    last_accessed TIMESTAMP
    WITH
      TIME ZONE DEFAULT NOW (),
      created_at TIMESTAMP
    WITH
      TIME ZONE DEFAULT NOW (),
      updated_at TIMESTAMP
    WITH
      TIME ZONE DEFAULT NOW ()
  );

-- Conversation History Table (for graph RAG context)
CREATE TABLE
  IF NOT EXISTS conversation_history (
    id UUID DEFAULT gen_random_uuid () PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
    conversation_id UUID NOT NULL,
    message_type TEXT NOT NULL CHECK (message_type IN ('user', 'ai')),
    message_content TEXT NOT NULL,
    entities_extracted JSONB,
    knowledge_used JSONB,
    created_at TIMESTAMP
    WITH
      TIME ZONE DEFAULT NOW ()
  );

-- Create optimized indexes for better performance
CREATE INDEX IF NOT EXISTS idx_knowledge_entities_user_id ON knowledge_entities (user_id);

CREATE INDEX IF NOT EXISTS idx_knowledge_entities_tier_confidence ON knowledge_entities (tier, confidence DESC);

CREATE INDEX IF NOT EXISTS idx_knowledge_entities_category ON knowledge_entities (category);

CREATE INDEX IF NOT EXISTS idx_knowledge_entities_confidence ON knowledge_entities (confidence DESC);

CREATE INDEX IF NOT EXISTS idx_knowledge_entities_last_accessed ON knowledge_entities (last_accessed DESC);

CREATE INDEX IF NOT EXISTS idx_knowledge_entities_extraction_method ON knowledge_entities (extraction_method);

CREATE INDEX IF NOT EXISTS idx_knowledge_relationships_user_id ON knowledge_relationships (user_id);

CREATE INDEX IF NOT EXISTS idx_knowledge_relationships_entities ON knowledge_relationships (from_entity, to_entity);

CREATE INDEX IF NOT EXISTS idx_knowledge_relationships_strength ON knowledge_relationships (strength DESC);

CREATE INDEX IF NOT EXISTS idx_knowledge_relationships_priority ON knowledge_relationships (priority_level, strength DESC);

CREATE INDEX IF NOT EXISTS idx_knowledge_relationships_last_accessed ON knowledge_relationships (last_accessed DESC);

CREATE INDEX IF NOT EXISTS idx_conversation_history_user_id ON conversation_history (user_id);

CREATE INDEX IF NOT EXISTS idx_conversation_history_conversation_id ON conversation_history (conversation_id);

-- Enable Row Level Security (RLS)
ALTER TABLE knowledge_entities ENABLE ROW LEVEL SECURITY;

ALTER TABLE knowledge_relationships ENABLE ROW LEVEL SECURITY;

ALTER TABLE conversation_history ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can only access their own knowledge entities" ON knowledge_entities FOR ALL USING (auth.uid () = user_id);

CREATE POLICY "Users can only access their own knowledge relationships" ON knowledge_relationships FOR ALL USING (auth.uid () = user_id);

CREATE POLICY "Users can only access their own conversation history" ON conversation_history FOR ALL USING (auth.uid () = user_id);

-- Grant permissions
GRANT ALL ON knowledge_entities TO authenticated;

GRANT ALL ON knowledge_relationships TO authenticated;

GRANT ALL ON conversation_history TO authenticated;