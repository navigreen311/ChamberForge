import http from 'k6/http'
import { check, sleep } from 'k6'
import { Rate } from 'k6/metrics'
import { BASE_URL, authHeaders } from './k6-config.js'

const errorRate = new Rate('errors')

export const options = {
  vus: 20,
  duration: '60s',
  thresholds: {
    http_req_duration: ['p(95)<1000'],
    errors: ['rate<0.01'],
  },
}

export default function () {
  const res = http.get(`${BASE_URL}/api/v1/command/dashboard`, authHeaders())

  const success = check(res, {
    'status is 200': (r) => r.status === 200,
    'has dashboard data': (r) => {
      try {
        const body = JSON.parse(r.body)
        return body !== null && typeof body === 'object'
      } catch {
        return false
      }
    },
    'response time < 1000ms': (r) => r.timings.duration < 1000,
  })

  errorRate.add(!success)
  sleep(2)
}
