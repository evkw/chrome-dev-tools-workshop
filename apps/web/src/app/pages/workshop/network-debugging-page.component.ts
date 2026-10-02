import { Component, inject, OnDestroy, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CurrencyPipe } from '@angular/common';
import { Store } from '@ngxs/store';
import { Invoice } from '../../core/models/invoice';
import { FindInvoices, SetInvoiceFilters } from '../../core/state/invoice.actions';
import { InvoiceState, InvoiceSearchFilters } from '../../core/state/invoice.state';
import { InvoiceOutstandingSummaryComponent } from '../../core/components/invoice-outstanding-summary.component';
import { InvoiceOverdueSummaryComponent } from '../../core/components/invoice-overdue-summary.component';
import { InvoicePaidSummaryComponent } from '../../core/components/invoice-paid-summary.component';
import { InvoiceCountSummaryComponent } from '../../core/components/invoice-count-summary.component';
import { HubConnection, HubConnectionBuilder, HttpTransportType, HubConnectionState } from '@microsoft/signalr';

type Scenario = 'Normal' | '400 Error' | '403 Error' | '500 Error' | 'Duplicate Request' | 'SignalR Request Loop';

@Component({
  selector: 'app-network-debugging-page',
  imports: [FormsModule, CurrencyPipe, InvoiceOutstandingSummaryComponent, InvoiceOverdueSummaryComponent, InvoicePaidSummaryComponent, InvoiceCountSummaryComponent],
  templateUrl: './network-debugging-page.component.html',
  styleUrl: './network-debugging-page.component.css',
})
export class WorkshopPageComponent implements OnDestroy {
  private readonly store = inject(Store);
  protected readonly title = 'Network Debugging';
  protected readonly intro = 'Search invoices and inspect the requests that move data between the browser and the application.';
  protected readonly scenarios: Scenario[] = ['Normal', '400 Error', '403 Error', '500 Error', 'Duplicate Request', 'SignalR Request Loop'];
  protected scenario: Scenario = 'Normal';
  protected filters: InvoiceSearchFilters = { status: 'Outstanding', region: 'AU', dateFrom: '', dateTo: '', client: '' };
  protected invoices = signal<Invoice[]>([]);
  protected loading = signal(false);
  protected error = signal('');
  protected signalRLoopActive = signal(false);
  private signalRLoopRequested = false;

  constructor() {
    this.store.select(InvoiceState.searchResults).subscribe((items) => this.invoices.set(items));
    this.store.select(InvoiceState.searchLoading).subscribe((loading) => this.loading.set(loading));
  }

  protected updateFilters(): void {
    this.store.dispatch(new SetInvoiceFilters({ ...this.filters }));
  }

  protected selectScenario(scenario: Scenario): void {
    const previous = this.scenario;
    this.scenario = scenario;
    if (scenario === 'SignalR Request Loop') {
      this.startSignalRRequestLoop();
      return;
    }
    this.signalRLoopRequested = false;
    this.signalRLoopActive.set(false);
    if (scenario === '400 Error') {
      this.filters = { ...this.filters, dateFrom: '2026-09-30', dateTo: '2026-09-01' };
      this.updateFilters();
    } else if (previous === '400 Error' && this.filters.dateFrom === '2026-09-30' && this.filters.dateTo === '2026-09-01') {
      this.filters = { ...this.filters, dateFrom: '', dateTo: '' };
      this.updateFilters();
    }
  }

  private async startSignalRRequestLoop(): Promise<void> {
    if (this.signalRLoopRequested) return;
    this.signalRLoopRequested = true;
    this.signalRLoopActive.set(true);
    let iteration = 0;
    let connection: HubConnection | undefined;

    while (this.signalRLoopRequested) {
      iteration += 1;
      connection = new HubConnectionBuilder()
        .withUrl(`/hubs/workshop-logs?scenario=SignalR%20Request%20Loop&iteration=${iteration}`, { transport: HttpTransportType.LongPolling })
        .build();
      try {
        await connection.start();
        if (!this.signalRLoopRequested) break;
        await connection.stop();
      } catch {
        // Keep retrying so the repeated negotiate requests remain visible during the exercise.
      }
      await new Promise((resolve) => setTimeout(resolve, 400));
    }

    if (connection && connection.state !== HubConnectionState.Disconnected) await connection.stop();
    this.signalRLoopActive.set(false);
  }

  ngOnDestroy(): void {
    this.signalRLoopRequested = false;
  }

  protected refreshInvoices(): void {
    this.updateFilters();
    this.error.set('');
    const action = new FindInvoices(this.scenario);
    // WORKSHOP: intentionally issue duplicate request
    if (this.scenario === 'Duplicate Request') {
      this.store.dispatch(action).subscribe({ error: () => this.error.set('Unable to load invoices.') });
      this.store.dispatch(action).subscribe({ error: () => this.error.set('Unable to load invoices.') });
    } else {
      this.store.dispatch(action).subscribe({ error: () => this.error.set('Unable to load invoices.') });
    }
  }
}
