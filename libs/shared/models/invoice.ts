// Keep aligned with Invoice.cs in Workshop.Api; these intentionally small contracts are maintained manually.
export type InvoiceStatus = 'Draft' | 'Outstanding' | 'Paid' | 'Overdue';
export type Region = 'AU' | 'UK' | 'US';
export interface Invoice {
  id: string;
  invoiceNumber: string;
  clientName: string;
  matterName: string;
  status: InvoiceStatus;
  total: number;
  amountDue: number;
  region: Region;
  invoiceDate: string;
}
