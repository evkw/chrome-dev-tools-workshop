import { Injectable, inject } from '@angular/core';
import { Action, Selector, State, StateContext } from '@ngxs/store';
import { finalize, tap } from 'rxjs';
import { InvoiceApiService, InvoiceFilter } from '../services/invoice-api.service';
import { Invoice } from '../models/invoice';
import { FindInvoices, InvoiceUpdatedFromServer, LoadInvoices, PayInvoice, SelectInvoice, SetInvoiceFilters, UpdateInvoice } from './invoice.actions';

export interface InvoiceSearchFilters extends InvoiceFilter { client: string; }

export interface InvoiceStateModel {
  invoices: Invoice[];
  selectedInvoiceId: string | null;
  loading: boolean;
  searchFilters: InvoiceSearchFilters;
  searchResults: Invoice[];
  searchLoading: boolean;
}

@State<InvoiceStateModel>({
  name: 'invoices',
  defaults: { invoices: [], selectedInvoiceId: null, loading: false, searchFilters: { status: 'Outstanding', region: 'AU', dateFrom: '', dateTo: '', client: '' }, searchResults: [], searchLoading: false },
})
@Injectable()
export class InvoiceState {
  private readonly api = inject(InvoiceApiService);

  @Selector()
  static invoices(state: InvoiceStateModel): Invoice[] {
    return state.invoices;
  }

  @Selector()
  static invoiceCount(state: InvoiceStateModel): number {
    return state.invoices.length;
  }

  @Selector()
  static outstandingTotal(state: InvoiceStateModel): number {
    return state.invoices.reduce((total, invoice) => total + invoice.amountDue, 0);
  }

  @Selector()
  static selectedInvoice(state: InvoiceStateModel): Invoice | undefined {
    return state.invoices.find((invoice) => invoice.id === state.selectedInvoiceId);
  }

  @Selector()
  static loading(state: InvoiceStateModel): boolean {
    return state.loading;
  }

  @Selector()
  static searchResults(state: InvoiceStateModel): Invoice[] { return state.searchResults; }

  @Selector()
  static searchLoading(state: InvoiceStateModel): boolean { return state.searchLoading; }

  @Action(SetInvoiceFilters)
  setInvoiceFilters(ctx: StateContext<InvoiceStateModel>, { filters }: SetInvoiceFilters) {
    ctx.patchState({ searchFilters: filters });
  }

  @Action(FindInvoices)
  findInvoices(ctx: StateContext<InvoiceStateModel>, { scenario }: FindInvoices) {
    const { status, region, dateFrom, dateTo, client } = ctx.getState().searchFilters;
    const filter: InvoiceFilter = Object.fromEntries(
      Object.entries({ status, region, dateFrom, dateTo, client }).filter(([, value]) => value !== '' && value !== null && value !== undefined),
    ) as InvoiceFilter;
    ctx.patchState({ searchLoading: true });
    return this.api.findInvoices(filter, scenario).pipe(
      tap((searchResults) => ctx.patchState({ searchResults })),
      finalize(() => ctx.patchState({ searchLoading: false })),
    );
  }

  @Action(LoadInvoices)
  loadInvoices(ctx: StateContext<InvoiceStateModel>) {
    ctx.patchState({ loading: true });
    return this.api.getInvoices().pipe(
      tap((invoices) => ctx.patchState({ invoices, loading: false })),
    );
  }

  @Action(SelectInvoice)
  selectInvoice(ctx: StateContext<InvoiceStateModel>, { invoiceId }: SelectInvoice) {
    ctx.patchState({ selectedInvoiceId: invoiceId });
  }

  @Action(UpdateInvoice)
  updateInvoice(ctx: StateContext<InvoiceStateModel>, { invoice }: UpdateInvoice) {
    const invoices = ctx.getState().invoices.map((item) => item.id === invoice.id ? invoice : item);
    ctx.patchState({ invoices });
  }

  @Action(PayInvoice)
  payInvoice(_: StateContext<InvoiceStateModel>, { invoiceId }: PayInvoice) {
    return this.api.payInvoice(invoiceId);
  }

  @Action(InvoiceUpdatedFromServer)
  invoiceUpdatedFromServer(ctx: StateContext<InvoiceStateModel>, { update }: InvoiceUpdatedFromServer) {
    ctx.patchState({ invoices: ctx.getState().invoices.map((item) => item.id === update.id ? { ...item, status: update.status as Invoice['status'], amountDue: update.amountDue } : item) });
  }
}
