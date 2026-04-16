import { useState } from 'react';
import { Plus, Save, Trash2, CheckSquare, Clock, Phone } from 'lucide-react';

interface TaskRule {
  id: string;
  name: string;
  trigger: string;
  taskType: string;
  daysAfter: number;
  objective: string;
  voicemailScript: string;
  active: boolean;
}

export function TaskRules() {
  const [rules, setRules] = useState<TaskRule[]>([
    {
      id: '1',
      name: 'Day 0 Follow-up Call',
      trigger: 'Email Sent',
      taskType: 'Call',
      daysAfter: 0,
      objective: 'Initial follow-up after email sent',
      voicemailScript: 'Hi {first_name}, this is [Agent Name] from LoanBud. I just sent you an email about {listing_name}. Give me a call back when you have a moment. Thanks!',
      active: true,
    },
    {
      id: '2',
      name: 'Day 3 Follow-up Call',
      trigger: 'Email Sent',
      taskType: 'Call',
      daysAfter: 3,
      objective: 'Day 3 follow-up check-in',
      voicemailScript: 'Hi {first_name}, following up on our previous conversation about {listing_name}. Please call me back at your earliest convenience.',
      active: true,
    },
    {
      id: '3',
      name: 'Day 7 Follow-up Call',
      trigger: 'Email Sent',
      taskType: 'Call',
      daysAfter: 7,
      objective: 'Week 1 check-in',
      voicemailScript: 'Hi {first_name}, just checking in on {listing_name}. Let me know if you have any questions.',
      active: true,
    },
  ]);

  const [showAddForm, setShowAddForm] = useState(false);
  const [newRule, setNewRule] = useState<Partial<TaskRule>>({
    trigger: 'Email Sent',
    taskType: 'Call',
    daysAfter: 0,
    active: true,
  });

  const handleSaveRule = () => {
    if (!newRule.name || !newRule.objective) {
      alert('Please fill in all required fields');
      return;
    }

    const rule: TaskRule = {
      id: `rule-${Date.now()}`,
      name: newRule.name!,
      trigger: newRule.trigger!,
      taskType: newRule.taskType!,
      daysAfter: newRule.daysAfter!,
      objective: newRule.objective!,
      voicemailScript: newRule.voicemailScript || '',
      active: newRule.active!,
    };

    setRules([...rules, rule]);
    setNewRule({
      trigger: 'Email Sent',
      taskType: 'Call',
      daysAfter: 0,
      active: true,
    });
    setShowAddForm(false);
  };

  const handleToggleRule = (id: string) => {
    setRules(rules.map(r => r.id === id ? { ...r, active: !r.active } : r));
  };

  const handleDeleteRule = (id: string) => {
    setRules(rules.filter(r => r.id !== id));
  };

  return (
    <div className="h-full flex flex-col bg-background">
      <div className="border-b border-border bg-card px-8 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl mb-2" style={{ fontFamily: 'var(--font-sans)', fontWeight: 600 }}>
              Task Rules & Triggers
            </h2>
            <p className="text-muted-foreground">
              Automatically create tasks when email workflows are triggered
            </p>
          </div>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-5 py-2.5 bg-accent text-accent-foreground rounded-lg hover:opacity-90 transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Rule
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-8">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Add Rule Form */}
          {showAddForm && (
            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="text-lg mb-4" style={{ fontFamily: 'var(--font-sans)', fontWeight: 600 }}>
                Create New Task Rule
              </h3>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm mb-2 text-muted-foreground">
                    Rule Name
                  </label>
                  <input
                    type="text"
                    value={newRule.name || ''}
                    onChange={(e) => setNewRule({ ...newRule, name: e.target.value })}
                    placeholder="e.g., Day 0 Follow-up Call"
                    className="w-full px-4 py-2 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>

                <div>
                  <label className="block text-sm mb-2 text-muted-foreground">
                    Trigger Event
                  </label>
                  <select
                    value={newRule.trigger}
                    onChange={(e) => setNewRule({ ...newRule, trigger: e.target.value })}
                    className="w-full px-4 py-2 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="Email Sent">Email Sent</option>
                    <option value="Email Opened">Email Opened</option>
                    <option value="Email Clicked">Email Clicked</option>
                    <option value="Segment Added">Added to Segment</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm mb-2 text-muted-foreground">
                    Task Type
                  </label>
                  <select
                    value={newRule.taskType}
                    onChange={(e) => setNewRule({ ...newRule, taskType: e.target.value })}
                    className="w-full px-4 py-2 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="Call">Call</option>
                    <option value="Email">Email</option>
                    <option value="Meeting">Meeting</option>
                    <option value="Follow-up">Follow-up</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm mb-2 text-muted-foreground">
                    Days After Trigger
                  </label>
                  <input
                    type="number"
                    value={newRule.daysAfter}
                    onChange={(e) => setNewRule({ ...newRule, daysAfter: parseInt(e.target.value) })}
                    min="0"
                    className="w-full px-4 py-2 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm mb-2 text-muted-foreground">
                  Task Objective
                </label>
                <input
                  type="text"
                  value={newRule.objective || ''}
                  onChange={(e) => setNewRule({ ...newRule, objective: e.target.value })}
                  placeholder="e.g., Initial follow-up after email sent"
                  className="w-full px-4 py-2 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm mb-2 text-muted-foreground">
                  Voicemail Script (Optional)
                </label>
                <textarea
                  value={newRule.voicemailScript || ''}
                  onChange={(e) => setNewRule({ ...newRule, voicemailScript: e.target.value })}
                  placeholder="Use {first_name} and {listing_name} for personalization"
                  rows={3}
                  className="w-full px-4 py-2 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleSaveRule}
                  className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-all flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  Save Rule
                </button>
                <button
                  onClick={() => setShowAddForm(false)}
                  className="px-6 py-2 border-2 border-border text-foreground rounded-lg hover:bg-muted transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Existing Rules */}
          <div className="space-y-4">
            {rules.map((rule) => (
              <div
                key={rule.id}
                className={`bg-card border rounded-lg p-6 transition-all ${
                  rule.active ? 'border-border' : 'border-border opacity-60'
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-lg ${rule.active ? 'bg-primary/10' : 'bg-muted'}`}>
                      {rule.taskType === 'Call' ? (
                        <Phone className={`w-6 h-6 ${rule.active ? 'text-primary' : 'text-muted-foreground'}`} />
                      ) : (
                        <CheckSquare className={`w-6 h-6 ${rule.active ? 'text-primary' : 'text-muted-foreground'}`} />
                      )}
                    </div>
                    <div>
                      <h3 className="text-lg mb-1" style={{ fontFamily: 'var(--font-sans)', fontWeight: 600 }}>
                        {rule.name}
                      </h3>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          <span>Day {rule.daysAfter}</span>
                        </div>
                        <span>•</span>
                        <span>Trigger: {rule.trigger}</span>
                        <span>•</span>
                        <span>Type: {rule.taskType}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={rule.active}
                        onChange={() => handleToggleRule(rule.id)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                    <button
                      onClick={() => handleDeleteRule(rule.id)}
                      className="p-2 text-destructive hover:bg-destructive/10 rounded-lg transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-muted/30 rounded-lg">
                    <div className="text-xs text-muted-foreground mb-1">Objective</div>
                    <div className="text-sm">{rule.objective}</div>
                  </div>
                  {rule.voicemailScript && (
                    <div className="p-3 bg-muted/30 rounded-lg">
                      <div className="text-xs text-muted-foreground mb-1">Voicemail Script</div>
                      <div className="text-sm">{rule.voicemailScript}</div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {rules.length === 0 && !showAddForm && (
            <div className="bg-card border border-border rounded-lg p-12 text-center">
              <CheckSquare className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-xl mb-2" style={{ fontFamily: 'var(--font-sans)', fontWeight: 600 }}>
                No Task Rules Yet
              </h3>
              <p className="text-muted-foreground mb-4">
                Create rules to automatically generate tasks when email workflows are triggered
              </p>
              <button
                onClick={() => setShowAddForm(true)}
                className="px-6 py-3 bg-accent text-accent-foreground rounded-lg hover:opacity-90 transition-all inline-flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Create First Rule
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
