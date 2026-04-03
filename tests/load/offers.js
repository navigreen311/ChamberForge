import http from 'k6/http'
import { check, sleep } from 'k6'
import { Rate } from 'k6/metrics'
import { BASE_URL, authHeaders } from './k6-config.js'

const errorRate = new Rate('errors')

export const options = {
  vus: 10,
  duration: '60s',
  thresholds: {
    http_req_duration: ['p(95)<5000'],
    errors: ['rate<0.05'],
  },
}

export default function () {
  const payload = JSON.stringify({
    problem_id: 'test-problem-id',
    prompt: 'Generate a coordination offer for member engagement',
  })

  const res = http.post(`${BASE_URL}/api/v1/offers/generate`, payload, authHeaders())

  const success = check(res, {
    'status is 200 or 201': (r) => r.status === 200 || r.status === 201,
    'response time < 5000ms': (r) => r.timings.duration < 5000,
  })

  errorRate.add(!success)

  // Longer sleep — AI generation is expensive, avoid hammering
  sleep(3)
}
