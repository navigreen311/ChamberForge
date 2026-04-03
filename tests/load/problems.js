import http from 'k6/http'
import { check, sleep, group } from 'k6'
import { Rate } from 'k6/metrics'
import { BASE_URL, authHeaders } from './k6-config.js'

const errorRate = new Rate('errors')

export const options = {
  vus: 30,
  duration: '60s',
  thresholds: {
    http_req_duration: ['p(95)<300'],
    errors: ['rate<0.01'],
  },
}

export default function () {
  group('List problems with pagination', () => {
    const res = http.get(`${BASE_URL}/api/v1/problems?page=1&per_page=20`, authHeaders())

    const success = check(res, {
      'list status 200': (r) => r.status === 200,
      'list response time < 300ms': (r) => r.timings.duration < 300,
    })

    errorRate.add(!success)
  })

  sleep(1)

  group('Create problem', () => {
    const payload = JSON.stringify({
      title: `Load Test Problem ${Date.now()}`,
      description: 'Created during k6 load testing',
      severity: 'medium',
    })

    const opts = authHeaders()
    const res = http.post(`${BASE_URL}/api/v1/problems`, payload, opts)

    const success = check(res, {
      'create status 201 or 200': (r) => r.status === 201 || r.status === 200,
      'create response time < 300ms': (r) => r.timings.duration < 300,
    })

    errorRate.add(!success)
  })

  sleep(1)
}
