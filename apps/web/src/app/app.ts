import { Component, inject } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { CdkPortal, CdkPortalOutlet } from '@angular/cdk/portal';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { Store } from '@ngxs/store';
import { LoadInvoices } from './core/state/invoice.actions';
import { InvoiceSignalRService } from './core/services/invoice-signalr.service';
import { BackendActivityPanelComponent } from './core/components/backend-activity-panel.component';
import { WorkshopLogSignalRService } from './core/services/workshop-log-signalr.service';

interface NavigationItem {
  label: string;
  path: string;
  icon: string;
}

@Component({
  selector: 'app-root',
  imports: [AsyncPipe, RouterLink, RouterLinkActive, RouterOutlet, CdkPortal, CdkPortalOutlet, BackendActivityPanelComponent],
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App {
  private readonly store = inject(Store);
  private readonly signalR = inject(InvoiceSignalRService);
  private readonly workshopLogs = inject(WorkshopLogSignalRService);
  protected readonly activityState = this.workshopLogs.connectionState$;
  protected activityPanelOpen = false;

  protected readonly navigation: NavigationItem[] = [
    { label: 'Network Debugging', path: '/network-debugging', icon: '↔' },
    { label: 'Performance', path: '/performance', icon: '◒' },
    { label: 'Console & Snippets', path: '/console-snippets', icon: '>_' },
    { label: 'Breakpoints', path: '/breakpoints', icon: '⊙' },
    { label: 'Environment & Region', path: '/environment-region', icon: '◎' },
    { label: 'DevTools MCP', path: '/devtools-mcp', icon: '✦' },
  ];

  constructor() {
    this.store.dispatch(new LoadInvoices());
    void this.signalR.connect();
    void this.workshopLogs.connect();
  }

  protected toggleActivityPanel(): void { this.activityPanelOpen = !this.activityPanelOpen; }
  protected closeActivityPanel(): void { this.activityPanelOpen = false; }
}
