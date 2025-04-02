import { supabase } from '@/integrations/supabase/client';
import { Document } from '@/types/supabase';
import { documentService } from './documentService';

/**
 * Document section types - internal keys
 */
// Market Research section types
export type MarketResearchSectionType = 
  | 'market_research_audience'
  | 'market_research_trends'
  | 'market_research_competitive'
  | 'market_research_demand'
  | 'market_research_regulatory';

// Project Planning section types  
export type ProjectPlanningSectionType = 
  | 'project_planning_objectives'
  | 'project_planning_tasks'
  | 'project_planning_resources'
  | 'project_planning_risks'
  | 'project_planning_stakeholders'
  | 'project_planning_metrics';

// Design & Development section types
export type DesignDevelopmentSectionType = 
  | 'design_development_wireframes'
  | 'design_development_tech_stack'
  | 'design_development_user_journeys'
  | 'design_development_documentation';

// All section types
export type SectionType = 
  | MarketResearchSectionType
  | ProjectPlanningSectionType
  | DesignDevelopmentSectionType;

/**
 * Friendly parent category names for UI display
 */
export type CategoryType = 'market_research' | 'project_planning' | 'design_development';

/**
 * Document category colors for UI
 */
export const CATEGORY_COLORS = {
  market_research: 'blue',
  project_planning: 'green',
  design_development: 'purple'
};

/**
 * Get the parent category for a section
 */
export function getSectionCategory(sectionType: SectionType): string {
  if (sectionType.startsWith('market_research_')) {
    return 'Market Research';
  } else if (sectionType.startsWith('project_planning_')) {
    return 'Project Planning';
  } else if (sectionType.startsWith('design_development_')) {
    return 'Design & Development';
  }
  return 'Other';
}

/**
 * Get the document type (for database storage) that corresponds to a section
 * This transforms the internal section keys to the document type used for tagging
 */
export function getSectionDocumentType(sectionType: SectionType): string {
  if (sectionType.startsWith('market_research_')) {
    return 'market_research';
  } else if (sectionType.startsWith('project_planning_')) {
    return 'project_planning';
  } else if (sectionType.startsWith('design_development_')) {
    return 'design_development';
  }
  return sectionType;
}

/**
 * Get a standardized title for a section type
 */
export function getSectionTitle(sectionType: SectionType): string {
  switch (sectionType) {
    // Market Research
    case 'market_research_audience': return 'Audience Analysis';
    case 'market_research_trends': return 'Market Trends';
    case 'market_research_competitive': return 'Competitive Analysis';
    case 'market_research_demand': return 'Demand & Growth';
    case 'market_research_regulatory': return 'Legal & Regulatory';
    
    // Project Planning
    case 'project_planning_objectives': return 'Objectives & Goals';
    case 'project_planning_tasks': return 'Tasks & Timeline';
    case 'project_planning_resources': return 'Resource Allocation';
    case 'project_planning_risks': return 'Risk Management';
    case 'project_planning_stakeholders': return 'Stakeholder Analysis';
    case 'project_planning_metrics': return 'Metrics & Success Criteria';
    
    // Design & Development
    case 'design_development_wireframes': return 'Wireframes';
    case 'design_development_tech_stack': return 'Tech Stack';
    case 'design_development_user_journeys': return 'User Journeys';
    case 'design_development_documentation': return 'Documentation';
    
    default:
      // Format the section type as a title
      return sectionType
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
  }
}

export const documentSectionService = {
  /**
   * Create or update a document section
   */
  async saveSection(
    projectId: string,
    userId: string,
    sectionType: SectionType,
    content: string
  ): Promise<Document | null> {
    try {
      console.log(`DocumentSectionService: Saving section ${sectionType}`);
      
      // Use parent category as the visible tag for better organization
      const documentType = getSectionDocumentType(sectionType);
      
      // The section title that will be shown in the document hub
      const sectionTitle = getSectionTitle(sectionType);
      
      // Since we don't have a section_id column, we need a different approach
      // We'll use the section title and type to identify the document
      const { data: existingDocs, error: existingDocsError } = await supabase
        .from('documents')
        .select('id')
        .eq('project_id', projectId)
        .eq('title', sectionTitle)
        .eq('type', documentType)
        .limit(1);
        
      if (existingDocsError) {
        console.error('Error checking for existing section:', existingDocsError);
        throw existingDocsError;
      }
      
      if (existingDocs && existingDocs.length > 0) {
        // Update existing document
        const docId = existingDocs[0].id;
        console.log(`DocumentSectionService: Updating existing section with ID ${docId}`);
        
        return await documentService.updateDocument(docId, {
          content,
          updated_at: new Date().toISOString()
        });
      } else {
        // Create new document
        console.log(`DocumentSectionService: Creating new section for ${sectionType} with title ${sectionTitle}`);
        
        return await documentService.createDocument({
          title: sectionTitle,
          type: documentType, // This is the document type that appears as the tag
          content,
          user_id: userId,
          project_id: projectId,
          is_auto_generated: true
        });
      }
    } catch (error) {
      console.error('DocumentSectionService: Save section failed', error);
      return null;
    }
  },
  
  /**
   * Get a specific section document
   */
  async getSection(
    projectId: string,
    sectionType: SectionType
  ): Promise<Document | null> {
    try {
      console.log(`DocumentSectionService: Getting section ${sectionType}`);
      
      // Get document type and title for this section
      const documentType = getSectionDocumentType(sectionType);
      const sectionTitle = getSectionTitle(sectionType);
      
      // Try to find document by title and type
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('project_id', projectId)
        .eq('title', sectionTitle)
        .eq('type', documentType)
        .limit(1)
        .single();
        
      if (!error) {
        // Found document by title and type
        return data as Document;
      }
      
      if (error.code !== 'PGRST116') {
        // Some error other than "not found"
        throw error;
      }
      
      // Fall back to trying by type (old method)
      const { data: oldData, error: oldError } = await supabase
        .from('documents')
        .select('*')
        .eq('project_id', projectId)
        .eq('type', sectionType)
        .limit(1)
        .single();
        
      if (!oldError) {
        return oldData as Document;
      }
      
      if (oldError.code === 'PGRST116') {
        // No results found with either method
        console.log(`DocumentSectionService: No document found for section ${sectionType}`);
        return null;
      }
      
      throw oldError;
    } catch (error) {
      console.error('DocumentSectionService: Get section failed', error);
      return null;
    }
  },
  
  /**
   * Get all sections for a specific category
   */
  async getSectionsByCategory(
    projectId: string,
    category: 'Market Research' | 'Project Planning' | 'Design & Development'
  ): Promise<Document[]> {
    try {
      console.log(`DocumentSectionService: Getting sections for category ${category}`);
      
      // Convert from display category name to document type
      let documentType: string;
      let sectionPrefix: string;
      
      switch (category) {
        case 'Market Research':
          documentType = 'market_research';
          sectionPrefix = 'market_research_';
          break;
        case 'Project Planning':
          documentType = 'project_planning';
          sectionPrefix = 'project_planning_';
          break;
        case 'Design & Development':
          documentType = 'design_development';
          sectionPrefix = 'design_development_';
          break;
        default:
          throw new Error(`Unknown category: ${category}`);
      }
      
      // Try first with the new approach (by type and section_id)
      const { data: newData, error: newError } = await supabase
        .from('documents')
        .select('*')
        .eq('project_id', projectId)
        .eq('type', documentType)
        .order('updated_at', { ascending: false });
        
      if (!newError && newData && newData.length > 0) {
        return newData as Document[];
      }
      
      // Fall back to legacy approach (by type prefix)
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('project_id', projectId)
        .like('type', `${sectionPrefix}%`)
        .order('updated_at', { ascending: false });
        
      if (error) {
        throw error;
      }
      
      return data as Document[];
    } catch (error) {
      console.error(`DocumentSectionService: Get sections for category ${category} failed`, error);
      return [];
    }
  }
};