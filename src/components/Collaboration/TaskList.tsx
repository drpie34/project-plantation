
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import {
  Button,
  Input,
  Select,
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
  Badge
} from '@/components/ui';
import { format, isPast, isToday } from 'date-fns';
import { Plus as PlusIcon, Calendar as CalendarIcon, Check as CheckIcon, X as XIcon } from 'lucide-react';
import { User } from '@/types/supabase';

interface Task {
  id: string;
  project_id: string;
  title: string;
  description: string | null;
  assigned_to: User | null;
  created_by: User;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  due_date: string | null;
  priority: 'low' | 'medium' | 'high';
  created_at: string;
  updated_at: string;
}

interface NewTask {
  title: string;
  description: string;
  assigned_to: string;
  due_date: string;
  priority: 'low' | 'medium' | 'high';
}

interface TaskListProps {
  projectId: string;
}

export default function TaskList({ projectId }: TaskListProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [collaborators, setCollaborators] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [filteredStatus, setFilteredStatus] = useState('all');
  const { user } = useAuth();
  const { toast } = useToast();
  
  // New task form state
  const [newTask, setNewTask] = useState<NewTask>({
    title: '',
    description: '',
    assigned_to: '',
    due_date: '',
    priority: 'medium'
  });
  
  useEffect(() => {
    if (projectId) {
      fetchTasks();
      fetchCollaborators();
    }
  }, [projectId, filteredStatus]);
  
  async function fetchTasks() {
    setIsLoading(true);
    
    try {
      let query = supabase
        .from('tasks')
        .select(`
          *,
          assigned_to:users!assigned_to(id, email, full_name, avatar_url),
          created_by:users!created_by(id, email, full_name)
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
      setTasks(data || []);
    } catch (error: any) {
      console.error('Error fetching tasks:', error);
      toast({
        title: 'Error',
        description: 'Failed to load tasks',
        variant: 'destructive',
      });
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
      setCollaborators(data || []);
    } catch (error: any) {
      console.error('Error fetching collaborators:', error);
      toast({
        title: 'Error',
        description: 'Failed to load collaborators',
        variant: 'destructive',
      });
    }
  }
  
  async function handleSubmitTask() {
    try {
      // Validate user
      if (!user) {
        toast({
          title: 'Authentication required',
          description: 'You must be logged in to create tasks',
          variant: 'destructive',
        });
        return;
      }
      
      // Validate form
      if (!newTask.title) {
        toast({
          title: 'Validation error',
          description: 'Task title is required',
          variant: 'destructive',
        });
        return;
      }
      
      const { data, error } = await supabase
        .from('tasks')
        .insert({
          project_id: projectId,
          title: newTask.title,
          description: newTask.description || null,
          assigned_to: newTask.assigned_to || null,
          created_by: user.id,
          due_date: newTask.due_date || null,
          priority: newTask.priority,
          status: 'pending'
        })
        .select(`
          *,
          assigned_to:users!assigned_to(id, email, full_name, avatar_url),
          created_by:users!created_by(id, email, full_name)
        `)
        .single();
      
      if (error) throw error;
      
      // Add the new task to the list
      setTasks(prev => [data, ...prev]);
      
      toast({
        title: 'Success',
        description: 'Task created successfully',
      });
      
      // Reset form
      setNewTask({
        title: '',
        description: '',
        assigned_to: '',
        due_date: '',
        priority: 'medium'
      });
      
      setIsDialogOpen(false);
    } catch (error: any) {
      console.error('Error creating task:', error);
      toast({
        title: 'Error',
        description: 'Failed to create task',
        variant: 'destructive',
      });
    }
  }
  
  async function handleUpdateTaskStatus(taskId: string, newStatus: Task['status']) {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .update({ status: newStatus })
        .eq('id', taskId)
        .select()
        .single();
      
      if (error) throw error;
      
      // Update task list
      setTasks(prev => 
        prev.map(task => task.id === taskId ? { ...task, status: newStatus } : task)
      );
      
      toast({
        title: 'Success',
        description: `Task ${newStatus === 'completed' ? 'marked as complete' : 
          newStatus === 'cancelled' ? 'cancelled' : 'updated'}`,
      });
    } catch (error: any) {
      console.error('Error updating task status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update task status',
        variant: 'destructive',
      });
    }
  }
  
  // Helper function to get status badge color
  function getStatusBadge(status: Task['status']) {
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
  function getPriorityBadge(priority: Task['priority']) {
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
        <Select 
          value={filteredStatus} 
          onValueChange={(value) => setFilteredStatus(value)}
          className="w-full sm:w-40"
        >
          <option value="all">All Tasks</option>
          <option value="pending">Pending</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </Select>
        
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
                  <option value="">Unassigned</option>
                  {collaborators.map(user => (
                    <option key={user.id} value={user.id}>
                      {user.full_name || user.email}
                    </option>
                  ))}
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
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
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
                  
                  {task.assigned_to && (
                    <div className="flex items-center">
                      <span className="mr-2">Assigned to:</span>
                      <Avatar className="h-6 w-6 mr-1">
                        {task.assigned_to.avatar_url ? (
                          <AvatarImage src={task.assigned_to.avatar_url} alt={task.assigned_to.full_name || task.assigned_to.email} />
                        ) : (
                          <AvatarFallback>{(task.assigned_to.full_name || task.assigned_to.email || "").charAt(0).toUpperCase()}</AvatarFallback>
                        )}
                      </Avatar>
                      <span>{task.assigned_to.full_name || task.assigned_to.email}</span>
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
