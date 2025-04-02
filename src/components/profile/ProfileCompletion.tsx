import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { TagInput } from '@/components/TagInput';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { LinkedinIcon, GithubIcon, GlobeIcon, InfoIcon } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Logo } from '@/components/ui/logo';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export default function ProfileCompletion() {
  const navigate = useNavigate();
  const { profile, user, updateProfile } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [completionStep, setCompletionStep] = useState(1);
  
  const [formData, setFormData] = useState({
    full_name: profile?.full_name || '',
    industry: profile?.industry || '',
    company: profile?.company || '',
    position: profile?.position || '',
    github_url: profile?.github_url || '',
    linkedin_url: profile?.linkedin_url || '',
    website_url: profile?.website_url || '',
    bio: profile?.bio || '',
    expertise: profile?.expertise || [],
    interests: profile?.interests || [],
  });

  // Calculate profile completion percentage
  const calculateCompletionPercentage = () => {
    const essentialFields = ['full_name', 'github_url', 'linkedin_url', 'website_url'];
    const additionalFields = ['industry', 'company', 'position', 'bio'];
    
    let score = 0;
    let total = essentialFields.length * 1.5 + additionalFields.length; // Essential fields count more
    
    // Count essential fields (weighted more)
    essentialFields.forEach(field => {
      if (formData[field as keyof typeof formData]) score += 1.5;
    });
    
    // Count additional fields
    additionalFields.forEach(field => {
      if (formData[field as keyof typeof formData]) score += 1;
    });
    
    // Add points for expertise and interests
    if (formData.expertise.length > 0) score += 1;
    if (formData.interests.length > 0) score += 1;
    total += 2; // Add these to total
    
    return Math.min(100, Math.round((score / total) * 100));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleTagsChange = (name: string, tags: string[]) => {
    setFormData(prev => ({ ...prev, [name]: tags }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setIsLoading(true);
    
    try {
      const { error } = await updateProfile(formData);
      
      if (error) throw error;
      
      toast({
        title: 'Profile updated',
        description: 'Your profile has been successfully updated.',
      });
      
      // Navigate to dashboard or IdeasHub after profile completion
      navigate('/ideas');
    } catch (error: any) {
      toast({
        title: 'Error updating profile',
        description: error.message || 'Failed to update profile',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const nextStep = () => {
    setCompletionStep(prev => prev + 1);
  };

  const prevStep = () => {
    setCompletionStep(prev => prev - 1);
  };

  const skipToIdeas = () => {
    navigate('/ideas');
  };

  if (!profile) return null;

  const completionPercentage = calculateCompletionPercentage();

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <Card className="w-full">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Complete Your Profile</CardTitle>
          <CardDescription>
            The more you share, the better your idea generation will be
          </CardDescription>
          <div className="mt-4">
            <div className="flex justify-between text-sm mb-1">
              <span>Profile Completion</span>
              <span>{completionPercentage}%</span>
            </div>
            <Progress value={completionPercentage} className="h-2" />
          </div>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {completionStep === 1 && (
              <div className="space-y-6">
                <h3 className="text-lg font-medium">Essential Details</h3>
                <p className="text-sm text-gray-500">
                  This information helps us generate more relevant and personalized ideas for you.
                </p>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="full_name">Full Name</Label>
                    <Input
                      id="full_name"
                      name="full_name"
                      value={formData.full_name}
                      onChange={handleChange}
                      placeholder="Enter your full name"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="flex items-center" htmlFor="github_url">
                      <GithubIcon className="h-4 w-4 mr-2" />
                      GitHub Profile
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <InfoIcon className="h-4 w-4 ml-2 text-gray-400" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="w-64 text-xs">
                              Your GitHub profile helps us understand your technical interests and skills.
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </Label>
                    <Input
                      id="github_url"
                      name="github_url"
                      value={formData.github_url}
                      onChange={handleChange}
                      placeholder="https://github.com/yourusername"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="flex items-center" htmlFor="linkedin_url">
                      <LinkedinIcon className="h-4 w-4 mr-2" />
                      LinkedIn Profile
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <InfoIcon className="h-4 w-4 ml-2 text-gray-400" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="w-64 text-xs">
                              Your LinkedIn profile helps us understand your professional background and network.
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </Label>
                    <Input
                      id="linkedin_url"
                      name="linkedin_url"
                      value={formData.linkedin_url}
                      onChange={handleChange}
                      placeholder="https://linkedin.com/in/yourprofile"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="flex items-center" htmlFor="website_url">
                      <GlobeIcon className="h-4 w-4 mr-2" />
                      Personal Website
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <InfoIcon className="h-4 w-4 ml-2 text-gray-400" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="w-64 text-xs">
                              Your website helps us understand your work and creative interests.
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </Label>
                    <Input
                      id="website_url"
                      name="website_url"
                      value={formData.website_url}
                      onChange={handleChange}
                      placeholder="https://yourwebsite.com"
                    />
                  </div>
                </div>
              </div>
            )}
            
            {completionStep === 2 && (
              <div className="space-y-6">
                <h3 className="text-lg font-medium">Your AI Profile</h3>
                <p className="text-sm text-gray-500">
                  Tell us more about yourself to improve AI-powered idea generation and suggestions.
                </p>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="industry">Industry</Label>
                      <Input
                        id="industry"
                        name="industry"
                        value={formData.industry}
                        onChange={handleChange}
                        placeholder="e.g., Technology, Healthcare, Education"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="company">Company</Label>
                      <Input
                        id="company"
                        name="company"
                        value={formData.company}
                        onChange={handleChange}
                        placeholder="Where do you work?"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="position">Position/Role</Label>
                    <Input
                      id="position"
                      name="position"
                      value={formData.position}
                      onChange={handleChange}
                      placeholder="e.g., Software Engineer, Product Manager, Founder"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="bio">About You</Label>
                    <Textarea
                      id="bio"
                      name="bio"
                      value={formData.bio}
                      onChange={handleChange}
                      placeholder="Tell us about yourself, your background, and what you're looking to build"
                      rows={4}
                    />
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-2">
                    <Label>Areas of Expertise</Label>
                    <TagInput
                      tags={formData.expertise}
                      setTags={(tags) => handleTagsChange('expertise', tags)}
                      placeholder="Add expertise (press Enter)"
                      maxTags={5}
                    />
                    <p className="text-xs text-gray-500">
                      e.g., React, Machine Learning, UI/UX Design, Marketing, Business Development
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Interests</Label>
                    <TagInput
                      tags={formData.interests}
                      setTags={(tags) => handleTagsChange('interests', tags)}
                      placeholder="Add interests (press Enter)"
                      maxTags={5}
                    />
                    <p className="text-xs text-gray-500">
                      e.g., Web3, SaaS, Mobile Apps, E-commerce, Education, Healthcare
                    </p>
                  </div>
                </div>
              </div>
            )}
          </form>
        </CardContent>
        
        <CardFooter className="flex justify-between">
          {completionStep === 1 ? (
            <Button variant="ghost" onClick={skipToIdeas}>Skip for now</Button>
          ) : (
            <Button variant="outline" onClick={prevStep}>Back</Button>
          )}
          
          {completionStep === 1 ? (
            <Button onClick={nextStep}>Continue</Button>
          ) : (
            <Button onClick={handleSubmit} disabled={isLoading}>
              {isLoading ? 'Saving...' : 'Complete Profile'}
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}