import http from 'k6/http'
import { check, sleep } from 'k6'
import { BASE_URL } from './k6-config.js'

export const options = {
  vus: 10,
  duration: '30s',
  thresholds: {
    http_req_duration: ['p(95)<100'],
  },
}

export default function () {
  const res = http.get(`${BASE_URL}/api/health`)

  check(res, {
    'status is 200': (r) => r.status === 200,
    'response time < 100ms': (r) => r.timings.duration < 100,
  })

  sleep(1)
}
