(() => {
  const key = Symbol.for('chrome-workshop.fetch-instrumentation');

  if (window[key]) {
    console.info('Fetch instrumentation is already enabled.');
    return;
  }

  const originalFetch = window.fetch;

  window.fetch = async function instrumentedFetch(input, init) {
    const url = input instanceof Request ? input.url : String(input);
    const method = (init?.method ?? (input instanceof Request ? input.method : 'GET')).toUpperCase();
    const startedAt = performance.now();
    const groupLabel = `FETCH → ${method} ${url}`;

    console.groupCollapsed(groupLabel);
    console.log('Request', { method, url });

    // Log simple bodies only. Never read a Request or stream body, since that could consume it.
    const body = init?.body;
    if (typeof body === 'string') {
      try {
        console.log('Payload', JSON.parse(body));
      } catch {
        console.log('Payload', body);
      }
    }

    console.trace('Request call stack');

    try {
      const response = await originalFetch.apply(this, arguments);
      const duration = Math.round(performance.now() - startedAt);
      console.log(`FETCH ← ${response.status} ${response.url} (${duration}ms)`);
      console.groupEnd();
      return response;
    } catch (error) {
      const duration = Math.round(performance.now() - startedAt);
      console.error(`FETCH ✕ ${method} ${url} (${duration}ms)`, error);
      console.groupEnd();
      throw error;
    }
  };

  window[key] = { originalFetch };
  window.restoreFetchInstrumentation = () => {
    const instrumentation = window[key];
    if (!instrumentation) {
      console.info('Fetch instrumentation is not enabled.');
      return;
    }

    window.fetch = instrumentation.originalFetch;
    delete window[key];
    delete window.restoreFetchInstrumentation;
    console.info('Fetch instrumentation removed.');
  };

  console.info('Fetch instrumentation enabled.');
})();
