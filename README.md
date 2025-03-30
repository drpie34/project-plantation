# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/fc36489b-3bf0-48f8-8a89-e4355de75ae2

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/fc36489b-3bf0-48f8-8a89-e4355de75ae2) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with .

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/fc36489b-3bf0-48f8-8a89-e4355de75ae2) and click on Share -> Publish.

## I want to use a custom domain - is that possible?

We don't support custom domains (yet). If you want to deploy your project under your own domain then we recommend using Netlify. Visit our docs for more details: [Custom domains](https://docs.lovable.dev/tips-tricks/custom-domain/)

## Setting up the Documents Table in Supabase

This project requires a `documents` table in Supabase for storing project documentation. Without it, the application will display an error and fall back to local storage mode, which means documents won't be available across different browsers or devices.

**Direct Setup via Supabase Dashboard (Recommended):**

1. Log in to your [Supabase Dashboard](https://app.supabase.com/)
2. Select your project
3. Go to the "SQL Editor" tab
4. Create a new query
5. Copy and paste the contents of `create-documents-table.sql` from this repository
6. Click "Run" to execute the SQL

This will create the documents table with proper structure and permissions.

**Alternative Method (Advanced):**

If you prefer to use the CLI or have admin access:

```bash
# Install Supabase CLI if needed
npm install -g @supabase/cli

# Login to Supabase
supabase login

# Run the SQL file against your project
supabase db execute --project-ref YOUR_PROJECT_REF --file create-documents-table.sql
```

The documents table is essential for:
- Storing project overviews and planning documents
- Saving AI-generated analysis results
- Maintaining user-uploaded documents
- Keeping document data synchronized across devices

Without proper setup, the application will fall back to local storage, which means documents won't be available across different devices or browsers.
