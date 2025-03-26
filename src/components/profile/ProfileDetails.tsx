
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { TagInput } from '@/components/TagInput';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';

export const ProfileDetails = () => {
  const { profile, user } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    full_name: profile?.full_name || '',
    bio: profile?.bio || '',
    expertise: profile?.expertise || [],
    interests: profile?.interests || [],
    industry: profile?.industry || '',
    company: profile?.company || '',
    position: profile?.position || '',
    linkedin_url: profile?.linkedin_url || '',
    github_url: profile?.github_url || '',
    website_url: profile?.website_url || '',
  });

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
      const { error } = await supabase
        .from('users')
        .update({
          ...formData
        })
        .eq('id', user.id);
      
      if (error) throw error;
      
      toast({
        title: 'Profile updated',
        description: 'Your profile has been updated successfully.',
      });
      
      setIsEditing(false);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update profile',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getInitials = (name?: string) => {
    if (!name) return 'U';
    return name.split(' ').map((n) => n[0]).join('').toUpperCase();
  };

  if (!profile) return null;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Profile Information</CardTitle>
        <CardDescription>
          {isEditing 
            ? 'Edit your personal information below' 
            : 'View and manage your personal information'}
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex flex-col items-center gap-4">
              <Avatar className="h-24 w-24">
                <AvatarImage src={profile.avatar_url} alt={profile.full_name || user?.email} />
                <AvatarFallback className="text-xl">{getInitials(profile.full_name)}</AvatarFallback>
              </Avatar>
              
              {isEditing && (
                <Button variant="outline" type="button" disabled className="text-xs">
                  Change Avatar
                </Button>
              )}
            </div>
            
            <div className="flex-1 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="full_name">Full Name</Label>
                  <Input
                    id="full_name"
                    name="full_name"
                    value={formData.full_name}
                    onChange={handleChange}
                    disabled={!isEditing}
                    placeholder={isEditing ? "Enter your full name" : "Not provided"}
                    className={!isEditing && !formData.full_name ? "text-gray-500" : ""}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="industry">Industry</Label>
                  <Input
                    id="industry"
                    name="industry"
                    value={formData.industry}
                    onChange={handleChange}
                    disabled={!isEditing}
                    placeholder={isEditing ? "Enter your industry" : "Not provided"}
                    className={!isEditing && !formData.industry ? "text-gray-500" : ""}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="company">Company</Label>
                  <Input
                    id="company"
                    name="company"
                    value={formData.company}
                    onChange={handleChange}
                    disabled={!isEditing}
                    placeholder={isEditing ? "Enter your company" : "Not provided"}
                    className={!isEditing && !formData.company ? "text-gray-500" : ""}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="position">Position</Label>
                  <Input
                    id="position"
                    name="position"
                    value={formData.position}
                    onChange={handleChange}
                    disabled={!isEditing}
                    placeholder={isEditing ? "Enter your position" : "Not provided"}
                    className={!isEditing && !formData.position ? "text-gray-500" : ""}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  disabled={!isEditing}
                  placeholder={isEditing ? "Tell us about yourself" : "No bio provided"}
                  className={!isEditing && !formData.bio ? "text-gray-500 resize-none h-24" : "resize-none h-24"}
                />
              </div>
              
              {isEditing && (
                <>
                  <div className="space-y-2">
                    <Label>Expertise</Label>
                    <TagInput
                      tags={formData.expertise}
                      setTags={(tags) => handleTagsChange('expertise', tags)}
                      placeholder="Add expertise (press Enter)"
                      maxTags={5}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Interests</Label>
                    <TagInput
                      tags={formData.interests}
                      setTags={(tags) => handleTagsChange('interests', tags)}
                      placeholder="Add interests (press Enter)"
                      maxTags={5}
                    />
                  </div>
                </>
              )}
              
              {!isEditing && (formData.expertise?.length > 0 || formData.interests?.length > 0) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  {formData.expertise?.length > 0 && (
                    <div>
                      <Label className="block mb-2">Expertise</Label>
                      <div className="flex flex-wrap gap-2">
                        {formData.expertise.map((tag, i) => (
                          <span key={i} className="px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded-md">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {formData.interests?.length > 0 && (
                    <div>
                      <Label className="block mb-2">Interests</Label>
                      <div className="flex flex-wrap gap-2">
                        {formData.interests.map((tag, i) => (
                          <span key={i} className="px-2 py-1 bg-green-100 text-green-800 text-sm rounded-md">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          
          <div className="space-y-4 pt-4 border-t">
            <h3 className="text-lg font-medium">Links</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="linkedin_url">LinkedIn</Label>
                <Input
                  id="linkedin_url"
                  name="linkedin_url"
                  value={formData.linkedin_url}
                  onChange={handleChange}
                  disabled={!isEditing}
                  placeholder={isEditing ? "LinkedIn URL" : "Not provided"}
                  className={!isEditing && !formData.linkedin_url ? "text-gray-500" : ""}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="github_url">GitHub</Label>
                <Input
                  id="github_url"
                  name="github_url"
                  value={formData.github_url}
                  onChange={handleChange}
                  disabled={!isEditing}
                  placeholder={isEditing ? "GitHub URL" : "Not provided"}
                  className={!isEditing && !formData.github_url ? "text-gray-500" : ""}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="website_url">Website</Label>
                <Input
                  id="website_url"
                  name="website_url"
                  value={formData.website_url}
                  onChange={handleChange}
                  disabled={!isEditing}
                  placeholder={isEditing ? "Website URL" : "Not provided"}
                  className={!isEditing && !formData.website_url ? "text-gray-500" : ""}
                />
              </div>
            </div>
          </div>
        </form>
      </CardContent>
      
      <CardFooter className="flex justify-between">
        {isEditing ? (
          <>
            <Button 
              variant="outline" 
              onClick={() => setIsEditing(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={isLoading}
            >
              {isLoading ? 'Saving...' : 'Save Changes'}
            </Button>
          </>
        ) : (
          <Button 
            onClick={() => setIsEditing(true)}
            className="ml-auto"
          >
            Edit Profile
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};
