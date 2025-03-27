
export type DocumentAnalysisParams = {
  userId: string;
  projectId: string;
  documentContent: string;
  analysisType: 'requirements' | 'competitive' | 'general';
};

export type DocumentAnalysisResponse = {
  success: boolean;
  analysis: {
    id: string;
    content: string;
    model: string;
    extendedThinking: boolean;
    thinking?: string;
  };
  credits_remaining: number;
};

export async function analyzeDocument(params: DocumentAnalysisParams): Promise<DocumentAnalysisResponse> {
  try {
    const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/document-analysis`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
      },
      body: JSON.stringify(params),
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Error analyzing document');
    }
    
    return data;
  } catch (error: any) {
    console.error('Error analyzing document:', error);
    throw error;
  }
}
