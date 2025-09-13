import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { enhancedProfileAPI, handleAPIError } from "@/lib/api";
import { User } from '@supabase/supabase-js';
import { ArrowLeft, LogOut, Bell, MessageCircle, Mail } from "lucide-react";

const Settings = () => {
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    business_name: "",
    owner_name: "",
    business_type: "",
    location: "",
    monthly_revenue: "",
    monthly_expenses: "",
    preferred_language: "",
    phone_number: "",
    notify_whatsapp: true,
    notify_email: true
  });
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate('/auth');
      return;
    }
    setUser(user);
    loadProfile(user.id);
  };

  const loadProfile = async (userId: string) => {
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
          preferred_language: data.preferred_language || "",
          phone_number: data.phone_number || "",
          notify_whatsapp: data.notify_whatsapp ?? true,
          notify_email: data.notify_email ?? true
        });
      }
    } catch (error) {
      console.error('Error in loadProfile:', error);
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
        title: "Profile updated successfully!",
        description: "Your business information has been saved.",
      });
    } catch (error) {
      console.error('Error saving profile:', error);
      toast({
        title: "Error saving profile",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      navigate('/auth');
    } catch (error) {
      console.error('Error signing out:', error);
      toast({
        title: "Error signing out",
        description: "Please try again.",
        variant: "destructive",
      });
    }
  };

  const isFormValid = formData.business_name && formData.owner_name && formData.business_type;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20 p-4">
      <div className="container mx-auto max-w-2xl">
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>
          <Button
            variant="outline"
            onClick={handleSignOut}
            className="flex items-center gap-2"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Profile Settings</CardTitle>
            <CardDescription>
              Update your business information and preferences
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="business_name">Business Name *</Label>
                  <Input
                    id="business_name"
                    value={formData.business_name}
                    onChange={(e) => handleInputChange('business_name', e.target.value)}
                    placeholder="Enter your business name"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="owner_name">Owner Name *</Label>
                  <Input
                    id="owner_name"
                    value={formData.owner_name}
                    onChange={(e) => handleInputChange('owner_name', e.target.value)}
                    placeholder="Enter owner name"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="business_type">Business Type *</Label>
                  <Select
                    value={formData.business_type}
                    onValueChange={(value) => handleInputChange('business_type', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select business type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="retail">Retail</SelectItem>
                      <SelectItem value="manufacturing">Manufacturing</SelectItem>
                      <SelectItem value="services">Services</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    placeholder="Enter your location"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="monthly_revenue">Monthly Revenue (₹)</Label>
                  <Input
                    id="monthly_revenue"
                    type="number"
                    value={formData.monthly_revenue}
                    onChange={(e) => handleInputChange('monthly_revenue', e.target.value)}
                    placeholder="Enter monthly revenue"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="monthly_expenses">Monthly Expenses (₹)</Label>
                  <Input
                    id="monthly_expenses"
                    type="number"
                    value={formData.monthly_expenses}
                    onChange={(e) => handleInputChange('monthly_expenses', e.target.value)}
                    placeholder="Enter monthly expenses"
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="preferred_language">Preferred Language</Label>
                  <Select
                    value={formData.preferred_language}
                    onValueChange={(value) => handleInputChange('preferred_language', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select preferred language" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="english">English</SelectItem>
                      <SelectItem value="hindi">Hindi</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {user && (
                <div className="space-y-2">
                  <Label>Email (cannot be changed)</Label>
                  <Input
                    value={user.email || ""}
                    disabled
                    className="bg-muted"
                  />
                </div>
              )}

              <Button
                type="submit"
                className="w-full"
                disabled={!isFormValid || loading}
              >
                {loading ? "Saving..." : "Save Profile"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notification Settings
            </CardTitle>
            <CardDescription>
              Configure your daily earnings reminders and preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2 opacity-50">
              <Label htmlFor="phone_number">WhatsApp Number (Disabled)</Label>
              <Input
                id="phone_number"
                value={formData.phone_number}
                onChange={(e) => handleInputChange('phone_number', e.target.value)}
                placeholder="+91XXXXXXXXXX"
                type="tel"
                disabled={true}
              />
              <p className="text-xs text-muted-foreground">
                WhatsApp functionality disabled until hosting is available
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between opacity-50">
                <div className="space-y-0.5">
                  <Label className="flex items-center gap-2">
                    <MessageCircle className="h-4 w-4" />
                    WhatsApp Reminders
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    WhatsApp reminders disabled until hosting is available
                  </p>
                </div>
                <Switch
                  checked={false}
                  disabled={true}
                  onCheckedChange={() => {}}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Email Reminders
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Get daily reminders to record your earnings via email
                  </p>
                </div>
                <Switch
                  checked={formData.notify_email}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, notify_email: checked }))}
                />
              </div>
            </div>

            <div className="bg-muted/50 p-4 rounded-lg">
              <h4 className="font-medium mb-2">💡 CFO Tip: Daily Tracking</h4>
              <p className="text-sm text-muted-foreground">
                Successful businesses track daily earnings. Enable reminders to build a consistent habit and never miss recording your financial data.
              </p>
            </div>

            <Button
              onClick={handleSubmit}
              className="w-full"
              disabled={loading}
            >
              {loading ? "Saving..." : "Save Notification Settings"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Settings;