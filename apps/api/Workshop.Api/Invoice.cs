namespace Workshop.Api;

// Keep aligned with libs/shared/models/invoice.ts; these intentionally small contracts are maintained manually.
public sealed class Invoice
{
    public required string Id { get; init; }
    public required string InvoiceNumber { get; init; }
    public required string ClientName { get; init; }
    public required string MatterName { get; init; }
    public required string Status { get; set; }
    public decimal Total { get; init; }
    public decimal AmountDue { get; set; }
    public required string Region { get; init; }
    public DateOnly InvoiceDate { get; init; } = new(2026, 9, 15);
}
public sealed record InvoiceFilter(string? Status, DateOnly? DateFrom, DateOnly? DateTo, string? Region, string? Client);
public sealed record InvoiceUpdate(string Id, string Status, decimal AmountDue);
public sealed class InvoiceStore
{
    public List<Invoice> All { get; } =
    [
        new() { Id="inv-1001", InvoiceNumber="INV-1001", ClientName="Northstar Legal", MatterName="Acquisition review", Status="Outstanding", Total=12800, AmountDue=12800, Region="AU" }, new() { Id="inv-1002", InvoiceNumber="INV-1002", ClientName="Brightwell & Co", MatterName="Commercial lease", Status="Paid", Total=6450, AmountDue=0, Region="UK" },
        new() { Id="inv-1003", InvoiceNumber="INV-1003", ClientName="Redwood Capital", MatterName="Fund restructuring", Status="Overdue", Total=23400, AmountDue=23400, Region="US" }, new() { Id="inv-1004", InvoiceNumber="INV-1004", ClientName="Harbour Health", MatterName="Regulatory advice", Status="Draft", Total=8900, AmountDue=8900, Region="AU" },
        new() { Id="inv-1005", InvoiceNumber="INV-1005", ClientName="Oak & Finch", MatterName="Employment dispute", Status="Outstanding", Total=11250, AmountDue=5250, Region="UK" }, new() { Id="inv-1006", InvoiceNumber="INV-1006", ClientName="Meridian Works", MatterName="IP portfolio", Status="Paid", Total=18750, AmountDue=0, Region="US" },
        new() { Id="inv-1007", InvoiceNumber="INV-1007", ClientName="Civic Grid", MatterName="Infrastructure tender", Status="Outstanding", Total=15700, AmountDue=15700, Region="AU" }, new() { Id="inv-1008", InvoiceNumber="INV-1008", ClientName="Fern & Field", MatterName="Property transfer", Status="Overdue", Total=4200, AmountDue=4200, Region="UK" },
        new() { Id="inv-1009", InvoiceNumber="INV-1009", ClientName="Summit Robotics", MatterName="Series B financing", Status="Paid", Total=31600, AmountDue=0, Region="US" }, new() { Id="inv-1010", InvoiceNumber="INV-1010", ClientName="Blue Lantern", MatterName="Privacy programme", Status="Draft", Total=7200, AmountDue=7200, Region="AU" },
        new() { Id="inv-1011", InvoiceNumber="INV-1011", ClientName="Wattle Financial", MatterName="Loan documentation", Status="Outstanding", Total=9800, AmountDue=9800, Region="AU" }, new() { Id="inv-1012", InvoiceNumber="INV-1012", ClientName="Stonebridge Group", MatterName="Board governance", Status="Paid", Total=5600, AmountDue=0, Region="UK" },
        new() { Id="inv-1013", InvoiceNumber="INV-1013", ClientName="Aster Systems", MatterName="Data centre lease", Status="Overdue", Total=20100, AmountDue=20100, Region="US" }, new() { Id="inv-1014", InvoiceNumber="INV-1014", ClientName="Mariner Labs", MatterName="Vendor negotiations", Status="Outstanding", Total=6800, AmountDue=3400, Region="AU" },
        new() { Id="inv-1015", InvoiceNumber="INV-1015", ClientName="Willow Partners", MatterName="Trust review", Status="Draft", Total=3800, AmountDue=3800, Region="UK" }, new() { Id="inv-1016", InvoiceNumber="INV-1016", ClientName="Atlas & Cole", MatterName="Merger integration", Status="Paid", Total=42600, AmountDue=0, Region="US" }
    ];
    public Invoice? Find(string id) => All.FirstOrDefault(i => i.Id == id);
}
