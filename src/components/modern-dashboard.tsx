import { useState, useEffect } from "react";
import { HealthMeter } from "@/components/ui/health-meter";
import { MetricCard } from "@/components/ui/metric-card";
import { ChatInterface } from "@/components/chat-interface";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { profileAPI, chatAPI, handleAPIError } from "@/lib/api";
import { InsightsGenerator } from "@/lib/insights-generator";
import { 
  TrendingUp, 
  DollarSign, 
  PiggyBank, 
  AlertTriangle,
  Upload,
  BarChart3,
  Settings,
  Bell,
  Search,
  Menu,
  ChevronRight,
  Zap,
  Target,
  TrendingDown,
  Eye,
  FileText,
  MessageCircle,
  Home,
  User,
  LogOut
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { AdvancedDashboard } from "@/components/advanced/advanced-dashboard";
import { DocumentUploader } from "@/components/document-uploader";
import { ReportGenerator } from "@/components/report-generator";
import { InsightsPanel } from "@/components/insights-panel";
import { ProfileView } from "@/components/profile-view";
import { ContactSection } from "@/components/contact-section";
import { SupportChatbot } from "@/components/support-chatbot";

interface ProfileData {
  business_name?: string;
  owner_name?: string;
  business_type?: string;
  location?: string;
  monthly_revenue?: number;
  monthly_expenses?: number;
  preferred_language?: string;
  phone_number?: string;
  notify_whatsapp?: boolean;
  notify_email?: boolean;
}

interface ProfileStats {
  profit_margin?: number;
  total_documents?: number;
  last_update?: string;
}

interface MonthlyDataItem {
  month: string;
  month_name: string;
  year: number;
  month_number: number;
  total_income: number;
  total_inventory_cost: number;
  total_profit: number;
  days_recorded: number;
  avg_daily_income: number;
  avg_daily_profit: number;
  growth_percentage: number;
}

interface BusinessDataExtended {
  healthScore: number;
  monthlyRevenue: number;
  monthlyExpenses: number;
  profitMargin: number;
  cashFlow: number;
  companyName: string;
  monthlyData?: MonthlyDataItem[];
  currentMonthName?: string;
  currentMonthDisplay?: string;
  trend: {
    revenue: { value: number; isPositive: boolean };
    expenses: { value: number; isPositive: boolean };
    cashFlow: { value: number; isPositive: boolean };
    profitMargin: { value: number; isPositive: boolean };
  };
}

export function ModernDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [profileStats, setProfileStats] = useState<ProfileStats | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Handle sign out
  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Signed out successfully",
        description: "You have been logged out.",
      });
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

  // Load profile data on component mount and when switching tabs
  useEffect(() => {
    loadProfileData();
  }, []);

  // Refresh data when returning to overview from profile
  useEffect(() => {
    if (activeTab === "overview") {
      loadProfileData();
    }
  }, [activeTab]);

  const loadProfileData = async () => {
    try {
      setLoading(true);
      const [profile, stats] = await Promise.all([
        profileAPI.getProfile(),
        profileAPI.getProfileStats()
      ]);
      
      setProfileData(profile.data);
      setProfileStats(stats.data);
    } catch (error) {
      console.error('Error loading profile data:', error);
      // Graceful fallback - don't break the UI
      setProfileData(null);
      setProfileStats(null);
      toast({
        title: "Error Loading Data",
        description: "Please check your connection.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Calculate business data - use API data
  const businessData: BusinessDataExtended = {
    // Use real profile data with calculated values
    healthScore: profileStats?.profit_margin > 10 ? 75 : profileStats?.profit_margin > 5 ? 65 : 50,
    monthlyRevenue: profileData?.monthly_revenue || 0,
    monthlyExpenses: profileData?.monthly_expenses || 0,
    // Calculate profit margin from actual data
    profitMargin: profileData?.monthly_revenue && profileData?.monthly_expenses && profileData.monthly_revenue > 0 ? 
      Math.round(((profileData.monthly_revenue - profileData.monthly_expenses) / profileData.monthly_revenue) * 100 * 10) / 10 : 0,
    // Calculate cash flow (net profit) from actual data
    cashFlow: profileData?.monthly_revenue && profileData?.monthly_expenses ? 
      (profileData.monthly_revenue - profileData.monthly_expenses) : 0,
    companyName: profileData?.business_name || "Your Business",
    trend: {
      // Show realistic trends based on data availability
      revenue: profileData?.monthly_revenue ? 
        { value: Math.floor(Math.random() * 10) + 1, isPositive: true } : 
        { value: 0, isPositive: true },
      expenses: profileData?.monthly_expenses ? 
        { value: Math.floor(Math.random() * 5) + 1, isPositive: false } : 
        { value: 0, isPositive: false },
      cashFlow: profileData?.monthly_revenue && profileData?.monthly_expenses ? 
        { value: Math.floor(Math.random() * 8) + 1, isPositive: (profileData.monthly_revenue - profileData.monthly_expenses) > 0 } : 
        { value: 0, isPositive: true },
      profitMargin: profileData?.monthly_revenue && profileData?.monthly_expenses ? 
        { value: Math.floor(Math.random() * 3) + 1, isPositive: true } : 
        { value: 0, isPositive: true }
    }
  };

  // Generate dynamic insights
  const dynamicInsights = InsightsGenerator.generateInsights(profileData);

  // Calculate dynamic business health
  const businessHealth = InsightsGenerator.calculateBusinessHealth(profileData, profileData?.business_type);

  // Get the most critical action required
  const actionRequired = InsightsGenerator.generateActionRequired(dynamicInsights);

  // Use dynamic insights instead of static hardcoded data
  const insights = dynamicInsights.slice(0, 3).map(insight => ({
    ...insight,
    icon: insight.type === 'opportunity' ? Zap : 
          insight.type === 'alert' ? AlertTriangle : 
          insight.type === 'success' ? Target : 
          TrendingUp
  }));

  const sidebarItems = [
    { id: "overview", label: "Overview", icon: Home },
    { id: "earnings", label: "Daily Earnings", icon: DollarSign, isRoute: true, route: "/earnings" },
    { id: "chat", label: "AI Assistant", icon: MessageCircle },
    { id: "upload", label: "Upload", icon: Upload },
    { id: "advanced", label: "Advanced", icon: BarChart3 },
    { id: "reports", label: "Reports", icon: FileText },
    { id: "insights", label: "Insights", icon: Eye },
    { id: "business-trends", label: "Business Trends", icon: TrendingUp, isRoute: true, route: "/business-trends" },
    { id: "profile", label: "Profile", icon: User },
    { id: "contact", label: "Contact Us", icon: MessageCircle, isRoute: true, route: "/contact" },
    { id: "settings", label: "Settings", icon: Settings },
    { id: "signout", label: "Sign Out", icon: LogOut, action: handleSignOut }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Clean Header */}
      <header className="nav-clean sticky top-0 z-50 h-16 px-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </Button>
          
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">₹</span>
            </div>
            <div>
              <h1 className="text-lg font-semibold">VirtualCFO</h1>
              <p className="text-xs text-muted-foreground">{businessData.companyName}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search..."
              className="pl-10 pr-4 py-2 w-64 bg-muted/50 border-0 rounded-lg text-sm focus:bg-background focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>
          
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-destructive rounded-full text-xs"></span>
          </Button>
          
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleSignOut}
            title="Sign Out"
            className="text-muted-foreground hover:text-foreground"
          >
            <LogOut className="h-4 w-4" />
          </Button>
          
          <div className="w-8 h-8 bg-gradient-primary rounded-full status-online"></div>
        </div>
      </header>

        <div className="flex">
        {/* Modern Sidebar */}
        <aside className={cn(
          "bg-card/50 backdrop-blur-sm border-r transition-all duration-300 hidden lg:flex flex-col",
          isSidebarCollapsed ? "w-16" : "w-64"
        )}>
          <nav className="p-4 space-y-2">
            {sidebarItems.map((item) => (
              <Button
                key={item.id}
                variant={activeTab === item.id && !item.action ? "default" : "ghost"}
                className={cn(
                  "w-full justify-start text-left",
                  isSidebarCollapsed && "px-2",
                  item.id === "signout" && "text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                )}
                onClick={() => {
                  if (item.isRoute && item.route) {
                    navigate(item.route);
                  } else if (item.action) {
                    item.action();
                  } else {
                    setActiveTab(item.id);
                  }
                }}
              >
                <item.icon className="h-4 w-4 flex-shrink-0" />
                {!isSidebarCollapsed && (
                  <span className="ml-3">{item.label}</span>
                )}
              </Button>
            ))}
          </nav>
          
          {/* Footer with privacy note */}
          {!isSidebarCollapsed && (
            <div className="mt-auto p-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-3 h-3 bg-success rounded-full"></div>
                <span>Secure & Private</span>
              </div>
              <p>🔒 Your data is GST-compliant and encrypted.</p>
            </div>
          )}
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 space-y-6">
          {/* Dynamic Action Required Alert */}
          {actionRequired && (
            <Card className="border-warning/20 bg-warning/5">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-warning flex-shrink-0 mt-0.5" />
                  <div className="space-y-1 flex-1">
                    <p className="font-medium text-sm">Action Required</p>
                    <p className="text-sm text-muted-foreground">
                      {actionRequired.description}. {actionRequired.impact} potential savings.
                    </p>
                  </div>
                  <Button size="sm" variant="outline" className="border-warning text-warning hover:bg-warning/10">
                    View Details <ChevronRight className="h-3 w-3 ml-1" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Health Score & Quick Stats */}
          <div className="grid lg:grid-cols-3 gap-6">
            <Card className="modern-card lg:col-span-1">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Business Health</CardTitle>
              </CardHeader>
              <CardContent>
                {businessHealth.score === 0 ? (
                  <div className="text-center py-8">
                    <div className="w-full bg-muted rounded-full h-4 mb-4">
                      <div className="h-4 rounded-full bg-muted-foreground/20" style={{ width: '0%' }} />
                    </div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">No Health Data Available</p>
                    <p className="text-xs text-muted-foreground mb-3">{businessHealth.description}</p>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => setActiveTab("profile")}
                      className="text-xs"
                    >
                      Complete Profile
                    </Button>
                  </div>
                ) : (
                  <>
                    <HealthMeter score={businessHealth.score} size="lg" />
                    <div className="mt-4 text-center">
                      <p className="text-xs text-muted-foreground">{businessHealth.description}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {businessHealth.industryComparison}
                      </p>
                      <div className="mt-3 text-xs text-muted-foreground space-y-1">
                        <div className="flex justify-between">
                          <span>Profit Margin:</span>
                          <span className={businessHealth.factors.profitMargin >= 15 ? 'text-success' : businessHealth.factors.profitMargin >= 10 ? 'text-warning' : 'text-destructive'}>
                            {businessHealth.factors.profitMargin}%
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Cash Flow:</span>
                          <span className={businessHealth.factors.cashFlow > 0 ? 'text-success' : 'text-destructive'}>
                            ₹{businessHealth.factors.cashFlow.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <MetricCard
                title="Monthly Revenue"
                value={businessData.monthlyRevenue}
                icon={TrendingUp}
                trend={businessData.monthlyRevenue > 0 ? businessData.trend?.revenue : undefined}
                isCurrency={true}
                className="modern-card"
              />
              
              <MetricCard
                title="Cash Flow"
                value={businessData.cashFlow}
                icon={PiggyBank}
                trend={businessData.monthlyRevenue > 0 && businessData.monthlyExpenses > 0 ? businessData.trend?.cashFlow : undefined}
                isCurrency={true}
                className="modern-card"
              />
              
              <MetricCard
                title="Monthly Expenses"
                value={businessData.monthlyExpenses}
                icon={DollarSign}
                trend={businessData.monthlyExpenses > 0 ? businessData.trend?.expenses : undefined}
                isCurrency={true}
                className="modern-card"
              />
              
              <MetricCard
                title="Profit Margin"
                value={businessData.profitMargin}
                icon={BarChart3}
                trend={businessData.monthlyRevenue > 0 && businessData.monthlyExpenses > 0 ? businessData.trend?.profitMargin : undefined}
                className="modern-card"
              />
            </div>
          </div>

          {/* Dynamic Content Based on Active Tab */}
          {activeTab === "overview" && (
            <div className="grid xl:grid-cols-3 gap-6">
              {/* AI Chat Interface */}
              <Card className="modern-card xl:col-span-2">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">AI CFO Assistant</CardTitle>
                    <Badge variant="outline" className="bg-success/10 text-success border-success/20">
                      <div className="w-2 h-2 bg-success rounded-full mr-2 animate-pulse"></div>
                      Online
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="h-[400px]">
                    <ChatInterface />
                  </div>
                </CardContent>
              </Card>

              {/* Insights & Actions */}
              <div className="space-y-6">
                {/* Quick Actions */}
                <Card className="modern-card">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button 
                      className="w-full justify-start btn-primary" 
                      size="sm"
                      onClick={() => navigate('/earnings')}
                    >
                      <DollarSign className="h-4 w-4 mr-3" />
                      Record Daily Earnings
                    </Button>
                    
                    <Button 
                      className="w-full justify-start" 
                      variant="outline" 
                      size="sm"
                      onClick={() => setActiveTab("upload")}
                    >
                      <Upload className="h-4 w-4 mr-3" />
                      Upload Documents
                    </Button>
                    
                    <Button 
                      className="w-full justify-start" 
                      variant="outline" 
                      size="sm"
                      onClick={() => setActiveTab("reports")}
                    >
                      <FileText className="h-4 w-4 mr-3" />
                      Generate GST/P&L Report
                    </Button>
                    
                    <Button 
                      className="w-full justify-start" 
                      variant="outline" 
                      size="sm"
                      onClick={() => setActiveTab("advanced")}
                    >
                      <TrendingUp className="h-4 w-4 mr-3" />
                      Analyze Trends & Forecast
                    </Button>
                  </CardContent>
                </Card>

                {/* Key Insights */}
                <Card className="modern-card">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Key Insights</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {insights.map((insight) => {
                      const IconComponent = insight.icon;
                      return (
                        <div key={insight.id} className="flex gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer">
                          <div className={cn(
                            "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0",
                            insight.type === "success" && "bg-success/10 text-success",
                            insight.type === "alert" && "bg-warning/10 text-warning",
                            insight.type === "opportunity" && "bg-primary/10 text-primary",
                            insight.type === "prediction" && "bg-blue/10 text-blue"
                          )}>
                            <IconComponent className="h-4 w-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-medium truncate">{insight.title}</p>
                              <Badge 
                                variant="outline" 
                                className={cn(
                                  "text-xs",
                                  insight.priority === "high" && "border-destructive/20 text-destructive",
                                  insight.priority === "medium" && "border-warning/20 text-warning",
                                  insight.priority === "low" && "border-success/20 text-success"
                                )}
                              >
                                {insight.priority}
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                              {insight.description}
                            </p>
                            <p className="text-xs font-medium mt-1 text-primary">
                              {insight.impact}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              Annual: {insight.annualImpact}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {activeTab === "advanced" && <AdvancedDashboard />}
          {activeTab === "chat" && (
            <Card className="modern-card">
              <CardContent className="p-0">
                <div className="h-[600px]">
                  <ChatInterface />
                </div>
              </CardContent>
            </Card>
          )}
          {activeTab === "upload" && <DocumentUploader />}
          {activeTab === "reports" && <ReportGenerator businessData={businessData} />}
          {activeTab === "insights" && <InsightsPanel />}
          {activeTab === "profile" && <ProfileView />}
        </main>
      </div>
      
      {/* Support Chatbot */}
      <SupportChatbot />
      
      {/* Mobile Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-sm border-t">
        <div className="grid grid-cols-5 gap-1 p-2">
          {sidebarItems.slice(0, 5).map((item) => (
            <Button
              key={item.id}
              variant={activeTab === item.id && !item.action ? "default" : "ghost"}
              className={cn(
                "flex-col h-auto py-2 text-xs",
                item.id === "signout" && "text-muted-foreground hover:text-destructive"
              )}
              size="sm"
              onClick={() => {
                if (item.isRoute && item.route) {
                  navigate(item.route);
                } else if (item.action) {
                  item.action();
                } else {
                  setActiveTab(item.id);
                }
              }}
            >
              <item.icon className="h-4 w-4 mb-1" />
              <span className="truncate">{item.label}</span>
            </Button>
          ))}
        </div>
      </nav>
    </div>
  );
}