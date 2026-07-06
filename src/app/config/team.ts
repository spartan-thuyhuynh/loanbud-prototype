/**
 * Internal-team roster + current-user role — RFC-008 (Tasks Module Enhancements).
 *
 * Per the RFC, task assignees are *internal-team users* (Loan Officers + admin /
 * super-admin), NOT an "LO role" only. This roster is the fallback pool for the
 * bulk-create round-robin and the member pool for named LO groups.
 */

export type TeamRole = "loan_officer" | "admin" | "super_admin";

export interface TeamUser {
  id: string;
  name: string;
  role: TeamRole;
}

/**
 * Demo internal team. Names deliberately span both the task-assignee names used in
 * `taskItems.json` (John Doe / Mike Johnson / Sarah Chen) and the contact
 * loan-officer names used in `contacts.json` (Andy Officer / Sarah Manager / …),
 * so the "assignee follows the contact" model reads consistently everywhere.
 */
export const INTERNAL_USERS: TeamUser[] = [
  { id: "u-john-doe", name: "John Doe", role: "admin" },
  { id: "u-mike-johnson", name: "Mike Johnson", role: "loan_officer" },
  { id: "u-sarah-chen", name: "Sarah Chen", role: "loan_officer" },
  { id: "u-andy-officer", name: "Andy Officer", role: "loan_officer" },
  { id: "u-sarah-manager", name: "Sarah Manager", role: "admin" },
  { id: "u-john-lead", name: "John Lead", role: "loan_officer" },
  { id: "u-maria-broker", name: "Maria Broker", role: "loan_officer" },
];

/** Simulated role of the logged-in user (see CURRENT_USER in featureFlags.ts). */
export const CURRENT_USER_ROLE: TeamRole = "admin";

/** Admin + super-admin can bulk-create tasks and manage LO groups. */
export function canManageTasks(role: TeamRole = CURRENT_USER_ROLE): boolean {
  return role === "admin" || role === "super_admin";
}

export const INTERNAL_USER_NAMES: string[] = INTERNAL_USERS.map((u) => u.name);
