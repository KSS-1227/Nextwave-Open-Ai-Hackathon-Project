import { MessageSquare, Search, TrendingUp, DollarSign, BarChart3, Globe, Smartphone, Users, Lightbulb } from "lucide-react";

export function FeaturesSection() {
  const features = [
    {
      icon: MessageSquare,
      title: "Ask Your CFO",
      description: "Natural language financial queries in Hindi/English. \"Mera profit kitna hai?\" gets instant, detailed answers.",
      highlight: "Hindi + English"
    },
    {
      icon: Search,
      title: "Expense Detective",
      description: "Find hidden cost leaks automatically. Discover where your money is really going and stop unnecessary bleeding.",
      highlight: "Auto-Detection"
    },
    {
      icon: TrendingUp,
      title: "Profit Optimizer",
      description: "Get specific recommendations to improve margins. Each suggestion comes with expected savings and implementation steps.",
      highlight: "Action-Ready"
    },
    {
      icon: DollarSign,
      title: "Cash Flow Prophet",
      description: "Predict future financial position. Know exactly when you'll face cash crunches or have surplus to invest.",
      highlight: "15-Day Forecast"
    },
    {
      icon: BarChart3,
      title: "Industry Benchmarks",
      description: "Compare with similar businesses in your area. Know if your margins, turnover, and costs are competitive.",
      highlight: "Local Data"
    },
    {
      icon: Globe,
      title: "Global Impact Alerts",
      description: "Track tariffs, supply chain disruptions affecting your products. Stay ahead of cost changes and opportunities.",
      highlight: "Real-Time"
    },
    {
      icon: Smartphone,
      title: "WhatsApp Integration",
      description: "Get insights directly on WhatsApp. Upload photos, ask questions, receive reports - all without leaving your chat.",
      highlight: "Zero App Switch"
    }
  ];

  return (
    <section id="features" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold mb-6">
            Everything You Need to Run a Profitable Business
          </h2>
          <p className="text-lg text-muted-foreground">
            Stop guessing about your finances. Get CFO-level insights that actually help you make more money.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {features.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <div 
                key={index} 
                className="bg-card rounded-lg p-6 card-hover border group"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                    <IconComponent className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold">{feature.title}</h3>
                      <span className="text-xs bg-success/10 text-success px-2 py-1 rounded-full">
                        {feature.highlight}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="text-center mt-16">
          <div className="bg-gradient-to-r from-primary/5 to-success/5 rounded-lg p-8 max-w-4xl mx-auto border border-primary/20">
            <h3 className="text-xl font-semibold mb-4">
              Real Example: Electronics Shop in Mumbai
            </h3>
            <div className="grid md:grid-cols-3 gap-6 text-sm">
              <div className="text-center">
                <div className="text-2xl font-bold text-success mb-1">₹18,000</div>
                <div className="text-muted-foreground">Monthly savings identified</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary mb-1">15 min</div>
                <div className="text-muted-foreground">Time to implementation</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-warning mb-1">22%</div>
                <div className="text-muted-foreground">Profit margin improvement</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}