export const ROLE_DEFINITIONS = [
  { id: 'owner', permissions: ['all'] },
  { id: 'admin', permissions: ['members:manage', 'projects:manage', 'performance:view'] },
  { id: 'manager', permissions: ['projects:manage', 'performance:view'] },
  { id: 'member', permissions: [] },
  { id: 'viewer', permissions: [] }
];

export type WorkspaceRole = 'owner' | 'admin' | 'manager' | 'member' | 'viewer';

export function getRequestRole(request: Request): WorkspaceRole {
  const role = request.headers.get('x-pulse-role') as WorkspaceRole | null;
  return ROLE_DEFINITIONS.some((item) => item.id === role) ? (role as WorkspaceRole) : 'owner';
}

export function can(role: WorkspaceRole, permission: string) {
  if (role === 'owner') return true;
  const definition = ROLE_DEFINITIONS.find((item) => item.id === role);
  return definition?.permissions.includes(permission) ?? false;
}
