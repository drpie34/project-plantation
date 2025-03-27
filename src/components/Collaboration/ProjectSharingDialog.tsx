
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  Button,
  Input,
  Badge,
  Avatar,
  AvatarFallback,
  AvatarImage,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui';
import { Search as SearchIcon, UserPlus as UserPlusIcon, X as XIcon } from 'lucide-react';

interface CollaboratorUser {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
}

interface ProjectWithCollaboration {
  id: string;
  title: string;
  user_id: string;
  collaborators: string[];
  is_collaborative: boolean;
  collaboration_settings: {
    permissions: 'view' | 'comment' | 'edit';
  } | null;
}

interface ProjectSharingDialogProps {
  project: ProjectWithCollaboration;
  trigger: React.ReactNode;
  onUpdate?: (updatedProject: ProjectWithCollaboration) => void;
}

export default function ProjectSharingDialog({ 
  project, 
  trigger, 
  onUpdate 
}: ProjectSharingDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [collaborators, setCollaborators] = useState<CollaboratorUser[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<CollaboratorUser[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [permissions, setPermissions] = useState<'view' | 'comment' | 'edit'>(
    project.collaboration_settings?.permissions || 'view'
  );
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    if (isOpen) {
      fetchCollaborators();
    }
  }, [isOpen, project.id]);
  
  async function fetchCollaborators() {
    try {
      if (!project.collaborators || project.collaborators.length === 0) {
        setCollaborators([]);
        return;
      }
      
      const { data, error } = await supabase
        .from('users')
        .select('id, email, full_name, avatar_url')
        .in('id', project.collaborators);
      
      if (error) throw error;
      
      setCollaborators(data as CollaboratorUser[] || []);
    } catch (error) {
      console.error('Error fetching collaborators:', error);
      setError('Failed to load collaborators');
    }
  }
  
  async function searchUsers() {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    
    setIsSearching(true);
    
    try {
      // Search by email or name
      const { data, error } = await supabase
        .from('users')
        .select('id, email, full_name, avatar_url')
        .or(`email.ilike.%${searchQuery}%,full_name.ilike.%${searchQuery}%`)
        .limit(5);
      
      if (error) throw error;
      
      // Filter out the current user and existing collaborators
      const filtered = data.filter((user: CollaboratorUser) => 
        !project.collaborators.includes(user.id) && 
        user.id !== project.user_id
      );
      
      setSearchResults(filtered as CollaboratorUser[]);
    } catch (error) {
      console.error('Error searching users:', error);
      setError('Error searching for users');
    } finally {
      setIsSearching(false);
    }
  }
  
  async function addCollaborator(userId: string) {
    try {
      // Find user in search results
      const user = searchResults.find(u => u.id === userId);
      if (!user) return;
      
      // Update project collaborators
      const updatedCollaborators = [...project.collaborators, userId];
      
      const { error } = await supabase
        .from('projects')
        .update({
          is_collaborative: true,
          collaborators: updatedCollaborators,
          collaboration_settings: {
            ...project.collaboration_settings,
            permissions
          }
        })
        .eq('id', project.id);
      
      if (error) throw error;
      
      // Update local state
      setCollaborators(prev => [...prev, user]);
      setSearchResults(prev => prev.filter(u => u.id !== userId));
      
      // Call onUpdate callback
      if (onUpdate) {
        onUpdate({
          ...project,
          is_collaborative: true,
          collaborators: updatedCollaborators,
          collaboration_settings: {
            ...project.collaboration_settings,
            permissions
          }
        });
      }
    } catch (error) {
      console.error('Error adding collaborator:', error);
      setError('Failed to add collaborator');
    }
  }
  
  async function removeCollaborator(userId: string) {
    try {
      // Update project collaborators
      const updatedCollaborators = project.collaborators.filter(id => id !== userId);
      
      const { error } = await supabase
        .from('projects')
        .update({
          is_collaborative: updatedCollaborators.length > 0,
          collaborators: updatedCollaborators,
        })
        .eq('id', project.id);
      
      if (error) throw error;
      
      // Update local state
      setCollaborators(prev => prev.filter(user => user.id !== userId));
      
      // Call onUpdate callback
      if (onUpdate) {
        onUpdate({
          ...project,
          is_collaborative: updatedCollaborators.length > 0,
          collaborators: updatedCollaborators,
        });
      }
    } catch (error) {
      console.error('Error removing collaborator:', error);
      setError('Failed to remove collaborator');
    }
  }
  
  async function updatePermissions() {
    try {
      const { error } = await supabase
        .from('projects')
        .update({
          collaboration_settings: {
            ...project.collaboration_settings,
            permissions
          }
        })
        .eq('id', project.id);
      
      if (error) throw error;
      
      // Call onUpdate callback
      if (onUpdate) {
        onUpdate({
          ...project,
          collaboration_settings: {
            ...project.collaboration_settings,
            permissions
          }
        });
      }
      
      setIsOpen(false);
    } catch (error) {
      console.error('Error updating permissions:', error);
      setError('Failed to update permissions');
    }
  }
  
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share Project</DialogTitle>
          <DialogDescription>
            Invite others to collaborate on your project
          </DialogDescription>
        </DialogHeader>
        
        {error && (
          <div className="bg-red-50 text-red-700 p-3 rounded-md mb-4">
            {error}
          </div>
        )}
        
        <div className="space-y-4 py-2">
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search by email or name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && searchUsers()}
              className="pl-10 pr-20"
            />
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-8"
              onClick={searchUsers}
              disabled={isSearching || !searchQuery.trim()}
            >
              {isSearching ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-700"></div>
              ) : (
                'Search'
              )}
            </Button>
          </div>
          
          {searchResults.length > 0 && (
            <div className="border rounded-md divide-y">
              {searchResults.map(user => (
                <div key={user.id} className="flex items-center justify-between p-3">
                  <div className="flex items-center">
                    <Avatar className="h-8 w-8 mr-2">
                      {user.avatar_url ? (
                        <AvatarImage src={user.avatar_url} alt={user.full_name || user.email} />
                      ) : (
                        <AvatarFallback>{(user.full_name || user.email || "").charAt(0).toUpperCase()}</AvatarFallback>
                      )}
                    </Avatar>
                    <div>
                      {user.full_name && (
                        <div className="font-medium">{user.full_name}</div>
                      )}
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => addCollaborator(user.id)}
                  >
                    <UserPlusIcon className="h-4 w-4 mr-1" />
                    Add
                  </Button>
                </div>
              ))}
            </div>
          )}
          
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium">Collaborators</h4>
              <Badge variant="outline" className="text-xs">
                {collaborators.length}
              </Badge>
            </div>
            
            {collaborators.length === 0 ? (
              <div className="text-sm text-gray-500 p-3 border border-dashed rounded-md text-center">
                No collaborators yet
              </div>
            ) : (
              <div className="border rounded-md divide-y max-h-60 overflow-y-auto">
                {collaborators.map(user => (
                  <div key={user.id} className="flex items-center justify-between p-3">
                    <div className="flex items-center">
                      <Avatar className="h-8 w-8 mr-2">
                        {user.avatar_url ? (
                          <AvatarImage src={user.avatar_url} alt={user.full_name || user.email} />
                        ) : (
                          <AvatarFallback>{(user.full_name || user.email || "").charAt(0).toUpperCase()}</AvatarFallback>
                        )}
                      </Avatar>
                      <div>
                        {user.full_name && (
                          <div className="font-medium">{user.full_name}</div>
                        )}
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={() => removeCollaborator(user.id)}
                    >
                      <XIcon className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="pt-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Collaborator Permissions
            </label>
            <Select
              value={permissions}
              onValueChange={(value: 'view' | 'comment' | 'edit') => setPermissions(value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select permissions" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="view">View only</SelectItem>
                <SelectItem value="comment">Can comment</SelectItem>
                <SelectItem value="edit">Can edit</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500 mt-1">
              This applies to all collaborators on this project
            </p>
          </div>
        </div>
        
        <DialogFooter>
          <Button onClick={updatePermissions}>
            Save Settings
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
