import test from 'node:test';
import assert from 'node:assert/strict';
import { createAnalyzeHandler as createHandler } from '../api/analyze.js';
import { sampleSchedule } from '../src/assets/sampleSchedule.js';
import { MAX_IMAGE_BYTES } from '../shared/uploadLimits.js';

const createAnalyzeHandler = (options = {}) => createHandler({ usage: Object.assign(async () => ({ used: 1, limit: 10, resetsAt: Date.now() + 86400000, allowed: true }), { release: async () => ({ used: 0, limit: 10, resetsAt: Date.now() + 86400000, allowed: true }) }), ...options });

const image = { mimeType: 'image/png', image: Buffer.from([137, 80, 78, 71, 13, 10, 26, 10, 0]).toString('base64') };

test('daily limit blocks Gemini before spending quota and reports usage', async () => {
  let called = false;
  const response = responseStub();
  await createAnalyzeHandler({ env: { GEMINI_API_KEYS: 'one,two' }, usage: async () => ({ used: 10, limit: 10, resetsAt: Date.now() + 10000, allowed: false }), generate: async () => { called = true; } })({ method: 'POST', body: image }, response);
  assert.equal(called, false);
  assert.equal(response.body.error.code, 'DAILY_IMPORT_LIMIT');
  assert.equal(response.body.usage.used, 10);
});

test('failed analysis refunds the reserved attempt and reports the refunded counter', async () => {
  let reservations = 0;
  let releases = 0;
  const usage = Object.assign(async () => { reservations++; return { used: 2, limit: 10, resetsAt: Date.now() + 10000, allowed: true }; }, { release: async () => { releases++; return { used: 1, limit: 10, resetsAt: Date.now() + 10000, allowed: true }; } });
  const response = responseStub();
  await createAnalyzeHandler({ env: { GEMINI_API_KEYS: 'one,two' }, usage, generate: async () => { throw Object.assign(new Error('quota'), { status: 429 }); } })({ method: 'POST', body: image }, response);
  assert.equal(reservations, 1);
  assert.equal(releases, 1);
  assert.equal(response.body.usage.used, 1);
});

test('usage GET returns the shared counter without reserving an import', async () => {
  const response = responseStub();
  await createAnalyzeHandler({ usage: async (request, reserve) => { assert.equal(reserve, undefined); return { used: 3, limit: 10 }; } })({ method: 'GET' }, response);
  assert.equal(response.body.usage.used, 3);
});

function responseStub() {
  return {
    headers: {},
    setHeader(name, value) { this.headers[name] = value; },
    status(value) { this.statusCode = value; return this; },
    json(value) { this.body = value; return this; },
  };
}

test('API refuses unsupported methods and marks responses as non-cacheable', async () => {
  const response = responseStub();
  await createAnalyzeHandler()({ method: 'DELETE' }, response);
  assert.equal(response.statusCode, 405);
  assert.equal(response.headers.Allow, 'GET, POST');
  assert.equal(response.headers['Cache-Control'], 'no-store');
});

test('missing key gives a recoverable configuration error', async () => {
  const response = responseStub();
  await createAnalyzeHandler({ env: {} })({ method: 'POST', body: image }, response);
  assert.equal(response.statusCode, 503);
  assert.equal(response.body.error.code, 'AI_NOT_CONFIGURED');
});

test('a display name is rejected as configuration before spending API quota', async () => {
  let called = false;
  const response = responseStub();
  await createAnalyzeHandler({ env: { GEMINI_API_KEY: 'test-secret', GEMINI_MODEL: 'Gemini 3.1 Flash Lite' }, generate: async () => { called = true; } })({ method: 'POST', body: image }, response);
  assert.equal(response.statusCode, 503);
  assert.equal(response.body.error.code, 'INVALID_MODEL_CONFIG');
  assert.equal(called, false);
});

test('rejects invalid image data and oversized uploads before calling Gemini', async () => {
  let called = false;
  const handler = createAnalyzeHandler({ env: { GEMINI_API_KEY: 'test-secret' }, generate: async () => { called = true; } });
  for (const body of [null, { ...image, mimeType: 'image/jpeg' }, { ...image, image: 'not base64' }, '{bad json']) {
    const response = responseStub();
    await handler({ method: 'POST', body }, response);
    assert.equal(response.statusCode, 400);
  }
  const oversized = responseStub();
  await handler({ method: 'POST', body: { ...image, image: 'a'.repeat(Math.ceil(MAX_IMAGE_BYTES / 3) * 4 + 4) } }, oversized);
  assert.equal(oversized.statusCode, 413);
  assert.equal(called, false);
});

test('returns validated extracted data, using the configured model and inline image', async () => {
  let parameters;
  const handler = createAnalyzeHandler({ env: { GEMINI_API_KEY: 'test-secret', GEMINI_MODEL: 'configured-model' }, generate: async (request) => { parameters = request; return { text: JSON.stringify(sampleSchedule) }; } });
  const response = responseStub();
  await handler({ method: 'POST', body: image }, response);
  assert.equal(response.statusCode, 200);
  assert.deepEqual(response.body.schedule, sampleSchedule);
  assert.equal(parameters.model, 'configured-model');
  assert.equal(parameters.contents[0].parts[1].inlineData.data, image.image);
  assert.ok(!JSON.stringify(response.body).includes('test-secret'));
});

test('handles absent schedules and malformed or invalid AI results', async () => {
  for (const [text, status] of [['bad json', 502], ['null', 502], [JSON.stringify({ ...sampleSchedule, classes: [] }), 422], [JSON.stringify({ ...sampleSchedule, classes: [{ subject: '', meetings: [] }] }), 502]]) {
    const response = responseStub();
    await createAnalyzeHandler({ env: { GEMINI_API_KEY: 'test-secret' }, generate: async () => ({ text }) })({ method: 'POST', body: image }, response);
    assert.equal(response.statusCode, status);
  }
});

test('provider errors never leak secrets and expose useful recovery codes', async (t) => {
  t.mock.method(globalThis, 'setTimeout', (callback) => { callback(); return 0; });
  for (const [providerStatus, responseStatus, code] of [[400, 502, 'AI_REQUEST_REJECTED'], [429, 429, 'AI_RATE_LIMIT'], [403, 503, 'AI_UNAVAILABLE'], [404, 503, 'AI_UNAVAILABLE'], [500, 503, 'AI_BUSY'], [503, 503, 'AI_BUSY']]) {
    const response = responseStub();
    await createAnalyzeHandler({ env: { GEMINI_API_KEY: 'test-secret' }, generate: async () => { throw Object.assign(new Error('test-secret provider internals'), { status: providerStatus }); } })({ method: 'POST', body: image }, response);
    assert.equal(response.statusCode, responseStatus);
    assert.equal(response.body.error.code, code);
    assert.ok(!JSON.stringify(response.body).includes('test-secret'));
  }
});

test('quota exhaustion retries once with the backup key and identical parameters', async () => {
  const calls = [];
  const response = responseStub();
  await createAnalyzeHandler({
    env: { GEMINI_API_KEY: ' primary-secret ', GEMINI_FALLBACK_API_KEY: ' backup-secret ' },
    generate: async (parameters, apiKey) => {
      calls.push({ parameters, apiKey });
      if (calls.length === 1) throw Object.assign(new Error('quota'), { status: 429 });
      return { text: JSON.stringify(sampleSchedule) };
    },
  })({ method: 'POST', body: image }, response);
  assert.equal(response.statusCode, 200);
  assert.deepEqual(response.body.schedule, sampleSchedule);
  assert.deepEqual(calls.map(({ apiKey }) => apiKey), ['primary-secret', 'backup-secret']);
  assert.equal(calls[0].parameters, calls[1].parameters);
  assert.ok(!JSON.stringify(response.body).includes('secret'));
});

test('fallback stops after both keys exhaust quota and never leaks provider details', async () => {
  let calls = 0;
  const response = responseStub();
  await createAnalyzeHandler({
    env: { GEMINI_API_KEY: 'primary-secret', GEMINI_FALLBACK_API_KEY: 'backup-secret' },
    generate: async () => { calls++; throw Object.assign(new Error('backup-secret'), { code: 429 }); },
  })({ method: 'POST', body: image }, response);
  assert.equal(calls, 2);
  assert.equal(response.body.error.code, 'AI_RATE_LIMIT');
  assert.ok(!JSON.stringify(response.body).includes('secret'));
});

test('capacity spikes rotate keys, then one delayed attempt recovers without user-visible failure', async (t) => {
  t.mock.method(globalThis, 'setTimeout', (callback) => { callback(); return 0; });
  const calls = [];
  const response = responseStub();
  await createAnalyzeHandler({
    env: { GEMINI_API_KEYS: 'first,second' },
    generate: async (parameters, apiKey) => {
      calls.push(apiKey);
      if (calls.length < 3) throw Object.assign(new Error('overloaded'), { status: 503 });
      return { text: JSON.stringify(sampleSchedule) };
    },
  })({ method: 'POST', body: image }, response);
  assert.deepEqual(calls, ['first', 'second', 'first']);
  assert.equal(response.statusCode, 200);
  assert.deepEqual(response.body.schedule, sampleSchedule);
});

test('capacity spikes rotate to the next key and refund once every attempt is overloaded', async (t) => {
  t.mock.method(globalThis, 'setTimeout', (callback) => { callback(); return 0; });
  let calls = 0;
  const response = responseStub();
  await createAnalyzeHandler({
    env: { GEMINI_API_KEY: 'primary-secret', GEMINI_FALLBACK_API_KEY: 'backup-secret' },
    generate: async () => { calls++; throw Object.assign(new Error('overloaded'), { status: 503 }); },
  })({ method: 'POST', body: image }, response);
  assert.equal(calls, 3);
  assert.equal(response.statusCode, 503);
  assert.equal(response.body.error.code, 'AI_BUSY');
  assert.equal(response.body.usage.used, 0);
});

test('DeepSeek runs only after every Gemini attempt fails', async () => {
  const calls = [];
  const response = responseStub();
  await createAnalyzeHandler({
    env: { GEMINI_API_KEY: 'gemini-secret', DEEPSEEK_API_KEY: 'deepseek-secret' },
    generate: async (parameters, apiKey) => { calls.push(['gemini', apiKey]); throw Object.assign(new Error('quota'), { status: 429 }); },
    generateDeepseek: async (parameters, apiKey) => { calls.push(['deepseek', apiKey, parameters.model]); return { text: JSON.stringify(sampleSchedule) }; },
  })({ method: 'POST', body: image }, response);
  assert.deepEqual(calls, [['gemini', 'gemini-secret'], ['deepseek', 'deepseek-secret', 'deepseek-v4-flash']]);
  assert.equal(response.statusCode, 200);
  assert.equal(response.body.provider, 'deepseek');
  assert.deepEqual(response.body.schedule, sampleSchedule);
});

test('Gemini success skips DeepSeek, and DeepSeek works without Gemini keys', async () => {
  let deepseekCalls = 0;
  const geminiResponse = responseStub();
  await createAnalyzeHandler({
    env: { GEMINI_API_KEY: 'gemini-secret', DEEPSEEK_API_KEY: 'deepseek-secret' },
    generate: async () => ({ text: JSON.stringify(sampleSchedule) }),
    generateDeepseek: async () => { deepseekCalls++; return { text: JSON.stringify(sampleSchedule) }; },
  })({ method: 'POST', body: image }, geminiResponse);
  assert.equal(geminiResponse.statusCode, 200);
  assert.equal(geminiResponse.body.provider, 'gemini');
  assert.equal(deepseekCalls, 0);

  const deepseekResponse = responseStub();
  await createAnalyzeHandler({
    env: { DEEPSEEK_API_KEY: 'deepseek-secret' },
    generateDeepseek: async () => ({ text: JSON.stringify(sampleSchedule) }),
  })({ method: 'POST', body: image }, deepseekResponse);
  assert.equal(deepseekResponse.statusCode, 200);
  assert.equal(deepseekResponse.body.provider, 'deepseek');
  assert.deepEqual(deepseekResponse.body.schedule, sampleSchedule);
});

test('both providers failing refunds the attempt and surfaces AI_BUSY', async (t) => {
  t.mock.method(globalThis, 'setTimeout', (callback) => { callback(); return 0; });
  const response = responseStub();
  await createAnalyzeHandler({
    env: { GEMINI_API_KEY: 'gemini-secret', DEEPSEEK_API_KEY: 'deepseek-secret' },
    generate: async () => { throw Object.assign(new Error('overloaded'), { status: 503 }); },
    generateDeepseek: async () => { throw Object.assign(new Error('overloaded'), { status: 503 }); },
  })({ method: 'POST', body: image }, response);
  assert.equal(response.statusCode, 503);
  assert.equal(response.body.error.code, 'AI_BUSY');
  assert.equal(response.body.usage.used, 0);
});

test('DeepSeek fallback sends a strict JSON-mode vision request', async (t) => {
  let request;
  t.mock.method(globalThis, 'fetch', async (url, options) => {
    request = { url, headers: new Headers(options.headers), body: JSON.parse(options.body) };
    return new Response(JSON.stringify({ choices: [{ message: { content: `\`\`\`json\n${JSON.stringify(sampleSchedule)}\n\`\`\`` } }] }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  });
  const response = responseStub();
  await createAnalyzeHandler({
    env: { GEMINI_API_KEY: 'gemini-secret', DEEPSEEK_API_KEY: 'deepseek-secret', DEEPSEEK_MODEL: 'deepseek-v4-flash' },
    generate: async () => { throw Object.assign(new Error('quota'), { status: 429 }); },
  })({ method: 'POST', body: image }, response);
  assert.equal(request.url, 'https://api.deepseek.com/chat/completions');
  assert.equal(request.headers.get('authorization'), 'Bearer deepseek-secret');
  assert.equal(request.body.model, 'deepseek-v4-flash');
  assert.equal(request.body.response_format.type, 'json_object');
  assert.equal(request.body.thinking.type, 'disabled');
  assert.match(request.body.messages[0].content, /Return only one JSON object/);
  assert.match(request.body.messages[0].content, /Monday/);
  assert.equal(request.body.messages[1].content[1].image_url.url, `data:image/png;base64,${image.image}`);
  assert.equal(response.statusCode, 200);
  assert.deepEqual(response.body.schedule, sampleSchedule);
});

test('DeepSeek invalid output is rejected and refunded', async () => {
  const response = responseStub();
  await createAnalyzeHandler({
    env: { DEEPSEEK_API_KEY: 'deepseek-secret' },
    generateDeepseek: async () => ({ text: 'not json' }),
  })({ method: 'POST', body: image }, response);
  assert.equal(response.statusCode, 502);
  assert.equal(response.body.error.code, 'INVALID_AI_RESPONSE');
  assert.equal(response.body.usage.used, 0);
});

test('no retry for unrelated errors or missing, blank, or duplicate backup keys', async () => {
  for (const [status, backup] of [[400, 'backup'], [403, 'backup'], [429, undefined], [429, ' '], [429, ' primary ']]) {
    let calls = 0;
    const response = responseStub();
    await createAnalyzeHandler({
      env: { GEMINI_API_KEY: 'primary', GEMINI_FALLBACK_API_KEY: backup },
      generate: async () => { calls++; throw Object.assign(new Error('provider'), { status }); },
    })({ method: 'POST', body: image }, response);
    assert.equal(calls, 1);
  }
});

test('a key list alone rotates through quota failures, ignoring blanks and duplicates', async () => {
  const calls = [];
  const handler = createAnalyzeHandler({
    env: { GEMINI_API_KEYS: ' first, ,second,first, third, fourth, ' },
    generate: async (parameters, apiKey) => {
      calls.push(apiKey);
      if (apiKey !== 'third') throw Object.assign(new Error('quota'), { status: 429 });
      return { text: JSON.stringify(sampleSchedule) };
    },
  });
  const response = responseStub();
  await handler({ method: 'POST', body: image }, response);
  assert.deepEqual(calls, ['first', 'second', 'third']);
  assert.equal(response.statusCode, 200);
});

test('all configured keys are attempted once on quota errors in legacy then list order', async () => {
  const calls = [];
  const response = responseStub();
  await createAnalyzeHandler({
    env: { GEMINI_API_KEY: 'primary', GEMINI_FALLBACK_API_KEY: 'backup', GEMINI_API_KEYS: 'backup, third, fourth, primary' },
    generate: async (parameters, apiKey) => { calls.push(apiKey); throw Object.assign(new Error('quota'), { status: 429 }); },
  })({ method: 'POST', body: image }, response);
  assert.deepEqual(calls, ['primary', 'backup', 'third', 'fourth']);
  assert.equal(response.body.error.code, 'AI_RATE_LIMIT');
});

test('rotation stops on a non-quota error from an intermediate key', async () => {
  const calls = [];
  const response = responseStub();
  await createAnalyzeHandler({
    env: { GEMINI_API_KEYS: 'first, second, third' },
    generate: async (parameters, apiKey) => { calls.push(apiKey); throw Object.assign(new Error('provider'), { status: apiKey === 'first' ? 429 : 403 }); },
  })({ method: 'POST', body: image }, response);
  assert.deepEqual(calls, ['first', 'second']);
  assert.equal(response.body.error.code, 'AI_UNAVAILABLE');
});

test('real Gemini SDK switches keys on 429 without retrying the exhausted key', async (t) => {
  const calls = [];
  t.mock.method(globalThis, 'fetch', async (url, options) => {
    calls.push(new Headers(options.headers).get('x-goog-api-key'));
    if (calls.length === 1) return new Response(JSON.stringify({ error: { code: 429, status: 'RESOURCE_EXHAUSTED', message: 'quota exhausted' } }), { status: 429, headers: { 'Content-Type': 'application/json' } });
    return new Response(JSON.stringify({ candidates: [{ content: { role: 'model', parts: [{ text: JSON.stringify(sampleSchedule) }] }, finishReason: 'STOP' }] }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  });
  const response = responseStub();
  await createAnalyzeHandler({ env: { GEMINI_API_KEYS: 'first-secret,second-secret' } })({ method: 'POST', body: image }, response);
  assert.deepEqual(calls, ['first-secret', 'second-secret']);
  assert.equal(response.statusCode, 200);
  assert.deepEqual(response.body.schedule, sampleSchedule);
});

test('rotation stops when the shared time budget expires', async (t) => {
  let now = 1000;
  t.mock.method(Date, 'now', () => now);
  const calls = [];
  const response = responseStub();
  await createAnalyzeHandler({
    env: { GEMINI_API_KEYS: 'first,second' },
    generate: async (parameters, apiKey) => {
      calls.push(apiKey);
      now += 45_000;
      throw Object.assign(new Error('quota'), { status: 429 });
    },
  })({ method: 'POST', body: image }, response);
  assert.deepEqual(calls, ['first']);
  assert.equal(response.body.error.code, 'AI_RATE_LIMIT');
});
