# LoanBud CRM — User Manual

**Phase 1 Prototype · Email Workflows**  
Last updated: May 2026

---

## Table of Contents

1. [Workflows (Flows)](#1-workflows-flows)
   - 1.1 [Viewing & Searching Workflows](#11-viewing--searching-workflows)
   - 1.2 [Creating a Workflow](#12-creating-a-workflow)
   - 1.3 [Editing a Workflow](#13-editing-a-workflow)
   - 1.4 [Workflow Board (Kanban View)](#14-workflow-board-kanban-view)
   - 1.5 [Workflow Contact Panel](#15-workflow-contact-panel)
2. [User Segments](#2-user-segments)
   - 2.1 [Segments List](#21-segments-list)
   - 2.2 [Segment Builder](#22-segment-builder)
   - 2.3 [Segment Detail](#23-segment-detail)
3. [Tasks](#3-tasks)
   - 3.1 [Viewing & Filtering Tasks](#31-viewing--filtering-tasks)
   - 3.2 [Completing a Task](#32-completing-a-task)
   - 3.3 [Rescheduling a Task](#33-rescheduling-a-task)
   - 3.4 [Bulk Actions](#34-bulk-actions)
   - 3.5 [Creating a Manual Task](#35-creating-a-manual-task)
4. [Templates & Configuration](#4-templates--configuration)
   - 4.1 [Email Templates](#41-email-templates)
   - 4.2 [SMS Templates](#42-sms-templates)
   - 4.3 [Voicemail Templates](#43-voicemail-templates)
   - 4.4 [Voicemail Settings](#44-voicemail-settings)
   - 4.5 [Sender Identities](#45-sender-identities)
5. [Appendix: Status & Term Glossary](#5-appendix-status--term-glossary)

---

## 1. Workflows (Flows)

Workflows (also called Flows) are automated multi-step sequences of emails, SMS messages, call reminders, and voicemail drops sent to a defined audience segment. Each workflow runs independently, tracks how far each enrolled contact has progressed, and generates tasks for the team to action.

### 1.1 Viewing & Searching Workflows

> 📹 **Demo Video — Workflows List**
> _Insert screen recording here — `workflows-list.mp4`_

**Path:** `/email-workflows/flows`

**Use case — Browse all workflows:**
1. Click **Email Workflows** in the sidebar, then **Workflows** in the sub-menu.
2. The Flows list shows every workflow in the system.

**Use case — Search workflows:**
1. Type in the search bar at the top of the list.
2. Results filter in real-time by workflow name or target segment name.

**Table columns:**

| Column | Description |
|---|---|
| Workflow Name | Name and optional description |
| Segment | Target audience for this workflow |
| Status | Active / Paused / Draft |
| Steps | Preview of the first 3 step types (+X more) |
| Activated | Date the workflow was last activated |

**Workflow statuses:**

| Status | Meaning |
|---|---|
| Active | Live — enrolled contacts are progressing through steps |
| Paused | Temporarily stopped — no new steps fire |
| Draft | Under construction — not yet activated |

**Use case — Open a workflow's board:**
1. Click any row in the Flows list.
2. The Workflow Board (Kanban view) opens for that workflow.

---

### 1.2 Creating a Workflow

> 📹 **Demo Video — Create a Workflow**
> _Insert screen recording here — `create-workflow.mp4`_

**Path:** `/email-workflows/flows/new`

**Use case — Start a new workflow:**
1. Click **+ New Flow** on the Flows list page.
2. The 2-step Workflow Builder wizard opens.

---

#### Step 1 — Flow Details

| Field | Required | Description |
|---|---|---|
| Flow Name | Yes | Display name shown everywhere in the app |
| Description | No | Optional summary of the workflow's purpose |
| Target Segment | Yes | The audience who will be enrolled |

- Use the segment search dropdown to find a segment by name.
- The number of contacts in each segment is shown next to its name in the dropdown.
- Click **Next** once the name and segment are filled in.

---

#### Step 2 — Configure Steps

The step builder is where you define what happens to enrolled contacts, in what order, and on what schedule.

**Use case — Start from a pre-built template:**
1. Click **Choose Template** in the step builder.
2. Select a template:
   - **Active Sequence** — 11 steps over 14 days (email, call, and SMS mix)
   - **Calls Closed Sequence** — 3-step closing flow (email → call → SMS)
3. The template steps load into the timeline. You can modify any step after loading.

**Use case — Add a step manually:**
1. Click **+ Add Step** at the bottom of the timeline.
2. Choose a step type:
   - **Email** — sends an email from a configured sender identity
   - **SMS** — sends an SMS message
   - **Call Reminder** — creates a call task for the assignee
   - **Voicemail Reminder** — creates a voicemail drop task for the assignee
   - **Delay** — pauses the sequence for a defined period before the next step
3. Fill in the step fields (see tables below).
4. Click **Save Step**.

---

**Email step fields:**

| Field | Description |
|---|---|
| Step Name | Internal label for this step |
| Sender Identity | Which configured email address to send from |
| Template | Choose from the email template library |
| Subject | Auto-filled from the template; editable |
| Body | Auto-filled from the template; editable |
| Day Offset | How many days into the sequence this step fires |

**SMS step fields:**

| Field | Description |
|---|---|
| Step Name | Internal label for this step |
| SMS Template | Choose from the SMS template library |
| Message | Auto-filled from the template; editable |
| Day Offset | Days into the sequence |

**Call Reminder step fields:**

| Field | Description |
|---|---|
| Step Name | Internal label for this step |
| Reminder Days Before | Days before the target date to prompt the assignee |
| Voicemail Script | Script to use if the call goes to voicemail |
| Day Offset | Days into the sequence |

**Voicemail Reminder step fields:**

| Field | Description |
|---|---|
| Step Name | Internal label for this step |
| Voicemail Script | Pre-recorded script to drop |
| Day Offset | Days into the sequence |

**Delay step fields:**

| Field | Description |
|---|---|
| Duration | e.g. `2d 4h 30m` — days, hours, and/or minutes |
| Until Date/Time | Optional — wait until a specific date/time instead of a duration |

---

**Use case — Reorder steps:**
1. Hover over any step card — a drag handle (⠿) appears on the left edge.
2. Click and hold the handle, then drag the card up or down.
3. Release to drop in the new position. Day offsets update automatically.

**Header stats (top of builder):**  
Shows total action step count, max duration in days, and per-channel counts (email / SMS / call icons).

**Use case — Save the workflow:**
1. After configuring all steps, click **Save** or **Save & Activate**.
2. If any step is missing a required template, a warning dialog lists the incomplete steps. Fix them, then save again.
3. Saved with **Save** → status is **Draft**. Saved with **Save & Activate** → status is **Active**.

---

### 1.3 Editing a Workflow

> 📹 **Demo Video — Edit a Workflow**
> _Insert screen recording here — `edit-workflow.mp4`_

**Path:** `/email-workflows/flows/:id/edit`

**Use case — Edit an existing workflow:**
1. From the Flows list, click the **Edit** action (pencil icon) on any row, or navigate directly to the edit URL.
2. The same 2-step wizard opens with all existing values pre-filled.
3. Change the name, segment, or any step configuration.
4. Add new steps, delete existing steps, or reorder steps.
5. Click **Save**.

> **Note:** Editing an Active workflow applies changes to contacts who have not yet reached the modified steps.

---

### 1.4 Workflow Board (Kanban View)

> 📹 **Demo Video — Workflow Board**
> _Insert screen recording here — `workflow-board.mp4`_

**Path:** `/email-workflows/flows/:id/board`

The Workflow Board is a Kanban view showing all enrolled contacts grouped by their current step. It is the primary place to monitor and manage live workflow execution.

**Board layout:**
- Each **column** represents one step in the workflow.
- Contact cards within a column are grouped by scheduled date: **Overdue**, **Today**, **Tomorrow**, future dates.

**Contact card shows:**
- Initials avatar, contact name, listing status badge, user type
- The pending action and its scheduled date/time

---

**Use case — Move a contact to a different step:**
1. Click and drag a contact card.
2. Drop it onto the target step column.
3. The contact's enrollment updates to reflect the new step.

**Use case — Mark a step action complete for a contact:**
1. Find the contact card in the relevant column.
2. Click the action button on the card:
   - Email/SMS steps → **Mark Sent**
   - Call steps → select a disposition (Answered, Left Voicemail, No Answer, etc.)
3. The card moves to the next step automatically.

**Use case — Bulk actions on the board:**
1. Check the checkboxes on multiple contact cards.
2. A bulk action bar appears at the bottom of the screen.
3. Choose **Complete**, **Reschedule**, or **Delete** for all selected cards.

**Use case — Open a contact's enrollment details:**
1. Click on a contact card (not the action button).
2. The **Workflow Contact Panel** slides open on the right.

---

### 1.5 Workflow Contact Panel

> 📹 **Demo Video — Workflow Contact Panel**
> _Insert screen recording here — `workflow-contact-panel.mp4`_

The Workflow Contact Panel shows a single contact's journey through the workflow and gives fine-grained control over their enrollment.

**Panel sections:**

| Section | Contents |
|---|---|
| Contact Info | Name, user type, contact details, opt-out indicator |
| Enrollment Status | Active / Paused / Completed badge |
| Step Timeline | All steps with completion status (done / pending / skipped) |
| Email History | Emails sent to this contact via this workflow |
| Tasks | Workflow-generated tasks for this contact |

---

**Use case — Pause an enrollment:**
1. Open the Workflow Contact Panel for a contact.
2. Click **Pause Enrollment**.
3. Status changes to **Paused**. No further steps fire until resumed.

**Use case — Resume an enrollment:**
1. Open the panel for a paused contact.
2. Click **Resume Enrollment**.
3. Status returns to **Active** and the sequence continues from where it stopped.

**Use case — Skip a step:**
1. In the step timeline, find the step you want to skip.
2. Click the **Skip** action next to that step.
3. The contact advances past that step to the next one in the sequence.

**Use case — Unskip a step:**
1. Find a previously skipped step in the timeline (marked as skipped).
2. Click **Unskip**.
3. The step is restored to pending status.

**Use case — Insert a custom step for one contact:**
1. In the step timeline, click **+ Insert Step** between two existing steps.
2. Configure the step (type, timing, template).
3. Save — the custom step is added only for this contact's enrollment and does not affect other enrolled contacts.

**Use case — Complete an enrollment:**
1. Click **Complete Enrollment** in the panel header.
2. Status changes to **Completed**. The contact is removed from the active board.

---

## 2. User Segments

A Segment is a saved audience definition. It determines which contacts are enrolled in a workflow. Segments are built using filter rules and can also have specific contacts manually pinned in or out.

### 2.1 Segments List

> 📹 **Demo Video — Segments List**
> _Insert screen recording here — `segments-list.mp4`_

**Path:** `/email-workflows/user-segments`

**Use case — Browse all segments:**
1. Click **Email Workflows** in the sidebar, then **Segments** in the sub-menu.
2. The Segments list shows all saved segments.

**Use case — Search segments:**
1. Type in the search bar.
2. The list filters in real-time by segment name.

**Table columns:**

| Column | Description |
|---|---|
| Segment Name | Name with icon |
| Status | Active / Inactive |
| Last Updated | Timestamp of most recent modification |
| Created By | User name and creation date |

**Use case — Bulk export segments:**
1. Check the checkboxes next to one or more segments (or use the header checkbox to select all).
2. A bulk action bar appears at the bottom.
3. Click **Export**.

**Use case — Open segment details:**
1. Click any segment row.
2. The Segment Detail page opens.

---

### 2.2 Segment Builder

> 📹 **Demo Video — Segment Builder**
> _Insert screen recording here — `segment-builder.mp4`_

**Path:** `/email-workflows/user-segments/builder`

The Segment Builder lets you construct audience rules using filters, logical operators, and optional manual contact overrides.

**Builder layout:**
- **Left/centre** — filter group editor
- **Right panel** — live contact preview that updates as you build

---

**Use case — Create a new segment:**
1. Click **+ New Segment** on the Segments list page.
2. The Segment Builder opens with a blank canvas.

**Use case — Add a filter group:**
1. Click **+ Add Filter Group**.
2. A new group row appears.
3. Click **+ Add Filter** inside the group.
4. Select a **field**, **operator**, and **value**:

| Filterable Field | Available Values |
|---|---|
| `listingStatus` | New, Draft, Submitted, On Hold, Declined |
| `userType` | Broker, Lender, Partner |
| `optedOut` | True, False |

Supported operators: `=` (equals), `!=` (not equals).

**Use case — Build AND/OR logic within a group:**
1. Add a second filter to a group.
2. A connector label appears between the two filters showing **AND** or **OR**.
3. Click the connector label to toggle between AND and OR.

**Use case — Build AND/OR logic between groups:**
1. Add a second filter group.
2. A connector label appears between the two groups.
3. Click it to toggle between AND and OR.

**Example rule:**  
`(userType = Broker AND listingStatus != Declined)` **OR** `(userType = Partner)`  
→ Returns all Brokers without a Declined status, plus all Partners.

**Use case — Duplicate a filter group:**
1. Click the **Duplicate** icon on a filter group.
2. An identical group is added below — modify as needed.

**Use case — Remove a filter:**
1. Click the **×** icon on any filter row to remove just that filter.

**Use case — Remove an entire filter group:**
1. Click the trash icon on the group header to delete the group and all its filters.

---

**Use case — Pin specific contacts (always include):**
1. In the **Specific Contacts** section, search for a contact by name.
2. Click **Always Include**.
3. That contact will be in the segment regardless of whether they match the filters.

**Use case — Pin specific contacts (always exclude):**
1. Search for a contact.
2. Click **Always Exclude**.
3. That contact will never appear in the segment even if they match the filters.

**Use case — Toggle a pinned contact between include and exclude:**
1. Find the contact in the pinned contacts section.
2. Use the toggle on their card to switch between **Include** and **Exclude**.

**Live preview panel:**
- Updates in real-time as you add or change filters.
- Shows the total matching contact count.
- Lists the first matching contacts.
- Pinned contacts are highlighted separately from filter matches.

---

**Use case — Save a segment:**
1. Click **Save Segment**.
2. Enter a **Segment Name** (required) and optional **Description**.
3. Click **Confirm**.
4. The segment is saved and appears in the Segments list.

---

### 2.3 Segment Detail

> 📹 **Demo Video — Segment Detail**
> _Insert screen recording here — `segment-detail.mp4`_

**Path:** `/email-workflows/user-segments/:id`

**Use case — View a segment's configuration and contacts:**
1. Click a segment row from the Segments list.
2. The detail page shows:
   - Filter configuration (all rules and logic)
   - Total contact count
   - List of matching contacts
3. Click **Edit** to return to the Segment Builder with this segment pre-loaded.

---

## 3. Tasks

Tasks are action items generated by workflows (or created manually) that prompt a team member to follow up with a contact — typically via call, voicemail, email, or SMS. The Task Queue is the central place to view, prioritise, and complete all outstanding tasks.

**Path:** `/email-workflows/tasks`

### 3.1 Viewing & Filtering Tasks

> 📹 **Demo Video — Task Queue**
> _Insert screen recording here — `task-queue.mp4`_

**Use case — Filter tasks by due date:**
1. Click one of the date filter tabs at the top of the Task Queue:
   - **All** — every task regardless of due date
   - **Today** — tasks due today
   - **This Week** — tasks due within the current week
   - **Overdue** — tasks past their due date and not yet completed

**Use case — Filter tasks by assignee:**
1. Click the **Assignee** filter (multi-select dropdown).
2. Select one or more team members.
3. The list updates to show only tasks assigned to the selected people.

**Use case — Show or hide completed tasks:**
1. Toggle the **Show Completed** switch.
2. When on, completed tasks appear in the list alongside pending ones.

**Use case — Sort the task list:**
1. Click the **Sort** control.
2. Choose from: **Due Date**, **Contact Name**, **Source**.

**Use case — Search tasks:**
1. Type in the search bar.
2. Filters by contact name or source workflow name.

**Task row fields:**

| Field | Description |
|---|---|
| Contact Name | Who the task is for (with listing status badge) |
| Task Type | Call / Email / SMS / Voicemail / Manual |
| Source | Workflow name or "Manual" |
| Due Date | Date the task is due (shown in red if overdue) |
| Assignee | Team member responsible |
| Status | Pending / Completed / Overdue / Suspended |

**Task statuses:**

| Status | Meaning |
|---|---|
| Pending | Upcoming — not yet due or started |
| Overdue | Past due date and not completed |
| Completed | Finished with outcome logged |
| Suspended | On hold because the contact's enrollment is paused |

---

### 3.2 Completing a Task

> 📹 **Demo Video — Complete a Task**
> _Insert screen recording here — `complete-task.mp4`_

**Use case — Complete a single task:**
1. Click on a task row to open the **Task Detail** panel on the right.
2. Review the task details: contact, type, source workflow, due date, notes.
3. For call-type tasks, select a **Disposition**:

| Disposition | When to use |
|---|---|
| Answered | Successfully spoke with the contact |
| Left Voicemail | Manually left a voicemail |
| Drop Voicemail | Used the automated voicemail drop |
| No Answer | Called but no one picked up |
| Not Needed | Task is no longer relevant |

4. Add optional **Notes** about the interaction.
5. Click **Complete Task**.
6. The task is marked done. If the task was part of a workflow, the next step fires (or the workflow applies its outcome rules to decide what happens next).

**Use case — Make an outbound call directly from a task:**
1. Open the Task Detail panel for a call-type task.
2. Click the **Call** button.
3. The Dialer opens pre-filled with the contact's phone number and linked to this task.
4. After the call, log the disposition in the Dialer — the task completes automatically.

---

### 3.3 Rescheduling a Task

> 📹 **Demo Video — Reschedule a Task**
> _Insert screen recording here — `reschedule-task.mp4`_

**Use case — Reschedule a single task:**
1. Open the Task Detail panel for the task.
2. Click **Reschedule**.
3. Pick a new due date from the date picker.
4. Confirm — the task's due date updates and it remains in **Pending** status.

---

### 3.4 Bulk Actions

> 📹 **Demo Video — Bulk Task Actions**
> _Insert screen recording here — `bulk-task-actions.mp4`_

**Use case — Select multiple tasks:**
1. Check the checkbox on individual task rows, or check the **header checkbox** to select all visible tasks.
2. A bulk action bar appears at the bottom of the page showing the number of selected tasks.

**Use case — Bulk complete tasks:**
1. Select the tasks you want to complete.
2. Click **Complete** in the bulk action bar.
3. All selected tasks are marked as completed. Disposition defaults are applied automatically.

**Use case — Bulk reschedule tasks:**
1. Select the tasks you want to reschedule.
2. Click **Reschedule** in the bulk action bar.
3. Pick a new due date — the same date is applied to all selected tasks.

**Use case — Bulk delete tasks:**
1. Select the tasks you want to remove.
2. Click **Delete** in the bulk action bar.
3. Confirm the deletion. The tasks are permanently removed.

---

### 3.5 Creating a Manual Task

> 📹 **Demo Video — Create a Manual Task**
> _Insert screen recording here — `create-manual-task.mp4`_

Manual tasks are not tied to a workflow step — they are one-off follow-up actions created ad hoc.

**Use case — Create a manual task from the Task Queue:**
1. Click **+ New Task** in the top-right corner of the Tasks page.
2. Search for and select a **Contact**.
3. Choose a **Task Type** (Call, Email, SMS, Voicemail, or Other).
4. Set a **Due Date**.
5. Optionally assign to a specific team member and add notes.
6. Click **Save**.
7. The task appears in the queue with source listed as **Manual**.

**Use case — Create a manual task from a Contact Detail page:**
1. Open a contact (`/crm/contacts/:id`).
2. Click **+ New Task** in the left panel.
3. Fill in the same fields as above.
4. Save — the task appears both in the Tasks tab on the contact's profile and in the Task Queue.

---

## 4. Templates & Configuration

Templates are the reusable content blocks — email bodies, SMS messages, and voicemail scripts — that workflow steps draw from. Sender Identities are the outbound email addresses those steps send on behalf of. Both are managed from the **Templates** page under Email Workflows.

**Path:** `/email-workflows/templates`

---

### 4.1 Email Templates

> 📹 **Demo Video — Email Templates**
> _Insert screen recording here — `email-templates.mp4`_

**Layout:** Two-column — scrollable template list on the left, detail panel on the right.

**Use case — Browse and select a template:**
1. Click **Email Workflows** in the sidebar, then **Configuration** (or **Templates**) in the sub-menu.
2. The Email Templates tab is open by default.
3. Click any template name in the left sidebar to view its details on the right.
4. The detail panel shows the template name, category badge, sender type, subject line, full body, and any detected variables highlighted as `{{variable}}` badges.

**Use case — Create a new email template:**
1. Click **+ New Template** at the top of the left sidebar.
2. Fill in the modal form:

| Field | Required | Description |
|---|---|---|
| Template Name | Yes | Internal display name |
| Category | Yes | e.g. Initial Outreach, Follow-up, Nurture, Re-engagement, Custom |
| Sender Type | Yes | Brand or Loan Officer |
| Subject Line | Yes | Email subject |
| Body | Yes | Full email body — use `{{variable_name}}` to insert personalisation tokens |

3. Variables are detected automatically from the subject and body and shown as badges at the bottom of the form.
4. Click **Save** — the template appears in the sidebar list.

**Use case — Edit a template:**
1. Select the template in the sidebar.
2. Click the **Edit** button in the detail panel header.
3. The modal opens with all current values pre-filled.
4. Make changes and click **Save**.
5. A confirmation overlay ("Save changes?") appears — click **Confirm** to overwrite, or **Cancel** to go back.

**Use case — Delete a template:**
1. Select the template in the sidebar.
2. Click **Delete** in the detail panel header.
3. An inline "Delete?" confirmation appears — click **Yes** to permanently remove the template.

**Use case — Manage categories:**
1. Click **Template Categories** in the left sidebar header.
2. The Category Manager modal opens showing all current categories.
3. To **add** a category: type the name in the input at the bottom and click **Add**.
4. To **rename**: hover over a category row, click the pencil icon, edit the name, then press **Enter** or click away.
5. To **delete**: hover over the row, click the trash icon, and confirm. Templates in that category become "Uncategorised".

---

### 4.2 SMS Templates

> 📹 **Demo Video — SMS Templates**
> _Insert screen recording here — `sms-templates.mp4`_

**Layout:** Identical two-column layout to Email Templates.

**Use case — Browse SMS templates:**
1. Click the **SMS Templates** tab at the top of the page.
2. The left sidebar lists all SMS templates with a character count shown on each card (e.g. "64 chars").
3. Click a template to view its message body, character count, segment count, and detected variables in the detail panel.

> **SMS segments:** A single SMS message is 160 characters. Messages longer than 160 characters are split into multiple segments and billed accordingly. The character and segment count updates live as you type.

**Use case — Create a new SMS template:**
1. Click **+ New Template**.
2. Fill in the modal form:

| Field | Required | Description |
|---|---|---|
| Template Name | Yes | Internal display name |
| Category | Yes | e.g. Follow-up, Reminder, Appointment, Alert, Custom |
| Message | Yes | SMS body — use `{{variable_name}}` for personalisation tokens |

3. The character counter and segment count (e.g. "64 chars · 1 segment") update live as you type the message.
4. Click **Save**.

**Use case — Edit and delete SMS templates:**
Same flow as Email Templates — select in sidebar → Edit or Delete from detail panel header.

**Use case — Manage SMS categories:**
Same flow as Email Templates — click **Template Categories** in the sidebar header.

---

### 4.3 Voicemail Templates

> 📹 **Demo Video — Voicemail Templates**
> _Insert screen recording here — `voicemail-templates.mp4`_

**Layout:** Two-column with a **Record / Script** type toggle at the top of the left sidebar.

There are two sub-types of voicemail template:

| Type | Description |
|---|---|
| **Record** | A pre-recorded audio file (.mp3, .wav, or .m4a) with an optional written transcript. The recording is played when the voicemail drop fires. |
| **Script** | A written script with no audio file. Used by the team member as a guide when leaving a manual voicemail. |

**Use case — Switch between records and scripts:**
1. Click the **Voicemail Templates** tab.
2. Use the **Record / Script** toggle at the top of the left sidebar to switch views.
3. The sidebar list updates to show only items of the selected type.

**Use case — View a voicemail record:**
1. Select **Record** in the toggle.
2. Click a record in the sidebar.
3. The detail panel shows: name, category, duration (e.g. "22s"), an audio player to preview the recording, and the transcript text with any detected `{{variable}}` badges.

**Use case — View a voicemail script:**
1. Select **Script** in the toggle.
2. Click a script in the sidebar.
3. The detail panel shows: name, category, the full script text, and any detected variable badges.

**Use case — Create a new voicemail record:**
1. With **Record** selected, click **+ New Record**.
2. Fill in the modal form:

| Field | Required | Description |
|---|---|---|
| Record Name | Yes | Internal display name |
| Category | Yes | e.g. Initial Outreach, Follow-up, Re-engagement, Custom |
| Audio File | No | Upload an .mp3, .wav, or .m4a file — duration is calculated automatically |
| Transcript | No | Word-for-word text of the recording |

3. Click **Save**.

**Use case — Create a new voicemail script:**
1. With **Script** selected, click **+ New Script**.
2. Fill in the modal form:

| Field | Required | Description |
|---|---|---|
| Script Name | Yes | Internal display name |
| Category | Yes | Select a category |
| Script | Yes | The script text to read aloud when leaving the voicemail |

3. Click **Save**.

**Use case — Edit and delete voicemail templates:**
Select in sidebar → **Edit** or **Delete** from the detail panel header. Editing a record allows swapping or removing the audio file.

---

### 4.4 Voicemail Settings

> 📹 **Demo Video — Voicemail Settings**
> _Insert screen recording here — `voicemail-settings.mp4`_

**Layout:** Single-column settings form — no sidebar.

Voicemail Settings configure the global system behaviour for voicemail drops. These are system-wide settings, not per-template.

**Use case — Configure voicemail settings:**
1. Click the **Voicemail Settings** tab.
2. Update the fields as needed:

| Field | Description |
|---|---|
| Provider Name | The voicemail drop service being used (e.g. Slybroadcast) |
| From Phone Number | The caller ID shown to recipients — use E.164 format (e.g. +15105551234) |
| Default Greeting | Short intro text played before the voicemail drop (e.g. "Hi, you have a message from LoanBud.") |
| Ringless Voicemail | Toggle on to deliver voicemails without the recipient's phone ringing |
| Call Recording | Toggle on to record calls made through the system |

3. Click **Save Settings** — a confirmation toast confirms the settings were updated.

---

### 4.5 Sender Identities

> 📹 **Demo Video — Sender Identities**
> _Insert screen recording here — `sender-identities.mp4`_

**Layout:** Single-column table — no sidebar.

Sender Identities are the email addresses that appear in the "From" field when workflow email steps fire. Each identity has a display name, email address, type, and an optional default flag.

**Use case — Browse sender identities:**
1. Click the **Sender Identities** tab.
2. The table lists all configured identities.

**Table columns:**

| Column | Description |
|---|---|
| Name | Display name shown to recipients (e.g. "LoanBud Team") |
| Email | The outbound email address |
| Type | Brand (purple badge) or Loan Officer (blue badge) |
| Default | Amber star — filled if this identity is the system default |

**Use case — Add a new sender identity:**
1. Click **+ Add Identity**.
2. Fill in the modal:

| Field | Required | Description |
|---|---|---|
| Display Name | Yes | Name shown to email recipients (e.g. "LoanBud Team") |
| Email Address | Yes | The outbound email address |
| Type | Yes | Brand or Loan Officer |

3. Click **Save** — the identity appears in the table.

**Use case — Set an identity as the default:**
1. Click the star icon (☆) on any row.
2. The star fills amber (★) immediately — no confirmation required.
3. The previous default is automatically unset.
4. The default identity is pre-selected when creating a new email step in the Workflow Builder.

**Use case — Edit a sender identity:**
1. Click the pencil icon on the row you want to update.
2. The modal opens pre-filled with the current values.
3. Make changes and click **Save**.

**Use case — Delete a sender identity:**
1. Click the trash icon on the row.
2. An inline "Delete?" confirmation appears — click **Yes** to remove the identity.

> **Note:** Deleting an identity that is currently used by active workflow steps may cause those steps to send without a valid sender. Review active workflows before deleting.

---

## 5. Appendix: Status & Term Glossary

### Workflow Statuses

| Status | Meaning |
|---|---|
| Active | Live — enrolled contacts are progressing through steps |
| Paused | Temporarily stopped — no new steps fire |
| Draft | Under construction — not yet activated |

### Enrollment Statuses

| Status | Meaning |
|---|---|
| Active | Contact is progressing through the workflow |
| Paused | Contact's progression is temporarily halted |
| Completed | Contact has finished all steps |

### Task Statuses

| Status | Meaning |
|---|---|
| Pending | Upcoming and not yet due or started |
| Overdue | Past due date and not completed |
| Completed | Finished with outcome logged |
| Suspended | On hold because the enrollment is paused |

### Task Dispositions (Call Tasks)

| Disposition | Meaning |
|---|---|
| Answered | Successfully spoke with the contact |
| Left Voicemail | Manually left a voicemail message |
| Drop Voicemail | Used the automated voicemail drop feature |
| No Answer | Called but no response |
| Not Needed | Task is no longer relevant |

### Segment Statuses

| Status | Meaning |
|---|---|
| Active | Segment is in use — can be selected for workflows |
| Inactive | Segment is archived and not available for new workflows |

### Workflow Step Types

| Type | What it does |
|---|---|
| Email | Sends an email from a configured sender identity |
| SMS | Sends an SMS message |
| Call Reminder | Creates a task prompting the assignee to call the contact |
| Voicemail Reminder | Creates a task prompting the assignee to drop a voicemail |
| Delay | Pauses the sequence for a specified duration before the next step |

### Filterable Segment Fields

| Field | Values |
|---|---|
| `listingStatus` | New, Draft, Submitted, On Hold, Declined |
| `userType` | Broker, Lender, Partner |
| `optedOut` | True, False |

---

_LoanBud CRM · Phase 1 Prototype · Internal Use Only_
