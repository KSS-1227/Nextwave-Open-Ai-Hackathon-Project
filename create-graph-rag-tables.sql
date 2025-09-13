-- Graph RAG Tables Creation Script
-- Run this in your Supabase SQL Editor
-- 1. Knowledge Entities Table
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
    created_at TIMESTAMP
    WITH
      TIME ZONE DEFAULT NOW (),
      updated_at TIMESTAMP
    WITH
      TIME ZONE DEFAULT NOW ()
  );

-- 2. Knowledge Relationships Table  
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
    created_at TIMESTAMP
    WITH
      TIME ZONE DEFAULT NOW (),
      updated_at TIMESTAMP
    WITH
      TIME ZONE DEFAULT NOW ()
  );

-- 3. Conversation History Table
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

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_knowledge_entities_user_id ON knowledge_entities (user_id);

CREATE INDEX IF NOT EXISTS idx_knowledge_entities_category ON knowledge_entities (category);

CREATE INDEX IF NOT EXISTS idx_knowledge_entities_confidence ON knowledge_entities (confidence DESC);

CREATE INDEX IF NOT EXISTS idx_knowledge_relationships_user_id ON knowledge_relationships (user_id);

CREATE INDEX IF NOT EXISTS idx_knowledge_relationships_entities ON knowledge_relationships (from_entity, to_entity);

CREATE INDEX IF NOT EXISTS idx_knowledge_relationships_strength ON knowledge_relationships (strength DESC);

CREATE INDEX IF NOT EXISTS idx_conversation_history_user_id ON conversation_history (user_id);

CREATE INDEX IF NOT EXISTS idx_conversation_history_conversation_id ON conversation_history (conversation_id);

-- Enable Row Level Security (RLS)
ALTER TABLE knowledge_entities ENABLE ROW LEVEL SECURITY;

ALTER TABLE knowledge_relationships ENABLE ROW LEVEL SECURITY;

ALTER TABLE conversation_history ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
DROP POLICY IF EXISTS "Users can only access their own knowledge entities" ON knowledge_entities;

CREATE POLICY "Users can only access their own knowledge entities" ON knowledge_entities FOR ALL USING (auth.uid () = user_id);

DROP POLICY IF EXISTS "Users can only access their own knowledge relationships" ON knowledge_relationships;

CREATE POLICY "Users can only access their own knowledge relationships" ON knowledge_relationships FOR ALL USING (auth.uid () = user_id);

DROP POLICY IF EXISTS "Users can only access their own conversation history" ON conversation_history;

CREATE POLICY "Users can only access their own conversation history" ON conversation_history FOR ALL USING (auth.uid () = user_id);

-- Grant permissions
GRANT ALL ON knowledge_entities TO authenticated;

GRANT ALL ON knowledge_relationships TO authenticated;

GRANT ALL ON conversation_history TO authenticated;