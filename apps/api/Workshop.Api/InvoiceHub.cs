using Microsoft.AspNetCore.SignalR;
namespace Workshop.Api;
public sealed class InvoiceHub(ILogger<InvoiceHub> logger) : Hub
{
    public override async Task OnConnectedAsync() { logger.LogInformation("SignalR client connected: {ConnectionId}", Context.ConnectionId); await base.OnConnectedAsync(); }
    public override async Task OnDisconnectedAsync(Exception? exception) { logger.LogInformation("SignalR client disconnected: {ConnectionId}", Context.ConnectionId); await base.OnDisconnectedAsync(exception); }
}
