import { Injectable } from '@angular/core';
import { HubConnection, HubConnectionBuilder, HubConnectionState } from '@microsoft/signalr';
import { BehaviorSubject } from 'rxjs';

export interface WorkshopLogEntry {
  timestamp: string;
  level: 'Information' | 'Warning' | 'Error';
  message: string;
  requestId: string;
  scenario: string;
}

@Injectable({ providedIn: 'root' })
export class WorkshopLogSignalRService {
  private readonly entries = new BehaviorSubject<WorkshopLogEntry[]>([]);
  private readonly connectionState = new BehaviorSubject('Connecting');
  readonly entries$ = this.entries.asObservable();
  readonly connectionState$ = this.connectionState.asObservable();
  private readonly connection: HubConnection = new HubConnectionBuilder()
    .withUrl('/hubs/workshop-logs')
    .withAutomaticReconnect()
    .build();
  private started = false;

  async connect(): Promise<void> {
    if (this.started || this.connection.state !== HubConnectionState.Disconnected) return;
    this.started = true;
    this.connection.on('BackendLog', (entry: WorkshopLogEntry) => {
      this.entries.next([entry, ...this.entries.value].slice(0, 30));
    });
    this.connection.onreconnecting(() => this.connectionState.next('Reconnecting'));
    this.connection.onreconnected(() => this.connectionState.next('Connected'));
    this.connection.onclose(() => {
      this.started = false;
      this.connectionState.next('Disconnected');
    });
    try {
      await this.connection.start();
      this.connectionState.next('Connected');
    } catch {
      this.started = false;
      this.connectionState.next('Disconnected');
    }
  }
}
