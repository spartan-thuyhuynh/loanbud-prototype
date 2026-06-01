# Phase 2 — Validate User Flows & Enhancements

| Field | Details |
|-------|---------|
| **Document Title** | Phase 2 — Validate User Flows & Enhancements |
| **Author** | @thuy.huynh |
| **Last Updated** | May 12, 2026 |
| **Status** | Draft |

---

## Table of Contents

1. [Phase 1 Validation](#1-phase-1-validation)
2. [Phase 2 Goals](#2-phase-2-goals)
3. [Role-Based Permissions](#3-role-based-permissions)
4. [Workflow Management](#4-workflow-management)
   - [4a. Conditional Step Branching](#4a-conditional-step-branching)
   - [4b. Workflow Builder Enhancements](#4b-workflow-builder-enhancements)
   - [4c. Workflow Board](#4c-workflow-board)
   - [4d. Workflow Inbox](#4d-workflow-inbox-inbound-replies--workflow-scoped)
5. [Segments](#5-segments)
   - [5a. Filter Conditions — Requires Confirmation](#5a-filter-conditions--requires-confirmation)
   - [5b. Dynamic vs. Static Segment](#5b-dynamic-vs-static-segment)
   - [5c. Exclude Contacts from Segment](#5c-exclude-contacts-from-segment)
6. [Notifications](#6-notifications-workflow-focused)
7. [Workflow Analytics](#7-workflow-analytics)
8. [Template Categories — Requires Confirmation](#8-template-categories--requires-confirmation)
9. [Open Questions for Confirmation](#9-open-questions-for-confirmation)

---

## 1. Phase 1 Validation

Conduct observed sessions with 3–5 loan officers and 1–2 managers using the Phase 1 prototype. Task checklists cover: Workflow Builder, Workflow Board, Task Queue, Segments, and Template Configuration. Key questions to answer are documented.

> See attached file: **[Draft] Validation Phase 1: Key Questions and Checklists** → [`phase1-validation.md`](phase1-validation.md)

---

## 2. Phase 2 Goals

- Confirm Phase 1 delivers what was intended
- Fill in the functional gaps left by the Phase 1 implementation (analytics, notifications, etc.)
- Polish the end-to-end user experience by iterating on feedback from validation sessions

---

## 3. Role-Based Permissions

> **Requires confirmation.** Proposed below based on typical CRM team structure.

### Proposed Roles

| Role | Description |
|------|-------------|
| **Super Admin** | Full access including configurations and user management |
| **Manager** *(confirm title)* | Create/edit/delete workflows and segments; view all team tasks; reassign; view all analytics |
| **Loan Officer** | Manage own contacts and tasks; enroll contacts; complete tasks; view own analytics only |
| **Read-Only** | View all data; no write access |

### Permission Matrix *(Confirm Each Row)*

| Action | Super Admin | Manager | Loan Officer | Read-Only | Confirm? |
|--------|-------------|---------|--------------|-----------|---------|
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

## 4. Workflow Management

### 4a. Conditional Step Branching

> **Requires use case confirmation before implementation.**

Introduce a new **Condition Block** component in the workflow builder that allows the creator to split the workflow sequence based on conditions evaluated at runtime.

#### When to Use Separate Workflows vs. Conditional Branching

These two tools solve different problems. The key rule: **use segments to control who enters a workflow; use branching to control what happens once they're already inside, based on what has changed.**

**Use separate segment-targeted workflows** when the entire journey differs between groups (e.g. Brokers get a 14-day onboarding, Partners get a 7-day welcome — sequences differ from step 1).

**Use an if/else block** when the same workflow needs to fork mid-sequence based on a within-workflow event or a static contact property known at enrollment:

| Scenario | Why branching fits |
|----------|-------------------|
| Day 3 call outcome = "Answered" → send deal email; outcome = "Voicemail" → retry call in 2 days | The branch condition is based on what happened *inside the workflow*, not data that existed at enrollment |
| Re-engagement flow: 13 identical days for all contacts, then Day 14 message differs by user type | One branch point avoids maintaining two near-duplicate workflows |
| Contact has no phone number on file → skip call step, send follow-up email instead | Fixed property known at enrollment; avoids creating a separate "email-only" workflow |
| Contact opted out of SMS mid-flow → route remaining steps to email only | Opt-out status checked at runtime — contacts opted-in at enrollment may have changed |
| Day 0 welcome email was opened → advance to deal content on Day 3; email not opened → re-send with revised subject on Day 2 | Engagement state only exists after the step fires — not knowable at enrollment |
| Day 5 call marked "Not Interested" → send closing email and end the flow; otherwise continue sequence | Post-call outcome drives fundamentally different paths from that point forward |
| High open-reminders contacts (> 3) need a firmer tone at Day 7 | Fixed numeric property at enrollment; same workflow, different message at one step |

> **Not in scope for branching:** Contact properties that change independently over time (e.g. listing status moving from "New" to "Submitted"). That scenario belongs in a separate workflow scoped to the updated segment — branching is not a substitute for proper segment and workflow configuration.

---

#### User Stories

- *As a workflow creator,* I want to add an if/else block at any point in the sequence so contacts get different steps based on their contact data or what happened earlier in the workflow
- *As a workflow creator,* I want both branches to rejoin the main flow after the block ends, so I don't have to repeat common steps twice
- *As a workflow creator,* I want to be able to leave one branch empty ("do nothing on this path") so contacts on that path simply continue to the next step

---

#### Visual Design — If/Else Block in the Timeline

The current WorkflowBuilder renders steps as a vertical timeline of cards (left icon column + right card column). An if/else block inserts as a special step that splits the timeline visually into two parallel columns, then rejoins.

```
    ┌─────────────────────────────────┐
    │  [✉] Day 3 Email — Welcome      │   ← normal step card
    └────────────────┬────────────────┘
                     │
          ┌──────────▼──────────┐
          │  ◇  IF / ELSE       │         ← condition header (diamond icon, amber border)
          │  Last Call Outcome = Answered │
          └──────┬────────┬─────┘
                 │        │
        ┌────────▼──┐  ┌──▼────────┐
        │  IF (YES) │  │  ELSE     │      ← branch column headers
        │───────────│  │───────────│
        │ [✉] Email │  │ [☎] Call  │      ← steps inside each branch
        │   Day 5   │  │   Day 5   │
        │           │  │           │
        │ [⏱] 2d   │  │ [⏱] 3d   │
        │  delay    │  │  delay    │
        └────────┬──┘  └──┬────────┘
                 └────┬───┘
                      │
    ┌─────────────────▼────────────────┐
    │  [✉] Day 14 Email — Check-in     │   ← steps after block (shared by both paths)
    └──────────────────────────────────┘
```

**Key layout rules:**
- Both branches always merge back into the main flow after the block — there is no "exit only from one branch"
- If a branch is intentionally empty, it shows a dashed placeholder: *"No steps — contacts on this path continue to the next section"*
- Blocks can be collapsed into a single summary card to reduce visual noise when not being edited
- **Nesting limit: one level deep only** — a branch cannot contain another if/else block (Phase 2 constraint)

---

#### Condition Card — Fields and Operators

The condition header card (diamond shape, amber left border) contains an inline condition form.

**Field selector** — dropdown of filterable properties. The list below are examples; confirm final scope with product before implementation:

| Field label | Internal field | Value input type |
|-------------|---------------|-----------------|
| User Type | `userType` | Select: Broker / Lender / Partner |
| Opted Out | `optedOut` | None (boolean) |
| Has Phone Number | `hasPhone` | None (boolean) |
| Has Email Address | `hasEmail` | None (boolean) |
| Open Reminders Count | `openReminders` | Number input |
| Last Call Outcome | `lastCallOutcome` | Select: Answered / Voicemail Left / No Answer / Not Interested / Wrong Number |
| Any Email Bounced | `emailBounced` | None (boolean) |
| Last Email Delivery Status | `lastEmailStatus` | Select: Delivered / Opened / Bounced / Failed |
| Last Email Was Opened | `lastEmailOpened` | None (boolean) |
| SMS Reply Received | `smsReplied` | None (boolean) |
| Number of Calls Attempted | `callsAttempted` | Number input |

> **Confirm with product:** which fields are in scope for Phase 2. Within-workflow event fields (last call outcome, last email delivery status, SMS reply, etc.) require delivery and call event tracking to be wired up.

**Operator selector** — context-aware; only operators valid for the selected field type are shown:

| Field type | Available operators | Value input shown? |
|-----------|-------------------|--------------------|
| Select (user type, outcome, delivery status) | `=` (is), `!=` (is not) | Yes — dropdown |
| Boolean (opted out, has phone, email opened, bounced, SMS replied) | `is true`, `is false` | No |
| Number (open reminders, calls attempted) | `=`, `>`, `<`, `>=`, `<=` | Yes — number input |

**Condition summary (collapsed):** renders as a readable phrase, e.g. `IF Last Call Outcome is "Voicemail Left"` or `IF Open Reminders > 3`.

---

#### WorkflowBuilder UI Changes Required

The following changes are needed to `WorkflowBuilder.tsx` to support condition blocks:

1. **New `ConditionBlock` component** — renders the two-column branch layout with the condition header card; replaces the single `StepRow` for conditional steps
2. **Update sidebar "Add Step" palette** — add a `Condition` button (diamond icon, amber colour) below the existing step type buttons
3. **Update activation validation** — a condition block with at least one branch containing an incomplete step (missing template, missing sender identity) should block activation and be listed in the validation tooltip
4. **Update preview mode** — show the condition block as a forking timeline with both paths rendered side-by-side, clearly labelled IF and ELSE, with placeholder contact data illustrating which path would be taken
5. **Update `computeDayOffsets()`** in `workflowUtils.ts` — when encountering a conditional step, compute offsets for each branch separately; the post-block steps resume from the maximum day offset across both branches

---

### 4b. Workflow Builder Enhancements

**User stories:**
- *As a workflow creator,* I want to create a workflow template that is not yet assigned to any segment, so I can build the sequence first and assign contacts later
- *As a workflow creator,* I want to duplicate a working step rather than reconfigure it from scratch
- *As a workflow creator,* I want to duplicate an entire workflow to use as the starting point for a new sequence

**Features:**

- **Segment not required on creation:** Remove the segment requirement from the workflow creation form. Segment assignment becomes optional at save time. A workflow with no segment assigned cannot be activated — the Activate button shows a tooltip: *"Assign a segment before activating."*
- **Activation validation:** Display warnings inline on incomplete steps (missing template, missing sender identity) and prevent saving or activating the workflow until all steps are complete. Show a count indicator on the Activate button: *"3 steps need attention."*
- **Step duplication:** Context menu (⋯) on any step → *"Duplicate step"* — inserts a copy immediately after the original
- **Workflow duplication:** From the WorkflowList row context menu → *"Duplicate workflow"* — creates a copy of the workflow in Draft status with the same steps but no segment assigned and no enrollments; prompts the creator to assign a segment before activating

---

### 4c. Workflow Board

**Problem:** Once a workflow is activated, there is no operational view. Loan officers cannot see who is in which step or identify who needs immediate attention without opening individual contacts.

**User stories:**
- *As a loan officer,* I want to see all enrolled contacts on a board organised by step so I can prioritise who needs attention today
- *As a loan officer,* I want to manually advance a contact after an off-platform conversation without re-doing every intermediate step
- *As a manager,* I want to see which steps are causing contacts to stall across active workflows

**Feature:** Live kanban board — one column per workflow step (ordered by day offset), plus a *Completed* final column. Contact cards show: avatar initials, name, role badge, days-in-step counter, last action summary. Paused enrollments show an amber *Paused* banner.

**Card interactions:**
- Click → opens `WorkflowContactPanel` drawer with full enrollment timeline and engagement summary
- Drag to the next column → advances enrollment to that step (`handleMoveToStep`)
- Context menu (⋯): Skip step, Pause enrollment, Move to step, View contact

**Top bar:** workflow selector dropdown, segment badge, status chip (active/paused/draft), enrolled count.  
**Filter bar:** assignee picker (avatar chips), enrollment status filter (Active / Paused / Completed).

---

### 4d. Workflow Inbox (Inbound Replies — Workflow-scoped)

**Problem:** When a contact replies to a workflow email, the reply goes to a personal inbox. Loan officers miss replies or respond inconsistently, breaking the continuity of the sequence.

**Feature:** Add workflow-related context to the communication record on the contact's activity timeline. Each inbound reply from a contact enrolled in an active workflow displays:
- Which workflow and which step triggered the outbound message the contact replied to
- Current enrollment step and days enrolled
- Quick actions from within the reply thread: reply using sender identities, open the linked workflow board for that contact

Reply threads visible in the workflow-scoped inbox surface only messages from contacts with active enrollments, keeping the view focused on workflow-driven conversations.

---

## 5. Segments

### 5a. Filter Conditions — Requires Confirmation

> **Confirm the exact filter fields needed with loan officers during validation sessions. The list below is proposed — scope must be agreed before implementation.**

**Proposed contact fields:**

| Field | Type | Operators | Status | Description |
|-------|------|-----------|--------|-------------|
| Opted Out | Boolean | `is true`, `is false` | Proposed | Contact has opted out of any communication channel |
| Has Active Enrollment | Boolean | `is true`, `is false` | Proposed | Is the contact currently enrolled in any workflow? |
| Enrolled in Workflow | Workflow picker | `=`, `!=` | Proposed | Is the contact enrolled in a specific workflow? |
| Last Contacted | Date | `before`, `after`, `within last N days` | Proposed | Date of the most recent completed task or sent message |
| Brokerage / Office Name | Text | `=`, `!=` | Proposed | Filters by the contact's associated brokerage or office |

---

### 5b. Dynamic vs. Static Segment

When saving a segment, the creator chooses:

- **Dynamic** — membership updates automatically as contact data changes. Contacts are added or removed as they match or stop matching the filter criteria. Used for ongoing workflows that should always target the current matching population.
- **Static (Snapshot)** — membership is locked at the time of save. No contacts are added or removed after saving, even if their data changes. Essential for one-time sends or campaigns where the list must not drift mid-execution.

Static segments display a **"Snapshot"** badge in the UserSegments list to distinguish them from dynamic segments at a glance.

### 5c. Exclude Contacts from Segment

Allow segment creators to subtract specific contacts or entire cohorts from an otherwise broad include population, without making the include filters overly narrow.

**Two exclusion mechanisms:**

1. **Exclude filter rules** — the same filter-group UI used for include conditions. Contacts matching the exclude rules are subtracted from the final population even if they also match the include rules.
2. **Manually pinned excludes** — specific contacts can be permanently pinned to the exclude list; they are always removed regardless of filter matches.

**UI pattern:**

- The segment builder gains a two-tab layout: **Include** / **Exclude**. Both tabs show the identical filter-group editor. Switching tabs changes which rule set is being edited.
- The "Specific Contacts" section (below the filter groups) adds a mode toggle pill per pinned contact card: **Include** (green, default) / **Exclude** (red). Toggling a card moves the contact's ID between `includedContactIds` and `excludedContactIds`.
- The SegmentDetail read-only view shows exclude rules as chips below the include rules, styled with a red left border to distinguish them from include chips.

**Evaluation logic:**

> Include population = all contacts matching include filter rules ∪ manually pinned includes  
> Final population = Include population − (contacts matching exclude filter rules) − manually pinned excludes

**Data model** (already defined in `src/app/types/index.ts`):

| Field | Type | Description |
|-------|------|-------------|
| `excludeFilters` | `FilterRule[]` | Exclude filter rules (same shape as `filters`) |
| `excludedContactIds` | `string[]` | IDs of manually pinned excluded contacts |

**Status:** Implementation complete — data structures and evaluation logic are present. The UI was hidden in May 2026 pending product confirmation. Restoring it requires re-exposing the tab bar and pinned-contact mode toggle that were removed in that change.

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

When multiple contacts trigger the same event simultaneously, group into one notification (e.g. *"4 contacts completed New Broker Onboarding"*) that expands to list each individually. Prevents the panel from becoming noisy during high-volume workflow activity.

### 6c. Actionable Notifications

Each notification includes a contextual action button based on its type:
- **"View on Board"** → WorkflowBoard for that workflow
- **"Reply"** → Workflow Inbox thread for that contact
- **"View Contact"** → ContactDetail
- **"View Task"** → TaskQueue filtered to that task

Notifications are marked **resolved** when the linked action is taken — not just when read.

### 6d. Per-User Notification Preferences

A settings popover (gear icon in the notification panel header) lets each user toggle which notification types generate in-app alerts. Reduces noise for high-volume teams without requiring admin changes.

---

## 7. Workflow Analytics

### Performance Dashboard

**Route:** `/email-workflows/analytics`

**Enrollment funnel chart:** Horizontal funnel showing contact count at each step for the selected workflow. The step with the highest drop-off is visually highlighted. Hover shows the absolute count and percentage drop-off from the previous step. This is the primary diagnostic tool for identifying where contacts are leaving the sequence.

**Engagement over time:** Line chart showing daily sends, opens, and bounces over the selected period. Date range picker: 7d / 30d / 90d / custom.

**Per-step breakdown table:** One row per workflow step with the following columns:

| Column | Description |
|--------|-------------|
| Step name | Display name and day offset |
| Action type | Email / SMS / Call / Delay |
| Sent | Total messages sent at this step |
| Delivered | Successfully delivered count |
| Opened | Opened count (email steps only) |
| Bounced | Bounce count |
| Task completion rate | % of call/task steps marked complete |
| Avg days at step | Average time contacts spend at this step |

Clicking a row opens a drawer listing contacts currently at that step with their enrollment status and last action.

---

## 8. Template Categories — Requires Confirmation

**Current state:** Three independent category lists exist — email categories, SMS categories, voicemail categories — each stored as a string array. Templates are tagged with one category. The following questions require sign-off before Phase 2 work touches the template system.

| # | Question | Proposed default | Confirm? |
|---|----------|-----------------|---------|
| 1 | Are categories used only for library organisation, or do they restrict which templates can be used in specific workflow steps? | Organisation only | ☐ |
| 2 | Should the template picker in the workflow builder be filterable by category? | Yes — filterable but not restricted | ☐ |
| 3 | Are email, SMS, and voicemail categories independent lists, or shared? | Independent | ☐ |
| 4 | Can a template belong to more than one category? | No — single category per template | ☐ |
| 5 | What happens when a category is deleted? | Templates become "Uncategorised"; no cascade delete | ☐ |
| 6 | Who can manage (create/rename/delete) categories? | Manager + Super Admin | ☐ |
| 7 | Are there required default categories that cannot be deleted? | "General" (protected) | ☐ |

---

## 9. Open Questions for Confirmation

| # | Question | Required by |
|---|----------|------------|
| 1 | All rows in the RBAC permission matrix (Section 3) | Technical implementation |
| 2 | Which segment filter fields are in scope for Phase 2 (Section 5a) | Technical implementation |
| 3 | Which condition block fields are in scope for Phase 2 (Section 4a) | Technical implementation |
| 4 | Can conditional branch conditions use email engagement (opened / not opened)? Requires delivery event tracking integration. | Architecture review |
| 5 | All template category decisions (Section 8) | Technical implementation |
| 6 | Are notifications in-app only, or should high-priority types (bounce, task overdue) also send an email to the loan officer? | Product decision |
