# LoanBud CRM — Phase 2 PRD
## Workflow, Segments & Task Experience

**Date:** 2026-05-10  
**Audience:** Product, Design, Engineering

---

## Primary User Persona

> The only users of LoanBud CRM are **loan officers and their managers** (internal LoanBud team). Contacts — brokers, lenders, referral partners — are the subjects being managed; they do not interact with the UI.

**Loan Officer** — works a daily pipeline of contacts; runs outreach sequences; makes and logs calls; completes tasks  
**Manager** — oversees a team of loan officers; configures workflows and segments; reviews analytics and team performance

---

## Phase 2 Goals

Phase 2 has three goals: confirm Phase 1 delivers what was intended, fill in the functional gaps left by the prototype (the board, analytics, notification intelligence, task triage), and polish the end-to-end loan officer experience so every flow can be completed without hitting a dead end.

---

## 1. Phase 1 Validation

> See separate file: **[phase1-validation.md](phase1-validation.md)**  
> Observed sessions with 3–5 loan officers and 1–2 managers. Task checklists cover: Workflow Builder, Workflow Board, Task Queue, Segments, and Template Configuration. Key questions to answer are documented there and inform the RBAC and segment filter confirmations below.

---

## 2. Role-Based Permissions

> **Requires confirmation after research sessions.** Proposed below based on typical CRM team structure.

### Proposed Roles

| Role | Description |
|------|-------------|
| **Admin** | Full access including configurations and user management |
| **Manager** | Create/edit/delete workflows and segments; view all team tasks; reassign; view all analytics |
| **Loan Officer** | Manage own contacts and tasks; enroll contacts; complete tasks; view own analytics only |
| **Read-Only** | View all data; no write access |

### Permission Matrix (Confirm Each Row)

| Action | Admin | Manager | Loan Officer | Read-Only | Confirm? |
|--------|-------|---------|--------------|-----------|---------|
| Create new workflow | ✓ | ✓ | — | — | ☐ |
| Edit an active workflow (has enrollments) | ✓ | Warn only | — | — | ☐ |
| Activate / deactivate a workflow | ✓ | ✓ | — | — | ☐ |
| Delete a workflow | ✓ | — | — | — | ☐ |
| Create a new segment | ✓ | ✓ | — | — | ☐ |
| Edit a segment used by an active workflow | ✓ | Warn only | — | — | ☐ |
| Delete a segment | ✓ | — | — | — | ☐ |
| Enroll a contact in a workflow | ✓ | ✓ | ✓ (own contacts) | — | ☐ |
| Pause / resume an enrollment | ✓ | ✓ | ✓ (own contacts) | — | ☐ |
| Skip / advance a step for a contact | ✓ | ✓ | ✓ (own contacts) | — | ☐ |
| Reassign a task to another officer | ✓ | ✓ | — | — | ☐ |
| Reassign a task to themselves | ✓ | ✓ | ✓ | — | ☐ |
| View another officer's task queue | ✓ | ✓ | — | ✓ | ☐ |
| View another officer's contact list | ✓ | ✓ | — | ✓ | ☐ |
| Create / edit email templates | ✓ | ✓ | — | — | ☐ |
| View workflow analytics | ✓ | ✓ | Own only | ✓ | ☐ |
| View team-level analytics | ✓ | ✓ | — | — | ☐ |
| Manage template categories | ✓ | ✓ | — | — | ☐ |

---

## 3. Workflow Management

### 3a. Workflow Board (Kanban)
**Problem:** Once a workflow is activated, there is no operational view. Loan officers cannot see who is in which step or identify who needs attention.

**User stories:**
- *As a loan officer,* I want to see all enrolled contacts on a board by step so I can prioritize who needs attention today
- *As a loan officer,* I want to manually advance a contact after an off-platform conversation without re-doing every intermediate step
- *As a manager,* I want to see which steps are causing contacts to pile up across all active workflows

**Feature:** Live kanban board — one column per workflow step (ordered by day offset), plus a "Completed" final column. Contact cards show: avatar initials, name, role badge, days-in-step counter, last action summary. Paused enrollments show an amber "Paused" banner.

Card interactions:
- Click → WorkflowContactPanel drawer (enrollment timeline, engagement metrics)
- Drag to adjacent column → advances enrollment to that step (`handleMoveToStep`)
- Context menu (⋯): Skip step, Pause enrollment, Move to step, View contact

Top bar: workflow selector, segment badge, status chip, enrolled count, completion rate, bounce rate.  
Filter bar: assignee picker (avatar chips), enrollment status (Active / Paused / Completed).

---

### 3b. Conditional Step Branching (If / Else Block)

#### When to Use Separate Workflows vs. Conditional Branching

These two tools solve different problems. The key rule: **use segments to control who enters a workflow; use branching to control what happens once they're already inside, based on what has changed.**

**Use separate segment-targeted workflows** when the entire journey differs between groups (e.g. Brokers get a 14-day onboarding, Partners get a 7-day welcome — sequences differ from step 1).

**Use an if/else block** when the same workflow needs to fork mid-sequence based on a **static contact property** (known at enrollment and not expected to change) or a **within-workflow event** (something that happened during execution):

#### Use Cases — Fixed Contact Properties at Enrollment

These fields are known when the contact enters the workflow and do not change. A branch based on them personalises the sequence without requiring separate workflows.

| Scenario | IF condition | IF (YES) path | ELSE (NO) path |
|----------|-------------|--------------|---------------|
| Brokers and Partners enter the same re-engagement flow, but the pitch differs at Day 14 | User Type `=` Broker | Send broker-specific "Grow your referral network" email | Send partner-specific "Exclusive listing opportunities" email |
| Some contacts only have an email address — no phone number on file | Has Phone `=` false | Skip call reminder, send a follow-up email instead | Proceed with the scheduled call reminder |
| Contact has opted out of SMS | Opted Out `=` true | Send email equivalent of the SMS; skip the SMS step | Send SMS as planned |
| High open-reminder contacts need a more direct tone at Day 7 | Open Reminders `>` 3 | Send a firmer "Let's connect this week" email with a calendar link | Send the standard nurturing email |
| New broker partners get an extra introduction step; experienced ones (more than 0 prior reminders) skip it | Open Reminders `=` 0 | Insert a "Welcome — here's how LoanBud works" email before Day 3 | Jump straight to Day 3 deal-focused email |

#### Use Cases — Within-Workflow Events

These conditions are only knowable after something has already happened inside the workflow execution.

| Scenario | IF condition | IF (YES) path | ELSE (NO) path |
|----------|-------------|--------------|---------------|
| Day 3 call was answered — contact is engaged. Day 3 call went to voicemail — needs a different follow-up | Last Call Outcome `=` Answered | Send "Next steps" email immediately; shorter delay before next step | Send a voicemail-drop follow-up SMS; retry the call in 2 days |
| Day 0 welcome email was opened — contact is interested. Email was not opened — needs re-engagement | Last Email Opened `=` true | Advance to Day 3 deal email (skip generic check-in) | Send a re-send of the Day 0 email with a revised subject line on Day 2 |
| Day 5 call marked "Not Interested" — no point continuing standard sequence | Last Call Outcome `=` Not Interested | Send a short "understood, here if you change your mind" closing email; end the flow | Continue the standard follow-up sequence |
| Contact replied to the Day 7 SMS — they are engaging via SMS, not calls | Last Call Outcome `=` No Answer | Pivot remaining steps to SMS-only; remove upcoming call reminders | Keep the mixed email + call cadence |
| Day 10 email open but no call answered yet — contact reads emails but avoids calls | Last Email Opened `=` true AND Last Call Outcome `=` No Answer | Replace remaining call steps with email + SMS only | Continue standard multi-channel cadence |

> **Important:** If the branching condition is a contact property that may *change over time independently* (e.g. listing status moving from "New" to "Submitted"), that scenario belongs in a **separate workflow** scoped to the new status — not a branch inside the current flow. Branching is not a substitute for proper segment and workflow configuration.

---

#### User Stories

- *As a workflow designer,* I want to add an if/else block at any point in the sequence so contacts get different steps based on a fixed contact property or something that happened earlier in this workflow
- *As a designer,* I want to configure each branch independently with its own emails, delays, and calls — the same step types available in the main flow
- *As a designer,* I want both branches to rejoin the main flow after the block ends, so I don't have to repeat common steps twice
- *As a designer,* I want clear visual separation between the IF path, the ELSE path, and the steps that come after both paths merge back together

---

#### Visual Design — If/Else Block in the Timeline

The current WorkflowBuilder renders steps as a vertical timeline of cards (left icon column + right card column). An if/else block inserts as a special step that splits the timeline visually into two parallel columns, then rejoins.

```
    ┌─────────────────────────────────┐
    │  [✉] Day 3 Email — Welcome      │   ← normal step card
    └────────────────┬────────────────┘
                     │
          ┌──────────▼──────────┐
          │  ◇  IF / ELSE       │         ← condition header card (diamond icon, amber border)
          │  listingStatus = Submitted │
          └──────┬────────┬─────┘
                 │        │
        ┌────────▼──┐  ┌──▼────────┐
        │ IF (YES)  │  │ ELSE (NO) │      ← branch column headers (green / gray)
        │ ─────────│  │──────────│
        │ [✉] Email │  │ [☎] Call  │      ← steps inside each branch
        │  Day 7   │  │  Day 7    │
        │           │  │           │
        │ [⏱] 3d   │  │ [⏱] 2d   │
        │  delay   │  │  delay    │
        └────────┬──┘  └──┬────────┘
                 └────┬───┘
                      │
    ┌─────────────────▼────────────────┐
    │  [✉] Day 14 Email — Check-in     │   ← steps after block (shared, both paths)
    └──────────────────────────────────┘
```

**Key layout rules:**
- If/else block always has exactly two branches: **IF (YES)** and **ELSE (NO)**
- Both branches merge back into the main flow after the block — there is no "exit only from one branch"
- If a branch is intentionally empty ("do nothing on this path"), it shows a dashed empty state card: `"No steps — contacts skip directly to the next section"`
- Blocks can be collapsed into a single summary card to reduce visual noise when not being edited
- Nesting limit: **one level deep only** — a branch cannot contain another if/else block (simplicity constraint for Phase 2)

---

#### Condition Card — Fields and Operators

The condition header card (diamond shape, amber `#F59E0B` left border) contains an inline form:

**Field selector** — dropdown of filterable properties. Fields are limited to those that are **fixed at enrollment time** or **generated by workflow execution** — not fields that change independently over time (those belong in separate workflows):

##### Group A — Fixed Contact Properties
Known at the moment of enrollment and stable throughout the workflow.

| Field label | Internal field | Value input | Operators |
|-------------|---------------|-------------|-----------|
| User Type | `userType` | Select: Broker / Lender / Partner | `=`, `!=` |
| Opted Out (any channel) | `optedOut` | None (boolean) | `is true`, `is false` |
| Has Phone Number | `hasPhone` | None (boolean — phone field is not empty) | `is true`, `is false` |
| Has Email Address | `hasEmail` | None (boolean — email field is not empty) | `is true`, `is false` |
| Open Reminders Count | `openReminders` | Number input | `=`, `>`, `<`, `>=`, `<=` |
| Days Since Contact Created | `daysSinceCreated` | Number input (days) | `>`, `<`, `>=`, `<=` |

##### Group B — Within-Workflow Events
Only knowable after something has happened during execution of this specific enrollment.

| Field label | Internal field | Value input | Operators | Dependency |
|-------------|---------------|-------------|-----------|-----------|
| Last Call Outcome | `lastCallOutcome` | Select: Answered / Voicemail Left / No Answer / Not Interested / Wrong Number | `=`, `!=` | Call logging wired to enrollment |
| Any Email Bounced | `emailBounced` | None (boolean) | `is true`, `is false` | Email delivery events |
| Last Email Delivery Status | `lastEmailStatus` | Select: Delivered / Opened / Bounced / Failed / Undelivered | `=`, `!=` | Email delivery events |
| Last Email Was Opened | `lastEmailOpened` | None (boolean) | `is true`, `is false` | Email open tracking |
| SMS Reply Received | `smsReplied` | None (boolean) | `is true`, `is false` | SMS reply webhook |
| Number of Calls Attempted | `callsAttempted` | Number input | `=`, `>`, `<`, `>=`, `<=` | Call logging |
| Number of Steps Completed | `stepsCompleted` | Number input | `=`, `>`, `<`, `>=`, `<=` | Enrollment step progress |

> **Not included:** `listingStatus` and other contact properties that change over time independently of the workflow. If the desired fork depends on a status change, configure a separate workflow targeting that status segment instead.
>
> **Confirm with product:** which fields are in scope for Phase 2. All Group B fields require the corresponding event tracking integration to be active.

**Operator selector** — rendered context-aware: only operators valid for the selected field's type are shown.

| Field type | Available operators | Value input shown? |
|-----------|-------------------|--------------------|
| Select (user type, outcome, delivery status) | `=` (is), `!=` (is not) | Yes — dropdown |
| Boolean (opted out, has phone, email opened, bounced, SMS replied) | `is true`, `is false` | No |
| Number (open reminders, days since created, calls attempted, steps completed) | `=`, `>`, `<`, `>=`, `<=` | Yes — number input |

**Condition summary (collapsed state):** renders as a readable phrase, e.g. `IF Last Call Outcome is "Voicemail Left"` or `IF Open Reminders > 3` — shown as a single line in the collapsed card header.

---

#### Branch Step Lists

Each branch (IF / ELSE) is an independent step list that supports the same step types as the main flow:

| Step type | Supported in branch? |
|-----------|-------------------|
| Email | ✓ |
| SMS | ✓ |
| Call reminder | ✓ |
| Voicemail reminder | ✓ |
| Delay | ✓ |
| Another if/else block | ✗ (Phase 2 nesting limit) |

Adding steps within a branch uses the same sidebar palette as the main flow. Steps within a branch are added with the "+" button below the last step in that branch column.

**Day offset within a branch:** Each branch resets its day count to the day offset of the if/else block itself. Example: if the if/else block is at Day 7, a 2-day delay inside the IF branch fires on Day 9, independent of the ELSE branch's timing.

**After the block:** Steps that come after the if/else block resume from the *maximum* day offset across both branches. Example: IF branch ends at Day 10, ELSE branch ends at Day 9 → post-block steps start at Day 10.

---

#### Adding an If/Else Block — Interaction Flow

1. In the right sidebar's "Add Step" palette, a new button: **`+ If / Else`** (diamond icon, amber color) appears below the existing step type buttons
2. Clicking it inserts the if/else block *after the currently selected step* (or at the end of the list if nothing is selected)
3. The block opens immediately in edit mode with the condition form focused
4. The designer selects field → operator → value, then clicks "Save condition"
5. Both branch columns appear empty with `"+ Add step"` prompts
6. The designer adds steps to each branch independently
7. To collapse the block: click the chevron on the condition header card

---

#### Editing and Deleting

- **Edit condition:** Click the condition header card → inline form re-opens → change field/operator/value → Save
- **Delete a step inside a branch:** Same ⋯ context menu as normal steps → "Delete step"
- **Delete the entire if/else block:** ⋯ menu on the condition header card → "Delete block" → confirmation dialog: *"This will delete the condition and all steps in both branches. Steps after this block will not be affected."*
- **Drag-drop within a branch:** Steps within a branch can be reordered by drag — uses same react-dnd pattern as the main timeline. Steps cannot be dragged *between* branches or between a branch and the main flow.

---

#### WorkflowBuilder UI Changes Required

The following changes are needed to `WorkflowBuilder.tsx` to support if/else blocks:

1. **Add `"conditional"` to `actionType`** in `WorkflowStep` — stores `conditionField`, `conditionOperator`, `conditionValue`, `ifBranch: WorkflowStep[]`, `elseBranch: WorkflowStep[]`
2. **New `IfElseBlock` component** — renders the two-column branch layout with the condition header; replaces the single `StepRow` for conditional steps
3. **Update `computeDayOffsets()`** in `workflowUtils.ts` — when it encounters a conditional step, recursively compute offsets for each branch separately; use the max of both branch end-offsets as the starting offset for the next step
4. **Update the sidebar "Add Step" palette** — add `+ If / Else` button below the existing step type buttons
5. **Update activation validation** — an if/else block with at least one branch containing an incomplete step (missing template, missing sender identity) should block activation and be listed in the tooltip
6. **Update preview mode** — show the if/else block as a forking timeline with both paths rendered side-by-side, clearly labeled IF and ELSE, with placeholder contact data to illustrate which path would be taken

---

### 3c. Workflow Builder Polish

**User stories:**
- *As a designer,* I want to see exactly what a contact will receive on each day before I activate the workflow
- *As a designer,* I want to be stopped from activating a workflow that has incomplete steps
- *As a designer,* I want to duplicate a working step rather than re-configuring it from scratch

**Features:**
- **Preview mode:** Renders full template content inline in a read-only day-by-day timeline
- **Activation validation:** "Activate" button disabled when any step is incomplete; tooltip lists the specific issues
- **Step duplication:** Context menu on any step → "Duplicate step" inserts a copy immediately after
- **Undo/redo:** Ctrl+Z / Ctrl+Y for last 10 changes within the builder session

---

### 3d. Workflow Inbox (Inbound Replies — Workflow-scoped)
**Problem:** When a contact replies to a workflow email, the reply goes to a personal inbox. Loan officers miss replies or respond inconsistently.

**Feature:** A workflow-scoped inbox surfacing only replies from contacts in active enrollments. Each thread shows: the original outbound workflow email, the contact's reply below it, and a workflow context bar (which step sent the original, current enrollment step, days enrolled). Actions within the thread: reply using sender identities, skip the contact's current step, pause enrollment. Unresolved reply count shown as badge on the Inbox nav item.

---

## 4. Segments

### 4a. Filter Conditions — Requires Confirmation After Research

> **Confirm the exact fields and operators with loan officers during the research sessions in Section 1. The list below is proposed — scope must be agreed before implementation.**

**Proposed contact fields:**

| Field | Type | Operators | Status |
|-------|------|-----------|--------|
| Listing Status | Select | `=`, `!=` | Exists (Phase 1) |
| User Type | Select | `=`, `!=` | Exists (Phase 1) |
| Opted Out | Boolean | `is true`, `is false` | Proposed |
| Has Active Enrollment | Boolean | `is true`, `is false` | Proposed |
| Enrolled in Workflow | Workflow picker | `=`, `!=` | Proposed |
| Open Reminders Count | Number | `>`, `<`, `>=`, `<=` | Proposed |
| Contact Created Date | Date | `before`, `after`, `within last N days` | Proposed |
| Email address | Text | `contains`, `does not contain` | Proposed |

**Proposed new operators (beyond Phase 1's `=` / `!=`):**

| Operator | Field types | Status |
|----------|------------|--------|
| `contains`, `does not contain` | Text | Proposed |
| `is empty`, `is not empty` | Optional fields | Proposed |
| `>`, `<`, `>=`, `<=` | Number | Proposed |
| `before`, `after`, `within last N days` | Date | Proposed |
| `is true`, `is false` | Boolean | Proposed |

---

### 4b. Live Contact Preview
**Problem:** The builder shows only a count. Loan officers save a segment and discover it captured the wrong contacts only after a workflow has already enrolled them.

**Feature:** Replace the count number in SegmentPreviewPanel with a live mini-table of matching contacts (name, role, listing status) that refreshes as filters change. Shows up to 5 rows with "View all N →" link. "0 contacts match" state includes a diagnostic hint.

---

### 4c. Segment Health Indicators
**Feature:** Each row in the UserSegments list shows a health chip: green (valid, contacts match), yellow (zero contacts match — possibly over-filtered), red (filter references an invalid field or value). Managers can audit the segment library and spot broken configurations before they affect active workflows.

---

### 4d. Dynamic vs. Static Segment
**Feature:** When saving, the designer chooses: **Dynamic** (membership updates as contact data changes) or **Static** (membership locked at save time). Static is essential for one-time sends where the list must not drift. Static segments show a "Snapshot" badge in the list.

---

## 5. Tasks

### 5a. Priority and Urgency Visibility
**Problem:** All tasks look identical in the queue. An overdue call for a near-close deal looks the same as a routine check-in.

**Feature:** Surface the existing `priority` field (low / normal / high / urgent) with color-coded visual treatment. Urgent tasks appear at top of the default sort with a red left border. Sort-by-priority available as a queue sort option.

---

### 5b. Inline Complete with Business Outcome
**Problem:** Completing a call today captures only a technical disposition ("Voicemail"). The workflow's next action (advance / retry / pause) should be informed by whether the deal is actually moving forward — not just whether someone picked up the phone.

**Feature:** Task completion captures two fields in sequence:
1. **Technical disposition** — "Answered", "Voicemail Left", "No Answer", "Wrong Number"
2. **Business outcome** — "Moving forward", "Needs more time", "Not interested", "Wrong contact"

Both captured inline in the completion flow. The business outcome maps to the step's OutcomeRule to determine what the workflow does next for this contact.

---

### 5c. Assignee Swimlane View
**Feature:** A toggle groups the task queue by assignee. Each swimlane shows the officer's name, task count, and overdue count. Managers use this for daily standups and to identify overloaded officers. Task reassignment from this view is Manager/Admin only (per RBAC in Section 2).

---

### 5d. Workflow Source Context
**Feature:** Task rows sourced from a workflow step show the workflow name and step name as a chip. Clicking the chip navigates to WorkflowBoard scrolled to that contact's card. Loan officers get full context — which email was sent, which step the contact is on — before dialing.

---

### 5e. Overdue Count Badge
**Feature:** The Tasks nav items (CRM sidebar and Email Workflows sidebar) display a red count badge showing the current user's overdue task count. Creates urgency without requiring the officer to open the queue to check.

---

## 6. Notifications (Workflow-focused)

### 6a. New Workflow-Specific Notification Types

| Type | Example message |
|------|----------------|
| Enrollment completed | "James Lee completed New Broker Onboarding" |
| Enrollment paused (bounce) | "Sarah Chen's enrollment paused — email bounced on Day 3" |
| Email step bounced | "Day 7 email to Mike Johnson bounced" |
| Full workflow batch completed | "New Broker Onboarding: all 3 enrollments completed" |
| Task overdue | "Call task for Emily Davis is 2 days overdue" |
| Inbound reply received | "Reply from James Lee — Day 7 of New Broker Onboarding" |
| Segment membership changed | "12 contacts added to 'Leads from first marketing'" |

### 6b. Notification Grouping
When multiple contacts trigger the same event simultaneously, group into one notification ("4 contacts completed New Broker Onboarding") that expands to list each individually. Prevents the panel from becoming noisy during high-volume workflow activity.

### 6c. Actionable Notifications
Each notification includes a contextual action button based on its type: "View on Board" (→ WorkflowBoard), "Reply" (→ Workflow Inbox), "View Contact" (→ ContactDetail), "View Task" (→ TaskQueue). Notifications are resolved when the action is taken, not just when read.

### 6d. Per-User Notification Preferences
A settings popover (gear icon in the notification panel header) lets each user toggle which notification types generate alerts. Reduces noise for high-volume teams.

---

## 7. Workflow Analytics

### 7a. Performance Dashboard
**Route:** `/email-workflows/analytics`

**KPI cards:** Total enrolled (all active workflows), overall completion rate, email open rate, bounce rate, avg days to complete, overdue task count.

**Workflow selector:** Filters all charts to a specific workflow or "All Workflows."

**Enrollment funnel chart:** Horizontal funnel — contact count at each step for the selected workflow. The step with the highest drop-off is visually highlighted. Hover shows absolute count and % drop-off from the previous step. This is the primary diagnostic tool.

**Engagement over time:** Line chart — daily sends, opens, bounces over last 30 days. Date range picker: 7d / 30d / 90d / custom.

**Per-step breakdown table:** One row per step — step name, day offset, action type, sent, delivered, opened, bounced, task completion rate, avg days at step. Clicking a row opens a drawer listing contacts currently at that step.

---

### 7b. Contact-Level Engagement (WorkflowContactPanel)
Extend the existing panel with: emails opened (count), calls answered (count), steps skipped (count), enrollment start date, days enrolled, estimated days to complete, and a mini-timeline of all step outcomes (e.g. ✓ Day 0 email opened, ✓ Day 3 call — voicemail, ⏭ Day 7 skipped).

---

## 8. Workflow Health Statistics

### Problem
Loan officers and managers currently have no way to know whether a workflow is performing well or silently failing. A workflow can be "active" and show enrolled contacts while quietly bouncing emails, accumulating overdue tasks, or stalling contacts at one step indefinitely. Health visibility needs to exist at three levels: the workflow list, the individual workflow, and the individual step.

---

### 8a. Workflow-Level Health Score

**Where it appears:** A `Health` column in the WorkflowList table, and a health chip in the WorkflowBoard top bar.

**Health is calculated from four signals:**

| Signal | Weight | Healthy threshold | Warning | Critical |
|--------|--------|------------------|---------|---------|
| Email bounce rate | High | < 5% | 5–10% | > 10% |
| Completion rate | High | > 40% | 20–40% | < 20% |
| Overdue task rate (overdue tasks / total tasks in workflow) | Medium | < 10% | 10–25% | > 25% |
| Step stall rate (contacts stuck at one step > 2× expected dwell time) | Medium | < 15% | 15–30% | > 30% |

**Health states displayed as a chip:**

| State | Colour | Meaning |
|-------|--------|---------|
| Healthy | Green | All four signals within healthy thresholds |
| Needs attention | Amber | One or more signals in warning range |
| Critical | Red | One or more signals in critical range |
| Insufficient data | Gray | Fewer than 5 enrollments — not enough signal to score |

Hovering the health chip shows a tooltip breakdown: which signals are contributing to the warning or critical state, e.g. *"Bounce rate 12% · 3 contacts stalled at Day 7 call step"*.

---

### 8b. Step-Level Health Indicators

**Where it appears:** In the WorkflowBoard column headers and in the per-step breakdown table in Analytics.

Each step column in the WorkflowBoard shows a small health indicator next to the step name:

| Indicator | Condition | Example |
|-----------|-----------|---------|
| 🟡 High dwell | Avg days at this step is > 1.5× the expected dwell time | Expected: 3 days, actual avg: 5.2 days |
| 🔴 High bounce | Email step bounce rate > 10% | 4 of 30 emails bounced |
| 🔴 Low open rate | Email step open rate < 15% | Only 3 opens out of 28 delivered |
| 🟡 Overdue tasks | > 20% of call/task steps at this step are overdue | 5 of 18 call tasks past due |
| 🔴 High skip rate | > 30% of contacts had this step manually skipped | Suggests the step is consistently irrelevant |
| ✅ Performing well | All metrics within healthy thresholds | — |

Clicking a step health indicator in the WorkflowBoard column header opens a diagnostic drawer showing: the step's metrics, a list of affected contacts, and a suggested action.

---

### 8c. Health Alert Notifications

**New notification type: `workflow_health_degraded`**

Fires automatically when a workflow crosses from Healthy → Needs Attention or Needs Attention → Critical. Sent to the workflow owner (creator) and any Manager or Admin.

**Notification message examples:**

| Trigger | Message |
|---------|---------|
| Bounce rate crosses 10% | *"New Broker Onboarding: email bounce rate is now 11%. Check sender identity or template content."* |
| Completion rate drops below 20% | *"Re-engagement Flow: only 18% of contacts are completing the sequence. Review step drop-off in Analytics."* |
| Step stall detected | *"Day 7 Call step in New Broker Onboarding has 6 contacts waiting > 9 days. Consider rescheduling or reassigning tasks."* |
| All overdue tasks exceed 25% | *"Lender Partner Nurture: 28% of call tasks are overdue. Assign or bulk-reschedule from the Task Queue."* |

Each health alert notification includes a direct action button linking to the relevant view (WorkflowBoard, Analytics step breakdown, or Task Queue filtered to the workflow).

---

### 8d. Suggested Remediation Actions

**Where it appears:** Health diagnostic drawer (from clicking a step health indicator) and as cards in the Analytics "Health" tab.

For each detected health issue, the system surfaces a specific, actionable suggestion:

| Issue detected | Suggested action displayed |
|---------------|--------------------------|
| High email bounce rate | *"Check if the sender identity's domain has SPF/DKIM records. Consider switching to the LoanBud brand sender for this step."* + button: "Edit step" |
| Low email open rate | *"Try a different subject line. Run an A/B test on this step to compare two subjects."* + button: "Add A/B variant" |
| High step dwell time | *"Contacts are spending too long here. Consider shortening the delay before this step or adding a task reminder."* + button: "Edit delay" |
| High manual skip rate | *"This step is frequently skipped. Consider removing it or making it conditional on a contact property."* + button: "Edit step" |
| High overdue task rate | *"Many tasks at this step are past due. Bulk-reschedule to clear the backlog or reassign to available officers."* + button: "Open Task Queue" |
| Low completion rate (workflow-level) | *"Most contacts are not reaching the final step. Check the funnel chart to identify the biggest drop-off point."* + button: "View funnel" |

Suggested actions are informational — they surface recommendations but require the user to take the action manually. No automated changes are made to the workflow.

---

### 8e. Health Summary on WorkflowList

**Where it appears:** WorkflowList table — a new `Health` column and a summary banner at the top of the page.

**Top-of-page summary banner** (only shown when at least one workflow is not Healthy):
> ⚠ **2 workflows need attention** — New Broker Onboarding (high bounce rate), Re-engagement Flow (low completion rate). [View details →]

**Per-row in WorkflowList:**
- Health chip (Healthy / Needs Attention / Critical / Insufficient data)
- If not Healthy: a "top issue" chip next to the health badge, e.g. `Bounce 12%` or `3 stalled`

**Sorting:** WorkflowList can be sorted by health status — Critical workflows surface to the top.

---

## 9. Template Categories — Requires Confirmation

> **Current state:** Three independent category lists exist — email categories, SMS categories, voicemail categories — each a separate string array. Templates are tagged with one category. The following questions need sign-off before Phase 2 work touches the template system.

**Confirm the following:**

| # | Question | Proposed default | Confirm? |
|---|----------|-----------------|---------|
| 1 | Are categories used only for library organization, or do they restrict which templates can be used in specific workflow steps? | Organization only | ☐ |
| 2 | Should the template picker in the workflow builder be filterable by category? | Yes — filterable but not restricted | ☐ |
| 3 | Are email, SMS, and voicemail categories independent lists, or shared? | Independent | ☐ |
| 4 | Can a template belong to more than one category? | No — single category per template | ☐ |
| 5 | What happens when a category is deleted? | Templates become "Uncategorized"; no cascade delete | ☐ |
| 6 | Who can manage (create/rename/delete) categories? | Manager + Admin | ☐ |
| 7 | Are there required default categories that cannot be deleted? | "General" (protected) | ☐ |

---

## Open Questions for Confirmation

| # | Question | Required by |
|---|----------|------------|
| 1 | All rows in the RBAC permission matrix (Section 2) | After user research |
| 2 | Which segment filter fields are in scope for Phase 2 (Section 4a) | After user research |
| 3 | Can conditional branch conditions use email engagement (opened / not opened)? Requires delivery event tracking integration. | Architecture review |
| 4 | All template category decisions (Section 8) | After user research |
| 5 | Are notifications in-app only, or should high-priority types (bounce, task overdue) also email the loan officer? | Product decision |

---

## Delivery Sequence

| Sprint | Focus |
|--------|-------|
| Pre-Sprint | Validation sessions — run checklists; confirm filters, RBAC, template categories |
| 1 | WorkflowBoard kanban + WorkflowContactPanel wiring |
| 2 | Workflow Inbox (inbound replies) + notification improvements |
| 3 | Segment builder: confirmed filters + live preview + health indicators + dynamic/static |
| 4 | Task queue: priority display, inline business outcome, swimlane view, source chip, overdue badge |
| 5 | Workflow Analytics dashboard + funnel chart + per-step breakdown |
| 6 | Conditional step branching in WorkflowBuilder |
| 7 | WorkflowBuilder polish (preview mode, validation, step duplication, undo/redo) |
| 8 | Contact-level engagement in WorkflowContactPanel + polish pass |
