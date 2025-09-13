const OpenAI = require("openai");
const config = require("./env");

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: config.openai.apiKey,
});

// Helper function to create chat completion
const createChatCompletion = async (messages, options = {}) => {
  try {
    const completion = await openai.chat.completions.create({
      model: options.model || "gpt-4o-mini",
      messages,
      max_tokens: options.max_tokens || 1000,
      temperature: options.temperature || 0.7,
      ...options,
    });

    return completion.choices[0].message.content;
  } catch (error) {
    console.error("OpenAI API Error:", error);
    throw new Error("Failed to generate AI response");
  }
};

// Helper function for financial advice chat
const generateFinancialAdvice = async (userMessage, userProfile = {}) => {
  const systemPrompt = `You are a Virtual CFO assistant for small and medium businesses in India. 
  Provide practical, actionable financial advice based on the user's business context.
  
  User Business Context:
  - Business Name: ${userProfile.business_name || "Not specified"}
  - Business Type: ${userProfile.business_type || "Not specified"}
  - Location: ${userProfile.location || "India"}
  - Monthly Revenue: ₹${userProfile.monthly_revenue || "Not specified"}
  - Monthly Expenses: ₹${userProfile.monthly_expenses || "Not specified"}
  
  Guidelines:
  - Provide specific, actionable advice
  - Focus on Indian business context and regulations
  - Include relevant financial metrics and KPIs
  - Suggest practical implementation steps
  - Keep responses concise but comprehensive`;

  const messages = [
    { role: "system", content: systemPrompt },
    { role: "user", content: userMessage },
  ];

  return await createChatCompletion(messages, { max_tokens: 1500 });
};

// Helper function for business ideas
const generateBusinessIdeas = async (budget, field) => {
  const systemPrompt = `You are a business consultant specializing in trending global business ideas adapted for the Indian market.
  Provide practical, feasible business ideas that consider local market conditions, regulations, and cultural preferences.
  
  Focus on:
  - Current global business trends
  - Indian market adaptation
  - Realistic budget requirements
  - ROI potential and timelines
  - Implementation feasibility`;

  const userPrompt = `Generate trending business ideas for the ${field} industry with a budget of ₹${budget}.
  
  Requirements:
  - Budget: ₹${budget}
  - Industry: ${field}
  - Market: India
  - Focus: Trending global concepts adapted for Indian market
  
  Please provide:
  1. 3-5 specific business ideas
  2. Investment breakdown for each
  3. Market potential and target audience
  4. Implementation timeline
  5. Expected ROI and break-even period`;

  const messages = [
    { role: "system", content: systemPrompt },
    { role: "user", content: userPrompt },
  ];

  return await createChatCompletion(messages, { max_tokens: 2000 });
};

module.exports = {
  openai,
  createChatCompletion,
  generateFinancialAdvice,
  generateBusinessIdeas,
};
