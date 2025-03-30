// Script to create the documents table in Supabase
// Run this script with Node.js to set up the documents table if it doesn't exist

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Environment variables for Supabase credentials
// These should be set in your environment or passed as arguments
const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || '';

// Validate required environment variables
if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('Error: SUPABASE_URL and SUPABASE_SERVICE_KEY environment variables must be set');
  process.exit(1);
}

// Create Supabase client with admin rights
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// Path to the SQL migration file
const migrationFilePath = path.join(__dirname, 'migrations', '20250330_create_documents_table.sql');

async function setupDocumentsTable() {
  console.log('Setting up documents table in Supabase...');
  
  try {
    // Check if the documents table already exists
    const { data, error } = await supabase
      .from('documents')
      .select('id')
      .limit(1);
      
    if (!error) {
      console.log('Documents table already exists in Supabase. No action needed.');
      return;
    }
    
    // If the error isn't related to missing table, we have a different problem
    if (error && error.code !== '42P01') {
      console.error('Error checking documents table:', error);
      process.exit(1);
    }
    
    // Table doesn't exist, read and execute the SQL migration
    console.log('Documents table does not exist. Creating it from migration file...');
    
    // Read the migration file
    const sqlContent = fs.readFileSync(migrationFilePath, 'utf8');
    
    // Execute the SQL using the Supabase client
    const { error: execError } = await supabase.rpc('pgexecute', {
      query: sqlContent
    });
    
    if (execError) {
      console.error('Error executing SQL migration:', execError);
      process.exit(1);
    }
    
    console.log('Documents table created successfully!');
    
    // Verify table was created
    const { error: verifyError } = await supabase
      .from('documents')
      .select('id')
      .limit(1);
      
    if (verifyError) {
      console.error('Error verifying documents table creation:', verifyError);
      process.exit(1);
    }
    
    console.log('Documents table setup complete.');
    
  } catch (err) {
    console.error('Unexpected error during setup:', err);
    process.exit(1);
  }
}

// Run the setup
setupDocumentsTable().catch(err => {
  console.error('Failed to set up documents table:', err);
  process.exit(1);
});