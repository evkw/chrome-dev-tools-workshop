import { Injectable, inject } from '@angular/core';
import { HubConnection, HubConnectionBuilder, HubConnectionState } from '@microsoft/signalr';
import { Store } from '@ngxs/store';
import { InvoiceUpdatedFromServer } from '../state/invoice.actions';

@Injectable({ providedIn: 'root' })
export class InvoiceSignalRService {
  private readonly store = inject(Store);
  private readonly connection: HubConnection = new HubConnectionBuilder()
    .withUrl('/hubs/invoices')
    .withAutomaticReconnect()
    .configureLogging(2)
    .build();

  async connect(): Promise<void> {
    this.connection.on('InvoiceUpdated', (update: { id: string; status: string; amountDue: number }) => {
      void this.store.dispatch(new InvoiceUpdatedFromServer(update));
    });
    this.connection.onreconnecting((error) => console.warn('Invoice SignalR reconnecting', error));
    this.connection.onreconnected((id) => console.info('Invoice SignalR reconnected', id));
    try { await this.connection.start(); console.info('Invoice SignalR connected'); }
    catch (error) { console.error('Invoice SignalR connection failed', error); }
  }

  get state(): HubConnectionState { return this.connection.state; }
}
