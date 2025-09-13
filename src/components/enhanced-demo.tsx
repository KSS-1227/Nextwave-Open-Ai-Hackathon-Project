import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ChatBubble } from "@/components/ui/chat-bubble";
import { DemoMetric } from "@/components/ui/demo-metric";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle, 
  MessageSquare,
  Upload,
  BarChart3,
  Globe
} from "lucide-react";

interface Message {
  id: string;
  text: string;
  type: "user" | "ai";
  timestamp: string;
  actions?: string[];
}

export function EnhancedDemo() {
  const [currentMessage, setCurrentMessage] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const [showActions, setShowActions] = useState(false);

  const demoMessages: Message[] = [
    {
      id: "1",
      text: "Why are my mobile phone costs increasing?",
      type: "user",
      timestamp: "2 min ago"
    },
    {
      id: "2",
      text: `I analyzed your electronics inventory costs. Here's what's happening:

📊 **Cost Analysis:**
• Your mobile phone procurement cost up 12% in 3 months
• Industry average increase: 8%

🌍 **Global Impact Factors:**
• New 18% tariff on Chinese electronics (started Jan 2025)
• Semiconductor shortage affecting prices globally
• INR weakening against USD (+3% impact)

💡 **Immediate Actions:**
1. **Switch Suppliers**: 3 local suppliers offer 8% better rates
2. **Hedge Currency Risk**: Buy in bulk before next INR decline
3. **Product Mix**: Focus on non-tariff affected brands (Samsung, local brands)
4. **Price Adjustment**: Increase retail prices by 6% (still competitive)

💰 **Expected Impact**: Save ₹18,000/month + protect margins

🚨 **Upcoming Alerts:**
• New electronics tariffs expected in March 2025
• Festive season demand spike in 2 months - stock up now

Would you like me to help you find local suppliers or create a pricing strategy?`,
      type: "ai",
      timestamp: "1 min ago",
      actions: ["Find suppliers", "Currency hedging tips", "Competitor pricing", "Inventory planning"]
    }
  ];

  const metrics = [
    { 
      label: "Health Score", 
      value: "72", 
      unit: "/100", 
      trend: "up", 
      icon: CheckCircle,
      color: "success"
    },
    { 
      label: "Monthly Profit", 
      value: "₹45,000", 
      unit: "+15%", 
      trend: "up", 
      icon: TrendingUp,
      color: "success"
    },
    { 
      label: "Cash Flow", 
      value: "₹1,25,000", 
      unit: "positive", 
      trend: "up", 
      icon: TrendingUp,
      color: "success"
    },
    { 
      label: "Cost Alerts", 
      value: "3", 
      unit: "active", 
      trend: "neutral", 
      icon: AlertTriangle,
      color: "warning"
    }
  ];

  const sidebarItems = [
    { icon: MessageSquare, label: "Recent Conversations", active: true },
    { icon: Upload, label: "Upload Documents", active: false },
    { icon: BarChart3, label: "My Reports", active: false },
    { icon: Globe, label: "Global Impact Tracker", active: false }
  ];

  useEffect(() => {
    if (currentMessage < demoMessages.length - 1) {
      const timer = setTimeout(() => {
        setCurrentMessage(prev => prev + 1);
        if (currentMessage === 0) {
          setIsTyping(true);
          setTimeout(() => {
            setIsTyping(false);
            setShowActions(true);
          }, 3000);
        }
      }, currentMessage === 0 ? 1000 : 4000);
      return () => clearTimeout(timer);
    }
  }, [currentMessage]);

  return (
    <section id="demo" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold mb-6">
            See VirtualCFO in Action
          </h2>
          <p className="text-lg text-muted-foreground">
            Real conversation showing how VirtualCFO helps Rajesh's Electronics navigate global supply chain challenges.
          </p>
        </div>

        {/* Demo Interface */}
        <div className="max-w-7xl mx-auto">
          <Card className="overflow-hidden border-2 border-primary/20 shadow-xl">
            <div className="flex h-[600px]">
              {/* Left Sidebar */}
              <div className="w-64 bg-muted/50 border-r border-border p-4 hidden lg:block">
                <div className="space-y-2">
                  <h3 className="font-semibold text-sm text-muted-foreground mb-4">DASHBOARD</h3>
                  {sidebarItems.map((item, index) => {
                    const IconComponent = item.icon;
                    return (
                      <div 
                        key={index}
                        className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                          item.active ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        <IconComponent className="h-4 w-4" />
                        <span className="text-sm">{item.label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Center Chat */}
              <div className="flex-1 flex flex-col">
                {/* Chat Header */}
                <div className="p-4 border-b border-border bg-card">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-success rounded-full animate-pulse"></div>
                    <div>
                      <h3 className="font-semibold">AI CFO Assistant</h3>
                      <p className="text-xs text-muted-foreground">Analyzing Rajesh Electronics data...</p>
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {demoMessages.slice(0, currentMessage + 1).map((message, index) => (
                    <ChatBubble
                      key={message.id}
                      message={message.text}
                      type={message.type}
                      timestamp={message.timestamp}
                    />
                  ))}
                  
                  {isTyping && (
                    <ChatBubble
                      message=""
                      type="ai"
                      isTyping={true}
                    />
                  )}

                  {/* Action Buttons */}
                  {showActions && demoMessages[1]?.actions && (
                    <div className="flex flex-wrap gap-2 ml-11">
                      {demoMessages[1].actions.map((action, index) => (
                        <Button 
                          key={index}
                          variant="outline" 
                          size="sm"
                          className="text-xs h-8"
                        >
                          {action}
                        </Button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Right Sidebar */}
              <div className="w-80 bg-muted/30 border-l border-border p-4 hidden xl:block">
                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold text-sm text-muted-foreground mb-4">BUSINESS HEALTH</h3>
                    <div className="grid grid-cols-2 gap-3">
                      {metrics.map((metric, index) => (
                        <DemoMetric
                          key={index}
                          label={metric.label}
                          value={metric.value}
                          unit={metric.unit}
                          trend={metric.trend as "up" | "down" | "neutral"}
                          icon={metric.icon}
                          color={metric.color as "success" | "warning" | "primary"}
                        />
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-sm text-muted-foreground mb-4">QUICK ACTIONS</h3>
                    <div className="space-y-2">
                      <Button variant="outline" size="sm" className="w-full justify-start text-xs">
                        📊 Expense Breakdown
                      </Button>
                      <Button variant="outline" size="sm" className="w-full justify-start text-xs">
                        💰 Profit Optimization
                      </Button>
                      <Button variant="outline" size="sm" className="w-full justify-start text-xs">
                        🌍 Global Impact Review
                      </Button>
                    </div>
                  </div>

                  <div className="bg-card rounded-lg p-4 border">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="h-4 w-4 text-warning" />
                      <span className="text-sm font-medium">Alert</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Electronics tariff changes may affect 60% of your inventory. Review pricing strategy.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Demo Controls */}
          <div className="text-center mt-8">
            <div className="flex justify-center gap-4">
              <Button 
                variant="outline"
                onClick={() => {
                  setCurrentMessage(0);
                  setIsTyping(false);
                  setShowActions(false);
                }}
              >
                Restart Demo
              </Button>
              <Button className="bg-gradient-primary hover:opacity-90">
                Try with Your Business Data
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}