### 3a. Conditional Step Branching

#### When to Use Separate Workflows vs. Conditional Branching

These two tools solve different problems. The key rule: **use segments to control who enters a workflow; use branching to control what happens once they're inside, based on what's changed.**

**Use separate segment-targeted workflows when the entire journey differs between groups:**

| Scenario | Approach |
| --- | --- |
| Brokers need a 14-day onboarding; Referral Partners need a 7-day welcome | Two workflows, one segment each — sequences are fundamentally different from step 1 |
| "New" contacts get a qualification sequence; "Declined" contacts get a re-engagement sequence | Two workflows — the goal, tone, and all content differ |
| One-time campaign to a specific group | One workflow, one static snapshot segment — no branching needed |

**Use conditional branching when the same workflow needs to fork mid-sequence based on runtime state:**

| Scenario | Why branching fits |
| --- | --- |
| All brokers enter "New Broker Onboarding." By Day 7 some have moved to "Submitted" status and need a different message than those still "New" | Listing status changed *after* enrollment — a segment filter at entry time couldn't know this would happen |
| Day 3 call completed. If outcome = "Moving forward" → send next-steps email immediately. If voicemail → send SMS and retry call | Branch condition is based on what happened *during the workflow*, not on data that existed at enrollment |
| Re-engagement workflow targets all inactive contacts — both Brokers and Partners. First 13 days are identical; only Day 14 message differs by user type | 90% of the sequence is shared — creating two near-duplicate workflows for one different step adds unnecessary maintenance |

**User story:** *As a workflow designer,* I want to handle the situation where a contact's listing status changes mid-enrollment without removing them from the workflow and manually re-enrolling them in a different one.

---

#### Feature Summary

A new `Conditional` step type in the WorkflowBuilder. The step card shows "IF [field] [operator] [value]" and renders two indented branch lists below it (YES / NO path). Each branch supports all standard step types (email, SMS, delay, call). The condition is evaluated at runtime against the contact's live field values when execution reaches that step — not at enrollment time.

---

#### Implementation Requirements

##### 1. Data model

Extend `WorkflowStep.actionType` with a new value `"conditional"`. A conditional step adds three fields:

| Field | Type | Description |
| --- | --- | --- |
| `condition` | `BranchCondition` | Single rule evaluated at runtime |
| `yesBranch` | `WorkflowStep[]` | Steps executed if the condition is true |
| `noBranch` | `WorkflowStep[]` | Steps executed if the condition is false |

`BranchCondition` shape (reuses `FilterRule` semantics where possible):

| Field | Type | Description |
| --- | --- | --- |
| `field` | enum (see §3) | The contact/enrollment field to evaluate |
| `operator` | enum (see §4) | Comparison operator |
| `value` | `string \| number \| boolean \| null` | Compared value (omitted for unary operators) |

A branch step inherits all existing `WorkflowStep` properties — `id`, `dayOffset`, `actionType`, `templateId`, `outcomeRules`, etc. Branches are ordered lists; `dayOffset` within a branch is *relative to the conditional step*, not the workflow.

After both branches finish (or one is empty), execution returns to the next sibling step of the conditional. The conditional itself is a join point.

##### 2. Builder UX

| Element | Behavior |
| --- | --- |
| Step type picker | New "Conditional" entry alongside Email, SMS, Call, Delay |
| Condition editor | Three-field row: field dropdown → operator dropdown → value input. Value input adapts to field type (text input, number, date picker, boolean toggle, select). |
| YES / NO branch containers | Indented lists rendered side-by-side on desktop, stacked on narrow viewports. Empty branch shows "No steps — contacts skip to next step after conditional." |
| Add step inside branch | Same `+` affordance as the main step list. Step types within branches are unrestricted (email/SMS/call/delay all allowed). |
| Drag and drop | Steps may be dragged within a branch, between branches, or out of the conditional entirely. Cannot drag a conditional inside another conditional in v1 (see §8). |
| Visual highlight | Conditional steps have a distinct card style (e.g., diamond icon, dashed border) so they stand out in the timeline. |
| Collapse/expand | Each conditional has a chevron to collapse its branches when the canvas gets crowded. |

##### 3. Allowed condition fields (v1)

| Field | Source | Type | Notes |
| --- | --- | --- | --- |
| `listingStatus` | Contact | Select | Same enum as `FilterRule.field = "listingStatus"` |
| `userType` | Contact | Select | Same enum as `FilterRule.field = "userType"` |
| `optedOut` | Contact | Boolean | — |
| `lastStepDisposition` | Enrollment runtime | Select | Disposition recorded on the previous call/SMS step in *this* enrollment |
| `lastStepBusinessOutcome` | Enrollment runtime | Select | Business outcome captured on previous task (see §5b) |
| `daysSinceEnrollment` | Enrollment runtime | Number | Computed from `WorkflowEnrollment.startDate` |
| `daysSinceLastActivity` | Enrollment runtime | Number | Days since last `done` step on this enrollment |

Email engagement fields (`emailOpened`, `emailClicked`) are explicitly **out of v1 scope** until delivery-event tracking is integrated — see Open Questions.

##### 4. Allowed operators per field type

| Field type | Operators |
| --- | --- |
| Select | `=`, `!=`, `is empty`, `is not empty` |
| Boolean | `is true`, `is false` |
| Number | `=`, `!=`, `>`, `<`, `>=`, `<=` |

Compound conditions (AND/OR within a single conditional step) are **not supported in v1**. Designers chain conditionals if they need multiple criteria. This keeps the visual representation simple and matches the typical use case.

##### 5. Runtime evaluation

| Rule | Behavior |
| --- | --- |
| When evaluated | At the moment execution reaches the conditional step, not at enrollment time and not when the workflow is edited |
| Data source | Latest contact and enrollment values from `store.ts` at evaluation time |
| Result caching | Evaluation result is recorded on the enrollment as `branchTaken: "yes" \| "no"` for analytics and timeline rendering. Once recorded, the path is locked — re-evaluating later (e.g., after a manual skip) does not switch branches. |
| Field unavailable | If the referenced field is missing or undefined, the condition evaluates to **false** (NO branch). An operator alert is logged ("Conditional in workflow X used unavailable field Y for contact Z"). |
| Empty branch | If the chosen branch has zero steps, execution advances to the next sibling step immediately |

##### 6. Validation (block activation)

A workflow with a conditional step cannot be set to `active` unless:

- [ ] Condition has a field, operator, and (when required) a value
- [ ] Field referenced exists in the current schema
- [ ] Value type matches field type (e.g., number field cannot have text value)
- [ ] At least one of YES / NO branches contains a step *or* the next sibling step exists in the main flow
- [ ] No conditional step is the *very last* step on both branches with empty branches and no follow-up sibling (would create a dead-end enrollment)

Each violation surfaces as a tooltip on the disabled "Activate" button — same pattern as Workflow Builder Polish (§3c).

##### 7. Mid-enrollment edits

When a CRM admin edits a workflow that already has active enrollments, conditional changes follow the same rules as other step edits:

| Change | Effect on in-flight enrollments |
| --- | --- |
| Edit the condition (field/operator/value) | New evaluations use the new condition; enrollments past the conditional are not re-routed |
| Add a step inside an existing branch | Picked up by enrollments still ahead of the conditional |
| Remove a branch's only step | Existing enrollments already on that path skip to the conditional's sibling |
| Delete the entire conditional | Enrollments on either branch resume at the conditional's next sibling |

A confirmation modal lists impacted enrollment counts before saving (matches the existing "edit active workflow" pattern).

##### 8. Out of scope for v1

- Nested conditionals (a conditional inside another conditional's branch). Validation blocks this; UI hides the "Conditional" type when adding a step inside a branch.
- Compound conditions (AND/OR within a single step)
- Email engagement triggers (open / click / bounce) — pending delivery-event integration
- Time-based conditions tied to wall-clock (e.g., "if it's after 5pm Friday, delay until Monday") — this belongs to Wait/Delay, not Conditional
- Branch-to-branch jumping (no GOTO)

##### 9. Analytics

The Workflow Analytics dashboard (§7a) gains:

- **Branch split visualization** — for each conditional step, show YES / NO counts and percentages
- **Per-branch funnel** — enrollment funnel chart can be filtered to "YES path only" or "NO path only" for the selected workflow

##### 10. Acceptance criteria

- [ ] A designer can add a conditional step, set a condition, populate both branches, and activate the workflow
- [ ] An enrollment reaching a conditional with YES result executes only the YES branch's steps
- [ ] An enrollment reaching a conditional with a missing field value executes the NO branch and logs an operator alert
- [ ] After completing a branch, the next sibling step of the conditional fires correctly
- [ ] Validation blocks activation when any branch has an invalid condition
- [ ] WorkflowContactPanel timeline shows which branch was taken with a "Branch: YES" or "Branch: NO" chip on the conditional step row
- [ ] Workflow Analytics shows YES / NO split for each conditional step
