import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Invoice } from '../models/invoice';
export interface InvoiceFilter { status?: string; dateFrom?: string; dateTo?: string; region?: string; client?: string; }

const WORKSHOP_BEARER_TOKEN = 'workshop-demo-token';

@Injectable({ providedIn: 'root' })
export class InvoiceApiService {
  private readonly http = inject(HttpClient);

  getInvoices(): Observable<Invoice[]> {
    return this.http.get<Invoice[]>('/api/invoices');
  }

  getInvoice(id: string): Observable<Invoice> {
    return this.http.get<Invoice>(`/api/invoices/${encodeURIComponent(id)}`);
  }

  payInvoice(id: string): Observable<Invoice> { return this.http.post<Invoice>(`/api/invoices/${encodeURIComponent(id)}/pay`, {}); }
  findInvoices(filter: InvoiceFilter, scenario: string): Observable<Invoice[]> {
    // WORKSHOP: intentionally omit the bearer token for the 403 scenario.
    return this.http.post<Invoice[]>('/api/invoices/find', filter, { headers: {
      'X-Workshop-Scenario': scenario,
      ...(scenario === '403 Error' ? {} : { Authorization: `Bearer ${WORKSHOP_BEARER_TOKEN}` }),
    } });
  }
}
