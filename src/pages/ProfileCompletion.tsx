import { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import ProfileCompletionComponent from '@/components/profile/ProfileCompletion';

const ProfileCompletionPage = () => {
  const { isAuthenticated, loading, profile } = useAuth();

  useEffect(() => {
    // Set document title
    document.title = 'Complete Your Profile | App Whisperer';
  }, []);

  // If still loading, show loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700"></div>
      </div>
    );
  }

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  // If profile is already complete (has name and at least one link), redirect to ideas
  const isProfileComplete = 
    profile?.full_name && 
    (profile?.github_url || profile?.linkedin_url || profile?.website_url);
  
  if (isProfileComplete) {
    return <Navigate to="/ideas" />;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <ProfileCompletionComponent />
    </div>
  );
};

export default ProfileCompletionPage;