
import { useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { 
  Button
} from '@/components/ui/button';
import { 
  Dialog, 
  DialogTrigger, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription, 
  DialogFooter
} from '@/components/ui/dialog';
import {
  Input
} from '@/components/ui/input';
import {
  Label
} from '@/components/ui/label';
import {
  Popover,
  PopoverTrigger,
  PopoverContent
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format, addDays, differenceInDays } from 'date-fns';
import { Plus, X } from 'lucide-react';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface Task {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date;
  color: string;
}

interface GanttChartProps {
  initialTasks?: Task[];
  onSave?: (tasks: Task[]) => void;
  readOnly?: boolean;
}

export default function GanttChart({ 
  initialTasks = [], 
  onSave,
  readOnly = false
}: GanttChartProps) {
  const [tasks, setTasks] = useState<Task[]>(
    initialTasks.map(task => ({
      ...task,
      startDate: new Date(task.startDate),
      endDate: new Date(task.endDate)
    }))
  );
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const [newTask, setNewTask] = useState<Omit<Task, 'id'>>({
    name: '',
    startDate: new Date(),
    endDate: addDays(new Date(), 7),
    color: '#3B82F6'
  });
  
  // Prepare data for Chart.js
  const prepareData = () => {
    const labels = tasks.map(task => task.name);
    
    // Find project start and end dates
    if (tasks.length === 0) {
      return {
        labels: [],
        datasets: [{
          label: 'Tasks',
          data: [],
          backgroundColor: [],
          borderWidth: 1,
          borderColor: [],
          borderRadius: 4
        }]
      };
    }
    
    const allDates = tasks.flatMap(task => [task.startDate, task.endDate]);
    const projectStart = new Date(Math.min(...allDates.map(d => d.getTime())));
    
    const datasets = [{
      label: 'Tasks',
      data: tasks.map(task => {
        const start = task.startDate;
        const end = task.endDate;
        return {
          x: differenceInDays(start, projectStart),
          width: differenceInDays(end, start) + 1 // Add 1 day to include end date
        };
      }),
      backgroundColor: tasks.map(task => task.color),
      borderWidth: 1,
      borderColor: tasks.map(task => task.color),
      borderRadius: 4
    }];
    
    return { labels, datasets };
  };
  
  // Handle adding a new task
  const handleAddTask = () => {
    if (!newTask.name) return;
    
    const updatedTasks = [...tasks, { 
      id: Date.now().toString(),
      ...newTask 
    }];
    
    setTasks(updatedTasks);
    setNewTask({
      name: '',
      startDate: new Date(),
      endDate: addDays(new Date(), 7),
      color: '#3B82F6'
    });
    setIsAddTaskOpen(false);
    
    if (onSave) {
      onSave(updatedTasks);
    }
  };
  
  // Handle removing a task
  const handleRemoveTask = (taskId: string) => {
    const updatedTasks = tasks.filter(task => task.id !== taskId);
    setTasks(updatedTasks);
    
    if (onSave) {
      onSave(updatedTasks);
    }
  };
  
  // Chart options
  const options = {
    indexAxis: 'y' as const,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const task = tasks[context.dataIndex];
            return [
              `Start: ${format(task.startDate, 'MMM d, yyyy')}`,
              `End: ${format(task.endDate, 'MMM d, yyyy')}`,
              `Duration: ${differenceInDays(task.endDate, task.startDate) + 1} days`
            ];
          }
        }
      }
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Days'
        },
        stacked: true
      },
      y: {
        beginAtZero: true
      }
    },
    responsive: true,
    maintainAspectRatio: false
  };
  
  return (
    <div className="space-y-4">
      {!readOnly && (
        <div className="flex justify-end">
          <Dialog open={isAddTaskOpen} onOpenChange={setIsAddTaskOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Task
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Task</DialogTitle>
                <DialogDescription>
                  Add a new task to your Gantt chart
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 py-4">
                <div>
                  <Label htmlFor="task-name">Task Name</Label>
                  <Input
                    id="task-name"
                    value={newTask.name}
                    onChange={(e) => setNewTask({...newTask, name: e.target.value})}
                    placeholder="Enter task name"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Start Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal"
                        >
                          {format(newTask.startDate, 'PPP')}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={newTask.startDate}
                          onSelect={(date) => setNewTask({...newTask, startDate: date || new Date()})}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  
                  <div>
                    <Label>End Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal"
                        >
                          {format(newTask.endDate, 'PPP')}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={newTask.endDate}
                          onSelect={(date) => setNewTask({...newTask, endDate: date || addDays(newTask.startDate, 1)})}
                          initialFocus
                          disabled={(date) => date < newTask.startDate}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="task-color">Color</Label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      id="task-color"
                      value={newTask.color}
                      onChange={(e) => setNewTask({...newTask, color: e.target.value})}
                      className="h-10 w-10 rounded cursor-pointer"
                    />
                    <Input
                      value={newTask.color}
                      onChange={(e) => setNewTask({...newTask, color: e.target.value})}
                      className="font-mono"
                    />
                  </div>
                </div>
              </div>
              
              <DialogFooter>
                <Button onClick={handleAddTask} disabled={!newTask.name}>
                  Add Task
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      )}
      
      {tasks.length > 0 ? (
        <div>
          <div className="h-[400px]">
            <Bar data={prepareData()} options={options} />
          </div>
          
          {!readOnly && (
            <div className="mt-6">
              <h3 className="text-lg font-medium mb-3">Tasks</h3>
              <div className="space-y-2">
                {tasks.map(task => (
                  <div 
                    key={task.id} 
                    className="flex items-center justify-between py-2 px-3 border rounded-md"
                  >
                    <div className="flex items-center">
                      <div
                        className="w-4 h-4 rounded-full mr-3"
                        style={{ backgroundColor: task.color }}
                      ></div>
                      <div>
                        <div className="font-medium">{task.name}</div>
                        <div className="text-sm text-gray-500">
                          {format(task.startDate, 'MMM d')} - {format(task.endDate, 'MMM d, yyyy')}
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveTask(task.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="border rounded-md p-8 text-center">
          <p className="text-gray-500 mb-4">No tasks added yet</p>
          {!readOnly && (
            <Button onClick={() => setIsAddTaskOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Task
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
