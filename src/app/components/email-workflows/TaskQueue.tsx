import { useState } from 'react';
import { Phone, Calendar, CheckCircle2, Clock, MessageSquare } from 'lucide-react';
import type { Task } from '@/app/types';

interface TaskQueueProps {
  tasks: Task[];
  onComplete: (taskId: string, disposition: Task['disposition']) => void;
  onReschedule: (taskId: string, newDate: Date) => void;
}

const dispositions: Task['disposition'][] = [
  'Answered',
  'VM Left',
  'No Answer',
  'Not Needed',
];

const statusColors = {
  New: 'bg-blue-500',
  Draft: 'bg-purple-500',
  Submitted: 'bg-green-500',
  'On Hold': 'bg-amber-500',
  Declined: 'bg-red-500',
};

export function TaskQueue({ tasks, onComplete, onReschedule }: TaskQueueProps) {
  const [selectedTask, setSelectedTask] = useState<string | null>(null);
  const [showReschedule, setShowReschedule] = useState<string | null>(null);
  const [rescheduleDate, setRescheduleDate] = useState('');

  const pendingTasks = tasks.filter((t) => t.status === 'pending');
  const completedTasks = tasks.filter((t) => t.status === 'completed');

  const handleComplete = (taskId: string, disposition: Task['disposition']) => {
    onComplete(taskId, disposition);
    setSelectedTask(null);
  };

  const handleReschedule = (taskId: string) => {
    if (rescheduleDate) {
      onReschedule(taskId, new Date(rescheduleDate));
      setShowReschedule(null);
      setRescheduleDate('');
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const isOverdue = (date: Date) => {
    return date < new Date();
  };

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card px-8 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl" style={{ fontFamily: 'var(--font-sans)', fontWeight: 600 }}>
              Agent Task Queue
            </h2>
            <p className="text-muted-foreground mt-1">
              Follow-up call reminders
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className="text-sm text-muted-foreground">Pending</div>
              <div
                className="text-3xl text-accent"
                style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}
              >
                {pendingTasks.length}
              </div>
            </div>
            <div className="w-px h-12 bg-border" />
            <div className="text-center">
              <div className="text-sm text-muted-foreground">Completed</div>
              <div
                className="text-3xl text-green-600"
                style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}
              >
                {completedTasks.length}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto px-8 py-6">
        {pendingTasks.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <CheckCircle2 className="w-16 h-16 mx-auto mb-4 text-green-600 opacity-50" />
              <h3 className="text-xl mb-2" style={{ fontFamily: 'var(--font-sans)', fontWeight: 600 }}>
                All Caught Up!
              </h3>
              <p className="text-muted-foreground">No pending tasks in your queue</p>
            </div>
          </div>
        ) : (
          <div className="grid gap-4 max-w-5xl mx-auto">
            {pendingTasks
              .sort((a, b) => a.scheduledFor.getTime() - b.scheduledFor.getTime())
              .map((task) => {
                const overdue = isOverdue(task.scheduledFor);
                const isExpanded = selectedTask === task.id;
                const isRescheduling = showReschedule === task.id;

                return (
                  <div
                    key={task.id}
                    className={`bg-card border-2 rounded-lg overflow-hidden transition-all ${
                      overdue
                        ? 'border-destructive shadow-lg shadow-destructive/10'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    {/* Task Header */}
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3
                              className="text-xl"
                              style={{ fontFamily: 'var(--font-sans)', fontWeight: 600 }}
                            >
                              {task.contactName}
                            </h3>
                            <span
                              className={`px-2 py-0.5 rounded-full text-white text-xs ${
                                statusColors[task.listingStatus as keyof typeof statusColors] || 'bg-gray-500'
                              }`}
                            >
                              {task.listingStatus}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-2">
                              <Phone className="w-4 h-4" />
                              <span style={{ fontFamily: 'var(--font-mono)' }}>
                                {task.contactPhone}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4" />
                              <span>Day {task.dueDay} Follow-up</span>
                            </div>
                          </div>
                        </div>

                        <div className="text-right">
                          <div
                            className={`text-sm mb-1 ${
                              overdue ? 'text-destructive font-medium' : 'text-muted-foreground'
                            }`}
                          >
                            {overdue ? 'OVERDUE' : 'Scheduled'}
                          </div>
                          <div className="text-sm" style={{ fontFamily: 'var(--font-mono)' }}>
                            {formatDate(task.scheduledFor)}
                          </div>
                        </div>
                      </div>

                      {/* Call Objective */}
                      <div className="bg-muted/30 rounded-lg p-4 mb-4">
                        <div className="text-xs text-muted-foreground mb-1">Call Objective</div>
                        <div className="text-sm">{task.callObjective}</div>
                      </div>

                      {/* Voicemail Script */}
                      {isExpanded && (
                        <div className="bg-accent/10 border border-accent/30 rounded-lg p-4 mb-4">
                          <div className="flex items-center gap-2 mb-2">
                            <MessageSquare className="w-4 h-4 text-accent" />
                            <div className="text-xs text-accent" style={{ fontFamily: 'var(--font-sans)', fontWeight: 600 }}>
                              Voicemail Script
                            </div>
                          </div>
                          <div className="text-sm whitespace-pre-wrap">{task.voicemailScript}</div>
                        </div>
                      )}

                      {/* Actions */}
                      {!isExpanded && (
                        <div className="flex gap-3">
                          <button
                            onClick={() => setSelectedTask(task.id)}
                            className="flex-1 px-4 py-2.5 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-all"
                          >
                            Complete Task
                          </button>
                          <button
                            onClick={() => setShowReschedule(task.id)}
                            className="px-4 py-2.5 border-2 border-border text-foreground rounded-lg hover:bg-muted transition-all flex items-center gap-2"
                          >
                            <Clock className="w-4 h-4" />
                            Reschedule
                          </button>
                        </div>
                      )}

                      {/* Reschedule Form */}
                      {isRescheduling && (
                        <div className="mt-4 p-4 bg-muted/30 rounded-lg border border-border">
                          <label className="block text-sm mb-2 text-muted-foreground">
                            New Date & Time
                          </label>
                          <div className="flex gap-3">
                            <input
                              type="datetime-local"
                              value={rescheduleDate}
                              onChange={(e) => setRescheduleDate(e.target.value)}
                              className="flex-1 px-4 py-2 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                            />
                            <button
                              onClick={() => handleReschedule(task.id)}
                              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-all"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => {
                                setShowReschedule(null);
                                setRescheduleDate('');
                              }}
                              className="px-4 py-2 border-2 border-border text-foreground rounded-lg hover:bg-muted transition-all"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Disposition Selection */}
                      {isExpanded && (
                        <div className="mt-4">
                          <div className="text-sm mb-3 text-muted-foreground">
                            Select Disposition
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            {dispositions.map((disposition) => (
                              <button
                                key={disposition}
                                onClick={() => handleComplete(task.id, disposition)}
                                className="px-4 py-3 border-2 border-border text-foreground rounded-lg hover:bg-accent hover:border-accent hover:text-accent-foreground transition-all text-left"
                              >
                                <div className="flex items-center gap-2">
                                  <CheckCircle2 className="w-4 h-4" />
                                  <span>{disposition}</span>
                                </div>
                              </button>
                            ))}
                          </div>
                          <button
                            onClick={() => setSelectedTask(null)}
                            className="w-full mt-3 px-4 py-2 border border-border text-muted-foreground rounded-lg hover:bg-muted transition-all text-sm"
                          >
                            Cancel
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
          </div>
        )}

        {/* Completed Tasks Section */}
        {completedTasks.length > 0 && (
          <div className="mt-8 max-w-5xl mx-auto">
            <h3 className="text-lg mb-4 text-muted-foreground" style={{ fontFamily: 'var(--font-sans)', fontWeight: 600 }}>
              Completed Today
            </h3>
            <div className="space-y-2">
              {completedTasks.slice(0, 5).map((task) => (
                <div
                  key={task.id}
                  className="bg-card border border-border rounded-lg p-4 opacity-60"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                      <div>
                        <div className="font-medium">{task.contactName}</div>
                        <div className="text-sm text-muted-foreground">
                          Day {task.dueDay} • {task.disposition}
                        </div>
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {formatDate(task.scheduledFor)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
