import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChatBubble } from "@/components/ui/chat-bubble";
import { Send, Mic, Camera, Plus, Globe, Volume2, VolumeX, MicOff } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { chatAPI, handleAPIError } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { SafeStorage } from "@/lib/storage";

interface Message {
  id: string;
  text: string;
  type: "user" | "ai";
  timestamp: string;
  actions?: string[];
  knowledgeContext?: {
    entities_extracted?: number;
    knowledge_retrieved?: number;
    relationships_found?: number;
    conversation_id?: string;
  };
}

// Remove the empty interface since it's not needed
const quickSuggestions = [
  "Check my cash flow",
  "Find cost savings", 
  "Compare with last month",
  "Show profit trends"
];

const sampleMessages: Message[] = [
  {
    id: "1",
    text: "Namaste! I'm your AI CFO. I've analyzed your recent transactions. How can I help you today?",
    type: "ai",
    timestamp: "10:30 AM"
  }
];

export function ChatInterface() {
  const { toast } = useToast();
  
  const normalMessages: Message[] = [
    {
      id: "1",
      text: "Namaste! I'm your AI CFO. I've analyzed your recent transactions. How can I help you today?",
      type: "ai",
      timestamp: "10:30 AM"
    }
  ];

  const [messages, setMessages] = useState<Message[]>(normalMessages);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speechEnabled, setSpeechEnabled] = useState(false);
  const [language, setLanguage] = useState<'en' | 'hi'>('en');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (text: string) => {
    if (!text.trim()) return;
    
    const userMessage: Message = {
      id: Date.now().toString(),
      text: text.trim(),
      type: "user",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText("");
    setIsTyping(true);

    try {
      // Real API call
      const response = await chatAPI.sendMessage(text.trim());
      
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: response.data.message,
        type: "ai",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        knowledgeContext: {
          entities_extracted: response.data.context_used?.entities_extracted,
          knowledge_retrieved: response.data.context_used?.knowledge_retrieved,
          relationships_found: response.data.context_used?.relationships_found,
          conversation_id: response.data.conversation_id
        }
      };
      
      setMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);
      
      // Text-to-speech for AI responses
      if (speechEnabled) {
        // Simplified emoji removal for speech synthesis
        const cleanText = aiResponse.text.replace(/[^\w\s.,!?;:()-]/g, '');
        const utterance = new SpeechSynthesisUtterance(cleanText);
        utterance.lang = language === 'hi' ? 'hi-IN' : 'en-US';
        speechSynthesis.speak(utterance);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      
      const errorResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: "Sorry, I'm having trouble connecting to the AI service. Please try again later.",
        type: "ai",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      
      setMessages(prev => [...prev, errorResponse]);
      setIsTyping(false);
      
      toast({
        title: "Connection Error",
        description: handleAPIError(error),
        variant: "destructive"
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage(inputText);
  };

  const startListening = () => {
    // Type definitions for SpeechRecognition
    interface SpeechRecognitionEvent extends Event {
      results: {
        [key: number]: {
          [key: number]: {
            transcript: string;
          };
        };
      };
    }

    interface SpeechRecognition extends EventTarget {
      lang: string;
      onstart: (() => void) | null;
      onend: (() => void) | null;
      onresult: ((event: SpeechRecognitionEvent) => void) | null;
      start: () => void;
    }

    if ('webkitSpeechRecognition' in window) {
      const SpeechRecognitionConstructor = (window as unknown as { webkitSpeechRecognition: new () => SpeechRecognition }).webkitSpeechRecognition;
      const recognition = new SpeechRecognitionConstructor();
      recognition.lang = language === 'hi' ? 'hi-IN' : 'en-US';
      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onresult = (event: SpeechRecognitionEvent) => {
        const transcript = event.results[0][0].transcript;
        setInputText(transcript);
      };
      recognition.start();
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    handleSendMessage(suggestion);
  };

  return (
    <div className="flex flex-col h-full max-h-[400px] bg-background">
      {/* Messages */}

      <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-[300px]">
        {messages.map((message) => (
          <ChatBubble
            key={message.id}
            message={message.text}
            type={message.type}
            timestamp={message.timestamp}
            actions={message.actions}
            knowledgeContext={message.knowledgeContext}
          />
        ))}
        
        {isTyping && (
          <ChatBubble
            message=""
            type="ai"
            isTyping={true}
          />
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Suggestions */}
      {messages.length <= 1 && (
        <div className="px-4 pb-2">
          <p className="text-xs text-muted-foreground mb-2">Quick questions:</p>
          <div className="flex flex-wrap gap-2">
            {quickSuggestions.map((suggestion) => (
              <Button
                key={suggestion}
                variant="outline"
                size="sm"
                className="text-xs h-7"
                onClick={() => handleSuggestionClick(suggestion)}
              >
                {suggestion}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="p-4 border-t">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <div className="flex gap-1">
            <Button
              type="button"
              size="icon"
              variant="outline"
              onClick={() => setLanguage(language === 'en' ? 'hi' : 'en')}
              title={`Switch to ${language === 'en' ? 'Hindi' : 'English'}`}
              className="h-9 w-9 flex-shrink-0"
            >
              <Globe className="h-4 w-4" />
            </Button>
            <Badge variant="outline" className="text-xs px-2 py-1">
              {language === 'en' ? 'EN' : 'हिं'}
            </Badge>
          </div>
          
          <div className="flex-1 flex gap-2">
            <Input
              ref={inputRef}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={language === 'en' ? "Ask about your business finances..." : "अपने व्यापार के वित्त के बारे में पूछें..."}
              className="flex-1"
              disabled={isTyping}
            />
            <Button 
              type="button" 
              size="icon" 
              variant="outline" 
              className="h-9 w-9 flex-shrink-0"
              onClick={startListening}
              disabled={isListening}
              title="Voice input"
            >
              {isListening ? <MicOff className="h-4 w-4 text-destructive" /> : <Mic className="h-4 w-4" />}
            </Button>
            <Button
              type="button"
              size="icon"
              variant="outline"
              onClick={() => setSpeechEnabled(!speechEnabled)}
              title="Toggle speech output"
              className="h-9 w-9 flex-shrink-0"
            >
              {speechEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            </Button>
            <Button 
              type="submit" 
              size="icon" 
              className="h-9 w-9 flex-shrink-0"
              disabled={!inputText.trim() || isTyping}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}