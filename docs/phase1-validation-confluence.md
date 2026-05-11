## Overview

**Date:** 2026-05-10

**Format:** Observed sessions with 3–5 loan officers and 1–2 managers using the Phase 1 prototype. Note where participants hesitate, take wrong paths, or ask questions. Do not assist unless the participant is fully stuck.

---

## Goals — Key Questions to Answer

The validation sessions are designed to answer these questions before Phase 2 work begins.

| # | Question |
| --- | --- |
| 1 | **Workflow builder** — Does it produce the sequence the designer intended? Can a loan officer build a complete, valid workflow from scratch without external guidance? |
| 2 | **Task queue** — Does it give loan officers what they need to work their daily call list? Is the information surfaced (source, context, priority) enough to act without leaving the screen? |
| 3 | **Segments** — Can loan officers build segments that capture exactly who they intend? Do they trust the filter results before linking a segment to a live workflow? |
| 4 | **Templates** — Is the template library discoverable and fast to navigate? Can a loan officer find and apply the right template in the workflow builder without searching outside the tool? |
| 5 | **Notifications & status signals** — Do they surface problems without requiring manual checking? Does a loan officer know something is wrong before they have to look for it? |
| 6 | **Mental model** — Are the concepts *segment*, *workflow*, *enrollment*, and *step* understood by loan officers without training? Or is a mental-model mismatch causing errors? |

---

## 1a. Workflow Builder — Validation Checklist

### Setup

- [ ] Navigate to the Workflows section from the sidebar without assistance
- [ ] Create a new workflow: give it a name, description, and select a target segment
- [ ] Identify the difference between a draft workflow and an active one

### Step building

- [ ] Add an email step on Day 0 — select a sender identity and an email template
- [ ] Add a 3-day delay after the email step
- [ ] Add a call reminder step with a voicemail script
- [ ] Add an SMS step using an SMS template
- [ ] Reorder two steps by dragging
- [ ] Delete a step
- [ ] Edit the subject of the Day 0 email without leaving the step card

### Review and activate

- [ ] Identify which steps are incomplete before activating
- [ ] Preview what a contact would receive on each day of the sequence
- [ ] Activate the workflow
- [ ] Describe what they believe will happen to a contact enrolled mid-workflow if the workflow is edited

### Questions to ask

- Was any step unclear to configure? What was missing?
- Did "day offset" make sense — did you understand when each step would fire?
- After activating, how confident are you that the right thing will happen?

---

## 1b. Workflow Board — Validation Checklist

### Navigation

- [ ] Open an active workflow and navigate to its board view
- [ ] Identify which contacts are in each step
- [ ] Identify which contacts have been in their current step the longest

### Contact management

- [ ] Open a contact's enrollment detail from a board card
- [ ] Advance a contact manually to the next step
- [ ] Skip the current step for a contact
- [ ] Pause a contact's enrollment
- [ ] Resume a paused enrollment

### Filtering

- [ ] Filter the board to show only contacts assigned to one loan officer
- [ ] Switch between two different workflows on the board

### Questions to ask

- How did you decide which contacts needed attention first?
- Was it clear what the difference is between "skip step" and "pause enrollment"?
- If a contact told you they already received too many emails, how would you handle that here?

---

## 1c. Task Queue — Validation Checklist

### Daily triage

- [ ] Open the task queue and filter to today's tasks only
- [ ] Identify which tasks are overdue
- [ ] Find a task and identify which workflow step it came from

### Completing a task

- [ ] Complete a call task and record both what happened technically (e.g. voicemail) and whether the contact is moving forward
- [ ] Reschedule a task to a different date
- [ ] Bulk-complete three tasks at once

### Creating and assigning

- [ ] Create a manual task for a specific contact
- [ ] (Manager) Reassign a task from one loan officer to another

### Questions to ask

- After completing a call task, what do you feel you still need to do? Is that supported here?
- If you were picking up tasks that were created last week, what context would you need?
- What's the first thing you look at when you open the task queue in the morning?

---

## 1d. Segments — Validation Checklist

### Building a segment

- [ ] Navigate to Segments and create a new segment from scratch
- [ ] Add a filter: "listing status equals New"
- [ ] Add a second filter group with OR logic: "user type equals Broker"
- [ ] Add a specific contact to the "always include" list
- [ ] Check how many contacts match the current filters
- [ ] Save the segment with a meaningful name

### Managing segments

- [ ] Find and edit an existing segment
- [ ] Identify which segments are currently in use by active workflows
- [ ] Explain in their own words what they expect to happen to active enrollments if the segment is edited

### Questions to ask

- Were there filter conditions you wanted to use that weren't available?
- When you saw the contact count, did you trust it? How would you verify it?
- Were there any situations where you'd want the segment membership to *not* change after you save it?

---

## 1e. Configure Templates — Validation Checklist

### Tasks

- [ ] Find and edit an existing email template — change the subject line and body
- [ ] Create a new SMS template
- [ ] Create a new voicemail script
- [ ] In the workflow builder, select an email template for a step
- [ ] In the workflow builder, select a voicemail script for a call step
- [ ] Preview the email template with placeholder variables rendered (e.g. `{{first_name}}`)

### Questions to ask

- When building a workflow step, how do you find the right template quickly?
- Were there any template settings you expected to find but couldn't?
- Did the placeholder variable preview make sense? Were you confident the right contact name would appear?
