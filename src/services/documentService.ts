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

// Global state to prevent showing error multiple times
let documentTableErrorShown = false;

// Function to show a document table error banner once
function showDocumentTableError() {
  if (documentTableErrorShown || typeof window === 'undefined') return;
  documentTableErrorShown = true;
  
  // Create error banner
  const errorDiv = document.createElement('div');
  errorDiv.style.backgroundColor = '#f8d7da';
  errorDiv.style.color = '#721c24';
  errorDiv.style.padding = '10px';
  errorDiv.style.margin = '10px 0';
  errorDiv.style.borderRadius = '4px';
  errorDiv.style.position = 'fixed';
  errorDiv.style.top = '20px';
  errorDiv.style.left = '50%';
  errorDiv.style.transform = 'translateX(-50%)';
  errorDiv.style.zIndex = '9999';
  errorDiv.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
  errorDiv.style.maxWidth = '90%';
  errorDiv.style.width = '600px';
  errorDiv.innerHTML = `
    <h3 style="margin-top: 0;">Database Configuration Error</h3>
    <p>The database is not properly connected. Error: "relation "public.documents" does not exist"</p>
    <p>You are currently using localStorage fallback mode. All documents are stored locally in your browser and are not persisted to the database.</p>
    <button id="dismissDbError" style="background-color: #721c24; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer;">Dismiss</button>
  `;
  document.body.appendChild(errorDiv);
  
  // Add event listener to dismiss button
  document.getElementById('dismissDbError')?.addEventListener('click', () => {
    errorDiv.remove();
  });
}

export const documentService = {
  /**
   * Create a new document
   */
  async createDocument(params: DocumentCreateParams): Promise<Document | null> {
    console.log('DocumentService: Creating document', params);
    
    // Make sure we always have a document title and handle empty titles
    if (!params.title || params.title.trim() === '') {
      const now = new Date();
      params.title = `Document ${now.toLocaleDateString()} ${now.toLocaleTimeString()}`;
    }
    
    // Helper function to save to localStorage as a temporary backup
    const saveToLocalStorage = (data: any) => {
      try {
        const timestamp = new Date().toISOString();
        const key = `document_${data.project_id}_${data.type}`;
        const storageData = {
          content: data.content,
          timestamp,
          needsSync: true
        };
        
        localStorage.setItem(key, JSON.stringify(storageData));
        console.log('DocumentService: Saved document to localStorage as temporary backup');
      } catch (storageError) {
        console.error('DocumentService: Failed to save to localStorage', storageError);
      }
    };
    
    // Helper function to construct a temporary document for fallback
    const constructFallbackDocument = (data: any): Document => {
      const now = new Date().toISOString();
      const temporaryId = `local_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      console.warn(`DocumentService: Creating temporary document with ID ${temporaryId}. This document exists only in the browser and will need to be synced to the server when connectivity is restored.`);
      
      return {
        id: temporaryId,
        title: data.title,
        type: data.type,
        content: data.content,
        project_id: data.project_id,
        user_id: data.user_id,
        created_at: now,
        updated_at: now,
        is_auto_generated: data.is_auto_generated || false,
        file_path: data.file_path,
        file_type: data.file_type,
        file_size: data.file_size
      };
    };
    
    // Check if a document of this type already exists for this project
    // If so, we'll update it rather than create a new one to avoid duplicates
    try {
      const { data: existingDocs, error: existingDocsError } = await supabase
        .from('documents')
        .select('id')
        .eq('project_id', params.project_id)
        .eq('type', params.type)
        .limit(1);
        
      if (!existingDocsError && existingDocs && existingDocs.length > 0) {
        console.log(`DocumentService: Document of type ${params.type} already exists, updating instead of creating`);
        const docId = existingDocs[0].id;
        const updatedDoc = await this.updateDocument(docId, {
          content: params.content,
          updated_at: new Date().toISOString()
        });
        
        if (updatedDoc) {
          console.log('DocumentService: Successfully updated existing document');
          
          // Also save to localStorage as a backup but mark it as synced
          try {
            const key = `document_${params.project_id}_${params.type}`;
            const storageData = {
              content: params.content,
              timestamp: new Date().toISOString(),
              needsSync: false, // Marked as already synced
              id: updatedDoc.id // Keep track of the server ID
            };
            localStorage.setItem(key, JSON.stringify(storageData));
          } catch (e) {
            console.error('Failed to save to localStorage after update', e);
          }
          
          return updatedDoc;
        }
        // If update fails, continue with creation attempt
      }
    } catch (error) {
      console.error('Error checking for existing documents:', error);
      // Continue with document creation
    }
    
    const documentToCreate = {
      ...params,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    // Save to localStorage as a backup
    saveToLocalStorage(documentToCreate);
    
    try {
      // Standard method using insert
      const { data, error } = await supabase
        .from('documents')
        .insert(documentToCreate)
        .select()
        .single();
        
      if (error) {
        // If the error is because the table doesn't exist yet
        if (error.code === '42P01') {
          console.error('DocumentService: documents table does not exist in the database');
          // Show the error only once across all attempts
          showDocumentTableError();
          // Continue with the fallback
        }
        
        console.error('DocumentService: Insert failed, trying upsert method', error);
        
        // Try upsert method
        const { data: upsertData, error: upsertError } = await supabase
          .from('documents')
          .upsert(documentToCreate)
          .select()
          .single();
          
        if (upsertError) {
          console.error('DocumentService: Upsert also failed', upsertError);
          throw upsertError;
        }
        
        // Update localStorage with server ID
        try {
          const key = `document_${params.project_id}_${params.type}`;
          const storageData = {
            content: params.content,
            timestamp: new Date().toISOString(),
            needsSync: false,
            id: upsertData.id
          };
          localStorage.setItem(key, JSON.stringify(storageData));
        } catch (e) {
          console.error('Failed to update localStorage after upsert', e);
        }
        
        return upsertData as Document;
      }
      
      // Update localStorage with server ID
      try {
        const key = `document_${params.project_id}_${params.type}`;
        const storageData = {
          content: params.content,
          timestamp: new Date().toISOString(),
          needsSync: false,
          id: data.id
        };
        localStorage.setItem(key, JSON.stringify(storageData));
      } catch (e) {
        console.error('Failed to update localStorage after insert', e);
      }
      
      return data as Document;
    } catch (error) {
      console.error('DocumentService: All attempts to create document failed:', error);
      
      // Return a local fallback document as a last resort
      return constructFallbackDocument(documentToCreate);
    }
  },
  
  /**
   * Get all documents for a project
   */
  async getProjectDocuments(projectId: string): Promise<Document[]> {
    console.log('DocumentService: Fetching documents for project', projectId);
    
    try {
      // First get documents from database
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('project_id', projectId)
        .order('updated_at', { ascending: false });
        
      if (error) {
        // If the error is that the table doesn't exist
        if (error.code === '42P01') {
          console.error('DocumentService: documents table does not exist in the database');
          showDocumentTableError();
          // Continue with empty array instead of throwing
          return [];
        }
        throw error;
      }
      
      const databaseDocuments = data as Document[] || [];
      console.log(`DocumentService: Found ${databaseDocuments.length} documents in database`);
      
      // Create maps for quick lookups
      const databaseDocsByType = new Map<string, Document>();
      const databaseDocsById = new Map<string, Document>();
      
      databaseDocuments.forEach(doc => {
        databaseDocsByType.set(doc.type, doc);
        databaseDocsById.set(doc.id, doc);
      });
      
      // Check localStorage for documents that need syncing
      const unsyncedDocuments: Document[] = [];
      
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith(`document_${projectId}`)) {
          try {
            const storedDataStr = localStorage.getItem(key);
            if (!storedDataStr) continue;
            
            // Try to parse the localStorage data in the new format
            const storedData = JSON.parse(storedDataStr);
            const docType = key.split('_')[2];
            
            // Check if it's marked as needing sync
            if (storedData.needsSync === true) {
              console.log(`DocumentService: Found unsynced document in localStorage: ${docType}`);
              
              // Check if we already have this document in the database by type
              if (databaseDocsByType.has(docType)) {
                // Update the existing document in the database
                const dbDoc = databaseDocsByType.get(docType)!;
                console.log(`DocumentService: Syncing updates for document type: ${docType} with id: ${dbDoc.id}`);
                
                await this.updateDocument(dbDoc.id, {
                  content: storedData.content,
                  updated_at: new Date().toISOString()
                });
                
                // Mark as synced in localStorage
                localStorage.setItem(key, JSON.stringify({
                  ...storedData,
                  needsSync: false,
                  id: dbDoc.id,
                  timestamp: new Date().toISOString()
                }));
              } else {
                // Create a temporary document object to represent the unsynced document
                const doc: Document = {
                  id: `local_${Date.now()}_${i}`,
                  title: this.getDocumentTitle(docType),
                  type: docType,
                  content: storedData.content,
                  project_id: projectId,
                  user_id: 'local-user', // This will be replaced when synced
                  created_at: storedData.timestamp || new Date().toISOString(),
                  updated_at: storedData.timestamp || new Date().toISOString(),
                  is_auto_generated: true  // Assume auto-generated for localStorage
                };
                
                unsyncedDocuments.push(doc);
                
                // Try to sync it now
                try {
                  console.log(`DocumentService: Attempting to sync document type: ${docType} to database`);
                  const newDoc = await this.createDocument({
                    title: doc.title,
                    type: doc.type,
                    content: doc.content,
                    user_id: doc.user_id,
                    project_id: projectId,
                    is_auto_generated: true
                  });
                  
                  if (newDoc && !newDoc.id.startsWith('local_')) {
                    console.log(`DocumentService: Successfully synced document type: ${docType} to database`);
                    // Remove from unsynced and add to database documents
                    unsyncedDocuments.pop();
                    databaseDocuments.push(newDoc);
                    
                    // Update localStorage
                    localStorage.setItem(key, JSON.stringify({
                      content: storedData.content,
                      needsSync: false,
                      id: newDoc.id,
                      timestamp: new Date().toISOString()
                    }));
                  }
                } catch (syncError) {
                  console.error(`DocumentService: Failed to sync document type: ${docType}`, syncError);
                  // Keep in unsynced documents to return to user
                }
              }
            }
          } catch (parseError) {
            console.error('DocumentService: Error parsing localStorage data', parseError);
            // Skip this entry
          }
        }
      }
      
      // Combine database documents with any truly unsynced local documents
      const allDocuments = [...databaseDocuments, ...unsyncedDocuments];
      
      console.log('DocumentService: Returning documents:', 
        allDocuments.map(d => ({ 
          id: d.id, 
          title: d.title, 
          type: d.type, 
          source: d.id.startsWith('local_') ? 'localStorage (unsynced)' : 'database' 
        }))
      );
      
      return allDocuments;
    } catch (error) {
      console.error('DocumentService: Failed to fetch documents from database', error);
      
      // Fall back to localStorage only as a last resort
      console.warn('DocumentService: Falling back to localStorage only - documents will need to be synced later');
      
      const localDocs: Document[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith(`document_${projectId}`)) {
          try {
            const parts = key.split('_');
            const type = parts[2] as Document['type'];
            
            let content = '';
            let timestamp = new Date().toISOString();
            
            // Try to parse as JSON first (new format)
            try {
              const storedData = JSON.parse(localStorage.getItem(key) || '{}');
              content = storedData.content || '';
              timestamp = storedData.timestamp || timestamp;
            } catch (e) {
              // Fallback to old format (direct content string)
              content = localStorage.getItem(key) || '';
            }
            
            if (!content) continue;
            
            localDocs.push({
              id: `local_${Date.now()}_${i}`,
              title: this.getDocumentTitle(type),
              type,
              content,
              project_id: projectId,
              user_id: 'local-user',
              created_at: timestamp,
              updated_at: timestamp,
              is_auto_generated: true
            });
          } catch (e) {
            console.error('Error processing localStorage document', e);
          }
        }
      }
      
      console.log(`DocumentService: Returning ${localDocs.length} documents from localStorage as fallback`);
      return localDocs;
    }
  },
  
  /**
   * Get a standardized title for a document type
   * @private
   */
  getDocumentTitle(type: string): string {
    switch (type) {
      case 'project_overview': return 'Project Overview';
      case 'market_research': return 'Market Research';
      case 'project_planning': return 'Project Planning';
      case 'design_development': return 'Design & Development';
      case 'chat_transcript': return 'Chat Transcript';
      case 'uploaded': return 'Uploaded Document';
      default: return `Document - ${type.replace('_', ' ')}`;
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
          
          // Ensure consistent document titles
          let title;
          if (type === 'project_overview') {
            title = 'Project Overview';
          } else if (type === 'market_research') {
            title = 'Market Research';
          } else if (type === 'project_planning') {
            title = 'Project Planning';
          } else if (type === 'chat_transcript') {
            title = 'Chat Transcript';
          } else {
            title = `Document - ${type.replace('_', ' ')}`;
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