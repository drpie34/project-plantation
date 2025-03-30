
import { useAuth } from '@/context/AuthContext';
import { Navigate, Outlet } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useNavigate, useLocation } from 'react-router-dom';
import { Logo } from '@/components/ui/logo';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  LayoutDashboard, 
  FolderOpen, 
  Lightbulb, 
  CreditCard,
  User,
  LogOut
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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

  const getInitials = (name?: string) => {
    if (!name) return profile?.email?.[0].toUpperCase() || 'U';
    return name.split(' ').map((n) => n[0]).join('').toUpperCase();
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
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar>
                      <AvatarImage src={profile?.avatar_url} alt={profile?.full_name || "User"} />
                      <AvatarFallback>{getInitials(profile?.full_name)}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>
                    <div>
                      <p className="font-medium">{profile?.full_name || "User"}</p>
                      <p className="text-xs text-gray-500">{profile?.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate('/profile')}>
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/profile/credits')}>
                    <CreditCard className="mr-2 h-4 w-4" />
                    <span>Credits</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={signOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sign out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      {/* Sidebar and main content */}
      <div className="flex-1 flex flex-col md:flex-row">
        {/* Sidebar - hidden for routes that shouldn't show it */}
        <div className={`bg-white w-full md:w-64 shadow-sm p-4 md:p-6 ${
          location.pathname.includes('/market-research') ||
          location.pathname.includes('/planning') ||
          location.pathname.includes('/visual-planning') ||
          location.pathname.includes('/document-analysis')
          ? 'hidden' : ''
        }`}>
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
              variant={isActive('/ideas') ? "default" : "ghost"}
              className="w-full justify-start" 
              onClick={() => navigate('/ideas')}
            >
              <Lightbulb className="h-4 w-4 mr-2" />
              Ideas Hub
            </Button>
            <Button 
              variant={isActive('/projects') ? "default" : "ghost"}
              className="w-full justify-start" 
              onClick={() => navigate('/projects')}
            >
              <FolderOpen className="h-4 w-4 mr-2" />
              Projects
            </Button>
          </nav>
        </div>

        {/* Main content */}
        <main className={`flex-1 p-4 md:p-8 ${
          location.pathname.includes('/market-research') ||
          location.pathname.includes('/planning') ||
          location.pathname.includes('/visual-planning') ||
          location.pathname.includes('/document-analysis')
          ? 'w-full' : ''
        }`}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
