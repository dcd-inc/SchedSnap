import test from 'node:test';
import assert from 'node:assert/strict';
import { getAnalysisErrorMessage } from '../src/lib/api.js';

test('analysis errors keep API recovery messages and hide raw transport details', () => {
  const message = 'No class schedule was found. Upload a clearer image.';
  assert.equal(getAnalysisErrorMessage({ response: { data: { error: { message } } } }), message);
  for (const data of [undefined, '<html>Gateway timeout</html>', { error: 'FUNCTION_INVOCATION_TIMEOUT' }, { error: { message: {} } }]) {
    const friendly = getAnalysisErrorMessage({ response: { status: 504, data }, message: 'Request failed with status code 504' });
    assert.match(friendly, /Try again or enter your classes manually/);
    assert.doesNotMatch(friendly, /504|status code|FUNCTION|html/);
  }
  for (const code of ['ECONNABORTED', 'ETIMEDOUT']) assert.match(getAnalysisErrorMessage({ code }), /took too long/);
  assert.match(getAnalysisErrorMessage({ code: 'ERR_NETWORK' }), /internet connection/);
  assert.doesNotMatch(getAnalysisErrorMessage(new Error('Internal provider details')), /Internal provider/);
});
