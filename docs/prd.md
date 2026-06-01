# LoanBud CRM — Product Requirements

| Field | Details |
|-------|---------|
| **Document Title** | LoanBud CRM — Product Requirements |
| **Author** | @thuy.huynh |
| **Last Updated** | May 13, 2026 |
| **Status** | Active |

---

## Table of Contents

1. [Overview](#1-overview)
2. [Modules at a Glance](#2-modules-at-a-glance)
3. [Contacts](#3-contacts)
4. [Segments](#4-segments)
5. [Templates & Sender Identities](#5-templates--sender-identities)
6. [Workflows](#6-workflows)
7. [Tasks](#7-tasks)
8. [Notifications](#8-notifications)
9. [Role-Based Permissions](#9-role-based-permissions)

---

## 1. Overview

LoanBud CRM is a contact management and outreach automation platform for the LoanBud operations team. It tracks contacts — Brokers, Lenders, and Partners — as they move through the loan application pipeline, and enables the team to run structured communication workflows that reach the right people at the right time.

**Who uses it**

| Role | Primary responsibilities |
|------|--------------------------|
| **CRM Admin** | Builds and manages segments, templates, workflows, and sender identities |
| **Loan Officer** | Works the task queue, manages enrolled contacts, logs call outcomes |
| **Manager** | Oversees team workflows, views analytics, reassigns tasks |

**Two-phase delivery**

- **Phase 1 — Manual Foundation:** Full manual control. Admins build segments and activate workflows. Call and email tasks are created automatically when workflow steps fire. Agents log dispositions and outcomes. Every action is deliberate and human-initiated.
- **Phase 2 — Automation & Enhancements:** Adds conditional branching in workflows, advanced segment filtering, dynamic/static segment modes, engagement analytics, in-app notifications, a workflow inbox for inbound replies, and role-based access control.

---

## 2. Modules at a Glance

| Module | Phase 1 | Phase 2 additions |
|--------|---------|-------------------|
| **Contacts** | Contact list, contact detail, email history, global suppression | — |
| **Segments** | Filter-based contact groups with live preview | Advanced filter fields, exclude rules, dynamic vs. static mode |
| **Templates & Sender Identities** | Email, SMS, voicemail templates; sender identities; categories | — |
| **Workflows** | Multi-step sequence builder, workflow board (kanban + list), enrollment management, per-step analytics | Conditional branching (if/else steps), engagement over time chart, inbound reply visibility (badges + callouts) |
| **Tasks** | Call, email, SMS task queue; dispositions; outcome rules | — |
| **Notifications** | — | In-app alerts for workflow events, grouping, actionable buttons |
| **Role-Based Permissions** | — | Four roles with a full permission matrix |

---

## 3. Contacts

Contacts are the primary record in the CRM. Each contact is a person — Broker, Lender, or Partner — with a listing moving through the pipeline.

### 3.1 Contact List

The contact list provides pre-set filtered views as tabs:

| View | Shows |
|------|-------|
| All Contacts | Every contact |
| My Leads | Brokers only |
| Referral Partners | Partners only |
| Saved View | Lenders only |

Users can search across any view by name, email, or listing name.

### 3.2 Contact Detail

Clicking a contact opens a three-panel detail view.

**Left panel — Summary**
Contact name, user type badge, opted-out warning if applicable, quick-action buttons (Call, Email), and a contact info accordion (phone, email, listing name, listing status, created date).

**Centre panel — Activity and tasks**

- **Activity tab:** Chronological feed of all contact events — emails sent and received, SMS, calls logged, tasks completed, workflow enrollment changes. Inbound unread emails are highlighted and clickable to mark as read.
- **Tasks tab:** All tasks for this contact sorted by due date. Shows task type, workflow context, notes, and due date. Overdue tasks are visually flagged. Each task has actions: Complete, Reschedule, Delete.

**Right panel — Context**
Linked listing name and status badge, and an upcoming tasks list with due dates.

### 3.3 Email History

A dedicated page (`/email-workflows/history`) showing all outbound sends across all contacts:

- **KPI summary:** Total Sent, Delivered, Opened
- **Email list:** Grouped by day and subject. Each entry shows recipient (linked to contact), delivery status (Sent / Delivered / Opened), and timestamp.

### 3.4 Global Suppression

Opted-out and hard-bounced contacts are excluded from every workflow send automatically. Suppression is enforced at send time — no manual step required.

### 3.5 Requirements

- Pre-set view tabs are the primary navigation in the contact list
- Search filters by name, email, or listing name across the active view
- Activity entries are in reverse-chronological order with type, timestamp, and actor
- Email history shows direction (inbound / outbound), delivery status, and linked workflow step
- Opted-out contacts display a suppression badge and cannot be enrolled in workflows via the UI
- Hard-bounced contacts are automatically flagged and suppressed from future sends

---

## 4. Segments

A segment is a saved, named filter on the contact list. Segments define who receives a workflow's messages.

### 4.1 How Segments Work

The segment builder has two sections: **Include filters** and **Specific Contacts**.

**Include filters** use a filter-group editor:
- Each group contains one or more filter rules with AND / OR logic within the group
- Groups connect to each other with AND / OR logic
- Any group can be duplicated for fast rule reuse

**Specific Contacts** lets the user manually pin individual contacts to always include them, regardless of whether they match the filter rules.

### 4.2 Filter Fields

**Phase 1**

| Field | Operators | Values |
|-------|-----------|--------|
| Listing Status | `=`, `!=` | New / Draft / Submitted / On Hold / Declined |
| User Type | `=`, `!=` | Broker / Lender / Partner |

**Phase 2 additions**

| Field | Operators | Value input |
|-------|-----------|-------------|
| Opted Out | `is true`, `is false` | — |
| Has Active Enrollment | `is true`, `is false` | — |
| Enrolled in Workflow | `=`, `!=` | Workflow picker |
| Last Contacted | `before`, `after`, `within last N days` | Date / number |
| Brokerage Name | `=`, `!=`, `contains`, `not contains` | Text |

Phase 2 also adds extended operators to all applicable fields: `contains`, `not contains`, `before`, `after`, `within last N days`, `>`, `<`, `>=`, `<=`.

### 4.3 Exclude Section (Phase 2)

The segment builder gains a two-tab layout: **Include** and **Exclude**. Both tabs use the same filter-group editor. The final segment population is:

> **Final population** = (contacts matching include rules ∪ pinned includes) − (contacts matching exclude rules) − pinned excludes

Exclude rules and pinned excludes are shown in the read-only segment view with a red left border to distinguish them from include rules.

### 4.4 Dynamic vs. Static Mode (Phase 2)

When saving a segment, the creator chooses the membership mode:

| Mode | Behaviour |
|------|-----------|
| **Dynamic** | Membership updates automatically as contact data changes. Used for ongoing workflows targeting the current matching population. |
| **Static (Snapshot)** | Membership locked at save time. No contacts are added or removed after saving. Used for one-time sends where the list must not drift. |

Static segments display a **Snapshot** badge in the Segments list.

### 4.5 Preview Panel

As rules are built, a live preview panel shows:
- Estimated matching contact count and percentage of the total database
- A sample of the first 25 matching contacts with name, email, user type, and "Opted out" or "Pinned" badges
- In Phase 2: total included, total excluded, and net count when exclude rules are active

### 4.6 Segment Management

- Segments are named, saved, and reused across workflows
- The Segments list shows each segment's contact count, description, and last-updated date
- Segments can be edited or deleted; deleting one used by an active workflow shows a warning

### 4.7 Requirements

- At least one filter rule is required before saving a segment
- The preview refreshes immediately on every rule change — no save required
- Opted-out and bounced contacts are excluded from preview counts and from all workflow sends using this segment
- Manually pinned contacts appear separately from filter-matched contacts in the preview
- Duplicate segment names are not permitted
- A static segment can be converted to dynamic; a warning notes the snapshot will be discarded

---

## 5. Templates & Sender Identities

The Template Library holds all outbound communication content. Templates are written once and selected when configuring workflow steps.

### 5.1 Email Templates

Users create, edit, and delete email templates. Each template has a name, subject, body, category, and a sender type label (brand or loan-officer). The subject and body support `{{variable_name}}` placeholders resolved at send time. Variables are auto-detected from the template text and listed in a picker within the editor.

### 5.2 SMS Templates

Users create, edit, and delete SMS templates. Each has a name, message body, and category. The editor shows a live character count and an SMS segment calculator (number of SMS credits consumed). Variables use the same `{{variable_name}}` syntax.

### 5.3 Voicemail Scripts

Users create, edit, and delete voicemail scripts in two formats:
- **Script** — written text the agent reads aloud
- **Record** — a pre-recorded audio file (.mp3, .wav, .m4a) uploaded and previewed in the editor

Each script has a name, category, and estimated duration in seconds.

### 5.4 Voicemail Settings

A single system-wide configuration for the voicemail provider: outbound phone number, ringless voicemail toggle, and call recording toggle.

### 5.5 Template Categories

Email, SMS, and voicemail templates each have independent category lists. Categories can be created, renamed, and deleted. Deleting a category moves its templates to "Uncategorised" — no cascade delete. A default "General" category cannot be deleted.

### 5.6 Sender Identities

A sender identity defines who an outbound email appears to come from. Every email step in a workflow specifies a sender identity.

Each identity has a display name, email address, and a type: **brand** (a LoanBud account) or **loan-officer** (a specific LO's personal email). One identity is marked as the system default.

### 5.7 Requirements

- Variables are auto-detected from `{{...}}` syntax in any text field
- Categories are filterable in the template picker when configuring a workflow step
- Templates with the same name within the same type are not permitted
- Voicemail settings apply system-wide; only one configuration exists at a time
- Exactly one sender identity can be the default; setting a new one removes the flag from the previous
- A sender identity cannot be deleted if referenced by an active workflow step

---

## 6. Workflows

The workflow module lets admins build and run multi-step outreach sequences targeting a segment. It covers the builder (create and configure sequences), the board (monitor and manage active enrollments), and analytics (measure performance).

### 6.1 Workflow Builder

**Creating a workflow**

Workflow creation is a two-step wizard:
1. **Setup** — enter a name, description, and select a target segment
2. **Build** — configure the step sequence

**Step types — Phase 1**

| Type | What it does |
|------|-------------|
| **Email** | Sends an email using a selected template and sender identity |
| **SMS** | Sends an SMS using a selected template |
| **Call Reminder** | Creates a call task for the assigned agent |
| **Delay** | Pauses the sequence for a specified duration (e.g. "3d", "1d 4h") before the next step fires |

Steps are shown in a vertical timeline. Each step card can be expanded to configure its details. Day offsets are calculated automatically based on the delays in the sequence. Steps can be reordered by drag-and-drop; offsets recalculate after reorder.

**Workflow templates**

Two pre-built templates are available when starting a new workflow:
- **Active Sequence** — a 7-step, 14-day outreach: Day 0 email → Day 3 call → Day 7 SMS → Day 14 email, with delays between each
- **Calls Closed Sequence** — a 3-step closing sequence

Loading a template replaces the current step list.

**Step outcome rules**

When an agent completes a call or task step, they select a disposition. The system applies the configured outcome rule:

| Rule | What happens |
|------|-------------|
| `advance` | Move to the next step immediately |
| `advance-and-insert-followup` | Advance and insert an extra follow-up step after the current one |
| `retry` | Re-schedule the same step after a delay |
| `skip-remaining` | Skip all remaining steps in the current block |
| `pause-enrollment` | Pause the contact's enrollment; no further steps fire until manually resumed |

**Activation**

A workflow cannot be activated until a segment is assigned and all steps have a complete configuration. Incomplete steps are flagged inline with a warning icon. The activate button shows how many steps need attention.

---

### 6.2 Conditional Branching (Phase 2)

Conditional branching adds if/else decision points within a workflow. At a condition block, the workflow forks — contacts take the matching branch — and both branches rejoin the main sequence after the block.

**How it works**

A **Condition Block** is inserted as a step in the timeline. It contains:
- A condition header specifying the field, operator, and value to evaluate
- An **IF (YES)** branch — steps that fire when the condition is true
- An **ELSE (NO)** branch — steps that fire when the condition is false
- Both branches merge back into the shared main flow

If one branch is intentionally empty, contacts on that path continue to the next shared step with no action taken. Nesting is limited to one level deep.

**Condition fields**

| Field | Operators | Value input |
|-------|-----------|-------------|
| User Type | `=`, `!=` | Broker / Lender / Partner |
| Opted Out | `is true`, `is false` | — |
| Has Phone Number | `is true`, `is false` | — |
| Has Email Address | `is true`, `is false` | — |
| Open Reminders Count | `=`, `>`, `<`, `>=`, `<=` | Number |
| Last Call Outcome | `=`, `!=` | Answered / Left Voicemail / No Answer / Not Interested |
| Email Bounced | `is true`, `is false` | — |
| Last Email Delivery Status | `=`, `!=` | Delivered / Opened / Bounced / Failed |
| Last Email Opened | `is true`, `is false` | — |
| SMS Reply Received | `is true`, `is false` | — |
| Calls Attempted | `=`, `>`, `<`, `>=`, `<=` | Number |

The condition block renders as a forked section in the timeline with a diamond-icon header card. Collapsed view shows a one-line summary (e.g. `IF Last Call Outcome is "Left Voicemail"`). Day offsets after the block are calculated from the maximum day offset across both branches.

---

### 6.3 Workflow Board

The Workflow Board is the operational view for a single active workflow.

**Views**

The board offers two layouts toggled from the top bar:

- **Kanban view (default):** One column per workflow step, ordered by day offset, plus a Completed column. Contact cards sit in the column matching their current step. Cards show contact name, user type, due date, listing, and status badges. Paused enrollments show an amber **Paused** banner.
- **List view:** A flat table of all enrolled contacts with columns for contact, current step, enrollment status, and start date.

The top bar shows: workflow name, segment name, status chip (active / paused / draft), and enrolled / active / paused / completed counts with completion percentage.

**Contact actions**

From any contact card or row:
- **Click** → opens the Workflow Contact Panel
- **Skip Step** → marks the current step as skipped and advances to the next
- **Pause / Resume Enrollment** → suspends or reactivates a contact's progress
- **Drag to a column** (kanban) → advances the contact to that step

**Upcoming Automations (bulk actions)**

A modal groups all pending email and SMS steps across enrolled contacts by scheduled date (Overdue / Today / Tomorrow / upcoming dates). Agents can select multiple contacts and apply:
- **Skip Selected** — skip the pending step for all selected
- **Pause Selected** — pause enrollment for all selected

**Statistics tab**

Each workflow board has a Statistics tab showing enrollment funnel and per-step data scoped to that specific workflow (same data as the Analytics dashboard).

---

### 6.4 Workflow Contact Panel

Opening a contact card launches a full-screen panel with two tabs.

**Step Progress tab**

Complete timeline of all workflow steps for the contact. Each step shows its status: Current, Done, Skipped, Pending, or Upcoming.

In edit mode, agents can:
- Skip or unskip individual steps (with confirmation)
- Customise the delay timing for any delay step (days / hours / minutes via +/− controls)
- Add a one-off custom step at any point in the sequence (visible only on this contact's timeline)
- Remove a previously added custom step
- Jump the contact to any step via a "Move to Step" dropdown — marks all prior steps as done and the remaining ones as pending
- Select multiple pending steps and bulk-skip them

**Activity Log tab**

Chronological table of every event on this enrollment: email sent, SMS sent, task completed, step skipped/unskipped, enrollment paused/resumed, custom step added/removed, contact moved to step.

The right sidebar shows the contact's name (linked to their detail page), user type, listing name and status, enrollment start date and status badge, unread email count (linked to contact timeline), and a Pause / Resume toggle.

---

### 6.5 Workflow Analytics

**Phase 1 — Funnel & step breakdown**

Available at `/email-workflows/analytics` and on each workflow board's Statistics tab.

- **KPI cards:** Total Enrolled, Completed (count), Completion Rate (%), Active count
- **Enrollment funnel chart:** Horizontal bar chart per step — teal = contacts who completed the step, amber = contacts currently at the step. The highest drop-off step is highlighted.
- **Per-step breakdown table:** Step name, type, day offset, count at step, count completed

**Phase 2 — Engagement over time**

A line chart showing daily sends, opens, and bounces over a selectable period (7d / 30d / 90d / custom). Requires delivery and engagement event tracking.

---

### 6.6 Inbound Reply Visibility (Phase 2)

Inbound replies from enrolled contacts are surfaced in context throughout the workflow module — no separate inbox view.

**Workflow List:** An unread replies column (V2) shows the total count of unread inbound emails from enrolled contacts per workflow row.

**Workflow Board contact cards:** Each card shows an unread reply badge when the contact has unread inbound emails.

**Workflow Contact Panel:** When a contact has unread replies, a callout appears in the right sidebar showing the count and linking directly to that contact's activity timeline where the full email thread can be read and replied to.

**Requirements**

- The unread reply count on a workflow list row aggregates all unread inbound emails from contacts enrolled in that workflow
- The badge on a contact card reflects unread inbound emails for that specific contact
- Marking an email as read on the contact's activity timeline clears the badge and updates the workflow list count
- Inbound replies are read and responded to from the contact's activity timeline, not from a separate inbox

---

### 6.7 Workflow Requirements

- Workflow status (draft / active / paused), enrolled count, and activation date are shown in the workflow list
- Editing an active workflow shows a warning before saving
- A workflow cannot be activated without a segment and complete step configuration
- Custom steps added in the Contact Panel appear only on that contact's timeline — they do not modify the workflow for other enrollees
- Paused enrollments cannot be advanced until resumed
- Moving a contact to an earlier step marks the intermediate steps as pending (not done)
- Incomplete steps inside a condition block count toward the activation validation

---

## 7. Tasks

Tasks are the atomic unit of agent work. They are created automatically when a workflow step fires, or manually by any agent. The task module covers the queue, the dialer, and the outcome capture flow that links a completed call back to the workflow enrollment.

### 7.1 Task Types

Four task types are active in Phase 1. Additional types (Document, Meeting, Note, Review, Approval, Custom) are pre-defined in the system registry for future phases.

| Type | How it starts | Primary action | Dispositions |
|------|--------------|----------------|-------------|
| **Call** | `call-reminder` workflow step, or manual | Opens the dialer | Answered · Left Voicemail · Drop Voicemail · No Answer |
| **Voicemail** | `voicemail-reminder` workflow step, or manual | Opens the dialer | Voicemail Dropped · Answered Instead · Not Needed |
| **Email** | `email` workflow step, or manual | Opens the email composer | Sent · Replied · Bounced · Not Needed |
| **SMS** | `sms` workflow step, or manual | Opens the SMS composer | Sent · Replied · Failed · Not Needed |

Each task carries the call objective and voicemail script from the workflow step that created it. These are surfaced in the task detail and inside the dialer panel as agent reference.

---

### 7.2 The Dialer

The dialer is a floating panel launched from a Call or Voicemail task. It pre-fills the contact's phone number, call objective, and voicemail script from the task. The agent places the call, and when the call ends the dialer moves to an **outcome-pending** state where the agent selects a disposition (Answered / Left Voicemail / Drop Voicemail / No Answer), optionally drops a voicemail script, adds a note, and clicks Save. The disposition is written to the linked task and the configured outcome rule fires against the workflow enrollment in the same operation.

If the agent already handled the call off-platform, they can skip placing the call and go straight to outcome capture via "Skip call — log outcome manually."

The dialer can also be opened in free-dial mode from the sidebar (no linked task). In this mode the agent dials any number manually and no outcome rules fire.

---

### 7.3 Outcome Capture for Non-Call Tasks

Email, SMS, and Voicemail tasks do not use the dialer. Their outcomes are captured through the **Outcome Capture Panel**, which appears inside the Task Detail panel when the agent marks the task done.

The panel is driven by the task type registry. Disposition options, their labels, and colour coding are all pulled from the registry at render time:

| Disposition category | Chip colour |
|----------------------|-------------|
| Positive (Answered, Sent, Approved, Completed) | Green |
| Partial / voicemail (Left Voicemail, Voicemail Dropped, Partial) | Amber |
| Negative (No Answer, Bounced, Failed, Denied) | Red |
| No action (Not Needed, Cancelled, Deferred) | Grey |

An optional note field is shown for task types that support it (Call, Email).

---

### 7.4 Outcome Rules

When any task is completed, the system looks up the outcome rule configured for the selected disposition on that workflow step. The rule fires immediately:

| Rule | What happens |
|------|-------------|
| `advance` | Move the contact to the next workflow step |
| `advance-and-insert-followup` | Advance and insert an extra follow-up step after the current one |
| `retry` | Re-schedule the same step after a delay |
| `skip-remaining` | Skip all remaining steps in the current block |
| `pause-enrollment` | Pause the enrollment; no further steps fire until manually resumed |

Default outcome rules per task type (applied when no custom rule is set on the step):
- **Call:** all four dispositions → `advance`
- **Voicemail:** Voicemail Dropped / Answered Instead → `advance`; Not Needed → `skip-remaining`

Manual tasks (not linked to a workflow step) complete without triggering any outcome rule.

---

### 7.5 Task Queue

The Task Queue surfaces all pending tasks for the agent across all contacts and workflows.

**Queue views**

| View | Filter |
|------|--------|
| Today | Due today |
| This Week | Due within the current week |
| Overdue | Past due, not completed |
| All | Every pending task |

A toggle shows or hides completed tasks in any view. Tasks can be sorted by due date, contact name, or source.

**Task detail panel**

Clicking a task opens a side panel showing: contact name and user type, task type badge, due date, call objective, voicemail script, workflow step context, and outcome history. The agent can complete, reschedule, or delete the task from this panel. For Call and Voicemail tasks, the primary action button opens the dialer in task-bound mode directly from the panel.

**Bulk actions**

Select multiple tasks to apply: **Complete**, **Reschedule** (pick a new date), or **Delete** (with confirmation).

---

### 7.6 Requirements

- A task is created automatically for every `call-reminder` or `voicemail-reminder` workflow step that fires; the task inherits the step's objective text and voicemail script
- The dialer pre-fills the phone number, contact name, objective, and voicemail script from the linked task when opened in task-bound mode
- When the dialer saves a disposition, the linked task is marked complete and the outcome rule fires in the same operation
- Suspended tasks (from paused enrollments) are hidden from the queue; they reappear when the enrollment resumes
- A task can be completed from the queue, the Task Detail panel, or the Contact Detail panel — all produce the same result
- Overdue tasks display a red overdue indicator
- The task queue is accessible both as a standalone page and within the Workflows section (scoped to workflow-related tasks only)

---

## 8. Notifications

*Phase 2*

In-app notifications alert agents and admins to workflow events that need attention.

### 8.1 Notification Types

| Type | Example message |
|------|----------------|
| Enrollment completed | "James Lee completed New Broker Onboarding" |
| Enrollment paused — bounce | "Sarah Chen's enrollment paused — email bounced on Day 3" |
| Email step bounced | "Day 7 email to Mike Johnson bounced" |
| All enrollments completed | "New Broker Onboarding: all 3 enrollments completed" |
| Task overdue | "Call task for Emily Davis is 2 days overdue" |
| Inbound reply received | "Reply from James Lee — Day 7 of New Broker Onboarding" |
| Segment membership changed | "12 contacts added to 'Leads from first marketing'" |

### 8.2 Grouping

When multiple contacts trigger the same event simultaneously, they are grouped into one notification (e.g. *"4 contacts completed New Broker Onboarding"*) that expands to list each individually.

### 8.3 Actionable Buttons

Each notification includes a contextual action:

| Notification type | Action |
|------------------|--------|
| Enrollment completed / paused | View on Board |
| Inbound reply | Reply (opens Workflow Inbox thread) |
| Task overdue | View Task |
| Bounce | View Contact |
| Segment membership changed | View Segment |

Notifications are marked **resolved** when the linked action is taken, not just when read.

### 8.4 Requirements

- Unread notifications show a count badge in the navigation
- "Mark all as read" clears the unread state for all notifications
- Resolved notifications move to a separate Resolved tab in the notifications panel
- Each user can toggle which notification types generate in-app alerts via a preferences panel

---

## 9. Role-Based Permissions

*Phase 2*

Four roles control what each user can see and do in the CRM.

### 9.1 Roles

| Role | Description |
|------|-------------|
| **Super Admin** | Full access including system configuration and user management |
| **Manager** | Create/edit/delete workflows and segments; view all team tasks; reassign; view all analytics |
| **Loan Officer** | Manage own contacts and tasks; enroll contacts; complete tasks; view own analytics only |
| **Read-Only** | View all data; no write access |

### 9.2 Permission Matrix

| Action | Super Admin | Manager | Loan Officer | Read-Only |
|--------|:-----------:|:-------:|:------------:|:---------:|
| Create new workflow | ✓ | ✓ | — | — |
| Edit active workflow (has enrollments) | ✓ | Warn | — | — |
| Activate / deactivate a workflow | ✓ | ✓ | — | — |
| Delete a workflow | ✓ | — | — | — |
| Create a new segment | ✓ | ✓ | — | — |
| Edit a segment used by an active workflow | ✓ | Warn | — | — |
| Delete a segment | ✓ | — | — | — |
| Enroll a contact in a workflow | ✓ | ✓ | Own contacts | — |
| Pause / resume an enrollment | ✓ | ✓ | Own contacts | — |
| Skip / advance a step for a contact | ✓ | ✓ | Own contacts | — |
| Reassign a task to another officer | ✓ | ✓ | — | — |
| Reassign a task to themselves | ✓ | ✓ | ✓ | — |
| View another officer's task queue | ✓ | ✓ | — | ✓ |
| View another officer's contact list | ✓ | ✓ | — | ✓ |
| Create / edit templates | ✓ | ✓ | — | — |
| Manage template categories | ✓ | ✓ | — | — |
| Manage sender identities | ✓ | — | — | — |
| View workflow analytics (own) | ✓ | ✓ | ✓ | ✓ |
| View team-level analytics | ✓ | ✓ | — | ✓ |

> **Warn** — the action is permitted but a confirmation dialog is shown before proceeding.

### 9.3 Requirements

- Role is assigned at the user level; one role per user
- A Loan Officer only sees contacts assigned to them in the contact list
- A Manager cannot delete a workflow or segment — delete is Super Admin only
- Read-Only users see all data; all write actions are hidden or disabled
- Attempting an unauthorised action via direct URL navigation redirects to a permission-denied screen
