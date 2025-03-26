
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/context/AuthContext";
import DashboardLayout from "@/components/layout/DashboardLayout";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ResetPassword from "./pages/ResetPassword";
import Dashboard from "./pages/Dashboard";
import Projects from "./pages/Projects";
import NewProject from "./pages/NewProject";
import ProjectDetail from "./pages/ProjectDetail";
import GenerateIdeas from "./pages/GenerateIdeas";
import ProjectPlanning from "./pages/ProjectPlanning";
import MarketResearch from "./pages/MarketResearch";
import DocumentAnalysis from "./pages/DocumentAnalysis";
import Profile from "./pages/Profile";
import Credits from "./pages/Credits";
import IdeasHub from "./pages/IdeasHub";
import ProjectFormation from "./pages/ProjectFormation";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
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
            
            {/* Dashboard and protected routes */}
            <Route path="/" element={<DashboardLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/projects" element={<Projects />} />
              <Route path="/projects/new" element={<NewProject />} />
              <Route path="/projects/formation" element={<ProjectFormation />} />
              <Route path="/projects/:projectId" element={<ProjectDetail />} />
              <Route path="/projects/:projectId/generate-ideas" element={<GenerateIdeas />} />
              <Route path="/projects/:projectId/planning" element={<ProjectPlanning />} />
              <Route path="/projects/:projectId/market-research" element={<MarketResearch />} />
              <Route path="/projects/:projectId/document-analysis" element={<DocumentAnalysis />} />
              <Route path="/ideas" element={<IdeasHub />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/profile/credits" element={<Credits />} />
            </Route>
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
