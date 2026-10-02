# Chrome DevTools Debugging Workshop

Ledgerline is an Angular workshop application with a small ASP.NET Core API and SignalR hubs. It provides a clean baseline for source-level debugging labs, plus selectable Network Debugging scenarios that deliberately produce useful browser evidence.

## Architecture

```text
Angular / NGXS
      | HTTP
      v
ASP.NET Core API

ASP.NET Core
      | SignalR / WebSocket
      v
Angular SignalR Service
      | NGXS action
      v
Invoice state
```

The Nx workspace has `apps/web` for the standalone Angular app, `apps/api/Workshop.Api` for the .NET 10 minimal API, and `libs/shared/models` for the small TypeScript invoice contract. The equivalent C# contract is maintained manually in `Invoice.cs`; contract drift can occur, so update both together. No schema generation is used.

## Running locally

Prerequisites: Node.js 20.19+ (or 22.12+) and .NET 10 SDK.

```bash
npm install
dotnet restore apps/api/Workshop.Api/Workshop.Api.csproj
npm start
```

Run the last two commands in separate terminals; the web app is at http://localhost:4300 and the API at http://localhost:5100. Or run both processes in one terminal with `npm start`. Nx invokes the Angular CLI and `dotnet run`; no process-runner dependency is needed.

The Angular dev proxy in `apps/web/proxy.conf.json` forwards `/api` and `/hubs` to port 5100 (including WebSocket upgrades), so application code uses relative paths and SignalR negotiates normally before attempting WebSockets. Run the frontend through `npm run start:web` to use the proxy.

## End-to-end check

1. Open the home page and confirm invoice data loads from `/api/invoices`.
2. In Chrome DevTools Network, confirm `/hubs/invoices/negotiate` and then a WebSocket connection.
3. Click Pay for an unpaid invoice and confirm `POST /api/invoices/{id}/pay`.
4. Inspect the WebSocket frames for `InvoiceUpdated`; the NGXS logger shows `[Invoices] Updated from server` and the invoice changes to Paid.

The API also provides `GET /api/invoices/{id}` and `POST /api/invoices/find`, with optional `status`, `dateFrom`, `dateTo`, and `region` filters. It seeds 16 invoices in memory. Payments update status and amount due and broadcast to connected clients.

## Network Debugging workshop

Open [http://localhost:4300/network-debugging](http://localhost:4300/network-debugging) and choose a scenario from the selector. The error scenarios produce 400, 403, or 500 responses, and **Duplicate Request** sends the invoice search twice. Select **SignalR Request Loop** to repeatedly connect and disconnect from `/hubs/workshop-logs` using SignalR long polling; DevTools Network shows recurring negotiate and polling requests, while the **Backend activity** panel shows one numbered entry for each successful connection. Select another scenario or leave the page to stop the loop.

In DevTools, filter Network requests for `workshop-logs` or `negotiate` and compare the repeated requests with the numbered activity entries. The **DevTools MCP** page includes a prompt that asks an agent to find and highlight the repeated requests, correlate them with the panel entries, and trace the loop to its source.

## DevTools MCP workshop

Open [http://localhost:4300/devtools-mcp](http://localhost:4300/devtools-mcp) for Codex setup instructions and prompts for performance, network, console, mobile layout, and the SignalR request loop. To register the Chrome DevTools MCP server, use `codex mcp add chrome-devtools -- npx chrome-devtools-mcp@latest`, then restart Codex or start a new session so its browser tools load. Keep the workshop page open in the browser session the agent can inspect.

## Console & Snippets workshop

Open [http://localhost:4300/console-snippets](http://localhost:4300/console-snippets) while the web app and API are running. Search and Refresh issue ordinary invoice API requests. In Chrome DevTools, open **Sources → Snippets**, create a snippet named **Instrument Fetch**, paste `tools/devtools-snippets/instrument-fetch.js`, and run it. Search or Refresh again to see request details, payload, response status, duration, and a call stack in Console. Running the snippet again does not wrap `fetch` twice; run `restoreFetchInstrumentation()` in Console to restore the original implementation.

This page uses `window.fetch` directly so its calls are intercepted reliably. The rest of the app keeps its existing Angular `HttpClient` configuration. Development source maps are enabled so the stack can map to TypeScript where available; Angular and runtime frames may also appear.

Chrome DevTools Snippets are reusable developer tools for creating test data, reaching difficult application states, triggering commands, inspecting state, instrumenting running code, generating edge cases, and automating repetitive setup. This workshop demonstrates fetch instrumentation; the broader workflows are presentation discussion, not additional demo app features.

## Environment & Region workshop

Open [http://localhost:4300/environment-region](http://localhost:4300/environment-region) with the web app and API running. The page fetches `GET /api/environment/time` once at startup (or when **Sync Server Time** is clicked); the ASP.NET Core endpoint returns `DateTime.UtcNow` serialized as UTC. It advances that server clock from a monotonic client timestamp, derives the tenant clock from the same UTC instant in `America/New_York`, and renders browser time and environment using the browser's current timezone, offset, and language.

For the live demo, open Chrome DevTools → **More tools → Sensors**, then choose a timezone override of **America/New_York** (or a New York location preset). Return to the page: the browser timezone, clock, and offset should update; the tenant clock remains America/New_York and the server clock remains UTC. Current Chrome applies timezone emulation to the page runtime without requiring a page reload; if a displayed value in a particular Chrome version does not refresh immediately, reload the page after selecting the override. Choose **No override** to restore the browser environment. Chrome Sensors also supports geolocation override and device orientation; location presets can include a timezone and locale.

Useful Console expressions for the demonstration:

```js
Intl.DateTimeFormat().resolvedOptions().timeZone
new Date()
new Date().toISOString()
navigator.language
new Date().getTimezoneOffset()
```

The `getTimezoneOffset()` result is expressed in minutes west of UTC; its sign convention differs from the displayed UTC offset.

## Extension points

Later labs can deliberately alter find filtering in `Program.cs`, payment/event behaviour in the payment route, reconnect/message handling in `InvoiceSignalRService`, or state transitions in `InvoiceState`. Existing lazy routes in `apps/web/src/app/app.routes.ts` remain ready for the scenarios.
