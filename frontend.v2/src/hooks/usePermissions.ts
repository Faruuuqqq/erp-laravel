// usePermissions.ts — Granular permission enforcement hook
// Owner always has full access. Admin access is gated by user.permissions from /api/me.
import { useAuth } from '@/contexts/AuthContext';

/**
 * Returns a helper to check if the current user has a specific module+action permission.
 *
 * Usage:
 *   const { hasPermission, isOwner } = usePermissions();
 *   if (!hasPermission('supplier', 'delete')) return null;
 */
export const usePermissions = () => {
  const { user, isOwner } = useAuth();

  const hasPermission = (module: string, action: string): boolean => {
    if (isOwner) return true;
    return user?.permissions?.[module]?.[action] === true;
  };

  /**
   * Check if the user can view hidden transactions.
   * Only owner can see hidden by default. In the future this can be a granular permission.
   */
  const canViewHiddenTransactions = (): boolean => {
    return isOwner;
  };

  /**
   * Convenience: can user perform any write action on a module?
   */
  const canWrite = (module: string): boolean => {
    return hasPermission(module, 'create') &&
           hasPermission(module, 'edit') &&
           hasPermission(module, 'delete');
  };

  return {
    hasPermission,
    canViewHiddenTransactions,
    canWrite,
    isOwner,
  };
};
