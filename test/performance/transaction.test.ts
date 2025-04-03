import http from 'k6/http';
import { sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';
import generateUniqueWallet from '../wallet-generator.js';

const responseTimeTrend = new Trend('response_time');
const errorRate = new Rate('errors');

export const options = {
  scenarios: {
    constant_request_rate: {
      executor: 'constant-arrival-rate',
      rate: 5,
      timeUnit: '10s',
      duration: '20s',
      preAllocatedVUs: 10,
      maxVUs: 20,
    },
  },
};

export default function () {
  const wallet = generateUniqueWallet();
  const body = {
    walletAddress: wallet,
  };

  const res = http.post('http://localhost:1000/api/drip', JSON.stringify(body), {
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
  });

  if (res.status !== 200) {
    console.log(res);
    console.error(
      `❌ Error: Received ${res.status} for wallet: ${body.walletAddress} | Error cause: ${res.body}`,
    );
    errorRate.add(1);
  } else {
    errorRate.add(0);
  }

  const responseTimeInSeconds = res.timings.duration / 1000;

  console.log(
    `Wallet Address: ${wallet} | Response Time: ${responseTimeInSeconds}s`,
  );

  responseTimeTrend.add(responseTimeInSeconds);
  sleep(1);
}
