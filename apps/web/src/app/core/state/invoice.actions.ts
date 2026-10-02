import { Invoice } from '../models/invoice';

export class LoadInvoices {
  static readonly type = '[Invoices] Load invoices';
}

export class SetInvoiceFilters {
  static readonly type = '[Invoices] Set search filters';
  constructor(public readonly filters: import('./invoice.state').InvoiceSearchFilters) {}
}

export class FindInvoices {
  static readonly type = '[Invoices] Find invoices';
  constructor(public readonly scenario: string) {}
}

export class SelectInvoice {
  static readonly type = '[Invoices] Select invoice';
  constructor(public readonly invoiceId: string | null) {}
}

export class UpdateInvoice {
  static readonly type = '[Invoices] Update invoice';
  constructor(public readonly invoice: Invoice) {}
}

export class PayInvoice {
  static readonly type = '[Invoices] Pay invoice';
  constructor(public readonly invoiceId: string) {}
}

export class InvoiceUpdatedFromServer {
  static readonly type = '[Invoices] Updated from server';
  constructor(public readonly update: { id: string; status: string; amountDue: number }) {}
}
