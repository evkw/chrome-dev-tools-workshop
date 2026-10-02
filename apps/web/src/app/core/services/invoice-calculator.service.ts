export interface InvoiceLineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  discountRate: number;
  taxable: boolean;
}

export interface CalculatedInvoiceLine extends InvoiceLineItem {
  baseAmount: number;
  discount: number;
  tax: number;
  total: number;
}

export interface InvoiceCalculationResult {
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  lines: CalculatedInvoiceLine[];
}

const TAX_RATE = 0.1;

export class InvoiceCalculatorService {
  calculateInvoice(lineItems: InvoiceLineItem[]): InvoiceCalculationResult {
    const calculatedLines = this.calculateLineItems(lineItems);
    const subtotal = this.sumSubtotal(calculatedLines);
    const discount = this.sumDiscount(calculatedLines);
    const tax = this.sumTax(calculatedLines);
    const total = subtotal - discount + tax;

    return { subtotal, discount, tax, total, lines: calculatedLines };
  }

  private calculateLineItems(lineItems: InvoiceLineItem[]): CalculatedInvoiceLine[] {
    const calculatedLines: CalculatedInvoiceLine[] = [];

    for (const lineItem of lineItems) {
      const calculatedLine = this.calculateLineItem(lineItem);
      calculatedLines.push(calculatedLine);
    }

    return calculatedLines;
  }

  private calculateLineItem(lineItem: InvoiceLineItem): CalculatedInvoiceLine {
    const baseAmount = lineItem.quantity * lineItem.unitPrice;
    const discountedAmount = this.applyDiscount(baseAmount, lineItem.discountRate);
    const discount = this.roundMoney(baseAmount - discountedAmount);
    const tax = lineItem.taxable ? this.calculateTax(discountedAmount) : 0;
    const total = this.roundMoney(discountedAmount + tax);

    // Set the breakpoint here to inspect all locals, or use lineItem.id === 'LINE-001'.
    return {
      ...lineItem,
      baseAmount,
      discount,
      tax,
      total,
    };
  }

  private applyDiscount(amount: number, discountRate: number): number {
    const discountedAmount = this.roundMoney(amount * (1 - discountRate));
    return discountedAmount;
  }

  private calculateTax(taxableAmount: number): number {
    const tax = this.roundMoney(taxableAmount * TAX_RATE);
    return tax;
  }

  private sumSubtotal(lines: CalculatedInvoiceLine[]): number {
    let subtotal = 0;
    for (const line of lines) {
      subtotal += line.baseAmount;
    }
    return this.roundMoney(subtotal);
  }

  private sumDiscount(lines: CalculatedInvoiceLine[]): number {
    let discount = 0;
    for (const line of lines) discount += line.discount;
    return this.roundMoney(discount);
  }

  private sumTax(lines: CalculatedInvoiceLine[]): number {
    let tax = 0;
    for (const line of lines) tax += line.tax;
    return this.roundMoney(tax);
  }

  private roundMoney(amount: number): number {
    return Math.round(amount * 100) / 100;
  }
}
