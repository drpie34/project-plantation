
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { trackActivity } from '@/utils/apiGateway';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from '@/components/ui';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { UserPlus, Users, Trash2, Save, X } from 'lucide-react';

interface User {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
}

// Define specific project type for this component
interface ProjectWithCollaboration {
  id: string;
  user_id: string;
  title: string;
  is_collaborative: boolean;
  collaborators: string[];
  collaboration_settings: {
    permissions: 'view' | 'comment' | 'edit';
  };
}

interface ProjectSharingDialogProps {
  project: ProjectWithCollaboration;
  onUpdate: (updatedProject: ProjectWithCollaboration) => void;
  trigger?: React.ReactNode;
}

export default function ProjectSharingDialog({ project, onUpdate, trigger }: ProjectSharingDialogProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [isCollaborative, setIsCollaborative] = useState(project.is_collaborative);
  const [collaborators, setCollaborators] = useState<string[]>(project.collaborators || []);
  const [permissions, setPermissions] = useState<'view' | 'comment' | 'edit'>(
    project.collaboration_settings?.permissions || 'view'
  );
  const [isSearching, setIsSearching] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen && collaborators.length > 0) {
      fetchCollaborators();
    }
  }, [isOpen, collaborators]);

  async function fetchCollaborators() {
    if (collaborators.length === 0) return;
    
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, email, full_name, avatar_url')
        .in('id', collaborators);
      
      if (error) throw error;
      
      if (data) {
        // Cast to ensure type safety
        const typedUsers: User[] = data.map(u => ({
          id: u.id,
          email: u.email,
          full_name: u.full_name || undefined,
          avatar_url: u.avatar_url || undefined
        }));
        setUsers(typedUsers);
      }
    } catch (error) {
      console.error('Error fetching collaborators:', error);
    }
  }

  async function handleSearch() {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, email, full_name, avatar_url')
        .ilike('email', `%${searchQuery}%`)
        .limit(5);
      
      if (error) throw error;
      
      if (data) {
        // Filter out current user and existing collaborators
        const filteredResults = data.filter(u => 
          u.id !== user?.id && !collaborators.includes(u.id)
        );
        
        // Cast to ensure type safety
        const typedUsers: User[] = filteredResults.map(u => ({
          id: u.id,
          email: u.email,
          full_name: u.full_name || undefined,
          avatar_url: u.avatar_url || undefined
        }));
        
        setSearchResults(typedUsers);
      }
    } catch (error) {
      console.error('Error searching users:', error);
    } finally {
      setIsSearching(false);
    }
  }

  function addCollaborator(userId: string) {
    setCollaborators(prev => [...prev, userId]);
    setSearchResults(prev => prev.filter(u => u.id !== userId));
    setSearchQuery('');
  }

  function removeCollaborator(userId: string) {
    setCollaborators(prev => prev.filter(id => id !== userId));
    setUsers(prev => prev.filter(u => u.id !== userId));
  }

  async function handleSubmit() {
    if (!user) return;
    
    setIsSaving(true);
    
    try {
      const updatedProject: ProjectWithCollaboration = {
        ...project,
        is_collaborative: isCollaborative,
        collaborators: isCollaborative ? collaborators : [],
        collaboration_settings: {
          permissions: permissions as 'view' | 'comment' | 'edit'
        }
      };
      
      const { error } = await supabase
        .from('projects')
        .update({
          is_collaborative: isCollaborative,
          collaborators: isCollaborative ? collaborators : [],
          collaboration_settings: {
            permissions: permissions
          }
        })
        .eq('id', project.id);
      
      if (error) throw error;
      
      // Track this activity
      await trackActivity(
        user.id,
        'updated_sharing',
        'project',
        project.id,
        { is_collaborative: isCollaborative, collaborators_count: collaborators.length }
      );
      
      onUpdate(updatedProject);
      
      toast({
        title: 'Success',
        description: 'Project sharing settings updated',
      });
      
      setIsOpen(false);
    } catch (error) {
      console.error('Error updating project sharing:', error);
      toast({
        title: 'Error',
        description: 'Failed to update sharing settings',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || <Button>Share</Button>}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Share Project</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <div className="flex items-center gap-4">
            <div className="flex flex-1 items-center">
              <Switch 
                id="collaborative" 
                checked={isCollaborative}
                onCheckedChange={setIsCollaborative}
              />
              <Label htmlFor="collaborative" className="ml-2">
                Enable collaboration
              </Label>
            </div>
            <div className="flex items-center gap-1">
              <Users className="text-gray-500 h-4 w-4" />
              <span className="text-sm text-gray-500">
                {collaborators.length} {collaborators.length === 1 ? 'collaborator' : 'collaborators'}
              </span>
            </div>
          </div>
          
          {isCollaborative && (
            <>
              <div>
                <Label className="mb-1 block">Default permission level</Label>
                <Select value={permissions} onValueChange={(value: 'view' | 'comment' | 'edit') => setPermissions(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select permissions" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="view">View only</SelectItem>
                    <SelectItem value="comment">Comment</SelectItem>
                    <SelectItem value="edit">Edit</SelectItem>
                  </SelectContent>
                </Select>
                <p className="mt-1 text-xs text-muted-foreground">
                  This applies to all collaborators unless individually specified
                </p>
              </div>
              
              <div>
                <Label className="mb-1 block">Add collaborators</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Search by email"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    className="flex-1"
                  />
                  <Button type="button" onClick={handleSearch} disabled={isSearching}>
                    {isSearching ? 'Searching...' : 'Search'}
                  </Button>
                </div>
                
                {searchResults.length > 0 && (
                  <div className="mt-2 border rounded-md p-2">
                    <p className="text-xs text-muted-foreground mb-2">Search results:</p>
                    <div className="space-y-2">
                      {searchResults.map(user => (
                        <div key={user.id} className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6">
                              {user.avatar_url ? (
                                <AvatarImage src={user.avatar_url} alt={user.full_name || user.email} />
                              ) : (
                                <AvatarFallback>{user.email[0].toUpperCase()}</AvatarFallback>
                              )}
                            </Avatar>
                            <span className="text-sm">{user.full_name || user.email}</span>
                          </div>
                          <Button 
                            type="button" 
                            size="sm" 
                            variant="ghost" 
                            onClick={() => addCollaborator(user.id)}
                          >
                            <UserPlus className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              {users.length > 0 && (
                <div>
                  <Label className="mb-1 block">Current collaborators</Label>
                  <div className="border rounded-md p-2 space-y-2">
                    {users.map(user => (
                      <div key={user.id} className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            {user.avatar_url ? (
                              <AvatarImage src={user.avatar_url} alt={user.full_name || user.email} />
                            ) : (
                              <AvatarFallback>{user.email[0].toUpperCase()}</AvatarFallback>
                            )}
                          </Avatar>
                          <span className="text-sm">{user.full_name || user.email}</span>
                        </div>
                        <Button 
                          type="button" 
                          size="sm" 
                          variant="ghost" 
                          onClick={() => removeCollaborator(user.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSaving}>
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? 'Saving...' : 'Save Settings'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
