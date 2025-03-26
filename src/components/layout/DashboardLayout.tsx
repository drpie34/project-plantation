
import { useAuth } from '@/context/AuthContext';
import { Navigate, Outlet } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useNavigate, useLocation } from 'react-router-dom';
import { Logo } from '@/components/ui/logo';
import { LayoutDashboard, FolderOpen, Lightbulb, CreditCard } from 'lucide-react';

const DashboardLayout = () => {
  const { isAuthenticated, loading, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  const isActive = (path: string) => {
    if (path === '/dashboard') {
      return location.pathname === '/dashboard';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex justify-between items-center">
          <div className="flex items-center">
            <Logo 
              size="xl" 
              onClick={() => navigate('/dashboard')}
              className="cursor-pointer"
            />
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-sm">
              <span className="text-gray-500 mr-2">Credits:</span>
              <span className="font-medium">{profile?.credits_remaining || 0}</span>
            </div>
            <div className="flex items-center space-x-3">
              <Button 
                variant="ghost" 
                onClick={() => navigate('/profile')}
              >
                Profile
              </Button>
              <Button onClick={signOut} variant="outline">
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Sidebar and main content */}
      <div className="flex-1 flex flex-col md:flex-row">
        {/* Sidebar */}
        <div className="bg-white w-full md:w-64 shadow-sm p-4 md:p-6">
          <nav className="space-y-2">
            <Button 
              variant={isActive('/dashboard') ? "default" : "ghost"}
              className="w-full justify-start" 
              onClick={() => navigate('/dashboard')}
            >
              <LayoutDashboard className="h-4 w-4 mr-2" />
              Dashboard
            </Button>
            <Button 
              variant={isActive('/projects') ? "default" : "ghost"}
              className="w-full justify-start" 
              onClick={() => navigate('/projects')}
            >
              <FolderOpen className="h-4 w-4 mr-2" />
              Projects
            </Button>
            <Button 
              variant={isActive('/ideas') ? "default" : "ghost"}
              className="w-full justify-start" 
              onClick={() => navigate('/ideas')}
            >
              <Lightbulb className="h-4 w-4 mr-2" />
              Ideas Hub
            </Button>
            <Button 
              variant={isActive('/profile/credits') ? "default" : "ghost"}
              className="w-full justify-start" 
              onClick={() => navigate('/profile/credits')}
            >
              <CreditCard className="h-4 w-4 mr-2" />
              Credits
            </Button>
          </nav>
        </div>

        {/* Main content */}
        <main className="flex-1 p-4 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
