import { ChangeDetectionStrategy, Component, OnDestroy, signal } from '@angular/core';

const TENANT_TIME_ZONE = 'America/New_York';

@Component({
  selector: 'app-environment-region-page',
  standalone: true,
  templateUrl: './environment-region-page.component.html',
  styleUrl: './environment-region-page.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EnvironmentRegionPageComponent implements OnDestroy {
  protected readonly now = signal(Date.now());
  protected readonly serverAnchor = signal(Date.now());
  protected readonly monotonicAnchor = signal(performance.now());
  protected readonly serverError = signal('');
  protected readonly browserTimeZone = signal(this.getBrowserTimeZone());
  protected readonly browserOffset = signal(this.getBrowserOffset());
  protected readonly browserLanguage = signal(navigator.language);
  private readonly ticker = window.setInterval(() => this.tick(), 1000);

  constructor() {
    void this.syncServerTime();
  }

  ngOnDestroy(): void {
    window.clearInterval(this.ticker);
  }

  protected async syncServerTime(): Promise<void> {
    const requestStartedAt = performance.now();
    try {
      const response = await fetch('/api/environment/time');
      if (!response.ok) throw new Error(`Server returned ${response.status}`);
      const result = (await response.json()) as { serverTimeUtc: string };
      this.serverAnchor.set(Date.parse(result.serverTimeUtc));
      this.monotonicAnchor.set(requestStartedAt + (performance.now() - requestStartedAt) / 2);
      this.serverError.set('');
    } catch {
      this.serverError.set('Server time is unavailable. Check that the workshop API is running.');
    }
  }

  protected serverInstant(): Date {
    return new Date(this.serverAnchor() + (performance.now() - this.monotonicAnchor()));
  }

  protected browserInstant(): Date { return new Date(this.now()); }

  protected formatTime(instant: Date, timeZone: string, showZone = false): string {
    return new Intl.DateTimeFormat(undefined, {
      timeZone,
      hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23',
      timeZoneName: showZone ? 'short' : undefined,
    }).format(instant);
  }

  private tick(): void {
    this.now.set(Date.now());
    const timeZone = this.getBrowserTimeZone();
    const offset = this.getBrowserOffset();
    if (timeZone !== this.browserTimeZone()) this.browserTimeZone.set(timeZone);
    if (offset !== this.browserOffset()) this.browserOffset.set(offset);
  }

  private getBrowserTimeZone(): string { return Intl.DateTimeFormat().resolvedOptions().timeZone || 'Unknown'; }

  private getBrowserOffset(): string {
    const minutes = -new Date().getTimezoneOffset();
    const sign = minutes >= 0 ? '+' : '-';
    const absolute = Math.abs(minutes);
    return `${sign}${String(Math.floor(absolute / 60)).padStart(2, '0')}:${String(absolute % 60).padStart(2, '0')}`;
  }

}
