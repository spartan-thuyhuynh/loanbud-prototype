import type React from "react";

export type MainSection =
  | "applications"
  | "business-acquisition"
  | "crm"
  | "email-workflows"
  | "users"
  | "automations"
  | "questionnaires"
  | "configurations";

export type CRMView =
  | "contacts"
  | "companies"
  | "leads"
  | "deals"
  | "tickets"
  | "orders"
  | "listings"
  | "segments-lists"
  | "inbox"
  | "calls"
  | "meetings"
  | "tasks"
  | "playbooks"
  | "message-templates"
  | "snippets";

export type EmailWorkflowView =
  | "overview"
  | "compose"
  | "campaigns"
  | "user-segments"
  | "flow-builder"
  | "templates"
  | "history";

export type View = MainSection | CRMView | EmailWorkflowView;

export interface IconNavItem {
  id: MainSection;
  label: string;
  icon: React.ElementType;
  tooltip: string;
  hasSubMenu?: boolean;
}

export interface CRMSubItem {
  id: CRMView;
  label: string;
  dividerAfter?: boolean;
  icon?: React.ElementType;
  tooltip?: string;
}

export interface EmailWorkflowSubItem {
  id: EmailWorkflowView;
  label: string;
  dividerAfter?: boolean;
}

export interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  listingName: string;
  listingStatus: "New" | "Draft" | "Submitted" | "On Hold" | "Declined";
  createAt: Date;
  userType: "Broker" | "Lender" | "Partner";
  optedOut: boolean;
  openReminders: number;
}

export interface EmailRecord {
  id: string;
  contactId: string;
  contactName: string;
  subject: string;
  senderIdentity: string;
  status: "Sent" | "Delivered" | "Opened";
  sequenceDay: number;
  sentAt: Date;
}

export interface Task {
  id: string;
  contactId: string;
  contactName: string;
  contactPhone: string;
  listingStatus: string;
  callObjective: string;
  voicemailScript: string;
  dueDay: number;
  scheduledFor: Date;
  status: "pending" | "completed";
  disposition?: "Answered" | "VM Left" | "No Answer" | "Not Needed" | string;
}

export interface Segment {
  id: string;
  name: string;
  contactCount: number;
  status: "Active" | "Inactive";
  lastUpdatedAt: Date;
  createdBy: string;
  createdAt: Date;
  filters: unknown[];
}

export interface TaskItem {
  disposition: string;
  id: string;
  contactName: string;
  contactId: string;
  contactStatus: string;
  taskType: string;
  source: string;
  sourceType: "campaign" | "flow" | "manual";
  dueDate: Date;
  assignee: string;
  status: "pending" | "completed" | "overdue";
  ruleId?: string;
  ruleName?: string;
  triggerContext?: string;
  notes?: string;
  completedAt?: Date;
  outcome?: string;
}

export type ApplicationStage =
  | "Leads"
  | "Prequalification Review"
  | "Completed Initial Application"
  | "Submitted to Underwriting"
  | "Requested Prepaid Docs"
  | "On Hold"
  | "Withdrawn"
  | "Funded";

export type LoanPurpose =
  | "Start a Business"
  | "Buy Commercial Real Estate"
  | "Debt Refinance"
  | "Equipment Purchase"
  | "Working Capital";

export interface Application {
  id: string;
  applicationNumber: string;
  stage: ApplicationStage;
  loanPurpose: LoanPurpose;
  branchName: string;
  loanOfficerName: string;
  assigneeName: string;
  loanAmount: number;
  createdAt: Date;
  updatedAt: Date;
}

export type BusinessAcquisitionStage =
  | "New Lead"
  | "Qualified"
  | "Proposal Sent"
  | "Negotiation"
  | "Closed Won"
  | "Closed Lost"
  | "On Hold";

export type AcquisitionType =
  | "Direct Referral"
  | "Cold Outreach"
  | "Partnership"
  | "Inbound Inquiry"
  | "Broker Network";

export interface BusinessAcquisitionRecord {
  id: string;
  recordNumber: string;
  stage: BusinessAcquisitionStage;
  acquisitionType: AcquisitionType;
  branchName: string;
  agentName: string;
  assigneeName: string;
  dealValue: number;
  createdAt: Date;
  updatedAt: Date;
}
