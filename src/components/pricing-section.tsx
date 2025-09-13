import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Check, Star, Smartphone } from "lucide-react";

interface PricingSectionProps {
  onDemoClick?: () => void;
}

export function PricingSection({ onDemoClick }: PricingSectionProps) {
  const plans = [
    {
      name: "Free Plan",
      price: "₹0",
      period: "/month",
      description: "Perfect for trying out VirtualCFO",
      features: [
        "5 queries per month",
        "Basic document upload",
        "Simple expense analysis",
        "Cash flow overview",
        "Email support"
      ],
      cta: "Start Free",
      popular: false,
      highlight: null
    },
    {
      name: "Starter Plan",
      price: "₹499",
      period: "/month",
      description: "Complete financial intelligence for growing businesses",
      features: [
        "Unlimited queries",
        "All features included",
        "WhatsApp integration",
        "Industry benchmarking",
        "Global impact alerts",
        "Profit optimization",
        "15-day cash flow forecast",
        "Priority chat support"
      ],
      cta: "Start 14-day Free Trial",
      popular: true,
      highlight: "Most Popular"
    },
    {
      name: "Professional Plan",
      price: "₹1,499",
      period: "/month",
      description: "For serious businesses wanting advanced features",
      features: [
        "Everything in Starter",
        "GST filing assistance",
        "Advanced financial reports",
        "Multi-location support",
        "Team collaboration",
        "Custom alerts & automation",
        "Dedicated account manager",
        "Phone support"
      ],
      cta: "Contact Sales",
      popular: false,
      highlight: "Best Value"
    }
  ];

  return (
    <section id="pricing" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold mb-6">
            Transparent Pricing for Every Business Size
          </h2>
          <p className="text-lg text-muted-foreground">
            Choose the plan that fits your business. All plans include our core AI CFO capabilities.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <Card 
              key={index}
              className={`p-8 relative ${
                plan.popular 
                  ? 'border-primary shadow-lg scale-105 bg-card' 
                  : 'border-border bg-card'
              } card-hover`}
            >
              {plan.highlight && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <div className="bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                    {plan.popular ? <Star className="h-3 w-3" /> : null}
                    {plan.highlight}
                  </div>
                </div>
              )}

              <div className="text-center mb-8">
                <h3 className="text-xl font-semibold mb-2">{plan.name}</h3>
                <div className="flex items-baseline justify-center gap-1 mb-2">
                  <span className="text-3xl font-bold">{plan.price}</span>
                  <span className="text-muted-foreground">{plan.period}</span>
                </div>
                <p className="text-sm text-muted-foreground">{plan.description}</p>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-start gap-3">
                    <Check className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button 
                className={`w-full ${
                  plan.popular 
                    ? 'bg-gradient-primary hover:opacity-90' 
                    : plan.name === 'Free Plan'
                    ? 'bg-secondary hover:bg-secondary/80'
                    : 'bg-primary hover:bg-primary/90'
                }`}
                onClick={onDemoClick}
              >
                {plan.cta}
              </Button>
            </Card>
          ))}
        </div>

        {/* Value Proposition */}
        <div className="text-center mt-16">
          <div className="bg-card rounded-lg p-8 max-w-4xl mx-auto border">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Smartphone className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold">WhatsApp Integration Included</h3>
            </div>
            <p className="text-muted-foreground mb-6">
              Get all features directly on WhatsApp. No app downloads, no training needed. 
              Just send a photo and get insights.
            </p>
            <div className="flex flex-wrap justify-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-success" />
                <span>Upload photos via WhatsApp</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-success" />
                <span>Voice queries in Hindi/English</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-success" />
                <span>Instant reports delivered</span>
              </div>
            </div>
          </div>
        </div>

        {/* Money Back Guarantee */}
        <div className="text-center mt-12">
          <div className="bg-success/10 border border-success/20 rounded-lg p-6 max-w-2xl mx-auto">
            <h4 className="font-semibold text-success mb-2">30-Day Money Back Guarantee</h4>
            <p className="text-sm text-muted-foreground">
              If VirtualCFO doesn't save you at least ₹1,000 in the first month, we'll refund every rupee.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}