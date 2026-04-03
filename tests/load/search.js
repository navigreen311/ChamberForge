import http from 'k6/http'
import { check, sleep } from 'k6'
import { Rate } from 'k6/metrics'
import { BASE_URL, authHeaders } from './k6-config.js'

const errorRate = new Rate('errors')

const searchTerms = [
  'coordination',
  'member engagement',
  'workforce',
  'advocacy',
  'policy',
  'training',
  'economic development',
  'partnerships',
]

export const options = {
  vus: 50,
  duration: '60s',
  thresholds: {
    http_req_duration: ['p(95)<200'],
    errors: ['rate<0.01'],
  },
}

export default function () {
  const query = searchTerms[Math.floor(Math.random() * searchTerms.length)]
  const res = http.get(
    `${BASE_URL}/api/v1/search?q=${encodeURIComponent(query)}`,
    authHeaders()
  )

  const success = check(res, {
    'status is 200': (r) => r.status === 200,
    'response time < 200ms': (r) => r.timings.duration < 200,
  })

  errorRate.add(!success)
  sleep(1)
}
