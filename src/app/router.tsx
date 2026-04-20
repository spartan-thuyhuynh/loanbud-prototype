import { createBrowserRouter, Navigate } from "react-router";
import { RootLayout } from "./layouts/RootLayout";
import { CRMLayout } from "./layouts/CRMLayout";
import { EmailWorkflowsLayout } from "./layouts/EmailWorkflowsLayout";
import { ApplicationList, BusinessAcquisitionList } from "./components/applications";
import { ContactList, ContactDetail } from "./components/crm";
import {
  Overview,
  Campaigns,
  FlowBuilder,
  UserSegments,
  SegmentsView,
  TemplatesView,
  EmailHistory,
  ComposeEmail,
  TaskQueue,
  WorkflowList,
  WorkflowBuilder,
  WorkflowBoard,
} from "./components/email-workflows";
import { CampaignDetail } from "./components/email-workflows/CampaignDetail";
import { SegmentDetail } from "./components/email-workflows/SegmentDetail";
import { PlaceholderView } from "./components/ui/PlaceholderView";
import {
  FileText,
  Briefcase,
  User,
  Zap,
  ClipboardList,
  Sliders,
} from "lucide-react";

export const router = createBrowserRouter(
  [
    {
      path: "/",
      element: <RootLayout />,
    children: [
      { index: true, element: <Navigate to="/applications" replace /> },
      { path: "applications", element: <ApplicationList /> },
      { path: "business-acquisition", element: <BusinessAcquisitionList /> },
      { path: "users", element: <PlaceholderView icon={User} title="Users" /> },
      { path: "automations", element: <PlaceholderView icon={Zap} title="Automations" /> },
      { path: "questionnaires", element: <PlaceholderView icon={ClipboardList} title="Questionnaires" /> },
      { path: "configurations", element: <PlaceholderView icon={Sliders} title="Configurations" /> },

      // CRM section
      {
        path: "crm",
        element: <CRMLayout />,
        children: [
          { index: true, element: <Navigate to="/crm/contacts" replace /> },
          { path: "contacts", element: <ContactList /> },
          { path: "contacts/:id", element: <ContactDetail /> },
          { path: "companies", element: <PlaceholderView icon={Briefcase} title="Companies" /> },
          { path: "inbox", element: <PlaceholderView icon={FileText} title="Inbox" /> },
          { path: "calls", element: <PlaceholderView icon={FileText} title="Calls" /> },
          { path: "meetings", element: <PlaceholderView icon={FileText} title="Meetings" /> },
          { path: "tasks", element: <TaskQueue /> },
        ],
      },

      // Email Workflows section
      {
        path: "email-workflows",
        element: <EmailWorkflowsLayout />,
        children: [
          { index: true, element: <Navigate to="/email-workflows/overview" replace /> },
          { path: "overview", element: <Overview /> },
          { path: "campaigns", element: <Campaigns /> },
          { path: "campaigns/:id", element: <CampaignDetail /> },
          { path: "flows", element: <WorkflowList /> },
          { path: "flows/new", element: <WorkflowBuilder /> },
          { path: "flows/:id/edit", element: <WorkflowBuilder /> },
          { path: "flows/:id/board", element: <WorkflowBoard /> },
          { path: "flow-builder", element: <FlowBuilder /> },
          { path: "user-segments", element: <UserSegments /> },
          { path: "user-segments/:id", element: <SegmentDetail /> },
          { path: "user-segments/builder", element: <SegmentsView /> },
          { path: "templates", element: <TemplatesView /> },
          { path: "history", element: <EmailHistory /> },
          { path: "compose", element: <ComposeEmail /> },
          { path: "tasks", element: <TaskQueue /> },
        ],
      },
    ],
  },
  ],
  { basename: "/loanbud-prototype" }
);
