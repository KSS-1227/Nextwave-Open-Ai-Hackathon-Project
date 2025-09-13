import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  TrendingUp, 
  AlertTriangle, 
  Target, 
  Zap, 
  PiggyBank, 
  ChevronRight,
  DollarSign,
  BarChart3
} from "lucide-react";
import { cn } from "@/lib/utils";

// Remove the empty interface since it's not needed

export function InsightsPanel() {
  const insights = [
    {
      id: 1,
      type: "opportunity",
      title: "Revenue Growth",
      description: "Expand digital marketing to increase sales",
      impact: "₹5,000/month",
      annualImpact: "₹60,000/year",
      priority: "medium",
      icon: TrendingUp,
      severity: "medium",
      actionable: true,
      details: "Your online presence could be improved to attract more customers."
    },
    {
      id: 2,
      type: "alert",
      title: "Cash Flow",
      description: "Monitor upcoming large expenses",
      impact: "₹10,000 impact",
      annualImpact: "Planning needed",
      priority: "medium",
      icon: PiggyBank,
      severity: "medium",
      actionable: true,
      details: "Plan for seasonal variations in cash flow."
    }
  ];

  const totalPotentialSavings = insights
    .filter(insight => insight.type === "opportunity")
    .reduce((sum, insight) => {
      const amount = parseInt(insight.impact.replace(/[₹,]/g, '').split('/')[0]);
      return sum + (amount * 12); // Annual calculation
    }, 0);

  return (
    <div className="space-y-6">
      {/* Summary Card */}
      <Card className="modern-card bg-gradient-to-r from-success/5 to-success/10 border-success/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-success">
            <Target className="h-5 w-5" />
            Total Potential Impact
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center">
            <div className="text-3xl font-bold text-success">₹{totalPotentialSavings.toLocaleString()}</div>
            <p className="text-muted-foreground">Annual savings opportunity</p>
          </div>
        </CardContent>
      </Card>

      {/* Insights Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Key Financial Insights</h2>
          <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
            {insights.length} insights found
          </Badge>
        </div>

        {insights.map((insight) => {
          const IconComponent = insight.icon;
          return (
            <Card key={insight.id} className="modern-card hover:shadow-lg transition-all cursor-pointer group">
              <CardContent className="p-6">
                <div className="flex gap-4">
                  <div className={cn(
                    "w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0",
                    insight.type === "success" && "bg-success/10 text-success",
                    insight.type === "alert" && "bg-warning/10 text-warning",
                    insight.type === "opportunity" && "bg-primary/10 text-primary"
                  )}>
                    <IconComponent className="h-6 w-6" />
                  </div>
                  
                  <div className="flex-1 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{insight.title}</h3>
                          <Badge 
                            variant="outline" 
                            className={cn(
                              "text-xs",
                              insight.priority === "high" && "border-destructive/20 text-destructive bg-destructive/5",
                              insight.priority === "medium" && "border-warning/20 text-warning bg-warning/5",
                              insight.priority === "low" && "border-success/20 text-success bg-success/5"
                            )}
                          >
                            {insight.priority.toUpperCase()}
                          </Badge>
                        </div>
                        <p className="text-muted-foreground mt-1">{insight.description}</p>
                      </div>
                      
                      <div className="text-right">
                        <div className="text-lg font-semibold text-primary">{insight.impact}</div>
                        <div className="text-xs text-muted-foreground">{insight.annualImpact}</div>
                      </div>
                    </div>
                    
                    <div className="bg-muted/30 rounded-lg p-3">
                      <p className="text-sm">{insight.details}</p>
                    </div>
                    
                    {insight.actionable && (
                      <div className="flex gap-2">
                        <Button size="sm" className="btn-primary">
                          Take Action
                          <ChevronRight className="h-3 w-3 ml-1" />
                        </Button>
                        <Button size="sm" variant="outline">
                          Learn More
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Industry Benchmarks */}
      <Card className="modern-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Industry Benchmarks
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-medium">Electronics Retail Average</h4>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm">Profit Margin</span>
                  <span className="text-sm font-medium">18%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Inventory Turnover</span>
                  <span className="text-sm font-medium">30 days</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Operating Expenses</span>
                  <span className="text-sm font-medium">65% of revenue</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-medium">Your Performance</h4>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm">Profit Margin</span>
                  <span className="text-sm font-medium text-success">8.5%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Inventory Turnover</span>
                  <span className="text-sm font-medium text-warning">35 days</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Operating Expenses</span>
                  <span className="text-sm font-medium text-success">68% of revenue</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}