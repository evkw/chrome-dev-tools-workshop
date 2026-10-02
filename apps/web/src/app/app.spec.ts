import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideStore } from '@ngxs/store';
import { App } from './app';
import { routes } from './app.routes';
import { InvoiceState } from './core/state/invoice.state';

describe('App shell', () => {
  it('creates with the application providers', async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRouter(routes), provideStore([InvoiceState])],
    }).compileComponents();

    const fixture = TestBed.createComponent(App);

    expect(fixture.componentInstance).toBeTruthy();
  });
});
