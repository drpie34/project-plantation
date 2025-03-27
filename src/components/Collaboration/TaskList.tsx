
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import {
  Button,
  Input,
  Textarea,
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  Avatar,
  AvatarImage,
  AvatarFallback,
  Badge,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui';
import { format, isPast, isToday } from 'date-fns';
import { PlusIcon, CalendarIcon, CheckIcon, XIcon } from 'lucide-react';

interface TaskUser {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
}

interface Task {
  id: string;
  project_id: string;
  title: string;
  description: string | null;
  assigned_to: string | null;
  created_by: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  due_date: string | null;
  priority: 'low' | 'medium' | 'high';
  created_at: string;
  updated_at: string;
  assigned_to_user?: TaskUser;
  created_by_user?: TaskUser;
}

export default function TaskList({ projectId }: { projectId: string }) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [collaborators, setCollaborators] = useState<TaskUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [filteredStatus, setFilteredStatus] = useState('all');
  
  // New task form state
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    assigned_to: '',
    due_date: '',
    priority: 'medium' as 'low' | 'medium' | 'high'
  });
  
  useEffect(() => {
    fetchTasks();
    fetchCollaborators();
  }, [projectId, filteredStatus]);
  
  async function fetchTasks() {
    setIsLoading(true);
    
    try {
      let query = supabase
        .from('tasks')
        .select(`
          *,
          assigned_to_user:users!tasks_assigned_to_fkey(id, email, full_name, avatar_url),
          created_by_user:users!tasks_created_by_fkey(id, email, full_name, avatar_url)
        `)
        .eq('project_id', projectId);
      
      // Apply status filter if not 'all'
      if (filteredStatus !== 'all') {
        query = query.eq('status', filteredStatus);
      }
      
      // Sort by due date and priority
      query = query.order('due_date', { ascending: true });
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      // Transform data to match Task interface
      const transformedTasks = data?.map(item => {
        return {
          ...item,
          assigned_to_user: item.assigned_to_user || null,
          created_by_user: item.created_by_user || null
        };
      }) as Task[];
      
      setTasks(transformedTasks || []);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setIsLoading(false);
    }
  }
  
  async function fetchCollaborators() {
    try {
      // First get the project to find collaborators
      const { data: project, error: projectError } = await supabase
        .from('projects')
        .select('user_id, collaborators')
        .eq('id', projectId)
        .single();
      
      if (projectError) throw projectError;
      
      // Combine project owner with collaborators
      const userIds = [project.user_id, ...(project.collaborators || [])];
      
      // Then fetch user details
      const { data, error } = await supabase
        .from('users')
        .select('id, email, full_name, avatar_url')
        .in('id', userIds);
      
      if (error) throw error;
      setCollaborators(data as TaskUser[] || []);
    } catch (error) {
      console.error('Error fetching collaborators:', error);
    }
  }
  
  async function handleSubmitTask() {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return;
      
      // Validate form
      if (!newTask.title) return;
      
      const { data, error } = await supabase
        .from('tasks')
        .insert({
          project_id: projectId,
          title: newTask.title,
          description: newTask.description,
          assigned_to: newTask.assigned_to || null,
          created_by: user.id,
          due_date: newTask.due_date || null,
          priority: newTask.priority,
          status: 'pending'
        })
        .select()
        .single();
      
      if (error) throw error;
      
      // Add the new task to the list
      await fetchTasks(); // Refresh the tasks to get the full data
      
      // Reset form
      setNewTask({
        title: '',
        description: '',
        assigned_to: '',
        due_date: '',
        priority: 'medium'
      });
      
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Error creating task:', error);
    }
  }
  
  async function handleUpdateTaskStatus(taskId: string, newStatus: 'pending' | 'in_progress' | 'completed' | 'cancelled') {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ status: newStatus })
        .eq('id', taskId);
      
      if (error) throw error;
      
      // Update task list
      setTasks(prev => 
        prev.map(task => task.id === taskId ? { ...task, status: newStatus } : task)
      );
    } catch (error) {
      console.error('Error updating task status:', error);
    }
  }
  
  // Helper function to get status badge color
  function getStatusBadge(status: string) {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Pending</Badge>;
      case 'in_progress':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">In Progress</Badge>;
      case 'completed':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Completed</Badge>;
      case 'cancelled':
        return <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  }
  
  // Helper function to get priority badge
  function getPriorityBadge(priority: string) {
    switch (priority) {
      case 'high':
        return <Badge className="bg-red-100 text-red-800 border-red-200">High</Badge>;
      case 'medium':
        return <Badge className="bg-orange-100 text-orange-800 border-orange-200">Medium</Badge>;
      case 'low':
        return <Badge className="bg-green-100 text-green-800 border-green-200">Low</Badge>;
      default:
        return <Badge>{priority}</Badge>;
    }
  }
  
  // Helper function to format due date with status
  function formatDueDate(dueDate: string | null) {
    if (!dueDate) return null;
    
    const date = new Date(dueDate);
    const formattedDate = format(date, 'MMM d, yyyy');
    
    if (isPast(date) && !isToday(date)) {
      return (
        <span className="text-red-600">
          {formattedDate} (Overdue)
        </span>
      );
    } else if (isToday(date)) {
      return (
        <span className="text-orange-600 font-medium">
          {formattedDate} (Today)
        </span>
      );
    }
    
    return <span>{formattedDate}</span>;
  }
  
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2">
        <div>
          <Select
            value={filteredStatus}
            onValueChange={setFilteredStatus}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Tasks</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <PlusIcon className="h-4 w-4 mr-2" />
              Add Task
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Task</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div>
                <label className="block text-sm font-medium mb-1">Task Title</label>
                <Input
                  value={newTask.title}
                  onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                  placeholder="Enter task title"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <Textarea
                  value={newTask.description}
                  onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                  placeholder="Describe the task..."
                  rows={3}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Assign To</label>
                <Select
                  value={newTask.assigned_to}
                  onValueChange={(value) => setNewTask({...newTask, assigned_to: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select user" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Unassigned</SelectItem>
                    {collaborators.map(user => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.full_name || user.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Due Date</label>
                  <Input
                    type="date"
                    value={newTask.due_date}
                    onChange={(e) => setNewTask({...newTask, due_date: e.target.value})}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Priority</label>
                  <Select
                    value={newTask.priority}
                    onValueChange={(value: 'low' | 'medium' | 'high') => setNewTask({...newTask, priority: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            
            <DialogFooter>
              <Button onClick={handleSubmitTask} disabled={!newTask.title}>
                Create Task
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-700"></div>
        </div>
      ) : tasks.length === 0 ? (
        <div className="text-center py-8 text-gray-500 border rounded-md">
          No tasks found
          {filteredStatus !== 'all' && (
            <p className="text-sm mt-1">Try changing your filter</p>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {tasks.map(task => (
            <div 
              key={task.id} 
              className="border rounded-md p-4 bg-white hover:shadow-sm transition-shadow"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-medium">{task.title}</h4>
                  {task.description && (
                    <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                  )}
                </div>
                
                <div className="flex items-center space-x-2">
                  {getPriorityBadge(task.priority)}
                  {getStatusBadge(task.status)}
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mt-4 gap-2">
                <div className="flex items-center text-sm text-gray-600">
                  {task.due_date && (
                    <div className="flex items-center mr-4">
                      <CalendarIcon className="h-4 w-4 mr-1" />
                      {formatDueDate(task.due_date)}
                    </div>
                  )}
                  
                  {task.assigned_to && task.assigned_to_user && (
                    <div className="flex items-center">
                      <span className="mr-2">Assigned to:</span>
                      <Avatar className="h-6 w-6 mr-1">
                        {task.assigned_to_user.avatar_url ? (
                          <AvatarImage src={task.assigned_to_user.avatar_url} alt={task.assigned_to_user.full_name || task.assigned_to_user.email} />
                        ) : (
                          <AvatarFallback>{(task.assigned_to_user.full_name || task.assigned_to_user.email || "").charAt(0).toUpperCase()}</AvatarFallback>
                        )}
                      </Avatar>
                      <span>{task.assigned_to_user.full_name || task.assigned_to_user.email}</span>
                    </div>
                  )}
                </div>
                
                <div className="flex space-x-2">
                  {task.status !== 'completed' && (
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="text-green-600 hover:text-green-700 hover:bg-green-50"
                      onClick={() => handleUpdateTaskStatus(task.id, 'completed')}
                    >
                      <CheckIcon className="h-4 w-4 mr-1" />
                      Complete
                    </Button>
                  )}
                  
                  {task.status !== 'cancelled' && task.status !== 'completed' && (
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={() => handleUpdateTaskStatus(task.id, 'cancelled')}
                    >
                      <XIcon className="h-4 w-4 mr-1" />
                      Cancel
                    </Button>
                  )}
                  
                  {task.status === 'pending' && (
                    <Button 
                      size="sm" 
                      onClick={() => handleUpdateTaskStatus(task.id, 'in_progress')}
                    >
                      Start Working
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
