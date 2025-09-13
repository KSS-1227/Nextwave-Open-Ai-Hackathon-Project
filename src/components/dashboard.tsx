import { HealthMeter } from "@/components/ui/health-meter";
import { MetricCard } from "@/components/ui/metric-card";
import { ChatInterface } from "@/components/chat-interface";
import { Button } from "@/components/ui/button";
import { 
  TrendingUp, 
  DollarSign, 
  PiggyBank, 
  AlertTriangle,
  Upload,
  BarChart3,
  Settings
} from "lucide-react";
import { SupportChatbot } from "@/components/support-chatbot";

export function Dashboard() {
  const businessData = {
    healthScore: 72,
    monthlyRevenue: 500000,
    monthlyExpenses: 425000,
    profitMargin: 15,
    cashFlow: 45000
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b px-4 py-3">
        <div className="container mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-primary">VirtualCFO</h1>
            <p className="text-sm text-muted-foreground">Rajesh Electronics</p>
          </div>
          <Button size="sm" variant="outline">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
        </div>
      </header>

      <div className="container mx-auto p-4 space-y-6">
        {/* Alert Banner */}
        <div className="bg-warning/10 border border-warning/20 rounded-lg p-4 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-warning flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-medium text-warning-foreground">Action Required</p>
            <p className="text-sm text-muted-foreground">
              Inventory turnover is low. You could save ₹15,000 by optimizing stock levels.
            </p>
          </div>
        </div>

        {/* Health Score */}
        <div className="bg-card rounded-lg p-6 border">
          <HealthMeter score={businessData.healthScore} size="lg" />
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Monthly Revenue"
            value={businessData.monthlyRevenue}
            icon={TrendingUp}
            trend={{ value: 12, isPositive: true }}
            isCurrency={true}
          />
          
          <MetricCard
            title="Monthly Expenses"
            value={businessData.monthlyExpenses}
            icon={DollarSign}
            trend={{ value: 5, isPositive: false }}
            isCurrency={true}
          />
          
          <MetricCard
            title="Cash Flow"
            value={businessData.cashFlow}
            icon={PiggyBank}
            trend={{ value: 8, isPositive: true }}
            isCurrency={true}
          />
          
          <MetricCard
            title="Profit Margin"
            value={businessData.profitMargin}
            icon={BarChart3}
            trend={{ value: 3, isPositive: true }}
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Chat Interface */}
          <div className="lg:col-span-1">
            <div className="bg-card rounded-lg p-6 border">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">AI CFO Assistant</h2>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
                  Online
                </div>
              </div>
              <ChatInterface />
            </div>
          </div>

          {/* Quick Actions & Insights */}
          <div className="lg:col-span-1 space-y-6">
            {/* Quick Actions */}
            <div className="bg-card rounded-lg p-6 border">
              <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Button className="w-full justify-start" variant="outline">
                  <Upload className="h-4 w-4 mr-3" />
                  Upload Documents
                </Button>
                
                <Button className="w-full justify-start" variant="outline">
                  <BarChart3 className="h-4 w-4 mr-3" />
                  View Reports
                </Button>
                
                <Button className="w-full justify-start" variant="outline">
                  <TrendingUp className="h-4 w-4 mr-3" />
                  Analyze Trends
                </Button>
              </div>
            </div>

            {/* Key Insights */}
            <div className="bg-card rounded-lg p-6 border">
              <h3 className="text-lg font-semibold mb-4">Key Insights</h3>
              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="w-2 h-2 bg-success rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <p className="text-sm font-medium">Profit Growth</p>
                    <p className="text-xs text-muted-foreground">
                      Your profits increased 15% this month - great job!
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <div className="w-2 h-2 bg-warning rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <p className="text-sm font-medium">Inventory Alert</p>
                    <p className="text-xs text-muted-foreground">
                      45-day turnover is slower than industry average of 30 days
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <p className="text-sm font-medium">Cost Opportunity</p>
                    <p className="text-xs text-muted-foreground">
                      Switch to LED lighting to save ₹3,000/month
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-card border-t">
        <div className="grid grid-cols-4 gap-1 p-2">
          <Button variant="ghost" className="flex-col h-auto py-2 text-xs">
            <BarChart3 className="h-5 w-5 mb-1" />
            Dashboard
          </Button>
          
          <Button variant="ghost" className="flex-col h-auto py-2 text-xs">
            <Upload className="h-5 w-5 mb-1" />
            Upload
          </Button>
          
          <Button variant="ghost" className="flex-col h-auto py-2 text-xs">
            <TrendingUp className="h-5 w-5 mb-1" />
            Reports
          </Button>
          
          <Button variant="ghost" className="flex-col h-auto py-2 text-xs">
            <Settings className="h-5 w-5 mb-1" />
            Settings
          </Button>
        </div>
      </nav>
      
      {/* Support Chatbot */}
      <SupportChatbot />
    </div>
  );
}