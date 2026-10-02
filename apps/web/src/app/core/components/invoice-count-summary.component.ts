import { Component, OnInit, inject, signal } from '@angular/core';
import { InvoiceApiService } from '../services/invoice-api.service';

@Component({
  selector: 'app-invoice-count-summary',
  standalone: true,
  template: `
    <article class="summary-card">
      <h2>Total Invoices</h2>
      @if (loading()) { <p class="value">Loading...</p> }
      @else if (error()) { <p class="value">Unable to load</p> }
      @else { <p class="value">{{ count() }}</p> }
    </article>
  `,
  styles: [`.summary-card{height:100%;min-height:112px;padding:17px 18px;border:1px solid #dedede;border-radius:4px;background:#fff}.summary-card h2{font-size:11px;font-weight:600;color:#666}.value{margin-top:15px;color:#262626;font-size:23px;font-weight:600;font-variant-numeric:tabular-nums}`],
})
export class InvoiceCountSummaryComponent implements OnInit {
  private readonly api = inject(InvoiceApiService);
  protected loading = signal(true);
  protected error = signal(false);
  protected count = signal(0);

  ngOnInit(): void {
    this.api.findInvoices({}, 'Normal').subscribe({
      next: (invoices) => { this.count.set(invoices.length); this.loading.set(false); },
      error: () => { this.error.set(true); this.loading.set(false); },
    });
  }
}
