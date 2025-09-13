import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
  Building, 
  User, 
  MapPin, 
  IndianRupee, 
  Mail, 
  Calendar,
  Edit,
  Globe
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

interface ProfileData {
  business_name?: string;
  owner_name?: string;
  business_type?: string;
  location?: string;
  monthly_revenue?: number;
  monthly_expenses?: number;
  preferred_language?: string;
  created_at?: string;
}

interface User {
  email?: string;
  created_at?: string;
}

export function ProfileView() {
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [userData, setUserData] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadProfileData();
  }, []);

  const loadProfileData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      setUserData(user);

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      setProfileData(profile);
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/3 mb-4"></div>
          <div className="h-40 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  const formatCurrency = (amount?: number) => {
    if (!amount) return "Not set";
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Profile</h2>
          <p className="text-muted-foreground">View and manage your business information</p>
        </div>
        <Button onClick={() => navigate('/settings')} className="flex items-center gap-2">
          <Edit className="h-4 w-4" />
          Edit Profile
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Business Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5 text-primary" />
              Business Information
            </CardTitle>
            <CardDescription>Your business details and settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Business Name</label>
                <p className="text-lg font-semibold">{profileData?.business_name || "Not set"}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-muted-foreground">Owner Name</label>
                <p className="text-lg">{profileData?.owner_name || "Not set"}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">Business Type</label>
                <div className="mt-1">
                  {profileData?.business_type ? (
                    <Badge variant="secondary" className="capitalize">
                      {profileData.business_type}
                    </Badge>
                  ) : (
                    <span className="text-muted-foreground">Not set</span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Location</label>
                  <p>{profileData?.location || "Not set"}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-muted-foreground" />
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Preferred Language</label>
                  <p>{profileData?.preferred_language || "Not set"}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Financial Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IndianRupee className="h-5 w-5 text-primary" />
              Financial Overview
            </CardTitle>
            <CardDescription>Your monthly financial information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-success/10 rounded-lg">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Monthly Revenue</label>
                  <p className="text-lg font-semibold text-success">
                    {formatCurrency(profileData?.monthly_revenue)}
                  </p>
                </div>
              </div>

              <div className="flex justify-between items-center p-3 bg-destructive/10 rounded-lg">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Monthly Expenses</label>
                  <p className="text-lg font-semibold text-destructive">
                    {formatCurrency(profileData?.monthly_expenses)}
                  </p>
                </div>
              </div>

              {profileData?.monthly_revenue && profileData?.monthly_expenses && (
                <div className="flex justify-between items-center p-3 bg-primary/10 rounded-lg">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Net Profit</label>
                    <p className="text-lg font-semibold text-primary">
                      {formatCurrency(profileData.monthly_revenue - profileData.monthly_expenses)}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Account Information */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              Account Information
            </CardTitle>
            <CardDescription>Your account details and security settings</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Email Address</label>
                  <p>{userData?.email || "Not available"}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Member Since</label>
                  <p>{formatDate(userData?.created_at)}</p>
                </div>
              </div>
            </div>

            <Separator className="my-4" />
            
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Profile Completion</p>
                <p className="text-sm text-muted-foreground">
                  {profileData?.business_name && profileData?.owner_name ? 
                    "Your profile is complete" : 
                    "Complete your profile to unlock all features"
                  }
                </p>
              </div>
              <Badge variant={profileData?.business_name && profileData?.owner_name ? "default" : "secondary"}>
                {profileData?.business_name && profileData?.owner_name ? "Complete" : "Incomplete"}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}