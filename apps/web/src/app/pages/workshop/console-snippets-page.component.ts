import { CurrencyPipe } from '@angular/common';
import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Invoice } from '../../core/models/invoice';

const WORKSHOP_BEARER_TOKEN = 'workshop-demo-token';

@Component({
  selector: 'app-console-snippets-page',
  standalone: true,
  imports: [FormsModule, CurrencyPipe],
  templateUrl: './console-snippets-page.component.html',
  styleUrl: './console-snippets-page.component.css',
})
export class ConsoleSnippetsPageComponent {
  protected client = '';
  protected readonly invoices = signal<Invoice[]>([]);
  protected readonly loading = signal(false);
  protected readonly error = signal('');

  protected searchInvoices(): void {
    void this.loadInvoices();
  }

  protected refreshInvoices(): void {
    void this.loadInvoices();
  }

  private async loadInvoices(): Promise<void> {
    if (this.loading()) return;
    this.loading.set(true);
    this.error.set('');
    try {
      const response = await window.fetch('/api/invoices/find', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${WORKSHOP_BEARER_TOKEN}`,
        },
        body: JSON.stringify({ client: this.client.trim(), status: '', region: '' }),
      });
      if (!response.ok) throw new Error(`Invoice search returned ${response.status}`);
      this.invoices.set(await response.json() as Invoice[]);
    } catch {
      this.error.set('Unable to load invoices. Check the API and try again.');
    } finally {
      this.loading.set(false);
    }
  }
}
