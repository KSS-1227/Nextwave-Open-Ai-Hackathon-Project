/**
 * Dynamic Insights Generator
 * Generates real-time insights based on user profile and Graph RAG data
 */

export interface ProfileData {
  business_name?: string;
  owner_name?: string;
  business_type?: string;
  location?: string;
  monthly_revenue?: number;
  monthly_expenses?: number;
  preferred_language?: string;
  created_at?: string;
}

export interface KnowledgeContext {
  entities?: Array<{
    entity?: string;
    entity_name?: string;
    type?: string;
    category?: string;
    confidence?: number;
    context?: string;
  }>;
  relationships?: Array<{
    from_entity: string;
    to_entity: string;
    relationship_type: string;
    strength: number;
  }>;
  context?: string;
  entities_extracted?: number;
  knowledge_retrieved?: number;
  relationships_found?: number;
  conversation_id?: string;
}

export interface DynamicInsight {
  id: string;
  type: 'opportunity' | 'alert' | 'success' | 'prediction';
  title: string;
  description: string;
  impact: string;
  annualImpact: string;
  priority: 'high' | 'medium' | 'low';
  severity: 'high' | 'medium' | 'low';
  actionable: boolean;
  details: string;
  calculatedSavings?: number;
  industry?: string;
}

export interface BusinessHealth {
  score: number;
  category: 'excellent' | 'good' | 'fair' | 'poor';
  description: string;
  industryComparison: string;
  factors: {
    profitMargin: number;
    cashFlow: number;
    inventoryTurnover: number;
    operatingExpenses: number;
  };
}

export class InsightsGenerator {
  /**
   * Generate dynamic business health score
   */
  static calculateBusinessHealth(profileData: ProfileData, industryType?: string): BusinessHealth {
    if (!profileData?.monthly_revenue || !profileData?.monthly_expenses) {
      return {
        score: 0,
        category: 'poor',
        description: 'No data available - complete your profile to see health score',
        industryComparison: 'Complete your profile for business health analysis',
        factors: {
          profitMargin: 0,
          cashFlow: 0,
          inventoryTurnover: 0,
          operatingExpenses: 0
        }
      };
    }

    const revenue = profileData.monthly_revenue;
    const expenses = profileData.monthly_expenses;
    const profit = revenue - expenses;
    const profitMargin = (profit / revenue) * 100;
    const expenseRatio = (expenses / revenue) * 100;

    // Calculate health score based on key metrics
    let score = 0;
    
    // Profit margin (40% weight)
    if (profitMargin >= 20) score += 40;
    else if (profitMargin >= 15) score += 35;
    else if (profitMargin >= 10) score += 25;
    else if (profitMargin >= 5) score += 15;
    else score += 5;

    // Cash flow (30% weight)
    if (profit >= revenue * 0.2) score += 30;
    else if (profit >= revenue * 0.15) score += 25;
    else if (profit >= revenue * 0.1) score += 20;
    else if (profit > 0) score += 15;
    else score += 5;

    // Operating expense ratio (20% weight)
    if (expenseRatio <= 60) score += 20;
    else if (expenseRatio <= 70) score += 15;
    else if (expenseRatio <= 80) score += 10;
    else score += 5;

    // Business growth potential (10% weight)
    const businessAge = profileData.created_at ? 
      Math.floor((Date.now() - new Date(profileData.created_at).getTime()) / (1000 * 60 * 60 * 24 * 30)) : 12;
    
    if (businessAge <= 6) score += 10; // New businesses get growth bonus
    else if (businessAge <= 24) score += 8;
    else score += 5;

    // Determine category
    let category: BusinessHealth['category'];
    let description: string;
    let industryComparison: string;

    if (score >= 85) {
      category = 'excellent';
      description = 'Outstanding financial performance';
      industryComparison = 'Well above industry average';
    } else if (score >= 70) {
      category = 'good';
      description = 'Solid financial health with growth potential';
      industryComparison = 'Above industry average';
    } else if (score >= 50) {
      category = 'fair';
      description = 'Stable but has room for improvement';
      industryComparison = 'Close to industry average';
    } else {
      category = 'poor';
      description = 'Needs immediate financial attention';
      industryComparison = 'Below industry average';
    }

    // Industry-specific adjustments
    if (industryType) {
      switch (industryType.toLowerCase()) {
        case 'electronics':
        case 'retail':
          industryComparison += ' for electronics retail';
          break;
        case 'restaurant':
        case 'food':
          industryComparison += ' for food service';
          break;
        case 'services':
          industryComparison += ' for service businesses';
          break;
      }
    }

    return {
      score: Math.round(score),
      category,
      description,
      industryComparison,
      factors: {
        profitMargin: Math.round(profitMargin * 10) / 10,
        cashFlow: profit,
        inventoryTurnover: this.estimateInventoryTurnover(profileData),
        operatingExpenses: Math.round(expenseRatio * 10) / 10
      }
    };
  }

  /**
   * Generate dynamic insights based on real data
   */
  static generateInsights(profileData: ProfileData, knowledgeContext?: KnowledgeContext): DynamicInsight[] {
    const insights: DynamicInsight[] = [];

    if (!profileData?.monthly_revenue || !profileData?.monthly_expenses) {
      return [{
        id: 'setup',
        type: 'alert',
        title: 'Complete Your Profile',
        description: 'Add your business financial data to get personalized insights',
        impact: 'Unlock personalized recommendations',
        annualImpact: 'Better financial planning',
        priority: 'high',
        severity: 'high',
        actionable: true,
        details: 'Complete your business profile to receive AI-powered insights tailored to your specific situation.'
      }];
    }

    const revenue = profileData.monthly_revenue;
    const expenses = profileData.monthly_expenses;
    const profit = revenue - expenses;
    const profitMargin = (profit / revenue) * 100;

    // 1. Profit Margin Analysis
    if (profitMargin < 10) {
      const potentialSavings = Math.round(revenue * 0.05); // 5% of revenue
      insights.push({
        id: 'profit-margin',
        type: 'alert',
        title: 'Low Profit Margin Detected',
        description: `Your ${profitMargin.toFixed(1)}% margin is below the 15% industry standard`,
        impact: `₹${potentialSavings.toLocaleString()}/month potential`,
        annualImpact: `₹${(potentialSavings * 12).toLocaleString()}/year`,
        priority: 'high',
        severity: 'high',
        actionable: true,
        calculatedSavings: potentialSavings,
        details: `Industry average for ${profileData.business_type || 'your industry'} is 15-20%. Consider cost optimization strategies.`,
        industry: profileData.business_type
      });
    } else if (profitMargin > 20) {
      insights.push({
        id: 'profit-success',
        type: 'success',
        title: 'Excellent Profit Performance',
        description: `${profitMargin.toFixed(1)}% margin exceeds industry standards`,
        impact: `+₹${profit.toLocaleString()}/month`,
        annualImpact: `+₹${(profit * 12).toLocaleString()}/year`,
        priority: 'low',
        severity: 'low',
        actionable: false,
        details: 'Your pricing strategy and cost management are working exceptionally well!'
      });
    }

    // 2. Cash Flow Analysis
    if (profit < revenue * 0.1) {
      const targetProfit = Math.round(revenue * 0.15);
      const improvementNeeded = targetProfit - profit;
      insights.push({
        id: 'cash-flow',
        type: 'opportunity',
        title: 'Cash Flow Optimization',
        description: 'Improve cash flow to industry standards',
        impact: `₹${improvementNeeded.toLocaleString()}/month potential`,
        annualImpact: `₹${(improvementNeeded * 12).toLocaleString()}/year`,
        priority: 'high',
        severity: 'high',
        actionable: true,
        calculatedSavings: improvementNeeded,
        details: 'Focus on reducing costs and optimizing operations to improve cash flow.'
      });
    }

    // 3. Expense Analysis
    const expenseRatio = (expenses / revenue) * 100;
    if (expenseRatio > 80) {
      const targetExpenses = revenue * 0.75; // Target 75% expense ratio
      const potentialSavings = expenses - targetExpenses;
      insights.push({
        id: 'expense-optimization',
        type: 'opportunity',
        title: 'High Operating Expenses',
        description: `${expenseRatio.toFixed(1)}% expense ratio needs optimization`,
        impact: `₹${Math.round(potentialSavings).toLocaleString()}/month savings`,
        annualImpact: `₹${Math.round(potentialSavings * 12).toLocaleString()}/year`,
        priority: 'high',
        severity: 'medium',
        actionable: true,
        calculatedSavings: Math.round(potentialSavings),
        details: 'Review major expense categories to identify cost reduction opportunities.'
      });
    }

    // 4. Revenue Growth Opportunity
    if (revenue < 500000) { // Less than 5 lakh per month
      const growthPotential = Math.round(revenue * 0.2); // 20% growth target
      insights.push({
        id: 'revenue-growth',
        type: 'opportunity',
        title: 'Revenue Growth Opportunity',
        description: 'Expand market reach to boost sales',
        impact: `₹${growthPotential.toLocaleString()}/month potential`,
        annualImpact: `₹${(growthPotential * 12).toLocaleString()}/year`,
        priority: 'medium',
        severity: 'medium',
        actionable: true,
        calculatedSavings: growthPotential,
        details: 'Consider new product lines, service expansion, or market expansion strategies.'
      });
    }

    // 5. Industry-specific insights
    if (profileData.business_type?.toLowerCase().includes('electronics') || 
        profileData.business_type?.toLowerCase().includes('retail')) {
      
      const inventoryImpact = Math.round(revenue * 0.15); // Estimated inventory impact
      insights.push({
        id: 'inventory-optimization',
        type: 'alert',
        title: 'Inventory Turnover Analysis',
        description: 'Optimize inventory for better cash flow',
        impact: `₹${inventoryImpact.toLocaleString()}/month potential`,
        annualImpact: `₹${(inventoryImpact * 12).toLocaleString()}/year`,
        priority: 'medium',
        severity: 'medium',
        actionable: true,
        calculatedSavings: inventoryImpact,
        details: 'Electronics retail typically benefits from faster inventory turnover. Consider demand forecasting and supplier optimization.',
        industry: 'Electronics Retail'
      });
    }

    // Sort by priority and impact
    return insights.sort((a, b) => {
      const priorityWeight = { high: 3, medium: 2, low: 1 };
      return (priorityWeight[b.priority] - priorityWeight[a.priority]) || 
             ((b.calculatedSavings || 0) - (a.calculatedSavings || 0));
    });
  }

  /**
   * Generate action required alerts
   */
  static generateActionRequired(insights: DynamicInsight[]): DynamicInsight | null {
    // Find the highest priority actionable insight
    const actionableInsights = insights.filter(insight => 
      insight.actionable && (insight.priority === 'high' || insight.calculatedSavings && insight.calculatedSavings > 10000)
    );

    return actionableInsights.length > 0 ? actionableInsights[0] : null;
  }

  /**
   * Estimate inventory turnover (placeholder - would use real data in production)
   */
  private static estimateInventoryTurnover(profileData: ProfileData): number {
    // This is a simplified estimation - in reality, you'd calculate this from actual inventory data
    const industryAverages: { [key: string]: number } = {
      'electronics': 6, // 6 times per year = 60 days
      'retail': 8,
      'food': 12,
      'services': 0, // Services don't have inventory
      'default': 6
    };

    const businessType = profileData.business_type?.toLowerCase() || 'default';
    for (const [key, value] of Object.entries(industryAverages)) {
      if (businessType.includes(key)) {
        return value;
      }
    }
    
    return industryAverages.default;
  }
}

export default InsightsGenerator;