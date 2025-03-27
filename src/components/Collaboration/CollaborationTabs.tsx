
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui';
import { Card } from '@/components/ui';
import CommentSection from './CommentSection';
import TaskList from './TaskList';
import ActivityFeed from './ActivityFeed';
import { MessageSquare, CheckSquare, Clock } from 'lucide-react';

interface CollaborationTabsProps {
  projectId: string;
}

export default function CollaborationTabs({ projectId }: CollaborationTabsProps) {
  const [activeTab, setActiveTab] = useState('comments');
  
  return (
    <Card className="mt-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="comments" className="flex items-center">
            <MessageSquare className="h-4 w-4 mr-2" />
            Comments
          </TabsTrigger>
          <TabsTrigger value="tasks" className="flex items-center">
            <CheckSquare className="h-4 w-4 mr-2" />
            Tasks
          </TabsTrigger>
          <TabsTrigger value="activity" className="flex items-center">
            <Clock className="h-4 w-4 mr-2" />
            Activity
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="comments" className="p-4">
          <CommentSection entityType="project" entityId={projectId} />
        </TabsContent>
        
        <TabsContent value="tasks" className="p-4">
          <TaskList projectId={projectId} />
        </TabsContent>
        
        <TabsContent value="activity" className="p-4">
          <ActivityFeed projectId={projectId} />
        </TabsContent>
      </Tabs>
    </Card>
  );
}
