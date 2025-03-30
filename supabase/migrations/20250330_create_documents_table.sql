-- Create documents table
CREATE TABLE IF NOT EXISTS public.documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    type TEXT NOT NULL,
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
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
            auth.uid() = ANY (collaborators)
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