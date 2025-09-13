import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  Target, 
  Zap, 
  PiggyBank,
  BarChart3,
  Calendar,
  Bell
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Insight {
  id: string;
  type: 'opportunity' | 'alert' | 'success' | 'prediction';
  title: string;
  description: string;
  impact: string;
  priority: 'high' | 'medium' | 'low';
  confidence: number;
  category: string;
  actionable: boolean;
  icon: any;
}

interface Goal {
  id: string;
  title: string;
  target: number;
  current: number;
  deadline: string;
  category: string;
}

const smartInsights: Insight[] = [
  {
    id: '1',
    type: 'opportunity',
    title: 'Inventory Optimization',
    description: 'Your mobile accessories have 65-day turnover vs industry average of 30 days',
    impact: '₹18,000/month savings',
    priority: 'high',
    confidence: 92,
    category: 'Inventory',
    actionable: true,
    icon: Target
  },
  {
    id: '2',
    type: 'prediction',
    title: 'Cash Flow Forecast',
    description: 'Based on seasonal patterns, expect 25% revenue increase in next 2 months',
    impact: '₹125,000 additional revenue',
    priority: 'medium',
    confidence: 78,
    category: 'Forecasting',
    actionable: false,
    icon: TrendingUp
  },
  {
    id: '3',
    type: 'alert',
    title: 'Expense Spike Detected',
    description: 'Utility costs increased 45% this month - check for equipment inefficiency',
    impact: '₹8,000 unexpected cost',
    priority: 'high',
    confidence: 95,
    category: 'Expenses',
    actionable: true,
    icon: AlertTriangle
  },
  {
    id: '4',
    type: 'success',
    title: 'Profit Margin Growth',
    description: 'Samsung products showing 28% margin vs 22% last quarter',
    impact: '+₹15,000 this month',
    priority: 'low',
    confidence: 100,
    category: 'Performance',
    actionable: false,
    icon: PiggyBank
  }
];

const financialGoals: Goal[] = [
  {
    id: '1',
    title: 'Monthly Revenue Target',
    target: 600000,
    current: 520000,
    deadline: '2025-01-31',
    category: 'Revenue'
  },
  {
    id: '2',
    title: 'Cost Reduction Goal',
    target: 50000,
    current: 32000,
    deadline: '2025-02-28',
    category: 'Savings'
  },
  {
    id: '3',
    title: 'Inventory Turnover',
    target: 12,
    current: 8.2,
    deadline: '2025-03-31',
    category: 'Efficiency'
  }
];

export function SmartInsightsPanel() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [insights, setInsights] = useState<Insight[]>(smartInsights);

  const categories = ['all', 'Inventory', 'Expenses', 'Performance', 'Forecasting'];
  
  const filteredInsights = selectedCategory === 'all' 
    ? insights 
    : insights.filter(insight => insight.category === selectedCategory);

  const getInsightIcon = (insight: Insight) => {
    const IconComponent = insight.icon;
    return (
      <div className={cn(
        "w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0",
        insight.type === 'success' && "bg-success/10 text-success",
        insight.type === 'alert' && "bg-warning/10 text-warning",
        insight.type === 'opportunity' && "bg-primary/10 text-primary",
        insight.type === 'prediction' && "bg-accent/10 text-accent-foreground"
      )}>
        <IconComponent className="h-5 w-5" />
      </div>
    );
  };

  return (
    <Card className="modern-card">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Smart Insights
          </CardTitle>
          <Badge variant="outline" className="text-xs">
            AI-Powered
          </Badge>
        </div>
        
        {/* Category Filter */}
        <div className="flex gap-2 mt-3 overflow-x-auto">
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              size="sm"
              className="text-xs whitespace-nowrap"
              onClick={() => setSelectedCategory(category)}
            >
              {category === 'all' ? 'All' : category}
            </Button>
          ))}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {filteredInsights.map((insight) => (
          <div key={insight.id} className="flex gap-3 p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
            {getInsightIcon(insight)}
            
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h4 className="text-sm font-medium">{insight.title}</h4>
                  <p className="text-xs text-muted-foreground">{insight.category}</p>
                </div>
                <div className="flex items-center gap-2">
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
                  <span className="text-xs text-muted-foreground">{insight.confidence}%</span>
                </div>
              </div>
              
              <p className="text-xs text-muted-foreground mb-2">
                {insight.description}
              </p>
              
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-primary">
                  {insight.impact}
                </span>
                {insight.actionable && (
                  <Button size="sm" variant="outline" className="text-xs h-6">
                    Take Action
                  </Button>
                )}
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export function GoalTracker() {
  return (
    <Card className="modern-card">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Target className="h-4 w-4" />
          Financial Goals
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {financialGoals.map((goal) => {
          const progress = Math.min((goal.current / goal.target) * 100, 100);
          const isOnTrack = progress >= 70;
          
          return (
            <div key={goal.id} className="space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium">{goal.title}</h4>
                  <p className="text-xs text-muted-foreground">{goal.category}</p>
                </div>
                <Badge variant={isOnTrack ? "default" : "secondary"} className="text-xs">
                  {progress.toFixed(0)}%
                </Badge>
              </div>
              
              <Progress value={progress} className="h-2" />
              
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">
                  {goal.category === 'Revenue' || goal.category === 'Savings' 
                    ? `₹${goal.current.toLocaleString('en-IN')} / ₹${goal.target.toLocaleString('en-IN')}`
                    : `${goal.current} / ${goal.target}`
                  }
                </span>
                <span className="text-muted-foreground">
                  Due: {new Date(goal.deadline).toLocaleDateString('en-IN')}
                </span>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

export function PredictiveAlerts() {
  const [alerts, setAlerts] = useState([
    {
      id: '1',
      type: 'warning',
      title: 'Cash Flow Alert',
      message: 'Projected cash shortage in 18 days based on current spending pattern',
      confidence: 85,
      timestamp: new Date()
    },
    {
      id: '2',
      type: 'opportunity',
      title: 'Festival Season Prep',
      message: 'Increase electronics inventory by 40% for Diwali season in 45 days',
      confidence: 92,
      timestamp: new Date()
    }
  ]);

  return (
    <Card className="modern-card">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Bell className="h-4 w-4" />
          Predictive Alerts
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-3">
        {alerts.map((alert) => (
          <div key={alert.id} className="flex gap-3 p-3 rounded-lg border border-border/50">
            <div className={cn(
              "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0",
              alert.type === 'warning' && "bg-warning/10 text-warning",
              alert.type === 'opportunity' && "bg-primary/10 text-primary"
            )}>
              {alert.type === 'warning' ? (
                <AlertTriangle className="h-4 w-4" />
              ) : (
                <TrendingUp className="h-4 w-4" />
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-medium mb-1">{alert.title}</h4>
              <p className="text-xs text-muted-foreground mb-2">
                {alert.message}
              </p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  Confidence: {alert.confidence}%
                </span>
                <Button size="sm" variant="outline" className="text-xs h-6">
                  Review
                </Button>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}