
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";

const Index = () => {
  const { isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();

  // Redirect authenticated users to dashboard
  if (isAuthenticated) {
    navigate('/dashboard');
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex justify-between items-center">
          <div>
            <Logo size="xl" />
          </div>
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/login')}
            >
              Sign In
            </Button>
            <Button onClick={() => navigate('/signup')}>
              Sign Up
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight lg:text-6xl">
              Build Your SaaS Faster with AI
            </h2>
            <p className="mt-6 text-xl text-gray-500 max-w-2xl mx-auto">
              App Whisperer helps entrepreneurs generate ideas, create strategies, and plan their SaaS projects with the power of AI.
            </p>
            <div className="mt-10">
              <Button size="lg" onClick={() => navigate('/signup')} className="px-8 py-6 text-lg">
                Get Started Free
              </Button>
              <p className="mt-3 text-sm text-gray-500">
                No credit card required. 100 free credits.
              </p>
            </div>
          </div>

          <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-xl font-bold mb-3">Ideation</h3>
              <p className="text-gray-600">
                Generate unique SaaS ideas tailored to your industry and interests.
              </p>
            </div>
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-xl font-bold mb-3">Market Research</h3>
              <p className="text-gray-600">
                Get insights into market opportunities and potential competitors.
              </p>
            </div>
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-xl font-bold mb-3">Project Planning</h3>
              <p className="text-gray-600">
                Develop comprehensive roadmaps and strategies for your SaaS project.
              </p>
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-gray-800 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <Logo size="lg" className="mx-auto mb-4" />
            <p className="mt-2 text-gray-300">
              Powered by GPT-4o-mini
            </p>
            <p className="mt-6 text-gray-400 text-sm">
              © 2023 App Whisperer. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
