// usePermissions.ts — Granular permission enforcement hook
// Owner always has full access. Admin access is gated by user.permissions from /api/me.
//
// Module key reference:
//   Master Data:  'products' | 'categories' | 'warehouses' | 'suppliers' | 'customers' | 'sales_reps'
//   Transaksi:    'transactions.purchase' | 'transactions.cash_sale' | 'transactions.credit_sale'
//                 'transactions.payable' | 'transactions.receivable'
//                 'transactions.return_purchase' | 'transactions.return_sale'
//                 'transactions.delivery_note' | 'transactions.kontra_bon'
//   Pengaturan:   'settings'
//
// Actions: 'view' | 'create' | 'update' | 'delete' | 'print'
import { useAuth } from '@/contexts/AuthContext';

export type PermissionModule =
  | 'products'
  | 'categories'
  | 'warehouses'
  | 'suppliers'
  | 'customers'
  | 'sales_reps'
  | 'transactions.purchase'
  | 'transactions.cash_sale'
  | 'transactions.credit_sale'
  | 'transactions.payable'
  | 'transactions.receivable'
  | 'transactions.return_purchase'
  | 'transactions.return_sale'
  | 'transactions.delivery_note'
  | 'transactions.kontra_bon'
  | 'settings'
  | string; // allow forward-compat

export type PermissionAction = 'view' | 'create' | 'update' | 'delete' | 'print';

/**
 * Central permission hook. Owner always has full access.
 * Admin access is determined by user.permissions[module][action].
 *
 * Usage:
 *   const { canCreate, canEdit, canDelete, canView, canPrint, hasPermission, isOwner } = usePermissions();
 *   if (canCreate('products')) <AddButton />
 *   if (canView('transactions.delivery_note')) <MenuItem />
 */
export const usePermissions = () => {
  const { user, isOwner } = useAuth();

  /**
   * Base check: owner always passes, admin checks user.permissions.
   * Special key '__owner_only__' is always false for non-owners.
   */
  const hasPermission = (module: PermissionModule, action: PermissionAction): boolean => {
    if (module === '__owner_only__') return isOwner;
    if (isOwner) return true;
    return user?.permissions?.[module]?.[action] === true;
  };

  /** Can the user VIEW this module? (also used for sidebar visibility) */
  const canView = (module: PermissionModule): boolean =>
    hasPermission(module, 'view');

  /** Can the user CREATE records in this module? */
  const canCreate = (module: PermissionModule): boolean =>
    hasPermission(module, 'create');

  /** Can the user EDIT/UPDATE records in this module? */
  const canEdit = (module: PermissionModule): boolean =>
    hasPermission(module, 'update');

  /** Can the user DELETE records in this module? */
  const canDelete = (module: PermissionModule): boolean =>
    hasPermission(module, 'delete');

  /** Can the user PRINT documents from this module? */
  const canPrint = (module: PermissionModule): boolean =>
    hasPermission(module, 'print');

  /**
   * Can user perform any write action on a module?
   * Useful for showing "action available" indicators.
   */
  const canWrite = (module: PermissionModule): boolean =>
    canCreate(module) || canEdit(module) || canDelete(module);

  /**
   * Check if the user can view hidden transactions.
   * Only owner can toggle visibility — this is a business rule, not a permission.
   */
  const canViewHiddenTransactions = (): boolean => isOwner;

  /**
   * Check if the user can hide/unhide transactions.
   * Only owner can toggle visibility — this is a business rule, not a permission.
   */
  const canHideTransactions = (): boolean => isOwner;

  return {
    hasPermission,
    canView,
    canCreate,
    canEdit,
    canDelete,
    canPrint,
    canWrite,
    canViewHiddenTransactions,
    canHideTransactions,
    isOwner,
  };
};
