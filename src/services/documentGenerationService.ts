import { documentService } from './documentService';
import { supabase } from '@/integrations/supabase/client';

/**
 * Service to handle automatic document generation for different sections of the application
 */
export const documentGenerationService = {
  /**
   * Automatically create a market research document for a project
   */
  async createMarketResearchDocument(
    userId: string,
    projectId: string,
    marketData: any
  ): Promise<void> {
    console.log('Creating market research document for project', projectId);
    
    try {
      // First check if document already exists to avoid duplicates
      const { data: existingDocs } = await supabase
        .from('documents')
        .select('id')
        .eq('project_id', projectId)
        .eq('type', 'market_research');
      
      if (existingDocs && existingDocs.length > 0) {
        console.log('Market research document already exists, updating...');
        // Update existing document
        const docId = existingDocs[0].id;
        
        await documentService.updateDocument(docId, {
          content: this.formatMarketResearchContent(marketData),
          updated_at: new Date().toISOString()
        });
        
        return;
      }
      
      // Create new document
      await documentService.createDocument({
        title: `Market Research - ${new Date().toLocaleDateString()}`,
        type: 'market_research',
        content: this.formatMarketResearchContent(marketData),
        user_id: userId,
        project_id: projectId,
        is_auto_generated: true
      });
      
      console.log('Market research document created successfully');
    } catch (error) {
      console.error('Error creating market research document:', error);
      
      // Fallback to localStorage if document creation fails
      try {
        localStorage.setItem(
          `document_${projectId}_market_research`,
          this.formatMarketResearchContent(marketData)
        );
        console.log('Saved market research document to localStorage as fallback');
      } catch (localStorageError) {
        console.error('Failed to save market research to localStorage:', localStorageError);
      }
    }
  },
  
  /**
   * Format the market research content into a readable document
   */
  formatMarketResearchContent(marketData: any): string {
    if (!marketData) return 'No market research data available.';
    
    // Format the data into a structured document
    return `# Market Research Summary
    
## Market Analysis
${marketData.marketAnalysis || 'No market analysis data available.'}

## Target Audience
${marketData.targetAudience || 'No target audience data available.'}

## Competitor Analysis
${marketData.competitorAnalysis || 'No competitor analysis data available.'}

## Market Trends
${marketData.marketTrends || 'No market trends data available.'}

## Opportunities
${marketData.opportunities || 'No opportunities data available.'}

Generated on: ${new Date().toLocaleString()}
`;
  },
  
  /**
   * Automatically create a project planning document for a project
   */
  async createProjectPlanningDocument(
    userId: string,
    projectId: string,
    planningData: any
  ): Promise<void> {
    console.log('Creating project planning document for project', projectId);
    
    try {
      // First check if document already exists to avoid duplicates
      const { data: existingDocs } = await supabase
        .from('documents')
        .select('id')
        .eq('project_id', projectId)
        .eq('type', 'project_planning');
      
      if (existingDocs && existingDocs.length > 0) {
        console.log('Project planning document already exists, updating...');
        // Update existing document
        const docId = existingDocs[0].id;
        
        await documentService.updateDocument(docId, {
          content: this.formatProjectPlanningContent(planningData),
          updated_at: new Date().toISOString()
        });
        
        return;
      }
      
      // Create new document
      await documentService.createDocument({
        title: `Project Plan - ${new Date().toLocaleDateString()}`,
        type: 'project_planning',
        content: this.formatProjectPlanningContent(planningData),
        user_id: userId,
        project_id: projectId,
        is_auto_generated: true
      });
      
      console.log('Project planning document created successfully');
    } catch (error) {
      console.error('Error creating project planning document:', error);
      
      // Fallback to localStorage if document creation fails
      try {
        localStorage.setItem(
          `document_${projectId}_project_planning`,
          this.formatProjectPlanningContent(planningData)
        );
        console.log('Saved project planning document to localStorage as fallback');
      } catch (localStorageError) {
        console.error('Failed to save project planning to localStorage:', localStorageError);
      }
    }
  },
  
  /**
   * Format the project planning content into a readable document
   */
  formatProjectPlanningContent(planningData: any): string {
    if (!planningData) return 'No project planning data available.';
    
    // Format the data into a structured document
    return `# Project Planning Summary
    
## Timeline & Milestones
${planningData.timeline || 'No timeline data available.'}

## Resources Required
${planningData.resources || 'No resource data available.'}

## Technical Requirements
${planningData.technicalRequirements || 'No technical requirements data available.'}

## Risks & Mitigation
${planningData.risks || 'No risk assessment data available.'}

Generated on: ${new Date().toLocaleString()}
`;
  },
  
  /**
   * Automatically create a design & development document for a project
   */
  async createDesignDevelopmentDocument(
    userId: string,
    projectId: string,
    designData: any
  ): Promise<void> {
    console.log('Creating design & development document for project', projectId);
    
    try {
      // First check if document already exists to avoid duplicates
      const { data: existingDocs } = await supabase
        .from('documents')
        .select('id')
        .eq('project_id', projectId)
        .eq('type', 'design_development');
      
      if (existingDocs && existingDocs.length > 0) {
        console.log('Design & development document already exists, updating...');
        // Update existing document
        const docId = existingDocs[0].id;
        
        await documentService.updateDocument(docId, {
          content: this.formatDesignDevelopmentContent(designData),
          updated_at: new Date().toISOString()
        });
        
        return;
      }
      
      // Create new document
      await documentService.createDocument({
        title: `Design & Development - ${new Date().toLocaleDateString()}`,
        type: 'design_development',
        content: this.formatDesignDevelopmentContent(designData),
        user_id: userId,
        project_id: projectId,
        is_auto_generated: true
      });
      
      console.log('Design & development document created successfully');
    } catch (error) {
      console.error('Error creating design & development document:', error);
      
      // Fallback to localStorage if document creation fails
      try {
        localStorage.setItem(
          `document_${projectId}_design_development`,
          this.formatDesignDevelopmentContent(designData)
        );
        console.log('Saved design & development document to localStorage as fallback');
      } catch (localStorageError) {
        console.error('Failed to save design & development to localStorage:', localStorageError);
      }
    }
  },
  
  /**
   * Format the design & development content into a readable document
   */
  formatDesignDevelopmentContent(designData: any): string {
    if (!designData) return 'No design & development data available.';
    
    // Format the data into a structured document
    return `# Design & Development Summary
    
## UI/UX Design
${designData.uiDesign || 'No UI/UX design data available.'}

## System Architecture
${designData.architecture || 'No system architecture data available.'}

## Technology Stack
${designData.techStack || 'No technology stack data available.'}

## Implementation Plan
${designData.implementationPlan || 'No implementation plan data available.'}

Generated on: ${new Date().toLocaleString()}
`;
  }
};