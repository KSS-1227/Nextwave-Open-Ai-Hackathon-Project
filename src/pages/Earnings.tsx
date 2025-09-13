import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { earningsAPI, handleAPIError } from "@/lib/api";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Calendar, DollarSign, Package, TrendingUp, AlertCircle, CheckCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface EarningsEntry {
  id: string;
  user_id: string;
  earning_date: string;
  amount: number;
  inventory_cost: number;
  created_at: string;
}

export default function Earnings() {
  const [loading, setLoading] = useState(false);
  const [todayData, setTodayData] = useState<EarningsEntry | null>(null);
  const [recentEntries, setRecentEntries] = useState<EarningsEntry[]>([]);
  const [streak, setStreak] = useState(0);
  const [formData, setFormData] = useState({
    earning_date: new Date().toISOString().split('T')[0], // Today's date
    amount: "",
    inventory_cost: ""
  });
  
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkUserAuth();
    loadTodayData();
    loadRecentEntries();
  }, []);

  const checkUserAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate('/auth');
      return;
    }
  };

  const loadTodayData = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const { data } = await earningsAPI.getEarningsByDateRange(today, today);
      
      if (data && data.length > 0) {
        setTodayData(data[0]);
      }
    } catch (error) {
      console.error('Error loading today data:', error);
    }
  };

  const loadRecentEntries = async () => {
    try {
      const endDate = new Date().toISOString().split('T')[0];
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 7);
      const startDateStr = startDate.toISOString().split('T')[0];
      
      const { data } = await earningsAPI.getEarningsByDateRange(startDateStr, endDate);
      setRecentEntries(data || []);
      
      // Calculate streak
      let currentStreak = 0;
      const sortedEntries = (data || []).sort((a, b) => b.earning_date.localeCompare(a.earning_date));
      
      for (let i = 0; i < sortedEntries.length; i++) {
        const expectedDate = new Date();
        expectedDate.setDate(expectedDate.getDate() - i);
        const expectedDateStr = expectedDate.toISOString().split('T')[0];
        
        if (sortedEntries[i]?.earning_date === expectedDateStr) {
          currentStreak++;
        } else {
          break;
        }
      }
      setStreak(currentStreak);
    } catch (error) {
      console.error('Error loading recent entries:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.amount || !formData.inventory_cost) {
      toast({
        title: "Missing Information",
        description: "Please enter both daily revenue and inventory cost.",
        variant: "destructive",
      });
      return;
    }

    const amount = parseFloat(formData.amount);
    const inventoryCost = parseFloat(formData.inventory_cost);
    
    if (amount < 0 || inventoryCost < 0) {
      toast({
        title: "Invalid Amount",
        description: "Revenue and costs must be positive numbers.",
        variant: "destructive",
      });
      return;
    }

    if (inventoryCost > amount) {
      toast({
        title: "Warning",
        description: "Inventory cost is higher than revenue. Are you sure?",
        variant: "destructive",
      });
    }

    setLoading(true);
    
    try {
      await earningsAPI.addEarnings({
        earning_date: formData.earning_date,
        amount,
        inventory_cost: inventoryCost,
      });

      toast({
        title: "Success! 🎉",
        description: `Earnings recorded for ${formData.earning_date}. Daily profit: ₹${(amount - inventoryCost).toLocaleString()}`,
      });

      // Refresh data
      await loadTodayData();
      await loadRecentEntries();
      
      // Reset form if it was for today
      if (formData.earning_date === new Date().toISOString().split('T')[0]) {
        setFormData({
          earning_date: new Date().toISOString().split('T')[0],
          amount: "",
          inventory_cost: ""
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: handleAPIError(error),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateProfit = () => {
    const amount = parseFloat(formData.amount) || 0;
    const cost = parseFloat(formData.inventory_cost) || 0;
    return amount - cost;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const todayProfit = todayData ? (todayData.amount - todayData.inventory_cost) : 0;
  const isToday = formData.earning_date === new Date().toISOString().split('T')[0];

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>
          
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Current Streak</p>
            <p className="text-2xl font-bold text-primary">{streak} days 🔥</p>
          </div>
        </div>

        {/* Today's Status */}
        {isToday && (
          <Card className={cn("mb-6", todayData ? "border-green-200 bg-green-50" : "border-orange-200 bg-orange-50")}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                {todayData ? (
                  <>
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-medium text-green-800">Today's earnings recorded!</p>
                      <p className="text-sm text-green-600">
                        Revenue: {formatCurrency(todayData.amount)} | 
                        Cost: {formatCurrency(todayData.inventory_cost)} | 
                        Profit: {formatCurrency(todayProfit)}
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <AlertCircle className="h-5 w-5 text-orange-600" />
                    <div>
                      <p className="font-medium text-orange-800">Record today's earnings</p>
                      <p className="text-sm text-orange-600">Keep your financial tracking streak alive!</p>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid md:grid-cols-2 gap-6">
          {/* Earnings Entry Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Record Daily Earnings
              </CardTitle>
              <CardDescription>
                Track your daily revenue and inventory costs for accurate profit calculation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="date" className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Date
                  </Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.earning_date}
                    onChange={(e) => setFormData(prev => ({ ...prev, earning_date: e.target.value }))}
                    max={new Date().toISOString().split('T')[0]}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="amount" className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    Daily Revenue (₹)
                  </Label>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="Enter total sales for the day"
                    value={formData.amount}
                    onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                    min="0"
                    step="0.01"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="inventory_cost" className="flex items-center gap-2">
                    <Package className="h-4 w-4" />
                    Inventory Cost (₹)
                  </Label>
                  <Input
                    id="inventory_cost"
                    type="number"
                    placeholder="Cost of goods sold"
                    value={formData.inventory_cost}
                    onChange={(e) => setFormData(prev => ({ ...prev, inventory_cost: e.target.value }))}
                    min="0"
                    step="0.01"
                    required
                  />
                </div>

                {formData.amount && formData.inventory_cost && (
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">Daily Profit</p>
                    <p className={cn("text-lg font-semibold", 
                      calculateProfit() >= 0 ? "text-green-600" : "text-red-600"
                    )}>
                      {formatCurrency(calculateProfit())}
                    </p>
                  </div>
                )}

                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={loading || (todayData && isToday)}
                >
                  {loading ? "Recording..." : "Record Earnings"}
                </Button>
                
                {todayData && isToday && (
                  <p className="text-xs text-center text-muted-foreground">
                    Today's earnings already recorded. Change the date to record for another day.
                  </p>
                )}
              </form>
            </CardContent>
          </Card>

          {/* Recent Entries */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Entries</CardTitle>
              <CardDescription>Your last 7 days of earnings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentEntries.length > 0 ? (
                  recentEntries.map((entry) => {
                    const profit = entry.amount - entry.inventory_cost;
                    const isToday = entry.earning_date === new Date().toISOString().split('T')[0];
                    
                    return (
                      <div key={entry.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{entry.earning_date}</p>
                            {isToday && <Badge variant="outline">Today</Badge>}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Revenue: {formatCurrency(entry.amount)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className={cn("font-semibold", 
                            profit >= 0 ? "text-green-600" : "text-red-600"
                          )}>
                            {formatCurrency(profit)}
                          </p>
                          <p className="text-xs text-muted-foreground">Profit</p>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Package className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No recent entries</p>
                    <p className="text-xs">Start recording your daily earnings above</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Tips */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-lg">💡 CFO Tips for Better Tracking</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <div>
                <h4 className="font-semibold mb-2">📊 Daily Consistency</h4>
                <p className="text-muted-foreground">Record earnings every day at the same time to build a habit and get accurate trends.</p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">💰 Accurate Costs</h4>
                <p className="text-muted-foreground">Include all costs: inventory, labor, utilities. This gives true profit margins.</p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">📈 Track Patterns</h4>
                <p className="text-muted-foreground">Notice which days perform best. Use this data to optimize your business operations.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}