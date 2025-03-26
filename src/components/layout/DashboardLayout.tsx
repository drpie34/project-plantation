
import { useAuth } from '@/context/AuthContext';
import { Navigate, Outlet } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Logo } from '@/components/ui/logo';

const DashboardLayout = () => {
  const { isAuthenticated, loading, profile, signOut } = useAuth();
  const navigate = useNavigate();

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

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <Logo 
              size="md" 
              onClick={() => navigate('/dashboard')}
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
              variant="ghost" 
              className="w-full justify-start" 
              onClick={() => navigate('/dashboard')}
            >
              Dashboard
            </Button>
            <Button 
              variant="ghost" 
              className="w-full justify-start" 
              onClick={() => navigate('/projects')}
            >
              Projects
            </Button>
            <Button 
              variant="ghost" 
              className="w-full justify-start" 
              onClick={() => navigate('/profile/credits')}
            >
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
