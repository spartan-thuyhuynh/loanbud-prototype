# LoanBud CRM — Phase 1 Product Requirements

## TL;DR

Phase 1 gives the admin team full manual control over outbound communication. They can group contacts into segments using filters, send emails to those groups using pre-written or custom content, and track follow-up calls through a task queue. Every email and call outcome is recorded in a shared history. Nothing is automated — every action is deliberate and human-initiated.

---

## Why we are starting here

Phase 1 is about proving the process before automating it. Before any workflow runs on its own, the team needs to:

- Decide which contacts to reach out to and why
- Test which email messages get responses
- Understand what follow-up cadence actually works
- Build confidence that the segmentation logic is correct
- Have a complete, auditable record of every action taken

By the end of Phase 1, the team will have a validated communication process that Phase 2 can automate with confidence.

---

## How the features connect

The four features form a simple chain:

**Segment Builder** groups the right contacts → **Compose & Send** sends them an email → **Call Reminders** keeps agents on track with follow-ups → **Email History** shows everything that was sent.

A fifth concern — **Suppression** — runs silently across all features to make sure opted-out or bounced contacts are never contacted.

---

## Feature 1 — Segment Builder

**What it does:** Let the team filter contacts by any combination of properties and save that group as a named segment they can reuse for future sends.

### Building a segment

The team can filter contacts by any of the following:

- **Listing status** — e.g. Active, Pending, Closed
- **User type** — e.g. Buyer, Seller, Agent
- **Opt-out status** — include only contacts who have not opted out
- **Lifecycle stage** — e.g. New Lead, Nurture, Ready to Transact
- **Pipeline stage** — e.g. Initial Contact, Offer Made, Under Contract
- **Document status** — e.g. Docs Requested, Docs Received, Incomplete
- **Stale date** — contacts who have not had activity since a given date

Multiple filters can be combined. The builder shows a live count of how many contacts currently match before the segment is saved.

### Managing saved segments

All saved segments appear in a list view. Each row shows the segment name, the number of matching contacts, and the date it was last used for a send.

From this list, the team can:

- **Edit** a segment — opens the builder with the existing filters loaded; saving updates the segment in place without creating a duplicate
- **Delete** a segment — removes it from the list
- **Toggle active or inactive** — inactive segments are retained for reference but cannot be selected as send recipients

---

## Feature 2 — Compose & Send

**What it does:** Pick who gets the email, write the message, preview it with real contact data, and send.

### Step 1 — Choose recipients

Recipients can be selected in one of two ways:

- **By segment** — select a saved segment; all active, non-suppressed contacts in that segment will receive the email
- **Manually** — search and select individual contacts by name

### Step 2 — Choose sender identity

Every email is sent as either:

- **Brand Voice** — the email appears to come from the company (LoanBud)
- **Agent** — the email appears to come from a named agent on the team

This choice is recorded on every send and used for future reporting.

### Step 3 — Write the email

The team writes a subject line and email body. Two personalisation tags are available:

- `{{first_name}}` — replaced with the contact's first name
- `{{listing_name}}` — replaced with the contact's associated listing address

A **live preview** shows the email as it will appear to a real recipient, with all tags replaced by actual values from the first matching contact in the recipient list.

### Step 4 — Review before sending

Before the email goes out, a summary screen shows:

- Total contacts matched
- How many will receive the email
- How many are suppressed (opted out or bounced)
- How many are skipped for any other reason

If the same segment was sent to within the last 24 hours, a warning is shown. The sender can choose to proceed or cancel.

### Step 5 — Send or schedule

The team can:

- **Send immediately** — emails go out right away
- **Schedule for later** — pick a future date and time; the send is queued until that moment

Every outgoing email has an unsubscribe link automatically appended to the bottom of the body.

### After sending

After a send completes, the view redirects to Email History, pre-filtered to show only the emails from that send batch.

---

## Feature 3 — Call Reminders

**What it does:** Automatically create and manually manage follow-up call tasks so agents never miss a touchpoint.

### Automatic task creation on send

When an **opening email** is sent to a segment, call reminder tasks are automatically created for the assigned agent at:

- Day 0 — call immediately after the email goes out
- Day 3 — three days after the send
- Day 7 — one week after the send
- Day 14 — two weeks after the send

When a **closure email** is sent (e.g. for a declined or closed listing), only a short-window task is created — 1 to 2 days after the send. The full 14-day set is not appropriate for a closing sequence.

### Manual task creation

Agents can create a call reminder from any contact's detail page at any time, independent of an email send. This covers situations like an inbound call, a referral, or a custom follow-up cadence.

### What each task shows

Every call reminder card displays:

- Contact name and phone number
- Associated listing and listing status
- Call objective (what the agent is trying to accomplish)
- Voicemail script instructions (what to say if there is no answer)
- Assignee (which agent the task is assigned to)
- Due date

### Acting on a task

Agents manage their tasks from a shared task queue. From the queue they can:

- **Complete a task** — must select a disposition before completing:
  - Answered
  - Voicemail left
  - No answer
  - Not interested
  - Follow up scheduled
- **Add notes** — optional free-text notes recorded alongside the disposition
- **Reschedule** — move the due date; the original due date is preserved in the record
- **Cancel** — remove the task without logging a disposition

### Task queue behaviour

- Tasks are sorted with the most urgent at the top
- Tasks that are past their due date are visually highlighted in the queue
- The assignee for each task is visible in the queue list

---

## Feature 4 — Email History

**What it does:** A complete, read-only log of every email sent. Agents and admins can look up any past send, check its delivery status, and filter to find exactly what they need.

### What is recorded

Every email send creates one row in the history table. Each row shows:

- Recipient name and email address
- Email subject
- Sender identity (Brand Voice or agent name)
- Segment used (if sent to a segment; blank for manual sends)
- Sequence day (day 0, 3, 7, or 14 — if part of a cadence)
- Date and time sent
- Delivery status: Queued → Delivered → Opened
- Bounce status (if the email could not be delivered)

### Filtering

The history table can be filtered by:

- Delivery status
- Sender identity type (Brand Voice or agent)
- Segment
- Sequence day
- Date range

### Post-send redirect

After a send completes, the team is taken directly to Email History with the filter pre-set to show only that send batch. This makes it easy to verify what went out immediately after a send.

The history is read-only. No email can be edited, resent, or deleted from this view.

---

## Suppression Rules

Suppression runs automatically across all sends. No one on the team needs to manage it manually — the system enforces it.

Two categories of contacts are always suppressed:

- **Opted out** — the contact has unsubscribed or been marked as opted out
- **Bounced** — a previous email to this contact was undeliverable (hard bounce)

Suppressed contacts appear in the pre-send summary count so the team knows how many contacts were excluded and why.

### Managing opt-out status

A contact's opt-out status can be toggled from their contact detail page. Admins can re-opt a contact in if the contact requests it.

Every outgoing email includes an unsubscribe link. When a contact clicks it, their opt-out status is set immediately and they are excluded from all future sends.

---

## Use Cases

### UC-01 — Start a follow-up sequence for a group of contacts

**Who:** Sales or marketing team member

A listing has just gone active. The team wants to reach out to all buyer contacts who are in the nurture stage and have not yet been emailed this week.

They open the Segment Builder, filter by listing status = Active, user type = Buyer, and lifecycle stage = Nurture. The builder shows 34 matching contacts. They save it as "Active Buyers — Nurture."

They go to Compose & Send, select that segment, choose Brand Voice as the sender identity, write the email, and insert `{{first_name}}` and `{{listing_name}}` into the body. The live preview shows how it will look for the first contact. The pre-send summary shows 34 matched, 31 will receive, 3 suppressed. They send immediately.

The system creates call reminder tasks for the assigned agent at day 0, 3, 7, and 14. The team is redirected to Email History filtered to that send batch.

---

### UC-02 — Agent works through their call queue and logs outcomes

**Who:** Agent

The agent opens the task queue at the start of their day. They see 5 open tasks, 2 of which are highlighted as overdue.

They work through the list. For each call, they open the task card to see the contact's phone number, listing details, and the call objective. After each call, they mark the task complete and select a disposition — "Answered," "Voicemail left," or "No answer." For one contact who said they are no longer interested, they select "Not interested" and add a short note.

All outcomes are saved to the task record and visible in the contact's history.

---

### UC-03 — Send a mid-sequence follow-up email to a specific contact

**Who:** Agent

An agent just had a call with a contact who asked for more information about a specific listing. They want to send a personal follow-up email right away, not wait for the next batch send.

They open Compose & Send, select the contact manually by name, choose their own name as the sender identity, and write a short personal message. The send goes out immediately and is logged in Email History with their name as the sender.

---

### UC-04 — Handle a contact's reply to a campaign email

**Who:** Agent

A contact replies to a campaign email directly in their personal inbox. The CRM does not detect inbound replies — agents handle all responses outside the system.

After speaking with the contact, the agent opens the contact's detail page in the CRM, creates a manual call reminder for 2 days from now with the note "Follow up on listing interest after reply," and logs the conversation outcome as a note on the contact.

---

### UC-05 — Create a standalone call reminder for an inbound referral

**Who:** Agent

A colleague passes along a referral — a contact not yet in an active sequence. The agent wants to call them tomorrow.

They find the contact in the CRM, open their detail page, and create a manual call reminder for tomorrow. They set the call objective and save. The task appears in the queue alongside all other open reminders.

---

### UC-06 — Send a closure email after a listing is declined

**Who:** Sales or marketing team member

A listing has been declined and the team wants to send a polite closing message to the contacts associated with it.

They open Compose & Send, select the relevant contacts (either by segment or manually), choose the sender identity, and write the closure email. The pre-send summary confirms the recipient count.

They send the email. Because this is a closure send, the system creates only a short 1–2 day follow-up task — not the full 14-day cadence — since the sequence is wrapping up, not starting.

---

## What is out of scope for Phase 1

The following will be addressed in Phase 2:

- **Automated sequences** — emails triggered automatically when a contact's status changes
- **Workflow branching** — different follow-up paths based on call disposition or email opens
- **Inbound email detection** — the system does not read or parse replies; agents log responses manually
- **A/B testing** — all sends use a single message per batch
- **Open and click tracking** — delivery status is simulated; real tracking requires email infrastructure
- **Webhooks** — unsubscribe and bounce handling in Phase 1 is managed via UI; live webhooks are a Phase 2 concern
