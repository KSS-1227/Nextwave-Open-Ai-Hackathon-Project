import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { User, Bot } from "lucide-react";

interface ChatBubbleProps {
  message: string;
  type: "user" | "ai";
  timestamp?: string;
  className?: string;
  isTyping?: boolean;
  actions?: string[];
  knowledgeContext?: {
    entities_extracted?: number;
    knowledge_retrieved?: number;
    relationships_found?: number;
  };
}

// Function to format text with basic markdown-like styling
const formatMessage = (text: string): JSX.Element[] => {
  if (!text) return [<span key="empty"></span>];
  
  const lines = text.split('\n');
  const elements: JSX.Element[] = [];
  
  lines.forEach((line, index) => {
    // Headers (lines with === or --- underline)
    if (line.startsWith('===') || line.startsWith('---')) {
      return; // Skip underline lines
    }
    
    // Section headers with emojis
    if (line.match(/^[\s]*[A-Z][A-Z\s]+$/) && lines[index + 1]?.match(/^=+$/)) {
      elements.push(
        <h3 key={index} className="font-bold text-lg mt-3 mb-1 text-primary">
          {line.trim()}
        </h3>
      );
      return;
    }
    
    // Subsection headers with emojis
    if (line.match(/^[\s]*[A-Z][A-Z\s]+$/) && lines[index + 1]?.match(/^-+$/)) {
      elements.push(
        <h4 key={index} className="font-semibold mt-2 mb-1 text-primary">
          {line.trim()}
        </h4>
      );
      return;
    }
    
    // Emoji section headers (using simpler approach to avoid regex issues)
    const emojiHeaders = ['🤖', '💼', '🧠', '❓', '🎯', '📊', '💡', '🔍', '💰', '💸', '📍', '🏢', '📋'];
    const hasEmojiHeader = emojiHeaders.some(emoji => line.trim().startsWith(emoji));
    
    if (hasEmojiHeader) {
      elements.push(
        <h4 key={index} className="font-semibold mt-2 mb-1 flex items-center">
          {line.trim()}
        </h4>
      );
      return;
    }
    
    // Bullet points
    if (line.trim().startsWith('•') || line.trim().startsWith('🔹') || line.trim().startsWith('⚡') || line.trim().startsWith('-')) {
      elements.push(
        <li key={index} className="ml-4 list-none">
          {line.trim()}
        </li>
      );
      return;
    }
    
    // Regular text
    if (line.trim() !== '') {
      elements.push(
        <p key={index} className="mb-1">
          {line}
        </p>
      );
    } else {
      // Empty line
      elements.push(<br key={index} />);
    }
  });
  
  return elements;
};

export function ChatBubble({ 
  message, 
  type, 
  timestamp, 
  className,
  isTyping = false,
  actions,
  knowledgeContext
}: ChatBubbleProps) {
  const isUser = type === "user";
  
  return (
    <div className={cn(
      "flex gap-3 max-w-[85%] animate-slide-up",
      isUser ? "ml-auto flex-row-reverse" : "mr-auto",
      className
    )}>
      <Avatar className="h-8 w-8 flex-shrink-0">
        <AvatarFallback className={cn(
          "text-xs",
          isUser ? "bg-primary text-primary-foreground" : "bg-muted"
        )}>
          {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
        </AvatarFallback>
      </Avatar>
      
      <div className={cn(
        "flex flex-col gap-1",
        isUser ? "items-end" : "items-start"
      )}>
        <div className={cn(
          "rounded-2xl px-4 py-2 max-w-full break-words",
          isUser 
            ? "bg-chat-user text-chat-user-foreground rounded-br-md" 
            : "bg-chat-ai text-chat-ai-foreground border rounded-bl-md",
          isTyping && "chat-typing"
        )}>
          {isTyping ? (
            <div className="flex gap-1">
              <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
              <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
              <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
            </div>
          ) : (
            <div className="text-sm leading-relaxed whitespace-pre-wrap">
              {formatMessage(message)}
            </div>
          )}
        </div>
        
        {timestamp && !isTyping && (
          <span className="text-xs text-muted-foreground px-1">
            {timestamp}
          </span>
        )}
        
        {/* Knowledge Context Indicator for AI messages */}
        {type === "ai" && knowledgeContext && (
          <div className="text-xs text-muted-foreground mt-1 flex items-center gap-2">
            {knowledgeContext.entities_extracted > 0 && (
              <span className="bg-blue-100 text-blue-800 px-1 py-0.5 rounded text-xs">
                📊 {knowledgeContext.entities_extracted} concepts
              </span>
            )}
            {knowledgeContext.knowledge_retrieved > 0 && (
              <span className="bg-green-100 text-green-800 px-1 py-0.5 rounded text-xs">
                🧠 {knowledgeContext.knowledge_retrieved} insights
              </span>
            )}
            {knowledgeContext.relationships_found > 0 && (
              <span className="bg-purple-100 text-purple-800 px-1 py-0.5 rounded text-xs">
                🔗 {knowledgeContext.relationships_found} connections
              </span>
            )}
          </div>
        )}
        
        {/* Action Buttons for AI messages */}
        {type === 'ai' && actions && actions.length > 0 && !isTyping && (
          <div className="flex flex-wrap gap-2 mt-2">
            {actions.map((action, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                className="text-xs h-7"
                onClick={() => {
                  // Handle action click - could trigger new messages or functions
                  console.log(`Action clicked: ${action}`);
                }}
              >
                {action}
              </Button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}