import { useState } from "react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Lightbulb, TrendingUp, AlertTriangle, Target, MapPin, Users, DollarSign } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { businessIdeasAPI, handleAPIError } from "@/lib/api";

interface BusinessIdea {
  idea_name: string;
  model: string;
  examples: string[];
  why_trending: string;
  india_strategy: string;
  future_scope: string;
  risks: string;
}

interface Competitor {
  name: string;
  market_cap: string;
  description: string;
  location: string;
  strengths: string[];
  weaknesses: string[];
}

const TOP_INDIAN_CITIES = [
  "Mumbai",
  "Delhi",
  "Bangalore",
  "Hyderabad",
  "Ahmedabad",
  "Chennai",
  "Kolkata",
  "Surat",
  "Pune",
  "Jaipur",
  "Lucknow",
  "Kanpur",
  "Nagpur",
  "Indore",
  "Thane",
  "Bhopal",
  "Visakhapatnam",
  "Pimpri-Chinchwad",
  "Patna",
  "Vadodara"
];

export default function BusinessTrendScout() {
  const [budgetMin, setBudgetMin] = useState("");
  const [budgetMax, setBudgetMax] = useState("");
  const [domain, setDomain] = useState("");
  const [region, setRegion] = useState("");
  const [ideas, setIdeas] = useState<BusinessIdea[]>([]);
  const [competitors, setCompetitors] = useState<Competitor[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const scoutTrends = async () => {
    if (!budgetMin || !budgetMax || !domain || !region) {
      toast({
        title: "Missing Information",
        description: "Please fill in budget range, domain, and region",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    
    try {
      // Real API call for business ideas
      const averageBudget = (parseInt(budgetMin) + parseInt(budgetMax)) / 2;
      const response = await businessIdeasAPI.generateIdeas(averageBudget, domain);
      
      // Parse the AI response to extract structured business ideas
      const aiContent = response.data.business_ideas;
      
      // For now, we'll create a simplified structure
      // In a real implementation, you'd want to improve the AI response parsing
      const parsedIdeas: BusinessIdea[] = [
        {
          idea_name: `🚀 ${domain} Business Opportunity`,
          model: "Based on current market trends",
          examples: ["Global leaders in this space"],
          why_trending: aiContent.substring(0, 150) + "...",
          india_strategy: "Adapted for Indian market conditions",
          future_scope: "Scalable business model with growth potential",
          risks: "Standard business risks apply"
        }
      ];
      
      // Mock competitors data based on region (in real implementation, this would come from an API)
      const mockCompetitors: Competitor[] = [
        {
          name: `${region} ${domain} Leader`,
          market_cap: "₹50 Crores",
          description: `Top competitor in ${region} with strong market presence`,
          location: region,
          strengths: ["Established market position", "Strong customer base", "Brand recognition"],
          weaknesses: ["Slow to adopt new technologies", "Limited regional expansion", "High operational costs"]
        },
        {
          name: `Regional ${domain} Specialist`,
          market_cap: "₹30 Crores",
          description: `Specialized service provider in ${region}`,
          location: region,
          strengths: ["Deep regional expertise", "Personalized service", "Strong local partnerships"],
          weaknesses: ["Limited scalability", "Resource constraints", "Dependence on key personnel"]
        },
        {
          name: `${region} ${domain} Innovator`,
          market_cap: "₹20 Crores",
          description: `Emerging player with innovative approach in ${region}`,
          location: region,
          strengths: ["Innovative solutions", "Agile decision-making", "Tech-savvy team"],
          weaknesses: ["Limited brand recognition", "Unproven business model", "Funding constraints"]
        }
      ];
      
      setIdeas(parsedIdeas);
      setCompetitors(mockCompetitors);
      toast({
        title: "🌟 Business Ideas & Competitor Analysis Generated!",
        description: `Generated ${parsedIdeas.length} business ideas and top 3 competitors in ${region}`
      });
    } catch (error) {
      console.error('Error scouting trends:', error);
      toast({
        title: "❌ Error Scouting Trends",
        description: handleAPIError(error),
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const formatBudget = (amount: string) => {
    if (!amount) return "";
    const num = parseInt(amount);
    if (num >= 10000000) return `₹${(num / 10000000).toFixed(1)}Cr`;
    if (num >= 100000) return `₹${(num / 100000).toFixed(1)}L`;
    if (num >= 1000) return `₹${(num / 1000).toFixed(0)}K`;
    return `₹${num}`;
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Lightbulb className="h-8 w-8 text-primary" />
              <h1 className="text-3xl font-bold">🔭 Business Trend Scout</h1>
            </div>
            <p className="text-lg text-muted-foreground mb-4">
              Discover trending business ideas from global markets adapted for India
            </p>
          </div>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle>🎯 Your Investment Criteria</CardTitle>
              <CardDescription>
                Tell us your budget, interests, and region to get personalized business opportunities and competitor analysis
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm font-medium mb-2 block">💰 Budget Range (in ₹)</Label>
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    placeholder="Minimum (e.g., 500000)"
                    value={budgetMin}
                    onChange={(e) => setBudgetMin(e.target.value)}
                    type="number"
                  />
                  <Input
                    placeholder="Maximum (e.g., 2000000)"
                    value={budgetMax}
                    onChange={(e) => setBudgetMax(e.target.value)}
                    type="number"
                  />
                </div>
                {budgetMin && budgetMax && (
                  <p className="text-sm text-muted-foreground mt-1">
                    Budget Range: {formatBudget(budgetMin)} - {formatBudget(budgetMax)}
                  </p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="domain">🏢 Industry/Domain of Interest</Label>
                <Select value={domain} onValueChange={setDomain}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your area of interest" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="technology">💻 Technology & Software</SelectItem>
                    <SelectItem value="healthcare">🏥 Healthcare & Wellness</SelectItem>
                    <SelectItem value="education">📚 Education & Training</SelectItem>
                    <SelectItem value="fintech">🏦 Financial Services</SelectItem>
                    <SelectItem value="ecommerce">🛒 E-commerce & Retail</SelectItem>
                    <SelectItem value="food">🍔 Food & Beverage</SelectItem>
                    <SelectItem value="sustainability">♻️ Sustainability & Environment</SelectItem>
                    <SelectItem value="logistics">🚚 Logistics & Supply Chain</SelectItem>
                    <SelectItem value="agriculture">🌾 Agriculture & Rural</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="region">📍 Select Region</Label>
                <Select value={region} onValueChange={setRegion}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your target region" />
                  </SelectTrigger>
                  <SelectContent>
                    {TOP_INDIAN_CITIES.map((city) => (
                      <SelectItem key={city} value={city}>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          {city}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <Button 
                onClick={scoutTrends} 
                disabled={loading || !budgetMin || !budgetMax || !domain || !region}
                className="w-full"
              >
                {loading ? "🔍 Scouting Trends & Competitors..." : "🚀 Scout Business Trends & Competitors"}
              </Button>
            </CardContent>
          </Card>

          {ideas.length > 0 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <TrendingUp className="h-6 w-6 text-primary" />
                💡 Trending Business Ideas for You
              </h2>

              <div className="grid gap-6">
                {ideas.map((idea, index) => (
                  <Card key={index} className="overflow-hidden border-primary/20 shadow-lg">
                    <CardHeader className="bg-gradient-to-r from-primary/10 to-success/10">
                      <CardTitle className="flex items-center gap-2 text-xl">
                        {idea.idea_name}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 p-6">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="bg-muted/30 p-4 rounded-lg">
                          <Label className="text-sm font-medium text-primary flex items-center gap-1">
                            🏢 Business Model
                          </Label>
                          <p className="text-sm mt-2">{idea.model}</p>
                        </div>
                        <div className="bg-muted/30 p-4 rounded-lg">
                          <Label className="text-sm font-medium text-primary flex items-center gap-1">
                            🌍 Global Examples
                          </Label>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {idea.examples.map((example, i) => (
                              <Badge key={i} variant="secondary" className="text-xs">
                                {example}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                        <Label className="text-sm font-medium text-blue-700 flex items-center gap-1">
                          <TrendingUp className="h-4 w-4" />
                          🔥 Why It's Trending
                        </Label>
                        <p className="text-sm mt-2 text-blue-900">{idea.why_trending}</p>
                      </div>
                      
                      <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                        <Label className="text-sm font-medium text-green-700 flex items-center gap-1">
                          <Target className="h-4 w-4" />
                          🇮🇳 India Strategy
                        </Label>
                        <p className="text-sm mt-2 text-green-900">{idea.india_strategy}</p>
                      </div>
                      
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                          <Label className="text-sm font-medium text-purple-700 flex items-center gap-1">
                            🚀 Future Scope
                          </Label>
                          <p className="text-sm mt-2 text-purple-900">{idea.future_scope}</p>
                        </div>
                        <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                          <Label className="text-sm font-medium text-red-700 flex items-center gap-1">
                            <AlertTriangle className="h-4 w-4" />
                            ⚠️ Risks to Consider
                          </Label>
                          <p className="text-sm mt-2 text-red-900">{idea.risks}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {competitors.length > 0 && (
            <div className="space-y-6 mt-8">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Users className="h-6 w-6 text-primary" />
                🏆 Top Competitors in {region}
              </h2>
              
              <div className="grid gap-4">
                {competitors.map((competitor, index) => (
                  <Card key={index} className="overflow-hidden border-muted shadow-md hover:shadow-lg transition-shadow">
                    <CardHeader className="bg-gradient-to-r from-muted/50 to-primary/5">
                      <CardTitle className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-5 w-5 text-primary" />
                          {competitor.name}
                        </div>
                        <Badge variant="secondary" className="flex items-center gap-1 text-base">
                          <DollarSign className="h-4 w-4" />
                          {competitor.market_cap}
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4">
                      <p className="text-sm text-muted-foreground mb-3">{competitor.description}</p>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground mb-4">
                        <MapPin className="h-3 w-3" />
                        <span>{competitor.location}</span>
                      </div>
                      
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="bg-green-50 p-3 rounded-lg">
                          <h4 className="font-medium text-green-800 flex items-center gap-1 mb-2">
                            ✅ Key Strengths
                          </h4>
                          <ul className="text-xs text-green-700 space-y-1">
                            {competitor.strengths.map((strength, i) => (
                              <li key={i} className="flex items-start gap-1">
                                <span>•</span>
                                <span>{strength}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        
                        <div className="bg-amber-50 p-3 rounded-lg">
                          <h4 className="font-medium text-amber-800 flex items-center gap-1 mb-2">
                            ❗ Key Weaknesses
                          </h4>
                          <ul className="text-xs text-amber-700 space-y-1">
                            {competitor.weaknesses.map((weakness, i) => (
                              <li key={i} className="flex items-start gap-1">
                                <span>•</span>
                                <span>{weakness}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              
              <Card className="border-dashed border-2 border-muted bg-gradient-to-r from-blue-50 to-indigo-50">
                <CardContent className="p-6 text-center">
                  <Lightbulb className="h-8 w-8 text-primary mx-auto mb-2" />
                  <h3 className="font-semibold mb-1">💡 Competitive Intelligence Tip</h3>
                  <p className="text-sm text-muted-foreground">
                    Analyze these competitors' strengths and weaknesses to identify gaps in the market. 
                    Consider how you can differentiate your business with unique value propositions.
                  </p>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}