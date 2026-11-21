enum Permission {
  viewRetailPrice('view_retail_price'),
  viewCostPrice('view_cost_price'),
  createWholesaleBill('create_wholesale_bill'),
  createRetailBill('create_retail_bill'),
  createDraftBill('create_draft_bill'),
  cancelBill('cancel_bill'),
  manageProducts('manage_products'),
  viewStock('view_stock'),
  manageStock('manage_stock'),
  manageDealers('manage_dealers'),
  recordPayments('record_payments'),
  manageStaff('manage_staff'),
  manageStores('manage_stores'),
  viewReports('view_reports'),
  exportData('export_data');

  const Permission(this.key);
  final String key;
}
