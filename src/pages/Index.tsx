import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/header";
import { LandingHero } from "@/components/landing-hero";
import { ProblemSection } from "@/components/problem-section";
import { SolutionDemo } from "@/components/solution-demo";
import { FeaturesSection } from "@/components/features-section";
import { EnhancedDemo } from "@/components/enhanced-demo";
import { PricingSection } from "@/components/pricing-section";
import { Footer } from "@/components/footer";
import { ModernDashboard } from "@/components/modern-dashboard";
import { supabase } from "@/integrations/supabase/client";
import { User } from '@supabase/supabase-js';

const Index = () => {
  const [showDashboard, setShowDashboard] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [hasProfile, setHasProfile] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    checkUserAndProfile();
  }, []);

  const checkUserAndProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      
      if (user) {
        // Check if user has a complete profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('business_name, owner_name')
          .eq('id', user.id)
          .single();
        
        if (profile && profile.business_name && profile.owner_name) {
          setHasProfile(true);
          setShowDashboard(true); // Auto-show dashboard for users with complete profiles
        }
      } else {
        // If no user, redirect to auth page
        navigate('/auth');
      }
    } catch (error) {
      console.error('Error checking user profile:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Show dashboard for users with complete profiles
  if (user && hasProfile && showDashboard) {
    return <ModernDashboard />;
  }

  const handleDemoClick = () => {
    setShowDashboard(true);
  };

  return (
    <div className="min-h-screen">
      <Header onDemoClick={handleDemoClick} />
      <LandingHero />
      <ProblemSection />
      <SolutionDemo />
      <FeaturesSection />
      <EnhancedDemo />
      <PricingSection onDemoClick={handleDemoClick} />
      <Footer />
      
      {/* Demo CTA Section */}
      <section className="py-20 bg-gradient-hero">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto space-y-8">
            <div className="space-y-4">
              <h2 className="text-3xl lg:text-4xl font-bold text-white">
                Ready to Transform Your Business?
              </h2>
              <p className="text-lg text-white/90">
                Join thousands of Indian small businesses using VirtualCFO to boost profits and make smarter financial decisions.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-8">
              <h3 className="text-xl font-semibold mb-4 text-white">Try the Interactive Demo</h3>
              <p className="text-white/80 mb-6">
                Explore Rajesh Electronics with real financial data and AI insights. See exactly how VirtualCFO works.
              </p>
              
              <button 
                onClick={() => setShowDashboard(true)}
                className="bg-white text-primary hover:bg-white/90 transition-colors font-semibold px-8 py-3 rounded-lg text-lg"
              >
                Launch Demo Dashboard
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
