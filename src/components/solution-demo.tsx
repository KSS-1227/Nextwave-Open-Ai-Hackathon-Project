import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Camera, MessageSquare, BarChart3, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

export function SolutionDemo() {
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    {
      id: 0,
      icon: MessageSquare,
      title: "The Problem",
      description: "Rajesh's Electronics: Profits dropped 30% but doesn't know why",
      image: "📱",
      content: "\"My shop used to make good profit, but now I'm barely breaking even. I don't understand what's happening to my money.\""
    },
    {
      id: 1,
      icon: Camera,
      title: "Simple Upload",
      description: "Takes photo of sales register on phone",
      image: "📸",
      content: "Just snap a photo of your handwritten ledger, bank statement, or any financial document. VirtualCFO reads everything."
    },
    {
      id: 2,
      icon: BarChart3,
      title: "AI Analysis",
      description: "VirtualCFO analyzes in 60 seconds",
      image: "🔍",
      content: "Our AI processes your data instantly, comparing with industry benchmarks and identifying hidden patterns."
    },
    {
      id: 3,
      icon: TrendingUp,
      title: "Actionable Insights",
      description: "Get specific recommendations with expected savings",
      image: "💡",
      content: "\"Your inventory turnover is 3.2x vs industry standard 5.1x. Reduce XYZ inventory by 40% to save ₹15,000/month. Here's exactly how...\""
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % steps.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold mb-6">
            Meet Your AI CFO - Rajesh's Electronics Story
          </h2>
          <p className="text-lg text-muted-foreground">
            See how VirtualCFO transformed a struggling electronics shop into a profitable business in just 60 seconds.
          </p>
        </div>

        <div className="max-w-6xl mx-auto">
          {/* Step Indicators */}
          <div className="flex justify-center mb-12">
            <div className="flex items-center gap-4 bg-card rounded-full p-2 border">
              {steps.map((step, index) => {
                const IconComponent = step.icon;
                return (
                  <button
                    key={step.id}
                    onClick={() => setActiveStep(index)}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 rounded-full transition-all touch-target",
                      activeStep === index
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <IconComponent className="h-4 w-4" />
                    <span className="hidden sm:inline text-sm">{step.title}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Demo Content */}
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Visual */}
            <div className="order-2 lg:order-1">
              <Card className="p-8 text-center bg-gradient-to-br from-primary/5 to-success/5 border-primary/20">
                <div className="text-6xl mb-6">{steps[activeStep].image}</div>
                <h3 className="text-xl font-semibold mb-4">{steps[activeStep].title}</h3>
                <p className="text-muted-foreground">{steps[activeStep].description}</p>
              </Card>
            </div>

            {/* Content */}
            <div className="order-1 lg:order-2">
              <div className="bg-card rounded-lg p-8 border">
                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <span className="text-sm font-bold">Step {activeStep + 1}</span>
                    </div>
                    <h4 className="text-lg font-semibold">{steps[activeStep].title}</h4>
                  </div>
                  
                  <div className="bg-muted/50 rounded-lg p-4 border-l-4 border-primary">
                    <p className="text-sm leading-relaxed italic">
                      {steps[activeStep].content}
                    </p>
                  </div>

                  {activeStep === 3 && (
                    <div className="pt-4">
                      <Button className="w-full bg-gradient-primary hover:opacity-90">
                        See Your Business Analysis
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="flex justify-center mt-12">
            <div className="w-64 h-2 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-primary transition-all duration-1000"
                style={{ width: `${((activeStep + 1) / steps.length) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}