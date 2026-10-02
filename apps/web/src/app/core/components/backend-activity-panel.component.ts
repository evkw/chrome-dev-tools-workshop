import { AsyncPipe, DatePipe } from '@angular/common';
import { Component, inject, output } from '@angular/core';
import { WorkshopLogSignalRService } from '../services/workshop-log-signalr.service';

@Component({
  selector: 'app-backend-activity-panel',
  imports: [AsyncPipe, DatePipe],
  templateUrl: './backend-activity-panel.component.html',
  styleUrl: './backend-activity-panel.component.css',
})
export class BackendActivityPanelComponent {
  private readonly backendLogs = inject(WorkshopLogSignalRService);
  protected readonly logEntries = this.backendLogs.entries$;
  protected readonly logConnectionState = this.backendLogs.connectionState$;
  readonly closePanel = output<void>();

}
