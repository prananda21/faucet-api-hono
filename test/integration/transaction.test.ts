import {
  expect,
  describe,
  beforeEach,
  it,
  beforeAll,
  afterAll,
} from 'bun:test';
import app from '../../src/index';
import type { Server } from 'bun';
import { TransactionRepository } from '../../src/database/repository/implementation';

let server: Server;
const transactionRepository: TransactionRepository =
  new TransactionRepository();

describe('POST "/api/drip"', () => {
  beforeAll(async () => {
    server = Bun.serve({
      fetch: app.fetch,
      port: 1000,
    });
  });

  beforeEach(async () => {
    /**
     * Do something here, like flush database
     */
    await transactionRepository.deleteAll();
  });

  afterAll(async () => {
    server.stop();
  });

  it('Success (200 OK)', async () => {
    const requestBody = {
      walletAddress: '0x10787E20701409E5629b2c65296efc718edB96Dc',
    };
    const response = await fetch('http://localhost:1000/api/drip', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.data).toEqual({
      walletAddress: expect.stringMatching(/^0x[a-fA-F0-9]{40}$/),
      transactionHash: expect.stringMatching(/^0x[a-fA-F0-9]{64}$/),
      tokenValue: '100 KPGT',
      onchainUrl: expect.any(String),
    });
    expect(data.message).toEqual('Transaction success, check you wallet for updated balance.')
  });
});
