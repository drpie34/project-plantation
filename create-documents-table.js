import { createClient } from '@supabase/supabase-js';

// Use the same values from your client.ts
const SUPABASE_URL = "https://vrplqxtwporuulgazizx.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZycGxxeHR3cG9ydXVsZ2F6aXp4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI4NTc5MjUsImV4cCI6MjA1ODQzMzkyNX0.chIcV8_Uq-4-kb4NdolZZ1bG0mTEXgM2X70sVSLXgvk";

// Create Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

// SQL to create the documents table
const createTableSQL = `
-- Create documents table
CREATE TABLE IF NOT EXISTS public.documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    type TEXT NOT NULL,
    project_id UUID NOT NULL,
    user_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    is_auto_generated BOOLEAN DEFAULT false NOT NULL,
    file_path TEXT,
    file_type TEXT,
    file_size INTEGER
);

-- Create index for faster document retrieval
CREATE INDEX IF NOT EXISTS documents_project_id_idx ON public.documents(project_id);
CREATE INDEX IF NOT EXISTS documents_user_id_idx ON public.documents(user_id);
CREATE INDEX IF NOT EXISTS documents_type_idx ON public.documents(type);

-- Add RLS (Row Level Security) policies
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

-- Policy for users to view their own documents or documents of projects they collaborate on
CREATE POLICY "Users can view their own documents or collaborative documents" ON public.documents
    FOR SELECT
    USING (
        user_id = auth.uid() OR 
        project_id IN (
            SELECT id FROM public.projects
            WHERE user_id = auth.uid() OR 
            auth.uid()::text = ANY (collaborators)
        )
    );

-- Policy for users to insert their own documents
CREATE POLICY "Users can insert their own documents" ON public.documents
    FOR INSERT
    WITH CHECK (user_id = auth.uid());

-- Policy for users to update their own documents
CREATE POLICY "Users can update their own documents" ON public.documents
    FOR UPDATE
    USING (user_id = auth.uid());

-- Policy for users to delete their own documents
CREATE POLICY "Users can delete their own documents" ON public.documents
    FOR DELETE
    USING (user_id = auth.uid());
`;

async function createDocumentsTable() {
  console.log('Attempting to create documents table in Supabase...');
  
  try {
    // First check if table exists
    console.log('Checking if documents table already exists...');
    const { data, error } = await supabase
      .from('documents')
      .select('id')
      .limit(1);
    
    if (!error) {
      console.log('Documents table already exists!');
      return;
    }
    
    // Execute SQL using Supabase functions
    console.log('Creating documents table...');
    const { error: rpcError } = await supabase.rpc('exec_sql', { 
      sql: createTableSQL 
    });
    
    if (rpcError) {
      console.error('Error creating table:', rpcError);
      
      // Try creating a simple demo table to test permissions
      console.log('Testing permissions with a simple table...');
      const testSQL = `CREATE TABLE IF NOT EXISTS public.test_table (id serial primary key, name text);`;
      const { error: testError } = await supabase.rpc('exec_sql', { sql: testSQL });
      
      if (testError) {
        console.error('Permission test failed:', testError);
        console.log('\nYou need to use the Supabase dashboard to run the SQL script manually.');
        console.log('1. Go to https://app.supabase.com/project/_/sql');
        console.log('2. Paste the SQL from supabase/migrations/20250330_create_documents_table.sql');
        console.log('3. Run the SQL script\n');
      }
    } else {
      console.log('Documents table created successfully!');
    }
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

createDocumentsTable();