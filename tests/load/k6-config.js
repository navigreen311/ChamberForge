// Shared k6 configuration for ChamberForge load tests

export const BASE_URL = __ENV.BASE_URL || 'http://localhost:8000'
export const AUTH_TOKEN = __ENV.AUTH_TOKEN || ''

export function authHeaders() {
  return {
    headers: {
      'Authorization': `Bearer ${AUTH_TOKEN}`,
      'Content-Type': 'application/json',
    },
  }
}

export function jsonHeaders() {
  return {
    headers: {
      'Content-Type': 'application/json',
    },
  }
}
