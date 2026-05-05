const AVATAR_COLORS = [
  "bg-blue-500",
  "bg-violet-500",
  "bg-emerald-500",
  "bg-amber-500",
  "bg-rose-500",
  "bg-cyan-500",
  "bg-fuchsia-500",
  "bg-orange-500",
];

export function getAvatarColor(firstName: string, lastName: string): string {
  const code = (firstName.charCodeAt(0) || 0) + (lastName.charCodeAt(0) || 0);
  return AVATAR_COLORS[code % AVATAR_COLORS.length];
}

export function getInitials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}
