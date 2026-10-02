import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

type McpClient = 'codex' | 'claude';

@Component({
  selector: 'app-workshop-page',
  templateUrl: './workshop-page.component.html',
  styleUrl: './workshop-page.component.css',
})
export class WorkshopPageComponent {
  private readonly route = inject(ActivatedRoute);
  protected readonly title = this.route.snapshot.data['title'] as string;
  protected readonly intro = this.route.snapshot.data['intro'] as string;
  protected readonly icon = this.route.snapshot.data['icon'] as string;
  protected selectedMcpClient: McpClient = 'codex';

  protected selectMcpClient(client: McpClient): void {
    this.selectedMcpClient = client;
  }

  protected onMcpTabKeydown(event: KeyboardEvent): void {
    let nextClient: McpClient | undefined;
    switch (event.key) {
      case 'ArrowLeft':
      case 'Home':
        nextClient = 'codex';
        break;
      case 'ArrowRight':
      case 'End':
        nextClient = 'claude';
        break;
      default:
        return;
    }

    event.preventDefault();
    this.selectMcpClient(nextClient);
    document.getElementById(`mcp-tab-${nextClient}`)?.focus();
  }
}
