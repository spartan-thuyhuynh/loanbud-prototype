# LoanBud CRM — Demo Scripts

**Phase 1 Prototype · Workflows, Segments & Tasks**  
Last updated: May 2026

Each script maps to one video placeholder in `docs/user-manual.md`. Follow the scenes in order. Pause briefly (1–2 s) between steps so viewers can follow along. Avoid fast mouse movements — move slowly and hover over elements before clicking so viewers can see what you are about to interact with.

---

## Table of Contents

1. [Workflows List](#1-workflows-list)
2. [Create a Workflow](#2-create-a-workflow)
3. [Edit a Workflow](#3-edit-a-workflow)
4. [Workflow Board](#4-workflow-board)
5. [Workflow Contact Panel](#5-workflow-contact-panel)
6. [Segments List](#6-segments-list)
7. [Segment Builder](#7-segment-builder)
8. [Segment Detail](#8-segment-detail)
9. [Task Queue](#9-task-queue)
10. [Complete a Task](#10-complete-a-task)
11. [Reschedule a Task](#11-reschedule-a-task)
12. [Bulk Task Actions](#12-bulk-task-actions)
13. [Create a Manual Task](#13-create-a-manual-task)
14. [Email Templates](#14-email-templates)
15. [SMS Templates](#15-sms-templates)
16. [Voicemail Templates](#16-voicemail-templates)
17. [Sender Identities & Voicemail Settings](#17-sender-identities--voicemail-settings)

---

## Recording Conventions

| Callout | Meaning |
|---|---|
| **[HOVER]** | Move the cursor over the element and pause for 1 s before clicking |
| **[CLICK]** | Click the element |
| **[TYPE]** | Type the text shown in quotes |
| **[PAUSE]** | Hold the current view for 2–3 s so viewers can read the screen |
| **[HIGHLIGHT]** | Move the cursor slowly around the area to draw the viewer's eye |
| **[NARRATOR]** | Spoken or captioned line — read at a relaxed pace |
| **[CUT]** | Edit point — jump cut to next scene is fine |

**Recommended window size:** 1440 × 900 (or record at 1440 px wide and crop vertically as needed).  
**Browser zoom:** 100%.  
**Suggested tool:** Loom, Screen Studio, or QuickTime with a separate narration track.

---

## 1. Workflows List

**File:** `workflows-list.mp4`  
**Suggested duration:** ~60 s  
**Goal:** Show how to navigate to the Flows list, read the table, and open a workflow.

### Pre-conditions
- At least 3–4 workflows exist in the system with a mix of Active, Paused, and Draft statuses.
- Start on any page (e.g. the Overview dashboard).

### Script

**Scene 1 — Navigate to Workflows (0:00–0:10)**
1. **[NARRATOR]** "To view all your workflows, go to the Email Workflows section in the left sidebar."
2. **[HOVER]** over the Email Workflows icon in the sidebar.
3. **[CLICK]** the sidebar icon to expand the sub-menu.
4. **[CLICK]** **Workflows** in the sub-menu.
5. **[PAUSE]** — the Flows list loads.

**Scene 2 — Read the table (0:10–0:30)**
1. **[NARRATOR]** "Each row shows the workflow name, its target segment, current status, and a preview of the first few steps."
2. **[HIGHLIGHT]** the Status column — slowly move the cursor down the column over Active, Paused, and Draft badges.
3. **[NARRATOR]** "Active workflows are running. Paused workflows are temporarily stopped. Draft workflows are still being built."
4. **[HIGHLIGHT]** the Steps column on one row — point to the step type icons.
5. **[PAUSE]**

**Scene 3 — Search (0:30–0:45)**
1. **[NARRATOR]** "Use the search bar to find a workflow by name or segment."
2. **[CLICK]** the search bar.
3. **[TYPE]** `"Active"` — the list filters in real-time.
4. **[PAUSE]** — show filtered results.
5. **[HIGHLIGHT]** the matching rows.
6. **[CLICK]** the **×** to clear the search.

**Scene 4 — Open a workflow (0:45–1:00)**
1. **[NARRATOR]** "Click any row to open the workflow's board."
2. **[HOVER]** over a row.
3. **[CLICK]** the row.
4. **[PAUSE]** — the Workflow Board opens.
5. **[NARRATOR]** "We'll look at the board in detail in the next video."

---

## 2. Create a Workflow

**File:** `create-workflow.mp4`  
**Suggested duration:** ~2:30  
**Goal:** Walk through the full 2-step workflow creation wizard from clicking "New Flow" to saving.

### Pre-conditions
- At least 2 segments exist (e.g. "Interested Referral Partners" and "All Inactive Referral Partners").
- At least 1 email template and 1 SMS template exist.
- Start on the Flows list page.

### Script

**Scene 1 — Open the wizard (0:00–0:15)**
1. **[NARRATOR]** "To create a new workflow, click the New Flow button in the top right."
2. **[HOVER]** over the **+ New Flow** button.
3. **[CLICK]** — the wizard opens on Step 1.
4. **[PAUSE]**

**Scene 2 — Step 1: Flow Details (0:15–0:50)**
1. **[NARRATOR]** "Step 1 asks for the workflow name and the audience segment it will target."
2. **[CLICK]** the **Flow Name** field.
3. **[TYPE]** `"New Partner Onboarding"`
4. **[CLICK]** the **Description** field.
5. **[TYPE]** `"Welcome sequence for newly added referral partners."`
6. **[NARRATOR]** "Now select the target segment. Start typing to search."
7. **[CLICK]** the **Target Segment** dropdown.
8. **[TYPE]** `"Partner"` — filtered options appear.
9. **[HIGHLIGHT]** the contact count shown next to each option.
10. **[CLICK]** **"Interested Referral Partners - All Contacts"**.
11. **[PAUSE]**
12. **[CLICK]** **Next**.

**Scene 3 — Step 2: Load a template (0:50–1:20)**
1. **[NARRATOR]** "Step 2 is where you build the sequence. You can start from a pre-built template or add steps one by one."
2. **[HOVER]** over the **Choose Template** button.
3. **[CLICK]** — the template picker opens.
4. **[HIGHLIGHT]** the two template options and their descriptions.
5. **[NARRATOR]** "Let's load the Active Sequence template — an 11-step sequence spread over 14 days."
6. **[CLICK]** **Active Sequence**.
7. **[PAUSE]** — the steps load into the timeline.
8. **[HIGHLIGHT]** the header stats (step count, total days, channel icons).
9. **[NARRATOR]** "The header gives you a quick summary — 11 action steps, 14 days, with email, call, and SMS steps."

**Scene 4 — Inspect and edit a step (1:20–1:55)**
1. **[NARRATOR]** "Let's open one of the email steps to see its configuration."
2. **[CLICK]** the first email step card to expand it.
3. **[HIGHLIGHT]** the Sender Identity field.
4. **[HIGHLIGHT]** the Template dropdown — show the selected template name.
5. **[HIGHLIGHT]** the Subject and Body fields.
6. **[HIGHLIGHT]** the Day Offset field.
7. **[NARRATOR]** "Each step lets you choose a template, set the sender, and define which day in the sequence it fires."
8. **[CLICK]** the step again to collapse it.

**Scene 5 — Reorder a step (1:55–2:15)**
1. **[NARRATOR]** "You can reorder steps by dragging them."
2. **[HOVER]** over the drag handle (⠿) on step 3 — cursor changes.
3. Slowly **drag** step 3 up to the step 2 position.
4. **[PAUSE]** — show the new order.
5. **[NARRATOR]** "Day offsets update automatically when you reorder."

**Scene 6 — Save (2:15–2:30)**
1. **[NARRATOR]** "When you're happy with the steps, save the workflow."
2. **[HOVER]** over the **Save** button.
3. **[CLICK]** — the workflow saves with Draft status.
4. **[PAUSE]** — the Flows list is shown with the new workflow appearing as a Draft row.
5. **[NARRATOR]** "The workflow is saved as a Draft. Activate it when you're ready to start enrolling contacts."

---

## 3. Edit a Workflow

**File:** `edit-workflow.mp4`  
**Suggested duration:** ~75 s  
**Goal:** Show how to open an existing workflow for editing and make a change.

### Pre-conditions
- A Draft or Paused workflow exists (e.g. "New Partner Onboarding" from the previous demo).
- Start on the Flows list page.

### Script

**Scene 1 — Open the edit wizard (0:00–0:15)**
1. **[NARRATOR]** "To edit a workflow, find it in the Flows list and click the edit icon."
2. **[HOVER]** over the target workflow row — the edit (pencil) icon appears.
3. **[CLICK]** the pencil icon.
4. **[PAUSE]** — the wizard opens pre-filled with the existing values.
5. **[NARRATOR]** "The wizard opens exactly as before, with all the current settings loaded in."

**Scene 2 — Update the name (0:15–0:35)**
1. **[HIGHLIGHT]** the Flow Name field showing the existing name.
2. **[CLICK]** the **Flow Name** field — select all text.
3. **[TYPE]** `"New Partner Welcome Sequence"` to replace it.
4. **[CLICK]** **Next** to go to Step 2.

**Scene 3 — Add a new step (0:35–1:05)**
1. **[NARRATOR]** "Let's add a delay step at the end of the sequence."
2. **[CLICK]** **+ Add Step** at the bottom of the timeline.
3. **[CLICK]** **Delay** from the step type options.
4. **[CLICK]** the **Duration** field.
5. **[TYPE]** `"3d"` (3 days).
6. **[CLICK]** **Save Step**.
7. **[PAUSE]** — the delay step appears at the end of the timeline.
8. **[HIGHLIGHT]** the updated header stats showing the new total duration.

**Scene 4 — Save (1:05–1:15)**
1. **[NARRATOR]** "Click Save to apply the changes."
2. **[CLICK]** **Save**.
3. **[PAUSE]** — returns to the Flows list.
4. **[HIGHLIGHT]** the updated workflow row showing the new name.

---

## 4. Workflow Board

**File:** `workflow-board.mp4`  
**Suggested duration:** ~90 s  
**Goal:** Demonstrate the Kanban board — reading the columns, moving a contact, and completing a step.

### Pre-conditions
- An Active workflow exists with at least 6–8 enrolled contacts spread across 3+ columns.
- Some contacts have Overdue cards.
- Start on the Flows list page.

### Script

**Scene 1 — Open the board (0:00–0:12)**
1. **[NARRATOR]** "Click a workflow row to open its board."
2. **[CLICK]** an Active workflow row.
3. **[PAUSE]** — the Kanban board loads.

**Scene 2 — Read the board layout (0:12–0:40)**
1. **[NARRATOR]** "Each column represents a step in the workflow. Contacts are placed in the column matching their current step."
2. **[HIGHLIGHT]** the column headers — pan the cursor left to right across the board.
3. **[NARRATOR]** "Within each column, cards are grouped by scheduled date — overdue at the top in red, then today, then future dates."
4. **[HIGHLIGHT]** an Overdue group heading — hover over a red card.
5. **[HIGHLIGHT]** a contact card — point to the name, listing status badge, and the action label at the bottom of the card.

**Scene 3 — Move a contact (0:40–1:05)**
1. **[NARRATOR]** "You can drag a contact card to move them to a different step."
2. **[HOVER]** over a contact card in column 1.
3. Slowly **drag** the card to column 2.
4. **[PAUSE]** after dropping — card appears in the new column.
5. **[NARRATOR]** "The contact's enrollment now reflects the new step."

**Scene 4 — Complete a step action (1:05–1:25)**
1. **[NARRATOR]** "To mark an action complete on a contact, use the action button directly on their card."
2. **[HOVER]** over a call-step card — point to the disposition button.
3. **[CLICK]** the disposition button (e.g. **Answered**).
4. **[PAUSE]** — card moves to the next column automatically.
5. **[NARRATOR]** "The card advances to the next step and a new task is generated if the workflow requires one."

**Scene 5 — Open the contact panel (1:25–1:30)**
1. **[NARRATOR]** "Click a card to open the Workflow Contact Panel for a detailed view."
2. **[CLICK]** a contact card.
3. **[PAUSE]** — the panel slides open.
4. **[NARRATOR]** "We'll look at that panel in the next video."

---

## 5. Workflow Contact Panel

**File:** `workflow-contact-panel.mp4`  
**Suggested duration:** ~2:00  
**Goal:** Show the enrollment timeline, pausing/resuming, skipping a step, and completing an enrollment.

### Pre-conditions
- An Active workflow with at least one enrolled contact who has 3+ completed steps and 2+ remaining steps.
- Start on the Workflow Board with the contact panel closed.

### Script

**Scene 1 — Open the panel (0:00–0:10)**
1. **[NARRATOR]** "Click any contact card on the board to open their Workflow Contact Panel."
2. **[CLICK]** a contact card.
3. **[PAUSE]** — the panel opens on the right.

**Scene 2 — Read the panel (0:10–0:35)**
1. **[NARRATOR]** "The top of the panel shows the contact's name, type, and their current enrollment status."
2. **[HIGHLIGHT]** the enrollment status badge (Active).
3. **[NARRATOR]** "Below that is the step timeline — completed steps have a checkmark, the current step is highlighted, and future steps are shown greyed out."
4. **[HIGHLIGHT]** a completed step (checkmark).
5. **[HIGHLIGHT]** the current active step.
6. **[HIGHLIGHT]** a future pending step.
7. **[SCROLL]** down to show the email history and tasks sections.
8. **[NARRATOR]** "You can also see all emails sent to this contact via this workflow, and any outstanding tasks."

**Scene 3 — Skip a step (0:35–0:55)**
1. **[NARRATOR]** "If a step is no longer relevant for this contact, you can skip it."
2. **[SCROLL]** back up to the step timeline.
3. **[HOVER]** over the next pending step — the **Skip** action appears.
4. **[CLICK]** **Skip**.
5. **[PAUSE]** — the step is marked as skipped and the contact advances.
6. **[NARRATOR]** "The contact moves past that step to the next one in the sequence."

**Scene 4 — Pause an enrollment (0:55–1:15)**
1. **[NARRATOR]** "You can pause a contact's enrollment at any time — no further steps will fire while paused."
2. **[HOVER]** over the **Pause Enrollment** button.
3. **[CLICK]** — the status badge changes to Paused.
4. **[PAUSE]**
5. **[NARRATOR]** "To resume, just click Resume Enrollment."
6. **[CLICK]** **Resume Enrollment** — status returns to Active.
7. **[PAUSE]**

**Scene 5 — Insert a custom step (1:15–1:40)**
1. **[NARRATOR]** "You can also insert a one-off custom step just for this contact, without affecting anyone else in the workflow."
2. **[HIGHLIGHT]** the **+ Insert Step** button between two steps in the timeline.
3. **[CLICK]** **+ Insert Step**.
4. **[CLICK]** **Call Reminder** as the step type.
5. Fill in a step name: **[TYPE]** `"Personal check-in call"`.
6. **[CLICK]** **Save Step**.
7. **[PAUSE]** — the custom step appears in the timeline between the two existing steps.

**Scene 6 — Complete the enrollment (1:40–2:00)**
1. **[NARRATOR]** "When a contact has finished the workflow, mark them as complete."
2. **[HOVER]** over **Complete Enrollment**.
3. **[CLICK]** — status changes to Completed.
4. **[PAUSE]**
5. **[NARRATOR]** "Completed contacts are removed from the active board and their enrollment history is preserved."

---

## 6. Segments List

**File:** `segments-list.mp4`  
**Suggested duration:** ~60 s  
**Goal:** Navigate to the Segments list, read the table, and search.

### Pre-conditions
- 4–5 segments exist with a mix of Active and Inactive statuses.
- Start on the Email Workflows Overview or Flows list page.

### Script

**Scene 1 — Navigate to Segments (0:00–0:12)**
1. **[NARRATOR]** "User Segments define the audience for each workflow. To view all segments, click Segments in the Workflow sub-menu."
2. **[HOVER]** over the Email Workflows sidebar icon.
3. **[CLICK]** to expand the sub-menu.
4. **[CLICK]** **Segments**.
5. **[PAUSE]** — the Segments list loads.

**Scene 2 — Read the table (0:12–0:35)**
1. **[NARRATOR]** "Each row shows the segment name, its status, when it was last updated, and who created it."
2. **[HIGHLIGHT]** the Status column — hover over Active and Inactive badges.
3. **[HIGHLIGHT]** the Last Updated column.
4. **[HIGHLIGHT]** the Created By column.
5. **[PAUSE]**

**Scene 3 — Search (0:35–0:50)**
1. **[NARRATOR]** "Use the search bar to find a segment by name."
2. **[CLICK]** the search bar.
3. **[TYPE]** `"Referral"` — the list filters.
4. **[PAUSE]** — matching rows are shown.
5. **[CLICK]** the **×** to clear.

**Scene 4 — Open a segment (0:50–1:00)**
1. **[NARRATOR]** "Click a row to view the segment's details and configuration."
2. **[CLICK]** a segment row.
3. **[PAUSE]** — the Segment Detail page opens.
4. **[NARRATOR]** "We'll look at building a segment from scratch in the next video."

---

## 7. Segment Builder

**File:** `segment-builder.mp4`  
**Suggested duration:** ~3:00  
**Goal:** Build a segment from scratch using filter groups, AND/OR logic, and contact pinning.

### Pre-conditions
- Several contacts exist with different `userType` and `listingStatus` values.
- Start on the Segments list page.

### Script

**Scene 1 — Open the builder (0:00–0:12)**
1. **[NARRATOR]** "To create a new segment, click New Segment."
2. **[HOVER]** over **+ New Segment**.
3. **[CLICK]** — the Segment Builder opens with a blank canvas.
4. **[PAUSE]**
5. **[NARRATOR]** "The left side is where you define filter rules. The right panel shows a live preview of the contacts who match."

**Scene 2 — Add the first filter group (0:12–0:50)**
1. **[NARRATOR]** "Let's build a segment targeting active Brokers."
2. **[CLICK]** **+ Add Filter Group**.
3. **[PAUSE]** — a group row appears.
4. **[CLICK]** **+ Add Filter** inside the group.
5. **[CLICK]** the **Field** dropdown.
6. **[CLICK]** `userType`.
7. **[CLICK]** the **Operator** dropdown — `=` is already selected.
8. **[CLICK]** the **Value** dropdown.
9. **[CLICK]** `Broker`.
10. **[PAUSE]** — the live preview on the right updates.
11. **[HIGHLIGHT]** the contact count in the preview panel.
12. **[NARRATOR]** "The preview already shows the matching contacts — real-time feedback as you build."

**Scene 3 — Add a second filter within the group (0:50–1:20)**
1. **[NARRATOR]** "Now let's add a second condition — we only want Brokers whose listing status is not Declined."
2. **[CLICK]** **+ Add Filter** inside the same group.
3. **[CLICK]** the **Field** dropdown.
4. **[CLICK]** `listingStatus`.
5. **[CLICK]** the **Operator** dropdown.
6. **[CLICK]** `!=` (not equals).
7. **[CLICK]** the **Value** dropdown.
8. **[CLICK]** `Declined`.
9. **[PAUSE]** — the preview updates with fewer contacts.
10. **[HIGHLIGHT]** the AND connector label between the two filters.
11. **[NARRATOR]** "The two filters are connected by AND, so both conditions must be true."

**Scene 4 — Add a second group with OR logic (1:20–1:55)**
1. **[NARRATOR]** "Let's also include all Referral Partners — we'll add a second group connected by OR."
2. **[CLICK]** **+ Add Filter Group** — a second group appears.
3. **[HIGHLIGHT]** the OR connector label between the two groups.
4. **[NARRATOR]** "The groups are connected by OR — contacts matching either group will be included."
5. **[CLICK]** **+ Add Filter** in the second group.
6. **[CLICK]** the **Field** dropdown → `userType`.
7. Keep operator as `=`.
8. **[CLICK]** the **Value** dropdown → `Partner`.
9. **[PAUSE]** — the preview expands to include Partners.
10. **[HIGHLIGHT]** the increased contact count.
11. **[NARRATOR]** "The segment now returns: Brokers without a Declined status, OR any Referral Partner."

**Scene 5 — Pin a contact (1:55–2:25)**
1. **[NARRATOR]** "You can also manually force a specific contact into or out of the segment regardless of the filters."
2. **[SCROLL]** down to the **Specific Contacts** section.
3. **[CLICK]** the contact search field.
4. **[TYPE]** `"John"` — a contact suggestion appears.
5. **[CLICK]** the contact.
6. **[CLICK]** **Always Include**.
7. **[PAUSE]** — the contact card appears in the pinned section.
8. **[HIGHLIGHT]** the contact card in the live preview (highlighted separately from filter matches).
9. **[NARRATOR]** "This contact will always be in the segment, even if they don't match the filters."

**Scene 6 — Save the segment (2:25–3:00)**
1. **[NARRATOR]** "Once you're happy with the audience, save the segment."
2. **[HOVER]** over **Save Segment**.
3. **[CLICK]** — a save dialog appears.
4. **[CLICK]** the **Segment Name** field.
5. **[TYPE]** `"Active Brokers & All Partners"`.
6. **[CLICK]** the **Description** field.
7. **[TYPE]** `"Brokers not declined, plus all referral partners."`.
8. **[CLICK]** **Confirm**.
9. **[PAUSE]** — redirected to the Segments list.
10. **[HIGHLIGHT]** the new segment row at the top of the list.
11. **[NARRATOR]** "The segment is saved and ready to be selected when creating a workflow."

---

## 8. Segment Detail

**File:** `segment-detail.mp4`  
**Suggested duration:** ~45 s  
**Goal:** Open a saved segment and read its configuration and contact list.

### Pre-conditions
- The "Active Brokers & All Partners" segment from the previous demo exists.
- Start on the Segments list.

### Script

**Scene 1 — Open the detail page (0:00–0:10)**
1. **[NARRATOR]** "Click any segment to see its full configuration and the contacts it currently matches."
2. **[CLICK]** the "Active Brokers & All Partners" segment row.
3. **[PAUSE]** — the detail page loads.

**Scene 2 — Review the configuration (0:10–0:30)**
1. **[NARRATOR]** "The detail page shows the filter rules exactly as you built them, along with the total contact count."
2. **[HIGHLIGHT]** the filter rules display.
3. **[HIGHLIGHT]** the contact count.
4. **[SCROLL]** down to show the contact list.
5. **[NARRATOR]** "And here is the full list of contacts currently in this segment."

**Scene 3 — Navigate to edit (0:30–0:45)**
1. **[NARRATOR]** "To change the segment's rules, click Edit."
2. **[HOVER]** over the **Edit** button.
3. **[CLICK]** — the Segment Builder opens with this segment pre-loaded.
4. **[NARRATOR]** "From here you can modify the filters or add new ones, then save."

---

## 9. Task Queue

**File:** `task-queue.mp4`  
**Suggested duration:** ~90 s  
**Goal:** Walk through filtering, sorting, and searching the task queue.

### Pre-conditions
- 10+ tasks exist with a mix of statuses (pending, overdue, completed), types (call, email, voicemail), assignees, and due dates.
- Start anywhere in the Email Workflows section.

### Script

**Scene 1 — Navigate to Tasks (0:00–0:12)**
1. **[NARRATOR]** "The Task Queue is your central list of all follow-up actions. Access it from the Workflow sub-menu."
2. **[CLICK]** **Tasks** in the Workflow sub-menu.
3. **[PAUSE]** — the Task Queue loads.

**Scene 2 — Read the task list (0:12–0:30)**
1. **[NARRATOR]** "Each row shows the contact name, task type, source workflow, due date, assignee, and status."
2. **[HIGHLIGHT]** a row slowly — move the cursor across each column.
3. **[HIGHLIGHT]** an overdue row — point to the red due date.
4. **[NARRATOR]** "Overdue tasks are highlighted in red so they stand out."

**Scene 3 — Filter by due date (0:30–0:50)**
1. **[NARRATOR]** "Use the date tabs to focus on what needs attention now."
2. **[CLICK]** **Overdue** tab.
3. **[PAUSE]** — list shows only overdue tasks.
4. **[CLICK]** **Today** tab.
5. **[PAUSE]** — list shows only today's tasks.
6. **[CLICK]** **All** to reset.

**Scene 4 — Filter by assignee (0:50–1:05)**
1. **[NARRATOR]** "Filter by assignee to see a specific team member's workload."
2. **[CLICK]** the **Assignee** filter dropdown.
3. **[CLICK]** one team member's name.
4. **[PAUSE]** — list narrows to their tasks.
5. **[CLICK]** the **×** on the filter to clear it.

**Scene 5 — Sort and search (1:05–1:30)**
1. **[NARRATOR]** "Sort the list by due date, contact name, or source."
2. **[CLICK]** the **Sort** control.
3. **[CLICK]** **Contact Name** — the list re-orders alphabetically.
4. **[NARRATOR]** "Or search for a specific contact or workflow."
5. **[CLICK]** the search bar.
6. **[TYPE]** a contact name that exists in the list.
7. **[PAUSE]** — matching tasks appear.
8. **[CLICK]** the **×** to clear the search.

---

## 10. Complete a Task

**File:** `complete-task.mp4`  
**Suggested duration:** ~75 s  
**Goal:** Open a task, select a disposition, add notes, and save completion.

### Pre-conditions
- At least one pending call-type task exists.
- Start on the Task Queue (All tab).

### Script

**Scene 1 — Open the task detail panel (0:00–0:12)**
1. **[NARRATOR]** "Click a task row to open its detail panel."
2. **[CLICK]** a call-type task row.
3. **[PAUSE]** — the Task Detail panel slides in from the right.

**Scene 2 — Read the panel (0:12–0:30)**
1. **[NARRATOR]** "The panel shows the contact, task type, which workflow it came from, the due date, and the assignee."
2. **[HIGHLIGHT]** the contact name.
3. **[HIGHLIGHT]** the source workflow name.
4. **[HIGHLIGHT]** the due date.
5. **[PAUSE]**

**Scene 3 — Select a disposition (0:30–0:55)**
1. **[NARRATOR]** "For a call task, select the disposition that describes the outcome of the call."
2. **[HIGHLIGHT]** the disposition options (Answered, Left Voicemail, Drop Voicemail, No Answer, Not Needed).
3. **[CLICK]** **Answered**.
4. **[NARRATOR]** "Now add a brief note about the conversation."
5. **[CLICK]** the **Notes** field.
6. **[TYPE]** `"Spoke with contact — interested, will follow up next week."`.
7. **[PAUSE]**

**Scene 4 — Complete the task (0:55–1:15)**
1. **[NARRATOR]** "Click Complete Task to log the outcome."
2. **[HOVER]** over **Complete Task**.
3. **[CLICK]** — the task is marked done and disappears from the pending list.
4. **[PAUSE]**
5. **[NARRATOR]** "The disposition is logged to the contact's activity feed and the workflow advances to its next step automatically."

---

## 11. Reschedule a Task

**File:** `reschedule-task.mp4`  
**Suggested duration:** ~45 s  
**Goal:** Open a task and reschedule it to a new due date.

### Pre-conditions
- At least one pending task exists.
- Start on the Task Queue.

### Script

**Scene 1 — Open the task (0:00–0:10)**
1. **[NARRATOR]** "To reschedule a task, open it from the queue."
2. **[CLICK]** a pending task row.
3. **[PAUSE]** — Task Detail panel opens.

**Scene 2 — Reschedule (0:10–0:35)**
1. **[NARRATOR]** "Click Reschedule to pick a new due date."
2. **[HOVER]** over **Reschedule**.
3. **[CLICK]** — a date picker appears.
4. **[CLICK]** a date 3 days in the future.
5. **[PAUSE]** — new date is shown in the picker.
6. **[CLICK]** **Confirm**.

**Scene 3 — Confirm the change (0:35–0:45)**
1. **[PAUSE]** — the task row in the list updates with the new due date.
2. **[HIGHLIGHT]** the updated due date on the task row.
3. **[NARRATOR]** "The task remains pending with its new due date."

---

## 12. Bulk Task Actions

**File:** `bulk-task-actions.mp4`  
**Suggested duration:** ~75 s  
**Goal:** Select multiple tasks and demonstrate bulk complete, reschedule, and delete.

### Pre-conditions
- 6+ pending tasks exist across different contacts.
- Start on the Task Queue (All tab).

### Script

**Scene 1 — Select tasks (0:00–0:18)**
1. **[NARRATOR]** "You can act on multiple tasks at once using bulk actions. Start by selecting the tasks you want."
2. **[CLICK]** the checkbox on the first task row.
3. **[CLICK]** the checkbox on the second task row.
4. **[CLICK]** the checkbox on the third task row.
5. **[PAUSE]** — the bulk action bar appears at the bottom.
6. **[HIGHLIGHT]** the bulk action bar and the selected count.

**Scene 2 — Bulk reschedule (0:18–0:40)**
1. **[NARRATOR]** "Let's reschedule all three to the same new date."
2. **[CLICK]** **Reschedule** in the bulk action bar.
3. **[PAUSE]** — a date picker appears.
4. **[CLICK]** a date 5 days in the future.
5. **[CLICK]** **Confirm**.
6. **[PAUSE]** — all three task rows update with the new date.
7. **[NARRATOR]** "All selected tasks now share the new due date."

**Scene 3 — Select all and bulk complete (0:40–1:00)**
1. **[NARRATOR]** "You can also select everything visible at once using the header checkbox."
2. **[CLICK]** the header checkbox — all rows are selected.
3. **[HIGHLIGHT]** the selection count in the bulk action bar.
4. **[NARRATOR]** "Let's complete all of them at once."
5. **[CLICK]** **Complete** in the bulk action bar.
6. **[PAUSE]** — tasks disappear from the pending list.
7. **[NARRATOR]** "All selected tasks are marked complete. Toggle Show Completed on to see them in the list."

**Scene 4 — Bulk delete (1:00–1:15)**
1. **[NARRATOR]** "Bulk delete works the same way — select tasks, then click Delete."
2. **[CLICK]** checkboxes on 2 tasks.
3. **[CLICK]** **Delete** in the bulk action bar.
4. **[PAUSE]** — a confirmation prompt appears.
5. **[CLICK]** **Confirm Delete**.
6. **[PAUSE]** — tasks are removed.

---

## 13. Create a Manual Task

**File:** `create-manual-task.mp4`  
**Suggested duration:** ~60 s  
**Goal:** Create a one-off manual task from the Task Queue.

### Pre-conditions
- At least one contact exists.
- Start on the Task Queue page.

### Script

**Scene 1 — Open the new task form (0:00–0:12)**
1. **[NARRATOR]** "To create a task that isn't part of a workflow, click New Task in the top right."
2. **[HOVER]** over **+ New Task**.
3. **[CLICK]** — the new task form opens.
4. **[PAUSE]**

**Scene 2 — Fill in the task details (0:12–0:45)**
1. **[NARRATOR]** "Start by searching for the contact this task is for."
2. **[CLICK]** the **Contact** search field.
3. **[TYPE]** a contact's name.
4. **[CLICK]** the matching contact from the suggestions.
5. **[NARRATOR]** "Now choose the task type."
6. **[CLICK]** the **Task Type** dropdown.
7. **[CLICK]** **Call**.
8. **[NARRATOR]** "Set the due date."
9. **[CLICK]** the **Due Date** field.
10. **[CLICK]** tomorrow's date in the date picker.
11. **[NARRATOR]** "Optionally assign it to a team member and add a note."
12. **[CLICK]** the **Notes** field.
13. **[TYPE]** `"Follow up on their application questions."`.
14. **[PAUSE]**

**Scene 3 — Save and confirm (0:45–1:00)**
1. **[NARRATOR]** "Click Save to add the task to the queue."
2. **[HOVER]** over **Save**.
3. **[CLICK]** — the form closes.
4. **[PAUSE]** — the new task row appears in the list with source shown as **Manual**.
5. **[HIGHLIGHT]** the "Manual" source label on the new task row.
6. **[NARRATOR]** "The task is now in the queue, ready to be picked up and actioned."

---

## 14. Email Templates

**File:** `email-templates.mp4`  
**Suggested duration:** ~90 s  
**Goal:** Navigate to the Templates page, read an existing template, create a new one, and manage a category.

### Pre-conditions
- 3 email templates exist across at least 2 categories (e.g. "Initial Outreach" and "Follow-up").
- Start on the Email Workflows Overview or Flows list page.

### Script

**Scene 1 — Navigate to Templates (0:00–0:12)**
1. **[NARRATOR]** "Templates are reusable message content for email, SMS, and voicemail steps. Access them from the Workflow sub-menu under Configuration."
2. **[HOVER]** over the Email Workflows sidebar icon.
3. **[CLICK]** to expand the sub-menu.
4. **[CLICK]** **Configuration** (or **Templates**).
5. **[PAUSE]** — the Templates page opens on the Email Templates tab.

**Scene 2 — Browse and read a template (0:12–0:35)**
1. **[NARRATOR]** "The left sidebar lists all email templates. Click one to view its details."
2. **[HIGHLIGHT]** the sidebar — move the cursor slowly down the list, pointing to category badges.
3. **[CLICK]** one of the templates.
4. **[PAUSE]** — the detail panel loads on the right.
5. **[HIGHLIGHT]** the subject line.
6. **[HIGHLIGHT]** the body.
7. **[NARRATOR]** "Any personalisation tokens in the template — like first name or listing name — are automatically detected and shown as variable badges here."
8. **[HIGHLIGHT]** the `{{variable}}` badges at the bottom of the detail panel.

**Scene 3 — Create a new template (0:35–1:10)**
1. **[NARRATOR]** "To add a new template, click New Template."
2. **[CLICK]** **+ New Template** in the sidebar header.
3. **[PAUSE]** — the modal opens.
4. **[CLICK]** the **Template Name** field → **[TYPE]** `"Day 5 Follow-up"`.
5. **[CLICK]** the **Category** dropdown → **[CLICK]** **Follow-up**.
6. **[CLICK]** the **Sender Type** dropdown → **[CLICK]** **Loan Officer**.
7. **[CLICK]** the **Subject Line** field → **[TYPE]** `"Following up on your application, {{first_name}}"`.
8. **[CLICK]** the **Body** field → **[TYPE]** `"Hi {{first_name}}, just checking in to see if you have any questions."`.
9. **[NARRATOR]** "Notice the variable badges update automatically as you type the tokens."
10. **[HIGHLIGHT]** the detected variable badges (`{{first_name}}`).
11. **[CLICK]** **Save**.
12. **[PAUSE]** — the new template appears in the sidebar and its detail is shown.

**Scene 4 — Manage categories (1:10–1:30)**
1. **[NARRATOR]** "You can add or rename categories using the Template Categories button."
2. **[CLICK]** **Template Categories** in the sidebar header.
3. **[PAUSE]** — the Category Manager modal opens.
4. **[HIGHLIGHT]** the existing category list.
5. **[CLICK]** the input at the bottom → **[TYPE]** `"Re-engagement"`.
6. **[CLICK]** **Add** — the new category appears in the list.
7. **[CLICK]** the close button to dismiss.

---

## 15. SMS Templates

**File:** `sms-templates.mp4`  
**Suggested duration:** ~75 s  
**Goal:** Browse SMS templates, highlight the character/segment counter, and create a new template.

### Pre-conditions
- 2–3 SMS templates exist.
- Start on the Templates page (Email Templates tab visible).

### Script

**Scene 1 — Switch to SMS Templates (0:00–0:10)**
1. **[NARRATOR]** "For SMS templates, click the SMS Templates tab."
2. **[CLICK]** the **SMS Templates** tab.
3. **[PAUSE]** — the tab switches, sidebar shows SMS templates.

**Scene 2 — Browse and read a template (0:10–0:30)**
1. **[NARRATOR]** "SMS template cards show the character count at a glance."
2. **[HIGHLIGHT]** the character count labels on the sidebar cards (e.g. "64 chars").
3. **[CLICK]** a template from the sidebar.
4. **[PAUSE]** — detail panel loads.
5. **[HIGHLIGHT]** the character count and segment count in the detail panel (e.g. "64 chars · 1 segment").
6. **[NARRATOR]** "A standard SMS is 160 characters — one segment. Longer messages are split into multiple segments."

**Scene 3 — Create a new SMS template (0:30–1:05)**
1. **[NARRATOR]** "Let's create a new SMS template."
2. **[CLICK]** **+ New Template**.
3. **[PAUSE]** — the modal opens.
4. **[CLICK]** the **Template Name** field → **[TYPE]** `"Day 3 SMS Check-in"`.
5. **[CLICK]** the **Category** dropdown → **[CLICK]** **Follow-up**.
6. **[CLICK]** the **Message** field → **[TYPE]** `"Hi {{first_name}}, this is {{loan_officer_name}} from LoanBud. Just checking in — any questions about your application?"`.
7. **[NARRATOR]** "Watch the character counter update as you type. This message is under 160 characters, so it stays at one segment."
8. **[HIGHLIGHT]** the live character counter in the modal (e.g. "138 chars · 1 segment").
9. **[HIGHLIGHT]** the detected variable badges.
10. **[CLICK]** **Save**.
11. **[PAUSE]** — the new template appears in the sidebar.

---

## 16. Voicemail Templates

**File:** `voicemail-templates.mp4`  
**Suggested duration:** ~90 s  
**Goal:** Show the Record/Script toggle, view both types, and create a new voicemail script.

### Pre-conditions
- At least 1 voicemail record (with audio) and 1 voicemail script exist.
- Start on the Templates page.

### Script

**Scene 1 — Open Voicemail Templates (0:00–0:10)**
1. **[NARRATOR]** "Voicemail templates come in two types — pre-recorded audio files and written scripts. Click the Voicemail Templates tab."
2. **[CLICK]** the **Voicemail Templates** tab.
3. **[PAUSE]** — defaults to the Record view.
4. **[HIGHLIGHT]** the **Record / Script** toggle at the top of the sidebar.

**Scene 2 — View a voicemail record (0:10–0:35)**
1. **[NARRATOR]** "Records are pre-recorded audio files. They play automatically when a voicemail drop fires."
2. **[CLICK]** a record from the sidebar.
3. **[PAUSE]** — the detail panel loads.
4. **[HIGHLIGHT]** the duration badge (e.g. "22s") in the sidebar and detail panel.
5. **[HIGHLIGHT]** the audio player — point to the play button.
6. **[NARRATOR]** "You can preview the recording directly here using the audio player."
7. **[HIGHLIGHT]** the transcript section and any variable badges.

**Scene 3 — Switch to Scripts (0:35–0:50)**
1. **[NARRATOR]** "Scripts don't have audio — they're written guides for team members to read aloud when leaving a voicemail manually."
2. **[CLICK]** the **Script** button in the toggle.
3. **[PAUSE]** — sidebar updates to show scripts only.
4. **[CLICK]** a script from the sidebar.
5. **[HIGHLIGHT]** the script text in the detail panel.

**Scene 4 — Create a new voicemail script (0:50–1:30)**
1. **[NARRATOR]** "Let's create a new voicemail script."
2. **[CLICK]** **+ New Script**.
3. **[PAUSE]** — the modal opens.
4. **[CLICK]** the **Script Name** field → **[TYPE]** `"Day 3 No-Answer Script"`.
5. **[CLICK]** the **Category** dropdown → **[CLICK]** **Follow-up**.
6. **[CLICK]** the **Script** field → **[TYPE]** `"Hi {{first_name}}, this is {{loan_officer_name}} from LoanBud. I'm calling about your application and wanted to answer any questions you might have. Please call me back at {{phone_number}}. Thank you!"`.
7. **[HIGHLIGHT]** the detected variable badges auto-populating.
8. **[CLICK]** **Save**.
9. **[PAUSE]** — the new script appears in the sidebar.
10. **[NARRATOR]** "This script is now available to select when configuring a Call Reminder step in the Workflow Builder."

---

## 17. Sender Identities & Voicemail Settings

**File:** `sender-identities.mp4`  
**Suggested duration:** ~75 s  
**Goal:** Browse sender identities, set a default, add a new identity, and configure voicemail settings.

### Pre-conditions
- 3 sender identities exist: 1 Brand (default), 2 Loan Officer.
- Start on the Templates page.

### Script

**Scene 1 — Open Sender Identities (0:00–0:12)**
1. **[NARRATOR]** "Sender Identities are the email addresses that appear in the From field when a workflow sends an email. Click the Sender Identities tab."
2. **[CLICK]** the **Sender Identities** tab.
3. **[PAUSE]** — the table loads.

**Scene 2 — Read the table (0:12–0:30)**
1. **[HIGHLIGHT]** the table columns — pan the cursor across Name, Email, Type, and Default.
2. **[HIGHLIGHT]** the amber star on the default identity row.
3. **[NARRATOR]** "The amber star marks the default sender — this is pre-selected automatically when creating an email step in the Workflow Builder."
4. **[HIGHLIGHT]** the Type badges — point to Brand (purple) and Loan Officer (blue).

**Scene 3 — Add a new identity (0:30–0:55)**
1. **[NARRATOR]** "To add a new email address, click Add Identity."
2. **[CLICK]** **+ Add Identity**.
3. **[PAUSE]** — the modal opens.
4. **[CLICK]** the **Display Name** field → **[TYPE]** `"Sarah Chen"`.
5. **[CLICK]** the **Email Address** field → **[TYPE]** `"sarah.chen@loanbud.com"`.
6. **[CLICK]** the **Type** dropdown → **[CLICK]** **Loan Officer**.
7. **[CLICK]** **Save**.
8. **[PAUSE]** — the new row appears in the table.

**Scene 4 — Set as default (0:55–1:05)**
1. **[NARRATOR]** "To make this the default sender, click the star icon on the row."
2. **[CLICK]** the star (☆) on the new identity row.
3. **[PAUSE]** — the star fills amber (★) and the previous default star clears.
4. **[NARRATOR]** "The default switches immediately — no confirmation needed."

**Scene 5 — Voicemail Settings (1:05–1:15)**
1. **[NARRATOR]** "Global voicemail drop settings — like the provider name, phone number, and ringless toggle — are configured in the Voicemail Settings tab."
2. **[CLICK]** the **Voicemail Settings** tab.
3. **[HIGHLIGHT]** the Provider Name and From Phone Number fields.
4. **[HIGHLIGHT]** the Ringless Voicemail and Call Recording toggles.
5. **[NARRATOR]** "Once configured, click Save Settings to apply. These settings apply to all voicemail drops across every workflow."

---

_LoanBud CRM · Phase 1 Prototype · Internal Use Only_
