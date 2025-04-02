import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";

const Index = () => {
  const { isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();

  // For debugging - add console logs
  console.log("Index component rendering");
  console.log("Auth state:", { isAuthenticated, loading });

  // Comment out the redirect for debugging
  /*
  if (isAuthenticated) {
    navigate('/dashboard');
    return null;
  }
  */

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex justify-between items-center">
          <div>
            {/* No text or logo in top left */}
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
        {/* Hero Section with Background Pattern */}
        <div className="relative overflow-hidden bg-gradient-to-b from-blue-50 to-white">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-10 left-10 w-72 h-72 rounded-full bg-blue-400 mix-blend-multiply filter blur-3xl animate-blob"></div>
            <div className="absolute top-0 right-12 w-72 h-72 rounded-full bg-purple-300 mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
            <div className="absolute -bottom-8 left-20 w-72 h-72 rounded-full bg-yellow-300 mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000"></div>
          </div>
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-16 relative">
            <div className="text-center max-w-4xl mx-auto">
              <div className="flex justify-center mb-6">
                <img 
                  src="/lovable-uploads/a2599403-e704-43e1-a8cd-218554d8cc4f.png" 
                  alt="App Whisperer" 
                  className="w-auto h-auto max-w-[50%] md:max-w-[40%]"
                />
              </div>
              <h2 className="text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight lg:text-6xl">
                Build Your SaaS Faster with AI
              </h2>
              <p className="mt-6 text-xl text-gray-600 max-w-2xl mx-auto">
                App Whisperer helps entrepreneurs generate ideas, create strategies, and plan their SaaS projects with the power of AI.
              </p>
              <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button size="lg" onClick={() => navigate('/signup')} className="px-8 py-6 text-lg bg-blue-600 hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl">
                  Get Started Free
                </Button>
                <Button variant="outline" size="lg" onClick={() => navigate('/login')} className="px-8 py-6 text-lg">
                  Sign In
                </Button>
              </div>
              <p className="mt-4 text-sm text-gray-500">
                No credit card required. 100 free credits.
              </p>
            </div>
          </div>
        </div>

        {/* How It Works Section */}
        <div className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900">How App Whisperer Works</h2>
              <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
                Our AI-powered platform streamlines the journey from idea to execution
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
              {/* No connector lines */}
              
              <div className="relative p-6 text-center">
                <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mx-auto mb-4 relative z-10">
                  <span className="text-xl font-bold">1</span>
                </div>
                <h3 className="text-xl font-bold mb-3">Ideate</h3>
                <p className="text-gray-600">
                  Generate unique SaaS ideas tailored to your industry, expertise, and interests using AI.
                </p>
              </div>
              
              <div className="relative p-6 text-center">
                <div className="w-12 h-12 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center mx-auto mb-4 relative z-10">
                  <span className="text-xl font-bold">2</span>
                </div>
                <h3 className="text-xl font-bold mb-3">Research</h3>
                <p className="text-gray-600">
                  Analyze market data, competitive landscape, and potential customer needs.
                </p>
              </div>
              
              <div className="relative p-6 text-center">
                <div className="w-12 h-12 rounded-full bg-green-100 text-green-600 flex items-center justify-center mx-auto mb-4 relative z-10">
                  <span className="text-xl font-bold">3</span>
                </div>
                <h3 className="text-xl font-bold mb-3">Plan & Execute</h3>
                <p className="text-gray-600">
                  Create detailed roadmaps, technical specifications, and go-to-market strategies.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900">Key Features</h2>
              <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
                Everything you need to take your SaaS idea from concept to reality
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white shadow-md rounded-xl p-8 hover:shadow-xl transition-shadow duration-300 border border-gray-100">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-3">AI-Powered Ideation</h3>
                <p className="text-gray-600">
                  Generate innovative SaaS ideas tailored to your specific industry and expertise.
                </p>
              </div>
              
              <div className="bg-white shadow-md rounded-xl p-8 hover:shadow-xl transition-shadow duration-300 border border-gray-100">
                <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-3">Market Research</h3>
                <p className="text-gray-600">
                  Get detailed insights into market opportunities, competition, and potential customer needs.
                </p>
              </div>
              
              <div className="bg-white shadow-md rounded-xl p-8 hover:shadow-xl transition-shadow duration-300 border border-gray-100">
                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-3">Project Planning</h3>
                <p className="text-gray-600">
                  Create comprehensive roadmaps, technical specifications, and development strategies.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Social Proof Section */}
        <div className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900">Trusted By Innovators</h2>
              <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
                Join hundreds of entrepreneurs and startups already using App Whisperer
              </p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 items-center justify-items-center opacity-70">
              <div className="h-12">
                <div className="h-full w-full bg-gray-300 rounded"></div>
              </div>
              <div className="h-12">
                <div className="h-full w-full bg-gray-300 rounded"></div>
              </div>
              <div className="h-12">
                <div className="h-full w-full bg-gray-300 rounded"></div>
              </div>
              <div className="h-12">
                <div className="h-full w-full bg-gray-300 rounded"></div>
              </div>
            </div>
            
            <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white shadow-md rounded-xl p-8 border border-gray-100">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 rounded-full bg-gray-200 mr-4"></div>
                  <div>
                    <h4 className="font-bold">Sarah Johnson</h4>
                    <p className="text-sm text-gray-500">Founder, TechStart</p>
                  </div>
                </div>
                <p className="text-gray-600 italic">
                  "App Whisperer helped me refine my SaaS idea and identified market opportunities I hadn't considered. The detailed planning tools saved me months of work."
                </p>
              </div>
              
              <div className="bg-white shadow-md rounded-xl p-8 border border-gray-100">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 rounded-full bg-gray-200 mr-4"></div>
                  <div>
                    <h4 className="font-bold">Michael Chen</h4>
                    <p className="text-sm text-gray-500">CTO, DataFlow</p>
                  </div>
                </div>
                <p className="text-gray-600 italic">
                  "The project planning features are incredible. We were able to map out our entire development roadmap in days instead of weeks."
                </p>
              </div>
              
              <div className="bg-white shadow-md rounded-xl p-8 border border-gray-100">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 rounded-full bg-gray-200 mr-4"></div>
                  <div>
                    <h4 className="font-bold">Jessica Williams</h4>
                    <p className="text-sm text-gray-500">Product Manager, SkyApp</p>
                  </div>
                </div>
                <p className="text-gray-600 italic">
                  "The AI-powered market research saved us from making a critical mistake with our target audience. App Whisperer paid for itself immediately."
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Final CTA Section */}
        <div className="relative py-20 bg-gradient-to-r from-blue-600 to-indigo-700 overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-white mix-blend-overlay filter blur-3xl"></div>
            <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-white mix-blend-overlay filter blur-3xl"></div>
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
            <div className="text-center max-w-3xl mx-auto">
              <h2 className="text-3xl font-bold text-white sm:text-4xl">
                Ready to Build Your SaaS Faster?
              </h2>
              <p className="mt-4 text-xl text-blue-100">
                Join thousands of founders and start turning your ideas into reality today.
              </p>
              <div className="mt-10">
                <Button size="lg" onClick={() => navigate('/signup')} className="px-8 py-6 text-lg bg-white text-blue-700 hover:bg-blue-50 transition-colors">
                  Get Started Free
                </Button>
                <p className="mt-4 text-sm text-blue-200">
                  No credit card required. 100 free credits to start.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-gray-800 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <Logo size="sm" className="filter invert" />
            </div>
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