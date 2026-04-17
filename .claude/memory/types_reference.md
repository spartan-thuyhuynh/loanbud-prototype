---
name: LoanBudCRM TypeScript types reference
description: All key interfaces and union types from src/app/types/index.ts and campaign/types.ts — updated Apr 2026
type: project
---

**Sources:** `src/app/types/index.ts` and `src/app/components/email-workflows/campaign/types.ts`

## Navigation types

```ts
type MainSection = "applications" | "business-acquisition" | "crm" | "email-workflows" | "users" | "automations" | "questionnaires" | "configurations"
type CRMView = "contacts" | "companies" | "leads" | "deals" | "tickets" | "orders" | "listings" | "segments-lists" | "inbox" | "calls" | "meetings" | "tasks" | "playbooks" | "message-templates" | "snippets"
type EmailWorkflowView = "overview" | "compose" | "campaigns" | "user-segments" | "flow-builder" | "templates" | "history"
type View = MainSection | CRMView | EmailWorkflowView

interface IconNavItem { id: MainSection; label: string; icon: React.ElementType; tooltip: string; hasSubMenu?: boolean }
interface CRMSubItem { id: CRMView; label: string; dividerAfter?: boolean; icon?: React.ElementType; tooltip?: string }
interface EmailWorkflowSubItem { id: EmailWorkflowView; label: string; dividerAfter?: boolean }
```

## Core data interfaces

```ts
interface Contact {
  id: string; firstName: string; lastName: string; email: string; phone: string
  listingName: string; listingStatus: "New" | "Draft" | "Submitted" | "On Hold" | "Declined"
  createAt: Date; userType: "Broker" | "Lender" | "Partner"
  optedOut: boolean; openReminders: number
}

interface EmailRecord {
  id: string; contactId: string; contactName: string; subject: string
  senderIdentity: string; status: "Sent" | "Delivered" | "Opened"
  sequenceDay: number; sentAt: Date
}

interface Task {
  id: string; contactId: string; contactName: string; contactPhone: string
  listingStatus: string; callObjective: string; voicemailScript: string
  dueDay: number; scheduledFor: Date; status: "pending" | "completed"
  disposition?: "Answered" | "VM Left" | "No Answer" | "Not Needed" | string
}

interface Segment {
  id: string; name: string; contactCount: number; status: "Active" | "Inactive"
  lastUpdatedAt: Date; createdBy: string; createdAt: Date; filters: unknown[]
}

interface TaskItem {
  disposition: string
  id: string; contactName: string; contactId: string; contactStatus: string
  taskType: string; source: string; sourceType: "campaign" | "flow" | "manual"
  dueDate: Date; assignee: string; status: "pending" | "completed" | "overdue"
  ruleId?: string; ruleName?: string; triggerContext?: string
  notes?: string; completedAt?: Date; outcome?: string
}
```

## Application types (new)

```ts
type ApplicationStage = "Leads" | "Prequalification Review" | "Completed Initial Application" | "Submitted to Underwriting" | "Requested Prepaid Docs" | "On Hold" | "Withdrawn" | "Funded"
type LoanPurpose = "Start a Business" | "Buy Commercial Real Estate" | "Debt Refinance" | "Equipment Purchase" | "Working Capital"

interface Application {
  id: string; applicationNumber: string; stage: ApplicationStage; loanPurpose: LoanPurpose
  branchName: string; loanOfficerName: string; assigneeName: string
  loanAmount: number; createdAt: Date; updatedAt: Date
}
```

## Business acquisition types (new)

```ts
type BusinessAcquisitionStage = "New Lead" | "Qualified" | "Proposal Sent" | "Negotiation" | "Closed Won" | "Closed Lost" | "On Hold"
type AcquisitionType = "Direct Referral" | "Cold Outreach" | "Partnership" | "Inbound Inquiry" | "Broker Network"

interface BusinessAcquisitionRecord {
  id: string; recordNumber: string; stage: BusinessAcquisitionStage; acquisitionType: AcquisitionType
  branchName: string; agentName: string; assigneeName: string
  dealValue: number; createdAt: Date; updatedAt: Date
}
```

## Campaign types (campaign/types.ts)

```ts
type CampaignStatus = "draft" | "scheduled" | "sent"
type BulkActionType = "create-tasks" | "move-segment" | "remove-segment" | "exclude"

interface Campaign {
  id: string; name: string; segmentId: string; segmentName: string
  templateId: string; templateName: string; status: CampaignStatus
  scheduledFor?: Date; sentAt?: Date; recipientCount: number
  openRate?: number; followUpTasks: FollowUpTask[]
}

interface FollowUpTask { daysAfter: number; taskType: string; description: string }

interface FilterRule {
  field: "listingStatus" | "userType"; operator: "=" | "!="; value: string; logic: "and" | "or"
}

interface FilterGroup { id: string; filters: FilterRule[]; connectorAfter: "and" | "or" }
interface SavedSegment { id: string; name: string; description: string; filters: FilterRule[]; createdAt: Date }

interface EmailTemplate {
  id: string; name: string; subject: string; body: string
  senderType: "brand" | "agent"; category: string; createdAt: Date
}

interface CampaignDetailContact {
  id: string; name: string; email: string; status: string
  engagement: "opened" | "clicked" | "delivered" | "no-response"
  stillInSegment: boolean; driftReason?: string; lastUpdated: Date
}

interface CampaignMetrics {
  id: string; name: string; segmentName: string; sentAt: Date; recipientCount: number
  deliveryRate: number; openRate: number; clickRate: number; noResponseCount: number
}
```
