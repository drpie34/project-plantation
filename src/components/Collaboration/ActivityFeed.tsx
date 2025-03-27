
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from '@/components/ui';
import { formatDistanceToNow } from 'date-fns';
import { User } from '@/types/supabase';
import { useToast } from '@/hooks/use-toast';

interface Activity {
  id: string;
  user_id: string;
  activity_type: string;
  entity_type: string;
  entity_id: string;
  details: Record<string, any>;
  created_at: string;
}

interface ActivityFeedProps {
  projectId: string;
}

export default function ActivityFeed({ projectId }: ActivityFeedProps) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [usersMap, setUsersMap] = useState<Record<string, User>>({});
  const { toast } = useToast();
  
  useEffect(() => {
    if (projectId) {
      fetchActivities();
    }
  }, [projectId]);
  
  async function fetchActivities() {
    setIsLoading(true);
    
    try {
      // Fetch activities for this project combining project activities, task activities, and comments
      const { data: projectActivities, error: projectError } = await supabase
        .from('user_activity')
        .select('*')
        .eq('entity_type', 'project')
        .eq('entity_id', projectId)
        .order('created_at', { ascending: false })
        .limit(10);
        
      if (projectError) throw projectError;
      
      // Fetch recent comments as activities
      const { data: comments, error: commentsError } = await supabase
        .from('comments')
        .select('id, user_id, created_at, content')
        .eq('entity_type', 'project')
        .eq('entity_id', projectId)
        .order('created_at', { ascending: false })
        .limit(10);
        
      if (commentsError) throw commentsError;
      
      // Fetch recent tasks as activities
      const { data: tasks, error: tasksError } = await supabase
        .from('tasks')
        .select('id, title, created_by, status, created_at, updated_at')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false })
        .limit(10);
        
      if (tasksError) throw tasksError;
      
      // Transform comments to activity format
      const commentActivities = comments.map(comment => ({
        id: `comment-${comment.id}`,
        user_id: comment.user_id,
        activity_type: 'commented',
        entity_type: 'project',
        entity_id: projectId,
        details: { content: comment.content },
        created_at: comment.created_at
      }));
      
      // Transform tasks to activity format
      const taskActivities = tasks.map(task => ({
        id: `task-${task.id}`,
        user_id: task.created_by,
        activity_type: 'task_created',
        entity_type: 'task',
        entity_id: task.id,
        details: { title: task.title, status: task.status },
        created_at: task.created_at
      }));
      
      // Combine all activities and sort by date
      const allActivities = [
        ...(projectActivities || []),
        ...commentActivities,
        ...taskActivities
      ].sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      ).slice(0, 30);
      
      setActivities(allActivities);
      
      // Fetch user information for all activities
      const userIds = [...new Set(allActivities.map(activity => activity.user_id))];
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
      console.error('Error fetching activities:', error);
      toast({
        title: 'Error',
        description: 'Failed to load activity feed',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }
  
  function getUserInfo(userId: string): User {
    return usersMap[userId] || { 
      id: userId,
      email: 'Unknown User', 
      full_name: null,
      avatar_url: null,
      subscription_tier: 'free',
      credits_remaining: 0,
      credits_reset_date: '',
      created_at: ''
    };
  }
  
  function getActivityIcon(activityType: string) {
    switch (activityType) {
      case 'created':
        return "🟢";
      case 'updated':
        return "🔄";
      case 'deleted':
        return "🗑️";
      case 'commented':
        return "💬";
      case 'shared':
        return "🔗";
      case 'task_created':
        return "✅";
      case 'task_completed':
        return "✓";
      default:
        return "📝";
    }
  }
  
  function getActivityDescription(activity: Activity) {
    const entityType = activity.entity_type.charAt(0).toUpperCase() + activity.entity_type.slice(1);
    
    switch (activity.activity_type) {
      case 'created':
        return `created a new ${activity.entity_type}`;
      case 'updated':
        return `updated ${activity.entity_type} details`;
      case 'deleted':
        return `deleted a ${activity.entity_type}`;
      case 'commented':
        return `commented on this ${activity.entity_type}`;
      case 'shared':
        return `shared this ${activity.entity_type} with a team member`;
      case 'task_created':
        return `created a new task: ${activity.details?.title || ''}`;
      case 'task_completed':
        return `completed a task: ${activity.details?.title || ''}`;
      default:
        return `performed an action on this ${activity.entity_type}`;
    }
  }
  
  return (
    <div className="space-y-1">
      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-700"></div>
        </div>
      ) : activities.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No recent activity
        </div>
      ) : (
        <div className="space-y-4">
          {activities.map(activity => {
            const user = getUserInfo(activity.user_id);
            
            return (
              <div key={activity.id} className="flex gap-3">
                <div className="flex-shrink-0 mt-1">
                  {getActivityIcon(activity.activity_type)}
                </div>
                
                <div className="flex-grow">
                  <div className="flex items-center">
                    <Avatar className="h-6 w-6 mr-2">
                      {user.avatar_url ? (
                        <AvatarImage src={user.avatar_url} alt={user.full_name || user.email} />
                      ) : (
                        <AvatarFallback>{(user.full_name || user.email || "").charAt(0).toUpperCase()}</AvatarFallback>
                      )}
                    </Avatar>
                    <span className="font-medium">
                      {user.full_name || user.email}
                    </span>
                    <span className="mx-1">
                      {getActivityDescription(activity)}
                    </span>
                  </div>
                  
                  <div className="text-xs text-gray-500 mt-1">
                    {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
