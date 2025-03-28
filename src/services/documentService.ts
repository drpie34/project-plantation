import { supabase } from '@/integrations/supabase/client';
import { Document } from '@/types/supabase';

export type DocumentCreateParams = {
  title: string;
  type: Document['type'];
  content: string;
  user_id: string;
  project_id: string;
  is_auto_generated?: boolean;
  file_path?: string;
  file_type?: string;
  file_size?: number;
};

export type DocumentUpdateParams = Partial<Omit<Document, 'id' | 'created_at'>>;

/**
 * Service for managing document operations
 */
// Helper functions for document service
function saveToLocalStorage(params: DocumentCreateParams): void {
  try {
    localStorage.setItem(`document_${params.project_id}_${params.type}`, params.content);
    console.log('DocumentService: Saved document to localStorage');
  } catch (storageError) {
    console.error('DocumentService: Failed to save to localStorage', storageError);
  }
}

function constructFallbackDocument(params: DocumentCreateParams): Document {
  const now = new Date().toISOString();
  return {
    id: `local_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    title: params.title,
    type: params.type,
    content: params.content,
    project_id: params.project_id,
    user_id: params.user_id,
    created_at: now,
    updated_at: now,
    is_auto_generated: params.is_auto_generated || false,
    file_path: params.file_path,
    file_type: params.file_type,
    file_size: params.file_size
  };
}

export const documentService = {
  /**
   * Create a new document
   */
  async createDocument(params: DocumentCreateParams): Promise<Document | null> {
    console.log('DocumentService: Creating document', params);
    
    // Check if documents table exists
    const { error: schemaError } = await supabase
      .from('documents')
      .select('id')
      .limit(1)
      .maybeSingle();
      
    if (schemaError && schemaError.code === '42P01') {
      console.warn('DocumentService: documents table does not exist');
      throw new Error('Documents table does not exist. Please create it in the Supabase dashboard.');
    }
    
    const documentToCreate = {
      ...params,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    try {
      // First, let's log the attempt
      console.log('DocumentService: Attempting to create document with data:', 
        JSON.stringify({
          title: documentToCreate.title,
          type: documentToCreate.type,
          project_id: documentToCreate.project_id,
          user_id: documentToCreate.user_id,
          is_auto_generated: documentToCreate.is_auto_generated,
          content_length: documentToCreate.content.length
        })
      );
      
      try {
        // First attempt - standard insert
        const { data, error } = await supabase
          .from('documents')
          .insert(documentToCreate)
          .select()
          .single();
          
        if (error) {
          console.error('DocumentService: Insert failed', error);
          
          // Second attempt - upsert
          console.log('DocumentService: Trying upsert method instead');
          const { data: upsertData, error: upsertError } = await supabase
            .from('documents')
            .upsert(documentToCreate)
            .select()
            .single();
            
          if (upsertError) {
            console.error('DocumentService: Upsert failed', upsertError);
            
            // Third attempt - RPC if available
            console.log('DocumentService: Trying direct insert without returning data');
            const { error: insertError } = await supabase
              .from('documents')
              .insert(documentToCreate);
              
            if (insertError) {
              console.error('DocumentService: All database methods failed', insertError);
              throw insertError;
            }
            
            // If we get here, the insert worked but we don't have the data
            // Let's try to fetch it
            console.log('DocumentService: Trying to fetch the inserted document');
            const { data: fetchedData, error: fetchError } = await supabase
              .from('documents')
              .select('*')
              .eq('project_id', documentToCreate.project_id)
              .eq('type', documentToCreate.type)
              .order('created_at', { ascending: false })
              .limit(1)
              .single();
              
            if (fetchError) {
              console.error('DocumentService: Could not fetch inserted document', fetchError);
              // Fall back to localStorage and return a constructed document
              saveToLocalStorage(documentToCreate);
              return constructFallbackDocument(documentToCreate);
            }
            
            console.log('DocumentService: Successfully fetched document after insert', fetchedData);
            return fetchedData as Document;
          }
          
          console.log('DocumentService: Created document via upsert', upsertData);
          return upsertData as Document;
        }
        
        console.log('DocumentService: Created document via insert', data);
        return data as Document;
      } catch (error) {
        console.error('DocumentService: Unexpected error during document creation', error);
        // Fall back to localStorage and return a constructed document
        saveToLocalStorage(documentToCreate);
        return constructFallbackDocument(documentToCreate);
      }
    } catch (error) {
      console.error('DocumentService: All creation attempts failed', error);
      
      // Save to localStorage as a final fallback
      saveToLocalStorage(params);
      return constructFallbackDocument(params);
    }
  },
  
  /**
   * Get all documents for a project
   */
  async getProjectDocuments(projectId: string): Promise<Document[]> {
    console.log('DocumentService: Fetching documents for project', projectId);
    
    try {
      // First try to get from database
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('project_id', projectId)
        .order('updated_at', { ascending: false });
        
      if (error) {
        console.error('DocumentService: Error fetching documents', error);
        throw error;
      }
      
      const databaseDocuments = data as Document[] || [];
      console.log(`DocumentService: Found ${databaseDocuments.length} documents in database`);
      
      // Always check localStorage for additional documents
      const localStorageDocuments = this.getLocalStorageDocuments(projectId);
      console.log(`DocumentService: Found ${localStorageDocuments.length} documents in localStorage`);
      
      // Combine results, but prevent duplicates by checking type
      // If a document from the database exists with the same type as a localStorage document,
      // prefer the database version
      const documentTypes = new Set(databaseDocuments.map(doc => doc.type));
      
      // Only add localStorage documents for types we don't have from the database
      const additionalLocalDocs = localStorageDocuments.filter(
        doc => !documentTypes.has(doc.type)
      );
      
      if (additionalLocalDocs.length > 0) {
        console.log(`DocumentService: Adding ${additionalLocalDocs.length} unique documents from localStorage`);
      }
      
      const allDocuments = [...databaseDocuments, ...additionalLocalDocs];
      
      // Debug log all documents
      console.log('DocumentService: All documents:', 
        allDocuments.map(d => ({ id: d.id, title: d.title, type: d.type, source: d.id.startsWith('local_') ? 'localStorage' : 'database' }))
      );
      
      return allDocuments;
    } catch (error) {
      console.error('DocumentService: Failed to fetch documents from database', error);
      
      // Fall back to localStorage only
      const localStorageDocuments = this.getLocalStorageDocuments(projectId);
      console.log(`DocumentService: Falling back to ${localStorageDocuments.length} localStorage documents`);
      
      return localStorageDocuments;
    }
  },
  
  /**
   * Get documents from localStorage for a project
   * @private
   */
  getLocalStorageDocuments(projectId: string): Document[] {
    const documents: Document[] = [];
    
    try {
      // Check for localStorage documents
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith(`document_${projectId}`)) {
          const parts = key.split('_');
          const type = parts[2] as Document['type'];
          const content = localStorage.getItem(key) || '';
          
          let title = `Document - ${type.replace('_', ' ')}`;
          // Make a nicer title for project_overview type
          if (type === 'project_overview') {
            title = 'Project Overview';
          }
          
          documents.push({
            id: `local_${Date.now()}_${i}`,
            title,
            type,
            content,
            project_id: projectId,
            user_id: 'local-user',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            is_auto_generated: true  // Set to true so it shows up in the right tab
          });
        }
      }
    } catch (storageError) {
      console.error('DocumentService: Failed to read from localStorage', storageError);
    }
    
    return documents;
  },
  
  /**
   * Get a single document by ID
   */
  async getDocument(id: string): Promise<Document | null> {
    console.log('DocumentService: Fetching document', id);
    
    try {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('id', id)
        .single();
        
      if (error) {
        console.error('DocumentService: Error fetching document', error);
        throw error;
      }
      
      return data as Document;
    } catch (error) {
      console.error('DocumentService: Failed to fetch document', error);
      return null;
    }
  },
  
  /**
   * Update a document
   */
  async updateDocument(id: string, updates: DocumentUpdateParams): Promise<Document | null> {
    console.log('DocumentService: Updating document', id, updates);
    
    const updatedContent = {
      ...updates,
      updated_at: new Date().toISOString()
    };
    
    try {
      const { data, error } = await supabase
        .from('documents')
        .update(updatedContent)
        .eq('id', id)
        .select()
        .single();
        
      if (error) {
        console.error('DocumentService: Error updating document', error);
        throw error;
      }
      
      console.log('DocumentService: Updated document', data);
      return data as Document;
    } catch (error) {
      console.error('DocumentService: Failed to update document', error);
      return null;
    }
  },
  
  /**
   * Delete a document
   */
  async deleteDocument(id: string): Promise<boolean> {
    console.log('DocumentService: Deleting document', id);
    
    try {
      // First get the document to check if it has a file
      const { data: document, error: getError } = await supabase
        .from('documents')
        .select('*')
        .eq('id', id)
        .single();
        
      if (getError) {
        console.error('DocumentService: Error getting document for deletion', getError);
        throw getError;
      }
      
      // If document has a file path, delete the file from storage
      if (document.file_path) {
        const filePath = document.file_path.split('/').pop();
        if (filePath) {
          await supabase
            .storage
            .from('documents')
            .remove([`${document.project_id}/${filePath}`]);
        }
      }
      
      // Delete the document record
      const { error } = await supabase
        .from('documents')
        .delete()
        .eq('id', id);
        
      if (error) {
        console.error('DocumentService: Error deleting document', error);
        throw error;
      }
      
      console.log('DocumentService: Deleted document');
      return true;
    } catch (error) {
      console.error('DocumentService: Failed to delete document', error);
      return false;
    }
  },
  
  /**
   * Upload a file and create a document
   */
  async uploadDocument(file: File, userId: string, projectId: string, title?: string): Promise<Document | null> {
    console.log('DocumentService: Uploading document', file.name);
    
    try {
      // Create a unique file name
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
      const filePath = `${projectId}/${fileName}`;
      
      // Upload to storage
      const { data: uploadData, error: uploadError } = await supabase
        .storage
        .from('documents')
        .upload(filePath, file);
        
      if (uploadError) {
        console.error('DocumentService: Error uploading file', uploadError);
        throw uploadError;
      }
      
      // Get public URL
      const { data: urlData } = await supabase
        .storage
        .from('documents')
        .getPublicUrl(filePath);
        
      // Create document record
      return await this.createDocument({
        title: title || file.name,
        type: 'uploaded',
        content: `Uploaded file: ${file.name}`,
        user_id: userId,
        project_id: projectId,
        is_auto_generated: false,
        file_path: urlData.publicUrl,
        file_type: fileExt,
        file_size: file.size
      });
    } catch (error) {
      console.error('DocumentService: Failed to upload document', error);
      return null;
    }
  }
};