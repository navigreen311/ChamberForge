import http from 'k6/http'
import { check, sleep, group } from 'k6'
import { Rate } from 'k6/metrics'
import { BASE_URL, jsonHeaders } from './k6-config.js'

const errorRate = new Rate('errors')

export const options = {
  vus: 20,
  duration: '120s',
  thresholds: {
    http_req_duration: ['p(95)<2000'],
    errors: ['rate<0.05'],
  },
}

function randomSleep() {
  sleep(1 + Math.random() * 2) // 1-3 seconds
}

export default function () {
  let token = ''

  // Step 1: Login
  group('01 - Login', () => {
    const payload = JSON.stringify({
      email: 'admin@chamberforge.dev',
      password: 'changeme123',
    })

    const res = http.post(`${BASE_URL}/api/v1/auth/login`, payload, jsonHeaders())

    const success = check(res, {
      'login status 200': (r) => r.status === 200,
    })

    if (success) {
      try {
        token = JSON.parse(res.body).access_token
      } catch {
        // token stays empty
      }
    }

    errorRate.add(!success)
  })

  randomSleep()

  const opts = {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  }

  // Step 2: Get dashboard
  group('02 - Dashboard', () => {
    const res = http.get(`${BASE_URL}/api/v1/command/dashboard`, opts)

    const success = check(res, {
      'dashboard status 200': (r) => r.status === 200,
    })

    errorRate.add(!success)
  })

  randomSleep()

  // Step 3: List problems
  let problemId = null
  group('03 - List problems', () => {
    const res = http.get(`${BASE_URL}/api/v1/problems?page=1&per_page=10`, opts)

    const success = check(res, {
      'problems list status 200': (r) => r.status === 200,
    })

    if (success) {
      try {
        const body = JSON.parse(res.body)
        const items = body.items || body.data || body
        if (Array.isArray(items) && items.length > 0) {
          problemId = items[0].id
        }
      } catch {
        // no problem id available
      }
    }

    errorRate.add(!success)
  })

  randomSleep()

  // Step 4: View a single problem (if we got an id)
  if (problemId) {
    group('04 - View problem', () => {
      const res = http.get(`${BASE_URL}/api/v1/problems/${problemId}`, opts)

      const success = check(res, {
        'problem detail status 200': (r) => r.status === 200,
      })

      errorRate.add(!success)
    })

    randomSleep()
  }

  // Step 5: Create an offer
  group('05 - Create offer', () => {
    const payload = JSON.stringify({
      problem_id: problemId || 'test-problem',
      prompt: 'Generate a member engagement offer',
    })

    const res = http.post(`${BASE_URL}/api/v1/offers/generate`, payload, opts)

    const success = check(res, {
      'offer create status 200 or 201': (r) => r.status === 200 || r.status === 201,
    })

    errorRate.add(!success)
  })

  randomSleep()

  // Step 6: List playbooks
  group('06 - List playbooks', () => {
    const res = http.get(`${BASE_URL}/api/v1/playbooks`, opts)

    const success = check(res, {
      'playbooks list status 200': (r) => r.status === 200,
    })

    errorRate.add(!success)
  })

  randomSleep()

  // Step 7: Check billing
  group('07 - Check billing', () => {
    const res = http.get(`${BASE_URL}/api/v1/billing`, opts)

    const success = check(res, {
      'billing status 200': (r) => r.status === 200,
    })

    errorRate.add(!success)
  })

  randomSleep()
}
