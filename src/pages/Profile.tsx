import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ArrowRight, Building, User, MapPin, IndianRupee, ChevronLeft } from "lucide-react";
import { User as SupabaseUser } from '@supabase/supabase-js';

export default function Profile() {
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [formData, setFormData] = useState({
    business_name: "",
    owner_name: "",
    business_type: "",
    location: "",
    monthly_revenue: "",
    monthly_expenses: "",
    preferred_language: "English"
  });
  
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkUserAndLoadProfile();
  }, []);

  const checkUserAndLoadProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate('/auth');
      return;
    }
    setUser(user);
    loadExistingProfile(user.id);
  };

  const loadExistingProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading profile:', error);
        return;
      }

      if (data) {
        setFormData({
          business_name: data.business_name || "",
          owner_name: data.owner_name || "",
          business_type: data.business_type || "",
          location: data.location || "",
          monthly_revenue: data.monthly_revenue ? data.monthly_revenue.toString() : "",
          monthly_expenses: data.monthly_expenses ? data.monthly_expenses.toString() : "",
          preferred_language: data.preferred_language || "English"
        });
      }
    } catch (error) {
      console.error("Error loading profile:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      const profileData = {
        id: user.id,
        business_name: formData.business_name,
        owner_name: formData.owner_name,
        business_type: formData.business_type,
        location: formData.location,
        monthly_revenue: formData.monthly_revenue ? parseFloat(formData.monthly_revenue) : null,
        monthly_expenses: formData.monthly_expenses ? parseFloat(formData.monthly_expenses) : null,
        preferred_language: formData.preferred_language
      };

      const { error } = await supabase
        .from('profiles')
        .upsert(profileData);

      if (error) {
        throw error;
      }

      toast({
        title: "✅ Profile saved successfully!",
        description: "Your business information has been updated."
      });

      // Redirect to dashboard after saving
      navigate("/");
    } catch (error) {
      console.error("Error saving profile:", error);
      toast({
        title: "Error saving profile",
        description: "Please try again later.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Progress Indicator */}
      <div className="bg-card border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button 
              onClick={() => navigate("/")}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
              Back
            </button>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2 text-primary font-medium">
                <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs">1</div>
                Profile
              </div>
              <div className="w-8 border-t border-border"></div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <div className="w-6 h-6 bg-muted text-muted-foreground rounded-full flex items-center justify-center text-xs">2</div>
                Dashboard
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary text-primary-foreground rounded-full mb-4">
            <Building className="h-8 w-8" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Tell us about your business</h1>
          <p className="text-muted-foreground">Help us personalize your VirtualCFO experience</p>
        </div>

        <Card className="modern-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              Business Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="business_name">Business Name *</Label>
                  <Input
                    id="business_name"
                    placeholder="e.g., Rajesh Electronics"
                    value={formData.business_name}
                    onChange={(e) => handleInputChange("business_name", e.target.value)}
                    required
                    className="focus:ring-primary"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="owner_name">Owner Name *</Label>
                  <Input
                    id="owner_name"
                    placeholder="e.g., Rajesh Kumar"
                    value={formData.owner_name}
                    onChange={(e) => handleInputChange("owner_name", e.target.value)}
                    required
                    className="focus:ring-primary"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="business_type">Business Type *</Label>
                  <Select value={formData.business_type} onValueChange={(value) => handleInputChange("business_type", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select business type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Retail">Retail</SelectItem>
                      <SelectItem value="Services">Services</SelectItem>
                      <SelectItem value="Manufacturing">Manufacturing</SelectItem>
                      <SelectItem value="Food">Food & Beverage</SelectItem>
                      <SelectItem value="E-commerce">E-commerce</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">
                    <MapPin className="h-4 w-4 inline mr-1" />
                    Location
                  </Label>
                  <Input
                    id="location"
                    placeholder="e.g., Mumbai, Maharashtra"
                    value={formData.location}
                    onChange={(e) => handleInputChange("location", e.target.value)}
                    className="focus:ring-primary"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="monthly_revenue">
                    <IndianRupee className="h-4 w-4 inline mr-1" />
                    Monthly Revenue
                  </Label>
                  <Input
                    id="monthly_revenue"
                    type="number"
                    placeholder="e.g., 500000"
                    value={formData.monthly_revenue}
                    onChange={(e) => handleInputChange("monthly_revenue", e.target.value)}
                    className="focus:ring-primary"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="monthly_expenses">
                    <IndianRupee className="h-4 w-4 inline mr-1" />
                    Monthly Expenses
                  </Label>
                  <Input
                    id="monthly_expenses"
                    type="number"
                    placeholder="e.g., 350000"
                    value={formData.monthly_expenses}
                    onChange={(e) => handleInputChange("monthly_expenses", e.target.value)}
                    className="focus:ring-primary"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="preferred_language">Preferred Language</Label>
                <Select value={formData.preferred_language} onValueChange={(value) => handleInputChange("preferred_language", value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="English">English</SelectItem>
                    <SelectItem value="Hindi">Hindi</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="pt-4">
                <Button 
                  type="submit" 
                  size="lg" 
                  className="w-full btn-primary"
                  disabled={loading || !formData.business_name || !formData.owner_name || !formData.business_type}
                >
                  {loading ? "Saving..." : "Save & Continue"}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <div className="text-center mt-6">
          <p className="text-sm text-muted-foreground">
            Your data is secure and encrypted. We never share your business information.
          </p>
        </div>
      </div>
    </div>
  );
}