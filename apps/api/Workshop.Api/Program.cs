using Microsoft.AspNetCore.SignalR;
using Workshop.Api;

var builder = WebApplication.CreateBuilder(args);
const string WorkshopBearerToken = "workshop-demo-token"; // WORKSHOP: demonstration-only hard-coded bearer token.
builder.Services.AddSignalR();
builder.Services.AddSingleton<InvoiceStore>();
var app = builder.Build();

app.MapGet("/api/environment/time", () => Results.Ok(new { serverTimeUtc = DateTime.UtcNow }));
app.MapGet("/api/invoices", (InvoiceStore store) => Results.Ok(store.All));
app.MapGet("/api/invoices/{id}", (string id, InvoiceStore store) =>
    store.Find(id) is { } invoice ? Results.Ok(invoice) : Results.NotFound());
app.MapPost("/api/invoices/find", async (InvoiceFilter filter, InvoiceStore store, HttpContext http, ILogger<Program> logger, IHubContext<WorkshopLogHub> logHub) =>
{
    var requestId = Guid.NewGuid().ToString("N");
    var scenario = http.Request.Headers["X-Workshop-Scenario"].ToString();
    http.Response.Headers["X-Request-Id"] = requestId;
    http.Response.Headers["X-Region"] = filter.Region ?? "All";
    http.Response.Headers["Server-Timing"] = scenario switch
    {
        "400 Error" => "validation;dur=20, search;dur=0",
        "403 Error" => "authorization;dur=10, search;dur=0",
        "500 Error" => "validation;dur=10, search;dur=400",
        _ => "validation;dur=10, search;dur=200"
    };
    Task PublishLog(string level, string message) => logHub.Clients.All.SendAsync("BackendLog", new WorkshopLogEntry(DateTimeOffset.UtcNow, level, message, requestId, scenario));
    logger.LogInformation("Invoice search started for {RequestId} ({Scenario})", requestId, scenario);
    await PublishLog("Information", $"Invoice search started · {scenario}");
    await Task.Delay(scenario switch { "400 Error" or "403 Error" => 200, "500 Error" => 500, _ => 300 });

    // WORKSHOP: missing bearer token produces a generic 403 response for this scenario.
    if (scenario == "403 Error" && string.IsNullOrWhiteSpace(http.Request.Headers.Authorization))
    {
        logger.LogWarning("Invoice search rejected for {RequestId}", requestId);
        await PublishLog("Warning", "Invoice search request rejected");
        return Results.Problem(title: "Request failed", statusCode: StatusCodes.Status403Forbidden, detail: "The request could not be completed.");
    }

    if (http.Request.Headers.Authorization != $"Bearer {WorkshopBearerToken}")
    {
        http.Response.Headers.WWWAuthenticate = "Bearer";
        logger.LogWarning("Invoice search authentication failed for {RequestId}", requestId);
        await PublishLog("Warning", "Invoice search rejected: bearer token missing or invalid");
        return Results.Problem(title: "Unauthorized", statusCode: StatusCodes.Status401Unauthorized, detail: "A valid bearer token is required.");
    }

    if (filter.DateFrom is not null && filter.DateTo is not null && filter.DateFrom >= filter.DateTo)
    {
        logger.LogWarning("Invoice filter rejected for {RequestId}: dateFrom must be before dateTo", requestId);
        await PublishLog("Warning", "Invoice filter rejected: dateFrom must be before dateTo");
        return Results.Problem(title: "Invalid invoice filter", statusCode: StatusCodes.Status400BadRequest, detail: "dateFrom must be before dateTo");
    }

    if (scenario == "500 Error")
    {
        try
        {
            throw new InvalidOperationException("Workshop scenario: invoice search processing failed.");
        }
        catch (Exception exception)
        {
            logger.LogError(exception, "Invoice search failed for request {RequestId}", requestId);
            await PublishLog("Error", $"Invoice search failed: {exception.Message}");
            return Results.Problem(title: "Invoice search failed", statusCode: StatusCodes.Status500InternalServerError, detail: "An unexpected error occurred while processing the invoice search.");
        }
    }

    var matches = store.All.Where(i => (filter.Status is null || filter.Status == "" || i.Status == filter.Status) &&
        (filter.Region is null || filter.Region == "" || i.Region == filter.Region) &&
        (filter.DateFrom is null || i.InvoiceDate >= filter.DateFrom) &&
        (filter.DateTo is null || i.InvoiceDate <= filter.DateTo) &&
        (filter.Client is null || filter.Client == "" || i.ClientName.Contains(filter.Client, StringComparison.OrdinalIgnoreCase)));
    var results = matches.ToArray();
    logger.LogInformation("Invoice search completed for {RequestId} with {ResultCount} results", requestId, results.Length);
    await PublishLog("Information", $"Invoice search completed · {results.Length} results");
    return Results.Ok(results);
});
app.MapPost("/api/invoices/{id}/pay", async (string id, InvoiceStore store, IHubContext<InvoiceHub> hub, ILogger<Program> logger) =>
{
    var invoice = store.Find(id);
    if (invoice is null) return Results.NotFound();
    if (invoice.AmountDue <= 0) return Results.BadRequest(new { error = "Invoice has no outstanding balance" });
    invoice.Status = "Paid";
    invoice.AmountDue = 0;
    logger.LogInformation("Invoice payment processed for {InvoiceId}", id);
    await hub.Clients.All.SendAsync("InvoiceUpdated", new InvoiceUpdate(invoice.Id, invoice.Status, invoice.AmountDue));
    logger.LogInformation("InvoiceUpdated broadcast for {InvoiceId}", id);
    return Results.Ok(invoice);
});
app.MapHub<InvoiceHub>("/hubs/invoices");
app.MapHub<WorkshopLogHub>("/hubs/workshop-logs");
app.Run();
