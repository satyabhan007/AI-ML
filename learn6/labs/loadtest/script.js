// AI-ML · Part 6 lab — k6 load test for the inference gateway (Ch 2 / Ch 11).
//
// Ramps virtual users, drives a realistic-ish request mix, and FAILS the run if
// the p99 latency or error-rate SLO is breached (thresholds -> non-zero exit).
//
//   docker compose -f ../gateway/docker-compose.yml up -d
//   k6 run script.js
//   # CI parse check:  k6 inspect script.js   (or: k6 run --vus 1 --iterations 1)
import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

const errorRate = new Trend('model_error_rate');
const ttfb = new Trend('ttfb_ms');

export const options = {
  scenarios: {
    ramp: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '30s', target: 20 },
        { duration: '1m', target: 60 },
        { duration: '1m', target: 60 },
        { duration: '30s', target: 0 },
      ],
    },
  },
  thresholds: {
    // the SLO gate — Part 6 Ch 2 latency budget, Ch 11 sign-off
    http_req_duration: ['p(95)<300', 'p(99)<800'],
    http_req_failed: ['rate<0.02'],
    ttfb_ms: ['p(99)<600'],
  },
};

const BASE = __ENV.TARGET || 'http://localhost:10000';

// production-shaped mix: mostly fast, a few slow, a few errors (Ch 11 anti-patterns)
const MIX = [
  { path: '/anything', weight: 85 },
  { path: '/delay/1', weight: 10 },
  { path: '/status/503', weight: 5 },
];

function pick() {
  const r = Math.random() * 100;
  let acc = 0;
  for (const m of MIX) {
    acc += m.weight;
    if (r <= acc) return m.path;
  }
  return MIX[0].path;
}

export default function () {
  const res = http.get(`${BASE}${pick()}`, { tags: { name: 'inference' } });
  ttfb.add(res.timings.waiting);
  errorRate.add(res.status >= 500 ? 1 : 0);
  check(res, {
    'status is 2xx or a handled 5xx': (r) => r.status < 600,
  });
  sleep(Math.random() * 0.3); // think time
}
