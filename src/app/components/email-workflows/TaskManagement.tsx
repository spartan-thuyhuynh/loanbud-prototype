import { useState } from 'react';
import {
  Search,
  Calendar,
  User,
  CheckCircle2,
  Clock,
  AlertCircle,
  Edit,
  UserPlus,
  BarChart3,
  SlidersHorizontal,
  ChevronDown
} from 'lucide-react';
import type { TaskItem } from '@/app/types';
import { store } from '@/app/data/store';

export function TaskManagement() {
  const [tasks] = useState<TaskItem[]>(store.taskItems.read());

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterAssignee, setFilterAssignee] = useState<string>('all');
  const [filterSource, setFilterSource] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'list' | 'assignee'>('list');
  const [selectedTasks, _setSelectedTasks] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  // Get unique assignees and sources
  const assignees = Array.from(new Set(tasks.map(t => t.assignee)));
  const sources = Array.from(new Set(tasks.map(t => t.source)));

  // Filter tasks
  const filteredTasks = tasks.filter(task => {
    const matchesSearch =
      task.contactName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.source.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || task.status === filterStatus;
    const matchesAssignee = filterAssignee === 'all' || task.assignee === filterAssignee;
    const matchesSource = filterSource === 'all' || task.source === filterSource;

    return matchesSearch && matchesStatus && matchesAssignee && matchesSource;
  });

  // Group by assignee
  const tasksByAssignee = assignees.reduce((acc, assignee) => {
    acc[assignee] = filteredTasks.filter(t => t.assignee === assignee);
    return acc;
  }, {} as Record<string, TaskItem[]>);

  const formatDateTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'overdue':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'completed':
        return 'bg-green-100 text-green-700 border-green-200';
      default:
        return 'bg-blue-100 text-blue-700 border-blue-200';
    }
  };

  const getWorkloadLevel = (taskCount: number) => {
    if (taskCount >= 10) return { label: 'High', color: 'text-red-600' };
    if (taskCount >= 5) return { label: 'Medium', color: 'text-amber-600' };
    return { label: 'Low', color: 'text-green-600' };
  };

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card px-8 py-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-3xl mb-2" style={{ fontFamily: 'var(--font-sans)', fontWeight: 600 }}>
              Task Management
            </h2>
            <p className="text-muted-foreground">
              Execute and manage all follow-up tasks
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setViewMode(viewMode === 'list' ? 'assignee' : 'list')}
              className="px-4 py-2 border-2 border-border rounded-lg hover:bg-muted transition-all flex items-center gap-2"
            >
              <BarChart3 className="w-4 h-4" />
              {viewMode === 'list' ? 'View by Assignee' : 'View List'}
            </button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search tasks or contacts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-4 py-2 border-2 rounded-lg transition-all flex items-center gap-2 ${
              showFilters ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filters
            {(filterStatus !== 'all' || filterAssignee !== 'all' || filterSource !== 'all') && (
              <span className="px-2 py-0.5 bg-primary text-primary-foreground rounded-full text-xs">
                {[filterStatus !== 'all', filterAssignee !== 'all', filterSource !== 'all'].filter(Boolean).length}
              </span>
            )}
          </button>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="mt-4 p-4 bg-muted/30 border border-border rounded-lg">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm mb-2 text-muted-foreground">Status</label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full px-3 py-2 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="all">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="overdue">Overdue</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
              <div>
                <label className="block text-sm mb-2 text-muted-foreground">Assignee</label>
                <select
                  value={filterAssignee}
                  onChange={(e) => setFilterAssignee(e.target.value)}
                  className="w-full px-3 py-2 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="all">All Assignees</option>
                  {assignees.map(assignee => (
                    <option key={assignee} value={assignee}>{assignee}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm mb-2 text-muted-foreground">Source</label>
                <select
                  value={filterSource}
                  onChange={(e) => setFilterSource(e.target.value)}
                  className="w-full px-3 py-2 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="all">All Sources</option>
                  {sources.map(source => (
                    <option key={source} value={source}>{source}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Stats Bar */}
      <div className="border-b border-border bg-card px-8 py-4">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-600" />
            <div>
              <span className="text-sm text-muted-foreground">Pending: </span>
              <span className="font-medium" style={{ fontFamily: 'var(--font-mono)' }}>
                {tasks.filter(t => t.status === 'pending').length}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <div>
              <span className="text-sm text-muted-foreground">Overdue: </span>
              <span className="font-medium" style={{ fontFamily: 'var(--font-mono)' }}>
                {tasks.filter(t => t.status === 'overdue').length}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-green-600" />
            <div>
              <span className="text-sm text-muted-foreground">Completed: </span>
              <span className="font-medium" style={{ fontFamily: 'var(--font-mono)' }}>
                {tasks.filter(t => t.status === 'completed').length}
              </span>
            </div>
          </div>
          <div className="ml-auto">
            <span className="text-sm text-muted-foreground">Total Tasks: </span>
            <span className="font-medium" style={{ fontFamily: 'var(--font-mono)' }}>
              {filteredTasks.length}
            </span>
          </div>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedTasks.length > 0 && (
        <div className="border-b border-border bg-accent/10 px-8 py-3">
          <div className="flex items-center justify-between">
            <span className="text-sm">
              {selectedTasks.length} task{selectedTasks.length !== 1 ? 's' : ''} selected
            </span>
            <div className="flex gap-2">
              <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-all text-sm">
                Bulk Reassign
              </button>
              <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all text-sm">
                Mark Complete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Task List/Assignee View */}
      <div className="flex-1 overflow-auto">
        {viewMode === 'list' ? (
          <div className="bg-card">
            <table className="w-full">
              <thead className="bg-muted/50 border-b border-border sticky top-0">
                <tr>
                  <th className="px-6 py-4 text-left">
                    <input type="checkbox" className="rounded border-border" />
                  </th>
                  <th className="px-6 py-4 text-left text-sm text-muted-foreground" style={{ fontFamily: 'var(--font-sans)', fontWeight: 600 }}>
                    Contact
                  </th>
                  <th className="px-6 py-4 text-left text-sm text-muted-foreground" style={{ fontFamily: 'var(--font-sans)', fontWeight: 600 }}>
                    Task Type
                  </th>
                  <th className="px-6 py-4 text-left text-sm text-muted-foreground" style={{ fontFamily: 'var(--font-sans)', fontWeight: 600 }}>
                    Source
                  </th>
                  <th className="px-6 py-4 text-left text-sm text-muted-foreground" style={{ fontFamily: 'var(--font-sans)', fontWeight: 600 }}>
                    Due Date
                  </th>
                  <th className="px-6 py-4 text-left text-sm text-muted-foreground" style={{ fontFamily: 'var(--font-sans)', fontWeight: 600 }}>
                    Assignee
                  </th>
                  <th className="px-6 py-4 text-left text-sm text-muted-foreground" style={{ fontFamily: 'var(--font-sans)', fontWeight: 600 }}>
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-sm text-muted-foreground" style={{ fontFamily: 'var(--font-sans)', fontWeight: 600 }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredTasks.map((task) => (
                  <tr key={task.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-6 py-4">
                      <input type="checkbox" className="rounded border-border" />
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium">{task.contactName}</div>
                        <div className="text-sm text-muted-foreground">
                          Status: {task.contactStatus}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">
                        {task.taskType}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm">{task.source}</div>
                        {task.ruleName && (
                          <div className="text-xs text-muted-foreground">
                            Rule: {task.ruleName}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span style={{ fontFamily: 'var(--font-mono)' }}>
                          {formatDateTime(task.dueDate)}
                        </span>
                      </div>
                      {task.triggerContext && (
                        <div className="text-xs text-muted-foreground mt-1">
                          {task.triggerContext}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm">
                        <User className="w-4 h-4 text-muted-foreground" />
                        {task.assignee}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs border ${getStatusColor(task.status)}`}>
                        {task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        {task.status !== 'completed' && (
                          <>
                            <button className="p-2 hover:bg-muted rounded-lg transition-all" title="Complete">
                              <CheckCircle2 className="w-4 h-4 text-green-600" />
                            </button>
                            <button className="p-2 hover:bg-muted rounded-lg transition-all" title="Reassign">
                              <UserPlus className="w-4 h-4 text-blue-600" />
                            </button>
                            <button className="p-2 hover:bg-muted rounded-lg transition-all" title="Edit">
                              <Edit className="w-4 h-4 text-muted-foreground" />
                            </button>
                          </>
                        )}
                        {task.status === 'completed' && task.outcome && (
                          <span className="text-sm text-muted-foreground italic">
                            {task.outcome}
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredTasks.length === 0 && (
              <div className="py-12 text-center text-muted-foreground">
                <CheckCircle2 className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No tasks found</p>
              </div>
            )}
          </div>
        ) : (
          <div className="p-8">
            <div className="max-w-6xl mx-auto space-y-6">
              <h3 className="text-xl mb-4" style={{ fontFamily: 'var(--font-sans)', fontWeight: 600 }}>
                Workload by Assignee
              </h3>
              {assignees.map((assignee) => {
                const assigneeTasks = tasksByAssignee[assignee];
                const pendingCount = assigneeTasks.filter(t => t.status === 'pending').length;
                const overdueCount = assigneeTasks.filter(t => t.status === 'overdue').length;
                const workload = getWorkloadLevel(pendingCount + overdueCount);

                return (
                  <div key={assignee} className="bg-card border border-border rounded-lg overflow-hidden">
                    <div className="bg-muted/50 px-6 py-4 border-b border-border">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <User className="w-5 h-5 text-primary" />
                          <h4 className="text-lg" style={{ fontFamily: 'var(--font-sans)', fontWeight: 600 }}>
                            {assignee}
                          </h4>
                        </div>
                        <div className="flex items-center gap-6">
                          <div className="text-sm">
                            <span className="text-muted-foreground">Workload: </span>
                            <span className={`font-medium ${workload.color}`}>
                              {workload.label}
                            </span>
                          </div>
                          <div className="text-sm">
                            <span className="text-muted-foreground">Pending: </span>
                            <span className="font-medium" style={{ fontFamily: 'var(--font-mono)' }}>
                              {pendingCount}
                            </span>
                          </div>
                          {overdueCount > 0 && (
                            <div className="text-sm">
                              <span className="text-red-600">Overdue: </span>
                              <span className="font-medium text-red-600" style={{ fontFamily: 'var(--font-mono)' }}>
                                {overdueCount}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="divide-y divide-border">
                      {assigneeTasks.slice(0, 5).map((task) => (
                        <div key={task.id} className="p-4 hover:bg-muted/20 transition-colors">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <span className="font-medium">{task.contactName}</span>
                                <span className={`px-2 py-1 rounded-full text-xs border ${getStatusColor(task.status)}`}>
                                  {task.taskType}
                                </span>
                              </div>
                              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <span>{task.source}</span>
                                <span>•</span>
                                <span>{formatDateTime(task.dueDate)}</span>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              {task.status !== 'completed' && (
                                <>
                                  <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all text-sm">
                                    Complete
                                  </button>
                                  <button className="px-4 py-2 border border-border rounded-lg hover:bg-muted transition-all text-sm">
                                    Edit
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                      {assigneeTasks.length > 5 && (
                        <div className="p-4 text-center">
                          <button className="text-primary hover:underline text-sm flex items-center gap-2 mx-auto">
                            Show {assigneeTasks.length - 5} more tasks
                            <ChevronDown className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
