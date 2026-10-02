import { CurrencyPipe, DatePipe, DecimalPipe } from '@angular/common';
import { Component, ElementRef, QueryList, ViewChildren, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Invoice } from '../../core/models/invoice';

type PerformanceScenario = 'JavaScript / CPU' | 'Rendering / Paint';

// Tune these fixed workloads before presenting if the machine is significantly faster or slower.
const CPU_ITERATIONS = 70_000_000;
const RENDER_ROW_COUNT = 400;
const RENDER_PASSES = 1;

const SAMPLE_INVOICES: Invoice[] = [
  { id: 'INV-1042', invoiceNumber: 'INV-1042', clientName: 'Northstar Legal', matterName: 'Commercial lease review', status: 'Outstanding', total: 4850, amountDue: 4850, region: 'AU', invoiceDate: '2026-09-10' },
  { id: 'INV-1043', invoiceNumber: 'INV-1043', clientName: 'Willow & Co', matterName: 'Employment advice', status: 'Paid', total: 2200, amountDue: 0, region: 'AU', invoiceDate: '2026-09-12' },
  { id: 'INV-1044', invoiceNumber: 'INV-1044', clientName: 'Harbour Group', matterName: 'Property settlement', status: 'Overdue', total: 7350, amountDue: 7350, region: 'UK', invoiceDate: '2026-08-18' },
  { id: 'INV-1045', invoiceNumber: 'INV-1045', clientName: 'Cedar Health', matterName: 'Regulatory filing', status: 'Outstanding', total: 1640, amountDue: 1640, region: 'US', invoiceDate: '2026-09-15' },
  { id: 'INV-1046', invoiceNumber: 'INV-1046', clientName: 'Summit Finance', matterName: 'Contract negotiation', status: 'Paid', total: 3925, amountDue: 0, region: 'AU', invoiceDate: '2026-09-17' },
  { id: 'INV-1047', invoiceNumber: 'INV-1047', clientName: 'Juniper Studio', matterName: 'IP portfolio review', status: 'Overdue', total: 2875, amountDue: 2875, region: 'UK', invoiceDate: '2026-08-29' },
];

@Component({
  selector: 'app-performance-page',
  standalone: true,
  imports: [FormsModule, CurrencyPipe, DatePipe, DecimalPipe],
  templateUrl: './performance-page.component.html',
  styleUrl: './performance-page.component.css',
})
export class PerformancePageComponent {
  @ViewChildren('invoiceRow', { read: ElementRef }) private invoiceRows!: QueryList<ElementRef<HTMLTableRowElement>>;

  protected readonly scenarios: PerformanceScenario[] = ['JavaScript / CPU', 'Rendering / Paint'];
  protected scenario: PerformanceScenario = 'JavaScript / CPU';
  protected readonly cpuDescription = 'Refreshing the dashboard causes the application to become unresponsive.';
  protected readonly renderingDescription = 'Updating the invoice display causes excessive browser rendering work.';
  protected readonly demoInvoices = SAMPLE_INVOICES;
  protected readonly renderingInvoices = this.createRenderingInvoices();
  protected readonly renderingTotals = this.calculateInvoiceTotals(this.renderingInvoices);
  protected readonly totals = signal(this.calculateInvoiceTotals(SAMPLE_INVOICES));
  protected readonly lastRefreshed = signal(new Date());
  protected readonly expanded = signal(false);
  protected readonly rendering = signal(false);

  protected selectScenario(scenario: PerformanceScenario): void {
    this.scenario = scenario;
    this.expanded.set(false);
  }

  protected refreshDashboard(): void {
    this.totals.set(this.recalculateDashboardTotals());
    this.lastRefreshed.set(new Date());
  }

  // WORKSHOP: intentionally expensive CPU work for the Performance demo.
  protected recalculateDashboardTotals(): DashboardTotals {
    let result = this.calculateInvoiceTotals(this.demoInvoices);
    for (let iteration = 0; iteration < CPU_ITERATIONS; iteration += 1) {
      result = this.calculateInvoiceTotals(this.demoInvoices);
      this.calculateOutstandingBalance(this.demoInvoices);
      this.calculatePaidBalance(this.demoInvoices);
      this.calculateOverdueBalance(this.demoInvoices);
    }
    return result;
  }

  protected calculateInvoiceTotals(invoices: Invoice[]): DashboardTotals {
    let outstanding = 0;
    let paid = 0;
    let overdue = 0;
    let invoiceCount = 0;
    for (const invoice of invoices) {
      invoiceCount += 1;
      if (invoice.status === 'Paid') paid += invoice.total;
      if (invoice.status === 'Outstanding') outstanding += invoice.amountDue;
      if (invoice.status === 'Overdue') overdue += invoice.amountDue;
    }
    return { invoiceCount, outstanding, paid, overdue };
  }

  protected calculateOutstandingBalance(invoices: Invoice[]): number {
    return invoices.reduce((total, invoice) => total + (invoice.status === 'Outstanding' ? invoice.amountDue : 0), 0);
  }

  protected calculatePaidBalance(invoices: Invoice[]): number {
    return invoices.reduce((total, invoice) => total + (invoice.status === 'Paid' ? invoice.total : 0), 0);
  }

  protected calculateOverdueBalance(invoices: Invoice[]): number {
    return invoices.reduce((total, invoice) => total + (invoice.status === 'Overdue' ? invoice.amountDue : 0), 0);
  }

  protected updateInvoiceDisplay(): void {
    if (this.rendering()) return;
    this.rendering.set(true);
    this.expanded.set(false);
    // Wait for Angular to render the collapsed state before the intentionally layout-thrashing passes.
    setTimeout(() => this.runRenderingPass(0), 80);
  }

  private runRenderingPass(pass: number): void {
    const rows = this.invoiceRows.toArray().map((row) => row.nativeElement);
    for (let currentPass = pass; currentPass < RENDER_PASSES; currentPass += 1) {
      for (const [index, row] of rows.entries()) {
        // WORKSHOP: intentionally interleaving DOM writes and layout reads to force repeated layout.
        row.classList.toggle('details-expanded', currentPass === RENDER_PASSES - 1 || (currentPass + index) % 2 === 0);
        row.style.paddingTop = `${10 + ((currentPass + index) % 4) * 3}px`;
        const firstLayout = row.offsetHeight;
        row.style.minWidth = `${firstLayout + 560 + ((currentPass + index) % 3) * 12}px`;
        row.getBoundingClientRect();
        row.style.borderBottomWidth = `${1 + ((currentPass + index) % 3)}px`;
        row.offsetWidth;
      }
    }
    this.expanded.set(true);
    this.rendering.set(false);
  }

  private createRenderingInvoices(): Invoice[] {
    const invoices: Invoice[] = [];
    for (let index = 0; index < RENDER_ROW_COUNT; index += 1) {
      const source = SAMPLE_INVOICES[index % SAMPLE_INVOICES.length];
      invoices.push({
        ...source,
        id: `${source.id}-${index}`,
        invoiceNumber: `INV-${String(1042 + index).padStart(4, '0')}`,
        clientName: `${source.clientName} ${Math.floor(index / SAMPLE_INVOICES.length) + 1}`,
      });
    }
    return invoices;
  }
}

interface DashboardTotals {
  invoiceCount: number;
  outstanding: number;
  paid: number;
  overdue: number;
}
