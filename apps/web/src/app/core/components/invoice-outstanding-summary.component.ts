import { CurrencyPipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { Invoice } from '../models/invoice';
import { InvoiceApiService } from '../services/invoice-api.service';

@Component({
  selector: 'app-invoice-outstanding-summary',
  standalone: true,
  imports: [CurrencyPipe],
  template: `
    <article class="summary-card">
      <h2>Outstanding Balance</h2>
      @if (loading()) { <p class="value">Loading...</p> }
      @else if (error()) { <p class="value">Unable to load</p> }
      @else { <p class="value">{{ total() | currency:'USD':'symbol':'1.0-0' }}</p><p class="detail">{{ invoices().length }} invoices</p> }
    </article>
  `,
  styles: [`.summary-card{height:100%;min-height:112px;padding:17px 18px;border:1px solid #dedede;border-radius:4px;background:#fff}.summary-card h2{font-size:11px;font-weight:600;color:#666}.value{margin-top:15px;color:#262626;font-size:23px;font-weight:600;font-variant-numeric:tabular-nums}.detail{margin-top:4px;color:#777;font-size:11px}`],
})
export class InvoiceOutstandingSummaryComponent implements OnInit {
  private readonly api = inject(InvoiceApiService);
  protected invoices = signal<Invoice[]>([]);
  protected loading = signal(true);
  protected error = signal(false);
  protected total = signal(0);

  ngOnInit(): void {
    this.load();
  }

  private load(): void {
    this.loading.set(true);
    this.api.findInvoices({ status: 'Outstanding' }, 'Normal').subscribe({
      next: (invoices) => { this.invoices.set(invoices); this.total.set(invoices.reduce((sum, invoice) => sum + invoice.amountDue, 0)); this.loading.set(false); },
      error: () => { this.error.set(true); this.loading.set(false); },
    });
  }
}
