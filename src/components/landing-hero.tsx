import { Button } from "@/components/ui/button";
import { ArrowRight, Play, CheckCircle } from "lucide-react";
import heroImage from "@/assets/hero-image.jpg";
import { useNavigate } from "react-router-dom";

export function LandingHero() {
  const navigate = useNavigate();
  
  const benefits = [
    "AI-powered financial analysis",
    "WhatsApp integration for easy access", 
    "Real-time business insights",
    "Cost savings identification"
  ];

  return (
    <section className="relative min-h-screen flex items-center justify-center bg-gradient-hero overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-black/20"></div>
      <div className="absolute inset-0 bg-white/5 opacity-50" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
      }}></div>
      
      <div className="relative z-10 container mx-auto px-4 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="space-y-8 text-center lg:text-left">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 text-white text-sm">
                <span className="w-2 h-2 bg-success rounded-full animate-pulse"></span>
                Now Live in India
              </div>
              
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight">
                From WhatsApp Messages to{" "}
                <span className="text-yellow-300">CFO-Level Insights</span>
                {" "}in 60 Seconds
              </h1>
              
              <p className="text-xl lg:text-2xl text-white/90 leading-relaxed">
                AI-powered financial intelligence for India's 65M+ small businesses. 
                Like having a personal CFO who speaks your language.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-3">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-center gap-3 text-white/90">
                  <CheckCircle className="h-5 w-5 text-success flex-shrink-0" />
                  <span className="text-sm">{benefit}</span>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button 
                size="lg" 
                className="bg-white text-primary hover:bg-white/90 h-12 px-8"
                onClick={() => navigate("/auth")}
              >
                Start Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              
              <Button 
                size="lg" 
                variant="outline" 
                className="h-12 px-8 border-white/30 text-white hover:bg-white/10"
              >
                <Play className="mr-2 h-5 w-5" />
                Watch Demo
              </Button>
            </div>

            <div className="pt-4">
              <p className="text-white/70 text-sm">
                <strong className="text-warning">90% of small businesses</strong> lack financial expertise, 
                losing <strong className="text-warning">₹2L+ annually</strong>
              </p>
            </div>
          </div>

          {/* Hero Image */}
          <div className="relative">
            <div className="relative overflow-hidden rounded-2xl shadow-2xl bg-white/10 backdrop-blur-sm border border-white/20">
              <img
                src={heroImage}
                alt="VirtualCFO in action - Indian business owner using AI financial assistant"
                className="w-full h-auto object-cover"
              />
              
              {/* Overlay with sample chat */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
              
              <div className="absolute bottom-6 left-6 right-6">
                <div className="bg-white/95 backdrop-blur-sm rounded-lg p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
                    <span className="text-xs font-medium text-muted-foreground">AI Analysis Complete</span>
                  </div>
                  
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Monthly Profit Analysis</p>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">This Month</span>
                      <span className="font-semibold text-success">₹75,000 (+15%)</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div className="bg-success h-2 rounded-full" style={{ width: "75%" }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating elements */}
            <div className="absolute -top-4 -right-4 bg-success text-white rounded-full p-3 shadow-lg animate-bounce">
              <span className="text-sm font-bold">₹</span>
            </div>
            
            <div className="absolute -bottom-4 -left-4 bg-warning text-white rounded-full p-3 shadow-lg" style={{ animationDelay: "1s" }}>
              <span className="text-sm font-bold">AI</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}