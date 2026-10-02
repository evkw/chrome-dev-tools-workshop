import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { withNgxsLoggerPlugin } from '@ngxs/logger-plugin';
import { provideStore } from '@ngxs/store';
import { provideHttpClient } from '@angular/common/http';
import { routes } from './app.routes';
import { InvoiceState } from './core/state/invoice.state';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideHttpClient(),
    provideRouter(routes, withComponentInputBinding()),
    provideStore([InvoiceState], withNgxsLoggerPlugin({ disabled: false })),
  ],
};
