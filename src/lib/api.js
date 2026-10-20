import axios from 'axios';

export const api = axios.create({
  baseURL: '/api',
  timeout: 60_000,
  headers: { Accept: 'application/json' },
});

export function getAnalysisErrorMessage(failure) {
  const message = failure.response?.data?.error?.message;
  if (typeof message === 'string' && message.trim()) return message;
  if (failure.code === 'ECONNABORTED' || failure.code === 'ETIMEDOUT') return 'The request took too long. Try again or enter your classes manually.';
  if (failure.code === 'ERR_NETWORK') return 'Could not connect. Check your internet connection and try again.';
  return 'Could not read the schedule right now. Try again or enter your classes manually.';
}
