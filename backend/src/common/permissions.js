export const Roles = Object.freeze({ ADMIN: 'admin', STAFF: 'staff' });

export const Permissions = Object.freeze({
  VIEW_RETAIL_PRICE: 'view_retail_price',
  VIEW_COST_PRICE: 'view_cost_price',
  CREATE_WHOLESALE_BILL: 'create_wholesale_bill',
  CREATE_RETAIL_BILL: 'create_retail_bill',
  CREATE_DRAFT_BILL: 'create_draft_bill',
  CANCEL_BILL: 'cancel_bill',
  MANAGE_PRODUCTS: 'manage_products',
  VIEW_STOCK: 'view_stock',
  MANAGE_STOCK: 'manage_stock',
  MANAGE_DEALERS: 'manage_dealers',
  RECORD_PAYMENTS: 'record_payments',
  MANAGE_STAFF: 'manage_staff',
  MANAGE_STORES: 'manage_stores',
  VIEW_REPORTS: 'view_reports',
  EXPORT_DATA: 'export_data'
});

export const allPermissions = Object.values(Permissions);
export const staffGrantablePermissions = [
  Permissions.CREATE_WHOLESALE_BILL,
  Permissions.CREATE_DRAFT_BILL,
  Permissions.VIEW_STOCK,
  Permissions.MANAGE_STOCK,
  Permissions.MANAGE_DEALERS,
  Permissions.RECORD_PAYMENTS
];
export const defaultStaffPermissions = [
  Permissions.CREATE_WHOLESALE_BILL,
  Permissions.CREATE_DRAFT_BILL,
  Permissions.VIEW_STOCK,
  Permissions.MANAGE_DEALERS
];

export function effectivePermissions(role, stored = []) {
  if (role === Roles.ADMIN) return allPermissions;
  const allowed = new Set(staffGrantablePermissions);
  return stored.filter((permission) => allowed.has(permission));
}
