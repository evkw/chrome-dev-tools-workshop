---
title: Chrome DevTools — Debugging Techniques
info: A live demonstration workshop
author: Efimis
theme: default
class: efimis
transition: none
colorSchema: light
highlighter: shiki
twoslash: false
lineNumbers: false
presenter: true
exportFilename: chrome-devtools-workshop
---

<!-- layout: cover -->

# CHROME DEVTOOLS

## Debugging Techniques

Finding out what actually happened.

<!--
Welcome the room and frame this as a practical, live demonstration. We will move between a small set of slides and the workshop application.
-->

---

<!-- layout: statement -->

# DEBUGGING

<div class="evidence-flow">
  <span>Observe</span><b>↓</b>
  <span>Reproduce</span><b>↓</b>
  <span>Gather evidence</span><b>↓</b>
  <span>Narrow the problem</span>
</div>

<p class="takeaway">DevTools helps us gather evidence before jumping into source code.</p>

<!--
Introduce the habit: first understand what the browser observed. We'll use the app to reproduce behaviour and collect evidence before opening source code.
-->

---

<!-- layout: content -->

# TODAY

<div class="topic-overview">
  <span>NETWORK</span><span>PERFORMANCE</span>
  <span>CONSOLE &amp; SNIPPETS</span><span>BREAKPOINTS</span>
  <span>ENVIRONMENT &amp; REGION</span><span>DEVTOOLS MCP</span>
</div>

<!--
Set expectations: the Network section is our first extended demonstration; the remaining headings are signposts for the rest of the hour.
-->

---

<!-- layout: section -->

# NETWORK

What actually crossed the boundary?

<!--
Switch to the workshop application. It has Normal, 400, 500 and Duplicate Requests scenarios that make useful evidence visible in DevTools; the audience is not expected to fix them.
-->

---

<!-- layout: statement -->

# START WITH THE REQUEST

<div class="request-flow">
  <span>Headers</span><b>↓</b>
  <span>Payload</span><b>↓</b>
  <span>Preview / Response</span><b>↓</b>
  <span>Timing</span>
</div>

<!--
Open Chrome DevTools → Network → Fetch/XHR. Trigger FindInvoices and select it. Inspect method, URL, status, Headers, Payload, Preview, Response and Timing. This is a live demonstration.
-->

---

<!-- layout: code -->

# THE RESPONSE IS DATA

```js
console.table(temp1)

temp1.filter(x => x.id.endsWith('03'))
```

<!--
FindInvoices returns an invoice array. Right-click its response and choose Store as global variable; Chrome creates temp1. In Console, run console.table(temp1), then filter/query the response. Show that Network data can be explored immediately: DevTools is more than a passive viewer.
-->

---

<!-- layout: content -->

# MORE THAN JUST VIEWING

<div class="action-list">
  <span>Copy response</span>
  <span>Copy as fetch</span>
  <span>Copy as cURL</span>
  <span>Store as global variable</span>
</div>

<!--
Briefly point out each action: preserve a response, replay a request in the page, reproduce it outside the browser, or explore its data in Console.
-->

---

<!-- layout: statement -->

# 400

<p class="statement-line">The server rejected what we sent.</p>

<p class="small-flow">Payload <span>→</span> Response</p>

<!--
Switch the demo app to the 400 scenario and trigger FindInvoices. Show the failed request, status, Payload, response, Problem Details if present, and headers. Compare backend error information with what the frontend displays. The server deliberately rejected this request: inspect what was sent and why before deciding where a defect belongs. Do not teach “400 = frontend bug.”
-->

---

<!-- layout: statement -->

# 500

<p class="statement-line">The server failed while processing the request.</p>

<div class="status-compare">
  <div><strong>400</strong><span>REQUEST REJECTED</span></div>
  <div><strong>500</strong><span>PROCESSING FAILED</span></div>
</div>

<!--
Switch to the 500 scenario and trigger FindInvoices. Inspect the request, confirm the payload is valid in this demo, inspect the response, and compare with the 400 example. Network gives evidence about where to investigate next; backend logs would generally be next. HTTP status alone does not establish which team or codebase caused a defect.
-->

---

<!-- layout: statement -->

# WHY DID WE CALL THIS 5 TIMES?

<div class="duplicate-flow">
  <strong>Dashboard</strong>
  <div><span>Widget A</span><b>→</b><code>FindInvoices</code></div>
  <div><span>Widget B</span><b>→</b><code>FindInvoices</code></div>
  <div><span>Widget C</span><b>→</b><code>FindInvoices</code></div>
  <div><span>Widget D</span><b>→</b><code>FindInvoices</code></div>
  <div><span>???</span><b>→</b><code>FindInvoices</code></div>
</div>

<!--
Load the duplicate request/dashboard scenario. Clear Network, filter to FindInvoices, and observe repeated calls. Compare payloads, use Timing/waterfall, then inspect Initiator to identify which component originated each call.

Initiator may show noisy Angular/Zone.js async stacks rather than clear application code. Show what it contains, when it helps, and when it becomes noisy. Use Ignore List if appropriate, and bridge into Sources/breakpoints as the next step.
-->

---

<!-- layout: content -->

# BEFORE LEAVING NETWORK...

<div class="action-list network-tools">
  <span>Preserve log</span>
  <span>Disable cache</span>
  <span>Throttling</span>
  <span>Request blocking</span>
  <span>HAR</span>
</div>

<!--
Preserve log keeps evidence across navigation/reload. Disable cache helps reproduce requests without browser cache. Throttling shows behaviour on slower connections. Request blocking shows behaviour when an endpoint/resource is unavailable. HAR captures a shareable network session.
-->

---

<!-- layout: statement -->

# NETWORK GIVES US EVIDENCE

<div class="request-flow recap-flow">
  <span>What did we send?</span><b>↓</b>
  <span>What came back?</span><b>↓</b>
  <span>How long did it take?</span><b>↓</b>
  <span>How many times did it happen?</span>
</div>

<p class="takeaway">INSPECT BEFORE ASSUMING.</p>

<!--
Recap the request, response, timing and repetition. Transition to the next topic: when the request looks reasonable, we can investigate what the browser was doing while it felt slow.
-->

---

<!-- layout: section -->

# PERFORMANCE

What was the browser doing while it was slow?

<!--
Recap that the Performance section used a trace to explain browser work. Now move from observing what happened to adding temporary diagnostics to an already-running page.
-->

---

<!-- layout: section -->

# CONSOLE & SNIPPETS

Instrument the application while it's running.

<!--
Open http://localhost:4300/console-snippets and search once with Console visible: the app makes a normal request without custom diagnostics. In Sources → Snippets, create/open “Instrument Fetch”, paste tools/devtools-snippets/instrument-fetch.js, and run it. Search again; expand the FETCH group and the Request call stack, noting application TypeScript may appear via source maps alongside Angular/runtime frames. Run restoreFetchInstrumentation() in Console, search once more, and confirm the request still works without instrumentation.
-->

---

<!-- layout: statement -->

# TEMPORARY DEVELOPER TOOLING

<div class="request-flow">
  <span>Inspect</span><b>↓</b>
  <span>Instrument</span><b>↓</b>
  <span>Automate</span>
</div>

<!--
Snippets can inspect state, temporarily instrument running code, and automate repeatable developer actions. The fetch example shows the first two ideas without changing the app source or restarting it.
-->

---

<!-- layout: statement -->

# NO CODE CHANGE.
# NO REBUILD.
# NO REDEPLOY.

<p class="takeaway">Run the snippet. Use the application. Gather evidence.</p>

<!--
The running application gains temporary diagnostics from DevTools. The snippet is a developer tool, not a permanent app change; restore the original fetch when finished.
-->

---

<!-- layout: content -->

# AUTOMATE THE BORING SETUP

<div class="action-list">
  <span>Create test state</span>
  <span>Trigger commands</span>
  <span>Generate edge cases</span>
  <span>Reproduce difficult conditions</span>
</div>

<!--
Transition to the real application: “If you repeatedly spend time clicking through the UI just to put the application into a state you need for development or testing, that workflow may be a good candidate for a snippet.” Switch to the real app and show the existing Matter → Work Item → Invoice → Finalise Invoice examples, including SignalR commands. No such workflow is implemented in the workshop app.
-->

---

<!-- layout: section -->

# BREAKPOINTS

Stop where the behaviour happens.

---

<!--
Switch to the Breakpoints workshop page. Open Sources, press Ctrl/Cmd + P and search invoice-calculator. The workshop's development build maps the served JavaScript back to this TypeScript file.
-->

---

<!-- layout: statement -->

# FIND THE SOURCE

<p class="statement-line">Ctrl / Cmd + P</p>

<!--
Backend developers may not know the frontend project structure. Source maps let Chrome expose the TypeScript source, so search directly by filename and open invoice-calculator.service.ts.
-->

---

<!-- layout: statement -->

# PAUSE. THEN INSPECT.

<div class="action-list">
  <span>Scope</span>
  <span>Call Stack</span>
  <span>Console</span>
  <span>Watch</span>
</div>

<!--
Set a breakpoint on the return object inside calculateLineItem(), then click Calculate Invoice Total. Show Local variables, expand lineItem, hover variables, inspect the application call stack, switch to Console while paused and evaluate a local value, then add a Watch expression such as lineItem.quantity * lineItem.unitPrice.
-->

---

<!-- layout: code -->

# DON'T STOP 20 TIMES

```js
lineItem.id === 'LINE-017'
```

<p class="small-flow">Conditional breakpoint</p>

<!--
The normal breakpoint pauses once for each invoice line. Right-click the same line and replace it with a conditional breakpoint using lineItem.id === 'LINE-017'. Run the calculation again: Chrome pauses only for Priority Support. A value condition such as baseAmount > 1000 is also available inside calculateLineItem().
-->

---

<!-- layout: statement -->

# THE DEBUGGER ALREADY HAS THE STATE

<div class="action-list">
  <span>No console.log.</span>
  <span>No rebuild.</span>
  <span>No redeploy.</span>
</div>

<!--
Close by emphasizing the familiar runtime inspection workflow: find source, pause, inspect local state and call stack, step or resume, and add a condition when the normal breakpoint is noisy. The browser debugger gives us the runtime state without adding diagnostics to the application.
-->

---

<!-- layout: section -->

# ENVIRONMENT & REGION

Reproduce the user's environment.

<!--
Open the Environment & Region workshop page. Explain server UTC, tenant New York time, and browser local time.
-->

---

<!-- layout: statement -->

# SERVER ≠ TENANT ≠ BROWSER

<div class="status-compare">
  <div><strong>SERVER</strong><span>UTC</span></div>
  <div><strong>TENANT</strong><span>America/New_York</span></div>
  <div><strong>BROWSER</strong><span>Your environment</span></div>
</div>

<!--
These are three separate concepts. Backend timestamps can be correct while frontend or business-date behaviour is still wrong.
-->

---

<!-- layout: statement -->

# “YOU CANNOT FUTURE DATE TRANSACTIONS”

<p class="takeaway">But it's still yesterday for the tenant.</p>

<!--
Describe the real workflow that motivated timezone overrides: working on a US tenant from Australia, the local calendar day can differ, and historically test transactions might be manually backdated. This is not a claim that the wording identifies a current production defect.
-->

---

<!-- layout: statement -->

# DEVTOOLS → SENSORS

<p class="statement-line">Australia/Sydney <span>↓</span> America/New_York</p>
<p class="takeaway">Reproduce the tenant environment.</p>

<!--
Open More tools → Sensors and select a New York timezone override. Return to the page: browser time and timezone should change while the tenant stays in New York and the server stays in UTC.
-->

---

<!-- layout: statement -->

# SAME CODE.

# SAME SERVER.

# DIFFERENT ENVIRONMENT.

<!--
Your browser environment is part of the application's runtime state. For multi-region issues, reproduce the tenant timezone as well as their data. Changing the browser timezone with DevTools can be easier than repeatedly manipulating test dates.
-->

---

<!-- layout: section -->

# DEVTOOLS MCP

Give the agent the same evidence.

---

<!-- layout: cover -->

# QUESTIONS?

What do you want to inspect?
