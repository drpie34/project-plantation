
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from '@/components/ui';
import { formatDistanceToNow } from 'date-fns';

interface ActivityUser {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
}

interface Activity {
  id: string;
  user_id: string;
  activity_type: string;
  entity_type: string;
  entity_id: string;
  details: Record<string, any> | null;
  created_at: string;
}

export default function ActivityFeed({ projectId }: { projectId: string }) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [usersMap, setUsersMap] = useState<Record<string, ActivityUser>>({});
  
  useEffect(() => {
    fetchActivities();
  }, [projectId]);
  
  async function fetchActivities() {
    setIsLoading(true);
    
    try {
      // Check if the table exists first to avoid errors
      const { data, error } = await supabase
        .from('user_activity')
        .select('*')
        .eq('entity_type', 'project')
        .eq('entity_id', projectId)
        .order('created_at', { ascending: false })
        .limit(30);
      
      if (error) throw error;
      
      setActivities(data as Activity[] || []);
      
      if (data && data.length > 0) {
        // Fetch user information for all activities
        const userIds = [...new Set(data.map(activity => activity.user_id))];
        if (userIds.length > 0) {
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('id, email, full_name, avatar_url')
            .in('id', userIds);
          
          if (userError) throw userError;
          
          // Create a map of user IDs to user data
          const usersMapData = userData.reduce((acc: Record<string, ActivityUser>, user: ActivityUser) => {
            acc[user.id] = user;
            return acc;
          }, {});
          
          setUsersMap(usersMapData);
        }
      }
    } catch (error) {
      console.error('Error fetching activities:', error);
    } finally {
      setIsLoading(false);
    }
  }
  
  function getUserInfo(userId: string): ActivityUser {
    return usersMap[userId] || { 
      id: userId,
      email: 'Unknown User', 
      full_name: null,
      avatar_url: null 
    };
  }
  
  function getActivityIcon(activityType: string): string {
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
  
  function getActivityDescription(activity: Activity): string {
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
