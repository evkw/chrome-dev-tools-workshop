import { CurrencyPipe, PercentPipe } from '@angular/common';
import { Component, signal } from '@angular/core';
import { CalculatedInvoiceLine, InvoiceCalculationResult, InvoiceCalculatorService, InvoiceLineItem } from '../../core/services/invoice-calculator.service';

const INVOICE_LINES: InvoiceLineItem[] = [
  { id: 'LINE-001', description: 'Initial consultation', quantity: 1, unitPrice: 188.944, discountRate: 0, taxable: false },
  { id: 'LINE-002', description: 'Document review', quantity: 1, unitPrice: 48.641, discountRate: 0, taxable: false },
  { id: 'LINE-003', description: 'Contract drafting', quantity: 1, unitPrice: 10, discountRate: 0, taxable: false },
  { id: 'LINE-004', description: 'Client meeting', quantity: 1, unitPrice: 20, discountRate: 0, taxable: false },
  { id: 'LINE-005', description: 'Filing preparation', quantity: 1, unitPrice: 30, discountRate: 0, taxable: false },
];

@Component({
  selector: 'app-breakpoints-page',
  standalone: true,
  imports: [CurrencyPipe, PercentPipe],
  templateUrl: './breakpoints-page.component.html',
  styleUrl: './breakpoints-page.component.css',
})
export class BreakpointsPageComponent {
  protected readonly invoiceNumber = 'INV-2026-1042';
  protected readonly clientName = 'Northstar Legal';
  protected readonly lineItems = INVOICE_LINES;
  protected readonly unroundedSubtotal = this.lineItems.reduce((sum, lineItem) => sum + lineItem.quantity * lineItem.unitPrice, 0);
  private readonly invoiceCalculator = new InvoiceCalculatorService();
  protected readonly result = signal<InvoiceCalculationResult>(this.invoiceCalculator.calculateInvoice(this.lineItems));

  protected calculate(): void {
    const calculation = this.invoiceCalculator.calculateInvoice(this.lineItems);
    this.result.set(calculation);
  }

  protected reset(): void {
    this.calculate();
  }

  protected unitPriceDigits(lineItem: InvoiceLineItem): string {
    return Number.isInteger(lineItem.unitPrice) ? '1.2-2' : '1.3-3';
  }

  protected calculatedLine(lineItem: InvoiceLineItem): CalculatedInvoiceLine | null {
    return this.result()?.lines.find((line) => line.id === lineItem.id) ?? null;
  }
}
