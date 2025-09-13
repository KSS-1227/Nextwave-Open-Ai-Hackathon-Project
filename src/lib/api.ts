import { supabase } from '@/integrations/supabase/client';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Helper function to get auth token
const getAuthToken = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token;
};

// Helper function to make authenticated API calls
const apiCall = async (endpoint: string, options: RequestInit = {}) => {
  const token = await getAuthToken();
  
  const defaultHeaders = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Network error' }));
    throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
  }

  return response.json();
};

// Profile API
export const profileAPI = {
  // Get user profile
  getProfile: async () => {
    return apiCall('/api/profile');
  },

  // Create or update profile
  updateProfile: async (profileData: {
    business_name: string;
    owner_name: string;
    business_type: string;
    location: string;
    monthly_revenue: number;
    monthly_expenses: number;
    preferred_language: string;
  }) => {
    return apiCall('/api/profile', {
      method: 'POST',
      body: JSON.stringify(profileData),
    });
  },

  // Get profile statistics
  getProfileStats: async () => {
    return apiCall('/api/profile/stats');
  },
};

// Document API
export const documentAPI = {
  // Get all documents
  getDocuments: async (params?: {
    page?: number;
    limit?: number;
    doc_type?: string;
    status?: string;
  }) => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.doc_type) queryParams.append('doc_type', params.doc_type);
    if (params?.status) queryParams.append('status', params.status);
    
    const endpoint = `/api/documents${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return apiCall(endpoint);
  },

  // Get specific document
  getDocument: async (id: string) => {
    return apiCall(`/api/documents/${id}`);
  },

  // Create document record
  createDocument: async (documentData: {
    file_name: string;
    file_url: string;
    doc_type?: string;
    extracted_text?: string;
    file_size?: number;
    mime_type?: string;
  }) => {
    return apiCall('/api/documents', {
      method: 'POST',
      body: JSON.stringify(documentData),
    });
  },

  // Update document
  updateDocument: async (id: string, documentData: {
    file_name?: string;
    doc_type?: string;
    extracted_text?: string;
    status?: string;
  }) => {
    return apiCall(`/api/documents/${id}`, {
      method: 'PUT',
      body: JSON.stringify(documentData),
    });
  },

  // Delete document
  deleteDocument: async (id: string) => {
    return apiCall(`/api/documents/${id}`, {
      method: 'DELETE',
    });
  },

  // Get document statistics
  getDocumentStats: async () => {
    return apiCall('/api/documents/stats');
  },
};

// AI Chat API
export const chatAPI = {
  // Send chat message with Graph RAG
  sendMessage: async (message: string) => {
    return apiCall('/api/chat', {
      method: 'POST',
      body: JSON.stringify({ message }),
    });
  },

  // Get financial insights with Graph RAG
  getInsights: async () => {
    return apiCall('/api/chat/insights');
  },

  // Get enhanced chat history with knowledge context
  getChatHistory: async (conversationId?: string, limit?: number) => {
    const params = new URLSearchParams();
    if (conversationId) params.append('conversation_id', conversationId);
    if (limit) params.append('limit', limit.toString());
    
    const queryString = params.toString();
    return apiCall(`/api/chat/history${queryString ? '?' + queryString : ''}`);
  },

  // Get knowledge graph visualization data
  getKnowledgeGraph: async (limit?: number) => {
    const params = new URLSearchParams();
    if (limit) params.append('limit', limit.toString());
    
    const queryString = params.toString();
    return apiCall(`/api/chat/knowledge-graph${queryString ? '?' + queryString : ''}`);
  },
};



// Earnings API - Aligned with your database structure
export const earningsAPI = {
  // Add daily earnings entry
  addEarnings: async (earningsData: {
    earning_date: string;  // Your DB column name
    amount: number;        // Your DB column name
    inventory_cost: number;
    file_url?: string;
    doc_type?: string;
    processed_text?: string;
  }) => {
    const token = await getAuthToken();
    const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/earnings-add`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(earningsData),
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Network error' }));
      throw new Error(error.error || `HTTP error! status: ${response.status}`);
    }
    
    return response.json();
  },

  // Get earnings summary and analytics
  getSummary: async (userId?: string) => {
    const token = await getAuthToken();
    const endpoint = userId ? `/functions/v1/earnings-summary/${userId}` : '/functions/v1/earnings-summary';
    
    const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}${endpoint}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Network error' }));
      throw new Error(error.error || `HTTP error! status: ${response.status}`);
    }
    
    return response.json();
  },

  // Get earnings for a specific date range
  getEarningsByDateRange: async (startDate: string, endDate: string) => {
    const { data, error } = await supabase
      .from('earnings')
      .select('*')
      .gte('earning_date', startDate)  // Using your column name
      .lte('earning_date', endDate)    // Using your column name
      .order('earning_date', { ascending: false });
    
    if (error) throw new Error(error.message);
    return { success: true, data };
  },

  // Update earnings (basic fields only)
  updateEarnings: async (id: string, updates: {
    earning_date?: string;
    amount?: number;
    inventory_cost?: number;
    file_url?: string;
    doc_type?: string;
    processed_text?: string;
  }) => {
    const { data, error } = await supabase
      .from('earnings')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw new Error(error.message);
    return { success: true, data };
  },

  // Delete earnings entry
  deleteEarnings: async (id: string) => {
    const { data, error } = await supabase
      .from('earnings')
      .delete()
      .eq('id', id);
    
    if (error) throw new Error(error.message);
    return { success: true, message: 'Earnings deleted successfully' };
  },

  // Test connection to earnings table
  testConnection: async () => {
    const token = await getAuthToken();
    const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/connection-test`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Network error' }));
      throw new Error(error.error || `HTTP error! status: ${response.status}`);
    }
    
    return response.json();
  },
};

// Profile API - Enhanced with notification settings
export const enhancedProfileAPI = {
  ...profileAPI,
  
  // Update notification preferences
  updateNotificationSettings: async (settings: {
    phone_number?: string;
    notify_whatsapp?: boolean;
    notify_email?: boolean;
  }) => {
    const { data, error } = await supabase
      .from('profiles')
      .update(settings)
      .eq('id', (await supabase.auth.getUser()).data.user?.id)
      .select()
      .single();
    
    if (error) throw new Error(error.message);
    return { success: true, data };
  },

  // Get notification settings
  getNotificationSettings: async () => {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('User not authenticated');
    
    const { data, error } = await supabase
      .from('profiles')
      .select('phone_number, notify_whatsapp, notify_email')
      .eq('id', user.user.id)
      .single();
    
    if (error) throw new Error(error.message);
    return { success: true, data };
  },
};

// Business Ideas API
export const businessIdeasAPI = {
  // Generate business ideas with Graph RAG
  generateIdeas: async (budget: number, field: string) => {
    return apiCall('/api/business-ideas', {
      method: 'POST',
      body: JSON.stringify({ budget, field }),
    });
  },

  // Get trending sectors with personalization
  getTrendingSectors: async () => {
    return apiCall('/api/business-ideas/trending');
  },

  // Get investment recommendations
  getInvestmentRecommendations: async (budget: number) => {
    return apiCall(`/api/business-ideas/recommendations?budget=${budget}`);
  },
};

// Health check
export const healthAPI = {
  // Check API health
  checkHealth: async () => {
    return apiCall('/health');
  },

  // Get API info
  getInfo: async () => {
    return apiCall('/api');
  },
};

// Error handling utility
export const handleAPIError = (error: unknown) => {
  console.error('API Error:', error);
  
  const errorMessage = error instanceof Error ? error.message : String(error);
  
  if (errorMessage?.includes('token')) {
    return 'Authentication required. Please log in again.';
  }
  
  if (errorMessage?.includes('rate limit')) {
    return 'Too many requests. Please try again in a moment.';
  }
  
  if (errorMessage?.includes('Network error')) {
    return 'Network error. Please check your connection.';
  }
  
  return errorMessage || 'An unexpected error occurred.';
};