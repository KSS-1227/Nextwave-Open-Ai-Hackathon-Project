import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  MessageCircle, 
  X, 
  Send, 
  Mic, 
  Volume2, 
  VolumeX, 
  MicOff,
  HelpCircle,
  User,
  Bot,
  Home,
  DollarSign,
  MessageSquare,
  Upload,
  BarChart3,
  Eye,
  TrendingUp,
  UserCircle,
  Phone,
  Settings,
  FileText,
  Zap,
  PiggyBank,
  AlertTriangle
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  text: string;
  type: "user" | "bot";
  timestamp: Date;
}

// Type for SpeechRecognition event
interface SpeechRecognitionEvent extends Event {
  results: {
    [key: number]: {
      [key: number]: {
        transcript: string;
      };
    };
  };
}

// Type for SpeechRecognition
interface SpeechRecognition extends EventTarget {
  lang: string;
  onstart: (() => void) | null;
  onend: (() => void) | null;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  start: () => void;
}

const projectKnowledgeBase = {
  sections: {
    "overview": {
      name: "Overview",
      description: "The Overview section shows your business health score, key financial metrics like revenue, expenses, cash flow, and profit margin. It also displays AI-generated insights and action items.",
      icon: Home,
      dataStored: "Business health score, key financial metrics (revenue, expenses, cash flow, profit margin), AI-generated insights, action items"
    },
    "daily earnings": {
      name: "Daily Earnings",
      description: "The Daily Earnings section allows you to record your daily income and expenses. You can add entries manually or upload documents. It helps track your business performance day-by-day.",
      icon: DollarSign,
      dataStored: "Daily income records, expense entries, document uploads, transaction history"
    },
    "ai assistant": {
      name: "AI Assistant",
      description: "The AI Assistant is your virtual CFO that can answer questions about your finances, provide insights, and suggest improvements based on your data. It uses advanced AI to analyze your financial patterns and provide personalized recommendations.",
      icon: MessageSquare,
      dataStored: "Conversation history, financial queries, AI-generated responses, personalized recommendations"
    },
    "upload": {
      name: "Upload",
      description: "The Upload section lets you upload financial documents like receipts, invoices, and bank statements for processing and analysis. Our AI automatically extracts key information and categorizes expenses.",
      icon: Upload,
      dataStored: "Uploaded financial documents, extracted data, categorized expenses, document processing status"
    },
    "advanced": {
      name: "Advanced",
      description: "The Advanced section provides detailed analytics, trend analysis, forecasting, and comprehensive financial reports. It offers deeper insights into your business performance with visual charts and predictive modeling.",
      icon: BarChart3,
      dataStored: "Detailed analytics data, trend analysis results, forecasting models, comprehensive reports"
    },
    "reports": {
      name: "Reports",
      description: "The Reports section generates professional financial reports including profit & loss statements, GST reports, and other required documentation. You can customize date ranges and export in various formats.",
      icon: FileText,
      dataStored: "Generated financial reports, profit & loss statements, GST reports, export history"
    },
    "insights": {
      name: "Insights",
      description: "The Insights section shows detailed AI-generated recommendations for improving your business performance and financial health. It highlights opportunities, alerts, and predictions based on your data.",
      icon: Eye,
      dataStored: "AI-generated insights, business recommendations, alerts, predictions, opportunity assessments"
    },
    "business trends": {
      name: "Business Trends",
      description: "The Business Trends section analyzes market trends and provides sector-specific insights to help grow your business. It compares your performance with industry benchmarks and identifies growth opportunities.",
      icon: TrendingUp,
      dataStored: "Market trend analysis, sector-specific insights, industry benchmark comparisons, growth opportunity data"
    },
    "profile": {
      name: "Profile",
      description: "The Profile section allows you to manage your business information, preferences, and notification settings. You can update your business details, contact information, and customize your VirtualCFO experience.",
      icon: UserCircle,
      dataStored: "Business information, contact details, notification preferences, account settings"
    },
    "contact": {
      name: "Contact",
      description: "The Contact section provides ways to reach out to our support team for assistance. You can email us, message on WhatsApp, or fill out the contact form for personalized help.",
      icon: Phone,
      dataStored: "Support requests, contact form submissions, communication history with support team"
    },
    "settings": {
      name: "Settings",
      description: "The Settings section lets you configure your account preferences, notification settings, and other personalization options. You can manage security settings, data privacy, and customize dashboard views.",
      icon: Settings,
      dataStored: "Account preferences, notification settings, security configurations, dashboard customizations"
    }
  },
  features: {
    "business health": {
      name: "Business Health",
      description: "Your business health score is calculated based on your profit margin, cash flow, expense management, and growth trends. A score above 70 is considered healthy. The system continuously monitors your financial metrics to provide real-time health assessments.",
      dataStored: "Health score calculations, metric assessments, trend analysis, health history"
    },
    "ai insights": {
      name: "AI Insights",
      description: "Our AI analyzes your financial data to provide actionable insights, cost-saving opportunities, and growth recommendations tailored to your business. It uses advanced algorithms to identify patterns and predict future performance.",
      dataStored: "AI analysis results, cost-saving opportunities, growth recommendations, pattern identification"
    },
    "document processing": {
      name: "Document Processing",
      description: "Upload financial documents and our AI will extract key information, categorize expenses, and update your records automatically. Supports various formats including PDF, JPG, PNG, and TXT with OCR technology for image-based documents.",
      dataStored: "Processed document data, extracted information, categorized expenses, processing logs"
    },
    "notifications": {
      name: "Notifications",
      description: "Enable email and WhatsApp notifications to receive daily reminders to update your earnings and important financial alerts. Customize notification preferences to receive updates on specific metrics or events.",
      dataStored: "Notification preferences, alert history, reminder settings, communication logs"
    },
    "reporting": {
      name: "Reporting",
      description: "Generate professional financial reports for tax filing, investor presentations, or business analysis with just a few clicks. Reports include profit & loss statements, GST reports, and customizable financial summaries.",
      dataStored: "Generated reports, report templates, export history, customization preferences"
    },
    "cash flow": {
      name: "Cash Flow Management",
      description: "Monitor and manage your cash flow with detailed tracking of income and expenses. The system provides cash flow forecasts and alerts for potential liquidity issues to help maintain healthy working capital.",
      dataStored: "Cash flow tracking data, forecast models, liquidity alerts, working capital metrics"
    },
    "profit analysis": {
      name: "Profit Analysis",
      description: "Analyze your profit margins across different products, services, or time periods. Identify high-performing areas and opportunities for improvement with detailed breakdowns and trend analysis.",
      dataStored: "Profit margin data, product/service performance, trend analysis, improvement recommendations"
    },
    "expense tracking": {
      name: "Expense Tracking",
      description: "Track and categorize all business expenses with detailed breakdowns by category, vendor, or project. Set budget limits and receive alerts when expenses approach or exceed thresholds.",
      dataStored: "Expense records, category breakdowns, budget limits, alert history"
    }
  },
  faqs: {
    "how to record daily earnings": {
      question: "How to record daily earnings?",
      answer: "Go to the Daily Earnings section and click 'Add Entry'. Enter the date, income amount, and inventory cost. You can also upload a receipt or invoice. For regular entries, you can save templates for quick recording."
    },
    "how to upload documents": {
      question: "How to upload documents?",
      answer: "Navigate to the Upload section and click 'Choose File' or drag and drop your document. Supported formats include PDF, JPG, PNG, and TXT. Our AI will automatically process the document and extract relevant financial information."
    },
    "how to view reports": {
      question: "How to view reports?",
      answer: "Go to the Reports section and select the type of report you need. You can customize the date range and export in PDF or Excel format. Reports include profit & loss statements, GST reports, and other required documentation."
    },
    "how to contact support": {
      question: "How to contact support?",
      answer: "Visit the Contact section to email us, message on WhatsApp, or fill out the contact form. We typically respond within 24 hours. For urgent issues, you can call our support hotline during business hours."
    },
    "how to improve business health": {
      question: "How to improve business health?",
      answer: "Focus on increasing profit margins by optimizing pricing and reducing unnecessary expenses. Maintain positive cash flow by collecting receivables promptly and managing inventory efficiently. Regularly review AI insights for personalized recommendations."
    },
    "what data is stored": {
      question: "What data is stored?",
      answer: "We store your business financial data including income, expenses, documents, and reports. All data is encrypted and stored securely in compliance with GST regulations. We never share your data with third parties without your consent."
    }
  },
  dataStorage: {
    "financial records": {
      description: "All income and expense records are stored with timestamps, categories, and associated metadata. This includes manually entered data and information extracted from uploaded documents.",
      retention: "Indefinitely unless deleted by user"
    },
    "documents": {
      description: "Uploaded financial documents are processed and stored securely. Extracted data is linked to your records while original documents are retained for compliance purposes.",
      retention: "7 years for tax compliance"
    },
    "ai insights": {
      description: "AI-generated insights and recommendations are stored to track patterns and improve future analysis. This includes conversation history with the AI assistant.",
      retention: "Indefinitely to improve AI accuracy"
    },
    "reports": {
      description: "Generated reports are stored for future reference and compliance. You can access historical reports and track changes in your financial performance over time.",
      retention: "Indefinitely unless deleted by user"
    }
  }
};

export function SupportChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Hello! I'm your VirtualCFO support assistant. I can help you navigate the platform, explain features, and answer questions about how your financial data is stored and managed. What would you like to know?",
      type: "bot",
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [speechEnabled, setSpeechEnabled] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const findRelevantInfo = (query: string): string => {
    const lowerQuery = query.toLowerCase();
    
    // Check sections
    for (const [sectionKey, section] of Object.entries(projectKnowledgeBase.sections)) {
      if (lowerQuery.includes(sectionKey.toLowerCase()) || lowerQuery.includes(section.name.toLowerCase())) {
        return `🤖 VIRTUAL CFO SECTION GUIDE
========================

📋 SECTION: ${section.name}
${'='.repeat(10 + section.name.length)}

📊 DESCRIPTION
${section.description}

💾 DATA STORED
${section.dataStored}

💡 TIP
Navigate to this section using the sidebar menu for detailed insights.`;
      }
    }
    
    // Check features
    for (const [featureKey, feature] of Object.entries(projectKnowledgeBase.features)) {
      if (lowerQuery.includes(featureKey) || lowerQuery.includes(feature.name.toLowerCase())) {
        return `🤖 FEATURE OVERVIEW
=================

📋 FEATURE: ${feature.name}
${'='.repeat(10 + feature.name.length)}

📊 DESCRIPTION
${feature.description}

💾 DATA STORED
${feature.dataStored}`;
      }
    }
    
    // Check FAQs
    for (const [faqKey, faq] of Object.entries(projectKnowledgeBase.faqs)) {
      if (lowerQuery.includes(faqKey) || lowerQuery.includes(faq.question.toLowerCase())) {
        return `❓ FAQ: ${faq.question}
${'='.repeat(6 + faq.question.length)}

💡 ANSWER
${faq.answer}`;
      }
    }
    
    // Check data storage
    for (const [dataKey, dataInfo] of Object.entries(projectKnowledgeBase.dataStorage)) {
      if (lowerQuery.includes(dataKey) || lowerQuery.includes("data") || lowerQuery.includes("storage")) {
        return `🔒 DATA STORAGE POLICY
===================

📋 CATEGORY: ${dataKey.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}

📊 DESCRIPTION
${dataInfo.description}

📅 RETENTION
${dataInfo.retention}`;
      }
    }
    
    // General responses
    if (lowerQuery.includes("hello") || lowerQuery.includes("hi") || lowerQuery.includes("hey")) {
      return `👋 WELCOME TO VIRTUAL CFO!
=====================

🤖 I'm your VirtualCFO support assistant.

💡 HOW I CAN HELP
• Explain platform sections and features
• Guide you through data storage policies
• Answer common questions
• Provide navigation assistance

❓ WHAT WOULD YOU LIKE TO KNOW?`;
    }
    
    if (lowerQuery.includes("thank")) {
      return `😊 YOU'RE WELCOME!
===============

Is there anything else I can help you with regarding the VirtualCFO platform?`;
    }
    
    if (lowerQuery.includes("bye") || lowerQuery.includes("goodbye")) {
      return `👋 GOODBYE!
========

Feel free to reach out if you need any more assistance with VirtualCFO.`;
    }
    
    if (lowerQuery.includes("cash flow")) {
      const cashFlowFeature = projectKnowledgeBase.features["cash flow"];
      return `📊 CASH FLOW MANAGEMENT
====================

${cashFlowFeature.description}

💾 DATA STORED
${cashFlowFeature.dataStored}`;
    }
    
    if (lowerQuery.includes("profit")) {
      const profitFeature = projectKnowledgeBase.features["profit analysis"];
      return `📈 PROFIT ANALYSIS
================

${profitFeature.description}

💾 DATA STORED
${profitFeature.dataStored}`;
    }
    
    if (lowerQuery.includes("expense")) {
      const expenseFeature = projectKnowledgeBase.features["expense tracking"];
      return `💰 EXPENSE TRACKING
==================

${expenseFeature.description}

💾 DATA STORED
${expenseFeature.dataStored}`;
    }
    
    return `🤖 VIRTUAL CFO SUPPORT
====================

I can help you with questions about the VirtualCFO platform.

📋 AVAILABLE TOPICS
• Platform sections (Overview, Daily Earnings, etc.)
• Key features (Business Health, AI Insights, etc.)
• Data storage and privacy policies
• Common questions and troubleshooting

❓ WHAT WOULD YOU LIKE TO KNOW?`;
  };

  const handleSendMessage = () => {
    if (!inputText.trim()) return;
    
    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText.trim(),
      type: "user",
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputText("");
    
    // Simulate bot response after a short delay
    setTimeout(() => {
      const botResponseText = findRelevantInfo(inputText);
      
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: botResponseText,
        type: "bot",
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, botMessage]);
      
      // Text-to-speech for bot responses
      if (speechEnabled) {
        const utterance = new SpeechSynthesisUtterance(botResponseText);
        utterance.lang = 'en-US';
        speechSynthesis.speak(utterance);
      }
    }, 1000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage();
  };

  const startListening = () => {
    if ('webkitSpeechRecognition' in window) {
      const SpeechRecognitionConstructor = (window as unknown as { webkitSpeechRecognition: new () => SpeechRecognition }).webkitSpeechRecognition;
      const recognition = new SpeechRecognitionConstructor();
      recognition.lang = 'en-US';
      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onresult = (event: SpeechRecognitionEvent) => {
        const transcript = event.results[0][0].transcript;
        setInputText(transcript);
      };
      recognition.start();
    }
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  if (!isOpen) {
    return (
      <Button
        onClick={toggleChat}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg z-50"
        size="icon"
      >
        <MessageCircle className="h-6 w-6" />
      </Button>
    );
  }

  return (
    <Card className="fixed bottom-6 right-6 w-80 h-96 shadow-lg z-50 flex flex-col">
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-primary text-primary-foreground">
              <HelpCircle className="h-4 w-4" />
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-semibold text-sm">Support Assistant</h3>
            <p className="text-xs text-muted-foreground">VirtualCFO Help</p>
          </div>
        </div>
        <Button
          onClick={toggleChat}
          variant="ghost"
          size="icon"
          className="h-8 w-8"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
      
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex gap-2",
                message.type === "user" ? "justify-end" : "justify-start"
              )}
            >
              {message.type === "bot" && (
                <Avatar className="h-6 w-6">
                  <AvatarFallback className="bg-muted text-muted-foreground text-xs">
                    <Bot className="h-3 w-3" />
                  </AvatarFallback>
                </Avatar>
              )}
              <div
                className={cn(
                  "max-w-[80%] rounded-lg px-3 py-2 text-sm",
                  message.type === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted"
                )}
              >
                {message.text}
              </div>
              {message.type === "user" && (
                <Avatar className="h-6 w-6">
                  <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                    <User className="h-3 w-3" />
                  </AvatarFallback>
                </Avatar>
              )}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>
      
      <div className="p-4 border-t">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <div className="flex gap-1">
            <Button
              type="button"
              size="icon"
              variant="outline"
              onClick={startListening}
              disabled={isListening}
              title="Voice input"
              className="h-8 w-8"
            >
              {isListening ? <MicOff className="h-3 w-3 text-destructive" /> : <Mic className="h-3 w-3" />}
            </Button>
            <Button
              type="button"
              size="icon"
              variant="outline"
              onClick={() => setSpeechEnabled(!speechEnabled)}
              title="Toggle speech output"
              className="h-8 w-8"
            >
              {speechEnabled ? <Volume2 className="h-3 w-3" /> : <VolumeX className="h-3 w-3" />}
            </Button>
          </div>
          
          <div className="flex-1 flex gap-2">
            <Input
              ref={inputRef}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Ask about VirtualCFO features..."
              className="h-8 text-sm"
            />
            <Button 
              type="submit" 
              size="icon" 
              className="h-8 w-8"
              disabled={!inputText.trim()}
            >
              <Send className="h-3 w-3" />
            </Button>
          </div>
        </form>
      </div>
    </Card>
  );
}