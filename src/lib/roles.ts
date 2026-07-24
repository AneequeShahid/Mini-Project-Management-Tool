import { ROLE_DEFINITIONS } from '@/lib/data';

export type WorkspaceRole = 'owner' | 'admin' | 'manager' | 'member' | 'viewer';

export function getRequestRole(request: Request): WorkspaceRole {
  const role = request.headers.get('x-pulse-role') as WorkspaceRole | null;
  return ROLE_DEFINITIONS.some((item) => item.id === role) ? role! : 'owner';
}

export function can(role: WorkspaceRole, permission: string) {
  if (role === 'owner') return true;
  const definition = ROLE_DEFINITIONS.find((item) => item.id === role);
  return definition?.permissions.includes(permission) ?? false;
}
