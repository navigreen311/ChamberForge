import http from 'k6/http'
import { check, sleep } from 'k6'
import { Rate } from 'k6/metrics'
import { BASE_URL, jsonHeaders } from './k6-config.js'

const errorRate = new Rate('errors')

export const options = {
  vus: 50,
  duration: '60s',
  thresholds: {
    http_req_duration: ['p(95)<500'],
    errors: ['rate<0.01'],
  },
}

export default function () {
  const payload = JSON.stringify({
    email: 'admin@chamberforge.dev',
    password: 'changeme123',
  })

  const res = http.post(`${BASE_URL}/api/v1/auth/login`, payload, jsonHeaders())

  const success = check(res, {
    'status is 200': (r) => r.status === 200,
    'has access_token': (r) => {
      try {
        return JSON.parse(r.body).access_token !== undefined
      } catch {
        return false
      }
    },
    'response time < 500ms': (r) => r.timings.duration < 500,
  })

  errorRate.add(!success)
  sleep(1)
}
