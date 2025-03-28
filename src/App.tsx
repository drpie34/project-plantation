
import { useState, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/context/AuthContext";
import DashboardLayout from "@/components/layout/DashboardLayout";
import DevToolsPanel from "@/components/DevTools/DevToolsPanel";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ResetPassword from "./pages/ResetPassword";
import ProfileCompletion from "./pages/ProfileCompletion";
import Dashboard from "./pages/Dashboard";
import Projects from "./pages/Projects";
import NewProject from "./pages/NewProject";
import ProjectDetail from "./pages/ProjectDetail";
import IdeaDetail from "./pages/IdeaDetail";
import GenerateIdeas from "./pages/GenerateIdeas";
import ProjectPlanning from "./pages/ProjectPlanning";
import MarketResearch from "./pages/MarketResearch";
import DocumentAnalysis from "./pages/DocumentAnalysis";
import VisualPlanning from "./pages/VisualPlanning";
import MarketingCopyGenerator from "./pages/MarketingCopyGenerator";
import Profile from "./pages/Profile";
import Credits from "./pages/Credits";
import IdeasHub from "./pages/IdeasHub";
import ProjectFormation from "./pages/ProjectFormation";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  const [appReady, setAppReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Add effect to handle initialization
  useEffect(() => {
    console.log("App component initializing");
    try {
      // Set ready state after a short delay to ensure proper initialization
      const timer = setTimeout(() => {
        console.log("App ready state set to true");
        setAppReady(true);
      }, 500);
      
      return () => clearTimeout(timer);
    } catch (err) {
      console.error("Error in App initialization:", err);
      setError("Application initialization failed. Please check the console for details.");
    }
  }, []);

  // Show loading state
  if (!appReady) {
    return (
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'center', 
        justifyContent: 'center', 
        height: '100vh',
        fontFamily: 'sans-serif',
        backgroundColor: '#f5f5f5'
      }}>
        <h1 style={{ marginBottom: '20px' }}>App Whisperer</h1>
        <div style={{ 
          width: '50px',
          height: '50px',
          border: '5px solid #e0e0e0',
          borderTopColor: '#3498db',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
        <p style={{ marginTop: '20px' }}>Initializing application...</p>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div style={{ 
        padding: '20px', 
        maxWidth: '800px', 
        margin: '40px auto',
        fontFamily: 'sans-serif',
        backgroundColor: '#fff',
        borderRadius: '8px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
      }}>
        <h1 style={{ color: '#e74c3c' }}>Application Error</h1>
        <p>{error}</p>
        <button
          onClick={() => window.location.reload()}
          style={{
            padding: '8px 16px',
            backgroundColor: '#3498db',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            marginTop: '20px'
          }}
        >
          Reload Application
        </button>
      </div>
    );
  }

  // Normal rendering
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/profile-completion" element={<ProfileCompletion />} />
              
              {/* Dashboard and protected routes */}
              <Route path="/" element={<DashboardLayout />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/projects" element={<Projects />} />
                <Route path="/projects/new" element={<NewProject />} />
                <Route path="/projects/formation" element={<ProjectFormation />} />
                <Route path="/projects/:projectId" element={<ProjectDetail />} />
                <Route path="/ideas/:ideaId" element={<IdeaDetail />} />
                <Route path="/projects/:projectId/generate-ideas" element={<GenerateIdeas />} />
                <Route path="/projects/:projectId/planning" element={<ProjectPlanning />} />
                <Route path="/projects/:projectId/market-research" element={<MarketResearch />} />
                <Route path="/projects/:projectId/document-analysis" element={<DocumentAnalysis />} />
                <Route path="/projects/:projectId/visual-planning" element={<VisualPlanning />} />
                <Route path="/projects/:projectId/marketing-copy" element={<MarketingCopyGenerator />} />
                <Route path="/ideas" element={<IdeasHub />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/profile/credits" element={<Credits />} />
              </Route>
              
              <Route path="*" element={<NotFound />} />
            </Routes>
            
            {/* Developer tools panel */}
            <DevToolsPanel />
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
