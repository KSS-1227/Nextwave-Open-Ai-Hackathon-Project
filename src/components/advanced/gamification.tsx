import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  Trophy, 
  Star, 
  Target, 
  TrendingUp, 
  Award, 
  Zap,
  Clock,
  CheckCircle2,
  Medal,
  Crown
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Achievement {
  id: string;
  title: string;
  description: string;
  type: 'profit' | 'efficiency' | 'consistency' | 'milestone';
  icon: any;
  earned: boolean;
  earnedDate?: Date;
  progress: number;
  maxProgress: number;
  reward: string;
}

interface Challenge {
  id: string;
  title: string;
  description: string;
  type: 'daily' | 'weekly' | 'monthly';
  progress: number;
  target: number;
  reward: string;
  deadline: Date;
  active: boolean;
}

const achievements: Achievement[] = [
  {
    id: '1',
    title: 'First Profit Milestone',
    description: 'Achieve ₹50,000 monthly profit',
    type: 'milestone',
    icon: Trophy,
    earned: true,
    earnedDate: new Date('2024-12-15'),
    progress: 75000,
    maxProgress: 50000,
    reward: 'Advanced Analytics Unlock'
  },
  {
    id: '2',
    title: 'Efficiency Expert',
    description: 'Maintain inventory turnover above 8x for 3 months',
    type: 'efficiency',
    icon: Zap,
    earned: false,
    progress: 2,
    maxProgress: 3,
    reward: 'Automated Alerts Feature'
  },
  {
    id: '3',
    title: 'Consistent Performer',
    description: 'Log in and check finances for 30 consecutive days',
    type: 'consistency',
    icon: Clock,
    earned: false,
    progress: 18,
    maxProgress: 30,
    reward: 'Premium Dashboard Theme'
  },
  {
    id: '4',
    title: 'Profit Maximizer',
    description: 'Increase profit margin by 5% in one quarter',
    type: 'profit',
    icon: TrendingUp,
    earned: true,
    earnedDate: new Date('2024-11-30'),
    progress: 7,
    maxProgress: 5,
    reward: 'Custom Report Builder'
  }
];

const challenges: Challenge[] = [
  {
    id: '1',
    title: 'Daily Check-in',
    description: 'Review your dashboard daily this week',
    type: 'daily',
    progress: 4,
    target: 7,
    reward: '500 XP + Streak Badge',
    deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    active: true
  },
  {
    id: '2',
    title: 'Cost Cutter',
    description: 'Reduce expenses by ₹10,000 this month',
    type: 'monthly',
    progress: 6500,
    target: 10000,
    reward: '1000 XP + Efficiency Badge',
    deadline: new Date('2025-01-31'),
    active: true
  },
  {
    id: '3',
    title: 'Revenue Booster',
    description: 'Increase weekly revenue by 15%',
    type: 'weekly',
    progress: 8,
    target: 15,
    reward: '750 XP + Growth Badge',
    deadline: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    active: true
  }
];

export function AchievementsPanel() {
  const [selectedType, setSelectedType] = useState<string>('all');
  
  const types = ['all', 'milestone', 'profit', 'efficiency', 'consistency'];
  const filteredAchievements = selectedType === 'all' 
    ? achievements 
    : achievements.filter(achievement => achievement.type === selectedType);

  const earnedCount = achievements.filter(a => a.earned).length;
  const totalCount = achievements.length;

  return (
    <Card className="modern-card">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Trophy className="h-4 w-4" />
            Achievements
          </CardTitle>
          <Badge variant="outline" className="text-xs">
            {earnedCount}/{totalCount} Earned
          </Badge>
        </div>
        
        {/* Type Filter */}
        <div className="flex gap-2 mt-3 overflow-x-auto">
          {types.map((type) => (
            <Button
              key={type}
              variant={selectedType === type ? "default" : "outline"}
              size="sm"
              className="text-xs whitespace-nowrap capitalize"
              onClick={() => setSelectedType(type)}
            >
              {type}
            </Button>
          ))}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {filteredAchievements.map((achievement) => {
          const IconComponent = achievement.icon;
          const progressPercentage = Math.min((achievement.progress / achievement.maxProgress) * 100, 100);
          
          return (
            <div 
              key={achievement.id} 
              className={cn(
                "flex gap-3 p-4 rounded-lg border transition-all",
                achievement.earned 
                  ? "bg-success/5 border-success/20" 
                  : "bg-muted/30 border-border/50"
              )}
            >
              <div className={cn(
                "w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0",
                achievement.earned 
                  ? "bg-success/10 text-success" 
                  : "bg-muted text-muted-foreground"
              )}>
                <IconComponent className="h-6 w-6" />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="text-sm font-medium flex items-center gap-2">
                      {achievement.title}
                      {achievement.earned && <CheckCircle2 className="h-3 w-3 text-success" />}
                    </h4>
                    <p className="text-xs text-muted-foreground">{achievement.description}</p>
                  </div>
                  {achievement.earned && (
                    <Badge className="text-xs bg-success/10 text-success border-success/20">
                      Earned
                    </Badge>
                  )}
                </div>
                
                {!achievement.earned && (
                  <div className="space-y-1 mb-2">
                    <Progress value={progressPercentage} className="h-2" />
                    <p className="text-xs text-muted-foreground">
                      Progress: {achievement.progress} / {achievement.maxProgress}
                    </p>
                  </div>
                )}
                
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-primary">
                    Reward: {achievement.reward}
                  </span>
                  {achievement.earnedDate && (
                    <span className="text-xs text-muted-foreground">
                      Earned: {achievement.earnedDate.toLocaleDateString('en-IN')}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

export function ActiveChallenges() {
  const activeChallenges = challenges.filter(c => c.active);

  const getDaysRemaining = (deadline: Date) => {
    const now = new Date();
    const diffTime = deadline.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <Card className="modern-card">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Target className="h-4 w-4" />
          Active Challenges
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {activeChallenges.map((challenge) => {
          const progressPercentage = (challenge.progress / challenge.target) * 100;
          const daysRemaining = getDaysRemaining(challenge.deadline);
          const isUrgent = daysRemaining <= 2;
          
          return (
            <div 
              key={challenge.id} 
              className={cn(
                "p-4 rounded-lg border",
                isUrgent ? "bg-warning/5 border-warning/20" : "bg-muted/30 border-border/50"
              )}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="text-sm font-medium">{challenge.title}</h4>
                  <p className="text-xs text-muted-foreground">{challenge.description}</p>
                </div>
                <Badge 
                  variant="outline" 
                  className={cn(
                    "text-xs",
                    challenge.type === 'daily' && "border-blue-200 text-blue-600",
                    challenge.type === 'weekly' && "border-green-200 text-green-600",
                    challenge.type === 'monthly' && "border-purple-200 text-purple-600"
                  )}
                >
                  {challenge.type}
                </Badge>
              </div>
              
              <div className="space-y-2">
                <Progress value={progressPercentage} className="h-2" />
                
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">
                    {challenge.type === 'monthly' 
                      ? `₹${challenge.progress.toLocaleString('en-IN')} / ₹${challenge.target.toLocaleString('en-IN')}`
                      : `${challenge.progress} / ${challenge.target}${challenge.type === 'weekly' ? '%' : ''}`
                    }
                  </span>
                  <span className={cn(
                    "font-medium",
                    isUrgent && "text-warning"
                  )}>
                    {daysRemaining > 0 ? `${daysRemaining} days left` : 'Due today'}
                  </span>
                </div>
              </div>
              
              <div className="mt-3 flex items-center justify-between">
                <span className="text-xs font-medium text-primary">
                  {challenge.reward}
                </span>
                <Button size="sm" variant="outline" className="text-xs h-6">
                  View Progress
                </Button>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

export function FinancialHealthScore() {
  const [currentScore, setCurrentScore] = useState(72);
  const [trend, setTrend] = useState('+5');
  
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-success";
    if (score >= 60) return "text-warning";
    return "text-destructive";
  };

  const getScoreLevel = (score: number) => {
    if (score >= 90) return { level: "Excellent", icon: Crown };
    if (score >= 80) return { level: "Very Good", icon: Medal };
    if (score >= 70) return { level: "Good", icon: Award };
    if (score >= 60) return { level: "Fair", icon: Star };
    return { level: "Needs Improvement", icon: Target };
  };

  const scoreLevel = getScoreLevel(currentScore);
  const ScoreIcon = scoreLevel.icon;

  return (
    <Card className="modern-card">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <TrendingUp className="h-4 w-4" />
          Financial Health Score
        </CardTitle>
      </CardHeader>
      
      <CardContent className="text-center">
        <div className="space-y-4">
          <div className="relative w-32 h-32 mx-auto">
            <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="40"
                stroke="hsl(var(--muted))"
                strokeWidth="8"
                fill="none"
              />
              <circle
                cx="50"
                cy="50"
                r="40"
                stroke="hsl(var(--primary))"
                strokeWidth="8"
                fill="none"
                strokeDasharray={`${currentScore * 2.51}, 251`}
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className={cn("text-2xl font-bold", getScoreColor(currentScore))}>
                  {currentScore}
                </div>
                <div className="text-xs text-muted-foreground">
                  {trend} pts
                </div>
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-center gap-2">
              <ScoreIcon className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">{scoreLevel.level}</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Above average for electronics retail
            </p>
          </div>
          
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-sm font-medium text-success">85</div>
              <div className="text-xs text-muted-foreground">Cash Flow</div>
            </div>
            <div>
              <div className="text-sm font-medium text-warning">68</div>
              <div className="text-xs text-muted-foreground">Efficiency</div>
            </div>
            <div>
              <div className="text-sm font-medium text-primary">74</div>
              <div className="text-xs text-muted-foreground">Growth</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}