using Microsoft.AspNetCore.SignalR;

namespace Workshop.Api;

public sealed class WorkshopLogHub : Hub
{
    public override async Task OnConnectedAsync()
    {
        await PublishLoopActivity();
        await base.OnConnectedAsync();
    }

    private Task PublishLoopActivity()
    {
        var httpContext = Context.GetHttpContext();
        if (httpContext is null) return Task.CompletedTask;

        var query = httpContext.Request.Query;
        if (query["scenario"] != "SignalR Request Loop" || !int.TryParse(query["iteration"], out var iteration)) return Task.CompletedTask;

        return Clients.All.SendAsync("BackendLog", new WorkshopLogEntry(
            DateTimeOffset.UtcNow,
            "Information",
            $"SignalR request loop iteration {iteration} connected",
            Context.ConnectionId,
            "SignalR Request Loop"));
    }
}

public sealed record WorkshopLogEntry(DateTimeOffset Timestamp, string Level, string Message, string RequestId, string Scenario);
