
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Button,
  Textarea,
  Avatar,
  AvatarImage,
  AvatarFallback,
  Separator
} from '@/components/ui';
import { formatDistanceToNow } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { User } from '@/types/supabase';
import { useAuth } from '@/context/AuthContext';

interface Comment {
  id: string;
  entity_type: string;
  entity_id: string;
  user_id: string;
  content: string;
  created_at: string;
  updated_at: string;
}

interface CommentSectionProps {
  entityType: string;
  entityId: string;
}

export default function CommentSection({ entityType, entityId }: CommentSectionProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [usersMap, setUsersMap] = useState<Record<string, any>>({});
  const { toast } = useToast();
  
  useEffect(() => {
    if (entityId) {
      fetchComments();
    }
  }, [entityType, entityId]);
  
  async function fetchComments() {
    setIsLoading(true);
    
    try {
      // Fetch comments
      const { data, error } = await supabase
        .from('comments')
        .select('*')
        .eq('entity_type', entityType)
        .eq('entity_id', entityId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      setComments(data || []);
      
      // Fetch user information for each comment
      const userIds = [...new Set(data.map(comment => comment.user_id))];
      if (userIds.length > 0) {
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('id, email, full_name, avatar_url')
          .in('id', userIds);
        
        if (userError) throw userError;
        
        // Create a map of user IDs to user data
        const usersMapData = userData.reduce((acc: Record<string, any>, user: any) => {
          acc[user.id] = user;
          return acc;
        }, {});
        
        setUsersMap(usersMapData);
      }
    } catch (error: any) {
      console.error('Error fetching comments:', error);
      setError('Failed to load comments');
      toast({
        title: 'Error',
        description: 'Failed to load comments',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }
  
  async function handleAddComment() {
    if (!commentText.trim() || !user) {
      if (!user) {
        toast({
          title: 'Authentication required',
          description: 'You must be logged in to add comments',
          variant: 'destructive',
        });
        return;
      }
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const { data, error } = await supabase
        .from('comments')
        .insert({
          entity_type: entityType,
          entity_id: entityId,
          user_id: user.id,
          content: commentText.trim(),
        })
        .select()
        .single();
      
      if (error) throw error;
      
      // Add the new comment to the beginning of the list
      setComments(prev => [data, ...prev]);
      setCommentText('');

      toast({
        title: 'Comment added',
        description: 'Your comment has been added successfully',
      });
    } catch (error: any) {
      console.error('Error adding comment:', error);
      setError('Failed to add comment');
      toast({
        title: 'Error',
        description: 'Failed to add comment',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  }
  
  function getUserInfo(userId: string): any {
    return usersMap[userId] || { 
      id: userId,
      email: 'Unknown User', 
      full_name: null,
      avatar_url: null 
    };
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Comments</CardTitle>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="bg-red-50 text-red-700 p-3 rounded-md mb-4">
            {error}
          </div>
        )}
        
        {user && (
          <div className="mb-6">
            <div className="flex items-start gap-3">
              <Avatar className="h-10 w-10">
                {user.avatar_url ? (
                  <AvatarImage src={user.avatar_url} alt={user.full_name || user.email} />
                ) : (
                  <AvatarFallback>{(user.full_name || user.email || "").charAt(0).toUpperCase()}</AvatarFallback>
                )}
              </Avatar>
              <div className="flex-1">
                <Textarea
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Add a comment..."
                  rows={3}
                />
                <div className="mt-2 flex justify-end">
                  <Button
                    onClick={handleAddComment}
                    disabled={isSubmitting || !commentText.trim()}
                  >
                    {isSubmitting ? 'Posting...' : 'Post Comment'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <Separator className="my-4" />
        
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-700"></div>
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No comments yet
          </div>
        ) : (
          <div className="space-y-6">
            {comments.map(comment => {
              const user = getUserInfo(comment.user_id);
              
              return (
                <div key={comment.id} className="flex gap-3">
                  <Avatar className="h-10 w-10">
                    {user.avatar_url ? (
                      <AvatarImage src={user.avatar_url} alt={user.full_name || user.email} />
                    ) : (
                      <AvatarFallback>{(user.full_name || user.email || "").charAt(0).toUpperCase()}</AvatarFallback>
                    )}
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">
                        {user.full_name || user.email}
                      </span>
                      <span className="text-xs text-gray-500">
                        {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                      </span>
                    </div>
                    <div className="mt-1 text-gray-700">
                      {comment.content}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
